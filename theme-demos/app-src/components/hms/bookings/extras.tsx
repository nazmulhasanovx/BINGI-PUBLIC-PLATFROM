"use client";
import { can } from "@/lib/plan";
// Meals & other services for a booking — the same picker in New booking (step 3) and on the booking page.
// Meals are held on the booking and sent to the kitchen on the day; services become real Other Services orders.
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Coffee, Minus, Plus, Search, Sparkles, Trash2, UtensilsCrossed } from "lucide-react";
import { TODAY, type Category as RoomCat } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { dm, preMealTotal, tk, type PreMeal } from "@/lib/bookings/store";
import { charges, hasServices, useServices, UNIT_LABEL, SAMPLE_ART } from "@/lib/services/store";
import { imgSrc } from "@/lib/img";
import type { Hotel } from "@/lib/types";
import { useRestaurant } from "../meals/shared";
import { bMain, bSmall } from "./ui";

export type SvcDraft = { id: string; service: string; name: string; qty: number; unitPrice: number; date: string; time: string; sc: number; vat: number; total: number };
export const hasRestaurant = (h: Hotel) => can(h, "restaurant");
const uid = () => `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

function Qty({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={!value} aria-label={`Less ${label}`} className="grid size-8 place-items-center rounded-lg bg-[#eef0f3] disabled:opacity-40"><Minus className="size-4" /></button>
      <span className="w-6 text-center text-[15px] font-bold tabular-nums" aria-label={`${label} quantity`}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`More ${label}`} className="grid size-8 place-items-center rounded-lg bg-hms-ink text-white"><Plus className="size-4" /></button>
    </div>
  );
}

/** Meal plan that comes with the room type (from Room / Accommodation). */
export function MealPlan({ cat }: { cat?: RoomCat }) {
  const m = cat?.meals;
  if (!m) return null;
  const rows = (["breakfast", "lunch", "dinner"] as const).filter((k) => m[k] && m[k] !== "none");
  if (!rows.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {rows.map((k) => <span key={k} className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-semibold", m[k] === "included" ? "bg-[#e5f5ec] text-[#16693a]" : "bg-[#eef0f3] text-[#3a414c]")}><Coffee className="size-3.5" />{k[0].toUpperCase() + k.slice(1)} {m[k] === "included" ? "included" : `${cat?.mealPrices?.[k] ? `${tk(cat.mealPrices[k]!)} / person` : "extra"}`}</span>)}
    </div>
  );
}

export function ExtrasPicker({ h, from, to, room, onMeals, onServices }: { h: Hotel; from: string; to: string; room: string; onMeals: (m: PreMeal[]) => string | void; onServices: (s: SvcDraft[]) => string | void }) {
  const r = useRestaurant();
  const svc = useServices(h);
  const canMeals = hasRestaurant(h), canSvc = hasServices(h);
  const [tab, setTab] = useState<"meals" | "services">(canMeals ? "meals" : "services");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [pick, setPick] = useState<Record<string, number>>({});
  const days = useMemo(() => { const out: string[] = []; for (let d = from < TODAY ? TODAY : from; d <= to; d = addDays(d, 1)) out.push(d); return out; }, [from, to]);
  const [date, setDate] = useState(days[0] ?? from);
  const [time, setTime] = useState(tab === "meals" ? "08:00" : "10:00");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const items = r.m.st.items.filter((i) => i.available && (!cat || i.cat === cat) && (!q || i.name.toLowerCase().includes(q.toLowerCase())));
  const services = svc.st.services.filter((s) => !s.archived && (!q || s.name.toLowerCase().includes(q.toLowerCase())));
  const lines = Object.entries(pick).filter(([, n]) => n > 0);
  const set = (id: string, n: number) => setPick((p) => ({ ...p, [id]: n }));
  const mealSum = lines.reduce((s, [id, n]) => s + (r.m.st.items.find((i) => i.id === id)?.price ?? 0) * n, 0);
  const svcSum = lines.reduce((s, [id, n]) => s + (svc.st.services.find((x) => x.id === id)?.price ?? 0) * n, 0);
  const switchTab = (t: "meals" | "services") => { setTab(t); setPick({}); setQ(""); setErr(""); setTime(t === "meals" ? "08:00" : "10:00"); };

  const add = () => {
    setErr("");
    if (!lines.length) return;
    if (tab === "meals") {
      const s = r.m.st.settings;
      const e = onMeals(lines.map(([id, n]) => { const it = r.m.st.items.find((i) => i.id === id)!; return { id: uid(), item: id, name: it.name, price: it.price, qty: n, date, time, note: note.trim() || undefined, sc: s.sc, vat: s.vat }; }));
      if (e) return setErr(e);
    } else {
      const drafts: SvcDraft[] = [];
      for (const [id, n] of lines) {
        const sv = svc.st.services.find((x) => x.id === id)!;
        const unit = sv.variants?.[0]?.price ?? sv.price;
        if (sv.resourceType && !svc.freeAt(sv.resourceType, date, toMin(time), sv.minutes ?? 60).length) { const nx = svc.nextFree(sv.resourceType, date, toMin(time), sv.minutes ?? 60); return setErr(`${sv.name}: nothing free at ${time} on ${dm(date)}${nx ? ` — next free ${nx}` : ""}`); }
        const ch = charges(unit * n, svc.st.settings, sv.noTax);
        drafts.push({ id: uid(), service: id, name: sv.name, qty: n, unitPrice: unit, date, time, sc: ch.sc, vat: ch.vat, total: unit * n + ch.sc + ch.vat });
      }
      const e = onServices(drafts); if (e) return setErr(e);
    }
    setPick({}); setNote("");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Add to stay" className="flex rounded-xl bg-[#e9edf2] p-1">
          {([["meals", "Meals", UtensilsCrossed, canMeals], ["services", "Other services", Sparkles, canSvc]] as const).map(([id, l, I, ok]) => (
            <button key={id} role="tab" aria-selected={tab === id} disabled={!ok} onClick={() => switchTab(id)} className={clsx("flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[14px] font-semibold disabled:opacity-40", tab === id ? "bg-white shadow-sm" : "text-[#4d5664]")}><I className="size-4" />{l}</button>
          ))}
        </div>
        <label className="flex h-10 min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-hms-line bg-white px-3 focus-within:border-hms-ink sm:max-w-[260px]"><Search className="size-4 text-hms-muted" /><span className="sr-only">Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "meals" ? "Search menu" : "Search services"} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" /></label>
      </div>
      {tab === "meals" && !canMeals && <p className="mt-3 rounded-xl bg-[#f4f6f8] px-4 py-6 text-center text-[14px] text-hms-muted">Restaurant &amp; Bar is part of Ultra.</p>}
      {tab === "services" && !canSvc && <p className="mt-3 rounded-xl bg-[#f4f6f8] px-4 py-6 text-center text-[14px] text-hms-muted">Other Services is part of Business and above.</p>}

      {tab === "meals" && canMeals && <>
        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          {[{ id: "", name: "All" }, ...r.m.st.categories].map((c) => <button key={c.id} onClick={() => setCat(c.id)} className={clsx("shrink-0 rounded-full px-3 py-1 text-[13px] font-semibold", cat === c.id ? "bg-hms-ink text-white" : "bg-[#eef0f3] text-[#3a414c]")}>{c.name}</button>)}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.id} className={clsx("flex items-center gap-3 rounded-xl border p-2", pick[i.id] ? "border-hms-red bg-hms-coral-soft/30" : "border-hms-line")}>
              {/* eslint-disable-next-line @next/next/no-img-element -- menu photo */}
              {i.photo ? <img src={imgSrc(i.photo)} alt="" className="size-14 shrink-0 rounded-lg object-cover" /> : <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#fdefe7] text-[#c2410c]"><UtensilsCrossed className="size-5" /></span>}
              <div className="min-w-0 flex-1"><p className="line-clamp-2 text-[14px] font-semibold leading-snug">{i.name}</p><p className="text-[13px] tabular-nums text-hms-muted">{tk(i.price)}</p></div>
              <Qty value={pick[i.id] ?? 0} onChange={(n) => set(i.id, n)} label={i.name} />
            </div>
          ))}
        </div>
      </>}

      {tab === "services" && canSvc && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className={clsx("flex items-center gap-3 rounded-xl border p-2", pick[s.id] ? "border-hms-red bg-hms-coral-soft/30" : "border-hms-line")}>
              {/* eslint-disable-next-line @next/next/no-img-element -- service photo */}
              {s.image && s.image !== SAMPLE_ART ? <img src={imgSrc(s.image)} alt="" className="size-14 shrink-0 rounded-lg object-cover" /> : <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#f1edff] text-[#6b55e0]"><Sparkles className="size-5" /></span>}
              <div className="min-w-0 flex-1"><p className="line-clamp-2 text-[14px] font-semibold leading-snug">{s.name}</p><p className="text-[13px] tabular-nums text-hms-muted">{tk(s.variants?.[0]?.price ?? s.price)} {UNIT_LABEL[s.unit ?? "each"][1]}</p></div>
              <Qty value={pick[s.id] ?? 0} onChange={(n) => set(s.id, n)} label={s.name} />
            </div>
          ))}
        </div>
      )}

      {lines.length > 0 && (
        <div className="hms-up sticky bottom-0 mt-3 flex flex-wrap items-end gap-2 rounded-2xl border border-hms-line bg-white p-3 shadow-[0_-8px_24px_-16px_rgb(0_0_0/0.25)]">
          <label className="text-[12.5px] font-semibold">{tab === "meals" ? "Deliver on" : "When"}
            <select aria-label="Date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block h-10 rounded-lg border border-hms-line bg-white px-2 text-[14px] font-normal">{days.map((d) => <option key={d} value={d}>{dm(d)}{d === from ? " (arrival)" : d === to ? " (departure)" : ""}</option>)}</select>
          </label>
          <label className="text-[12.5px] font-semibold">Time<input aria-label="Time" type="time" value={time} onChange={(e) => e.target.value && setTime(e.target.value)} className="mt-1 block h-10 rounded-lg border border-hms-line bg-white px-2 text-[14px] font-normal" /></label>
          {tab === "meals" && <label className="min-w-[160px] flex-1 text-[12.5px] font-semibold">Note<input aria-label="Meal note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={`Room ${room || "—"} · allergy, request…`} className="mt-1 block h-10 w-full rounded-lg border border-hms-line bg-white px-2 text-[14px] font-normal" /></label>}
          <button onClick={add} className={clsx(bMain, "ml-auto")}><Plus className="size-4" />Add {lines.reduce((s, [, n]) => s + n, 0)} · {tk(tab === "meals" ? mealSum : svcSum)}</button>
        </div>
      )}
      {err && <p role="alert" className="mt-2 rounded-lg bg-[#fdecec] px-3 py-2 text-[13.5px] font-medium text-[#b42318]">{err}</p>}
    </div>
  );
}

/** List of meals + services already on the booking (or the draft). */
export function ExtrasList({ meals, services, onRemoveMeal, onRemoveService, onSend, canSend }: {
  meals: PreMeal[]; services: { id: string; name: string; qty: number; date: string; time: string; total: number; status?: string; locked?: boolean }[];
  onRemoveMeal?: (id: string) => void; onRemoveService?: (id: string) => void; onSend?: (m: PreMeal) => void; canSend?: (m: PreMeal) => boolean;
}) {
  if (!meals.length && !services.length) return <p className="rounded-xl bg-[#f4f6f8] px-4 py-5 text-center text-[14px] text-hms-muted">Nothing added yet.</p>;
  const all = [
    ...meals.map((m) => ({ key: m.id, kind: "meal" as const, m, when: `${m.date}T${m.time}` })),
    ...services.map((s) => ({ key: s.id, kind: "svc" as const, s, when: `${s.date}T${s.time}` })),
  ].sort((a, b) => a.when.localeCompare(b.when));
  return (
    <ul className="divide-y divide-hms-line rounded-xl border border-hms-line">
      {all.map((x) => x.kind === "meal" ? (
        <li key={x.key} className="flex flex-wrap items-center gap-3 px-3.5 py-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-[#fdefe7] text-[#c2410c]"><UtensilsCrossed className="size-4" /></span>
          <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{x.m.qty}× {x.m.name}</span><span className="text-[12.5px] text-hms-muted">{dm(x.m.date)} · {x.m.time}{x.m.note ? ` · ${x.m.note}` : ""} · {x.m.sent ? <b className="text-[#16693a]">Sent · {x.m.sent}</b> : "Scheduled"}</span></span>
          <b className="tabular-nums">{tk(preMealTotal(x.m))}</b>
          {!x.m.sent && onSend && canSend?.(x.m) && <button onClick={() => onSend(x.m)} className={clsx(bSmall, "bg-hms-ink text-white")}>Send to kitchen</button>}
          {!x.m.sent && onRemoveMeal && <button onClick={() => onRemoveMeal(x.m.id)} aria-label={`Remove ${x.m.name}`} className="grid size-9 place-items-center rounded-lg text-[#b42318] hover:bg-[#fdecec]"><Trash2 className="size-4" /></button>}
        </li>
      ) : (
        <li key={x.key} className="flex flex-wrap items-center gap-3 px-3.5 py-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-[#f1edff] text-[#6b55e0]"><Sparkles className="size-4" /></span>
          <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{x.s.qty}× {x.s.name}</span><span className="text-[12.5px] text-hms-muted">{dm(x.s.date)} · {x.s.time}{x.s.status ? ` · ${x.s.status}` : " · Scheduled"}</span></span>
          <b className="tabular-nums">{tk(x.s.total)}</b>
          {onRemoveService && !x.s.locked && <button onClick={() => onRemoveService(x.s.id)} aria-label={`Remove ${x.s.name}`} className="grid size-9 place-items-center rounded-lg text-[#b42318] hover:bg-[#fdecec]"><Trash2 className="size-4" /></button>}
        </li>
      ))}
    </ul>
  );
}
