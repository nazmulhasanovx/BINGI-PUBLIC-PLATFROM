"use client";
// Room / Accommodation — room types first, the way the live HMS Rooms page works (photo cards, availability KPIs,
// one filter bar, grid/list), on top of the prototype rooms store. Room numbers and Setup stay as their own tabs.
import { imgSrc } from "@/lib/img";
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Check, ImagePlus, LayoutGrid, List, Maximize2, Pencil, Plus, Search, Users, Wrench, X } from "lucide-react";
import { useProperty } from "../property";
import { HOTEL_TAX, priceBreak, taxOf, useRooms, type Category, type MealMode, type RoomsState, type Unit } from "@/lib/rooms/store";
import { CORE, preset as presetOf, youtubeId } from "@/lib/rooms/catalog";
import { Area, Btn, Drawer, Empty, Field, Input, Menu } from "../staff/ui";
import { AmenityPicker, PRESET_ICON, RoomsFrame, money, useToast } from "./parts";
import { UnitDrawer } from "./pages";
import { STATE, useUnitStates, type UnitState } from "./state";
import { PhotoButton } from "../photo";

type Filter = "all" | "available" | "full" | "ooo" | "draft";
export function RoomTypesPage() {
  const h = useProperty();
  const { st } = useRooms(h);
  const state = useUnitStates(st);
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filter>("all");
  const [kind, setKind] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [edit, setEdit] = useState<string | null>(null);
  const [unit, setUnit] = useState<string | null>(null);

  const inUse = st.units.filter((u) => u.status !== "archived");
  const published = st.units.filter((u) => u.status === "published");
  const count = (s: UnitState) => st.units.filter((u) => state.get(u.id) === s).length;
  const types = st.categories.filter((c) => !c.archived);
  const drafts = st.units.filter((u) => u.status === "draft").length;
  const kinds = [...new Set(types.map((c) => c.preset))];
  const unitsOf = (c: Category) => st.units.filter((u) => u.category === c.id && u.status !== "archived").sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  const list = types.filter((c) => {
    const us = unitsOf(c);
    const n = (s: UnitState) => us.filter((u) => state.get(u.id) === s).length;
    const okF = f === "all" || (f === "available" && n("available") > 0) || (f === "full" && us.length > 0 && n("booked") > 0 && n("available") === 0) || (f === "ooo" && n("ooo") > 0) || (f === "draft" && n("draft") > 0);
    const text = `${c.name} ${presetOf(c.preset).label} ${c.bed} ${us.map((u) => u.code).join(" ")} ${c.amenities.join(" ")}`.toLowerCase();
    return okF && (kind === "all" || c.preset === kind) && (!q || text.includes(q.trim().toLowerCase()));
  });
  const c = edit ? st.categories.find((x) => x.id === edit) : undefined;
  const u = unit ? st.units.find((x) => x.id === unit) : undefined;

  return (
    <RoomsFrame tab="types">
      <p className="rounded-xl border border-[#cfe7da] bg-[#eef8f2] px-4 py-2.5 text-[14px] font-medium text-[#165f37]">
        Rooms in use: {inUse.length} <span className="font-normal text-[#2f6b4b]">· package limit comes from Billing (not connected in this prototype)</span>
      </p>
      {(st.excluded?.length ?? 0) > 0 && (
        <section role="status" className="mt-3 rounded-2xl border border-[#d8dcf0] bg-[#f5f6fd] p-4 text-[14px]">
          <p className="font-semibold">Not in this release</p>
          <ul className="mt-1 space-y-0.5 text-[#4d5664]">{st.excluded!.map((x) => <li key={x.name}><b>{x.name}</b> — {x.reason}</li>)}</ul>
        </section>
      )}
      {(drafts > 0 || st.drafts.length > 0) && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 rounded-xl border border-[#f1dfb8] bg-[#fffaf0] px-4 py-2.5 text-[14px] text-[#7a4a0b]">
          <span className="flex-1">{drafts > 0 && `${drafts} draft room${drafts > 1 ? "s" : ""} not bookable yet`}{drafts > 0 && st.drafts.length > 0 && " · "}{st.drafts.length > 0 && `${st.drafts.length} unfinished addition${st.drafts.length > 1 ? "s" : ""}`}</span>
          <Link href="/hms/rooms/numbers" className="font-semibold text-[#b11c29]">Review in Room numbers</Link>
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={BedDouble} tone="bg-[#ffe7e4] text-[#b11c29]" value={published.length} label="Total rooms" sub="Published, can be sold" />
        <Kpi icon={Check} tone="bg-[#e7f6ec] text-[#1c7d45]" value={count("available")} label="Available tonight" onClick={() => setF("available")} />
        <Kpi icon={Users} tone="bg-[#e6efff] text-[#2457c5]" value={count("booked")} label="Booked tonight" onClick={() => setF("full")} />
        <Kpi icon={Wrench} tone="bg-[#fdf3d9] text-[#8a5300]" value={count("ooo")} label="Out of order" sub="Maintenance" onClick={() => setF("ooo")} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#e3e7ec] bg-white p-3">
        <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-[#d3d8df] bg-white px-3.5 focus-within:border-[#b11c29]">
          <Search className="size-[18px] text-[#4d5664]" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search room number, name, amenity" aria-label="Search room types" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#7b8190]" />
        </label>
        <select aria-label="Status" value={f} onChange={(e) => setF(e.target.value as Filter)} className="h-11 rounded-xl border border-[#d3d8df] bg-white px-3 text-[14.5px]">
          <option value="all">All status</option><option value="available">Has rooms free tonight</option><option value="full">Fully booked tonight</option><option value="ooo">Has out of order</option><option value="draft">Has drafts</option>
        </select>
        {kinds.length > 1 && (
          <select aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value)} className="h-11 rounded-xl border border-[#d3d8df] bg-white px-3 text-[14.5px]">
            <option value="all">All types</option>{kinds.map((k) => <option key={k} value={k}>{presetOf(k).label}</option>)}
          </select>
        )}
        <div role="radiogroup" aria-label="View" className="flex rounded-xl border border-hms-line bg-white p-1">
          {([["grid", LayoutGrid, "Grid"], ["list", List, "List"]] as const).map(([v, I, l]) => (
            <button key={v} role="radio" aria-checked={view === v} aria-label={`${l} view`} onClick={() => setView(v)} className={clsx("grid size-9 place-items-center rounded-lg", view === v ? "bg-[#ffecec] text-[#c8232e]" : "text-[#4d5664] hover:text-hms-ink")}><I className="size-[18px]" /></button>
          ))}
        </div>
      </div>

      {(f !== "all" || kind !== "all" || q) && <p className="mt-3 text-[14px] text-[#4d5664]">{list.length} of {types.length} room types · <button onClick={() => { setF("all"); setKind("all"); setQ(""); }} className="font-semibold text-[#b11c29]">Clear filters</button></p>}

      {!types.length ? (
        <div className="mt-4 rounded-2xl border border-[#e3e7ec] bg-white"><Empty icon={<BedDouble className="size-6" />} title="No room types yet" text="Add a room type with its price and room numbers." action={<Link href="/hms/rooms/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#b11c29] px-4 text-[14.5px] font-medium text-white"><Plus className="size-4" /> Add room type</Link>} /></div>
      ) : !list.length ? (
        <p className="mt-4 rounded-2xl border border-[#e3e7ec] bg-white p-8 text-center text-[15px] text-[#4d5664]">No room type matches these filters.</p>
      ) : (
        <ul className={clsx("mt-4 grid gap-4", view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1")}>
          {list.map((x) => <TypeCard key={x.id} c={x} units={unitsOf(x)} canArchive={st.units.some((u) => u.category === x.id) && st.units.filter((u) => u.category === x.id).every((u) => u.status === "archived")} state={state} view={view} onEdit={() => setEdit(x.id)} onUnit={setUnit} />)}
        </ul>
      )}
      {c && <RoomTypeDrawer st={st} c={c} state={state} onClose={() => setEdit(null)} onUnit={(id) => { setEdit(null); setUnit(id); }} />}
      {u && <UnitDrawer st={st} u={u} onClose={() => setUnit(null)} />}
    </RoomsFrame>
  );
}

function Kpi({ icon: I, tone, value, label, sub, onClick }: { icon: typeof BedDouble; tone: string; value: number; label: string; sub?: string; onClick?: () => void }) {
  const body = (
    <>
      <span className={clsx("grid size-11 shrink-0 place-items-center rounded-xl", tone)}><I className="size-5" aria-hidden /></span>
      <span className="min-w-0"><b className="block text-[24px] leading-tight tabular-nums">{value}</b><span className="block text-[14px] font-medium">{label}</span>{sub && <span className="block text-[12.5px] text-[#4d5664]">{sub}</span>}</span>
    </>
  );
  const cls = "flex items-center gap-3 rounded-2xl border border-[#e3e7ec] bg-white p-4 text-left";
  return onClick ? <button onClick={onClick} className={clsx(cls, "transition-colors hover:border-[#858c97]")}>{body}</button> : <div className={cls}>{body}</div>;
}

function Photo({ c, className }: { c: Category; className?: string }) {
  const Icon = PRESET_ICON[c.preset];
  return c.photo
    ? <img src={imgSrc(c.photo)} alt="" className={clsx("object-cover", className)} />
    : <span className={clsx("grid place-items-center bg-[#e9edf2] text-[#7b8190]", className)}><Icon className="size-10" aria-hidden /></span>;
}

function TypeCard({ c, units, canArchive, state, view, onEdit, onUnit }: { c: Category; units: Unit[]; canArchive: boolean; state: Map<string, UnitState>; view: "grid" | "list"; onEdit: () => void; onUnit: (id: string) => void }) {
  const router = useRouter();
  const h = useProperty();
  const { update } = useRooms(h);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const n = (s: UnitState) => units.filter((u) => state.get(u.id) === s).length;
  const sellable = units.length - n("draft");
  const p = priceBreak(c.baseRate, taxOf(c));
  const badge = c.approval !== "approved" ? { t: "Waiting for approval", cls: "bg-[#fdf3d9] text-[#7a4a0b]" }
    : !sellable ? { t: "Draft · not bookable", cls: "bg-white/90 text-[#4d5664]" }
    : n("available") ? { t: `${n("available")} of ${sellable} available`, cls: "bg-[#1c7d45] text-white" }
    : n("booked") ? { t: "Fully booked tonight", cls: "bg-[#2457c5] text-white" }
    : { t: "Out of order", cls: "bg-[#b26a00] text-white" };
  const facts = [
    { I: Users, t: `${c.maxAdults} adult${c.maxAdults > 1 ? "s" : ""}${c.maxChildren ? ` + ${c.maxChildren} child${c.maxChildren > 1 ? "ren" : ""}` : ""}` },
    { I: BedDouble, t: c.bed || "—" },
    ...(c.sizeSqft ? [{ I: Maximize2, t: `${money(c.sizeSqft)} sq ft` }] : []),
  ];
  const shown = c.amenities.slice(0, view === "grid" ? 3 : 5);
  const list = view === "list";
  return (
    <li className={clsx("overflow-hidden rounded-2xl border border-[#e3e7ec] bg-white", list && "lg:flex")}>
      <div className={clsx("relative shrink-0", list ? "h-[180px] lg:h-auto lg:w-[260px]" : "h-[180px]")}>
        <Photo c={c} className="absolute inset-0 size-full" />
        <span className={clsx("absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold shadow-sm", badge.cls)}>{badge.t}</span>
        {n("ooo") > 0 && sellable > n("ooo") && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-[#fdf3d9] px-2 py-1 text-[12.5px] font-semibold text-[#7a4a0b]"><Wrench className="size-3.5" aria-hidden />{n("ooo")} out of order</span>}
      </div>
      <div className={clsx("flex min-w-0 flex-1 flex-col p-4", list && "xl:flex-row xl:gap-5")}>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold uppercase tracking-wide text-[#b11c29]">{presetOf(c.preset).label}{presetOf(c.preset).group !== "standard" ? ` · sold as ${CORE[c.core].label}` : ""}</p>
          <h2 className="mt-0.5 truncate text-[18px] font-bold">{c.name}</h2>
          <button onClick={() => setOpen((x) => !x)} aria-expanded={open} className="mt-0.5 max-w-full truncate text-left text-[13.5px] text-[#4d5664] hover:text-[#0f1720]">
            <b className="font-semibold text-[#0f1720]">{units.length} room{units.length === 1 ? "" : "s"}</b>{units.length ? `: ${units.slice(0, 6).map((u) => u.code).join(", ")}${units.length > 6 ? ` +${units.length - 6}` : ""}` : ""} <span className="font-semibold text-[#b11c29]">{open ? "Hide" : "See rooms"}</span>
          </button>
          {open && (
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${c.name} rooms`}>
              {units.map((u) => { const s = state.get(u.id) ?? "draft"; return (
                <li key={u.id}><button onClick={() => onUnit(u.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e7ec] px-2 py-1 text-[13px] hover:bg-[#f4f6f8]"><span aria-hidden className={clsx("size-2 rounded-full", STATE[s].dot)} /><span className="font-mono font-semibold">{u.code}</span><span className="sr-only">{STATE[s].label}</span></button></li>
              ); })}
            </ul>
          )}
          {c.approval !== "approved" && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-[#fdf6e7] px-3 py-2 text-[13px] text-[#7a4a0b]">
              <span className="flex-1">Waiting for BinGi approval — rooms stay drafts until approved.</span>
              <button onClick={() => { update((s) => { s.categories.find((y) => y.id === c.id)!.approval = "approved"; }, `Room type ${c.name} approved (demo of Superadmin approval)`); toast(`${c.name} approved (demo)`); }} className="font-semibold underline">Approve (BinGi demo)</button>
            </div>
          )}
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13.5px] text-[#2c333d]">
            {facts.map(({ I, t }) => <li key={t} className="flex min-w-0 items-center gap-1.5"><I className="size-4 shrink-0 text-[#b11c29]" aria-hidden /><span className="truncate">{t}</span></li>)}
          </ul>
          {shown.length > 0 && <p className="mt-3 flex flex-wrap gap-1.5">{shown.map((a) => <span key={a} className="rounded-md bg-[#f1f3f6] px-2 py-0.5 text-[12.5px] font-medium text-[#3a414c]">{a}</span>)}{c.amenities.length > shown.length && <span className="px-1 py-0.5 text-[12.5px] font-medium text-[#4d5664]">+{c.amenities.length - shown.length}</span>}</p>}
        </div>
        <div className={clsx("mt-4 flex items-end justify-between gap-3 border-t border-[#eef0f3] pt-3", list && "xl:mt-0 xl:w-[220px] xl:flex-col xl:items-stretch xl:justify-between xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0")}>
          <div>
            <p className="text-[22px] font-bold leading-tight text-[#b11c29] tabular-nums">৳{money(c.baseRate)}<span className="text-[13px] font-medium text-[#4d5664]"> /night</span></p>
            <p className="text-[12.5px] text-[#4d5664]">৳{money(p.total)} with service + VAT</p>
          </div>
          <div className="flex items-center gap-2">
            <Btn className="h-10" onClick={onEdit} aria-label={`Edit ${c.name}`}><Pencil className="size-4" aria-hidden />Edit</Btn>
            <Menu label={`More for ${c.name}`} items={[
              { label: "Add rooms to this type", onClick: () => router.push(`/hms/rooms/new?category=${c.id}`) },
              { label: "Prices by date", onClick: () => router.push("/hms/discounts") },
              { label: "See room numbers", onClick: () => setOpen(true) },
              ...(canArchive ? [{ label: "Archive type", danger: true, onClick: () => { update((s) => { s.categories.find((y) => y.id === c.id)!.archived = true; }, `Room type ${c.name} archived`); toast(`${c.name} archived`); } }] : []),
            ]} />
          </div>
        </div>
      </div>
    </li>
  );
}

// ---------------- Edit room type (fields follow the live "Add New Room" form) ----------------
const MEALS = ["breakfast", "lunch", "dinner"] as const;
function RoomTypeDrawer({ st, c, state, onClose, onUnit }: { st: RoomsState; c: Category; state: Map<string, UnitState>; onClose: () => void; onUnit: (id: string) => void }) {
  const h = useProperty();
  const { update } = useRooms(h);
  const toast = useToast();
  const [d, setD] = useState<Category>({ ...c, syncTax: c.syncTax !== false, meals: { breakfast: c.meals?.breakfast ?? "none", lunch: c.meals?.lunch ?? "none", dinner: c.meals?.dinner ?? "none" }, mealPrices: { ...c.mealPrices } });
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Category>(k: K, v: Category[K]) => setD((x) => ({ ...x, [k]: v }));
  const units = st.units.filter((u) => u.category === c.id && u.status !== "archived").sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  const own = units.filter((u) => u.rate !== undefined).length;
  const tax = d.syncTax ? HOTEL_TAX : { vat: d.vat ?? 0, service: d.service ?? 0 };
  const p = priceBreak(d.baseRate || 0, tax);
  const mine = d.photos;
  const [photoErr, setPhotoErr] = useState("");
  const photos = useMemo(() => [...new Set([...(mine ?? []), c.photo, ...h.rooms.flatMap((r) => r.photos)].filter(Boolean) as string[])].slice(0, 16), [mine, c.photo, h.rooms]);
  const errs: Record<string, string> = {
    name: !d.name.trim() ? "Name is required" : st.categories.some((x) => x.id !== c.id && x.name.trim().toLowerCase() === d.name.trim().toLowerCase()) ? "Another room type has this name" : "",
    price: !(d.baseRate > 0) ? "Base price is required" : "",
    adults: !(d.maxAdults >= 1) ? "At least 1 guest" : "",
    tax: !d.syncTax && ((d.vat ?? 0) < 0 || (d.vat ?? 0) > 50 || (d.service ?? 0) < 0 || (d.service ?? 0) > 50) ? "VAT and service charge must be 0–50%" : "",
    meals: MEALS.some((m) => d.meals?.[m] === "extra" && !((d.mealPrices?.[m] ?? 0) > 0)) ? "Add a price for each paid meal" : "",
    video: d.video && !youtubeId(d.video) ? "Video must be a YouTube link" : "",
  };
  const bad = Object.values(errs).some(Boolean);
  const err = (k: string) => (tried && errs[k] ? <p className="mt-1 text-[13px] font-medium text-[#b11c29]">{errs[k]}</p> : null);
  const save = () => {
    setTried(true);
    if (bad) return;
    update((s) => { const i = s.categories.findIndex((x) => x.id === c.id); s.categories[i] = { ...d, name: d.name.trim(), description: d.description?.trim() || undefined }; }, `Room type ${d.name.trim()} updated (${units.length} rooms)`);
    toast(`${d.name.trim()} saved`);
    onClose();
  };
  const box = "rounded-2xl border border-[#e3e7ec] p-4";
  const h2 = "mb-3 text-[16px] font-semibold";
  return (
    <Drawer wide title={`Edit ${c.name}`} onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><span className="mr-auto" /><Btn kind="primary" onClick={save}>Save room type</Btn></>}>
      <div className="space-y-4">
        {tried && bad && <p role="alert" className="rounded-xl bg-[#fde5e4] px-3.5 py-2.5 text-[14px] font-medium text-[#a3261f]">Fix the marked fields to save.</p>}
        <section className={box} aria-labelledby="rt-basic">
          <h3 id="rt-basic" className={h2}>Basic information</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Room type name"><Input value={d.name} onChange={(e) => set("name", e.target.value)} /></Field>{err("name")}</div>
            <Field label="Kind"><Input value={`${presetOf(d.preset).label}${presetOf(d.preset).group !== "standard" ? ` (sold as ${CORE[d.core].label})` : ""}`} readOnly aria-readonly className="bg-[#f4f6f8] text-[#4d5664]" /></Field>
            <Field label="Bed type"><Input value={d.bed} onChange={(e) => set("bed", e.target.value)} placeholder="e.g. 1 King bed" /></Field>
            <div><Field label="Max adults"><Input type="number" min={1} value={d.maxAdults || ""} onChange={(e) => set("maxAdults", Number(e.target.value))} /></Field>{err("adults")}</div>
            <Field label="Max children"><Input type="number" min={0} value={d.maxChildren} onChange={(e) => set("maxChildren", Number(e.target.value))} /></Field>
            <Field label="Room size (sq ft)"><Input type="number" min={0} value={d.sizeSqft ?? ""} onChange={(e) => set("sizeSqft", Number(e.target.value) || undefined)} placeholder="e.g. 320" /></Field>
            {d.bedrooms !== undefined && <Field label="Bedrooms"><Input type="number" min={1} value={d.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value) || 1)} /></Field>}
          </div>
        </section>

        <section className={box} aria-labelledby="rt-price">
          <h3 id="rt-price" className={h2}>Price</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><Field label="Base price (৳ / night)"><Input type="number" min={0} value={d.baseRate || ""} onChange={(e) => set("baseRate", Number(e.target.value))} /></Field>{err("price")}</div>
            <Field label="VAT (%)"><Input type="number" min={0} max={50} className="disabled:bg-[#f4f6f8] disabled:text-[#4d5664]" disabled={d.syncTax} value={d.syncTax ? HOTEL_TAX.vat : (d.vat ?? 0)} onChange={(e) => set("vat", Number(e.target.value))} /></Field>
            <Field label="Service charge (%)"><Input type="number" min={0} max={50} className="disabled:bg-[#f4f6f8] disabled:text-[#4d5664]" disabled={d.syncTax} value={d.syncTax ? HOTEL_TAX.service : (d.service ?? 0)} onChange={(e) => set("service", Number(e.target.value))} /></Field>
          </div>
          {err("tax")}
          <label className="mt-3 flex items-center gap-2.5 text-[14px]"><input type="checkbox" checked={!!d.syncTax} onChange={(e) => setD((x) => ({ ...x, syncTax: e.target.checked, vat: x.vat ?? HOTEL_TAX.vat, service: x.service ?? HOTEL_TAX.service }))} className="size-[18px] accent-[#b11c29]" />Use hotel defaults (VAT {HOTEL_TAX.vat}%, service {HOTEL_TAX.service}%)</label>
          <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[["Base", p.base], [`Service (${tax.service}%)`, p.service], [`VAT (${tax.vat}%)`, p.vat]].map(([l, v]) => <div key={l as string} className="rounded-xl bg-[#f4f6f8] px-3 py-2.5"><dt className="text-[12.5px] text-[#4d5664]">{l}</dt><dd className="text-[15px] font-semibold tabular-nums">৳{money(v as number)}</dd></div>)}
            <div className="rounded-xl bg-[#ffe7e4] px-3 py-2.5"><dt className="text-[12.5px] font-medium text-[#8e1621]">Guest pays / night</dt><dd className="text-[15px] font-bold text-[#8e1621] tabular-nums">৳{money(p.total)}</dd></div>
          </dl>
          <p className="mt-2 text-[12.5px] text-[#4d5664]">VAT is on base + service charge. Each booking keeps the price it was made with.{own ? ` ${own} room${own > 1 ? "s have" : " has"} its own price and keep${own > 1 ? "" : "s"} it.` : ""} Prices for single dates are in <Link href="/hms/discounts" className="font-semibold text-[#b11c29]">Discounts &amp; Rates</Link>.</p>
        </section>

        <section className={box} aria-labelledby="rt-nums">
          <div className="mb-3 flex items-center justify-between gap-2"><h3 id="rt-nums" className="text-[16px] font-semibold">Room numbers · {units.length}</h3><Link href={`/hms/rooms/new?category=${c.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#d3d8df] px-3 text-[14px] font-medium hover:bg-[#f4f6f8]"><Plus className="size-4" aria-hidden />Add rooms</Link></div>
          {units.length ? (
            <ul className="flex flex-wrap gap-1.5">{units.map((u) => { const s = state.get(u.id) ?? "draft"; return <li key={u.id}><button onClick={() => onUnit(u.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e7ec] px-2.5 py-1.5 text-[13.5px] hover:bg-[#f4f6f8]"><span aria-hidden className={clsx("size-2 rounded-full", STATE[s].dot)} /><span className="font-mono font-semibold">{u.code}</span><span className="text-[12.5px] text-[#4d5664]">{STATE[s].label}</span></button></li>; })}</ul>
          ) : <p className="text-[14px] text-[#4d5664]">No rooms yet.</p>}
        </section>

        <section className={box} aria-labelledby="rt-photo">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 id="rt-photo" className="text-[16px] font-semibold">Photos <span className="font-normal text-[#4d5664]">· {(mine ?? []).length}/10 uploaded</span></h3>
            <PhotoButton label="Upload photo" onPhoto={(src) => { setPhotoErr(""); setD((x) => ({ ...x, photos: [...(x.photos ?? []), src].slice(0, 10), photo: x.photo ?? src })); }} onError={setPhotoErr} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#d3d8df] px-3 text-[14px] font-medium hover:bg-[#f4f6f8] disabled:opacity-40"><ImagePlus className="size-4" aria-hidden />Upload photo</PhotoButton></div>
          {photoErr && <p role="alert" className="mb-2 text-[13px] font-medium text-[#b11c29]">{photoErr}</p>}
          <p className="mb-2 text-[13px] text-[#4d5664]">Tap a photo to make it the cover guests see first.</p>
          <div role="radiogroup" aria-label="Cover photo" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {photos.map((src, i) => { const up = (mine ?? []).includes(src); return (
              <span key={src.slice(0, 80) + i} className="relative">
                <button type="button" role="radio" aria-checked={d.photo === src} aria-label={`Photo ${i + 1}${up ? " (uploaded)" : ""}`} onClick={() => set("photo", src)} className={clsx("relative block aspect-[4/3] w-full overflow-hidden rounded-lg border-2", d.photo === src ? "border-[#b11c29]" : "border-transparent")}><img src={imgSrc(src)} alt="" className="size-full object-cover" />{d.photo === src && <span className="absolute left-1 top-1 rounded bg-[#b11c29] px-1.5 text-[11px] font-semibold text-white">Cover</span>}</button>
                {up && <button type="button" onClick={() => setD((x) => ({ ...x, photos: (x.photos ?? []).filter((p) => p !== src), photo: x.photo === src ? undefined : x.photo }))} aria-label={`Remove uploaded photo ${i + 1}`} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"><X className="size-3.5" /></button>}
              </span>
            ); })}
          </div>
          <p className="mt-2 text-[12.5px] text-[#4d5664]">Up to 10 photos, shrunk automatically. In this prototype uploads stay in this browser; the live HMS stores them with the room type.</p>
        </section>

        <section className={box} aria-labelledby="rt-desc">
          <h3 id="rt-desc" className={h2}>Description</h3>
          <Area aria-label="Description guests see" value={d.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="What guests see on the booking page" rows={4} />
        </section>

        <section className={box} aria-labelledby="rt-am">
          <h3 id="rt-am" className={h2}>Amenities</h3>
          <AmenityPicker value={d.amenities} onChange={(a) => set("amenities", a)} />
        </section>

        <section className={box} aria-labelledby="rt-meals">
          <h3 id="rt-meals" className="text-[16px] font-semibold">Meals</h3>
          <p className="mb-3 text-[13px] text-[#4d5664]">Included meals are free with the room. Paid meals are offered at booking, per person per night.</p>
          <div className="space-y-3">
            {MEALS.map((m) => { const v = d.meals?.[m] ?? "none"; return (
              <div key={m} className="flex flex-wrap items-center gap-3">
                <span className="w-[86px] text-[14.5px] font-medium capitalize">{m}</span>
                <div role="radiogroup" aria-label={`${m} option`} className="flex rounded-xl bg-[#e9edf2] p-1">
                  {([["none", "None"], ["included", "Included"], ["extra", "Paid"]] as [MealMode, string][]).map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={v === k} onClick={() => setD((x) => ({ ...x, meals: { breakfast: "none", lunch: "none", ...x.meals, [m]: k } }))} className={clsx("h-9 rounded-lg px-3 text-[13.5px] font-semibold", v === k ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>)}
                </div>
                {v === "extra" && <label className="flex items-center gap-2 text-[13.5px]"><span className="text-[#4d5664]">৳</span><Input type="number" min={0} aria-label={`${m} price per person`} value={d.mealPrices?.[m] ?? ""} onChange={(e) => setD((x) => ({ ...x, mealPrices: { ...x.mealPrices, [m]: Number(e.target.value) || undefined } }))} className="!h-9 w-[110px]" /><span className="text-[#4d5664]">per person</span></label>}
              </div>
            ); })}
          </div>
          {err("meals")}
        </section>

        <section className={box} aria-labelledby="rt-vid">
          <h3 id="rt-vid" className={h2}>Video (optional)</h3>
          <Input aria-label="YouTube link" value={d.video ?? ""} onChange={(e) => set("video", e.target.value || undefined)} placeholder="https://youtu.be/…" />
          {err("video")}
        </section>
      </div>
    </Drawer>
  );
}
