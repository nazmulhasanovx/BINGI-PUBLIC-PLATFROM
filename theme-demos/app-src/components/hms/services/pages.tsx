"use client";
import Link from "next/link";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { BarChart3, BedDouble, CalendarClock, CircleCheck, Flower2, History, KanbanSquare, Lock, MoreHorizontal, Package, Pencil, Plus, RefreshCw, Search, Settings2, Shirt, Smartphone, Sparkles, Tag, TriangleAlert, UserRound, Warehouse } from "lucide-react";
import { CAN, SAMPLE_ART, RES_LABEL, ROLE_LABEL, SOURCE_LABEL, STATUS_LABEL, UNIT_LABEL, hasServices, orderSub, orderTotal, slotOf, statusOf, t12, tk, useServices, whenLabel, type Order, type Resource, type Role, type Service, type SvcCategory, type Vendor, type WorkStatus } from "@/lib/services/store";
import { useInventory } from "@/lib/inventory/store";
import { imgSrc } from "@/lib/img";
import { useHrm } from "@/lib/hrm/store";
import { TODAY } from "@/lib/rooms/store";
import { useProperty } from "../property";
import { btnIcon, btnLine, btnPrimary } from "../guests/ui";
import { AssignSheet, CancelSheet, CategorySheet, DeclineSheet, DetailsSheet, OrderSheet, PayPill, PreviewSheet, ResourceSheet, ServiceSheet, VendorSheet, WorkPill } from "./sheets";

type Open = { k: "service"; item?: Service } | { k: "order"; order?: Order; service?: string } | { k: "details"; id: string } | { k: "cancel"; id: string } | { k: "cat"; cat?: SvcCategory } | { k: "preview"; id: string } | { k: "assign"; id: string } | { k: "decline"; id: string } | { k: "res"; item?: Resource } | { k: "vendor"; item?: Vendor };
type Ctx = { svc: ReturnType<typeof useServices>; open: (o: Open) => void; act: (id: string, a: "accept" | "decline" | "assign" | "start" | "done") => void; toast: (t: string) => void };
const C = createContext<Ctx | null>(null);
const useSvc = () => useContext(C)!;
type Tab = "today" | "catalog" | "orders" | "reports" | "setup";
const TABS: { id: Tab; label: string; href: string; icon: typeof Package }[] = [
  { id: "today", label: "Today", href: "/hms/other-services", icon: KanbanSquare },
  { id: "catalog", label: "Service Catalog", href: "/hms/other-services/catalog", icon: Package },
  { id: "orders", label: "Orders", href: "/hms/other-services/orders", icon: History },
  { id: "reports", label: "Reports", href: "/hms/other-services/reports", icon: BarChart3 },
  { id: "setup", label: "Setup", href: "/hms/other-services/setup", icon: Settings2 },
];
const card = "rounded-xl border border-hms-line bg-white";
const sel = "h-10 rounded-lg border border-hms-line bg-white px-3 text-[14px] outline-none focus:border-hms-ink";
const ICON: Record<string, [typeof Package, string]> = { t: [BedDouble, "bg-[#e8f0fe] text-[#1d4ed8]"], g: [Shirt, "bg-[#f1edff] text-[#6b55e0]"], e: [Sparkles, "bg-[#fdefe7] text-[#d9622b]"], w: [Flower2, "bg-[#e5f5ec] text-[#1c7d45]"] };
const iconFor = (cat: string) => ICON[cat] ?? [Package, "bg-hms-hover text-[#4d5664]"];

