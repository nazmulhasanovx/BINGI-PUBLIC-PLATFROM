"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, QrCode } from "lucide-react";
import type { Hotel, Outlet } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { Chips } from "./Chips";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export function DiningMenu({ hotel }: { hotel: Hotel }) {
  const tags = Array.from(new Set(hotel.menu.flatMap((m) => m.tags)));
  const [tag, setTag] = useState<string>("all");
  const items = hotel.menu.filter((m) => tag === "all" || m.tags.includes(tag));
  return (
    <section id="menu" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold md:text-[28px]">From the menu</h2>
        </div>
      </div>
      <Chips label="Menu category" items={[{ id: "all", label: "All" }, ...tags.map((t) => ({ id: t, label: t }))]} value={tag} onChange={setTag} />
      <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
        {items.map((m, i) => (
          <li key={m.id}>
          <Reveal delay={Math.min(i, 5) * 0.05} className="h-full overflow-hidden rounded-3xl border border-line bg-surface">
            {m.photo && (
              <div className="relative aspect-[4/3]">
                <Image src={m.photo} alt={m.name} fill sizes="(max-width: 768px) 50vw, 240px" className="object-cover" />
              </div>
            )}
            <div className="p-3 md:p-4">
              <p className="text-[12px] font-semibold text-action">{m.tags.join(" · ")}</p>
              <p className="mt-0.5 font-semibold leading-snug">{m.name}</p>
              <p className="mt-2 font-bold tabular-nums">{formatMoney(m.price)}</p>
            </div>
          </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex items-start gap-3 rounded-2xl bg-brand-soft p-4 text-[14px]">
        <QrCode className="mt-0.5 size-5 shrink-0 text-action" />
        <span>Staying with us? Order from the QR menu in your room.</span>
      </p>
    </section>
  );
}

const field = "mt-1.5 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[16px] outline-none focus:border-action";

/** Table request → goes to the restaurant (Meals module). Endpoint to confirm with dev; the restaurant calls back to confirm. */
export function TableRequest({ outlet }: { outlet: Outlet }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ date: "", time: "19:30", guests: "2", name: "", phone: "" });
  const ok = f.date && f.name.trim().length > 1 && f.phone.replace(/\D/g, "").length >= 10;
  return (
    <>
      <Button variant="outline" onClick={() => { setSent(false); setOpen(true); }}>Request a table</Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={sent ? "Request sent" : `Table at ${outlet.name}`}
        footer={
          sent ? <Button size="lg" className="w-full" onClick={() => setOpen(false)}>Done</Button> : <Button size="lg" className="w-full" disabled={!ok} onClick={() => setSent(true)}>Send request</Button>
        }
      >
        {sent ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
            <p className="mt-3 text-lg font-semibold">The restaurant will call {f.phone} to confirm.</p>
            <p className="mt-2 text-sm text-muted">Preview build: request not sent to a hotel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-2">
            <label className="col-span-2 block text-sm font-semibold">Date<input type="date" className={field} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
            <label className="block text-sm font-semibold">Time
              <select className={field} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })}>
                {["07:30", "08:30", "12:30", "13:30", "19:00", "19:30", "20:30", "21:30"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Guests
              <select className={field} value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value })}>
                {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label className="col-span-2 block text-sm font-semibold">Name<input className={field} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
            <label className="col-span-2 block text-sm font-semibold">Mobile<input className={field} inputMode="tel" autoComplete="tel" placeholder="01XXX-XXXXXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
            <p className="col-span-2 text-[13px] text-muted">Open {outlet.hours}. This is a request — the restaurant confirms by phone.</p>
          </div>
        )}
      </Sheet>
    </>
  );
}
