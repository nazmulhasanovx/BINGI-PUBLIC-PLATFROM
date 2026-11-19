"use client";
// Part 2 — easy room builder, modelled on the live HMS "Add Room" flow:
// presets only (buildings, floors, zones, numbers), then one room type after another.
import clsx from "clsx";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AirVent, Armchair, Bath, BedDouble, Building, Building2, Car, Castle, Check, ChevronRight, Coffee, Fan, Flame, House, Laptop, Lock, Mountain, Plus,
  Refrigerator, ShowerHead, Sparkles, Trash2, Trees, Tv, UsersRound, Waves, Wifi, Wind, Wine, X, Accessibility, CookingPot, Sofa,
} from "lucide-react";
import { num, useL, useOnboarding, type Draft } from "@/lib/onboarding/store";
import { BEDS, BUILDINGS, MAX_FLOOR, ROOM_KINDS, SIZES, STAY, TYPE_NAMES, ZONES, configFrom, floorLabel, presetNumbers } from "@/lib/onboarding/rooms-easy";
import { AMENITIES, type CoreType } from "@/lib/rooms/catalog";
import { nodePath, uid, type Category, type LocNode, type Pick, type useRooms } from "@/lib/rooms/store";
import { money } from "../hms/rooms/parts";
import { Chip, Errors, Ghost, Primary, Q, Stepper, Tile, field } from "./shell";
export type { Form };

type Rooms = ReturnType<typeof useRooms>;
/** While a room type is being added, its own Back / Next / Save take over the card footer (one set of buttons at a time). */
export const FormSlot = createContext<{ slot: HTMLElement | null; setOpen: (o: boolean) => void }>({ slot: null, setOpen: () => {} });
const STAY_ICON: Record<CoreType, typeof BedDouble> = { ROOM: BedDouble, COTTAGE: House, VILLA: Castle, APARTMENT: Building, OTHER: Sparkles };

// ---------- 2.1 What you rent ----------
export function RoomsWhat({ d }: { d: Draft }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  return (
    <Q title={t("আপনি কী কী ভাড়া দেন?", "What do you rent out?")} why={t("যা যা আছে সব বাছাই করুন। রিসোর্টে রুম আর কটেজ দুটোই থাকতে পারে।", "Choose everything you have — a resort can have rooms and cottages.")}>
      <div className="grid gap-3 sm:grid-cols-2">
        {STAY.map((s) => { const I = STAY_ICON[s.id]; return <Tile key={s.id} big on={d.stay.includes(s.id)} onClick={() => edit((x) => { x.stay = x.stay.includes(s.id) ? x.stay.filter((y) => y !== s.id) : [...x.stay, s.id]; if (s.where === "zone" && !x.zones.length) x.zones = ["garden"]; if (s.where === "floor" && !x.floors.length) x.floors = [1, 2]; })} icon={<I className="size-6" />} title={t(s.bn, s.en)} sub={t(s.subBn, s.subEn)} />; })}
      </div>
    </Q>
  );
}

