"""End-to-end check of roles & permissions (run after flow.py, same setup).
Owner builds a "Blog writer" role in the matrix, invites a user with it; that user sees only
Dashboard + SEO (view) + Blog (edit) in the sidebar and is blocked everywhere else.
Run:  OWNER_PASSWORD=... python3 admin/e2e/roles.py   (needs `php` + the api folder for setting the test password)
"""
import asyncio, os, subprocess
from playwright.async_api import async_playwright

ADMIN = os.environ.get('ADMIN', 'http://localhost:5174')
PW = os.environ['OWNER_PASSWORD']
API_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'api')
ok = []
def check(cond, what):
    ok.append((bool(cond), what)); print(('PASS ' if cond else 'FAIL ') + what)

async def login(pg, email, pw):
    await pg.goto(ADMIN + '/login'); await pg.fill('#email', email); await pg.fill('#password', pw)
    await pg.click('button[type=submit]'); await pg.wait_for_url(ADMIN + '/')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1440, 'height': 900})
        errors = []; pg.on('pageerror', lambda e: errors.append(str(e)))
        await login(pg, 'owner@bingi.local', PW)
        await pg.click('text=EN'); await pg.wait_for_timeout(300)

        # owner builds a role in the matrix
        await pg.goto(ADMIN + '/users'); await pg.click('[role=tab]:has-text("Roles")'); await pg.wait_for_timeout(500)
        check(await pg.locator('text=Built-in').count() == 1, 'owner role is marked built-in')
        await pg.click('button:has-text("New role")'); await pg.wait_for_timeout(400)
        await pg.fill('#r-bn', 'ব্লগ লেখক'); await pg.fill('#r-en', 'Blog writer')
        await pg.click('[data-module=M14] >> text=Edit'); await pg.click('[data-module=M05] >> text=View')
        await pg.click('button:has-text("Save")'); await pg.wait_for_timeout(700)
        check(await pg.locator('text=Blog writer').count() > 0, 'new role "Blog writer" is listed')

        # invite a user with that role
        await pg.click('[role=tab]:has-text("Users")'); await pg.wait_for_timeout(400)
        await pg.click('button:has-text("Invite")'); await pg.fill('#u-name', 'Writer Test'); await pg.fill('#u-email', 'writer@bingi.local')
        await pg.select_option('#u-role', 'blog_writer'); await pg.click('button:has-text("Send invite")'); await pg.wait_for_timeout(800)
        check(await pg.locator('text=writer@bingi.local').count() == 1, 'user invited with the new role')
        subprocess.run(['php', 'artisan', 'tinker', '--execute', "App\\Models\\User::where('email','writer@bingi.local')->first()->forceFill(['password'=>bcrypt('writer-pass-1')])->save();"], cwd=API_DIR, check=True, capture_output=True)

        # the writer's view
        await pg.click('button[aria-expanded]'); await pg.click('button:has-text("Sign out")'); await pg.wait_for_timeout(500)
        await login(pg, 'writer@bingi.local', 'writer-pass-1'); await pg.wait_for_timeout(600)
        nav = [x.strip() for x in await pg.locator('nav a').all_inner_texts()]
        check(set(nav) == {'Dashboard', 'SEO', 'Blog'}, f'sidebar shows only allowed modules {nav}')
        check(await pg.locator('text=New leads').count() == 0, 'dashboard hides lead numbers')
        await pg.goto(ADMIN + '/content/blog'); await pg.wait_for_timeout(800)
        check(await pg.locator('button:has-text("Add new")').count() == 1, 'blog: can add (edit)')
        await pg.goto(ADMIN + '/seo'); await pg.wait_for_timeout(800)
        check(await pg.locator('button:has-text("Add page")').count() == 0, 'SEO: view only, no add button')
        await pg.goto(ADMIN + '/leads'); await pg.wait_for_timeout(600)
        check(await pg.locator("text=Your role cannot open this page").count() + await pg.locator('text=permission').count() > 0, 'leads page is blocked')
        await pg.goto(ADMIN + '/content/faq'); await pg.wait_for_timeout(600)
        check(await pg.locator('button:has-text("Add new")').count() == 0, 'FAQ page is blocked')
        check(not errors, f'no page errors ({errors})')
        await b.close()
    n = sum(c for c, _ in ok); print(f'\n{n}/{len(ok)} passed'); raise SystemExit(0 if n == len(ok) else 1)

asyncio.run(main())