function Frame({ tab, children }: { tab: Tab; children: ReactNode }) {
  const h = useProperty();
  const svc = useServices(h);
  const inv = useInventory(h);
  const [o, setO] = useState<Open | null>(null);
  const [toast, setToast] = useState("");
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);
  if (!hasServices(h)) return (
    <div className="h-full overflow-y-auto"><div className="mx-auto max-w-[720px] p-6"><div className="mt-10 rounded-2xl border border-hms-line bg-white p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-hms-coral-soft text-hms-red"><Lock className="size-7" /></span>
      <h1 className="mt-4 text-[22px] font-bold">Other Services is part of Business</h1>
      <p className="mx-auto mt-2 max-w-[440px] text-[14.5px] text-hms-muted">Sell airport transfers, laundry, extra beds and experiences, and charge them to the guest’s booking. {h.name} is on the Starter plan.</p>
      <Link href="/hms/settings/billing" className={clsx(btnPrimary, "mt-5")}>See Business plan</Link>
    </div></div></div>
  );
  const get = (id: string) => svc.st.orders.find((x) => x.id === id);
  const det = o?.k === "details" || o?.k === "cancel" || o?.k === "assign" || o?.k === "decline" ? get(o.id) : undefined;
  /** Work actions from the board or the details sheet. "Done" also takes the service's stock out of Inventory. */
  const act = (id: string, a: "accept" | "decline" | "assign" | "start" | "done") => {
    const x = get(id); if (!x) return;
    if (a === "accept") { const e = svc.accept(id); setToast(e ?? `${id} accepted`); if (!e) setO(null); return; }
    if (a === "decline" || a === "assign") { setO({ k: a, id }); return; }
    if (a === "start") { svc.start(id); setToast(`${id} started`); return; }
    const lines = svc.complete(id);
    const dept = svc.st.services.find((y) => y.id === x.service)?.dept;
    const store = dept === "Housekeeping" && inv.st.stores.some((y) => y.id === "hk") ? "hk" : dept === "Kitchen" && inv.st.stores.some((y) => y.id === "kitchen") ? "kitchen" : "main";
    const miss: string[] = [];
    for (const l of lines) { const e = inv.move("issue", l.item, l.qty, { note: `Used for ${id}`, ref: id, store }); if (e) miss.push(inv.st.items.find((y) => y.id === l.item)?.name ?? "item"); }
    if (lines.length) svc.noteLog(id, miss.length ? `Stock not taken (not enough): ${miss.join(", ")}` : `Stock used: ${lines.map((l) => `${inv.st.items.find((y) => y.id === l.item)?.name} ${l.qty}`).join(", ")}`);
    setToast(miss.length ? `${id} done — not enough ${miss.join(", ")} in Inventory` : `${id} done`);
  };
  const prev = o?.k === "preview" ? svc.st.services.find((x) => x.id === o.id) : undefined;
  return (
    <C.Provider value={{ svc, open: setO, act, toast: setToast }}>
      <div className="h-full overflow-y-auto"><div className="hms-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-[24px] font-bold tracking-[-0.01em]">Other Services</h1><p className="flex flex-wrap items-center gap-x-2 text-[14px] text-hms-muted">Sell, schedule and deliver guest services.<Link href="/hms/other-services/setup#roles" className="inline-flex items-center gap-1 rounded-md bg-hms-hover px-2 py-0.5 text-[12.5px] font-semibold text-[#4d5664] hover:text-hms-ink"><UserRound className="size-3.5" aria-hidden />{ROLE_LABEL[svc.role]}</Link></p></div>
          <div className="flex flex-wrap gap-2">
            {CAN.catalog(svc.role) && tab === "catalog" && <button onClick={() => setO({ k: "service" })} className={btnLine}><Plus className="size-4" />Add Service</button>}
            {CAN.create(svc.role) && <button onClick={() => setO({ k: "order" })} className={btnPrimary}><Plus className="size-4" />New Service Order</button>}
            <button onClick={() => setToast("Up to date")} aria-label="Refresh" className={btnIcon}><RefreshCw className="size-4" /></button>
          </div>
        </div>
        <nav aria-label="Other Services sections" className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-hms-line">
          {TABS.map((t) => { const n = t.id === "today" ? svc.st.orders.filter((x) => !x.cancelled && x.status === "requested").length : 0; return <Link key={t.id} href={t.href} aria-current={tab === t.id ? "page" : undefined} className={clsx("-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-[14.5px] font-semibold", tab === t.id ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}><t.icon className="size-4" />{t.label}{n > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-[#b11c29] px-1.5 text-[11.5px] text-white">{n}<span className="sr-only"> new requests</span></span>}</Link>; })}
        </nav>
        <div key={tab} className="hms-page-in mt-5">{children}</div>
      </div></div>
      {o?.k === "service" && <ServiceSheet svc={svc} item={o.item} invItems={inv.items} onClose={() => setO(null)} />}
      {o?.k === "order" && <OrderSheet svc={svc} order={o.order} serviceId={o.service} onClose={() => setO(null)} onDone={(_, m) => setToast(m)} />}
      {o?.k === "details" && det && <DetailsSheet svc={svc} order={det} onClose={() => setO(null)} onEdit={() => setO({ k: "order", order: det })} onCancel={() => setO({ k: "cancel", id: det.id })} onAct={(a) => act(det.id, a)} />}
      {o?.k === "assign" && det && <AssignSheet svc={svc} order={det} onClose={() => setO(null)} onDone={setToast} />}
      {o?.k === "decline" && det && <DeclineSheet svc={svc} order={det} onClose={() => setO(null)} onDone={setToast} />}
      {o?.k === "res" && <ResourceSheet svc={svc} item={o.item} onClose={() => setO(null)} />}
      {o?.k === "vendor" && <VendorSheet svc={svc} item={o.item} onClose={() => setO(null)} />}
      {o?.k === "cancel" && det && <CancelSheet svc={svc} order={det} onClose={() => setO(null)} onDone={setToast} />}
      {o?.k === "cat" && <CategorySheet svc={svc} cat={o.cat} onClose={() => setO(null)} />}
      {o?.k === "preview" && prev && <PreviewSheet svc={svc} item={prev} onClose={() => setO(null)} onBack={() => setO({ k: "service", item: prev })} />}
      {toast && <div role="status" className="hms-up fixed bottom-6 left-1/2 z-[95] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0f1720] px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"><CircleCheck className="size-4 text-[#7ee2a8]" />{toast}</div>}
    </C.Provider>
  );
}

function Menu({ label, items }: { label: string; items: [string, () => void, boolean?][] }) {
  const [m, setM] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!m) return; const c = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setM(false); }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, [m]);
  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setM((x) => !x)} aria-haspopup="menu" aria-expanded={m} aria-label={label} className="grid size-9 place-items-center rounded-lg border border-hms-line bg-white hover:bg-hms-hover"><MoreHorizontal className="size-4" /></button>
      {m && <div role="menu" className="hms-pop absolute right-0 top-10 z-20 w-48 rounded-xl border border-hms-line bg-white p-1 text-left shadow-lg">{items.map(([l, f, danger]) => <button key={l} role="menuitem" onClick={() => { setM(false); f(); }} className={clsx("block w-full rounded-lg px-3 py-2 text-left text-[14px] hover:bg-hms-hover", danger && "text-[#c81e1e]")}>{l}</button>)}</div>}
    </div>
  );
}
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-hms-line bg-white px-3 focus-within:border-hms-ink sm:flex-none"><Search className="size-4 text-hms-muted" /><span className="sr-only">{placeholder}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none" /></label>;
}

/** Service photo when there is one (shown on the website and guest app), otherwise the category icon. */
function Thumb({ s, I, tone, big }: { s: Service; I: typeof Package; tone: string; big?: boolean }) {
  const sz = big ? "size-14 rounded-xl" : "size-11 rounded-lg";
  // eslint-disable-next-line @next/next/no-img-element -- demo photo or uploaded data URL
  if (s.image && s.image !== SAMPLE_ART) return <img src={imgSrc(s.image)} alt="" className={clsx(sz, "shrink-0 object-cover")} />;
  return <span className={clsx("grid shrink-0 place-items-center", sz, tone)}><I className="size-5" /></span>;
}