// ---------- 2.2 Where they are (presets only) ----------
export function RoomsWhere({ d, st }: { d: Draft; st: Rooms["st"] }) {
  const { edit } = useOnboarding();
  const { t, lang } = useL();
  const floorTypes = d.stay.some((s) => STAY.find((x) => x.id === s)?.where === "floor");
  const zoneTypes = d.stay.some((s) => STAY.find((x) => x.id === s)?.where === "zone");
  const used = new Set(st.units.filter((u) => u.status !== "archived").map((u) => u.node));
  const usedFloors = st.config.nodes.filter((n) => n.kind === "FLOOR" && used.has(n.id));
  const minTop = Math.max(0, ...usedFloors.map((n) => n.level ?? 0));
  const groundUsed = usedFloors.some((n) => n.level === 0);
  const bUsed = (b: string) => st.config.nodes.some((n) => n.parent === `b-${b}` && used.has(n.id));
  const zUsed = (z: string) => used.has(`z-${z}`);
  const top = Math.max(0, ...d.floors);
  const ground = d.floors.includes(0);
  const setFloors = (n: number, g: boolean) => edit((x) => { x.floors = [...(g ? [0] : []), ...Array.from({ length: n }, (_, i) => i + 1)]; });
  const bs = d.buildings.length ? d.buildings : ["main"];
  return (
    <Q title={t("কোথায় আছে?", "Where are they?")} why={t("তালিকা থেকে বাছাই করুন — রুম নম্বর এখান থেকে আপনা-আপনি তৈরি হবে।", "Pick from the lists — room numbers are made from this automatically.")}>
      {floorTypes && (
        <div className="space-y-5">
          <div>
            <p className="text-[15.5px] font-semibold">{t("কোন বিল্ডিং?", "Which building?")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {BUILDINGS.map((b) => {
                const on = bs.includes(b.id);
                const lock = on && bUsed(b.id);
                return <Chip key={b.id} on={on} disabled={lock} title={lock ? t("এখানে রুম আছে", "Has rooms") : undefined} onClick={() => edit((x) => { const cur = x.buildings.length ? x.buildings : ["main"]; const nx = cur.includes(b.id) ? cur.filter((y) => y !== b.id) : [...cur, b.id]; x.buildings = nx.length ? nx : ["main"]; })}><Building2 className="size-4" aria-hidden />{t(b.bn, b.en)}</Chip>;
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#c6ccd4] bg-white p-4">
            <span className="grid size-12 place-items-center rounded-xl bg-[#ffe7e4] text-[#b11c29]"><Building className="size-6" /></span>
            <div className="min-w-0 flex-1"><p className="text-[16px] font-semibold">{t("কয় তলায় রুম আছে?", "How many floors have rooms?")}</p><p className="text-[13.5px] text-[#4d5664]">{top ? t(`১ম থেকে ${floorLabel(top, true)}`, `1st to ${floorLabel(top, false)}`) : t("এখনো বাছাই হয়নি", "Not chosen yet")}</p></div>
            <Stepper label={t("তলা", "Floors")} value={top} set={(n) => setFloors(Math.max(n, minTop), ground)} min={Math.max(1, minTop)} max={MAX_FLOOR} />
          </div>
          <div className="rounded-xl border border-[#c6ccd4] bg-white p-4">
            <label className="flex items-center gap-3 text-[16px] font-semibold"><input type="checkbox" checked={ground} disabled={groundUsed} onChange={(e) => setFloors(Math.max(top, 1), e.target.checked)} className="size-5 accent-[#b11c29]" />{t("নিচতলায়ও রুম আছে", "Rooms on the ground floor too")}</label>
            {ground && <div className="mt-3 flex flex-wrap items-center gap-2 pl-8"><span className="text-[14px] text-[#4d5664]">{t("নম্বর:", "Numbers:")}</span><Chip on={d.ground === "G"} onClick={() => edit((x) => { x.ground = "G"; })}>G01, G02…</Chip><Chip on={d.ground === "0"} onClick={() => edit((x) => { x.ground = "0"; })}>001, 002…</Chip></div>}
          </div>
          {top > 0 && <p className="text-[14px] text-[#4d5664]">{t("নম্বর এমন হবে:", "Numbers will look like:")} <b className="font-mono text-[#0f1720]">{[ground ? (d.ground === "G" ? "G01" : "001") : null, "101", "102", top > 1 ? `${top}01` : null].filter(Boolean).join(", ")}…</b>{bs.length > 1 && <> · <b className="font-mono text-[#0f1720]">A-101</b></>}</p>}
        </div>
      )}
      {zoneTypes && (
        <div className={clsx(floorTypes && "mt-7")}>
          <p className="text-[15.5px] font-semibold">{t("কটেজ/ভিলা কোন জায়গায়?", "Where are the cottages / villas?")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ZONES.map((z) => { const on = d.zones.includes(z.id); const lock = on && zUsed(z.id); return <Chip key={z.id} on={on} disabled={lock} onClick={() => edit((x) => { x.zones = x.zones.includes(z.id) ? x.zones.filter((y) => y !== z.id) : [...x.zones, z.id]; })}><Trees className="size-4" aria-hidden />{t(z.bn, z.en)}</Chip>; })}
          </div>
          <p className="mt-3 text-[14px] text-[#4d5664]">{t("নম্বর:", "Numbers:")} <b className="font-mono text-[#0f1720]">{d.stay.filter((s) => STAY.find((x) => x.id === s)?.where === "zone").map((s) => `${STAY.find((x) => x.id === s)!.prefix}01`).join(", ")}…</b></p>
        </div>
      )}
      {!floorTypes && !zoneTypes && <p className="text-[15px] text-[#4d5664]">{t("আগের ধাপে কী ভাড়া দেন বাছাই করুন।", "Choose what you rent in the previous step.")}</p>}
      <p className="sr-only">{num(st.units.length, lang)}</p>
    </Q>
  );
}

// ---------- 2.3 Room types, one after another ----------
const AM_ICON: Record<string, typeof Wifi> = {
  "Free Wi-Fi": Wifi, "Air conditioning": AirVent, Fan: Fan, "Hot water": Flame, "Smart TV": Tv, "Attached bathroom": Bath, "Rain shower": ShowerHead, Toiletries: Sparkles,
  "Tea & coffee": Coffee, Minibar: Wine, Fridge: Refrigerator, Balcony: Armchair, "Sea view": Waves, "Garden view": Trees, "Hill view": Mountain, "Work desk": Laptop,
  "Hair dryer": Wind, Parking: Car, "Wheelchair access": Accessibility, Kitchenette: CookingPot, "Living room": Sofa, Safe: Lock,
};
const AM_BN: Record<string, string> = {
  "Free Wi-Fi": "ফ্রি ওয়াই-ফাই", "Air conditioning": "এসি", Fan: "ফ্যান", "Hot water": "গরম পানি", "Smart TV": "স্মার্ট টিভি", "Attached bathroom": "অ্যাটাচড বাথরুম", "Rain shower": "রেইন শাওয়ার",
  Toiletries: "টয়লেট্রিজ", "Tea & coffee": "চা ও কফি", Minibar: "মিনিবার", Fridge: "ফ্রিজ", Balcony: "বারান্দা", "Sea view": "সমুদ্র দেখা যায়", "Garden view": "বাগান দেখা যায়",
  "Hill view": "পাহাড় দেখা যায়", "Work desk": "কাজের টেবিল", "Hair dryer": "হেয়ার ড্রায়ার", Parking: "পার্কিং", "Wheelchair access": "হুইলচেয়ার", Kitchenette: "ছোট রান্নাঘর", "Living room": "বসার ঘর", Safe: "লকার",
};
const TOP_AM = ["Free Wi-Fi", "Air conditioning", "Fan", "Hot water", "Smart TV", "Attached bathroom", "Tea & coffee", "Fridge", "Balcony", "Sea view", "Work desk", "Parking"];
type Meal = "none" | "included" | "extra";
type Form = { core: CoreType; name: string; kind: string; bed: string; price: string; guests: number; size?: number; picks: Pick[]; amen: string[]; breakfast: Meal; lunch: Meal };

export function RoomTypes({ d, rooms }: { d: Draft; rooms: Rooms }) {
  const { t, lang } = useL();
  const [form, setFormState] = useState<Form | null>(null);
  const { setOpen } = useContext(FormSlot);
  const setForm = (f: Form | null) => { setFormState(f); setOpen(!!f); };
  const st = rooms.st;
  const cats = st.categories.filter((c) => !c.archived);
  const live = st.units.filter((u) => u.status !== "archived");
  const start = () => setForm({ core: (d.stay[0] ?? "ROOM") as CoreType, name: "", kind: "double", bed: "1 Double bed", price: "", guests: 2, picks: [], amen: ["Free Wi-Fi", "Air conditioning", "Hot water", "Attached bathroom"], breakfast: "none", lunch: "none" });
  const remove = (c: Category) => {
    if (!window.confirm(t(`"${c.name}" আর এর সব রুম মুছে ফেলবেন?`, `Remove "${c.name}" and its rooms?`))) return;
    rooms.update((s) => { s.categories = s.categories.filter((x) => x.id !== c.id); s.units = s.units.filter((u) => u.category !== c.id); }, `Room type ${c.name} removed in onboarding`);
  };
  if (form) return <TypeForm d={d} rooms={rooms} form={form} setForm={setForm} onDone={() => setForm(null)} />;
  return (
    <Q title={t("রুমের ধরন যোগ করুন", "Add your room types")} sub={t("একটা একটা করে যোগ করুন — যেমন ডিলাক্স, তারপর স্যুট।", "Add them one by one — e.g. Deluxe, then Suite.")} why={t("প্রতিটা ধরনের দাম, অতিথি আর সুবিধা একবার দিন; তারপর তালিকা থেকে রুম নম্বর বাছুন।", "Set price, guests and amenities once per type, then pick room numbers from the list.")}>
      {cats.length > 0 && (
        <ul className="mb-4 grid gap-3">
          {cats.map((c) => {
            const us = live.filter((u) => u.category === c.id);
            const I = STAY_ICON[c.core];
            return (
              <li key={c.id} className="onb-in flex gap-3 rounded-xl border border-[#c6ccd4] bg-white p-3.5">
                <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#fdecea] to-[#e9edf2] text-[#b11c29]"><I className="size-8" /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-[16.5px] font-semibold">{c.name}<span className="text-[13px] font-medium text-[#4d5664]">{t(ROOM_KINDS.find((k) => k.id === c.roomKind)?.bn ?? "", ROOM_KINDS.find((k) => k.id === c.roomKind)?.en ?? "")}</span></p>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 text-[13.5px] text-[#4d5664]"><span className="inline-flex items-center gap-1"><UsersRound className="size-3.5" />{num(c.maxAdults, lang)}</span><span className="inline-flex items-center gap-1"><BedDouble className="size-3.5" />{t(BEDS.find((b) => b.id === c.bed)?.bn ?? c.bed, BEDS.find((b) => b.id === c.bed)?.en ?? c.bed)}</span><span className="font-semibold text-[#8e1621]">৳{num(money(c.baseRate), lang)} / {t("রাত", "night")}</span></p>
                  <p className="mt-1.5 flex flex-wrap gap-1">{us.slice(0, 12).map((u) => <span key={u.id} className="rounded-lg bg-[#e9edf2] px-1.5 py-0.5 font-mono text-[12.5px] font-semibold">{u.code}</span>)}{us.length > 12 && <span className="text-[12.5px] text-[#4d5664]">+{num(us.length - 12, lang)}</span>}</p>
                </div>
                <button onClick={() => remove(c)} aria-label={t(`${c.name} মুছুন`, `Remove ${c.name}`)} className="grid size-10 shrink-0 place-items-center self-start rounded-full text-[#4d5664] hover:bg-[#fff1f0] hover:text-[#8e1621]"><Trash2 className="size-[18px]" /></button>
              </li>
            );
          })}
        </ul>
      )}
      <button onClick={start} className="flex w-full items-center gap-4 rounded-xl border border-dashed border-[#efb7b1] bg-[#fffaf9] p-4 text-left transition-colors hover:bg-[#fff4f3]">
        <span className="grid size-12 place-items-center rounded-xl bg-[#b11c29] text-white"><Plus className="size-6" /></span>
        <span><span className="block text-[17px] font-semibold">{cats.length ? t("আরেকটা ধরন যোগ করুন", "Add another room type") : t("প্রথম রুমের ধরন যোগ করুন", "Add your first room type")}</span><span className="text-[14px] text-[#4d5664]">{t("৪টা ছোট ধাপ · ১ মিনিট", "4 short steps · 1 minute")}</span></span>
        <ChevronRight className="ml-auto size-5 text-[#b11c29]" />
      </button>
      {cats.length > 0 && <p className="mt-3 text-[14px] text-[#4d5664]">{t(`মোট ${num(live.length, lang)}টা রুম। সব যোগ হলে "এগিয়ে যান" চাপুন।`, `${live.length} rooms in total. Press "Continue" when you're done.`)}</p>}
    </Q>
  );
}

function TypeForm({ d, rooms, form: f, setForm, onDone }: { d: Draft; rooms: Rooms; form: Form; setForm: (f: Form | null) => void; onDone: () => void }) {
  const { t, lang } = useL();
  const [card, setCard] = useState(0);
  const [tried, setTried] = useState(false);
  const [sheet, setSheet] = useState<LocNode | null>(null);
  const [allAm, setAllAm] = useState(false);
  const [conf, setConf] = useState<string[]>([]);
  const set = (p: Partial<Form>) => setForm({ ...f, ...p });
  const { slot } = useContext(FormSlot);
  const st = rooms.st;
  const stay = STAY.find((s) => s.id === f.core)!;
  // keep the config in step with the presets (if the owner came straight here)
  const config = st.config.configured ? st.config : configFrom(d, st.config);
  const places = config.nodes.filter((n) => (stay.where === "floor" ? n.kind === "FLOOR" : n.kind === "ZONE"));
  const taken = new Set(st.units.map((u) => u.code.toUpperCase()));
  const price = Number(f.price) || 0;
  const vat = d.policy.vat, sc = d.policy.sc;
  const final = Math.round(price * (1 + vat / 100 + sc / 100));
  const typeName = (n: { bn: string; en: string }) => (f.core === "ROOM" ? t(n.bn, n.en) : `${t(n.bn, n.en)} ${t(stay.bn, stay.en.replace(/s$/, ""))}`);
  const errs = [
    card === 0 && !f.name.trim() ? t("একটা নাম বাছাই করুন।", "Choose a name.") : "",
    card === 0 && rooms.st.categories.some((c) => !c.archived && c.name.toLowerCase() === f.name.trim().toLowerCase()) ? t("এই নামের ধরন আগেই আছে।", "A type with this name already exists.") : "",
    card === 1 && !(price > 0) ? t("প্রতি রাতের দাম দিন।", "Enter the price per night.") : "",
    card === 2 && !f.picks.length ? t("কমপক্ষে একটা রুম নম্বর বাছুন।", "Pick at least one room number.") : "",
  ].filter(Boolean);
  const nextCard = () => { if (errs.length) { setTried(true); return; } setTried(false); setCard((c) => c + 1); };
  const save = () => {
    const cat: Category = {
      id: uid("cat"), name: f.name.trim(), core: f.core, preset: stay.preset, bed: f.bed, maxAdults: f.guests, maxChildren: 0, sizeSqft: f.size, amenities: f.amen,
      baseRate: price, created: new Date().toISOString(), approval: "pending", roomKind: f.kind, meals: { breakfast: f.breakfast, lunch: f.lunch },
    };
    if (!st.config.configured) rooms.update((s) => { s.config = configFrom(d, s.config); }, "Accommodation set up from onboarding presets");
    const r = rooms.createUnits(f.picks, cat, "draft");
    if (!r.ok) { setConf(r.conflicts); return; }
    onDone();
  };
  const cards = [t("ধরন", "Type"), t("দাম ও অতিথি", "Price & guests"), t("রুম নম্বর", "Room numbers"), t("সুবিধা ও খাবার", "Amenities & meals")];
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[24px] font-semibold leading-tight sm:text-[28px]">{f.name || t("নতুন রুমের ধরন", "New room type")}</h1>
        <button onClick={() => setForm(null)} className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-[14.5px] font-medium text-[#4d5664] hover:bg-[#e9edf2]"><X className="size-4" />{t("বাতিল", "Cancel")}</button>
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-label={t("ধাপ", "Steps")}>
        {cards.map((c, i) => (
          <li key={c}><button onClick={() => i < card && setCard(i)} aria-current={i === card ? "step" : undefined} className="w-full text-left">
            <span className={clsx("block h-1.5 rounded-full transition-colors", i <= card ? "bg-[#b11c29]" : "bg-[#e3e7ec]")} />
            <span className={clsx("mt-1.5 block truncate text-[12.5px] font-semibold", i === card ? "text-[#8e1621]" : "text-[#4d5664]")}>{c}</span>
          </button></li>
        ))}
      </ol>
      <div className="mt-5">
        {tried && <Errors list={errs} />}
        {conf.length > 0 && <Errors list={[t("কিছুই সেভ হয়নি:", "Nothing was saved:"), ...conf]} />}
        <div key={card} className="onb-in">
          {card === 0 && (
            <div className="space-y-5">
              {d.stay.length > 1 && <Group title={t("কোনটা?", "Which one?")}>{d.stay.map((s) => { const S = STAY.find((x) => x.id === s)!; const I = STAY_ICON[S.id]; return <Chip key={s} on={f.core === s} onClick={() => set({ core: s as CoreType, picks: [], name: "" })}><I className="size-4" aria-hidden />{t(S.bn, S.en)}</Chip>; })}</Group>}
              <Group title={t("নাম", "Name")}>{TYPE_NAMES.map((n) => { const v = typeName(n); return <Chip key={n.en} on={f.name === v} onClick={() => set({ name: v })}>{v}</Chip>; })}</Group>
              <Group title={t("রুমের ধরন", "Room kind")}>{ROOM_KINDS.map((k) => <Chip key={k.id} on={f.kind === k.id} onClick={() => set({ kind: k.id, guests: k.guests, bed: k.id === "single" ? "1 Single bed" : k.id === "twin" ? "2 Single beds" : f.bed })}>{t(k.bn, k.en)}</Chip>)}</Group>
              <Group title={t("বেড", "Bed")}>{BEDS.map((b) => <Chip key={b.id} on={f.bed === b.id} onClick={() => set({ bed: b.id })}><BedDouble className="size-4" aria-hidden />{t(b.bn, b.en)}</Chip>)}</Group>
            </div>
          )}
          {card === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="price" className="text-[15.5px] font-semibold">{t("প্রতি রাতের দাম", "Price per night")}</label>
                <div className="mt-2 flex items-center gap-2"><span className="text-[24px] font-semibold text-[#8e1621]">৳</span><input id="price" inputMode="numeric" value={f.price} onChange={(e) => set({ price: e.target.value.replace(/\D/g, "").slice(0, 7) })} placeholder="5000" className={field + " h-14 max-w-[220px] text-[22px] font-semibold"} /></div>
                <div className="mt-2 flex flex-wrap gap-2">{[2000, 3500, 5000, 8000, 12000].map((v) => <Chip key={v} on={price === v} onClick={() => set({ price: String(v) })}>৳{num(money(v), lang)}</Chip>)}</div>
                {price > 0 && <p className="mt-3 rounded-xl bg-[#e9edf2] px-4 py-2.5 text-[14.5px]">{t("গেস্ট দেবে", "Guest pays")} <b>৳{num(money(final), lang)}</b> <span className="text-[#4d5664]">({t("ভ্যাট", "VAT")} {num(vat, lang)}% + {t("সার্ভিস", "service")} {num(sc, lang)}%)</span></p>}
              </div>
              <div className="flex flex-wrap items-center gap-4"><p className="flex items-center gap-2 text-[15.5px] font-semibold"><UsersRound className="size-5 text-[#b11c29]" />{t("সর্বোচ্চ অতিথি", "Max guests")}</p><Stepper label={t("অতিথি", "Guests")} value={f.guests} set={(n) => set({ guests: n })} min={1} max={12} /></div>
              <Group title={t("রুমের মাপ (ঐচ্ছিক)", "Room size (optional)")}>{SIZES.map((s) => <Chip key={s} on={f.size === s} onClick={() => set({ size: f.size === s ? undefined : s })}>{num(s, lang)} {t("বর্গফুট", "sq ft")}</Chip>)}</Group>
            </div>
          )}
          {card === 2 && (
            <div>
              <p className="text-[15.5px] font-semibold">{stay.where === "floor" ? t("আগে তলা বাছুন, তারপর নম্বর", "Pick a floor, then the numbers") : t("আগে জায়গা বাছুন, তারপর নম্বর", "Pick a place, then the numbers")}</p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {places.map((p) => {
                  const list = presetNumbers(config, p, f.core, d.ground);
                  const free = list.filter((x) => !taken.has(x.code.toUpperCase())).length;
                  const mine = f.picks.filter((x) => x.node === p.id).length;
                  return (
                    <button key={p.id} onClick={() => setSheet(p)} className={clsx("flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors", mine ? "border-[#0f1720] bg-white shadow-[inset_0_0_0_1px_#0f1720]" : "border-[#c6ccd4] bg-white hover:border-[#d5d8e0]")}>
                      <span className="min-w-0 flex-1"><span className="block text-[15.5px] font-semibold">{placeName(p, config, lang)}</span><span className="text-[13px] text-[#4d5664]">{t(`${num(free, lang)}টা খালি`, `${free} free`)}{mine ? t(` · ${num(mine, lang)}টা বাছাই`, ` · ${mine} picked`) : ""}</span></span>
                      <span className="inline-flex h-9 items-center gap-1 rounded-full border border-[#f3c9c5] px-3 text-[13.5px] font-semibold text-[#b11c29]"><Plus className="size-4" />{t("রুম দেখুন", "View rooms")}</span>
                    </button>
                  );
                })}
              </div>
              {f.picks.length > 0 && (
                <div className="mt-4">
                  <p className="text-[14px] font-semibold text-[#4d5664]">{t(`বাছাই করা ${num(f.picks.length, lang)}টা`, `${f.picks.length} picked`)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">{f.picks.map((p) => (
                    <span key={p.code} className="inline-flex items-center gap-1 rounded-xl bg-[#e9edf2] py-1 pl-2.5 pr-1 font-mono text-[14px] font-semibold">{p.code}<button aria-label={t(`${p.code} বাদ দিন`, `Remove ${p.code}`)} onClick={() => set({ picks: f.picks.filter((x) => x.code !== p.code) })} className="grid size-6 place-items-center rounded-lg hover:bg-white"><X className="size-3.5" /></button></span>
                  ))}</div>
                </div>
              )}
              {sheet && <NumberSheet place={sheet} name={placeName(sheet, config, lang)} list={presetNumbers(config, sheet, f.core, d.ground)} taken={taken} picks={f.picks} onClose={(picks) => { set({ picks }); setSheet(null); }} />}
            </div>
          )}
          {card === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-[15.5px] font-semibold">{t("রুমে কী কী সুবিধা আছে?", "What's in the room?")}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(allAm ? AMENITIES.flatMap((g) => g.items) : TOP_AM).map((a) => {
                    const I = AM_ICON[a] ?? Sparkles; const on = f.amen.includes(a);
                    return (
                      <button key={a} type="button" aria-pressed={on} onClick={() => set({ amen: on ? f.amen.filter((x) => x !== a) : [...f.amen, a] })}
                        className={clsx("flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[14px] font-semibold transition-colors", on ? "border-[#0f1720] bg-white shadow-[inset_0_0_0_1px_#0f1720]" : "border-[#c6ccd4] bg-white")}>
                        <span className={clsx("grid size-8 shrink-0 place-items-center rounded-xl", on ? "bg-[#b11c29] text-white" : "bg-[#ffe7e4] text-[#b11c29]")}>{on ? <Check className="size-4" /> : <I className="size-4" />}</span>
                        <span className="min-w-0 truncate">{t(AM_BN[a] ?? a, a)}</span>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setAllAm((x) => !x)} className="mt-2 text-[14.5px] font-semibold text-[#b11c29]">{allAm ? t("কম দেখান", "Show fewer") : t("সব সুবিধা দেখুন", "See all amenities")}</button>
              </div>
              <div>
                <p className="text-[15.5px] font-semibold">{t("খাবার", "Meals")}</p>
                {(["breakfast", "lunch"] as const).map((m) => (
                  <div key={m} className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#c6ccd4] bg-white px-4 py-2.5">
                    <span className="text-[15px] font-semibold">{m === "breakfast" ? t("নাশতা", "Breakfast") : t("দুপুরের খাবার", "Lunch")}</span>
                    <div role="radiogroup" aria-label={m} className="flex rounded-full bg-[#e9edf2] p-1">
                      {([["none", "নেই", "None"], ["included", "সাথে আছে", "Included"], ["extra", "আলাদা দামে", "Extra"]] as const).map(([v, bn, en]) => <button key={v} role="radio" aria-checked={f[m] === v} onClick={() => set({ [m]: v } as Partial<Form>)} className={clsx("h-9 rounded-full px-3 text-[13.5px] font-semibold", f[m] === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{t(bn, en)}</button>)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="rounded-xl bg-[#e9edf2] px-4 py-3 text-[14px] text-[#4d5664]">{t("ছবি পরে HMS → রুম থেকে যোগ করবেন।", "Add photos later in HMS → Rooms.")}</p>
            </div>
          )}
        </div>
        {slot && createPortal(
          <div className="flex items-center gap-2">
            {card > 0 ? <button onClick={() => { setTried(false); setCard((c) => c - 1); }} className="-ml-2 inline-flex h-11 items-center rounded-xl px-2 text-[15px] font-medium hover:bg-[#e9edf2]">← {t("আগের", "Back")}</button> : <button onClick={() => setForm(null)} className="-ml-2 inline-flex h-11 items-center rounded-xl px-2 text-[15px] font-medium hover:bg-[#e9edf2]">{t("বাতিল", "Cancel")}</button>}
            <div className="ml-auto">{card < 3 ? <Primary onClick={nextCard}>{t("পরের", "Next")} <ChevronRight className="size-[18px]" /></Primary> : <Primary onClick={save}><Check className="size-[18px]" />{t(`সেভ করুন (${num(f.picks.length, lang)}টা রুম)`, `Save (${f.picks.length} rooms)`)}</Primary>}</div>
          </div>, slot)}
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return <div><p className="text-[15.5px] font-semibold">{title}</p><div className="mt-2 flex flex-wrap gap-2">{children}</div></div>;
}
function placeName(p: LocNode, c: { nodes: LocNode[] }, lang: "bn" | "en") {
  if (p.kind === "FLOOR") {
    const b = c.nodes.find((n) => n.id === p.parent);
    const multi = c.nodes.filter((n) => n.kind === "BUILDING" || n.kind === "TOWER").length > 1;
    const bb = BUILDINGS.find((x) => `b-${x.id}` === b?.id);
    return `${multi && bb ? (lang === "bn" ? bb.bn : bb.en) + " · " : ""}${floorLabel(p.level ?? 0, lang === "bn")}`;
  }
  const z = ZONES.find((x) => `z-${x.id}` === p.id);
  return z ? (lang === "bn" ? z.bn : z.en) : nodePath(c as never, p.id);
}

/** Tap numbers on one floor / zone (live HMS: "3rd Floor Rooms — select multiple rooms at once"). */
function NumberSheet({ place, name, list, taken, picks, onClose }: { place: LocNode; name: string; list: { local: string; code: string }[]; taken: Set<string>; picks: Pick[]; onClose: (p: Pick[]) => void }) {
  const { t, lang } = useL();
  const [sel, setSel] = useState<Pick[]>(picks);
  const [q, setQ] = useState("");
  const here = sel.filter((x) => x.node === place.id).length;
  const shown = list.filter((x) => x.code.toLowerCase().includes(q.toLowerCase()));
  const nextFree = (n: number) => { const add: Pick[] = []; for (const x of list) { if (add.length >= n) break; if (!taken.has(x.code.toUpperCase()) && !sel.some((s) => s.code === x.code)) add.push({ node: place.id, local: x.local, code: x.code }); } setSel([...sel, ...add]); };
  return createPortal(
    <div className="bingi-ui fixed inset-0 z-50 flex items-end justify-center bg-[#0f1720]/15 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={() => onClose(sel)}>
      <div role="dialog" aria-modal="true" aria-label={name} onClick={(e) => e.stopPropagation()} className="onb-in flex max-h-[92dvh] w-full max-w-[680px] flex-col rounded-t-xl bg-white shadow-2xl sm:rounded-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#e9edf2] px-5 py-4">
          <div><h2 className="text-[18px] font-semibold">{name}</h2><p className="text-[13.5px] text-[#4d5664]">{t("একসাথে অনেকগুলো চাপুন", "Tap several at once")}</p></div>
          <button onClick={() => onClose(sel)} aria-label={t("বন্ধ করুন", "Close")} className="grid size-9 place-items-center rounded-full border border-[#c6ccd4]"><X className="size-5" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
          <input aria-label={t("নম্বর খুঁজুন", "Search numbers")} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("নম্বর খুঁজুন", "Search")} className={field + " h-11 min-w-0 flex-1 basis-[160px] text-[15px]"} />
          {[5, 10].map((n) => <Ghost key={n} onClick={() => nextFree(n)} className="h-11">+{num(n, lang)} {t("পরপর", "in a row")}</Ghost>)}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-y-auto p-5 sm:grid-cols-5">
          {shown.map((x) => {
            const used = taken.has(x.code.toUpperCase());
            const on = sel.some((s) => s.code === x.code);
            return (
              <button key={x.code} disabled={used} aria-pressed={on} onClick={() => setSel(on ? sel.filter((s) => s.code !== x.code) : [...sel, { node: place.id, local: x.local, code: x.code }])}
                className={clsx("h-12 rounded-xl font-mono text-[15px] font-semibold transition-colors", used ? "cursor-not-allowed bg-[#e3e7ec] text-[#a3a8b4] line-through" : on ? "bg-[#b11c29] text-white " : "bg-[#e9edf2] hover:bg-[#ffe7e4]")}>{x.code}</button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 border-t border-[#e9edf2] px-5 py-3.5">
          <span className="text-[14px] text-[#4d5664]">{t(`এখানে ${num(here, lang)}টা বাছাই`, `${here} picked here`)}</span>
          <Primary onClick={() => onClose(sel)} className="ml-auto">{t("ঠিক আছে", "Done")}</Primary>
        </div>
      </div>
    </div>,
    document.body,

  );
}
