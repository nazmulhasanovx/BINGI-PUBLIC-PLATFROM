"use client";
import { imgSrc } from "@/lib/img";
import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { BedDouble, CircleAlert, ImagePlus, Info, Plus, Search, Trash2, TriangleAlert, X } from "lucide-react";
import { CAN, RES_LABEL, ROLE_LABEL, SAMPLE_ART, SOURCE_LABEL, STATUS_LABEL, UNIT_LABEL, charges, orderSub, orderTotal, statusOf, tk, whenLabel, type BookingRef, type Order, type ResType, type Resource, type Service, type SvcCategory, type Unit, type Vendor, type WorkStatus, type useServices } from "@/lib/services/store";
import { useHrm, type Dept } from "@/lib/hrm/store";
import type { Item as InvItem } from "@/lib/inventory/store";
import { TODAY as TODAY_ISO } from "@/lib/rooms/store";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";

type Svc = ReturnType<typeof useServices>;
export const Err = ({ children }: { children: ReactNode }) => <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-[#c81e1e]"><CircleAlert className="size-3.5" />{children}</p>;
export const Note = ({ tone = "info", title, children }: { tone?: "info" | "warn"; title: string; children: ReactNode }) => (
  <div className={clsx("flex gap-2.5 rounded-lg px-3.5 py-2.5 text-[13px]", tone === "warn" ? "bg-[#fff6e5] text-[#7a4a0b]" : "bg-[#f4f2fb] text-[#4d5664]")}>
    {tone === "warn" ? <TriangleAlert className="mt-0.5 size-4 shrink-0" /> : <Info className="mt-0.5 size-4 shrink-0 text-[#6b55e0]" />}
    <span><b className={tone === "warn" ? "" : "text-[#3b2f8f]"}>{title}</b><span className="block">{children}</span></span>
  </div>
);
export const Foot = ({ onClose, label, onSave, disabled, cancel = "Cancel" }: { onClose: () => void; label: string; onSave: () => void; disabled?: boolean; cancel?: string }) => (
  <><button onClick={onClose} className={clsx(btnLine, "flex-1")}>{cancel}</button><button onClick={onSave} disabled={disabled} className={clsx(btnPrimary, "flex-1")}>{label}</button></>
);
export const Seg = ({ value, options, onChange, label }: { value: string; options: [string, string][]; onChange: (v: string) => void; label: string }) => (
  <div role="radiogroup" aria-label={label} className="flex rounded-lg bg-[#e9edf2] p-1">
    {options.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={clsx("min-h-9 flex-1 rounded-md px-2 py-1.5 text-[14px] font-semibold leading-tight", value === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>)}
  </div>
);

/** Illustrated sample artwork (design note: preview uses sample art); real photos come from upload. */
export function ServiceImage({ src, className }: { src?: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- uploaded data URL
  if (src && src !== SAMPLE_ART) return <img src={imgSrc(src)} alt="" className={clsx("object-cover", className)} />;
  return (
    <svg viewBox="0 0 320 120" className={className} aria-hidden>
      <rect width="320" height="120" fill="#dfe9f1" /><circle cx="250" cy="34" r="16" fill="#f5c46b" />
      <path d="M0 78 Q60 50 120 72 T240 66 T320 70 V120 H0Z" fill="#b7cbd8" /><path d="M0 92 Q80 76 160 90 T320 88 V120 H0Z" fill="#9ab4c4" />
      <path d="M0 104 H320 V120 H0Z" fill="#c9d3c1" /><g transform="translate(120 70)"><rect x="0" y="10" width="70" height="20" rx="6" fill="#fff" stroke="#3b4a57" strokeWidth="2" /><path d="M12 10 L22 0 H48 L58 10" fill="#fff" stroke="#3b4a57" strokeWidth="2" /><circle cx="16" cy="31" r="6" fill="#3b4a57" /><circle cx="54" cy="31" r="6" fill="#3b4a57" /></g>
    </svg>
  );
}

// ---------------- Service ----------------
const DEPTS: Dept[] = ["Front Office", "Housekeeping", "Kitchen", "Maintenance", "Security", "Management"];
export function ServiceSheet({ svc, item, invItems, onClose }: { svc: Svc; item?: Service; invItems: InvItem[]; onClose: () => void }) {
  const cats = svc.st.categories;
  const [f, setF] = useState<Service>(item ?? { id: svc.uid("s"), name: "", category: cats[0]?.id ?? "", duration: "", price: 0, description: "", unit: "each", dept: "Front Office", guestRequest: true });
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Service>(k: K, v: Service[K]) => setF((x) => ({ ...x, [k]: v }));
  const dup = svc.st.services.some((s) => s.id !== f.id && s.name.trim().toLowerCase() === f.name.trim().toLowerCase());
  const badVar = (f.variants ?? []).some((v) => !v.name.trim() || !(v.price > 0));
  const errs = { name: !f.name.trim() ? "Enter the service name" : dup ? "A service with this name already exists" : "", price: !(Number(price) > 0) ? "Enter a price above 0" : "", vars: badVar ? "Each option needs a name and a price" : "" };
  const save = () => { setTried(true); if (errs.name || errs.price || errs.vars) return; svc.saveService({ ...f, name: f.name.trim(), price: Number(price), variants: f.variants?.length ? f.variants : undefined, consumes: f.consumes?.filter((c) => c.qty > 0) }); onClose(); };
  const pickImage = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); const w = Math.min(640, img.width); c.width = w; c.height = Math.round((img.height * w) / img.width); c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); set("image", c.toDataURL("image/jpeg", 0.75)); }; img.src = String(r.result); };
    r.readAsDataURL(file);
  };
  const u = f.unit ?? "each";
  return (
    <Sheet wide title={item ? "Edit Service" : "Add Service"} sub={item ? "Changes apply to new orders. Past orders keep their price." : "Add a service your staff can order and guests can request."} onClose={onClose} footer={<Foot onClose={onClose} label="Save Service" onSave={save} />}>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><label htmlFor="sv-name" className={lbl}>Service Name</label><input id="sv-name" autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Evening Shuttle" className={input} />{tried && errs.name && <Err>{errs.name}</Err>}</div>
          <div><label htmlFor="sv-cat" className={lbl}>Category</label><select id="sv-cat" value={f.category} onChange={(e) => set("category", e.target.value)} className={input}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label htmlFor="sv-dept" className={lbl}>Done by department</label><select id="sv-dept" value={f.dept ?? "Front Office"} onChange={(e) => set("dept", e.target.value as Dept)} className={input}>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select></div>
        </div>
        <fieldset className="space-y-3 rounded-xl border border-hms-line p-4">
          <legend className="px-1 text-[14px] font-semibold">Price</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label htmlFor="sv-price" className={lbl}>Price (BDT)</label><input id="sv-price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="0" className={input} />{tried && errs.price && <Err>{errs.price}</Err>}</div>
            <div><label htmlFor="sv-unit" className={lbl}>Charged</label><select id="sv-unit" value={u} onChange={(e) => set("unit", e.target.value as Unit)} className={input}>{(Object.keys(UNIT_LABEL) as Unit[]).map((k) => <option key={k} value={k}>{UNIT_LABEL[k][1]}</option>)}</select></div>
            {u === "person" && <div><label htmlFor="sv-child" className={lbl}>Child price</label><input id="sv-child" inputMode="numeric" value={f.childPrice ?? ""} onChange={(e) => set("childPrice", Number(e.target.value.replace(/\D/g, "")) || undefined)} placeholder="Same as adult" className={input} /></div>}
          </div>
          <div>
            <p className="text-[13.5px] font-semibold">Options <span className="font-normal text-hms-muted">· e.g. Sedan / Microbus, 60 / 90 min</span></p>
            <div className="mt-2 space-y-2">{(f.variants ?? []).map((v, i) => (
              <div key={v.id} className="grid grid-cols-[1fr_120px_36px] gap-2">
                <input aria-label={`Option ${i + 1} name`} value={v.name} onChange={(e) => set("variants", f.variants!.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Option name" className={input} />
                <input aria-label={`Option ${i + 1} price`} inputMode="numeric" value={v.price || ""} onChange={(e) => set("variants", f.variants!.map((x, j) => j === i ? { ...x, price: Number(e.target.value.replace(/\D/g, "")) || 0 } : x))} placeholder="৳" className={input} />
                <button type="button" onClick={() => set("variants", f.variants!.filter((_, j) => j !== i))} aria-label={`Remove option ${i + 1}`} className="grid size-11 place-items-center rounded-lg hover:bg-hms-hover"><Trash2 className="size-4 text-hms-muted" /></button>
              </div>
            ))}</div>
            <button type="button" onClick={() => set("variants", [...(f.variants ?? []), { id: svc.uid("v"), name: "", price: Number(price) || 0 }])} className={clsx(btnLine, "mt-2 h-9 px-3")}><Plus className="size-4" />Add option</button>
            {tried && errs.vars && <Err>{errs.vars}</Err>}
          </div>
          <label className="flex items-center gap-2.5 text-[14px]"><input type="checkbox" checked={!f.noTax} onChange={(e) => set("noTax", !e.target.checked)} className="size-4 accent-[#b11c29]" /> Add service charge {svc.st.settings.sc}% + VAT {svc.st.settings.vat}%</label>
        </fieldset>
        <fieldset className="space-y-3 rounded-xl border border-hms-line p-4">
          <legend className="px-1 text-[14px] font-semibold">Scheduling</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label htmlFor="sv-res" className={lbl}>Needs a</label><select id="sv-res" value={f.resourceType ?? ""} onChange={(e) => set("resourceType", (e.target.value || undefined) as ResType | undefined)} className={input}><option value="">Nothing to book</option>{(Object.keys(RES_LABEL) as ResType[]).map((k) => <option key={k} value={k}>{RES_LABEL[k]}</option>)}</select></div>
            {f.resourceType && <div><label htmlFor="sv-min" className={lbl}>Blocks it for (min)</label><input id="sv-min" inputMode="numeric" value={f.minutes ?? 60} onChange={(e) => set("minutes", Number(e.target.value.replace(/\D/g, "")) || 60)} className={input} /></div>}
            <div className={f.resourceType ? "" : "sm:col-span-2"}><label htmlFor="sv-dur" className={lbl}>Duration shown</label><input id="sv-dur" value={f.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 30 min" className={input} /></div>
          </div>
          {f.resourceType && <p className="text-[12.5px] text-hms-muted">Orders pick a free {RES_LABEL[f.resourceType].toLowerCase()} automatically. If all are busy at that time, the next free time is suggested — no double booking.</p>}
        </fieldset>
        <fieldset className="space-y-3 rounded-xl border border-hms-line p-4">
          <legend className="px-1 text-[14px] font-semibold">Cost</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor="sv-vendor" className={lbl}>Outside vendor</label><select id="sv-vendor" value={f.vendor ?? ""} onChange={(e) => set("vendor", e.target.value || undefined)} className={input}><option value="">Done by our team</option>{svc.st.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            {f.vendor && <div><label htmlFor="sv-vcost" className={lbl}>Vendor cost (৳ per {u === "each" ? "service" : u})</label><input id="sv-vcost" inputMode="numeric" value={f.vendorCost ?? ""} onChange={(e) => set("vendorCost", Number(e.target.value.replace(/\D/g, "")) || undefined)} className={input} /></div>}
          </div>
          <div>
            <p className="text-[13.5px] font-semibold">Stock used each time <span className="font-normal text-hms-muted">· taken from Inventory when the job is done</span></p>
            <div className="mt-2 space-y-2">{(f.consumes ?? []).map((c, i) => { const it = invItems.find((x) => x.id === c.item); return (
              <div key={i} className="grid grid-cols-[1fr_120px_36px] gap-2">
                <select aria-label={`Stock item ${i + 1}`} value={c.item} onChange={(e) => set("consumes", f.consumes!.map((x, j) => j === i ? { ...x, item: e.target.value } : x))} className={input}>{invItems.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                <div className="flex h-11 items-center rounded-lg border border-[#858c97] pr-2"><input aria-label={`Quantity of ${it?.name}`} inputMode="decimal" value={c.qty || ""} onChange={(e) => set("consumes", f.consumes!.map((x, j) => j === i ? { ...x, qty: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 } : x))} className="h-full min-w-0 flex-1 bg-transparent px-3 outline-none" /><span className="text-[12.5px] text-hms-muted">{it?.unit}</span></div>
                <button type="button" onClick={() => set("consumes", f.consumes!.filter((_, j) => j !== i))} aria-label={`Remove ${it?.name}`} className="grid size-11 place-items-center rounded-lg hover:bg-hms-hover"><Trash2 className="size-4 text-hms-muted" /></button>
              </div>
            ); })}</div>
            {invItems.length > 0 && <button type="button" onClick={() => set("consumes", [...(f.consumes ?? []), { item: invItems[0].id, qty: 1 }])} className={clsx(btnLine, "mt-2 h-9 px-3")}><Plus className="size-4" />Add stock item</button>}
          </div>
        </fieldset>
        <div><label htmlFor="sv-desc" className={lbl}>Description</label><textarea id="sv-desc" rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="One line guests will see" className={clsx(input, "h-auto py-2.5")} /></div>
        <label className="flex items-start gap-2.5 rounded-xl border border-hms-line p-3 text-[14px]"><input type="checkbox" checked={!!f.guestRequest} onChange={(e) => set("guestRequest", e.target.checked)} className="mt-0.5 size-4 accent-[#b11c29]" /><span><b className="block">Guests can request it</b><span className="text-[12.5px] text-hms-muted">From the Guest App, the room QR and the website. Staff accept or decline each request.</span></span></label>
        <div className="border-t border-hms-line pt-4">
          <p className="mb-2 text-[14px] font-semibold">Public Website Image</p>
          {f.image ? (
            <div className="relative overflow-hidden rounded-xl border border-hms-line"><ServiceImage src={f.image} className="h-32 w-full" /><button type="button" onClick={() => set("image", undefined)} aria-label="Remove image" className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg bg-white/90 shadow"><X className="size-4" /></button></div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#858c97] px-4 py-3 hover:bg-hms-hover">
              <ImagePlus className="size-5 text-hms-muted" /><span><span className="block text-[14px] font-semibold">Upload image</span><span className="text-[12.5px] text-hms-muted">Add a photo for your website</span></span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickImage(e.target.files?.[0])} />
            </label>
          )}
          <div className="mt-3"><Note title="Horizon Experiences">Active services with an image appear on the public website.</Note></div>
        </div>
      </div>
    </Sheet>
  );
}

// ---------------- Order (new / edit) ----------------
export function OrderSheet({ svc, order, serviceId, onClose, onDone }: { svc: Svc; order?: Order; serviceId?: string; onClose: () => void; onDone: (id: string, msg: string) => void }) {
  const { st: hrm } = useHrm();
  const active = svc.st.services.filter((s) => !s.archived || s.id === order?.service);
  const [sid, setSid] = useState(order?.service ?? serviceId ?? active[0]?.id ?? "");
  const s = svc.st.services.find((x) => x.id === sid);
  const [variant, setVariant] = useState(order?.variant ?? s?.variants?.[0]?.id ?? "");
  const [method, setMethod] = useState<Order["method"]>(order?.method ?? "booking");
  const [qty, setQty] = useState(String(order?.qty ?? 1));
  const [kids, setKids] = useState(String(order?.children ?? ""));
  const [disc, setDisc] = useState(order?.discount ? String(order.discount) : "");
  const [mode, setMode] = useState<"now" | "schedule">(order && order.when !== "now" ? "schedule" : s?.resourceType ? "schedule" : "now");
  const [date, setDate] = useState(order && order.when !== "now" ? order.when.date : TODAY_ISO);
  const [time, setTime] = useState(order && order.when !== "now" ? order.when.time : "16:30");
  const [booking, setBooking] = useState<BookingRef | undefined>(order?.booking ?? (order ? undefined : svc.bookings[0]));
  const [assignee, setAssignee] = useState(order?.assignee ?? "");
  const [findB, setFindB] = useState(false);
  const [q, setQ] = useState("");
  const [guest, setGuest] = useState(order?.walkIn?.name ?? "Walk-in Guest");
  const [phone, setPhone] = useState(order?.walkIn?.phone ?? "");
  const [tried, setTried] = useState(false);
  const [err, setErr] = useState("");
  const pickSvc = (id: string) => { setSid(id); const x = svc.st.services.find((y) => y.id === id); setVariant(x?.variants?.[0]?.id ?? ""); if (x?.resourceType) setMode("schedule"); setErr(""); };
  const unitName = UNIT_LABEL[s?.unit ?? "each"];
  const n = Math.max(0, Math.floor(Number(qty) || 0)), k = Math.max(0, Math.floor(Number(kids) || 0));
  const v = s?.variants?.find((x) => x.id === variant);
  const unit = order && order.service === sid && order.variant === (variant || undefined) ? order.unitPrice : v?.price ?? s?.price ?? 0;
  const childPrice = s?.unit === "person" ? (order?.childPrice ?? s.childPrice ?? unit) : 0;
  const gross = n * unit + (s?.unit === "person" ? k * childPrice : 0);
  const d = Math.min(gross, Math.round(Number(disc) || 0));
  const pct = gross ? Math.round((d / gross) * 100) : 0;
  const overDisc = pct > svc.st.settings.discountLimit && !CAN.refund(svc.role);
  const ch = charges(gross - d, svc.st.settings, s?.noTax);
  const total = gross - d + ch.sc + ch.vat;
  const noBooking = method === "booking" && !booking;
  const noCash = method === "cash" && !svc.st.cashboxOpen;
  const badTime = mode === "schedule" && (!date || !time || date < TODAY_ISO);
  const toM = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));
  const free = s?.resourceType && mode === "schedule" && !badTime ? svc.freeAt(s.resourceType, date, toM(time), s.minutes ?? 60, order?.id) : null;
  const next = s?.resourceType && free && !free.length ? svc.nextFree(s.resourceType, date, toM(time), s.minutes ?? 60, order?.id) : null;
  const staff = hrm.employees.filter((e) => e.status === "active" && (!s?.dept || e.dept === s.dept));
  const disabled = !s || n < 1 || noCash || overDisc || (tried && (noBooking || badTime));
  const lockedMethod = !!order;
  const save = () => {
    setTried(true);
    if (!s || n < 1 || noBooking || noCash || badTime || overDisc) return;
    const r = svc.saveOrder({
      id: order?.id, service: sid, variant: variant || undefined, qty: n, children: s.unit === "person" && k ? k : undefined, childPrice: s.unit === "person" && k ? childPrice : undefined,
      unitPrice: unit, discount: d || undefined, ...ch, method, assignee: assignee || undefined, resource: order?.resource,
      booking: method === "booking" ? booking : undefined, walkIn: method === "cash" ? { name: guest.trim() || "Walk-in Guest", phone: phone.trim() } : undefined,
      when: mode === "now" ? "now" : { date, time }, payment: method === "cash" ? "Paid" : order?.payment ?? "Unpaid", status: order?.status, source: order?.source, vendorCost: s.vendorCost ? s.vendorCost * (n + k) : undefined,
    });
    if ("error" in r) { setErr(r.error); return; }
    onDone(r.id, order ? `Order ${order.id} updated` : method === "cash" ? `${s.name} — cash sale saved` : `${s.name} charged to ${booking?.code}`);
    onClose();
  };
  const matches = svc.bookings.filter((b) => !q || `${b.code} ${b.guest} ${b.room}`.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  return (
    <Sheet title={order ? "Edit Service Order" : "New Service Order"} sub={order ? `Update order ${order.id}.` : "Record a service for a booking or a walk-in guest."} onClose={onClose}
      footer={<Foot onClose={onClose} label={order ? "Save Changes" : "Save Order"} onSave={save} disabled={disabled} />}>
      <div className="space-y-4">
        <div><label htmlFor="or-svc" className={lbl}>Service</label>
          <select id="or-svc" value={sid} disabled={!!order} onChange={(e) => pickSvc(e.target.value)} className={clsx(input, order && "bg-[#f4f6f8] text-[#4d5664]")}>{active.map((x) => <option key={x.id} value={x.id}>{x.name} · {tk(x.variants?.[0]?.price ?? x.price)} {UNIT_LABEL[x.unit ?? "each"][1]}</option>)}</select></div>
        {s?.variants?.length ? <div><p className={lbl}>Option</p><Seg label="Option" value={variant} onChange={setVariant} options={s.variants.map((x) => [x.id, `${x.name} · ${tk(x.price)}`] as [string, string])} /></div> : null}
        <div><p className={lbl}>Charge Method</p>
          {lockedMethod ? <p className="flex h-11 items-center rounded-lg bg-[#f4f6f8] px-3 text-[14px] font-semibold">{method === "booking" ? "Charge to booking" : "Cash sale"}</p>
            : <Seg label="Charge method" value={method} onChange={(x) => setMethod(x as Order["method"])} options={[["booking", "Charge to booking"], ["cash", "Cash sale"]]} />}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="or-qty" className={lbl}>{s?.unit === "person" ? "Adults" : unitName[0]}</label><input id="or-qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} className={input} />{n < 1 && <Err>At least 1</Err>}</div>
          {s?.unit === "person" ? <div><label htmlFor="or-kids" className={lbl}>Children <span className="font-normal text-hms-muted">{tk(childPrice)} each</span></label><input id="or-kids" inputMode="numeric" value={kids} onChange={(e) => setKids(e.target.value.replace(/\D/g, ""))} placeholder="0" className={input} /></div>
            : <div><p className={lbl}>Requested Time</p><Seg label="Requested time" value={mode} onChange={(x) => setMode(x as "now" | "schedule")} options={[["now", "Now"], ["schedule", "Schedule"]]} /></div>}
        </div>
        {s?.unit === "person" && <div><p className={lbl}>Requested Time</p><Seg label="Requested time" value={mode} onChange={(x) => setMode(x as "now" | "schedule")} options={[["now", "Now"], ["schedule", "Schedule"]]} /></div>}
        {mode === "schedule" && (
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="or-date" className={lbl}>Requested Date</label><input id="or-date" type="date" min={TODAY_ISO} value={date} onChange={(e) => { setDate(e.target.value); setErr(""); }} className={input} /></div>
            <div><label htmlFor="or-time" className={lbl}>Requested Time <span className="font-normal text-hms-muted">· Dhaka</span></label><input id="or-time" type="time" value={time} onChange={(e) => { setTime(e.target.value); setErr(""); }} className={input} /></div>
            {tried && badTime && <div className="col-span-2"><Err>Pick a date from today on and a time</Err></div>}
          </div>
        )}
        {s?.resourceType && free && (
          free.length ? <p className="rounded-lg bg-[#e5f5ec] px-3 py-2 text-[13px] text-[#16693a]">{free.length} {RES_LABEL[s.resourceType].toLowerCase()}{free.length > 1 ? "s" : ""} free · will use <b>{free[0].name}</b> for {s.minutes ?? 60} min</p>
            : <div className="rounded-lg bg-[#fde8e8] px-3 py-2 text-[13px] text-[#a11d2a]">Every {RES_LABEL[s.resourceType].toLowerCase()} is booked at {time}.{next && <> <button type="button" onClick={() => setTime(next)} className="font-semibold underline">Use {next} instead</button></>}</div>
        )}
        {method === "booking" ? (
          <div><p className={lbl}>Booking</p>
            {booking && !findB ? (
              <div className="flex items-center gap-3 rounded-lg border border-hms-line bg-[#fafafc] px-3 py-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-white text-hms-muted ring-1 ring-hms-line"><BedDouble className="size-4" /></span>
                <span className="flex-1"><span className="block text-[14px] font-semibold">{booking.guest} · Room {booking.room}</span><span className="text-[12.5px] text-hms-muted">{booking.code} · {booking.phone}</span></span>
                {!order && <button type="button" onClick={() => { setFindB(true); setQ(""); setBooking(undefined); }} className="text-[13.5px] font-semibold text-hms-red">Change</button>}
              </div>
            ) : (
              <div>
                <label className={clsx("flex h-11 items-center gap-2 rounded-lg border bg-white px-3", tried && noBooking ? "border-[#c81e1e]" : "border-[#858c97] focus-within:border-hms-ink")}>
                  <Search className="size-4 text-hms-muted" /><span className="sr-only">Find booking</span>
                  <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking ID, guest name or room" className="h-full flex-1 bg-transparent text-[14.5px] outline-none" />
                </label>
                {tried && noBooking && <Err>Select a booking to continue.</Err>}
                <ul className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-hms-line">
                  {matches.map((b) => <li key={b.code}><button type="button" onClick={() => { setBooking(b); setFindB(false); }} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-hms-hover"><span className="flex-1 text-[14px]"><b>{b.guest}</b> · Room {b.room}</span><span className="font-mono text-[12.5px] text-hms-muted">{b.code}</span></button></li>)}
                  {!matches.length && <li className="px-3 py-3 text-[13.5px] text-hms-muted">No in-house or upcoming booking matches.</li>}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="or-gn" className={lbl}>Guest Name</label><input id="or-gn" value={guest} onChange={(e) => setGuest(e.target.value)} className={input} /></div>
              <div><label htmlFor="or-gp" className={lbl}>Guest Phone <span className="font-normal text-hms-muted">Optional</span></label><input id="or-gp" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone" className={input} /></div>
            </div>
            {svc.st.cashboxOpen ? <Note title="Cashbox">Cash posts to today’s open Cashbox.</Note> : <Note tone="warn" title="No open Cashbox">Open a Cashbox before saving a cash sale.</Note>}
            <button type="button" onClick={() => svc.setCashbox(!svc.st.cashboxOpen)} className="-mt-2 text-[12.5px] text-hms-muted underline">Prototype: mark Cashbox {svc.st.cashboxOpen ? "closed" : "open"}</button>
          </>
        )}
        {!order && CAN.assign(svc.role) && <div><label htmlFor="or-who" className={clsx(lbl, "flex justify-between")}>Assign to <span className="font-normal text-hms-muted">Optional · {s?.dept ?? "any"} staff</span></label><select id="or-who" value={assignee} onChange={(e) => setAssignee(e.target.value)} className={input}><option value="">Assign later</option>{staff.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.position}</option>)}</select></div>}
        <div><label htmlFor="or-disc" className={clsx(lbl, "flex justify-between")}>Discount (৳) <span className="font-normal text-hms-muted">{CAN.refund(svc.role) ? "Any amount" : `Up to ${svc.st.settings.discountLimit}% without a manager`}</span></label><input id="or-disc" inputMode="numeric" value={disc} onChange={(e) => setDisc(e.target.value.replace(/\D/g, ""))} placeholder="0" className={input} aria-invalid={overDisc} />{overDisc && <Err>{pct}% is above your {svc.st.settings.discountLimit}% limit — ask a manager.</Err>}</div>
        <div className="rounded-xl border border-hms-line px-4 py-3 text-[14px]">
          <div className="flex justify-between"><span className="text-hms-muted">{n} × {tk(unit)}{s?.unit === "person" && k ? ` + ${k} child × ${tk(childPrice)}` : ""}</span><span className="tabular-nums">{tk(gross)}</span></div>
          {d > 0 && <div className="flex justify-between"><span className="text-hms-muted">Discount</span><span className="tabular-nums">−{tk(d)}</span></div>}
          {!s?.noTax && <><div className="flex justify-between"><span className="text-hms-muted">Service charge {svc.st.settings.sc}%</span><span className="tabular-nums">{tk(ch.sc)}</span></div><div className="flex justify-between"><span className="text-hms-muted">VAT {svc.st.settings.vat}%</span><span className="tabular-nums">{tk(ch.vat)}</span></div></>}
          <div className="mt-1.5 flex items-end justify-between border-t border-hms-line pt-2"><span><span className="block font-semibold">Order Total</span><span className="text-[12.5px] text-hms-muted">{method === "cash" ? "Cash sale · paid now" : booking ? `Charge to booking · ${booking.code}` : "Booking required"}</span></span><b className="text-[22px] tabular-nums">{tk(total)}</b></div>
        </div>
        {order && order.service === sid && s && (v?.price ?? s.price) !== order.unitPrice && <p className="text-[12.5px] text-hms-muted">Kept the order price {tk(order.unitPrice)} (catalog is now {tk(v?.price ?? s.price)}).</p>}
        {err && <Err>{err}</Err>}
      </div>
    </Sheet>
  );
}

// ---------------- Details (work + money) ----------------
export const WORK_TONE: Record<WorkStatus | "cancelled", string> = { requested: "bg-[#fde8e8] text-[#a11d2a]", confirmed: "bg-[#fdf3d9] text-[#7a5200]", assigned: "bg-[#e8f0fe] text-[#1d4ed8]", in_progress: "bg-[#eeebfc] text-[#5b44c9]", done: "bg-[#e5f5ec] text-[#16693a]", declined: "bg-hms-hover text-[#4d5664]", cancelled: "bg-hms-hover text-[#4d5664]" };
export function WorkPill({ o }: { o: Order }) { const s = statusOf(o); return <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[12.5px] font-semibold", WORK_TONE[s])}><span className="size-1.5 rounded-full bg-current" />{s === "cancelled" ? "Cancelled" : STATUS_LABEL[s]}</span>; }

export function DetailsSheet({ svc, order, onClose, onEdit, onCancel, onAct }: { svc: Svc; order: Order; onClose: () => void; onEdit: () => void; onCancel: () => void; onAct: (a: "accept" | "decline" | "assign" | "start" | "done") => void }) {
  const { st: hrm } = useHrm();
  const s = svc.st.services.find((x) => x.id === order.service);
  const v = s?.variants?.find((x) => x.id === order.variant);
  const st = statusOf(order);
  const editable = !order.cancelled && order.method === "booking" && order.payment === "Unpaid" && st !== "done" && CAN.create(svc.role);
  const who = hrm.employees.find((e) => e.id === order.assignee);
  const res = svc.st.resources.find((r) => r.id === order.resource);
  const vendor = s?.vendor ? svc.st.vendors.find((x) => x.id === s.vendor) : undefined;
  const rows: [string, string][] = [
    [order.method === "booking" ? "Booking" : "Sale", order.method === "booking" ? order.booking?.code ?? "—" : "Walk-in · Cash sale"],
    ["Guest", order.method === "booking" ? `${order.booking?.guest} · Room ${order.booking?.room}` : `${order.walkIn?.name}${order.walkIn?.phone ? ` · ${order.walkIn.phone}` : ""}`],
    ["Requested time", whenLabel(order)], ["Requested via", SOURCE_LABEL[order.source ?? "staff"]],
    ["Assigned to", who ? `${who.name} · ${who.position}` : "Not yet"], ...(res ? [["Resource", `${res.name} · ${order.minutes ?? 60} min`] as [string, string]] : []),
    ...(vendor ? [["Vendor", `${vendor.name}${order.vendorCost ? ` · cost ${tk(order.vendorCost)}` : ""}`] as [string, string]] : []),
    ["Payment", order.payment + (order.refund ? ` · ${tk(order.refund.amount)} by ${order.refund.method}` : "")], ["Recorded", order.created.replace("T", " · ")],
  ];
  const next: [string, "accept" | "assign" | "start" | "done"][] = st === "requested" ? [["Accept request", "accept"]] : st === "confirmed" ? [["Assign", "assign"]] : st === "assigned" ? [["Start", "start"]] : st === "in_progress" ? [["Mark done", "done"]] : [];
  const canWork = (a: string) => a === "start" || a === "done" ? true : CAN.assign(svc.role);
  return (
    <Sheet title="Order Details" sub={`${order.id} · ${s?.name}${v ? ` · ${v.name}` : ""}`} onClose={onClose}
      footer={<>
        <button onClick={onClose} className={clsx(btnLine, "flex-1")}>Close</button>
        {st === "requested" && CAN.assign(svc.role) && <button onClick={() => onAct("decline")} className={clsx(btnLine, "flex-1")}>Decline</button>}
        {next.filter(([, a]) => canWork(a)).map(([l, a]) => <button key={a} onClick={() => onAct(a)} className={clsx(btnPrimary, "flex-1")}>{l}</button>)}
        {editable && !next.length && <button onClick={onEdit} className={clsx(btnPrimary, "flex-1")}>Edit Order</button>}
      </>}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[17px] font-bold">{s?.name}</p><p className="text-[13px] text-hms-muted">{order.id}{v ? ` · ${v.name}` : ""}</p></div><div className="flex flex-col items-end gap-1"><WorkPill o={order} /><PayPill o={order} /></div></div>
        <div className="rounded-xl border border-hms-line px-4 py-3 text-[14px]">
          <div className="flex justify-between"><span className="text-hms-muted">{order.qty} × {tk(order.unitPrice)}{order.children ? ` + ${order.children} child × ${tk(order.childPrice ?? 0)}` : ""}</span><span className="tabular-nums">{tk(orderSub(order) + (order.discount ?? 0))}</span></div>
          {order.discount ? <div className="flex justify-between"><span className="text-hms-muted">Discount</span><span>−{tk(order.discount)}</span></div> : null}
          {(order.sc || order.vat) ? <div className="flex justify-between"><span className="text-hms-muted">Service charge + VAT</span><span className="tabular-nums">{tk((order.sc ?? 0) + (order.vat ?? 0))}</span></div> : null}
          <div className="mt-1.5 flex justify-between border-t border-hms-line pt-2"><span className="font-semibold">Order Total</span><b className={clsx("text-[20px] tabular-nums", order.cancelled && "text-hms-muted line-through")}>{tk(orderTotal(order))}</b></div>
        </div>
        <dl className="divide-y divide-hms-line text-[14px]">{rows.map(([k, x]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-hms-muted">{k}</dt><dd className="text-right font-semibold">{x}</dd></div>)}</dl>
        {order.cancelled && <Note tone="warn" title="Cancelled">{order.cancelled.reason}</Note>}
        {order.note && st === "declined" && <Note tone="warn" title="Declined">{order.note}</Note>}
        {order.log?.length ? <div><p className="text-[14px] font-semibold">Activity</p><ol className="mt-2 space-y-1.5 border-l-2 border-hms-line pl-3 text-[13px]">{order.log.map((l, i) => <li key={i}><b>{l.text}</b> <span className="text-hms-muted">· {l.at.slice(11, 16)} · {l.by}</span></li>)}</ol></div> : null}
        {!order.cancelled && st !== "declined" && (order.payment !== "Paid" || CAN.refund(svc.role)) && CAN.create(svc.role) && <button onClick={onCancel} className="text-[13.5px] font-semibold text-[#c81e1e]">Cancel this order</button>}
        {!order.cancelled && order.payment === "Paid" && !CAN.refund(svc.role) && <p className="text-[12.5px] text-hms-muted">Paid orders are cancelled with a refund — a manager does that.</p>}
      </div>
    </Sheet>
  );
}

export function CancelSheet({ svc, order, onClose, onDone }: { svc: Svc; order: Order; onClose: () => void; onDone: (m: string) => void }) {
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState<"" | "Cash" | "Bank" | "bKash" | "Booking bill">("");
  const s = svc.st.services.find((x) => x.id === order.service);
  const paid = order.payment === "Paid";
  return (
    <Sheet title="Cancel Service Order" sub={`Review order ${order.id} before cancelling.`} onClose={onClose}
      footer={<Foot onClose={onClose} cancel="Keep Order" label={paid ? "Cancel & Refund" : "Cancel Order"} disabled={!reason || (paid && !refund)} onSave={() => { svc.cancelOrder(order.id, reason, paid ? (refund || undefined) : undefined); onDone(paid ? `${order.id} cancelled — refund ${tk(orderTotal(order))} recorded` : `${order.id} cancelled`); onClose(); }} />}>
      <div className="space-y-4">
        <div className="rounded-xl border border-hms-line px-4 py-3">
          <div className="flex justify-between"><p className="text-[15px] font-semibold">{s?.name}</p><p className="text-[17px] font-bold tabular-nums">{tk(orderTotal(order))}</p></div>
          <p className="text-[13px] text-hms-muted">{order.id} · {order.method === "booking" ? order.booking?.code : "Cash sale"}</p>
          <div className="mt-2"><PayPill o={order} /></div>
        </div>
        {paid
          ? <div><p className={lbl}>Refund {tk(orderTotal(order))} by</p><Seg label="Refund method" value={refund} onChange={(x) => setRefund(x as typeof refund)} options={(order.method === "cash" ? [["Cash", "Cash"], ["bKash", "bKash"], ["Bank", "Bank"]] : [["Booking bill", "Credit to bill"], ["Cash", "Cash"], ["bKash", "bKash"]]) as [string, string][]} /><p className="mt-1.5 text-[12.5px] text-hms-muted">{refund === "Cash" ? "Pay it from today’s Cashbox." : refund === "Booking bill" ? "Shows as a credit on the guest’s bill." : "Record the transfer reference in Payments."}</p></div>
          : <Note tone="warn" title={order.method === "booking" ? "Linked booking charge" : "Cash sale"}>{order.method === "booking" ? "The charge is removed from the guest’s bill." : "Record the cash refund in Cashbox."}</Note>}
        <div><p className={lbl}>Reason</p>
          <div className="grid gap-2" role="radiogroup" aria-label="Reason">{["Guest changed plans", "Service not available", "Entered by mistake"].map((x) => <button key={x} type="button" role="radio" aria-checked={reason === x} onClick={() => setReason(x)} className={clsx("rounded-lg border px-3.5 py-3 text-left text-[14.5px]", reason === x ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}>{x}</button>)}</div></div>
      </div>
    </Sheet>
  );
}

export function PayPill({ o }: { o: Order }) {
  if (o.cancelled && o.payment !== "Refunded") return <span className="inline-flex items-center gap-1.5 rounded-md bg-hms-hover px-2 py-0.5 text-[12.5px] font-semibold text-[#4d5664]"><span className="size-1.5 rounded-full bg-current" />Cancelled</span>;
  return <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[12.5px] font-semibold", o.payment === "Paid" ? "bg-[#e5f5ec] text-[#16693a]" : o.payment === "Refunded" ? "bg-[#eeebfc] text-[#5b44c9]" : "bg-[#fdf3d9] text-[#7a5200]")}><span className="size-1.5 rounded-full bg-current" />{o.payment}</span>;
}

/** Assign staff (from HRM, filtered to the service's department) and the resource. */
export function AssignSheet({ svc, order, onClose, onDone }: { svc: Svc; order: Order; onClose: () => void; onDone: (m: string) => void }) {
  const { st: hrm } = useHrm();
  const s = svc.st.services.find((x) => x.id === order.service);
  const [all, setAll] = useState(false);
  const [who, setWho] = useState(order.assignee ?? "");
  const [res, setRes] = useState(order.resource ?? "");
  const staff = hrm.employees.filter((e) => e.status === "active" && (all || !s?.dept || e.dept === s.dept));
  const toM = (iso: string) => Number(iso.slice(0, 2)) * 60 + Number(iso.slice(3, 5));
  const slot = order.when === "now" ? { date: order.created.slice(0, 10), m: toM(order.created.slice(11, 16)) } : { date: order.when.date, m: toM(order.when.time) };
  const free = s?.resourceType ? svc.freeAt(s.resourceType, slot.date, slot.m, s.minutes ?? 60, order.id) : [];
  const busyLoad = (id: string) => svc.st.orders.filter((o) => o.assignee === id && !o.cancelled && ["assigned", "in_progress"].includes(o.status ?? "")).length;
  return (
    <Sheet title="Assign" sub={`${order.id} · ${s?.name} · ${whenLabel(order)}`} onClose={onClose} footer={<Foot onClose={onClose} label="Assign" disabled={!who} onSave={() => { svc.assign(order.id, who, res || undefined); onDone(`${order.id} assigned to ${hrm.employees.find((e) => e.id === who)?.name}`); onClose(); }} />}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between"><p className={lbl}>Staff {s?.dept && !all ? `· ${s.dept}` : ""}</p><label className="flex items-center gap-1.5 text-[13px]"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} className="size-4 accent-[#b11c29]" />Show all staff</label></div>
          <div role="radiogroup" aria-label="Staff" className="max-h-72 space-y-1.5 overflow-y-auto">{staff.map((e) => { const load = busyLoad(e.id); return (
            <button key={e.id} type="button" role="radio" aria-checked={who === e.id} onClick={() => setWho(e.id)} className={clsx("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left", who === e.id ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}>
              <span className="flex-1"><span className="block font-semibold">{e.name}</span><span className="text-[12.5px] text-hms-muted">{e.position} · {e.dept}</span></span>
              <span className={clsx("text-[12.5px]", load ? "text-[#7a5200]" : "text-[#16693a]")}>{load ? `${load} open job${load > 1 ? "s" : ""}` : "Free"}</span>
            </button>
          ); })}</div>
          <p className="mt-1.5 text-[12.5px] text-hms-muted">Staff come from Team &amp; HR. They see the job in the BinGi staff app.</p>
        </div>
        {s?.resourceType && <div><label htmlFor="as-res" className={lbl}>{RES_LABEL[s.resourceType]}</label><select id="as-res" value={res} onChange={(e) => setRes(e.target.value)} className={input}>{order.resource && <option value={order.resource}>{svc.st.resources.find((r) => r.id === order.resource)?.name} (current)</option>}{free.filter((r) => r.id !== order.resource).map((r) => <option key={r.id} value={r.id}>{r.name} · free</option>)}</select></div>}
      </div>
    </Sheet>
  );
}

export function DeclineSheet({ svc, order, onClose, onDone }: { svc: Svc; order: Order; onClose: () => void; onDone: (m: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Sheet title="Decline request" sub={`${order.id} · ${order.booking?.guest ?? ""}`} onClose={onClose} footer={<Foot onClose={onClose} label="Decline" disabled={!reason} onSave={() => { svc.decline(order.id, reason); onDone(`${order.id} declined — the guest is told why`); onClose(); }} />}>
      <div className="grid gap-2" role="radiogroup" aria-label="Reason">{["Fully booked at that time", "Not available today", "Weather", "Asked guest to choose another time"].map((x) => <button key={x} type="button" role="radio" aria-checked={reason === x} onClick={() => setReason(x)} className={clsx("rounded-lg border px-3.5 py-3 text-left text-[14.5px]", reason === x ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}>{x}</button>)}</div>
    </Sheet>
  );
}

export function ResourceSheet({ svc, item, onClose }: { svc: Svc; item?: Resource; onClose: () => void }) {
  const [name, setName] = useState(item?.name ?? "");
  const [type, setType] = useState<ResType>(item?.type ?? "car");
  const [off, setOff] = useState(!!item?.off);
  const used = item ? svc.st.orders.some((o) => o.resource === item.id && !o.cancelled && !["done", "declined"].includes(o.status ?? "")) : false;
  return (
    <Sheet title={item ? "Edit Resource" : "Add Resource"} sub="Something a service books for a time — a car, a spa room, a guide." onClose={onClose} footer={<Foot onClose={onClose} label="Save" disabled={!name.trim()} onSave={() => { svc.saveResource({ id: item?.id ?? svc.uid("r"), name: name.trim(), type, off }); onClose(); }} />}>
      <div className="space-y-4">
        <div><label htmlFor="rs-n" className={lbl}>Name</label><input id="rs-n" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Car 3 · Noah" className={input} /></div>
        <div><label htmlFor="rs-t" className={lbl}>Type</label><select id="rs-t" value={type} onChange={(e) => setType(e.target.value as ResType)} className={input}>{(Object.keys(RES_LABEL) as ResType[]).map((k) => <option key={k} value={k}>{RES_LABEL[k]}</option>)}</select></div>
        <label className="flex items-center gap-2.5 text-[14px]"><input type="checkbox" checked={off} onChange={(e) => setOff(e.target.checked)} className="size-4 accent-[#b11c29]" />Out of service (not booked)</label>
        {item && <button type="button" disabled={used} onClick={() => { svc.removeResource(item.id); onClose(); }} className="text-[13.5px] font-semibold text-[#c81e1e] disabled:text-hms-muted">{used ? "Has open orders — finish them to delete" : "Delete resource"}</button>}
      </div>
    </Sheet>
  );
}

export function VendorSheet({ svc, item, onClose }: { svc: Svc; item?: Vendor; onClose: () => void }) {
  const [f, setF] = useState<Vendor>(item ?? { id: svc.uid("vd"), name: "", phone: "", note: "" });
  return (
    <Sheet title={item ? "Edit Vendor" : "Add Vendor"} sub="An outside company that does a service for you." onClose={onClose} footer={<Foot onClose={onClose} label="Save" disabled={!f.name.trim()} onSave={() => { svc.saveVendor({ ...f, name: f.name.trim() }); onClose(); }} />}>
      <div className="space-y-4">
        <div><label htmlFor="vd-n" className={lbl}>Name</label><input id="vd-n" autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} /></div>
        <div><label htmlFor="vd-p" className={lbl}>Phone</label><input id="vd-p" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input} /></div>
        <div><label htmlFor="vd-x" className={lbl}>Note</label><input id="vd-x" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="What they do, payment terms" className={input} /></div>
      </div>
    </Sheet>
  );
}

export { ROLE_LABEL };

// ---------------- Category / preview ----------------
export function CategorySheet({ svc, cat, onClose }: { svc: Svc; cat?: SvcCategory; onClose: () => void }) {
  const [name, setName] = useState(cat?.name ?? "");
  const [tried, setTried] = useState(false);
  const dup = svc.st.categories.some((c) => c.id !== cat?.id && c.name.trim().toLowerCase() === name.trim().toLowerCase());
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const save = () => { setTried(true); if (!name.trim() || dup) return; svc.saveCategory({ id: cat?.id ?? svc.uid("c"), name: name.trim(), slug }); onClose(); };
  return (
    <Sheet title={cat ? "Edit Category" : "Add Category"} sub="Group related services so your team finds them quickly." onClose={onClose} footer={<Foot onClose={onClose} label="Save Category" onSave={save} />}>
      <div className="space-y-4">
        <div><label htmlFor="sc-name" className={lbl}>Category Name</label><input id="sc-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wellness" className={input} />
          {tried && !name.trim() && <Err>Enter a name</Err>}{tried && dup && <Err>This category already exists</Err>}</div>
        <p className="text-[13px] text-hms-muted">Website link: <span className="font-mono">/{slug || "category"}</span></p>
      </div>
    </Sheet>
  );
}

export function PreviewSheet({ svc, item, onClose, onBack }: { svc: Svc; item: Service; onClose: () => void; onBack: () => void }) {
  const c = svc.st.categories.find((x) => x.id === item.category);
  const visible = !item.archived && !!item.image;
  return (
    <Sheet title="Website Preview" sub="Preview the service card in Horizon Experiences." onClose={onClose} footer={<Foot onClose={onClose} cancel="Close" label="Back to Service" onSave={onBack} />}>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><p className="text-[14px] font-semibold">Horizon · Experiences</p>
          <span className={clsx("rounded-md px-2 py-0.5 text-[12.5px] font-semibold", visible ? "bg-[#e5f5ec] text-[#16693a]" : "bg-hms-hover text-[#4d5664]")}>{visible ? "● Visible on Horizon" : "Not on the website"}</span></div>
        <article className="overflow-hidden rounded-xl border border-hms-line">
          <div className="p-2"><div className="overflow-hidden rounded-lg">{item.image ? <ServiceImage src={item.image} className="h-40 w-full" /> : <div className="grid h-40 place-items-center bg-hms-hover text-[13px] text-hms-muted">No image yet</div>}</div></div>
          <div className="px-4 pb-4">
            <p className="text-[11.5px] font-bold uppercase tracking-wider text-hms-red">{c?.name}</p>
            <p className="text-[19px] font-bold">{item.name}</p>
            <p className="mt-0.5 text-[13.5px] text-[#4d5664]">{item.description || "—"}</p>
            <div className="mt-3 flex justify-between text-[13px]"><span className="text-hms-muted">{item.duration}</span><b>{tk(item.price)} per service</b></div>
          </div>
        </article>
        <Note title="Website visibility">{visible ? "This preview reflects the current Active service and its image." : item.archived ? "Archived services are hidden from the website." : "Add an image to show this service on the website."}</Note>
        {item.image === SAMPLE_ART && <p className="text-[12.5px] text-hms-muted">Sample artwork — replace it with a real photo before going live.</p>}
      </div>
    </Sheet>
  );
}
