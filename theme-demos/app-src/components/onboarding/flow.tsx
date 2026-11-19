"use client";
// Onboarding v7 "easy" — 6 parts, one question per screen, picture answers, live preview, Bangla first.
// Part 2 follows the live HMS room-add flow: presets only, one room type after another.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  BedDouble, Bike, CalendarDays, Boxes, Brush, Building, Building2, Car, Castle, Check, CircleAlert, Coffee, Dumbbell, FileUp, Home, House, Landmark, MapPin,
  PartyPopper, Plus, Shirt, Sparkles, Tent, TreePalm, UsersRound, Utensils, Wallet, Waves, Wine, Bus, BookOpen, Banknote, Smartphone, Lock,
  CircleCheck, Clock, FileText, IdCard, Receipt, Scale, ShieldCheck, Globe, CalendarCheck, ImageIcon,
} from "lucide-react";
import {
  CYCLE_OFF, EXTRAS, MIN_BILLED, MODULE_PLAN, ORDER, PLANS, STAFF, TRIAL_DAYS, checks, hotelOf, nowIso, stepOf, num, planRank, quote, recommend, score, useL, useOnboarding, validPhone,
  type Cycle, type Draft, type PlanId, type StepId,
} from "@/lib/onboarding/store";
import { SUGGEST, configFrom } from "@/lib/onboarding/rooms-easy";
import { useRooms } from "@/lib/rooms/store";
import { MASTER_LIST, PLAN_ORDER } from "@/themes/manifest";
import { setProperty } from "../hms/property";
import { money } from "../hms/rooms/parts";
import { MobileSteps, Sidebar } from "./sidebar";
import { GuestPreview } from "./preview";
import { AddressSheet } from "./address";
import { FormSlot, RoomsWhat, RoomsWhere, RoomTypes } from "./rooms-easy";
import { Canvas, Card, Chip, Errors, Foot, Ghost, Header, Later, Next, Primary, Q, Stepper, Tile, field, label } from "./shell";

const noop = () => () => {};
import { TYPE_META as TYPES } from "./types";
export { TYPES };
const EXTRA_ICON: Record<string, typeof Utensils> = { Restaurant: Utensils, Bar: Wine, "Café": Coffee, Pool: Waves, Spa: Sparkles, "Event hall": PartyPopper, "Airport transfer": Bus, Tours: Bike, Laundry: Shirt, Gym: Dumbbell };
const EXTRA_BN: Record<string, string> = { Restaurant: "রেস্টুরেন্ট", Bar: "বার", "Café": "ক্যাফে", Pool: "সুইমিং পুল", Spa: "স্পা", "Event hall": "ইভেন্ট হল", "Airport transfer": "পিকআপ", Tours: "ট্যুর", Laundry: "লন্ড্রি", Gym: "জিম" };

export function OnboardingFlow() {
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const { draft } = useOnboarding();
  const { t } = useL();
  if (!ready) return <Canvas><Header /><p className="p-8 text-[15px] text-[#4d5664]" role="status">{t("লোড হচ্ছে…", "Loading…")}</p></Canvas>;
  if (!draft) return <Canvas><Header /><div className="p-8"><p className="text-[17px] font-semibold">{t("কোনো property বাছাই করা নেই।", "No property selected.")}</p><Link className="mt-3 inline-block font-semibold text-[#b11c29]" href="/onboarding">{t("আমার property", "My properties")}</Link></div></Canvas>;
  return <Flow key={draft.id} d={draft} />;
}