// ---------------- Catalog ----------------
export function CatalogPage() { const sp = useSearchParams(); return <Frame tab="catalog"><Catalog key={sp.get("category") ?? ""} /></Frame>; }
function Catalog() {
  const { svc, open } = useSvc();
  const sp = useSearchParams();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(sp.get("category") ?? "");
  const [st, setSt] = useState<"active" | "archived" | "all">("active");
  const cats = new Map(svc.st.categories.map((c) => [c.id, c.name]));
  const list = svc.st.services.filter((s) => (st === "all" || (st === "archived") === !!s.archived) && (!cat || s.category === cat) && (!q || s.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <section className={clsx(card, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <div className="mr-auto"><h2 className="text-[17px] font-bold">Service Catalog</h2><p className="text-[13px] text-hms-muted">Browse services and start an order from the list.</p></div>
        <SearchBox value={q} onChange={setQ} placeholder="Search services" />
        <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)} className={sel}><option value="">All categories</option>{svc.st.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value as typeof st)} className={clsx(sel, st === "archived" && "border-[#e9b949] bg-[#fffaf0]")}><option value="active">Active services</option><option value="archived">Archived</option><option value="all">All services</option></select>
      </div>
      {list.length ? (
        <>
        <ul className="divide-y divide-hms-line border-t border-hms-line md:hidden" aria-label="Services">
          {list.map((s) => { const [I, tone] = iconFor(s.category); return (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <Thumb s={s} I={I} tone={tone} big />
              <button onClick={() => CAN.catalog(svc.role) && open({ k: "service", item: s })} className="min-w-0 flex-1 text-left">
                <span className="block truncate font-semibold">{s.name}</span>
                <span className="block text-[12.5px] text-hms-muted">{cats.get(s.category) ?? "—"}{s.archived ? " · Archived" : ""}</span>
                <span className="block text-[13.5px] font-bold tabular-nums">{s.variants?.length ? `${tk(Math.min(...s.variants.map((v) => v.price)))}+` : tk(s.price)} <span className="font-normal text-hms-muted">{UNIT_LABEL[s.unit ?? "each"][1]}</span></span>
              </button>
              {!s.archived && CAN.create(svc.role) && <button onClick={() => open({ k: "order", service: s.id })} className={clsx(btnLine, "h-9 shrink-0 px-3")}><Plus className="size-4" />Order</button>}
            </li>); })}
        </ul>
        <div className="hidden overflow-x-auto border-t border-hms-line md:block" tabIndex={0} role="region" aria-label="Services">
          <table className="w-full min-w-[820px] text-[14px]">
            <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-medium">Service</th><th className="px-3 py-2.5 font-medium">Category</th><th className="px-3 py-2.5 font-medium">Done by</th><th className="px-3 py-2.5 text-right font-medium">Price</th><th className="px-3 py-2.5 font-medium">Status</th><th className="px-5 py-2.5 text-right font-medium">Actions</th></tr></thead>
            <tbody>{list.map((s) => { const [I, tone] = iconFor(s.category); return (
              <tr key={s.id} className="border-t border-hms-line">
                <td className="px-5 py-2.5"><span className="flex items-center gap-3"><Thumb s={s} I={I} tone={tone} /><span><span className="block font-semibold">{s.name}</span><span className="text-[12px] text-hms-muted">{[s.image && !s.archived && "On website", s.guestRequest && !s.archived && "Guests can request", s.vendor && "Vendor"].filter(Boolean).join(" · ")}</span></span></span></td>
                <td className="px-3 py-2.5">{cats.get(s.category) ?? "—"}</td><td className="px-3 py-2.5"><span className="block">{s.dept ?? "—"}</span><span className="text-[12.5px] text-hms-muted">{s.resourceType ? `Books a ${RES_LABEL[s.resourceType].toLowerCase()} · ${s.minutes ?? 60} min` : s.duration}</span></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right"><b className="tabular-nums">{s.variants?.length ? `${tk(Math.min(...s.variants.map((v) => v.price)))}+` : tk(s.price)}</b><span className="block text-[12.5px] text-hms-muted">{UNIT_LABEL[s.unit ?? "each"][1]}</span></td>
                <td className="px-3 py-2.5">{s.archived ? <span className="inline-flex items-center gap-1.5 rounded-md bg-hms-hover px-2 py-0.5 text-[12.5px] font-semibold text-[#4d5664]"><span className="size-1.5 rounded-full bg-current" />Archived</span> : <span className="inline-flex items-center gap-1.5 rounded-md bg-[#e5f5ec] px-2 py-0.5 text-[12.5px] font-semibold text-[#16693a]"><span className="size-1.5 rounded-full bg-current" />Active</span>}</td>
                <td className="px-5 py-2.5"><span className="flex justify-end gap-2">
                  {!s.archived && CAN.create(svc.role) && <button onClick={() => open({ k: "order", service: s.id })} aria-label={`Order ${s.name}`} className={clsx(btnLine, "h-9 px-3")}><Plus className="size-4" />Order</button>}
                  {CAN.catalog(svc.role) && <button onClick={() => open({ k: "service", item: s })} aria-label={`Edit ${s.name}`} className="grid size-9 place-items-center rounded-lg border border-hms-line bg-white hover:bg-hms-hover"><Pencil className="size-4" /></button>}
                  {CAN.catalog(svc.role) && <Menu label={`More for ${s.name}`} items={[["Website preview", () => open({ k: "preview", id: s.id })], s.archived ? ["Restore service", () => svc.setArchived(s.id, false)] : ["Archive service", () => svc.setArchived(s.id, true), true]]} />}
                </span></td>
              </tr>); })}</tbody>
          </table>
        </div>
        </>
      ) : (
        <div className="border-t border-hms-line px-6 py-14 text-center"><p className="text-[16px] font-semibold">{st === "archived" ? "No archived services" : "No services found"}</p><p className="mt-1 text-[14px] text-hms-muted">{q ? "Try another name." : "Add your first service, like an airport transfer."}</p>
          {!q && st !== "archived" && <button onClick={() => open({ k: "service" })} className={clsx(btnPrimary, "mt-4")}><Plus className="size-4" />Add Service</button>}</div>
      )}
      <p className="border-t border-hms-line px-5 py-3 text-[13px] text-hms-muted">{list.length} {st === "all" ? "" : st} service{list.length === 1 ? "" : "s"}</p>
    </section>
  );
}

