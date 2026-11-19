"use client";
// Theme-owned Rooms pages (Luxury + Signature). Every theme gets its own layout over the shared engine
// (engine.tsx), so dates, availability and prices behave the same everywhere while the page looks different.
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { ArrowRight, ArrowUpRight, Coffee, Mountain } from "lucide-react";
import type { Hotel, MasterTheme, RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import { Price, Search, Status, StayPage, size, sleeps, type Item, type Stay } from "./engine";

const Pic = ({ src, className, sizes = "(max-width: 768px) 100vw, 640px", children }: { src?: string; className?: string; sizes?: string; children?: React.ReactNode }) => (
  <div className={clsx("relative overflow-hidden bg-line", className)}>{src && <Image src={src} alt="" fill sizes={sizes} className="object-cover" />}{children}</div>
);
const Go = ({ s, x, children, className }: { s: Stay; x: Item; children: React.ReactNode; className?: string }) => <Link href={s.link(x.r)} className={className}>{children}</Link>;
const cta = (x: Item, word = "room") => (x.off ? `View ${word}` : `Choose ${word}`);
const roomsPhoto = (h: Hotel) => h.pagePhotos.rooms ?? h.heroPhoto;

/* ---------- AUREL · floor directory: rooms listed like a lobby board, floor by floor ---------- */
function Aurel({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 md:pt-20">
        <p className="sig-caps text-[color:var(--lux-accent-ink,var(--action))]">Directory · {s.hotel.name}</p>
        <h1 className="lux-display mt-3 text-[54px] uppercase leading-[0.9] md:text-[120px]">Choose<br />your floor.</h1>
        <Search s={s} className="mt-8" /><Status s={s} className="mt-5" />
      </header>
      <ol className="mx-auto mt-10 max-w-[1240px] border-t-2 border-ink px-4 sm:px-6">
        {s.items.map((x, i) => (
          <li key={x.r.id} className={clsx("border-b border-line", x.off && "opacity-60")}>
            <Go s={s} x={x} className="group grid items-center gap-4 py-6 lg:grid-cols-[120px_minmax(0,1fr)_240px_200px] lg:gap-8">
              <span className="lux-display text-[56px] leading-none text-[color:var(--action)] md:text-[84px]">{x.r.specs?.[0]?.match(/\d+/)?.[0]?.padStart(2, "0") ?? String(i + 1).padStart(2, "0")}</span>
              <span><span className="sig-caps text-muted">{x.r.specs?.[0] ?? x.r.kind}</span><span className="lux-display mt-1 block text-[30px] uppercase md:text-[40px]">{x.r.name}</span><span className="mt-1 block text-muted">{x.r.short} · {size(x.r)}</span></span>
              <Pic src={x.r.photos[0]} className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.02]" sizes="260px" />
              <span className="flex items-center justify-between gap-3 md:block"><Price s={s} x={x} /><span className="mt-3 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.12em] text-[13px]">{cta(x)} <ArrowRight className="size-4" aria-hidden /></span></span>
            </Go>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- COURTYARD · postcards in an arcade: arched photos, centred serif captions ---------- */
function Courtyard({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="relative mx-auto max-w-[900px] px-4 pt-12 text-center md:pt-24">
        <p className="sig-caps text-muted">The rooms around our courtyard</p>
        <h1 className="lux-display mt-4 text-[48px] md:text-[88px]">Suites with <em>character</em></h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[16px] text-muted">Each one opens onto the garden. No two are the same.</p>
        <Search s={s} className="mt-8 text-left" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-14 grid max-w-[1180px] gap-x-8 gap-y-14 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {s.items.map((x, i) => (
          <li key={x.r.id} className={clsx("text-center", i % 3 === 1 && "lg:mt-16", x.off && "opacity-60")}>
            <Go s={s} x={x} className="group block">
              <Pic src={x.r.photos[0]} className="mx-auto aspect-[3/4] max-w-[340px] rounded-t-[999px] border-[6px] border-surface shadow-[0_20px_50px_-30px_rgba(0,0,0,.5)]" sizes="340px" />
              <p className="sig-caps mt-6 text-muted">N° {i + 1} · {x.r.view ?? x.r.kind}</p>
              <h2 className="lux-display mt-2 text-[32px]">{x.r.name}</h2>
              <p className="mx-auto mt-2 max-w-[300px] text-[15px] text-muted">{x.r.short}</p>
              <Price s={s} x={x} className="mt-4" big="text-[20px]" />
              <span className="mt-3 inline-block border-b border-current pb-0.5 text-[14px] font-semibold">{cta(x, "suite")}</span>
            </Go>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- AXIS · compare table: business travellers scan specs side by side ---------- */
function Axis({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="bg-[color:var(--action)] pb-24 pt-10 text-white md:pt-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <p className="sig-caps text-white/80">Rooms · compare</p>
          <h1 className="lux-display mt-3 max-w-[760px] text-[40px] text-white md:text-[64px]">Pick the room that fits the trip.</h1>
          <Status s={s} light className="mt-4" />
        </div>
      </header>
      <div className="mx-auto -mt-16 max-w-[1240px] px-4 sm:px-6">
        <Search s={s} />
        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
          <table className="w-full text-left text-[15px]">
            <caption className="sr-only">Room comparison</caption>
            <thead className="bg-canvas text-[12px] uppercase tracking-[0.12em] text-muted"><tr><th className="p-4 font-semibold">Room</th><th className="p-4 font-semibold">Size</th><th className="p-4 font-semibold">Bed</th><th className="p-4 font-semibold">Work</th><th className="p-4 font-semibold">Sleeps</th><th className="p-4 text-right font-semibold">Price</th><th className="p-4"><span className="sr-only">Action</span></th></tr></thead>
            <tbody className="divide-y divide-line">
              {s.items.map((x) => (
                <tr key={x.r.id} className={clsx(x.off && "opacity-60")}>
                  <td className="p-4"><div className="flex items-center gap-4"><Pic src={x.r.photos[0]} className="size-16 shrink-0 rounded-lg" sizes="64px" /><div><b className="text-[17px]">{x.r.name}</b><p className="text-[13.5px] text-muted">{x.r.short}</p></div></div></td>
                  <td className="p-4 tabular-nums">{size(x.r) ?? "—"}</td><td className="p-4">{x.r.bed}</td>
                  <td className="p-4">{x.r.amenities.find((a) => /desk|work|meeting/i.test(a)) ?? "Desk + fast Wi-Fi"}</td><td className="p-4">{x.r.maxAdults + x.r.maxChildren}</td>
                  <td className="p-4 text-right"><Price s={s} x={x} big="text-[18px]" /></td>
                  <td className="p-4 text-right"><Link href={s.link(x.r)} className="lux-btn !h-10 !px-4">{x.off ? "View" : "Select"}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-6 space-y-3 md:hidden">
          {s.items.map((x) => (
            <li key={x.r.id} className={clsx("rounded-2xl border border-line bg-surface p-4", x.off && "opacity-60")}>
              <Go s={s} x={x} className="flex gap-4"><Pic src={x.r.photos[0]} className="size-20 shrink-0 rounded-lg" sizes="80px" /><div className="min-w-0"><b>{x.r.name}</b><p className="text-[13.5px] text-muted">{size(x.r)} · {x.r.bed}</p><Price s={s} x={x} big="text-[17px]" className="mt-1" /></div></Go>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- WAYPOINT · road signs: rooms as numbered exits along the highway ---------- */
function Waypoint({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 md:pt-16">
        <div className="inline-block rounded-lg border-4 border-white bg-[color:var(--action)] px-5 py-3 text-white shadow-[0_0_0_3px_var(--action)]">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-white/85">Next stop</p>
          <h1 className="lux-display text-[38px] text-white md:text-[60px]">Rooms for the road</h1>
        </div>
        <p className="mt-5 max-w-[560px] text-[16px] text-muted">Free parking at your door, late check-in and an early start. Pick a room and pull in.</p>
        <Search s={s} className="mt-6" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-10 grid max-w-[1240px] gap-5 px-4 sm:px-6 md:grid-cols-2">
        {s.items.map((x, i) => (
          <li key={x.r.id} className={clsx(x.off && "opacity-60")}>
            <Go s={s} x={x} className="group flex overflow-hidden rounded-2xl border-2 border-ink/90 bg-surface">
              <span className="flex w-16 shrink-0 flex-col items-center justify-center bg-[#F2C230] text-[#1b1b1b] md:w-20"><span className="text-[10px] font-bold uppercase tracking-widest">Exit</span><span className="lux-display text-[34px]">{i + 1}</span></span>
              <Pic src={x.r.photos[0]} className="hidden w-40 shrink-0 sm:block" sizes="160px" />
              <span className="min-w-0 flex-1 p-4"><span className="lux-display block text-[22px]">{x.r.name}</span><span className="mt-1 block text-[14px] text-muted">{x.r.bed} · {sleeps(x.r)}</span><span className="mt-3 flex items-end justify-between gap-3"><Price s={s} x={x} big="text-[19px]" /><ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden /></span></span>
            </Go>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- SHANTI · a quiet guest book: one calm column, soft photos, a handwritten note ---------- */
function Shanti({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[720px] px-4 pt-14 text-center md:pt-24">
        <p className="sig-script text-[28px] text-[color:var(--action)]">welcome, slow down</p>
        <h1 className="lux-display mt-2 text-[44px] md:text-[72px]">Our guest rooms</h1>
        <Search s={s} className="mt-8 text-left" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-12 max-w-[760px] space-y-6 px-4 sm:px-6">
        {s.items.map((x) => (
          <li key={x.r.id}>
            <Reveal className={clsx("rounded-[28px] bg-surface p-4 shadow-[0_10px_40px_-25px_rgba(0,0,0,.35)] sm:flex sm:gap-6 sm:p-5", x.off && "opacity-60")}>
              <Pic src={x.r.photos[0]} className="aspect-[4/3] rounded-[22px] sm:aspect-square sm:w-48 sm:shrink-0" sizes="200px" />
              <div className="mt-4 min-w-0 flex-1 sm:mt-0">
                <h2 className="lux-display text-[28px]">{x.r.name}</h2>
                <p className="mt-1 text-[15px] text-muted">{x.r.description}</p>
                <p className="sig-script mt-2 text-[20px] text-[color:var(--action)]">— {x.r.amenities[0]?.toLowerCase()}, {x.r.amenities[1]?.toLowerCase()}</p>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-3"><Price s={s} x={x} big="text-[19px]" /><Link href={s.link(x.r)} className="lux-btn !h-11">{cta(x)}</Link></div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- RESIDE · apartment cards with a drawn floor plan and nightly / monthly price ---------- */
export function Plan({ r, className }: { r: RoomCategory; className?: string }) {
  const beds = Math.max(1, r.bedrooms ?? (/2|two|twin/i.test(r.bed) ? 2 : 1));
  const w = 200, h = 130, bw = (w - 16) / (beds + 1.4);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label={`Floor plan: ${beds} bedroom${beds > 1 ? "s" : ""}, living and kitchen`}>
      <rect x="4" y="4" width={w - 8} height={h - 8} fill="none" stroke="currentColor" strokeWidth="3" />
      {Array.from({ length: beds }, (_, i) => (
        <g key={i}><rect x={8 + i * bw} y="8" width={bw - 4} height="58" fill="currentColor" opacity=".08" stroke="currentColor" strokeWidth="1.2" /><rect x={14 + i * bw} y="14" width={bw - 20} height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="1" /><text x={10 + i * bw + (bw - 4) / 2} y="56" fontSize="8" textAnchor="middle" fill="currentColor">BED {i + 1}</text></g>
      ))}
      <rect x={8 + beds * bw} y="8" width={w - 16 - beds * bw} height="58" fill="none" stroke="currentColor" strokeWidth="1.2" /><text x={8 + beds * bw + (w - 16 - beds * bw) / 2} y="40" fontSize="8" textAnchor="middle" fill="currentColor">KITCHEN</text>
      <rect x="8" y="70" width={w - 16} height={h - 78} fill="none" stroke="currentColor" strokeWidth="1.2" /><text x={w / 2} y={h - 24} fontSize="9" textAnchor="middle" fill="currentColor">LIVING · DINING</text>
    </svg>
  );
}
function Reside({ s }: { s: Stay }) {
  const [monthly, setMonthly] = useState(false);
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 md:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="sig-caps text-muted">Apartments · {s.hotel.name}</p><h1 className="lux-display mt-3 text-[46px] md:text-[80px]">Find your ideal stay.</h1></div>
          <div role="radiogroup" aria-label="Price view" className="inline-flex rounded-full border border-line bg-surface p-1">
            {([false, true] as const).map((m) => <button key={String(m)} role="radio" aria-checked={monthly === m} onClick={() => setMonthly(m)} className={clsx("h-10 rounded-full px-5 text-[14px] font-semibold", monthly === m ? "bg-ink text-canvas" : "text-muted")}>{m ? "Monthly" : "Nightly"}</button>)}
          </div>
        </div>
        <Search s={s} className="mt-8" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-10 grid max-w-[1240px] gap-6 px-4 sm:px-6 lg:grid-cols-2">
        {s.items.map((x) => (
          <li key={x.r.id} className={clsx("grid overflow-hidden rounded-[20px] border border-line bg-surface sm:grid-cols-2", x.off && "opacity-60")}>
            <Pic src={x.r.photos[0]} className="aspect-[4/3] sm:aspect-auto" sizes="320px" />
            <div className="flex flex-col p-5">
              <h2 className="lux-display text-[28px]">{x.r.name}</h2>
              <p className="mt-1 text-[14px] text-muted">{size(x.r)} · {sleeps(x.r)}</p>
              <Plan r={x.r} className="mt-4 w-full max-w-[240px] text-ink/70" />
              <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                {monthly ? <p><span className="block text-[12.5px] text-muted">est. 30 nights</span><b className="text-[20px] tabular-nums">{formatMoney(Math.round(x.r.fromPrice * 30 * 0.72))}</b></p> : <Price s={s} x={x} big="text-[20px]" />}
                <Link href={monthly ? `/hotel/${s.hotel.slug}/long-stay` : s.link(x.r)} className="lux-btn !h-11 !px-4">{monthly ? "Ask" : "View"}</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {monthly && <p className="mx-auto mt-6 max-w-[1240px] px-4 text-[13.5px] text-muted sm:px-6">Monthly prices are an estimate (about 28% below nightly). The team confirms the final rate.</p>}
    </div>
  );
}

/* ---------- COMMONS · bed grid: chunky sticker tiles with Dorm / Private filter ---------- */
function Commons({ s }: { s: Stay }) {
  const [f, setF] = useState<"all" | "dorm" | "private">("all");
  const list = s.items.filter((x) => f === "all" || (f === "dorm") === (x.r.kind === "dorm"));
  const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 md:pt-16">
        <h1 className="lux-display text-[56px] uppercase leading-[0.88] md:text-[120px]">Beds<br /><span className="text-[color:var(--action)]">&amp; rooms</span></h1>
        <div role="tablist" aria-label="Room type" className="mt-6 flex flex-wrap gap-2">
          {([["all", "Everything"], ["dorm", "Dorm beds"], ["private", "Private rooms"]] as const).map(([id, l]) => <button key={id} role="tab" aria-selected={f === id} onClick={() => setF(id)} className={clsx("h-11 rounded-full border-2 border-ink px-5 font-semibold", f === id ? "bg-ink text-canvas" : "bg-surface")}>{l}</button>)}
        </div>
        <Search s={s} className="mt-6" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-10 grid max-w-[1240px] grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {list.map((x, i) => (
          <li key={x.r.id} className={clsx(x.off && "opacity-60")}>
            <Go s={s} x={x} className="group block rounded-[22px] border-[3px] border-ink bg-surface p-3 shadow-[6px_6px_0_var(--ink)] transition-transform hover:-translate-y-1">
              <Pic src={x.r.photos[0]} className="aspect-[4/3] rounded-[14px]" sizes="380px">
                <span className={clsx("absolute left-3 top-3 rounded-full bg-[#F7E04B] px-3 py-1 text-[13px] font-bold text-[#151515]", tilt[i % 4])}>{x.r.kind === "dorm" ? `${x.r.bedrooms ?? x.r.maxAdults}-bed dorm` : "Private"}</span>
              </Pic>
              <div className="px-1 pb-1 pt-3"><h2 className="lux-display text-[24px] uppercase">{x.r.name}</h2><p className="text-[14px] text-muted">{x.r.short}</p><div className="mt-3 flex items-end justify-between"><Price s={s} x={x} big="text-[22px]" /><ArrowUpRight className="size-6" aria-hidden /></div></div>
            </Go>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- ROOTS · scrapbook: taped polaroids with handwritten names ---------- */
function Roots({ s }: { s: Stay }) {
  const tilt = ["-rotate-[2.5deg]", "rotate-[2deg]", "-rotate-1", "rotate-[1.5deg]"];
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1000px] px-4 pt-12 text-center md:pt-20">
        <p className="sig-satisfy text-[30px] text-[color:var(--action)]">come stay with the family</p>
        <h1 className="lux-display mt-1 text-[44px] md:text-[76px]">Our rooms</h1>
        <Search s={s} className="mt-8 text-left" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-14 grid max-w-[1100px] gap-12 px-6 sm:grid-cols-2 lg:grid-cols-3">
        {s.items.map((x, i) => (
          <li key={x.r.id} className={clsx(x.off && "opacity-60")}>
            <Go s={s} x={x} className={clsx("group relative block bg-white p-3 pb-5 text-[#2a2a2a] shadow-[0_14px_30px_-18px_rgba(0,0,0,.45)] transition-transform hover:rotate-0", tilt[i % 4])}>
              <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] bg-[#e9dcb8]/80" />
              <Pic src={x.r.photos[0]} className="aspect-square" sizes="340px" />
              <p className="sig-satisfy mt-3 text-center text-[28px] text-[#2a2a2a]">{x.r.name}</p>
              <p className="text-center text-[14px] text-[#555]">{x.r.short}</p>
              <p className="mt-2 text-center text-[15px] font-semibold text-[#2a2a2a]">{x.off ? (x.fit ? "Full on these dates" : `Up to ${x.r.maxAdults} adults`) : s.has ? `${formatMoney(x.total)} for ${s.nights} night${s.nights > 1 ? "s" : ""}` : `from ${formatMoney(x.r.fromPrice)} a night`}</p>
            </Go>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- MORNING · the menu: rooms read like a breakfast card, name ···· price ---------- */
function Morning({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <div className="mx-auto mt-8 max-w-[860px] px-4 sm:px-6 md:mt-16">
        <div className="rounded-[6px] border border-line bg-surface px-5 py-10 shadow-[0_20px_60px_-40px_rgba(0,0,0,.5)] md:px-14 md:py-16">
          <header className="text-center">
            <Coffee className="mx-auto size-7 text-[color:var(--action)]" aria-hidden />
            <p className="sig-caps mt-3 text-muted">Today&apos;s rooms · breakfast included</p>
            <h1 className="lux-display mt-2 text-[44px] italic md:text-[68px]">Rest well</h1>
            <span aria-hidden className="mx-auto mt-4 block h-px w-24 bg-line" />
          </header>
          <Search s={s} className="mt-8" /><Status s={s} className="mt-4 text-center" />
          <ul className="mt-10 space-y-8">
            {s.items.map((x) => (
              <li key={x.r.id} className={clsx(x.off && "opacity-60")}>
                <Go s={s} x={x} className="group flex gap-4">
                  <Pic src={x.r.photos[0]} className="size-20 shrink-0 rounded-full md:size-24" sizes="96px" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2"><span className="lux-display text-[24px] italic md:text-[28px]">{x.r.name}</span><span aria-hidden className="mb-1.5 flex-1 border-b-2 border-dotted border-line" /><b className="tabular-nums text-[18px]">{x.off ? "—" : formatMoney(s.has ? x.total : x.r.fromPrice)}</b></span>
                    <span className="mt-1 block text-[14.5px] text-muted">{x.r.short} · {x.r.bed} · {s.has ? `${s.nights} night${s.nights > 1 ? "s" : ""}` : "per night"}</span>
                    <span className="mt-1 inline-block text-[13.5px] font-semibold text-[color:var(--action)] group-hover:underline">{x.off ? (x.fit ? "Fully booked" : `Up to ${x.r.maxAdults} adults`) : "Reserve this room →"}</span>
                  </span>
                </Go>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- MATIR · cottage map: cottages pinned on a drawn farm, list beside ---------- */
export function FarmMap({ s, active, onPick }: { s: Stay; active?: string; onPick?: (id: string) => void }) {
  const pts = [[70, 70], [190, 52], [300, 92], [110, 170], [250, 190], [340, 170]];
  return (
    <svg viewBox="0 0 400 260" className="h-auto w-full" role="img" aria-label="Map of the farm with cottages">
      <rect width="400" height="260" rx="24" fill="#E8DFC7" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={i * 60 - 10} y="210" width="52" height="60" fill="#B9C98C" opacity=".7" transform={`skewX(-12)`} />)}
      <ellipse cx="200" cy="130" rx="46" ry="28" fill="#8CB9C7" /><text x="200" y="134" fontSize="11" textAnchor="middle" fill="#2c4d57">Pond</text>
      {[[30, 30], [380, 40], [20, 230], [360, 240], [160, 230]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="14" fill="#5E8A4E" />)}
      {s.items.map((x, i) => {
        const [px, py] = pts[i % pts.length], on = active === x.r.id;
        return (
          <g key={x.r.id} onClick={() => onPick?.(x.r.id)} className="cursor-pointer">
            <polygon points={`${px - 18},${py} ${px},${py - 16} ${px + 18},${py}`} fill={on ? "var(--action)" : "#B4532A"} />
            <rect x={px - 14} y={py} width="28" height="18" fill="#F7F1E3" stroke="#7a5a3a" />
            <text x={px} y={py + 34} fontSize="10" fontWeight="700" textAnchor="middle" fill="#3b2a1a">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}
function Matir({ s }: { s: Stay }) {
  const [on, setOn] = useState(s.items[0]?.r.id);
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 md:pt-16">
        <p className="sig-caps text-muted">Stay on the farm</p>
        <h1 className="lux-display mt-3 text-[46px] md:text-[78px]">Our cottages</h1>
        <Search s={s} className="mt-6" /><Status s={s} className="mt-4" />
      </header>
      <div className="mx-auto mt-10 grid max-w-[1240px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start"><FarmMap s={s} active={on} onPick={setOn} /><p className="mt-2 text-[13.5px] text-muted">Tap a roof to find a cottage. Numbers match the list.</p></div>
        <ol className="space-y-4">
          {s.items.map((x, i) => (
            <li key={x.r.id} onMouseEnter={() => setOn(x.r.id)} className={clsx("rounded-[20px] border-2 bg-surface p-3 transition-colors", on === x.r.id ? "border-[color:var(--action)]" : "border-transparent", x.off && "opacity-60")}>
              <Go s={s} x={x} className="flex gap-4">
                <Pic src={x.r.photos[0]} className="aspect-square w-28 shrink-0 rounded-[14px]" sizes="112px"><span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-surface text-[13px] font-bold text-ink">{i + 1}</span></Pic>
                <span className="min-w-0"><span className="lux-display block text-[24px]">{x.r.name}</span><span className="block text-[14px] text-muted">{x.r.short}</span><Price s={s} x={x} big="text-[18px]" className="mt-2" /></span>
              </Go>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ---------- ZAMINDAR · palace gallery: scalloped frames, gold rules, royal numbering ---------- */
const roman = (n: number) => ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][n] ?? String(n + 1);
function Zamindar({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[900px] px-4 pt-14 text-center md:pt-24">
        <p className="lux-eyebrow">The chambers of {s.hotel.name}</p>
        <div aria-hidden className="mx-auto mt-4 flex items-center justify-center gap-3 text-[color:var(--lux-accent)]"><span className="h-px w-16 bg-current" />❖<span className="h-px w-16 bg-current" /></div>
        <h1 className="lux-display mt-4 text-[48px] md:text-[86px]">Royal chambers</h1>
        <Search s={s} className="mt-8 text-left" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-14 max-w-[1100px] space-y-16 px-4 sm:px-6">
        {s.items.map((x, i) => (
          <li key={x.r.id} className={clsx("grid items-center gap-8 md:grid-cols-2", x.off && "opacity-60")}>
            <Go s={s} x={x} className={clsx("block", i % 2 && "md:order-2")}><span className="sr-only">{x.r.name}</span>
              <Pic src={x.r.photos[0]} className="aspect-[4/5] rounded-t-[999px] outline outline-1 outline-offset-[10px] outline-[color:var(--lux-accent)]" sizes="500px" />
            </Go>
            <div className="text-center md:text-left">
              <p className="lux-display text-[44px] text-[color:var(--lux-accent)]">{roman(i)}</p>
              <h2 className="lux-display text-[36px] md:text-[44px]">{x.r.name}</h2>
              <p className="mt-3 text-[16px] text-muted">{x.r.description}</p>
              <p className="mt-3 text-[14px] uppercase tracking-[0.16em] text-[color:var(--lux-accent-ink)]">{x.r.bed} · {size(x.r) ?? sleeps(x.r)}</p>
              <div className="mt-5 flex flex-wrap items-end justify-center gap-5 md:justify-start"><Price s={s} x={x} /><Link href={s.link(x.r)} className="lux-btn">{cta(x, "chamber")}</Link></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- MAISON · editorial: a magazine index, big numbers, full-width spreads ---------- */
function Maison({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] border-b border-ink px-4 pb-8 pt-10 sm:px-6 md:pt-20">
        <div className="flex items-end justify-between gap-6"><h1 className="lux-display text-[56px] md:text-[132px]">Rooms</h1><p className="hidden max-w-[260px] pb-4 text-right text-[14px] uppercase tracking-[0.18em] text-muted md:block">Issue N° 01 · {s.items.length} rooms</p></div>
        <Search s={s} className="mt-6" /><Status s={s} className="mt-4" />
      </header>
      {s.items.map((x, i) => (
        <article key={x.r.id} className={clsx("mx-auto grid max-w-[1240px] gap-6 border-b border-line px-4 py-12 sm:px-6 md:grid-cols-12 md:py-20", x.off && "opacity-60")}>
          <p className="lux-display text-[72px] leading-none text-[color:var(--lux-accent)] md:col-span-2 md:text-[110px]">{String(i + 1).padStart(2, "0")}</p>
          <div className="md:col-span-4">
            <p className="lux-eyebrow">{x.r.kind}</p>
            <h2 className="lux-display mt-3 text-[38px] md:text-[52px]">{x.r.name}</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted first-letter:float-left first-letter:mr-2 first-letter:font-[family-name:var(--font-heading)] first-letter:text-[52px] first-letter:leading-[0.8]">{x.r.description}</p>
            <div className="mt-6 flex items-end gap-6"><Price s={s} x={x} /><Link href={s.link(x.r)} className="lux-link">{cta(x)} <ArrowRight className="size-4" aria-hidden /></Link></div>
          </div>
          <Go s={s} x={x} className="md:col-span-6"><span className="sr-only">{x.r.name}</span><Pic src={x.r.photos[0]} className="aspect-[4/3]" sizes="(max-width: 768px) 100vw, 640px" /></Go>
        </article>
      ))}
    </div>
  );
}

/* ---------- NOIR · cinematic strips: full-width photo bands with the name over them ---------- */
function Noir({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-6 md:pt-24">
        <p className="lux-eyebrow">After dark</p>
        <h1 className="lux-display mt-4 text-[52px] md:text-[104px]">The rooms</h1>
        <Search s={s} className="mt-8" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mt-12 space-y-2">
        {s.items.map((x, i) => (
          <li key={x.r.id}>
            <Go s={s} x={x} className={clsx("group relative block h-[56svh] min-h-[340px] overflow-hidden", x.off && "opacity-60")}>
              <Image src={x.r.photos[0]} alt="" fill sizes="100vw" className="object-cover opacity-70 grayscale-[35%] transition duration-700 group-hover:scale-[1.03] group-hover:opacity-90" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
              <div className="relative mx-auto flex h-full max-w-[1240px] flex-col justify-end px-4 pb-10 text-white sm:px-6">
                <p className="lux-eyebrow !text-[#DCC08A]">Scene {String(i + 1).padStart(2, "0")}</p>
                <h2 className="lux-display mt-2 text-[42px] text-white md:text-[72px]">{x.r.name}</h2>
                <p className="mt-2 max-w-[460px] text-white/80">{x.r.short} · {x.r.bed}</p>
                <div className="mt-5 flex items-end gap-6"><Price s={s} x={x} light /><span className="lux-link text-white">{cta(x)} <ArrowRight className="size-4" aria-hidden /></span></div>
              </div>
            </Go>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- ORBIT · capsules: round portholes on a dark sky, specs as telemetry ---------- */
function Orbit({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-6 md:pt-20">
        <p className="lux-eyebrow">Module selection</p>
        <h1 className="lux-display mt-4 text-[50px] md:text-[110px]">Choose a capsule</h1>
        <Search s={s} className="mt-8" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-12 grid max-w-[1240px] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {s.items.map((x, i) => (
          <li key={x.r.id} className={clsx(x.off && "opacity-60")}>
            <Go s={s} x={x} className="group block rounded-[28px] border border-line bg-surface p-6 text-center transition-colors hover:border-[color:var(--lux-accent)]">
              <div className="relative mx-auto aspect-square w-[78%]"><span aria-hidden className="absolute -inset-3 rounded-full border border-dashed border-line transition-transform duration-[2000ms] group-hover:rotate-180" /><Pic src={x.r.photos[0]} className="size-full rounded-full ring-4 ring-[color:var(--canvas)]" sizes="300px" /></div>
              <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.2em] text-muted">M-{String(i + 1).padStart(2, "0")} · {size(x.r) ?? "—"}</p>
              <h2 className="lux-display mt-2 text-[30px]">{x.r.name}</h2>
              <dl className="mt-4 grid grid-cols-3 gap-2 font-mono text-[12px]">
                {[["CREW", String(x.r.maxAdults + x.r.maxChildren)], ["VIEW", x.r.view ?? "—"], ["UNITS", String(x.r.units)]].map(([k, v]) => <div key={k} className="rounded-lg border border-line py-2"><dt className="text-muted">{k}</dt><dd className="mt-0.5 truncate px-1 text-ink">{v}</dd></div>)}
              </dl>
              <Price s={s} x={x} className="mt-5" big="text-[20px]" />
            </Go>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- HAVEN · calm split: a sticky photo that changes as you move through the list ---------- */
function Haven({ s }: { s: Stay }) {
  const [on, setOn] = useState(0);
  const cur = s.items[on] ?? s.items[0];
  return (
    <div className="pb-20">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1fr_1fr]">
        <div className="hidden lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:block lg:h-[calc(100svh-var(--header-h)-32px)] lg:self-start">
          {cur && <Pic key={cur.r.id} src={cur.r.photos[0]} className="size-full animate-[onb-in_.6s_ease] rounded-[var(--lux-r)]" sizes="660px" />}
        </div>
        <div>
          <p className="lux-eyebrow">Rest · {s.hotel.name}</p>
          <h1 className="lux-display mt-4 text-[48px] md:text-[80px]">Rooms to breathe in</h1>
          <Search s={s} className="mt-8" /><Status s={s} className="mt-4" />
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {s.items.map((x, i) => (
              <li key={x.r.id} onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)} className={clsx(x.off && "opacity-60")}>
                <Go s={s} x={x} className="group block py-7">
                  <Pic src={x.r.photos[0]} className="mb-4 aspect-[16/10] rounded-[var(--lux-r)] lg:hidden" sizes="100vw" />
                  <div className="flex items-start justify-between gap-6"><div><h2 className={clsx("lux-display text-[32px] transition-colors md:text-[40px]", on === i ? "text-ink" : "text-ink/70")}>{x.r.name}</h2><p className="mt-1 text-muted">{x.r.short} · {sleeps(x.r)}</p></div><Price s={s} x={x} className="shrink-0 text-right" big="text-[19px]" /></div>
                </Go>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- SUMMIT · altitude: rooms on a vertical climb with elevation markers ---------- */
function Summit({ s }: { s: Stay }) {
  const top = 1450;
  return (
    <div className="pb-20">
      <header className="relative overflow-hidden">
        <Pic src={roomsPhoto(s.hotel)} className="h-[40svh] min-h-[280px]" sizes="100vw"><div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[color:var(--canvas)] via-transparent to-black/20" /></Pic>
        <div className="mx-auto -mt-28 max-w-[1240px] px-4 sm:px-6 relative"><p className="lux-eyebrow">Base camp → summit</p><h1 className="lux-display mt-3 text-[48px] md:text-[90px]">Rooms by altitude</h1><Search s={s} className="mt-6" /><Status s={s} className="mt-4" /></div>
      </header>
      <ol className="relative mx-auto mt-12 max-w-[1000px] px-4 sm:px-6">
        <span aria-hidden className="absolute bottom-0 left-[38px] top-0 w-px bg-line sm:left-[46px] md:left-1/2" />
        {[...s.items].reverse().map((x, i, arr) => (
          <li key={x.r.id} className={clsx("relative mb-10 pl-16 md:grid md:grid-cols-2 md:gap-14 md:pl-0", x.off && "opacity-60")}>
            <span className="absolute left-[22px] top-2 flex items-center gap-2 sm:left-[30px] md:left-1/2 md:-translate-x-1/2"><Mountain className="size-8 rounded-full bg-canvas p-1.5 text-[color:var(--lux-accent)] ring-1 ring-line" aria-hidden /></span>
            <p className={clsx("font-mono text-[13px] text-muted md:text-right", i % 2 && "md:order-2 md:text-left")}>{top - (arr.length - 1 - i) * 120} m</p>
            <Go s={s} x={x} className={clsx("mt-2 block overflow-hidden rounded-[var(--lux-r)] border border-line bg-surface md:mt-0", i % 2 && "md:order-1")}>
              <Pic src={x.r.photos[0]} className="aspect-[16/9]" sizes="460px" />
              <div className="p-5"><h2 className="lux-display text-[28px]">{x.r.name}</h2><p className="mt-1 text-[14.5px] text-muted">{x.r.short}</p><div className="mt-4 flex items-end justify-between"><Price s={s} x={x} big="text-[19px]" /><ArrowRight className="size-5" aria-hidden /></div></div>
            </Go>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- CANOPY · treehouse: leaf-shaped cards in a staggered canopy ---------- */
function Canopy({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-12 text-center sm:px-6 md:pt-20">
        <p className="lux-eyebrow">Up in the trees</p>
        <h1 className="lux-display mt-4 text-[48px] md:text-[90px]">Nests &amp; treehouses</h1>
        <Search s={s} className="mt-8 text-left" /><Status s={s} className="mt-4" />
      </header>
      <ul className="mx-auto mt-14 grid max-w-[1180px] gap-x-8 gap-y-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {s.items.map((x, i) => (
          <li key={x.r.id} className={clsx(i % 3 === 1 && "lg:translate-y-12", i % 3 === 2 && "lg:translate-y-24", x.off && "opacity-60")}>
            <Go s={s} x={x} className="group block">
              <Pic src={x.r.photos[0]} className="aspect-[4/5] rounded-[120px_8px_120px_8px] transition-[border-radius] duration-700 group-hover:rounded-[8px_120px_8px_120px]" sizes="380px" />
              <div className="mt-5 flex items-start gap-3"><span aria-hidden className="mt-2 size-3 shrink-0 rotate-45 rounded-[0_50%] bg-[color:var(--lux-accent-ink)]" /><div><h2 className="lux-display text-[28px]">{x.r.name}</h2><p className="mt-1 text-[14.5px] text-muted">{x.r.view ? `${x.r.view} · ` : ""}{x.r.bed}</p><Price s={s} x={x} className="mt-3" big="text-[19px]" /></div></div>
            </Go>
          </li>
        ))}
      </ul>
      <div className="h-24" />
    </div>
  );
}

/* ---------- DRIFT · river strip: a horizontal, swipeable line of boats along the water ---------- */
function Drift({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-6 md:pt-20">
        <p className="lux-eyebrow">On the water</p>
        <h1 className="lux-display mt-4 text-[48px] md:text-[92px]">Cabins afloat</h1>
        <Search s={s} className="mt-8" /><Status s={s} className="mt-4" />
      </header>
      <div className="relative mt-12">
        <svg aria-hidden viewBox="0 0 1200 40" preserveAspectRatio="none" className="absolute inset-x-0 top-[38%] h-10 w-full text-[color:var(--lux-accent-ink)] opacity-25"><path d="M0 20 Q 75 0 150 20 T 300 20 T 450 20 T 600 20 T 750 20 T 900 20 T 1050 20 T 1200 20" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
        <div tabIndex={0} role="region" aria-label="Cabins" className="relative overflow-x-auto"><ul className="flex w-max snap-x snap-mandatory gap-6 px-4 pb-6 sm:px-[max(24px,calc((100vw-1240px)/2+24px))]">
          {s.items.map((x, i) => (
            <li key={x.r.id} className={clsx("w-[82vw] max-w-[380px] shrink-0 snap-start", i % 2 && "mt-16", x.off && "opacity-60")}>
              <Go s={s} x={x} className="group block">
                <Pic src={x.r.photos[0]} className="aspect-[3/4] rounded-[var(--lux-r)]" sizes="380px" />
                <p className="lux-eyebrow mt-4">Cabin {i + 1} · {x.r.view ?? "River"}</p>
                <h2 className="lux-display mt-1 text-[30px]">{x.r.name}</h2>
                <Price s={s} x={x} className="mt-2" big="text-[19px]" />
              </Go>
            </li>
          ))}
        </ul></div>
      </div>
      <p className="mx-auto max-w-[1240px] px-4 text-[13.5px] text-muted sm:px-6">Swipe or scroll sideways to see every cabin.</p>
    </div>
  );
}

/* ---------- ESTATE · the ledger: a classic catalogue with index letters and small plates ---------- */
function Estate({ s }: { s: Stay }) {
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1100px] px-4 pt-12 sm:px-6 md:pt-20">
        <p className="lux-eyebrow">Catalogue of rooms</p>
        <h1 className="lux-display mt-4 text-[46px] md:text-[84px]">The Estate Register</h1>
        <Search s={s} className="mt-8" /><Status s={s} className="mt-4" />
      </header>
      <div className="mx-auto mt-10 max-w-[1100px] border-y-[3px] border-double border-ink px-4 sm:px-6">
        {s.items.map((x, i) => (
          <Go key={x.r.id} s={s} x={x} className={clsx("grid gap-5 border-b border-line py-8 last:border-0 sm:grid-cols-[64px_160px_1fr_auto] sm:items-center", x.off && "opacity-60")}>
            <span className="lux-display text-[44px] leading-none text-[color:var(--lux-accent)]">{String.fromCharCode(65 + i)}.</span>
            <Pic src={x.r.photos[0]} className="aspect-[4/3] border border-line p-1" sizes="160px" />
            <span><span className="lux-display block text-[28px]">{x.r.name}</span><span className="mt-1 block text-[15px] text-muted">{x.r.description}</span><span className="mt-2 block text-[12.5px] uppercase tracking-[0.16em] text-muted">{[x.r.bed, size(x.r), x.r.view && `${x.r.view} view`].filter(Boolean).join(" · ")}</span></span>
            <Price s={s} x={x} className="sm:text-right" big="text-[20px]" />
          </Go>
        ))}
      </div>
    </div>
  );
}

const LISTS: Partial<Record<MasterTheme, (p: { s: Stay }) => React.ReactNode>> = {
  aurel: Aurel, courtyard: Courtyard, axis: Axis, waypoint: Waypoint, shanti: Shanti, reside: Reside, commons: Commons, roots: Roots, morning: Morning, matir: Matir,
  zamindar: Zamindar, maison: Maison, noir: Noir, orbit: Orbit, haven: Haven, summit: Summit, canopy: Canopy, drift: Drift, estate: Estate,
};


/** Server-safe entry: the theme's own Rooms page. */
export function ThemeRooms({ hotel, master }: { hotel: Hotel; master?: MasterTheme }) {
  const L = LISTS[master ?? hotel.theme.master] ?? Aurel;
  return <StayPage hotel={hotel} Layout={L} />;
}

