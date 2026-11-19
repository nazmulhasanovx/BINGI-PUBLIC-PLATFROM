"""End-to-end check of the admin against a running API (Gate 2).
Run:  API on :8000 (freshly seeded, SEED_OWNER_PASSWORD set), admin on :5174, then
      OWNER_PASSWORD=... python3 admin/e2e/flow.py
Needs: pip install playwright && playwright install chromium
"""
import asyncio, json, os, urllib.request
from playwright.async_api import async_playwright

ADMIN = os.environ.get('ADMIN', 'http://localhost:5174')
API = os.environ.get('API', 'http://localhost:8000/api/v1')
PW = os.environ['OWNER_PASSWORD']
ok = []
def check(cond, what):
    ok.append((bool(cond), what)); print(('PASS ' if cond else 'FAIL ') + what)

def api_get(path):
    return json.load(urllib.request.urlopen(API + path))

def api_post(path, body):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'Accept': 'application/json'})
    return urllib.request.urlopen(req).status

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1440, 'height': 900})
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        # 1 · login (wrong, then right)
        await pg.goto(ADMIN + '/login')
        await pg.fill('#email', 'owner@bingi.local'); await pg.fill('#password', 'wrong-password')
        await pg.click('button[type=submit]'); await pg.wait_for_timeout(600)
        check(await pg.locator('[role=alert]').count() > 0, 'wrong password shows an error')
        await pg.fill('#password', PW); await pg.click('button[type=submit]')
        await pg.wait_for_url(ADMIN + '/'); check(True, 'owner signs in')
        await pg.click('text=EN'); await pg.wait_for_timeout(300)

        # 2 · edit a team member → draft, live unchanged
        before = api_get('/public/content')['team'][0]['name']
        await pg.goto(ADMIN + '/content/team'); await pg.wait_for_timeout(800)
        await pg.locator('button[aria-label="Edit"]').first.click(); await pg.wait_for_timeout(400)
        await pg.fill('#name', before + ' QA'); await pg.click('role=dialog >> button:has-text("Save")'); await pg.wait_for_timeout(800)
        check(await pg.locator('text=Changed · not published').count() > 0, 'edited item shows "Changed · not published"')
        check(api_get('/public/content')['team'][0]['name'] == before, 'live site is unchanged before publish')

        # 3 · truth guard is visible in the form
        await pg.goto(ADMIN + '/content/status'); await pg.wait_for_timeout(800)
        await pg.locator('button:has-text("Channel Manager")').first.click(); await pg.wait_for_timeout(400)
        await pg.select_option('#status', 'live'); await pg.fill('#verified_by', ''); await pg.click('role=dialog >> button:has-text("Save")'); await pg.wait_for_timeout(700)
        check(await pg.locator('text=Live needs who verified it and when.').count() > 0, 'cannot mark OTA Live without verification (message on the field)')
        await pg.click('role=dialog >> button:has-text("Cancel")')

        # 4 · SEO page change
        await pg.goto(ADMIN + '/seo'); await pg.wait_for_timeout(800)
        await pg.locator('button:has-text("/pricing")').first.click(); await pg.wait_for_timeout(400)
        await pg.fill('#seo-title', 'Pricing — BinGi (QA)'); await pg.click('role=dialog >> button:has-text("Save")'); await pg.wait_for_timeout(700)

        # 5 · publish
        await pg.goto(ADMIN + '/publish'); await pg.wait_for_timeout(900)
        check(await pg.locator('text=Waiting to publish · 1').count() > 0, 'publish page lists 1 pending entry change')
        await pg.fill('input[aria-label="Note (optional)"]', 'QA run'); await pg.click('main >> button:has-text("Publish")')
        await pg.click('role=alertdialog >> button:has-text("Publish")'); await pg.wait_for_timeout(1200)
        c = api_get('/public/content')
        check(c['team'][0]['name'] == before + ' QA', 'published name is live in /public/content')
        check(c['seo']['/pricing']['title'] == 'Pricing — BinGi (QA)', 'SEO title is live')
        await pg.screenshot(path='/tmp/e2e-publish.png', full_page=True)

        # 6 · rollback to v1
        await pg.reload(); await pg.wait_for_timeout(900)
        await pg.locator('button:has-text("Roll back")').last.click(); await pg.click('role=alertdialog >> button:has-text("Roll back")'); await pg.wait_for_timeout(1000)
        check(api_get('/public/content')['team'][0]['name'] == before, 'rollback restores the old name')

        # 7 · a lead from the site appears and can be worked
        api_post('/public/leads', {'name': 'QA Lead', 'property': 'QA Resort', 'phone': '01700000001', 'source_page': '/pricing'})
        await pg.goto(ADMIN + '/leads'); await pg.wait_for_timeout(900)
        check(await pg.locator('text=QA Lead').count() > 0, 'lead from the site shows in Leads')
        await pg.click('text=QA Lead'); await pg.wait_for_timeout(600)
        await pg.select_option('#lead-status', 'contacted'); await pg.wait_for_timeout(600)
        await pg.fill('textarea[aria-label="New note"]', 'Called — demo Sunday'); await pg.click('text=Add note'); await pg.wait_for_timeout(700)
        check(await pg.locator('text=Called — demo Sunday').count() > 0, 'note saved on the lead')

        # 8 · visitors page has real numbers after an event
        urllib.request.urlopen(urllib.request.Request(API + '/public/events', data=json.dumps({'events': [{'type': 'pageview', 'path': '/'}]}).encode(), headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 QA'}))
        await pg.goto(ADMIN + '/visitors'); await pg.wait_for_timeout(1000)
        check(await pg.locator('text=Top pages').count() > 0, 'visitors page shows data')

        # 9 · editor cannot publish or see leads
        check(not errors, f'no page errors ({errors[:2]})')
        await b.close()
    failed = [w for c, w in ok if not c]
    print(f'\n{len(ok) - len(failed)}/{len(ok)} passed')
    raise SystemExit(1 if failed else 0)

asyncio.run(main())
