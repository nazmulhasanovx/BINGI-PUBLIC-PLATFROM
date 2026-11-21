# Source for types.json — edit HERE, then `python3 gen-types.py` (keeps types.json readable and consistent).
import json
L=lambda bn,en:{"bn":bn,"en":en}
def f(name,type,req=False,**k): d={"name":name,"type":type}; d.update({"required":True} if req else {}); d.update(k); return d
STATUS=["live","beta","soon","confirm"]
verify=[f("verified_by","string",internal=True,help=L("কে যাচাই করেছে (Live হলে লাগবেই)","Who verified it (required for Live)")),
        f("verified_at","date",internal=True,help=L("কবে যাচাই","When verified"))]
permission=[f("permission_file","image",internal=True,help=L("লিখিত অনুমতির ছবি/PDF (দেখাতে হলে লাগবেই)","Written permission (required to show it)"))]
link=[f("to","string",True,help=L("পাথ (/pricing) বা পুরো URL","Path (/pricing) or full URL")),f("label","l",True)]
T=[
 dict(type="site",kind="single",key="site",module="M08",label=L("সাইট সেটিংস","Site settings"),fields=[
   f("company","string",True),f("parent","string",True),f("phone","string",True),f("phoneIntl","string",True),
   f("whatsapp","url",True),f("address","l",True),f("hmsLogin","url",True),f("hmsRegister","url",True),
   f("marketplace","url",True),f("facebook","url"),f("youtube","url"),
   f("announcement","l",help=L("উপরের ঘোষণা বার (খালি = লুকানো)","Announcement bar (empty = hidden)")),
   f("gaId","string",help=L("GA4 ID (দিলে consent banner চালু)","GA4 ID (turns on the consent banner)")),
   f("pixelId","string",help=L("Meta Pixel ID (দিলে consent banner চালু)","Meta Pixel ID (turns on the consent banner)"))]),
 dict(type="nav_item",kind="collection",key="nav",module="M07",label=L("হেডার মেনু","Header menu"),titleField="label",fields=link+[f("phoneOnly","bool")]),
 dict(type="footer_column",kind="collection",key="footer",module="M07",label=L("ফুটার কলাম","Footer columns"),titleField="title",fields=[
   f("title","l",True),f("links","list",True,fields=[f("to","string"),f("label","l",True),f("kind","enum",options=["link","whatsapp","demo"]),f("badge","l")])]),
 dict(type="page_copy",kind="collection",key="copy",module="M06",label=L("পেজের লেখা","Page copy"),titleField="key",shape="map",mapKey="key",mapValue="value",fields=[
   f("key","enum",True,options=["home.hero.line1","home.hero.line2","home.hero.mark","home.hero.lead","home.hero.cta","home.story.title","home.bento.title","home.platforms.title","home.types.title","home.faq.title","home.team.title"]),f("value","lt",True)]),
 dict(type="hidden_section",kind="collection",key="hiddenSections",module="M06",label=L("লুকানো সেকশন","Hidden sections"),titleField="key",shape="values",valueField="key",fields=[
   f("key","enum",True,options=["home.trust","home.story","home.bento","home.platforms","home.themes-ai","home.types","home.integrations","home.pricing","home.testimonials","home.faq","home.team"])]),
 dict(type="trust_fact",kind="collection",key="trustFacts",module="M06",label=L("ট্রাস্ট তথ্য","Trust facts"),titleField="label",guards=["source"],fields=[
   f("value","l",True,help=L("{liveModules} = চালু মডিউলের সংখ্যা","{liveModules} = number of live modules")),f("label","l",True),f("source","string",True,help=L("তথ্যটা কোথা থেকে","Where this fact comes from"))]),
 dict(type="module",kind="collection",key="modules",module="M09",label=L("মডিউল স্ট্যাটাস","Module status"),titleField="name",guards=["verified_live","ai_not_live"],fields=[
   f("id","string",True),f("status","enum",True,options=STATUS),f("icon","string",True,help=L("lucide আইকনের নাম","lucide icon name")),f("name","l",True),f("desc","l",True)]+verify),
 dict(type="platform_status",kind="single",key="platformStatus",module="M09",label=L("প্ল্যাটফর্ম স্ট্যাটাস","Platform status"),guards=["verified_live_single"],fields=[
   f("web","enum",True,options=STATUS),f("mobile","enum",True,options=STATUS),f("guest","enum",True,options=STATUS)]+verify),
 dict(type="integration",kind="collection",key="integrations",module="M09",label=L("পেমেন্ট ও হার্ডওয়্যার","Payments & hardware"),titleField="name",guards=["verified_live"],fields=[
   f("id","string",True),f("kind","enum",True,options=["pay","hw"]),f("status","enum",True,options=STATUS),f("name","l",True)]+verify),
 dict(type="pricing_config",kind="single",key="pricingConfig",module="M10",label=L("প্রাইসিং নিয়ম","Pricing rules"),spread=True,fields=[
   f("minBillable","number",True),f("launchOff","number",True),f("launchUntil","l",True),f("themePrice","number",True),
   f("cycles","list",True,fields=[f("id","enum",True,options=["monthly","six","yearly"]),f("months","number",True),f("discount","number",True),f("label","l",True)]),
   f("cycleRates","json",True,help=L("মাসিক রেট → প্রতি সাইকেলের রেট","Monthly rate → rate per cycle")),
   f("offers","llist")]),
 dict(type="plan",kind="collection",key="plans",module="M10",label=L("প্ল্যান","Plans"),titleField="name",fields=[
   f("id","enum",True,options=["starter","business","ultra","custom"]),f("name","string",True),f("rate","number",help=L("প্রতি রুম/মাস ৳ (খালি = কোটেশন)","৳ per room/month (empty = quotation)")),
   f("regular","number"),f("activation","json"),f("fees","json"),f("popular","bool"),f("tagline","l",True),f("plus","l")]),
 dict(type="property_type",kind="collection",key="propertyTypes",module="M10",label=L("প্রপার্টির ধরন","Property types"),titleField="name",fields=[
   f("id","enum",True,options=["home","guest","hotel","resort","group"]),f("name","l",True),f("plan","enum",True,options=["starter","business","ultra","custom"]),f("need","l",True)]),
 dict(type="compare_group",kind="collection",key="compare",module="M10",label=L("ফিচার তুলনা","Feature comparison"),titleField="name",fields=[f("name","l",True),f("rows","json",True)]),
 dict(type="theme",kind="collection",key="themes",module="M11",label=L("প্ল্যান থিম","Plan themes"),titleField="name",fields=[
   f("id","string",True),f("name","string",True),f("plan","enum",True,options=["starter","business","ultra"]),f("for","l",True),f("demo","string",True,help=L("ডেমো হোটেলের slug","Demo hotel slug"))]),
 dict(type="store_theme",kind="collection",key="storeThemes",module="M11",label=L("থিম স্টোর","Theme store"),titleField="name",fields=[
   f("id","string",True),f("name","string",True),f("collection","enum",True,options=["luxury","signature","more"]),f("for","l",True),f("demo","string",True)]),
 dict(type="team_member",kind="collection",key="team",module="M12",label=L("টিম","Team"),titleField="name",fields=[
   f("name","string",True),f("role","l",True),f("group","l",True),f("photo","image"),f("linkedin","url",help=L("ব্যক্তির নিজের পাবলিক প্রোফাইল","The person's own public profile"))]),
 dict(type="testimonial",kind="collection",key="testimonials",module="M13",label=L("টেস্টিমোনিয়াল","Testimonials"),titleField="name",guards=["permission"],fields=[
   f("quote","lt",True),f("name","string",True),f("role","l",True),f("property","string",True),f("photo","image")]+permission),
 dict(type="client_logo",kind="collection",key="clientLogos",module="M13",label=L("ক্লায়েন্ট লোগো","Client logos"),titleField="name",guards=["permission"],fields=[f("name","string",True),f("src","image",True)]+permission),
 dict(type="customer_story",kind="collection",key="stories",module="M23",label=L("কাস্টমার স্টোরি","Customer stories"),titleField="property",guards=["permission","result_sources","no_sample_visible"],fields=[
   f("slug","string",True,help=L("URL: /customers/<slug>","URL: /customers/<slug>")),f("property","string",True,help=L("হোটেলের আসল নাম","The hotel's real name")),
   f("location","l",True),f("propertyType","enum",True,options=["home","guest","hotel","resort","group"]),f("rooms","number"),
   f("plan","enum",options=["starter","business","ultra","custom"]),f("since","date",help=L("কবে থেকে BinGi ব্যবহার করছে","Using BinGi since")),
   f("headline","l",True,help=L("এক লাইনে মূল ফল","The main result in one line")),f("summary","lt",True),
   f("cover","object",fields=[f("src","image",True),f("alt","l",True)]),f("logo","image"),
   f("challenge","lt",True,help=L("BinGi-র আগে কী সমস্যা ছিল","What was hard before BinGi")),f("solution","lt",True,help=L("BinGi দিয়ে কী বদলাল","What changed with BinGi")),
   f("results","list",fields=[f("value","string",True,help=L("যেমন 40%","e.g. 40%")),f("label","l",True),f("source","string",True,help=L("সংখ্যাটা কোথা থেকে (হোটেলের রিপোর্ট, তারিখ)","Where the number comes from (hotel report, date)"))]),
   f("quote","object",fields=[f("text","lt"),f("name","string"),f("role","l")]),
   f("modules","strlist",help=L("ব্যবহার করা মডিউলের id, যেমন bookings, housekeeping","Module ids used, e.g. bookings, housekeeping")),
   f("body","blocks",help=L("পুরো গল্প (ঐচ্ছিক)","Full story (optional)")),
   f("sample","bool",internal=True,help=L("নমুনা গল্প — কখনো সাইটে দেখানো যাবে না। আসল গল্প দিয়ে বদলে এটা বন্ধ করুন।","Sample story — can never be shown. Replace with a real story, then switch this off."))]+permission),
 dict(type="blog_post",kind="collection",key="posts",module="M14",label=L("ব্লগ","Blog"),titleField="title",fields=[
   f("slug","string",True),f("date","date",True),f("tag","l",True),f("title","l",True),f("summary","lt",True),
   f("cover","object",True,fields=[f("src","image",True),f("alt","l",True)]),f("body","blocks",True)]),
 dict(type="help_category",kind="collection",key="categories",module="M15",label=L("হেল্প ক্যাটাগরি","Help categories"),titleField="name",fields=[f("id","string",True),f("icon","string",True),f("name","l",True)]),
 dict(type="help_article",kind="collection",key="articles",module="M15",label=L("হেল্প আর্টিকেল","Help articles"),titleField="title",fields=[
   f("slug","string",True),f("category","string",True),f("title","l",True),f("summary","lt",True),f("steps","llist",True),f("draft","bool")]),
 dict(type="whats_new",kind="collection",key="whatsNew",module="M15",label=L("হেল্পে নতুন কী","What's new (help)"),titleField="title",fields=[f("date","l",True),f("title","l",True)]),
 dict(type="doc_page",kind="collection",key="docs",module="M15",label=L("ডকস পেজ","Docs pages"),titleField="title",fields=[
   f("slug","string",True),f("group","enum",True,options=["Start here","Platform","Modules","Account","Help"]),f("title","string",True),f("summary","text",True),
   f("where","string"),f("plan","string"),f("status","enum",options=["Live","Beta","Coming soon","Rolling out"]),f("sections","json",True),f("fixes","json")]),
 dict(type="faq",kind="collection",key="faqs",module="M16",label=L("FAQ","FAQ"),titleField="q",fields=[f("page","enum",True,options=["home","pricing","marketplace"]),f("q","l",True),f("a","lt",True)]),
 dict(type="changelog",kind="collection",key="changes",module="M17",label=L("চেঞ্জলগ","Changelog"),titleField="title",fields=[
   f("month","l",True),f("status","enum",True,options=["live","testing","soon"]),f("title","l",True),f("items","llist",True)]),
 dict(type="career_team",kind="collection",key="roles",module="M18",label=L("ক্যারিয়ার","Careers"),titleField="team",fields=[f("team","l",True),f("titles","llist",True)]),
 dict(type="solution",kind="collection",key="solutions",module="M06",label=L("সলিউশন পেজ","Solution pages"),titleField="title",fields=[
   f("slug","string",True),f("type","enum",True,options=["home","guest","hotel","resort","group"]),f("title","l",True),f("intro","lt",True),f("runs","llist",True),f("modules","strlist",True),f("themes","strlist",True)]),
]
json.dump({"version":1,"fieldTypes":["string","text","l","lt","number","bool","enum","url","image","date","llist","strlist","list","object","blocks","json"],"types":T},open("types.json","w"),ensure_ascii=False,indent=1)
print(len(T),"types")