// ---------------- Today (board + timeline) ----------------
const COLS: { id: WorkStatus; label: string; hint: string }[] = [
  { id: "requested", label: "New requests", hint: "From guests — accept or decline" },
  { id: "confirmed", label: "To assign", hint: "Confirmed, nobody on it yet" },
  { id: "assigned", label: "Assigned", hint: "Staff knows, not started" },
  { id: "in_progress", label: "In progress", hint: "Being done now" },
  { id: "done", label: "Done", hint: "Finished today" },
];
const NEXT: Partial<Record<WorkStatus, [string, "accept" | "assign" | "start" | "done"]>> = { requested: ["Accept", "accept"], confirmed: ["Assign", "assign"], assigned: ["Start", "start"], in_progress: ["Done", "done"] };
export function TodayPage() { return <Frame tab="today"><Today /></Frame>; }
function Today() {
  const { svc, open, act } = useSvc();
  const { st: hrm } = useHrm();
  const [date, setDate] = useState(TODAY);
  const [view, setView] = useState<"board" | "timeline">("board");
  const [dept, setDept] = useState("");
  const name = (id: string) => svc.st.services.find((s) => s.id === id);
  const day = svc.st.orders.filter((o) => !o.cancelled && o.status !== "declined" && slotOf(o).date === date && (!dept || name(o.service)?.dept === dept)).sort((x, y) => slotOf(x).start - slotOf(y).start);
  const late = day.filter((o) => ["confirmed", "assigned"].includes(o.status ?? "") && date === TODAY && o.when !== "now" && slotOf(o).start < new Date().getHours() * 60 + new Date().getMinutes());
  const depts = [...new Set(svc.st.services.map((s) => s.dept).filter(Boolean))] as string[];
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input type="date" aria-label="Day" value={date} onChange={(e) => setDate(e.target.value || TODAY)} className={sel} />
        {date !== TODAY && <button onClick={() => setDate(TODAY)} className="text-[13.5px] font-semibold text-hms-red">Today</button>}
        <select aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)} className={sel}><option value="">All departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select>
        <div role="radiogroup" aria-label="View" className="ml-auto flex rounded-lg bg-[#e9edf2] p-1">{([["board", "Board", KanbanSquare], ["timeline", "Timeline", CalendarClock]] as const).map(([v, l, I]) => <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)} className={clsx("flex h-8 items-center gap-1.5 rounded-md px-3 text-[13.5px] font-semibold", view === v ? "bg-white shadow-sm" : "text-[#4d5664]")}><I className="size-4" />{l}</button>)}</div>
        {CAN.create(svc.role) && <button onClick={svc.simulateRequest} className={clsx(btnLine, "h-10")}><Smartphone className="size-4" />Prototype: guest request</button>}
      </div>
      {late.length > 0 && <p className="mb-3 flex items-center gap-2 rounded-lg bg-[#fdf3d9] px-3 py-2 text-[13.5px] text-[#6b4309]"><TriangleAlert className="size-4" />{late.length} job{late.length > 1 ? "s are" : " is"} past the requested time and not started.</p>}
      {view === "board" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {COLS.map((c) => { const list = day.filter((o) => (o.status ?? "done") === c.id); return (
            <section key={c.id} aria-label={c.label} className="flex min-w-0 flex-col rounded-xl bg-[#eef1f4] p-2">
              <div className="px-2 pb-2 pt-1"><p className="flex items-center gap-2 text-[14px] font-bold">{c.label}<span className="rounded-full bg-white px-2 text-[12px] tabular-nums">{list.length}</span></p><p className="text-[12px] text-hms-muted">{c.hint}</p></div>
              <ul className="space-y-2">{list.map((o) => { const s = name(o.service); const who = hrm.employees.find((e) => e.id === o.assignee); const res = svc.st.resources.find((r) => r.id === o.resource); const nx = NEXT[o.status ?? "done"]; const canDo = nx && (nx[1] === "start" || nx[1] === "done" || CAN.assign(svc.role)); return (
                <li key={o.id} className="rounded-lg border border-hms-line bg-white p-3">
                  <button onClick={() => open({ k: "details", id: o.id })} className="block w-full text-left">
                    <span className="flex items-center justify-between gap-2 text-[12.5px] text-hms-muted"><span className="font-semibold text-hms-ink">{o.when === "now" ? `Now · ${t12(o.created.slice(11, 16))}` : t12(o.when.time)}</span>{o.source && o.source !== "staff" && <span className="rounded bg-[#e8f0fe] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#1d4ed8]">{SOURCE_LABEL[o.source]}</span>}</span>
                    <span className="mt-1 block font-semibold">{s?.name}{o.variant ? ` · ${s?.variants?.find((v) => v.id === o.variant)?.name}` : ""}</span>
                    <span className="block text-[13px] text-hms-muted">{o.booking ? `Room ${o.booking.room} · ${o.booking.guest}` : o.walkIn?.name} · {o.qty}{o.children ? `+${o.children}` : ""}</span>
                    {(who || res) && <span className="mt-1 block text-[12.5px] text-[#4d5664]">{[who?.name, res?.name].filter(Boolean).join(" · ")}</span>}
                  </button>
                  {canDo && <button onClick={() => act(o.id, nx[1])} className={clsx(nx[1] === "accept" || nx[1] === "done" ? btnPrimary : btnLine, "mt-2 h-8 w-full text-[13px]")}>{nx[0]}<span className="sr-only"> {o.id}</span></button>}
                </li>
              ); })}</ul>
              {!list.length && <p className="px-2 py-3 text-[12.5px] text-hms-muted">Nothing here.</p>}
            </section>
          ); })}
        </div>
      ) : <Timeline orders={day} />}
    </>
  );
}
/** Resources as rows, 07:00–23:00 as columns — shows what is booked and where there is room. */
function Timeline({ orders }: { orders: Order[] }) {
  const { svc, open } = useSvc();
  const H0 = 7 * 60, H1 = 23 * 60, W = H1 - H0;
  const rows = svc.st.resources.filter((r) => !r.off);
  const pos = (m: number) => `${((Math.max(H0, Math.min(H1, m)) - H0) / W) * 100}%`;
  const free = orders.filter((o) => !o.resource);
  return (
    <section className={clsx(card, "overflow-hidden")}>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Resource timeline">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[170px_1fr] border-b border-hms-line text-[12px] text-hms-muted"><span className="px-4 py-2">Resource</span><span className="relative h-8">{Array.from({ length: 8 }, (_, i) => <span key={i} className="absolute top-2 -translate-x-1/2" style={{ left: pos(H0 + i * 120) }}>{t12(`${String(7 + i * 2).padStart(2, "0")}:00`).replace(":00", "")}</span>)}</span></div>
          {rows.map((r) => { const list = orders.filter((o) => o.resource === r.id); return (
            <div key={r.id} className="grid grid-cols-[170px_1fr] border-b border-hms-line last:border-0">
              <span className="px-4 py-3 text-[13.5px]"><b className="block">{r.name}</b><span className="text-[12px] text-hms-muted">{RES_LABEL[r.type]}</span></span>
              <span className="relative h-14 bg-[repeating-linear-gradient(90deg,transparent,transparent_calc(12.5%-1px),#eef1f4_calc(12.5%-1px),#eef1f4_12.5%)]">
                {list.map((o) => { const sl = slotOf(o); const s = svc.st.services.find((x) => x.id === o.service); return (
                  <button key={o.id} onClick={() => open({ k: "details", id: o.id })} style={{ left: pos(sl.start), width: `calc(${pos(sl.start + (o.minutes ?? 60))} - ${pos(sl.start)})` }} className={clsx("absolute top-2 h-10 overflow-hidden rounded-md px-2 text-left text-[12px] font-semibold", o.status === "done" ? "bg-[#e5f5ec] text-[#16693a]" : o.status === "in_progress" ? "bg-[#eeebfc] text-[#5b44c9]" : o.status === "requested" ? "bg-[#fde8e8] text-[#a11d2a]" : "bg-[#e8f0fe] text-[#1d4ed8]")}>
                    <span className="block truncate">{s?.name}</span><span className="block truncate font-normal">{o.when === "now" ? o.created.slice(11, 16) : o.when.time} · {o.booking ? `Rm ${o.booking.room}` : "Walk-in"}</span>
                  </button>
                ); })}
              </span>
            </div>
          ); })}
        </div>
      </div>
      {free.length > 0 && <p className="border-t border-hms-line px-4 py-2.5 text-[13px] text-hms-muted">{free.length} job{free.length > 1 ? "s are" : " is"} not on a resource (laundry, extra bed, or waiting to be accepted) — see Board.</p>}
    </section>
  );
}