function Flow({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t, lang } = useL();
  const router = useRouter();
  const h = hotelOf(d);
  const rooms = useRooms(h);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const live = rooms.st.units.filter((u) => u.status !== "archived");
  const counts = { total: live.length, published: 0, categories: rooms.st.categories.filter((c) => !c.archived).length };

  const go = (s: StepId) => { setTried(false); edit((x) => { x.step = s; if (!x.seen.includes(s)) x.seen.push(s); }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const i = ORDER.indexOf(stepOf(d.step));
  useEffect(() => { if (stepOf(d.step) !== d.step) edit((x) => { x.step = stepOf(x.step); }); }, [d.step, edit]);
  const next = () => go(ORDER[Math.min(ORDER.length - 1, i + 1)]);
  const back = i > 0 ? () => go(ORDER[i - 1]) : () => router.push("/onboarding");
  const errs = errorsFor(d, counts.total, t);
  const firstTheme = themesFor(d)[0]?.id;
  const cs = checks(d, counts);
  const pct = score(cs);
  const cont = () => {
    if (errs.length) { setTried(true); return; }
    if (d.step === "2.2") rooms.update((s) => { s.config = configFrom(d, s.config); }, "Accommodation set up from onboarding presets");
    // the "Best fit" plan counts as chosen unless the owner picks another (one tap less)
    if (d.step === "6.1" && !d.planPicked) edit((x) => { x.plan = recommend(x); x.planPicked = true; });
    // the owner saw the price rules on this page — count them as checked (defaults are fine)
    if (d.step === "3.1" && !d.rates.done) edit((x) => { x.rates.done = true; });
    // no look picked and not "later": keep the best fit that is shown first
    if (d.step === "5.2" && !d.site.theme && !d.site.later && firstTheme) edit((x) => { x.site.theme = firstTheme; });
    next();
  };
  const submit = () => {
    if (checks(d, counts).some((c) => c.level === "required" && !c.ok)) { setTried(true); return; }
    edit((x) => { x.status = "pending"; x.submitted = nowIso(); x.units = counts.total; });
    setProperty(d.slug);
    setDone(true);
  };

  if (done) return <Done d={d} />;

  const body: Record<StepId, ReactNode> = {
    "1.1": <PropertyType d={d} />, "1.2": <Name d={d} />, "1.3": <Address d={d} />, "1.4": <Extras d={d} />,
    "2.1": <RoomsWhat d={d} />, "2.2": <RoomsWhere d={d} st={rooms.st} />, "2.3": <RoomTypes d={d} rooms={rooms} />,
    "3.1": <BookingRules d={d} />,
    "4.1": <Modules d={d} />, "4.2": <Team d={d} />,
    "5.1": <Payments d={d} />, "5.2": <Website d={d} />,
    "6.1": <Plan d={d} units={counts.total} />, "6.2": <Verify d={d} />, "6.3": <Ready d={d} counts={counts} go={go} />,
  };
  const later: Partial<Record<StepId, () => void>> = {
    "1.4": next, "4.2": () => { edit((x) => { x.teamLater = true; }); next(); }, "5.2": () => { edit((x) => { x.site.later = true; }); next(); }, "6.2": () => { edit((x) => { x.verify.later = true; }); next(); },
  };
  const required = checks(d, counts).filter((c) => c.level === "required" && !c.ok).map((c) => `${t(c.bn, c.label)} ${t("এখনো বাকি।", "is still missing.")}`);

  return (
    <FormSlot.Provider value={{ slot, setOpen: setFormOpen }}>
    <Canvas>
      <Header title={d.name || t("নতুন property", "New property")} right={<Link href="/onboarding" aria-label={t("সেভ করে বের হন", "Save & exit")} className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-white px-3.5 text-[14px] font-semibold ring-1 ring-[#e3e7ec]"><span className="sm:hidden">{t("বের হন", "Exit")}</span><span className="hidden sm:inline">{t("সেভ করে বের হন", "Save & exit")}</span></Link>} />
      <Card sidebar={<Sidebar d={d} cs={cs} pct={pct} go={go} />} mobileNav={<MobileSteps d={d} cs={cs} pct={pct} go={go} />} progress={pct}
        wide={d.step === "6.1"}
        aside={d.step === "6.1" || d.step === "6.3" ? undefined : <GuestPreview d={d} cats={rooms.st.categories.filter((c) => !c.archived)} units={counts.total} />}
        footer={<>
          <div ref={setSlot} hidden={!formOpen} />
          {!formOpen && <Foot back={back}>
            {later[d.step] && <Later onClick={later[d.step]} />}
            {d.step === "6.3" ? <Primary onClick={submit}>{t("জমা দিন", "Submit")} <Check className="size-[18px]" /></Primary> : <Next onClick={cont} />}
          </Foot>}
        </>}>
        <div>
          {tried && <Errors list={d.step === "6.3" ? required : errs} />}
          <div key={d.step + lang} className="onb-in">{body[stepOf(d.step)]}</div>
        </div>
      </Card>
    </Canvas>
    </FormSlot.Provider>
  );
}

function errorsFor(d: Draft, units: number, t: (bn: string, en: string) => string): string[] {
  const e: string[] = [];
  if (d.step === "1.1" && !d.propertyType) e.push(t("একটা ধরন বাছাই করুন।", "Choose a property type."));
  if (d.step === "1.2" && !d.name.trim()) e.push(t("Property-র নাম লিখুন।", "Enter the property name."));
  if (d.step === "1.3" && !(d.road.trim() && d.city.trim())) e.push(t("ঠিকানা দিন — রাস্তা/এলাকা আর শহর।", "Add the address — road/area and city."));
  if (d.step === "2.1" && !d.stay.length) e.push(t("কমপক্ষে একটা বাছাই করুন।", "Choose at least one."));
  if (d.step === "2.2") {
    const floor = d.stay.some((s) => s === "ROOM" || s === "APARTMENT");
    const zone = d.stay.some((s) => s === "COTTAGE" || s === "VILLA" || s === "OTHER");
    if (floor && !d.floors.length) e.push(t("কয় তলা আছে বাছাই করুন।", "Choose the floors."));
    if (zone && !d.zones.length) e.push(t("কটেজ/ভিলা কোন জায়গায় আছে বাছাই করুন।", "Choose where the cottages/villas are."));
  }
  if (d.step === "2.3" && !units) e.push(t("কমপক্ষে একটা রুমের ধরন যোগ করুন।", "Add at least one room type."));
  if (d.step === "3.1" && !d.policy.preset) e.push(t("বাতিলের একটা নিয়ম বাছাই করুন।", "Choose a cancellation rule."));
  if (d.step === "4.2" && d.team.some((x) => !validPhone(x.phone))) e.push(t("প্রত্যেকের সঠিক মোবাইল নম্বর দিন।", "Each invite needs a valid mobile number."));
  if (d.step === "5.1") {
    const p = d.pay;
    if (!p.cash) e.push(t("নগদ টাকা নেওয়া চালু রাখতে হবে।", "Pay at property must stay on."));
    if (p.bkash && !validPhone(p.bkashNo ?? "")) e.push(t("সঠিক bKash নম্বর দিন।", "Enter a valid bKash number."));
    if (p.nagad && !validPhone(p.nagadNo ?? "")) e.push(t("সঠিক Nagad নম্বর দিন।", "Enter a valid Nagad number."));
    if (p.bank && !(p.bankName && p.bankHolder?.trim() && /^\d{9,17}$/.test(p.bankAcc ?? ""))) e.push(t("ব্যাংক, অ্যাকাউন্টের নাম আর সঠিক অ্যাকাউন্ট নম্বর দিন।", "Add the bank, account name and a valid account number."));
    if (!p.bingi) e.push(t("BinGi Payments — এখন আবেদন নাকি পরে, বাছাই করুন।", "BinGi Payments — choose apply now or later."));
    if (p.bingi === "apply") {
      const s = p.settle;
      if (!s || (s.method === "bank" ? !(s.holder.trim() && s.bank && /^\d{9,17}$/.test(s.acc) && /^\d{9}$/.test(s.routing)) : !(s.holder.trim() && validPhone(s.wallet))))
        e.push(t("সেটেলমেন্ট অ্যাকাউন্টের সব তথ্য দিন (রাউটিং ৯ সংখ্যা)।", "Complete the settlement account (routing is 9 digits)."));
    }
  }
  return e;
}

// ---------------- Part 1 ----------------
function PropertyType({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  const [more, setMore] = useState(!TYPES.find((x) => x.slug === d.propertyType)?.main && !!d.propertyType);
  // Presets: the type pre-fills what you rent, floors and zones (owner only confirms later).
  const FLOORS: Record<string, number> = { hotel: 4, resort: 2, "guest-house": 2, homestay: 1, "serviced-apartment": 8, motel: 1, hostel: 2, "vacation-rental": 1, lodge: 1, other: 2 };
  const pick = (slug: string) => edit((x) => {
    x.propertyType = slug;
    if (x.seen.length <= 2) {
      x.stay = [...(SUGGEST[slug] ?? ["ROOM"])];
      x.buildings = ["main"];
      x.floors = Array.from({ length: FLOORS[slug] ?? 2 }, (_, i) => i + 1);
      x.zones = x.stay.some((s) => s === "COTTAGE" || s === "VILLA" || s === "OTHER") ? ["garden"] : [];
    }
  });
  const list = TYPES.filter((x) => x.main || more);
  return (
    <Q title={t("আপনি কী ধরনের property চালান?", "What kind of property do you run?")} why={t("ধরন দেখে আমরা রুম, ওয়েবসাইট আর প্ল্যান আগে থেকে সাজিয়ে দিই। পরে বদলানো যায়।", "We pre-fill rooms, website and plan from this. You can change it later.")}>
      <div role="radiogroup" aria-label={t("Property-র ধরন", "Property type")} className="grid gap-3 sm:grid-cols-2">
        {list.map((p) => <Tile key={p.slug} big role="radio" on={d.propertyType === p.slug} onClick={() => pick(p.slug)} icon={<p.icon className="size-6" />} title={t(p.bn, p.en)} sub={t(p.subBn, p.subEn)} />)}
      </div>
      {!more && <button onClick={() => setMore(true)} className="mt-3 block text-[15px] font-semibold text-[#b11c29]">+ {t("আরও ধরন দেখুন", "More types")}</button>}
      <p className="mt-5 flex w-fit items-center gap-1.5 rounded-full bg-[#e9edf2] px-3 py-1.5 text-[13.5px] text-[#4d5664]"><MapPin className="size-4" aria-hidden /> {t("বাংলাদেশ · টাকা (৳)", "Bangladesh · Taka (৳)")}</p>
    </Q>
  );
}

function Name({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  return (
    <Q title={t("আপনার property-র নাম কী?", "What is your property called?")} why={t("গেস্টরা এই নাম ওয়েবসাইট আর বুকিং কনফার্মেশনে দেখবে।", "Guests see this on your website and confirmations.")}>
      <label htmlFor="pname" className="sr-only">{t("Property-র নাম", "Property name")}</label>
      <input id="pname" value={d.name} onChange={(e) => edit((x) => { x.name = e.target.value; })} placeholder={t("যেমন: সী ব্রিজ হোটেল", "e.g. Sea Breeze Hotel")} className={field + " h-14 text-[19px] font-semibold"} maxLength={60} />
      <p className="mt-3 text-[14px] text-[#4d5664]">{t("ছবির সাইনবোর্ডে নামটা দেখুন", "See it on the sign in the picture")}</p>
    </Q>
  );
}

const DIVS: [string, string][] = [["Dhaka", "ঢাকা"], ["Chattogram", "চট্টগ্রাম"], ["Sylhet", "সিলেট"], ["Khulna", "খুলনা"], ["Rajshahi", "রাজশাহী"], ["Barishal", "বরিশাল"], ["Rangpur", "রংপুর"], ["Mymensingh", "ময়মনসিংহ"]];
/** Round 1 (12 Nov): type the address right here; the map pin is optional (prototype map). */
function Address({ d }: { d: Draft }) {
  const [open, setOpen] = useState(false);
  const { edit } = useOnboarding();
  const { t } = useL();
  const set = (k: "road" | "area" | "city" | "division" | "postcode", v: string) => edit((x) => { x[k] = v; x.address = [x.road, x.area, x.city, x.postcode].map((y) => y.trim()).filter(Boolean).join(", "); });
  const inp = (k: "road" | "area" | "city" | "postcode", lab: string, ph: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label htmlFor={`ad-${k}`} className={label}>{lab}</label><input id={`ad-${k}`} value={d[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} {...extra} className={field + " mt-1.5"} /></div>
  );
  return (
    <Q title={t("আপনার property কোথায়?", "Where is your property?")} why={t("গেস্টরা ম্যাপ দেখে আসবে। ঠিকানা বুকিং কনফার্মেশনে যায়।", "Guests find you by this address; it goes on every booking confirmation.")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{inp("road", t("রাস্তা / বাড়ি", "Road / house"), t("যেমন: জিন্দাবাজার রোড", "e.g. Zindabazar Road"), { autoComplete: "address-line1" })}</div>
        {inp("area", t("এলাকা (ঐচ্ছিক)", "Area (optional)"), t("যেমন: জিন্দাবাজার", "e.g. Zindabazar"))}
        {inp("city", t("শহর / জেলা", "City / district"), t("যেমন: সিলেট", "e.g. Sylhet"), { autoComplete: "address-level2" })}
        <div><label htmlFor="ad-div" className={label}>{t("বিভাগ (ঐচ্ছিক)", "Division (optional)")}</label><select id="ad-div" value={d.division} onChange={(e) => set("division", e.target.value)} className={field + " mt-1.5"}><option value="">{t("বাছাই করুন", "Choose")}</option>{DIVS.map(([en, bn]) => <option key={en} value={en}>{t(bn, en)}</option>)}</select></div>
        {inp("postcode", t("পোস্টকোড (ঐচ্ছিক)", "Postcode (optional)"), "3100", { inputMode: "numeric", maxLength: 4 })}
      </div>
      <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#c6ccd4] bg-white px-3.5 py-2.5 text-[14.5px] font-semibold hover:bg-[#f4f6f8]">
        <MapPin className="size-4 text-[#b11c29]" aria-hidden />{d.pin ? t("ম্যাপের পিন বদলান", "Change map pin") : t("ম্যাপে পিন দিন (ঐচ্ছিক)", "Add a map pin (optional)")}
      </button>
      {open && <AddressSheet d={d} onClose={() => setOpen(false)} />}
    </Q>
  );
}

function Extras({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  const food = (l: string[]) => l.some((e) => e === "Restaurant" || e === "Bar");
  const tog = (e: string) => edit((x) => {
    const had = food(x.extras);
    x.extras = x.extras.includes(e) ? x.extras.filter((y) => y !== e) : [...x.extras, e];
    // Restaurant/Bar here = the Restaurant & meals tool in part 4 (asked once, not twice).
    if (!had && food(x.extras) && !x.modules.includes("restaurant")) x.modules = [...x.modules, "restaurant"];
    if (had && !food(x.extras)) x.modules = x.modules.filter((y) => y !== "restaurant");
  });
  return (
    <Q title={t("আর কী কী আছে?", "What else is there?")} why={t("এগুলো দেখে মডিউল আর ওয়েবসাইটের অংশ ঠিক হয়।", "This decides which tools and website sections you get.")}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {EXTRAS.map((e) => { const I = EXTRA_ICON[e] ?? Sparkles; return <Tile key={e} on={d.extras.includes(e)} onClick={() => tog(e)} icon={<I className="size-5" />} title={t(EXTRA_BN[e] ?? e, e)} />; })}
      </div>
    </Q>
  );
}

// ---------------- Part 3 ----------------
function BookingRules({ d }: { d: Draft }) {
  const { t } = useL();
  return (
    <Q title={t("বুকিংয়ের নিয়ম", "Booking rules")} why={t("দাম, বাতিল আর চেক-ইনের সময় — গেস্ট বুক করার আগে এগুলো দেখে।", "Prices, cancellation and times — guests see these before they book.")}>
      <h2 className="mb-3 text-[17px] font-semibold">{t("দামের নিয়ম", "Price rules")}</h2>
      <Rates d={d} />
      <h2 className="mb-3 mt-9 border-t border-[#e3e7ec] pt-7 text-[17px] font-semibold">{t("বাতিল ও সময়", "Cancellation & times")}</h2>
      <Policy d={d} />
    </Q>
  );
}
function Rates({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t, lang } = useL();
  const r = d.rates;
  const set = (fn: (x: Draft["rates"]) => void) => edit((x) => { fn(x.rates); x.rates.done = true; });
  return (
    <div>
      <div className="space-y-3">
        <Toggle on={r.weekendPct > 0} onClick={() => set((x) => { x.weekendPct = x.weekendPct > 0 ? 0 : 10; })} icon={<CalendarDays className="size-5" />} title={t("শুক্র–শনি দাম একটু বেশি", "Higher price on Fri–Sat")}>
          {r.weekendPct > 0 && <div className="mt-3 flex flex-wrap gap-2">{[10, 15, 20, 30].map((p) => <Chip key={p} on={r.weekendPct === p} onClick={() => set((x) => { x.weekendPct = p; })}>+{num(p, lang)}%</Chip>)}</div>}
        </Toggle>
        <Toggle on={r.minStay > 1} onClick={() => set((x) => { x.minStay = x.minStay > 1 ? 1 : 2; })} icon={<BedDouble className="size-5" />} title={t("কমপক্ষে কত রাত থাকতে হবে", "Minimum nights")}>
          {r.minStay > 1 && <div className="mt-3"><Stepper label={t("রাত", "Nights")} value={r.minStay} set={(n) => set((x) => { x.minStay = n; })} min={1} max={14} /></div>}
        </Toggle>
      </div>
      <button onClick={() => set(() => {})} className="mt-4 text-[14.5px] font-medium text-[#4d5664] underline underline-offset-4">{t("কোনো নিয়ম নেই — সব দিন এক দাম", "No rules — same price every day")}</button>
    </div>
  );
}
function Toggle({ on, onClick, icon, title, children }: { on: boolean; onClick: () => void; icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className={clsx("rounded-xl border p-4 transition-colors", on ? "border-[#0f1720] bg-white shadow-[inset_0_0_0_1px_#0f1720]" : "border-[#c6ccd4] bg-white")}>
      <button type="button" role="switch" aria-checked={on} onClick={onClick} className="flex w-full items-center gap-3 text-left">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ffe7e4] text-[#b11c29]">{icon}</span>
        <span className="flex-1 text-[16px] font-semibold">{title}</span>
        <span className={clsx("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-[#b11c29]" : "bg-[#ddd6e6]")}><span className={clsx("absolute top-1 size-5 rounded-full bg-white shadow transition-[left]", on ? "left-6" : "left-1")} /></span>
      </button>
      {children}
    </div>
  );
}

const POLICIES = [
  { id: "flexible", bn: "নমনীয়", en: "Flexible", subBn: "চেক-ইনের ২৪ ঘণ্টা আগে পর্যন্ত ফ্রি বাতিল", subEn: "Free cancellation until 24 h before", icon: ShieldCheck },
  { id: "moderate", bn: "মাঝারি", en: "Moderate", subBn: "৫ দিন আগে পর্যন্ত ফ্রি, পরে ১ রাতের দাম", subEn: "Free until 5 days before, then 1 night", icon: Scale },
  { id: "strict", bn: "কড়া", en: "Strict", subBn: "৭ দিন আগে ৫০% ফেরত, পরে ফেরত নেই", subEn: "50% back until 7 days, then none", icon: Lock },
] as const;
const TIMES_IN = ["12:00", "13:00", "14:00", "15:00"];
const TIMES_OUT = ["10:00", "11:00", "12:00"];
const hhmm = (v: string, lang: "bn" | "en") => { const [H] = v.split(":").map(Number); return num(`${H % 12 || 12}${H >= 12 ? " PM" : " AM"}`, lang); };
function Policy({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t, lang } = useL();
  const p = d.policy;
  const [tax, setTax] = useState(false);
  return (
    <div>
      <div role="radiogroup" aria-label={t("বাতিলের নিয়ম", "Cancellation rule")} className="grid gap-2.5">
        {POLICIES.map((x) => <Tile key={x.id} role="radio" on={p.preset === x.id} onClick={() => edit((y) => { y.policy.preset = x.id; })} icon={<x.icon className="size-6" />} title={t(x.bn, x.en)} sub={t(x.subBn, x.subEn)} />)}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><p className="text-[15px] font-semibold">{t("চেক-ইন", "Check-in")}</p><div className="mt-2 flex flex-wrap gap-2">{TIMES_IN.map((v) => <Chip key={v} on={p.checkIn === v} onClick={() => edit((y) => { y.policy.checkIn = v; })}>{hhmm(v, lang)}</Chip>)}</div></div>
        <div><p className="text-[15px] font-semibold">{t("চেক-আউট", "Check-out")}</p><div className="mt-2 flex flex-wrap gap-2">{TIMES_OUT.map((v) => <Chip key={v} on={p.checkOut === v} onClick={() => edit((y) => { y.policy.checkOut = v; })}>{hhmm(v, lang)}</Chip>)}</div></div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-[#e3e7ec] bg-white px-4 py-3 text-[14.5px]">
        <span>{t("ভ্যাট", "VAT")} {num(p.vat, lang)}% · {t("সার্ভিস চার্জ", "Service")} {num(p.sc, lang)}%</span>
        <button onClick={() => setTax((x) => !x)} aria-expanded={tax} className="ml-auto font-semibold text-[#b11c29]">{t("বদলান", "Change")}</button>
        {tax && <div className="flex w-full flex-wrap gap-4 pt-2">
          <div><p className="text-[13px] text-[#4d5664]">{t("ভ্যাট", "VAT")}</p><div className="mt-1 flex gap-2">{[0, 5, 7.5, 15].map((v) => <Chip key={v} on={p.vat === v} onClick={() => edit((y) => { y.policy.vat = v; })}>{num(v, lang)}%</Chip>)}</div></div>
          <div><p className="text-[13px] text-[#4d5664]">{t("সার্ভিস চার্জ", "Service")}</p><div className="mt-1 flex gap-2">{[0, 5, 10].map((v) => <Chip key={v} on={p.sc === v} onClick={() => edit((y) => { y.policy.sc = v; })}>{num(v, lang)}%</Chip>)}</div></div>
        </div>}
      </div>
    </div>
  );
}

// ---------------- Part 4 ----------------
const MODULES = [
  { id: "frontdesk", bn: "ফ্রন্ট ডেস্ক ও বুকিং", en: "Front desk & bookings", icon: BookOpen, locked: true },
  { id: "housekeeping", bn: "হাউসকিপিং", en: "Housekeeping", icon: Brush },
  { id: "staff", bn: "পূর্ণ HRM (স্টাফ, হাজিরা, বেতন)", en: "Full HRM (staff, attendance, payroll)", icon: UsersRound },
  { id: "inventory", bn: "স্টক / ইনভেন্টরি", en: "Inventory", icon: Boxes },
  { id: "accounts", bn: "খরচের হিসাব", en: "Expense management", icon: Landmark },
  { id: "restaurant", bn: "রেস্টুরেন্ট ও মিল", en: "Restaurant & meals", icon: Utensils },
  { id: "services", bn: "অন্যান্য সার্ভিস (লন্ড্রি, গাড়ি, ট্যুর)", en: "Other services (laundry, transport, tours)", icon: Sparkles },
];
function Modules({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  const need = recommend(d);
  return (
    <Q title={t("কোন কোন কাজ BinGi দিয়ে করবেন?", "What will you run on BinGi?")} why={t("যেগুলো চালান না সেগুলো বন্ধ রাখুন — মেনু ছোট থাকবে। পরে চালু করা যায়।", "Turn off what you don't run. You can turn it on later.")}>
      <div className="grid gap-2.5">
        {MODULES.map((m) => {
          const on = m.locked || d.modules.includes(m.id);
          const pl = MODULE_PLAN[m.id];
          return <Tile key={m.id} on={on} locked={m.locked} onClick={() => edit((x) => { x.modules = x.modules.includes(m.id) ? x.modules.filter((y) => y !== m.id) : [...x.modules, m.id]; })}
            icon={<m.icon className="size-6" />} title={t(m.bn, m.en)} sub={m.id === "restaurant" && d.extras.some((e) => e === "Restaurant" || e === "Bar") ? t("আপনি বলেছেন রেস্টুরেন্ট/বার আছে, তাই চালু করা আছে", "On because you said you have a restaurant/bar") : undefined} badge={m.locked ? t("সবসময় চালু", "Always on") : pl === "starter" ? undefined : t(`${PLANS[pl].label} থেকে`, `From ${PLANS[pl].label}`)} />;
        })}
      </div>
      <p className="mt-4 rounded-lg border border-[#e3e7ec] bg-white px-4 py-3 text-[14px] text-[#4d5664]">{t("আপনার বাছাই অনুযায়ী মানানসই প্ল্যান:", "Plan that fits your choices:")} <b className="text-[#0f1720]">{PLANS[need].label}</b> · {t("শেষ ধাপে বদলাতে পারবেন", "you can change it in the last part")}</p>
    </Q>
  );
}
const ROLES: [string, string][] = [["Manager", "ম্যানেজার"], ["Front desk", "ফ্রন্ট ডেস্ক"], ["Housekeeping", "হাউসকিপিং"], ["Accounts", "হিসাব"]];
function Team({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  return (
    <Q title={t("আপনার টিম", "Your team")} why={t("তারা SMS পাবে আর নিজের BinGi ID দিয়ে যোগ দেবে।", "They get an SMS and join with their own BinGi ID.")}>
      <p className="text-[15px] font-semibold">{t("কত জন কাজ করেন?", "How many people work here?")}</p>
      <div className="mt-2 flex flex-wrap gap-2">{STAFF.map((s, i) => <Chip key={s} on={d.staff === s} onClick={() => edit((x) => { x.staff = s; })}>{t(["শুধু আমি", "২–৫", "৬–১৫", "১৬–৫০", "৫০+"][i], s)}</Chip>)}</div>
      <p className="mt-6 text-[15px] font-semibold">{t("কাউকে এখনই যোগ করবেন? (৩ জন পর্যন্ত)", "Invite someone now? (up to 3)")}</p>
      <div className="mt-2 space-y-2">
        {d.team.map((m, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-[#c6ccd4] bg-white p-2.5">
            <input aria-label={`${t("মোবাইল", "Mobile")} ${i + 1}`} inputMode="tel" placeholder="01712 345678" value={m.phone} onChange={(e) => edit((x) => { x.team[i].phone = e.target.value; })} className={field + " h-11 min-w-0 flex-1 basis-[160px]"} />
            <div className="flex flex-wrap gap-1.5">{ROLES.map(([en, bn]) => <Chip key={en} on={m.role === en} onClick={() => edit((x) => { x.team[i].role = en; })}>{t(bn, en)}</Chip>)}</div>
            <button aria-label={`${t("বাদ দিন", "Remove")} ${i + 1}`} onClick={() => edit((x) => { x.team.splice(i, 1); })} className="ml-auto grid size-10 place-items-center rounded-full text-[#4d5664] hover:bg-[#e9edf2]">✕</button>
          </div>
        ))}
        {d.team.length < 3 && <Ghost onClick={() => edit((x) => { x.team.push({ phone: "", role: "Front desk" }); x.teamLater = false; })}><Plus className="size-[18px]" /> {t("একজন যোগ করুন", "Add a person")}</Ghost>}
      </div>
    </Q>
  );
}

// ---------------- Part 5 ----------------
const BANKS = ["Sonali Bank", "Janata Bank", "Agrani Bank", "Rupali Bank", "BRAC Bank", "Dutch-Bangla Bank", "The City Bank", "Eastern Bank", "Islami Bank Bangladesh", "Prime Bank", "Mutual Trust Bank", "Bank Asia", "Pubali Bank", "Uttara Bank", "Dhaka Bank", "Southeast Bank", "NCC Bank", "ONE Bank", "AB Bank", "Standard Chartered"];
function In({ id, lab, value, set, ph, mode, hint }: { id: string; lab: string; value?: string; set: (v: string) => void; ph?: string; mode?: "tel" | "numeric"; hint?: string }) {
  return <div><label htmlFor={id} className={label}>{lab}</label><input id={id} value={value ?? ""} onChange={(e) => set(e.target.value)} placeholder={ph} inputMode={mode} className={field + " mt-1.5"} />{hint && <p className="mt-1 text-[12.5px] text-[#4d5664]">{hint}</p>}</div>;
}
function Payments({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  const p = d.pay;
  const tog = (k: "cash" | "bkash" | "nagad" | "bank") => edit((x) => { x.pay[k] = !x.pay[k]; });
  const setP = (fn: (x: Draft["pay"]) => void) => edit((x) => { fn(x.pay); });
  const st = p.settle ?? { method: "bank" as const, holder: "", bank: "", acc: "", branch: "", routing: "", wallet: "" };
  const setS = (k: keyof typeof st, v: string) => setP((x) => { x.settle = { ...st, [k]: v } as typeof st; });
  const types: [NonNullable<Draft["pay"]["bkashType"]>, string, string][] = [["personal", "পার্সোনাল", "Personal"], ["merchant", "মার্চেন্ট", "Merchant"], ["agent", "এজেন্ট", "Agent"]];
  return (
    <Q title={t("গেস্ট কীভাবে টাকা দেবে?", "How do guests pay?")} why={t("শুরুতে গেস্ট সরাসরি আপনাকে টাকা দেয়। অনলাইন পেমেন্ট (BinGi Payments) যাচাইয়ের পরে চালু হয়।", "Guests pay you directly first. BinGi Payments opens after verification.")}>
      <div className="grid gap-2.5">
        <Tile on={p.cash} onClick={() => tog("cash")} icon={<Banknote className="size-6" />} title={t("নগদ / কাউন্টারে", "Cash at the desk")} sub={t("সবসময় চালু থাকবে", "Always on")} />
        <Tile on={p.bkash} onClick={() => tog("bkash")} icon={<Smartphone className="size-6" />} title="bKash" sub={p.bkash && p.bkashNo ? `${p.bkashNo} · ${t(types.find((x) => x[0] === (p.bkashType ?? "personal"))![1], types.find((x) => x[0] === (p.bkashType ?? "personal"))![2])}` : t("গেস্ট আপনার নম্বরে পাঠাবে", "Guest sends to your number")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <In id="bk-no" lab={t("bKash নম্বর", "bKash number")} value={p.bkashNo} set={(v) => setP((x) => { x.bkashNo = v; })} ph="01712 345678" mode="tel" />
            <div><span className={label}>{t("অ্যাকাউন্টের ধরন", "Account type")}</span><div className="mt-1.5 flex flex-wrap gap-2">{types.map(([v, bn, en]) => <Chip key={v} on={(p.bkashType ?? "personal") === v} onClick={() => setP((x) => { x.bkashType = v; })}>{t(bn, en)}</Chip>)}</div></div>
          </div>
        </Tile>
        <Tile on={p.nagad} onClick={() => tog("nagad")} icon={<Smartphone className="size-6" />} title="Nagad" sub={p.nagad && p.nagadNo ? p.nagadNo : t("গেস্ট আপনার নম্বরে পাঠাবে", "Guest sends to your number")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <In id="ng-no" lab={t("Nagad নম্বর", "Nagad number")} value={p.nagadNo} set={(v) => setP((x) => { x.nagadNo = v; })} ph="01812 345678" mode="tel" />
            <div><span className={label}>{t("অ্যাকাউন্টের ধরন", "Account type")}</span><div className="mt-1.5 flex flex-wrap gap-2">{types.map(([v, bn, en]) => <Chip key={v} on={(p.nagadType ?? "personal") === v} onClick={() => setP((x) => { x.nagadType = v; })}>{t(bn, en)}</Chip>)}</div></div>
          </div>
        </Tile>
        <Tile on={p.bank} onClick={() => tog("bank")} icon={<Landmark className="size-6" />} title={t("ব্যাংক ট্রান্সফার", "Bank transfer")} sub={p.bank && p.bankName ? `${p.bankName} · ${p.bankAcc ?? ""}` : t("অগ্রিম টাকার জন্য", "For advance payments")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor="bk-bank" className={label}>{t("ব্যাংক", "Bank")}</label><select id="bk-bank" value={p.bankName ?? ""} onChange={(e) => setP((x) => { x.bankName = e.target.value; })} className={field + " mt-1.5"}><option value="">{t("বাছাই করুন", "Choose")}</option>{BANKS.map((b) => <option key={b}>{b}</option>)}</select></div>
            <In id="bk-holder" lab={t("অ্যাকাউন্টের নাম", "Account name")} value={p.bankHolder} set={(v) => setP((x) => { x.bankHolder = v; })} />
            <In id="bk-acc" lab={t("অ্যাকাউন্ট নম্বর", "Account number")} value={p.bankAcc} set={(v) => setP((x) => { x.bankAcc = v.replace(/[^\d]/g, ""); })} mode="numeric" />
            <In id="bk-branch" lab={t("শাখা", "Branch")} value={p.bankBranch} set={(v) => setP((x) => { x.bankBranch = v; })} />
          </div>
        </Tile>
      </div>

      <h2 className="mt-9 text-[18px] font-semibold">{t("BinGi Payments — অনলাইনে কার্ড ও ওয়ালেট", "BinGi Payments — online cards & wallets")}</h2>
      <p className="mt-1 text-[14.5px] text-[#4d5664]">{t("গেস্ট ওয়েবসাইটে অনলাইনে পে করবে, টাকা আপনার সেটেলমেন্ট অ্যাকাউন্টে যাবে। যাচাই ও অনুমোদনের পরে চালু হয়।", "Guests pay online on your website; money settles to your account. Goes live after verification and approval.")}</p>
      <div role="radiogroup" aria-label="BinGi Payments" className="mt-4 grid gap-2.5">
        <Tile role="radio" on={p.bingi === "apply"} onClick={() => setP((x) => { x.bingi = "apply"; })} icon={<Wallet className="size-6" />} title={t("এখনই আবেদন করুন", "Apply now")} sub={t("সেটেলমেন্ট অ্যাকাউন্ট দিন", "Add your settlement account")}>
          <div role="radiogroup" aria-label={t("সেটেলমেন্ট কোথায়", "Settle to")} className="flex flex-wrap gap-2">
            <Chip on={st.method === "bank"} onClick={() => setS("method", "bank")}>{t("ব্যাংক অ্যাকাউন্ট", "Bank account")}</Chip>
            <Chip on={st.method === "bkash"} onClick={() => setS("method", "bkash")}>{t("bKash মার্চেন্ট", "bKash merchant")}</Chip>
          </div>
          {st.method === "bank" ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <In id="st-holder" lab={t("অ্যাকাউন্টের নাম (ব্যবসার নামে)", "Account name (business)")} value={st.holder} set={(v) => setS("holder", v)} />
              <div><label htmlFor="st-bank" className={label}>{t("ব্যাংক", "Bank")}</label><select id="st-bank" value={st.bank} onChange={(e) => setS("bank", e.target.value)} className={field + " mt-1.5"}><option value="">{t("বাছাই করুন", "Choose")}</option>{BANKS.map((b) => <option key={b}>{b}</option>)}</select></div>
              <In id="st-acc" lab={t("অ্যাকাউন্ট নম্বর", "Account number")} value={st.acc} set={(v) => setS("acc", v.replace(/\D/g, ""))} mode="numeric" />
              <In id="st-branch" lab={t("শাখা", "Branch")} value={st.branch} set={(v) => setS("branch", v)} />
              <In id="st-routing" lab={t("রাউটিং নম্বর", "Routing number")} value={st.routing} set={(v) => setS("routing", v.replace(/\D/g, ""))} mode="numeric" hint={t("৯ সংখ্যা — চেক বই বা ব্যাংকের অ্যাপে আছে", "9 digits — on your cheque book or bank app")} />
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <In id="st-holder2" lab={t("মার্চেন্টের নাম", "Merchant name")} value={st.holder} set={(v) => setS("holder", v)} />
              <In id="st-wallet" lab={t("bKash মার্চেন্ট নম্বর", "bKash merchant number")} value={st.wallet} set={(v) => setS("wallet", v)} mode="tel" />
            </div>
          )}
          <p className="mt-3 text-[12.5px] text-[#4d5664]">{t("প্রোটোটাইপ: তথ্য শুধু এই ব্রাউজারে থাকে, কোথাও পাঠানো হয় না।", "Prototype: kept in this browser only, not sent anywhere.")}</p>
        </Tile>
        <Tile role="radio" on={p.bingi === "later"} onClick={() => setP((x) => { x.bingi = "later"; })} icon={<Clock className="size-6" />} title={t("পরে সেটআপ করবো", "Set up later")} sub={t("HMS → সেটিংস → কানেক্টিভিটি থেকে পরে আবেদন", "Apply later in HMS → Settings → Connectivity")} />
      </div>
    </Q>
  );
}

/** The four looks shown for this property (best fits first) — the first one is kept if the owner picks none. */
function themesFor(d: Draft) {
  const plan: PlanId = d.planPicked ? d.plan : recommend(d);
  const rank = (p: string) => PLAN_ORDER.indexOf(p as (typeof PLAN_ORDER)[number]);
  const old = hotelOf(d).propertyType;
  const fits = (x: (typeof MASTER_LIST)[number]) => x.bestFor.includes(old);
  return MASTER_LIST.filter((x) => rank(x.minPlan) <= rank(plan === "starter" ? "business" : plan)).sort((a, b) => Number(fits(b)) - Number(fits(a))).slice(0, 4);
}
function Website({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  const old = hotelOf(d).propertyType;
  const fits = (x: (typeof MASTER_LIST)[number]) => x.bestFor.includes(old);
  const themes = themesFor(d);
  return (
    <Q title={t("আপনার ওয়েবসাইট দেখতে কেমন হবে?", "How should your website look?")} why={t("আপনার রুম, দাম আর ছবি দিয়ে আমরা সাজিয়ে দেব। অনুমোদনের আগে ড্রাফট থাকবে।", "We fill it with your rooms and prices. It stays a draft until approval.")}>
      <div role="radiogroup" aria-label={t("ওয়েবসাইটের লুক", "Website look")} className="grid gap-3 sm:grid-cols-2">
        {themes.map((x) => {
          const on = d.site.theme === x.id;
          return (
            <button key={x.id} role="radio" aria-checked={on} onClick={() => edit((y) => { y.site.theme = x.id; y.site.later = false; })}
              className={clsx("relative overflow-hidden rounded-xl border text-left transition-colors", on ? "border-[#ef6b62]" : "border-[#c6ccd4] hover:border-[#d5d8e0]")}>
              <Image src={`/themes/${x.id}.jpg`} alt="" width={520} height={260} className="aspect-[16/8] w-full object-cover object-top" />
              <span className="flex flex-wrap items-center gap-2 bg-white p-3"><span className="text-[15.5px] font-semibold">{x.name}</span>{fits(x) && <span className="rounded-full bg-[#e9f6ee] px-2 py-0.5 text-[11.5px] font-semibold text-[#1c6b3c]">{t("আপনার জন্য মানানসই", "Good fit")}</span>}</span>
              {on && <span className="onb-pop absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-[#b11c29] text-white shadow"><Check className="size-4" /></span>}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13.5px] text-[#4d5664]">{t("কিছু লুক নির্দিষ্ট প্ল্যানে পাওয়া যায় — প্ল্যান শেষ ধাপে।", "Some looks need a higher plan — plan is in the last part.")}</p>
    </Q>
  );
}

// ---------------- Part 6 ----------------
function Plan({ d, units }: { d: Draft; units: number }) {
  const { edit } = useOnboarding();
  const { t, lang } = useL();
  const rec = recommend(d);
  const n = (v: number) => num(money(v), lang);
  return (
    <Q title={t("আপনার প্ল্যান", "Your plan")} sub={t(`প্রতি রুম হিসেবে মাসিক দাম — কিছু লুকানো নেই। আপনার ${num(units, lang)}টা রুম ধরে হিসাব${units < MIN_BILLED ? ` (কমপক্ষে ${num(MIN_BILLED, lang)}টা রুমের বিল)` : ""}। ${num(TRIAL_DAYS, lang)} দিন ফ্রি।`, `A simple monthly rate per room — nothing hidden. Priced on your ${units} rooms${units < MIN_BILLED ? ` (minimum ${MIN_BILLED} billed)` : ""}. ${TRIAL_DAYS} days free.`)}>
      <div role="radiogroup" aria-label={t("বিলিং", "Billing")} className="inline-flex rounded-lg border border-[#858c97] bg-white p-1">
        {([1, 6, 12] as Cycle[]).map((c) => <button key={c} role="radio" aria-checked={d.cycle === c} onClick={() => edit((x) => { x.cycle = c; })} className={clsx("h-9 rounded-md px-3.5 text-[14px] font-semibold", d.cycle === c ? "bg-[#0f1720] text-white" : "text-[#4d5664] hover:bg-[#e9edf2]")}>{c === 1 ? t("মাসিক", "Monthly") : t(`${num(c, lang)} মাস`, `${c} months`)}{CYCLE_OFF[c] ? <span className={clsx("ml-1.5 text-[12.5px]", d.cycle === c ? "text-[#ffb4ad]" : "text-[#b11c29]")}>−{num(CYCLE_OFF[c] * 100, lang)}%</span> : null}</button>)}
      </div>
      <div role="radiogroup" aria-label={t("প্ল্যান", "Plan")} className="mt-5 grid gap-3 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((p) => {
          const P = PLANS[p]; const on = (d.planPicked ? d.plan : rec) === p; const q = quote(p, units, d.cycle);
          const low = planRank(p) < planRank(rec);
          return (
            <button key={p} role="radio" aria-checked={on} onClick={() => edit((x) => { x.plan = p; x.planPicked = true; })}
              className={clsx("relative flex flex-col rounded-xl border bg-white p-4 text-left transition-[border-color,box-shadow]", on ? "order-first border-[#b11c29] shadow-[inset_0_0_0_1px_#b11c29] sm:order-none" : "border-[#c6ccd4] hover:border-[#9aa0ac]")}>
              <span className="flex items-center justify-between gap-2 pr-7"><span className="text-[19px] font-semibold">{P.label}</span>{rec === p && <span className="rounded bg-[#b11c29] px-1.5 py-0.5 text-[11.5px] font-semibold text-white">{t("আপনার জন্য", "Best fit")}</span>}</span>
              <span className="mt-1 text-[13.5px] text-[#4d5664]">{t(P.forBn, P.for)}</span>
              <span className="mt-2 flex flex-wrap gap-1">{P.tags.map(([bn, en]) => <span key={en} className="rounded bg-[#fdecea] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#8e1621]">{t(bn, en)}</span>)}</span>
              <span className="mt-3 text-[28px] font-semibold leading-none">{P.perUnitRegular && <s className="mr-1.5 text-[16px] font-normal text-[#4d5664]">৳{num(P.perUnitRegular, lang)}</s>}৳{num(P.perUnit, lang)}<span className="text-[13px] font-normal text-[#4d5664]"> /{t("রুম/মাস", "room/month")}</span></span>
              <span className="mt-3 space-y-1.5 border-t border-[#e3e7ec] pt-3 text-[13px] text-[#4d5664]">
                <span className="block">{t(`${num(q.billed, lang)} রুম · ৳${n(q.monthly)}/মাস`, `${q.billed} rooms · ৳${n(q.monthly)}/month`)}</span>
                <span className="block">{t(`বুকিং ফি: মার্কেটপ্লেস ${num(P.fees[0], lang)}% · ওয়েব ${num(P.fees[1], lang)}% · ওয়াক-ইন ${num(P.fees[2], lang)}%`, `Booking fees: Marketplace ${P.fees[0]}% · Web ${P.fees[1]}% · Walk-in ${P.fees[2]}%`)}</span>
                <span className="block">{P.activation ? <>{t("অ্যাক্টিভেশন", "Activation")} {P.activationRegular && <s>৳{n(P.activationRegular)}</s>} ৳{n(P.activation)}</> : t("অ্যাক্টিভেশন ফি নেই", "No activation fee")}</span>
              </span>
              <span className="mt-3 border-t border-[#e3e7ec] pt-3 text-[12.5px] font-semibold">{t(...P.includesTitle)}</span>
              <span className="mt-1.5 space-y-1">{P.includes.map(([bn, en]) => <span key={en} className="flex items-start gap-1.5 text-[13px] text-[#4d5664]"><Check className="mt-0.5 size-3.5 shrink-0 text-[#b11c29]" strokeWidth={3} />{t(bn, en)}</span>)}</span>
              {low && <span className="mt-3 rounded bg-[#fdf6e7] px-2 py-1 text-[12px] text-[#7a4a0b]">{t("আপনার বাছাই করা কিছু টুল এতে নেই", "Some tools you picked aren't in this plan")}</span>}
              <span aria-hidden className={clsx("absolute right-4 top-4 grid size-5 place-items-center rounded-full border", on ? "border-[#b11c29] bg-[#b11c29]" : "hidden")}><span className="size-2 rounded-full bg-white" /></span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[#858c97] bg-white px-4 py-3">
        <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">Custom</span><span className="text-[13.5px] text-[#4d5664]">{t("একাধিক property, হোটেল গ্রুপ — কোটেশন রিভিউর পরে", "Hotel groups and chains — quotation after review")}</span></span>
        <span className="text-[13.5px] font-semibold text-[#4d5664]">{t("সাহায্য চাপুন → কল", "Tap Help → call")}</span>
      </div>
      {d.planPicked && (() => { const q = quote(d.plan, units, d.cycle); return (
        <div className="mt-5 grid gap-1.5 rounded-xl border border-[#e3e7ec] bg-white p-4 text-[14.5px]"><dl className="grid gap-1.5">
          <Row k={t(`${num(q.billed, lang)} রুম × ৳${num(PLANS[d.plan].perUnit, lang)} × ${num(d.cycle, lang)} মাস`, `${q.billed} rooms × ৳${PLANS[d.plan].perUnit} × ${d.cycle} mo`)} v={`৳${n(q.gross)}`} />
          {q.off > 0 && <Row k={t("ছাড়", "Discount")} v={`−৳${n(q.off)}`} />}
          <Row k={t("অ্যাক্টিভেশন (একবার)", "Activation (one time)")} v={`৳${n(q.activation)}`} />
          <div className="mt-1 flex justify-between border-t border-[#e3e7ec] pt-2 font-semibold"><dt>{t("ট্রায়ালের পর", "After the trial")}</dt><dd>৳{n(q.total)}</dd></div>
          </dl>
          {units < MIN_BILLED && <p className="text-[12.5px] text-[#4d5664]">{t(`কমপক্ষে ${num(MIN_BILLED, lang)}টা রুমের বিল হয়`, `Billing starts at ${MIN_BILLED} rooms`)}</p>}
          <p className="text-[12.5px] text-[#4d5664]">{t("ট্যাক্স প্রযোজ্য হলে আলাদা", "Taxes extra where applicable")}</p>
        </div>
      ); })()}
    </Q>
  );
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3"><dt className="text-[#4d5664]">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>; }

function Verify({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  const docs = [["nid", IdCard, "মালিকের NID (সামনে ও পেছনে)", "Owner NID (front & back)", true], ["trade", FileText, "ট্রেড লাইসেন্স", "Trade licence", true], ["tin", Receipt, "TIN সার্টিফিকেট", "TIN certificate", false]] as const;
  return (
    <Q title={t("কাগজপত্র", "Documents")} why={t("ওয়েবসাইট পাবলিক আর অনলাইন পেমেন্টের আগে লাগবে। এখন না দিলেও HMS চালাতে পারবেন।", "Needed before going public and online payment. You can use HMS meanwhile.")}>
      <div className="grid gap-3">
        {docs.map(([k, DocIcon, bn, en, req]) => (
          <label key={k} className={clsx("flex cursor-pointer items-center gap-3 rounded-xl border p-4 focus-within:ring-4 focus-within:ring-[#ef6b62]/15", d.verify[k] ? "border-[#bfe0cb] bg-[#f4fbf6]" : "border-[#c6ccd4] bg-white")}>
            <span className={clsx("grid size-10 place-items-center", d.verify[k] ? "text-[#1c7d45]" : "text-[#0f1720]")} aria-hidden>{d.verify[k] ? <CircleCheck className="size-6" /> : <DocIcon className="size-6" />}</span>
            <span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold">{t(bn, en)}{!req && <span className="font-normal text-[#4d5664]"> ({t("ঐচ্ছিক", "optional")})</span>}</span><span className="block truncate text-[13.5px] text-[#4d5664]">{d.verify[k] || t("ছবি বা PDF", "Photo or PDF")}</span></span>
            <span className="inline-flex items-center gap-1 text-[14.5px] font-semibold text-[#b11c29]"><FileUp className="size-4" />{d.verify[k] ? t("বদলান", "Replace") : t("আপলোড", "Upload")}</span>
            <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) edit((x) => { x.verify[k] = f.name; x.verify.later = false; }); }} />
          </label>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-[#4d5664]">{t("প্রোটোটাইপ: শুধু ফাইলের নাম রাখা হয়, কিছু আপলোড হয় না।", "Prototype: only the file name is kept.")}</p>
    </Q>
  );
}

function Ready({ d, counts, go }: { d: Draft; counts: { total: number; published: number; categories: number }; go: (s: StepId) => void }) {
  const { t, lang } = useL();
  const cs = checks(d, counts);
  const sc = score(cs);
  const q = d.planPicked ? quote(d.plan, counts.total, d.cycle) : null;
  return (
    <Q title={t("সব ঠিক আছে?", "All good?")} why={t("জমা দিলে HMS সেটআপ মোডে খুলবে। BinGi যাচাই করে অনুমোদন দেবে।", "After submitting, HMS opens in setup mode while BinGi reviews.")}>
      <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-[#fff5f4] to-[#e9edf2] p-4">
        <Ring v={sc} lang={lang} />
        <div className="min-w-0">
          <p className="truncate text-[18px] font-semibold">{d.name || t("নাম নেই", "Untitled")}</p>
          <p className="text-[14px] text-[#4d5664]">{num(counts.total, lang)} {t("টা রুম", "rooms")} · {d.city || "—"} · {d.planPicked ? PLANS[d.plan].label : "—"}{q ? ` · ৳${num(money(q.monthly), lang)}/${t("মাস", "mo")}` : ""}</p>
        </div>
      </div>
      {cs.filter((c) => c.level === "required").every((c) => c.ok) && <p className="mt-4 flex items-center gap-2 rounded-xl border border-[#e3f1e7] bg-[#f6fbf7] px-3 py-2.5 text-[14.5px] font-medium"><span className="grid size-6 place-items-center rounded-full bg-[#1c7d45] text-white"><Check className="size-3.5" /></span>{t("জমা দেওয়ার মতো সব তৈরি", "Everything needed to submit is done")}</p>}
      {cs.some((c) => !c.ok) && <h3 className="mt-5 text-[15px] font-semibold">{t("চাইলে এখন করুন — পরেও করা যাবে", "Optional — now or later")}</h3>}
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {cs.filter((c) => !c.ok).map((c) => (
          <li key={c.id} className={clsx("flex items-center gap-2.5 rounded-xl border px-3 py-2.5", c.ok ? "border-[#e3f1e7] bg-[#f6fbf7]" : c.level === "required" ? "border-[#f6cfcb] bg-[#fff6f5]" : "border-[#c6ccd4] bg-white")}>
            <span className={clsx("grid size-6 shrink-0 place-items-center rounded-full", c.ok ? "bg-[#1c7d45] text-white" : c.level === "required" ? "bg-[#b11c29] text-white" : "bg-[#e3e7ec] text-[#4d5664]")}>{c.ok ? <Check className="size-3.5" /> : c.level === "required" ? <CircleAlert className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}</span>
            <span className="min-w-0 flex-1 text-[14.5px] font-medium">{t(c.bn, c.label)}{c.level !== "required" && !c.ok && <span className="text-[12.5px] text-[#4d5664]"> · {t("পরে করা যাবে", "can wait")}</span>}</span>
            {!c.ok && <button onClick={() => go(c.step)} className="text-[13.5px] font-semibold text-[#b11c29]">{t("ঠিক করুন", "Fix")}</button>}
          </li>
        ))}
      </ul>
      <details className="mt-4 rounded-xl border border-[#e3e7ec] bg-white px-3 py-2.5"><summary className="cursor-pointer text-[14px] font-semibold">{t(`সব দেখুন (${num(cs.filter((c) => c.ok).length, lang)}টা হয়েছে)`, `See everything (${cs.filter((c) => c.ok).length} done)`)}</summary>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">{cs.filter((c) => c.ok).map((c) => <li key={c.id} className="flex items-center gap-2 text-[14px]"><Check className="size-4 text-[#1c7d45]" aria-hidden />{t(c.bn, c.label)}</li>)}</ul>
      </details>
    </Q>
  );
}
function Ring({ v, lang }: { v: number; lang: "bn" | "en" }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg width="68" height="68" viewBox="0 0 64 64" role="img" aria-label={`${v}%`} className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#fff" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={v >= 80 ? "#1c7d45" : "#b11c29"} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} transform="rotate(-90 32 32)" style={{ transition: "stroke-dashoffset 500ms ease" }} />
      <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f1720">{num(v, lang)}%</text>
    </svg>
  );
}

function Done({ d }: { d: Draft }) {
  const { t, lang } = useL();
  const router = useRouter();
  const steps = [
    { icon: ShieldCheck, bn: "BinGi যাচাই করবে", en: "BinGi reviews your setup", subBn: "সাধারণত ১ কার্যদিবসের মধ্যে। কিছু লাগলে ফোন করবে।", subEn: "Usually within 1 working day. We call if anything is needed.", now: true },
    { icon: Globe, bn: "ওয়েবসাইট তৈরি হবে", en: "Your website is created", subBn: "বাছাই করা থিমে, আপনার রুম আর দাম দিয়ে।", subEn: "In the theme you chose, with your rooms and prices." },
    { icon: CalendarCheck, bn: "অনলাইন বুকিং চালু", en: "Online booking opens", subBn: "ওয়েবসাইট ও মার্কেটপ্লেস থেকে বুকিং আসবে।", subEn: "Bookings come from your website and the marketplace." },
  ];
  return (
    <Canvas>
      <Header title={d.name} />
      <main className="mx-auto max-w-[620px] px-4 py-12">
        <div className="text-center">
          <span className="onb-in mx-auto grid size-16 place-items-center rounded-full bg-[#e9f7ef] text-[#1c7d45]"><CircleCheck className="size-9" /></span>
          <h1 className="mt-5 text-[28px] font-semibold leading-tight">{t("সেটআপ জমা হয়েছে", "Setup submitted")}</h1>
          <p className="mx-auto mt-3 max-w-[460px] text-[16px] leading-relaxed text-[#4d5664]">{t(`${d.name || "আপনার property"} এখন সেটআপ মোডে। BinGi যাচাই করছে — এর মধ্যে HMS ব্যবহার শুরু করুন।`, `${d.name || "Your property"} is in setup mode. BinGi is reviewing — start using HMS meanwhile.`)}</p>
        </div>
        <section className="mt-9 rounded-xl border border-[#e3e7ec] bg-white p-5">
          <h2 className="text-[16px] font-semibold">{t("এরপর কী হবে", "What happens next")}</h2>
          <ol className="mt-4 space-y-4">
            {steps.map((s, i) => (
              <li key={s.en} className="flex gap-3">
                <span className={clsx("grid size-9 shrink-0 place-items-center rounded-lg", s.now ? "bg-[#0f1720] text-white" : "bg-[#e9edf2] text-[#4d5664]")}><s.icon className="size-[18px]" /></span>
                <span className="min-w-0"><span className="block text-[15px] font-semibold">{num(i + 1, lang)}. {t(s.bn, s.en)}{s.now && <span className="ml-2 rounded-md bg-[#fff4e5] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#8a5300]">{t("এখন চলছে", "In progress")}</span>}</span><span className="text-[14px] text-[#4d5664]">{t(s.subBn, s.subEn)}</span></span>
              </li>
            ))}
          </ol>
        </section>
        <section className="mt-4 rounded-xl border border-[#e3e7ec] bg-white p-5">
          <h2 className="text-[16px] font-semibold">{t("ততক্ষণে যা করতে পারেন", "Meanwhile you can")}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Link href="/hms/rooms" className="flex items-center gap-3 rounded-lg border border-[#e3e7ec] px-3.5 py-3 text-[14.5px] font-medium hover:border-[#0f1720]"><ImageIcon className="size-5 text-[#4d5664]" />{t("রুমের ছবি দিন", "Add room photos")}</Link>
            <Link href="/hms/staff" className="flex items-center gap-3 rounded-lg border border-[#e3e7ec] px-3.5 py-3 text-[14.5px] font-medium hover:border-[#0f1720]"><UsersRound className="size-5 text-[#4d5664]" />{t("টিম যোগ করুন", "Add your team")}</Link>
          </div>
        </section>
        <div className="mt-8 flex flex-wrap justify-center gap-2"><Ghost onClick={() => router.push("/onboarding/status")}>{t("স্ট্যাটাস দেখুন", "View status")}</Ghost><Primary onClick={() => router.push("/hms")}>{t("ড্যাশবোর্ডে যান", "Go to dashboard")}</Primary></div>
      </main>
    </Canvas>
  );
}
