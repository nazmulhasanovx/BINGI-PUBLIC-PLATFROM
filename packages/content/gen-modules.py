# Admin modules and the default roles — edit HERE, then `python3 gen-modules.py` → modules.json
# Read by the API (permission checks) and the admin (sidebar, roles screen).
import json
L=lambda bn,en:{"bn":bn,"en":en}
VE=["view","edit"]; V=["view"]
M=[
 ("M02",L("ড্যাশবোর্ড","Dashboard"),V,L("সাইটের আজকের অবস্থা","Today on the site")),
 ("M03",L("লিড","Leads"),VE,L("দেখা = তালিকা ও ফোন · এডিট = স্ট্যাটাস, নোট, CSV","View = list and phones · Edit = status, notes, CSV")),
 ("M04",L("ভিজিটর","Visitors"),V,L("ভিজিটরের হিসাব","Visitor numbers")),
 ("M05",L("SEO","SEO"),VE,L("পেজের title, description, redirect","Page titles, descriptions, redirects")),
 ("M06",L("পেজ ও সেকশন","Pages & sections"),VE,None),
 ("M07",L("মেনু ও ফুটার","Navigation & footer"),VE,None),
 ("M08",L("সাইট সেটিংস","Site settings"),VE,L("ফোন, WhatsApp, GA/Pixel ID","Phone, WhatsApp, GA/Pixel IDs")),
 ("M09",L("স্ট্যাটাস","Status registry"),VE,L("Live / Beta / Coming Soon","Live / Beta / Coming Soon")),
 ("M10",L("প্রাইসিং","Pricing"),VE,None),
 ("M11",L("থিম","Themes"),VE,None),
 ("M12",L("টিম","Team"),VE,None),
 ("M13",L("টেস্টিমোনিয়াল ও লোগো","Testimonials & logos"),VE,None),
 ("M23",L("কাস্টমার স্টোরি","Customer stories"),VE,None),
 ("M14",L("ব্লগ","Blog"),VE,None),
 ("M15",L("হেল্প ও ডকস","Help & Docs"),VE,None),
 ("M16",L("FAQ","FAQ"),VE,None),
 ("M17",L("চেঞ্জলগ","Changelog"),VE,None),
 ("M18",L("ক্যারিয়ার","Careers"),VE,None),
 ("M19",L("মিডিয়া","Media library"),VE,L("এডিট = আপলোড ও মুছা","Edit = upload and delete")),
 ("M20",L("পাবলিশ ও হিস্টরি","Publish & history"),VE,L("দেখা = বাকি বদল ও হিস্টরি · এডিট = পাবলিশ ও আগের ভার্সনে ফেরা","View = pending and history · Edit = publish and roll back")),
 ("M21",L("ইউজার ও রোল","Users & roles"),VE,L("এডিট = ইউজার ইনভাইট, রোল বানানো","Edit = invite users, build roles")),
 ("M22",L("অডিট লগ","Audit log"),V,None),
]
modules=[{"id":i,"label":l,"levels":lv,**({"hint":h} if h else {})} for i,l,lv,h in M]
content=[i for i,*_ in M if i in ("M06","M11","M12","M13","M23","M14","M15","M16","M17","M18","M19")]
roles=[
 {"key":"owner","name":L("ওনার","Owner"),"system":True,"permissions":{i:lv[-1] for i,_,lv,_h in M}},
 {"key":"editor","name":L("এডিটর","Editor"),"system":False,"permissions":{"M02":"view","M05":"edit","M20":"view",**{i:"edit" for i in content}}},
 {"key":"sales","name":L("সেলস","Sales"),"system":False,"permissions":{"M02":"view","M03":"edit","M04":"view"}},
]
json.dump({"modules":modules,"defaultRoles":roles},open("modules.json","w"),ensure_ascii=False,indent=1)
print(len(modules),"modules,",len(roles),"default roles")