// ---------------- Orders ----------------
export function OrdersPage() { return <Frame tab="orders"><Orders /></Frame>; }
function Orders() {
  const { svc, open } = useSvc();
  const [q, setQ] = useState("");
  const [pay, setPay] = useState("");
  const [work, setWork] = useState("");
  const [d, setD] = useState("");
  const name = (id: string) => svc.st.services.find((s) => s.id === id)?.name ?? "Service";
  const list = svc.st.orders.filter((o) => {
    if (pay === "Cancelled" ? !o.cancelled : pay && (o.cancelled || o.payment !== pay)) return false;
    if (work && statusOf(o) !== work) return false;
    if (d && o.created.slice(0, 10) !== d && !(o.when !== "now" && o.when.date === d)) return false;
    const k = q.toLowerCase();
    return !k || `${o.id} ${name(o.service)} ${o.booking?.code ?? ""} ${o.booking?.guest ?? ""} ${o.walkIn?.name ?? ""}`.toLowerCase().includes(k);
  });
  const unpaid = svc.st.orders.filter((o) => !o.cancelled && o.payment === "Unpaid").reduce((s, o) => s + orderTotal(o), 0);
  const today = svc.st.orders.filter((o) => !o.cancelled && o.created.startsWith(TODAY));
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[["Orders today", String(today.length)], ["Sales today", tk(today.reduce((s, o) => s + orderTotal(o), 0))], ["Unpaid on bookings", tk(unpaid)]].map(([k, v]) => <div key={k} className={clsx(card, "px-3 py-2.5 sm:px-4 sm:py-3")}><p className="text-[12px] text-hms-muted sm:text-[13px]">{k}</p><p className="text-[16px] font-bold tabular-nums sm:text-[22px]">{v}</p></div>)}
      </div>
      <section className={clsx(card, "overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="mr-auto"><h2 className="text-[17px] font-bold">Order History</h2><p className="text-[13px] text-hms-muted">Every order with its work status and payment.</p></div>
          <SearchBox value={q} onChange={setQ} placeholder="Search order, booking or service" />
          <select aria-label="Work status" value={work} onChange={(e) => setWork(e.target.value)} className={sel}><option value="">All work</option>{(Object.keys(STATUS_LABEL) as WorkStatus[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}<option value="cancelled">Cancelled</option></select>
          <select aria-label="Payment" value={pay} onChange={(e) => setPay(e.target.value)} className={sel}><option value="">All payments</option><option>Unpaid</option><option>Paid</option><option>Refunded</option><option>Cancelled</option></select>
          <input type="date" aria-label="Date" value={d} onChange={(e) => setD(e.target.value)} className={sel} />{d && <button onClick={() => setD("")} className="text-[13.5px] font-semibold text-hms-red">All dates</button>}
        </div>
        {list.length ? (
          <>
          <ul className="divide-y divide-hms-line border-t border-hms-line md:hidden" aria-label="Orders">
            {list.map((o) => (
              <li key={o.id}><button onClick={() => open({ k: "details", id: o.id })} className={clsx("block w-full px-4 py-3 text-left", o.cancelled && "text-hms-muted")}>
                <span className="flex items-baseline justify-between gap-3"><b className="truncate">{name(o.service)}</b><b className={clsx("shrink-0 tabular-nums", o.cancelled && "line-through")}>{tk(orderTotal(o))}</b></span>
                <span className="block text-[12.5px] text-hms-muted">{o.id} · {o.method === "booking" ? `Room ${o.booking?.room} · ${o.booking?.guest}` : "Walk-in"} · {whenLabel(o)}</span>
                <span className="mt-1.5 flex flex-wrap gap-1.5"><WorkPill o={o} /><PayPill o={o} /></span>
              </button></li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto border-t border-hms-line md:block" tabIndex={0} role="region" aria-label="Orders">
            <table className="w-full min-w-[980px] text-[14px]">
              <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-medium">Service / Order</th><th className="px-3 py-2.5 font-medium">Booking / Walk-in</th><th className="px-3 py-2.5 font-medium">Requested Time</th><th className="px-3 py-2.5 font-medium">Work</th><th className="px-3 py-2.5 font-medium">Payment</th><th className="px-3 py-2.5 text-right font-medium">Total</th><th className="px-5 py-2.5 text-right font-medium">Actions</th></tr></thead>
              <tbody>{list.map((o) => (
                <tr key={o.id} className={clsx("border-t border-hms-line", o.cancelled && "text-hms-muted")}>
                  <td className="px-5 py-2.5"><span className="block font-semibold">{name(o.service)}</span><span className="text-[12.5px] text-hms-muted">{o.id}{o.source && o.source !== "staff" ? ` · ${SOURCE_LABEL[o.source]}` : ""}</span></td>
                  <td className="px-3 py-2.5">{o.method === "booking" ? <><span className="block font-semibold">{o.booking?.code}</span><span className="text-[12.5px] text-hms-muted">Room {o.booking?.room} · {o.booking?.guest}</span></> : <><span className="block font-semibold">Walk-in</span><span className="text-[12.5px] text-hms-muted">Cash sale{o.walkIn?.name && o.walkIn.name !== "Walk-in Guest" ? ` · ${o.walkIn.name}` : ""}</span></>}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{whenLabel(o)}</td>
                  <td className="px-3 py-2.5"><WorkPill o={o} /></td>
                  <td className="px-3 py-2.5"><PayPill o={o} /></td>
                  <td className={clsx("whitespace-nowrap px-3 py-2.5 text-right font-bold tabular-nums", o.cancelled && "line-through")}>{tk(orderTotal(o))}</td>
                  <td className="px-5 py-2.5"><span className="flex justify-end gap-2">
                    <button onClick={() => open({ k: "details", id: o.id })} className={clsx(btnLine, "h-9 px-3")}>View Details</button>
                    {CAN.create(svc.role) && <Menu label={`More for ${o.id}`} items={[
                      ...(!o.cancelled && o.method === "booking" && o.payment === "Unpaid" && o.status !== "done" ? [["Edit order", () => open({ k: "order", order: o })] as [string, () => void]] : []),
                      ...(!o.cancelled && o.status !== "declined" && (o.payment !== "Paid" || CAN.refund(svc.role)) ? [["Cancel order", () => open({ k: "cancel", id: o.id }), true] as [string, () => void, boolean]] : []),
                      ["View details", () => open({ k: "details", id: o.id })],
                    ]} />}
                  </span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          </>
        ) : <p className="border-t border-hms-line px-5 py-12 text-center text-[14px] text-hms-muted">No orders match these filters.</p>}
        <p className="border-t border-hms-line px-5 py-3 text-[13px] text-hms-muted">{list.length} service order{list.length === 1 ? "" : "s"} · booking charges are paid with the booking at checkout</p>
      </section>
    </>
  );
}

// ---------------- Reports ----------------
export function ReportsPage() { return <Frame tab="reports"><Reports /></Frame>; }
function Reports() {
  const { svc } = useSvc();
  const { st: hrm } = useHrm();
  const [from, setFrom] = useState("2026-11-01"), [to, setTo] = useState(TODAY);
  const live = svc.st.orders.filter((o) => !o.cancelled && o.status !== "declined" && o.status !== "requested" && slotOf(o).date >= from && slotOf(o).date <= to);
  const net = (o: Order) => orderSub(o);
  const by = <K,>(key: (o: Order) => K) => { const m = new Map<K, Order[]>(); for (const o of live) m.set(key(o), [...(m.get(key(o)) ?? []), o]); return [...m]; };
  const svcRows = by((o) => o.service).map(([id, list]) => ({ name: svc.st.services.find((s) => s.id === id)?.name ?? "—", n: list.length, rev: list.reduce((a, o) => a + net(o), 0), cost: list.reduce((a, o) => a + (o.vendorCost ?? 0), 0) })).sort((a, b) => b.rev - a.rev);
  const staffRows = by((o) => o.assignee ?? "").filter(([id]) => id).map(([id, list]) => ({ name: hrm.employees.find((e) => e.id === id)?.name ?? id, done: list.filter((o) => o.status === "done").length, open: list.filter((o) => o.status !== "done").length, rev: list.reduce((a, o) => a + net(o), 0) })).sort((a, b) => b.done - a.done);
  const days = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 864e5) + 1);
  const util = svc.st.resources.filter((r) => !r.off).map((r) => { const mins = live.filter((o) => o.resource === r.id).reduce((a, o) => a + (o.minutes ?? 60), 0); return { name: r.name, type: RES_LABEL[r.type], pct: Math.round((mins / (days * 16 * 60)) * 100), mins }; });
  const rev = live.reduce((a, o) => a + net(o), 0), cost = live.reduce((a, o) => a + (o.vendorCost ?? 0), 0), tax = live.reduce((a, o) => a + (o.sc ?? 0) + (o.vat ?? 0), 0);
  return (
    <>
      <section className={clsx(card, "flex flex-wrap items-center gap-3 px-5 py-4")}>
        <div className="mr-auto"><h2 className="text-[17px] font-bold">Service Report</h2><p className="text-[13px] text-hms-muted">Confirmed and done orders by requested date · revenue before service charge and VAT.</p></div>
        <input type="date" aria-label="From" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={sel} /><input type="date" aria-label="To" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={sel} />
      </section>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[["Revenue", tk(rev), `${live.length} orders`], ["Vendor cost", tk(cost), "Payable to outside vendors"], ["Margin", tk(rev - cost), rev ? `${Math.round(((rev - cost) / rev) * 100)}% of revenue` : "—"], ["Service charge + VAT", tk(tax), "Collected on top"]].map(([l, v, sub]) => <div key={l} className={clsx(card, "p-4")}><p className="text-[13.5px] font-semibold">{l}</p><p className="text-[24px] font-bold tabular-nums">{v}</p><p className="text-[12.5px] text-hms-muted">{sub}</p></div>)}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className={clsx(card, "overflow-hidden")}><h3 className="px-5 py-4 text-[17px] font-bold">By service</h3>
          <table className="w-full border-t border-hms-line text-[14px]"><thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2 font-medium">Service</th><th className="px-3 py-2 text-right font-medium">Orders</th><th className="px-3 py-2 text-right font-medium">Revenue</th><th className="px-5 py-2 text-right font-medium">Margin</th></tr></thead>
            <tbody>{svcRows.map((r) => <tr key={r.name} className="border-t border-hms-line"><td className="px-5 py-2.5 font-semibold">{r.name}</td><td className="px-3 py-2.5 text-right tabular-nums">{r.n}</td><td className="px-3 py-2.5 text-right tabular-nums">{tk(r.rev)}</td><td className="px-5 py-2.5 text-right tabular-nums">{tk(r.rev - r.cost)}</td></tr>)}</tbody></table>
          {!svcRows.length && <p className="border-t border-hms-line px-5 py-6 text-[14px] text-hms-muted">No orders in this range.</p>}
        </section>
        <section className={clsx(card, "overflow-hidden")}><h3 className="px-5 py-4 text-[17px] font-bold">By staff</h3>
          <table className="w-full border-t border-hms-line text-[14px]"><thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2 font-medium">Staff</th><th className="px-3 py-2 text-right font-medium">Done</th><th className="px-3 py-2 text-right font-medium">Open</th><th className="px-5 py-2 text-right font-medium">Revenue</th></tr></thead>
            <tbody>{staffRows.map((r) => <tr key={r.name} className="border-t border-hms-line"><td className="px-5 py-2.5 font-semibold">{r.name}</td><td className="px-3 py-2.5 text-right tabular-nums">{r.done}</td><td className="px-3 py-2.5 text-right tabular-nums">{r.open}</td><td className="px-5 py-2.5 text-right tabular-nums">{tk(r.rev)}</td></tr>)}</tbody></table>
          {!staffRows.length && <p className="border-t border-hms-line px-5 py-6 text-[14px] text-hms-muted">No assigned jobs in this range.</p>}
        </section>
        <section className={clsx(card, "overflow-hidden xl:col-span-2")}><h3 className="px-5 pt-4 text-[17px] font-bold">Resource use</h3><p className="px-5 pb-3 text-[13px] text-hms-muted">Booked time out of 16 hours a day (07:00–23:00).</p>
          <ul className="grid gap-x-8 gap-y-3 border-t border-hms-line px-5 py-4 sm:grid-cols-2">{util.map((u) => <li key={u.name}><div className="flex justify-between text-[14px]"><span><b>{u.name}</b> <span className="text-hms-muted">· {u.type}</span></span><span className="tabular-nums">{u.pct}%</span></div><div className="mt-1 h-2 rounded-full bg-[#eef1f4]" role="img" aria-label={`${u.name} ${u.pct}% booked`}><div className="h-full rounded-full bg-[#1d4ed8]" style={{ width: `${Math.min(100, u.pct)}%` }} /></div></li>)}</ul>
        </section>
      </div>
    </>
  );
}

// ---------------- Setup ----------------
export function SetupPage() { return <Frame tab="setup"><Setup /></Frame>; }
export const CategoriesPage = SetupPage;
function Block({ title, sub, add, onAdd, children, icon: I }: { title: string; sub: string; add?: string; onAdd?: () => void; children: ReactNode; icon: typeof Package }) {
  return (
    <section className={clsx(card, "self-start overflow-hidden")}>
      <div className="flex items-start gap-3 px-5 py-4"><span className="grid size-9 place-items-center rounded-lg bg-[#f1edff] text-[#6b55e0]"><I className="size-4" aria-hidden /></span><div className="flex-1"><h2 className="text-[17px] font-bold">{title}</h2><p className="text-[13px] text-hms-muted">{sub}</p></div>{add && onAdd && <button onClick={onAdd} className={clsx(btnLine, "h-9 px-3")}><Plus className="size-4" />{add}</button>}</div>
      {children}
    </section>
  );
}
function Setup() {
  const { svc, open, toast } = useSvc();
  const router = useRouter();
  const edit = CAN.settings(svc.role);
  const s = svc.st.settings;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Block title="Categories" sub="Group related services so your team can find them quickly." add={edit ? "Add Category" : undefined} onAdd={() => open({ k: "cat" })} icon={Tag}>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Categories">
          <table className="w-full min-w-[460px] border-t border-hms-line text-[14px]">
            <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-medium">Category</th><th className="px-3 py-2.5 text-right font-medium">Active Services</th><th className="px-3 py-2.5 text-right font-medium">Archived</th><th className="px-5 py-2.5 text-right font-medium">Actions</th></tr></thead>
            <tbody>{svc.st.categories.map((c) => { const [I, tone] = iconFor(c.id); const a = svc.st.services.filter((x) => x.category === c.id && !x.archived).length, ar = svc.st.services.filter((x) => x.category === c.id && x.archived).length; return (
              <tr key={c.id} className="border-t border-hms-line">
                <td className="px-5 py-3"><span className="flex items-center gap-3"><span className={clsx("grid size-9 place-items-center rounded-lg", tone)}><I className="size-4" /></span><span><span className="block font-semibold">{c.name}</span><span className="text-[12.5px] text-hms-muted">{c.slug}</span></span></span></td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-hms-red">{a}</td><td className="px-3 py-3 text-right tabular-nums">{ar}</td>
                <td className="px-5 py-3"><span className="flex justify-end gap-2">{edit && <button onClick={() => open({ k: "cat", cat: c })} aria-label={`Edit ${c.name}`} className="grid size-9 place-items-center rounded-lg border border-hms-line hover:bg-hms-hover"><Pencil className="size-4" /></button>}<button onClick={() => router.push(`/hms/other-services/catalog?category=${c.id}`)} className={clsx(btnLine, "h-9 px-3")}>View Services</button></span></td>
              </tr>); })}</tbody>
          </table>
        </div>
      </Block>
      <Block title="Resources" sub="Cars, spa rooms, guides — booked for a time, never twice." add={edit ? "Add Resource" : undefined} onAdd={() => open({ k: "res" })} icon={Warehouse}>
        <ul className="border-t border-hms-line">{svc.st.resources.map((r) => <li key={r.id} className="flex items-center gap-3 border-t border-hms-line px-5 py-3 first:border-t-0"><span className="flex-1"><b className="block">{r.name}</b><span className="text-[12.5px] text-hms-muted">{RES_LABEL[r.type]}{r.off ? " · out of service" : ""}</span></span>{edit && <button onClick={() => open({ k: "res", item: r })} aria-label={`Edit ${r.name}`} className="grid size-9 place-items-center rounded-lg border border-hms-line hover:bg-hms-hover"><Pencil className="size-4" /></button>}</li>)}</ul>
      </Block>
      <Block title="Vendors" sub="Outside companies that do a service for you, with their cost." add={edit ? "Add Vendor" : undefined} onAdd={() => open({ k: "vendor" })} icon={BedDouble}>
        <ul className="border-t border-hms-line">{svc.st.vendors.map((v) => <li key={v.id} className="flex items-center gap-3 border-t border-hms-line px-5 py-3 first:border-t-0"><span className="flex-1"><b className="block">{v.name}</b><span className="text-[12.5px] text-hms-muted">{[v.phone, v.note].filter(Boolean).join(" · ")} · {svc.st.services.filter((x) => x.vendor === v.id).length} service(s)</span></span>{edit && <button onClick={() => open({ k: "vendor", item: v })} aria-label={`Edit ${v.name}`} className="grid size-9 place-items-center rounded-lg border border-hms-line hover:bg-hms-hover"><Pencil className="size-4" /></button>}</li>)}
          {!svc.st.vendors.length && <li className="px-5 py-4 text-[14px] text-hms-muted">No vendors yet.</li>}</ul>
      </Block>
      <Block title="Charges & roles" sub="Service charge, VAT, discounts and who can do what." icon={Settings2}>
        <div id="roles" className="space-y-4 border-t border-hms-line px-5 py-4">
          <div className="grid grid-cols-3 gap-3">
            {([["sc", "Service charge %"], ["vat", "VAT %"], ["discountLimit", "Front desk discount up to %"]] as const).map(([k, l]) => <div key={k}><label htmlFor={`st-${k}`} className="mb-1.5 block text-[13px] font-semibold">{l}</label><input id={`st-${k}`} inputMode="numeric" disabled={!edit} value={s[k]} onChange={(e) => svc.setSettings({ [k]: Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0) })} className="h-11 w-full rounded-lg border border-[#858c97] bg-white px-3 text-[15px] outline-none focus:border-hms-ink disabled:bg-[#f4f6f8]" /></div>)}
          </div>
          <p className="text-[12.5px] text-hms-muted">New orders use these. Saved orders keep the amounts they were made with.</p>
          <ul className="divide-y divide-hms-line rounded-xl border border-hms-line text-[13.5px]">
            <li className="px-4 py-3"><b className="block">Front desk</b><span className="text-hms-muted">Create orders, accept / decline guest requests, assign staff, cancel unpaid orders, discount up to the limit.</span></li>
            <li className="px-4 py-3"><b className="block">Department staff</b><span className="text-hms-muted">See the board, start and finish their jobs. Can&apos;t create, cancel or change prices.</span></li>
            <li className="px-4 py-3"><b className="block">Manager</b><span className="text-hms-muted">Everything, plus refunds on paid orders, any discount, catalog, resources, vendors and these settings.</span></li>
          </ul>
          <div className="rounded-xl bg-[#f4f6f8] p-3">
            <p className="text-[13px] font-semibold">Prototype: try it as</p>
            <div role="radiogroup" aria-label="Acting as" className="mt-2 flex flex-wrap gap-1.5">{(["frontdesk", "dept", "manager"] as Role[]).map((r) => <button key={r} role="radio" aria-checked={svc.role === r} onClick={() => { svc.setSettings({ role: r }); toast(`Now acting as ${ROLE_LABEL[r]}`); }} className={clsx("h-9 rounded-lg px-3 text-[13.5px] font-semibold", svc.role === r ? "bg-hms-ink text-white" : "border border-hms-line bg-white")}>{ROLE_LABEL[r]}</button>)}</div>
            <p className="mt-2 text-[12px] text-hms-muted">In the real HMS the role comes from Staff permissions per property.</p>
          </div>
        </div>
      </Block>
    </div>
  );
}