# ---- docs/05-admin/CONTENT_TYPES.md (generated — do not edit by hand)
out=["# Content types (generated from packages/content/types.json — edit gen-types.py, then run it)","",
"Field types: `string` one line · `text` multi-line · `l` bilingual line {bn,en} · `lt` bilingual multi-line · `number` · `bool` · `enum` (fixed options) · `url` · `image` (media library path) · `date` YYYY-MM-DD · `llist` list of `l` · `strlist` list of strings · `list` list of objects · `object` · `blocks` blog body (heading / paragraph / list) · `json` raw JSON.","",
"`internal` fields stay in the admin and are never published. Guards: `verified_live` (Live needs verified_by + verified_at) · `ai_not_live` (BinGi AI cannot be Live) · `permission` (visible needs permission_file) · `source` (needs a source) · `result_sources` (every result number needs a source) · `no_sample_visible` (a sample can never be shown).","",
"| Type | Kind | Snapshot key | Module | Name | Guards |","|---|---|---|---|---|---|"]
for t in T: out.append(f"| `{t['type']}` | {t['kind']} | `{t['key']}` | {t['module']} | {t['label']['en']} | {', '.join(t.get('guards',[])) or '—'} |")
for t in T:
    out+=["",f"## `{t['type']}` — {t['label']['en']}","","| Field | Type | Required | Notes |","|---|---|---|---|"]
    for x in t['fields']:
        note=[]
        if x.get('options'): note.append('options: '+', '.join(x['options']))
        if x.get('fields'): note.append('fields: '+', '.join(y['name'] for y in x['fields']))
        if x.get('internal'): note.append('internal')
        if x.get('help'): note.append(x['help']['en'])
        out.append(f"| `{x['name']}` | {x['type']} | {'yes' if x.get('required') else ''} | {' · '.join(note)} |")
open("../../docs/05-admin/CONTENT_TYPES.md","w").write("\n".join(out)+"\n")
print("CONTENT_TYPES.md written")
