"use client";
// Theme-owned Room detail pages (Luxury + Signature). The booking part is always the shared RatePicker,
// policies come from the site record (DraftText); each theme only changes how the room is presented.
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, type ReactNode } from "react";
import clsx from "clsx";
import { ArrowLeft, Briefcase, Car, Check, Clock, Coffee, Moon, Wifi } from "lucide-react";
import type { Hotel, MasterTheme, RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { RatePicker } from "@/components/rooms/RatePicker";
import { DraftText } from "@/components/site-draft/Draft";
import { Plan } from "./lists";
import { size, sleeps } from "./engine";

type P = { hotel: Hotel; room: RoomCategory };
const back = (h: Hotel) => `/hotel/${h.slug}/rooms`;
const facts = (r: RoomCategory): [string, string][] => ([["Size", size(r)], ["Sleeps", sleeps(r)], ["Bed", r.bed], ["View", r.view]] as [string, string | null | undefined][]).filter((f): f is [string, string] => !!f[1]);

const Pic = ({ src, className, sizes = "(max-width: 768px) 100vw, 700px", priority, children }: { src?: string; className?: string; sizes?: string; priority?: boolean; children?: ReactNode }) => (
  <div className={clsx("relative overflow-hidden bg-line", className)}>{src && <Image src={src} alt="" fill priority={priority} sizes={sizes} className="object-cover" />}{children}</div>
);
const Back = ({ hotel, label = "All rooms", light, className }: { hotel: Hotel; label?: string; light?: boolean; className?: string }) => (
  <Link href={back(hotel)} className={clsx("inline-flex items-center gap-1.5 text-[14px] font-semibold", light ? "text-white/85 hover:text-white" : "text-muted hover:text-ink", className)}><ArrowLeft className="size-4" aria-hidden /> {label}</Link>
);
function Rate({ hotel, room, className }: P & { className?: string }) {
  return <aside className={clsx("lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start", className)}><Suspense fallback={<div className="h-[520px] rounded-[28px] bg-surface" />}><RatePicker hotel={hotel} room={room} /></Suspense></aside>;
}
function Amen({ room, look = "check", className }: { room: RoomCategory; look?: "check" | "pill" | "line" | "grid" | "mono"; className?: string }) {
  if (look === "pill") return <ul className={clsx("flex flex-wrap gap-2", className)}>{room.amenities.map((a) => <li key={a} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[14.5px]">{a}</li>)}</ul>;
  if (look === "line") return <ul className={clsx("divide-y divide-line border-y border-line", className)}>{room.amenities.map((a) => <li key={a} className="py-3 text-[15.5px]">{a}</li>)}</ul>;
  if (look === "grid") return <ul className={clsx("grid grid-cols-2 gap-px overflow-hidden rounded-[var(--lux-r,16px)] border border-line bg-line", className)}>{room.amenities.map((a) => <li key={a} className="bg-surface p-4 text-[15px] font-medium">{a}</li>)}</ul>;
  if (look === "mono") return <ul className={clsx("grid gap-2 font-mono text-[13px] sm:grid-cols-2", className)}>{room.amenities.map((a, i) => <li key={a} className="rounded-lg border border-line px-3 py-2"><span className="text-muted">{String(i + 1).padStart(2, "0")} </span>{a.toUpperCase()}</li>)}</ul>;
  return <ul className={clsx("grid gap-3 sm:grid-cols-2", className)}>{room.amenities.map((a) => <li key={a} className="flex items-center gap-3 text-[15.5px]"><Check className="size-4 shrink-0 text-[color:var(--lux-accent-ink,var(--action))]" aria-hidden /> {a}</li>)}</ul>;
}
function Know({ hotel, className }: { hotel: Hotel; className?: string }) {
  const rows: [string, ReactNode][] = [
    ["Check-in", `From ${hotel.checkIn} · check-out by ${hotel.checkOut}`],
    ["Cancellation", <DraftText key="c" slug={hotel.slug} k="policy.cancellation" fallback={hotel.policies.cancellation} />],
    ["Children", <DraftText key="k" slug={hotel.slug} k="policy.children" fallback={hotel.policies.children} />],
    ["Tax", hotel.policies.tax],
  ];
  return <dl className={clsx("divide-y divide-line border-y border-line text-[15px]", className)}>{rows.map(([k, v]) => <div key={k} className="flex gap-4 py-4"><dt className="w-32 shrink-0 font-semibold">{k}</dt><dd className="text-muted">{v}</dd></div>)}</dl>;
}
function H2({ children, className }: { children: ReactNode; className?: string }) { return <h2 className={clsx("lux-display mt-12 text-[30px] md:text-[36px]", className)}>{children}</h2>; }
function Others({ hotel, room, title = "Other ways to stay", render }: P & { title?: string; render?: (r: RoomCategory) => ReactNode }) {
  const list = hotel.rooms.filter((r) => r.id !== room.id).slice(0, 3);
  if (!list.length) return null;
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-4 sm:px-6">
      <h2 className="lux-display mb-6 text-[30px]">{title}</h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => <li key={r.id}><Link href={`/hotel/${hotel.slug}/rooms/${r.slug}`} className="group block">{render ? render(r) : <><Pic src={r.photos[0]} className="aspect-[4/3] rounded-[var(--lux-r,16px)]" sizes="400px" /><p className="lux-display mt-3 text-[22px]">{r.name}</p><p className="text-[14px] text-muted">from {formatMoney(r.fromPrice)} / night</p></>}</Link></li>)}</ul>
    </section>
  );
}
function useShot() { return useState(0); }
function Dots({ n, at, set, light }: { n: number; at: number; set: (i: number) => void; light?: boolean }) {
  return n > 1 ? <div className="flex gap-2" role="group" aria-label="Photos">{Array.from({ length: n }, (_, i) => <button key={i} onClick={() => set(i)} aria-label={`Photo ${i + 1}`} aria-pressed={at === i} className={clsx("h-1.5 rounded-full transition-all", at === i ? "w-9" : "w-4 opacity-45", light ? "bg-white" : "bg-ink")} />)}</div> : null;
}
function Thumbs({ photos, at, set, className, round }: { photos: string[]; at: number; set: (i: number) => void; className?: string; round?: string }) {
  return photos.length > 1 ? <div className={clsx("flex gap-2", className)} role="group" aria-label="Photos">{photos.map((p, i) => <button key={p} onClick={() => set(i)} aria-label={`Photo ${i + 1}`} aria-pressed={at === i} className={clsx("relative size-16 overflow-hidden border-2 transition-opacity", round ?? "rounded-lg", at === i ? "border-ink" : "border-transparent opacity-60")}><Image src={p} alt="" fill sizes="64px" className="object-cover" /></button>)}</div> : null;
}
const Body = ({ hotel, room, children, amen = "check", rate = true, className }: P & { children?: ReactNode; amen?: Parameters<typeof Amen>[0]["look"]; rate?: boolean; className?: string }) => (
  <div className={clsx("mx-auto mt-10 grid max-w-[1240px] gap-10 px-4 sm:px-6 md:mt-14 lg:grid-cols-[1fr_400px] lg:gap-14", className)}>
    <div className="min-w-0">
      {children}
      <H2>In the room</H2><Amen room={room} look={amen} className="mt-5" />
      <H2>Good to know</H2><Know hotel={hotel} className="mt-5" />
    </div>
    {rate && <Rate hotel={hotel} room={room} />}
  </div>
);

/* AUREL — floor tag + tall split hero, facts on a thick rule */
function Aurel({ hotel, room }: P) {
  const [at, set] = useShot();
  return (
    <div className="pb-24">
      <section className="mx-auto grid max-w-[1240px] gap-6 px-4 pt-6 sm:px-6 md:grid-cols-[1fr_1.1fr] md:pt-12">
        <div className="flex flex-col justify-end">
          <Back hotel={hotel} />
          <p className="sig-caps mt-8 text-[color:var(--action)]">{room.specs?.[0] ?? room.kind}</p>
          <h1 className="lux-display mt-2 text-[56px] uppercase leading-[0.9] md:text-[96px]">{room.name}</h1>
          <p className="mt-4 max-w-[440px] text-[16px] text-muted">{room.short}</p>
          <dl className="mt-8 grid grid-cols-2 border-t-4 border-ink pt-4 sm:grid-cols-4">{facts(room).map(([k, v]) => <div key={k} className="pb-3 pr-3"><dt className="sig-caps text-muted">{k}</dt><dd className="mt-1 font-semibold">{v}</dd></div>)}</dl>
        </div>
        <div><Pic src={room.photos[at]} priority className="aspect-[4/5] md:aspect-[4/5]" /><Thumbs photos={room.photos} at={at} set={set} className="mt-3" round="rounded-none" /></div>
      </section>
      <Body hotel={hotel} room={room} amen="grid"><p className="text-[17px] leading-relaxed text-muted">{room.description}</p></Body>
      <Others hotel={hotel} room={room} title="Other floors" />
    </div>
  );
}

/* COURTYARD — arched frame centred, caption like a postcard back */
function Courtyard({ hotel, room }: P) {
  const [at, set] = useShot();
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-[900px] px-4 pt-8 text-center md:pt-14">
        <Back hotel={hotel} label="All suites" />
        <Pic src={room.photos[at]} priority className="mx-auto mt-8 aspect-[3/4] max-w-[440px] rounded-t-[999px] border-8 border-surface shadow-[0_30px_60px_-35px_rgba(0,0,0,.5)]" sizes="440px" />
        <Thumbs photos={room.photos} at={at} set={set} className="mt-4 justify-center" round="rounded-full" />
        <p className="sig-caps mt-8 text-muted">{room.view ? `${room.view} side` : room.kind}</p>
        <h1 className="lux-display mt-2 text-[46px] md:text-[76px]">{room.name}</h1>
        <p className="mx-auto mt-3 max-w-[540px] text-[16.5px] text-muted">{room.description}</p>
        <p className="mt-5 text-[14px] uppercase tracking-[0.16em]">{facts(room).map(([, v]) => v).join("  ·  ")}</p>
      </section>
      <Body hotel={hotel} room={room} amen="line" />
      <Others hotel={hotel} room={room} title="More suites around the courtyard" render={(r) => <div className="text-center"><Pic src={r.photos[0]} className="mx-auto aspect-[3/4] max-w-[260px] rounded-t-[999px]" sizes="260px" /><p className="lux-display mt-3 text-[22px]">{r.name}</p></div>} />
    </div>
  );
}

/* AXIS — spec sheet: three-photo strip, work-ready panel, compact table */
function Axis({ hotel, room }: P) {
  return (
    <div className="pb-24">
      <div className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6"><Back hotel={hotel} /></div>
      <section className="mx-auto mt-4 grid max-w-[1240px] grid-cols-3 gap-2 px-4 sm:px-6">{[0, 1, 0].map((p, i) => <Pic key={i} src={room.photos[p] ?? room.photos[0]} priority={i === 0} className={clsx("aspect-[4/3] rounded-xl", i === 0 && "col-span-3 aspect-[21/9] md:col-span-2 md:row-span-2 md:aspect-auto")} sizes="600px" />)}</section>
      <Body hotel={hotel} room={room} amen="pill">
        <p className="sig-caps text-[color:var(--action)]">{room.kind} · business ready</p>
        <h1 className="lux-display mt-2 text-[40px] md:text-[56px]">{room.name}</h1>
        <p className="mt-3 text-[16.5px] text-muted">{room.description}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">{[[Briefcase, "Work desk", "Ergonomic chair, sockets at desk"], [Wifi, "Fast Wi-Fi", "Free across the hotel"], [Clock, "Flexible", "Early check-in on request"]].map(([I, t, d]) => { const Ic = I as typeof Wifi; return <div key={t as string} className="rounded-2xl border border-line bg-surface p-4"><Ic className="size-5 text-[color:var(--action)]" aria-hidden /><p className="mt-2 font-semibold">{t as string}</p><p className="text-[13.5px] text-muted">{d as string}</p></div>; })}</div>
        <table className="mt-8 w-full text-left text-[15px]"><caption className="sr-only">Room specification</caption><tbody className="divide-y divide-line border-y border-line">{facts(room).map(([k, v]) => <tr key={k}><th scope="row" className="w-40 py-3 font-semibold">{k}</th><td className="py-3 text-muted">{v}</td></tr>)}</tbody></table>
      </Body>
      <Others hotel={hotel} room={room} />
    </div>
  );
}

/* WAYPOINT — highway sign over the photo, arrival card for drivers */
function Waypoint({ hotel, room }: P) {
  return (
    <div className="pb-24">
      <section className="relative">
        <Pic src={room.photos[0]} priority className="h-[52svh] min-h-[340px]" sizes="100vw"><div aria-hidden className="absolute inset-0 bg-black/25" /></Pic>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1240px] translate-y-1/3 px-4 sm:px-6">
          <div className="inline-block rounded-lg border-4 border-white bg-[color:var(--action)] px-5 py-3 text-white shadow-[0_0_0_3px_var(--action)]"><Back hotel={hotel} light label="All rooms" /><h1 className="lux-display mt-1 text-[34px] text-white md:text-[54px]">{room.name}</h1></div>
        </div>
      </section>
      <Body hotel={hotel} room={room} className="!mt-20" amen="check">
        <p className="text-[17px] text-muted">{room.description}</p>
        <div className="mt-8 rounded-2xl border-2 border-ink/90 bg-[#F2C230] p-5 text-[#1b1b1b]"><p className="flex items-center gap-2 font-bold"><Car className="size-5" aria-hidden /> Arriving by road</p><ul className="mt-2 space-y-1 text-[15px]"><li>Free parking right outside your door</li><li>Check-in from {hotel.checkIn} — late arrival? Call ahead</li><li>Check-out by {hotel.checkOut}, coffee to go at reception</li></ul></div>
        <dl className="mt-6 flex flex-wrap gap-2">{facts(room).map(([k, v]) => <div key={k} className="rounded-full border border-line px-3 py-1.5 text-[14px]"><dt className="sr-only">{k}</dt><dd>{v}</dd></div>)}</dl>
      </Body>
      <Others hotel={hotel} room={room} title="More rooms at this stop" />
    </div>
  );
}

/* SHANTI — one calm column, rounded photos stacked, a handwritten note */
function Shanti({ hotel, room }: P) {
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-[760px] px-4 pt-10 text-center md:pt-16">
        <Back hotel={hotel} />
        <p className="sig-script mt-6 text-[28px] text-[color:var(--action)]">a quiet room for you</p>
        <h1 className="lux-display mt-1 text-[44px] md:text-[64px]">{room.name}</h1>
      </section>
      <div className="mx-auto mt-8 grid max-w-[900px] gap-3 px-4 sm:grid-cols-2 sm:px-6">{room.photos.slice(0, 2).map((p, i) => <Pic key={p} src={p} priority={i === 0} className={clsx("rounded-[32px]", i === 0 ? "aspect-[4/5]" : "aspect-[4/5] sm:mt-12")} sizes="440px" />)}</div>
      <Body hotel={hotel} room={room} amen="pill" className="max-w-[1100px]">
        <p className="text-[17px] leading-relaxed">{room.description}</p>
        <p className="sig-script mt-6 rounded-[24px] bg-surface p-5 text-[22px] leading-snug text-[color:var(--action)]">“Tea is on us every afternoon in the garden. Ask for a second pillow anytime.” — your hosts</p>
        <p className="mt-6 text-[15px] text-muted">{facts(room).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
      </Body>
      <Others hotel={hotel} room={room} title="Other rooms in the house" />
    </div>
  );
}

/* RESIDE — floor plan first, then photos; nightly vs 30-night estimate */
function Reside({ hotel, room }: P) {
  const [at, set] = useShot();
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 md:pt-12">
        <Back hotel={hotel} label="All apartments" />
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[20px] border border-line bg-surface p-6">
            <p className="sig-caps text-muted">Floor plan · {size(room) ?? "—"}</p>
            <h1 className="lux-display mt-2 text-[40px] md:text-[56px]">{room.name}</h1>
            <Plan r={room} className="mt-6 w-full text-ink/75" />
            <div className="mt-6 grid grid-cols-2 gap-3 text-[14px]"><div className="rounded-xl bg-canvas p-3"><p className="text-muted">Nightly from</p><b className="text-[18px] tabular-nums">{formatMoney(room.fromPrice)}</b></div><div className="rounded-xl bg-canvas p-3"><p className="text-muted">30 nights, est.</p><b className="text-[18px] tabular-nums">{formatMoney(Math.round(room.fromPrice * 30 * 0.72))}</b></div></div>
            <Link href={`/hotel/${hotel.slug}/long-stay`} className="mt-3 inline-block text-[14px] font-semibold text-action underline underline-offset-2">Staying a month or more? Ask for a quote</Link>
          </div>
          <div><Pic src={room.photos[at]} priority className="aspect-[4/3] rounded-[20px]" /><Thumbs photos={room.photos} at={at} set={set} className="mt-3" /></div>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="grid"><p className="text-[17px] leading-relaxed text-muted">{room.description}</p></Body>
      <Others hotel={hotel} room={room} title="Other apartments" />
    </div>
  );
}

/* COMMONS — sticker-board: chunky borders, bed facts as stickers */
function Commons({ hotel, room }: P) {
  const dorm = room.kind === "dorm";
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 md:pt-12">
        <Back hotel={hotel} label="Beds & rooms" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Pic src={room.photos[0]} priority className="aspect-[4/3] rounded-[22px] border-[3px] border-ink shadow-[8px_8px_0_var(--ink)]" />
          <div>
            <span className="inline-block -rotate-2 rounded-full bg-[#F7E04B] px-4 py-1.5 text-[14px] font-bold text-[#151515]">{dorm ? `${room.bedrooms ?? room.maxAdults}-bed dorm · price per bed` : "Private room"}</span>
            <h1 className="lux-display mt-4 text-[48px] uppercase leading-[0.9] md:text-[80px]">{room.name}</h1>
            <p className="mt-4 text-[16.5px] text-muted">{room.description}</p>
            <ul className="mt-6 flex flex-wrap gap-3">{facts(room).map(([k, v], i) => <li key={k} className={clsx("rounded-xl border-2 border-ink bg-surface px-3 py-2 text-[14px] font-semibold", i % 2 ? "rotate-1" : "-rotate-1")}>{v}</li>)}</ul>
          </div>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="pill">
        {dorm && <div className="rounded-[18px] border-2 border-ink p-5"><p className="font-bold">How dorm beds work</p><p className="mt-1 text-[15px] text-muted">You book a bed, not the room. Lockers, curtains and a reading light at every bunk. Female-only and mixed rooms — ask at check-in.</p></div>}
      </Body>
      <Others hotel={hotel} room={room} title="Other ways to crash" />
    </div>
  );
}

/* ROOTS — polaroid pile + a note from the family */
function Roots({ hotel, room }: P) {
  const tilt = ["-rotate-3", "rotate-2", "-rotate-1"];
  return (
    <div className="pb-24">
      <section className="mx-auto grid max-w-[1100px] items-center gap-10 px-4 pt-8 sm:px-6 md:grid-cols-2 md:pt-16">
        <div className="relative mx-auto h-[380px] w-full max-w-[420px] md:h-[460px]">
          {room.photos.slice(0, 3).map((p, i) => <div key={p} className={clsx("absolute w-[78%] bg-white p-3 pb-10 shadow-[0_16px_30px_-18px_rgba(0,0,0,.5)]", tilt[i], i === 0 ? "left-0 top-6" : i === 1 ? "right-0 top-0" : "bottom-0 left-[12%]")}><Pic src={p} priority={i === 0} className="aspect-square" sizes="320px" /></div>)}
        </div>
        <div>
          <Back hotel={hotel} />
          <h1 className="sig-satisfy mt-6 text-[56px] leading-none text-[color:var(--action)] md:text-[72px]">{room.name}</h1>
          <p className="mt-4 text-[17px] leading-relaxed">{room.description}</p>
          <p className="mt-6 border-l-4 border-[color:var(--action)] pl-4 text-[15.5px] italic text-muted">“We cook dinner together most evenings — join us if you like. Home-grown rice, fish from the pond.” — Ammu &amp; family</p>
          <p className="mt-5 text-[14.5px] text-muted">{facts(room).map(([, v]) => v).join(" · ")}</p>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="check" />
      <Others hotel={hotel} room={room} title="Other rooms in our home" />
    </div>
  );
}

/* MORNING — menu card: the room as today's special, breakfast box */
function Morning({ hotel, room }: P) {
  return (
    <div className="pb-24">
      <section className="mx-auto mt-6 max-w-[1100px] px-4 sm:px-6 md:mt-12">
        <Back hotel={hotel} />
        <div className="mt-4 grid overflow-hidden rounded-[6px] border border-line bg-surface md:grid-cols-2">
          <Pic src={room.photos[0]} priority className="aspect-[4/3] md:aspect-auto" />
          <div className="p-6 md:p-12">
            <p className="sig-caps text-muted">Today&apos;s room</p>
            <h1 className="lux-display mt-2 text-[44px] italic md:text-[60px]">{room.name}</h1>
            <p className="mt-3 text-[16.5px] text-muted">{room.description}</p>
            <ul className="mt-6 space-y-2">{facts(room).map(([k, v]) => <li key={k} className="flex items-baseline gap-2 text-[15px]"><span>{k}</span><span aria-hidden className="flex-1 border-b-2 border-dotted border-line" /><b>{v}</b></li>)}</ul>
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-canvas p-4"><Coffee className="mt-0.5 size-5 text-[color:var(--action)]" aria-hidden /><p className="text-[14.5px]"><b>Breakfast is included.</b> Served 7:00–10:30 — fresh bread, eggs any way, local fruit and good coffee.</p></div>
          </div>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="line" />
      <Others hotel={hotel} room={room} title="Also on the menu" />
    </div>
  );
}

/* MATIR — where the cottage sits on the farm, then photos */
function Matir({ hotel, room }: P) {
  const [at, set] = useShot();
  const i = hotel.rooms.findIndex((r) => r.id === room.id);
  return (
    <div className="pb-24">
      <section className="relative">
        <Pic src={room.photos[at]} priority className="h-[60svh] min-h-[380px]" sizes="100vw"><div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /></Pic>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1240px] px-4 pb-8 text-white sm:px-6">
          <Back hotel={hotel} light label="All cottages" />
          <p className="sig-caps mt-5 text-white/85">Cottage {i + 1} on the farm</p>
          <h1 className="lux-display mt-1 text-[46px] text-white md:text-[80px]">{room.name}</h1>
          <div className="mt-4"><Dots n={room.photos.length} at={at} set={set} light /></div>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="check">
        <p className="text-[17px] leading-relaxed">{room.description}</p>
        <div className="mt-8 rounded-[20px] bg-surface p-5"><p className="font-semibold">Around your cottage</p><p className="mt-1 text-[15px] text-muted">A short walk to the pond and the farm kitchen. Fields on one side, the vegetable garden on the other — come help at harvest if you like.</p></div>
        <p className="mt-5 text-[14.5px] text-muted">{facts(room).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
      </Body>
      <Others hotel={hotel} room={room} title="Neighbouring cottages" />
    </div>
  );
}

/* ZAMINDAR — scalloped portrait, ornament rules, royal facts */
function Zamindar({ hotel, room }: P) {
  return (
    <div className="pb-24">
      <section className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 pt-8 sm:px-6 md:grid-cols-2 md:pt-16">
        <Pic src={room.photos[0]} priority className="aspect-[4/5] rounded-t-[999px] outline outline-1 outline-offset-[10px] outline-[color:var(--lux-accent)]" />
        <div className="text-center md:text-left">
          <Back hotel={hotel} label="All chambers" />
          <div aria-hidden className="mt-8 flex items-center justify-center gap-3 text-[color:var(--lux-accent)] md:justify-start"><span className="h-px w-12 bg-current" />❖<span className="h-px w-12 bg-current" /></div>
          <h1 className="lux-display mt-4 text-[46px] md:text-[72px]">{room.name}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">{room.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-[color:var(--lux-accent)] py-5 text-left">{facts(room).map(([k, v]) => <div key={k}><dt className="lux-eyebrow">{k}</dt><dd className="lux-display mt-1 text-[22px]">{v}</dd></div>)}</dl>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="line" />
      <Others hotel={hotel} room={room} title="Other chambers of the house" />
    </div>
  );
}

/* MAISON — editorial spread: full-bleed photo, drop cap, pull quote, photo grid */
function Maison({ hotel, room }: P) {
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 md:pt-12">
        <Back hotel={hotel} />
        <h1 className="lux-display mt-6 text-[52px] md:text-[120px]">{room.name}</h1>
        <p className="lux-eyebrow mt-2">{room.kind} · {facts(room).map(([, v]) => v).join(" · ")}</p>
      </section>
      <Pic src={room.photos[0]} priority className="mt-8 aspect-[21/9]" sizes="100vw" />
      <Body hotel={hotel} room={room} amen="line">
        <p className="text-[18px] leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-heading)] first-letter:text-[72px] first-letter:leading-[0.8]">{room.description}</p>
        <blockquote className="lux-display my-10 border-l-2 border-[color:var(--lux-accent)] pl-6 text-[28px] italic leading-snug md:text-[34px]">“{room.short}”</blockquote>
        <div className="grid grid-cols-2 gap-3">{room.photos.slice(1, 3).map((p) => <Pic key={p} src={p} className="aspect-[3/4]" sizes="320px" />)}</div>
      </Body>
      <Others hotel={hotel} room={room} title="Further reading" />
    </div>
  );
}

/* NOIR — full-screen dark photo, gold spec list, quiet type */
function Noir({ hotel, room }: P) {
  const [at, set] = useShot();
  return (
    <div className="pb-24">
      <section className="relative h-[86svh] min-h-[500px] overflow-hidden">
        {room.photos.map((p, i) => <Image key={p} src={p} alt={i === 0 ? room.name : ""} fill priority={i === 0} sizes="100vw" className={clsx("object-cover transition-opacity duration-700", at === i ? "opacity-75" : "opacity-0")} />)}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1240px] px-4 pb-12 text-white sm:px-6">
          <Back hotel={hotel} light />
          <p className="lux-eyebrow mt-8 !text-[#DCC08A]">{room.view ? `${room.view} · after dark` : "After dark"}</p>
          <h1 className="lux-display mt-2 text-[52px] text-white md:text-[110px]">{room.name}</h1>
          <div className="mt-6"><Dots n={room.photos.length} at={at} set={set} light /></div>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="line">
        <dl className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">{facts(room).map(([k, v]) => <div key={k} className="bg-surface p-5"><dt className="lux-eyebrow">{k}</dt><dd className="lux-display mt-1 text-[24px]">{v}</dd></div>)}</dl>
        <p className="mt-8 text-[17px] leading-relaxed text-muted"><Moon className="mr-2 inline size-4 text-[color:var(--lux-accent)]" aria-hidden />{room.description}</p>
      </Body>
      <Others hotel={hotel} room={room} title="Other scenes" />
    </div>
  );
}

/* ORBIT — porthole view + telemetry grid */
function Orbit({ hotel, room }: P) {
  const [at, set] = useShot();
  return (
    <div className="pb-24">
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 pt-8 sm:px-6 md:grid-cols-2 md:pt-16">
        <div className="relative mx-auto aspect-square w-full max-w-[460px]"><span aria-hidden className="absolute -inset-4 rounded-full border border-dashed border-line" /><Pic src={room.photos[at]} priority className="size-full rounded-full ring-8 ring-[color:var(--surface)]" sizes="460px" /></div>
        <div>
          <Back hotel={hotel} label="All capsules" />
          <p className="mt-8 font-mono text-[12.5px] uppercase tracking-[0.22em] text-muted">Module · {room.kind}</p>
          <h1 className="lux-display mt-2 text-[48px] md:text-[84px]">{room.name}</h1>
          <p className="mt-4 text-[16.5px] text-muted">{room.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-2 font-mono text-[13px]">{facts(room).map(([k, v]) => <div key={k} className="rounded-xl border border-line p-3"><dt className="uppercase text-muted">{k}</dt><dd className="mt-1 text-ink">{v}</dd></div>)}</dl>
          <div className="mt-6"><Thumbs photos={room.photos} at={at} set={set} round="rounded-full" /></div>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="mono" />
      <Others hotel={hotel} room={room} title="Other modules" render={(r) => <div className="text-center"><Pic src={r.photos[0]} className="mx-auto aspect-square w-[70%] rounded-full" sizes="260px" /><p className="lux-display mt-3 text-[22px]">{r.name}</p></div>} />
    </div>
  );
}

/* HAVEN — photos scroll on the left, the room stays with you on the right */
function Haven({ hotel, room }: P) {
  return (
    <div className="pb-24">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 pt-6 sm:px-6 md:pt-12 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">{room.photos.map((p, i) => <Pic key={p} src={p} priority={i === 0} className="aspect-[4/3] rounded-[var(--lux-r)]" />)}</div>
        <div className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <Back hotel={hotel} />
          <p className="lux-eyebrow mt-6">Breathe out</p>
          <h1 className="lux-display mt-3 text-[46px] md:text-[64px]">{room.name}</h1>
          <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{room.description}</p>
          <p className="mt-4 text-[14.5px]">{facts(room).map(([, v]) => v).join("  ·  ")}</p>
          <div className="mt-8"><Rate hotel={hotel} room={room} className="!static" /></div>
        </div>
      </div>
      <Body hotel={hotel} room={room} amen="pill" rate={false} className="lg:!grid-cols-1 !max-w-[900px]" />
      <Others hotel={hotel} room={room} title="Other quiet rooms" />
    </div>
  );
}

/* SUMMIT — wide panorama + altitude gauge */
function Summit({ hotel, room }: P) {
  const i = hotel.rooms.findIndex((r) => r.id === room.id), alt = 1450 - (hotel.rooms.length - 1 - i) * 120;
  return (
    <div className="pb-24">
      <Pic src={room.photos[0]} priority className="aspect-[16/9] max-h-[70svh] w-full md:aspect-[3/1]" sizes="100vw" />
      <section className="mx-auto -mt-16 max-w-[1240px] px-4 sm:px-6">
        <div className="relative rounded-[var(--lux-r)] border border-line bg-surface p-6 md:flex md:items-end md:justify-between md:gap-10 md:p-10">
          <div><Back hotel={hotel} /><h1 className="lux-display mt-4 text-[44px] md:text-[72px]">{room.name}</h1><p className="mt-2 text-muted">{room.short}</p></div>
          <div className="mt-6 md:mt-0 md:w-64"><p className="font-mono text-[13px] text-muted">Altitude</p><p className="lux-display text-[44px] tabular-nums">{alt} m</p><div className="mt-2 h-2 rounded-full bg-line"><div className="h-full rounded-full bg-[color:var(--lux-accent)]" style={{ width: `${Math.min(100, (alt / 1450) * 100)}%` }} /></div></div>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="grid">
        <p className="text-[17px] leading-relaxed text-muted">{room.description}</p>
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">{facts(room).map(([k, v]) => <div key={k}><dt className="font-mono text-[12px] uppercase text-muted">{k}</dt><dd className="mt-1 font-semibold">{v}</dd></div>)}</dl>
      </Body>
      <Others hotel={hotel} room={room} title="Higher up, lower down" />
    </div>
  );
}

/* CANOPY — leaf-shaped mosaic, sounds-of-the-forest note */
function Canopy({ hotel, room }: P) {
  const ph = [...room.photos, ...room.photos].slice(0, 3);
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 md:pt-12">
        <Back hotel={hotel} />
        <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Pic src={ph[0]} priority className="aspect-[4/3] rounded-[160px_12px_160px_12px]" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-1">{ph.slice(1).map((p, i) => <Pic key={i} src={p} className={clsx("aspect-[4/3] md:aspect-auto md:h-full", i ? "rounded-[12px_80px_12px_80px]" : "rounded-[80px_12px_80px_12px]")} sizes="400px" />)}</div>
        </div>
        <p className="lux-eyebrow mt-10">{room.view ? `${room.view} · in the canopy` : "In the canopy"}</p>
        <h1 className="lux-display mt-3 text-[46px] md:text-[80px]">{room.name}</h1>
      </section>
      <Body hotel={hotel} room={room} amen="check">
        <p className="text-[17px] leading-relaxed text-muted">{room.description}</p>
        <p className="mt-6 rounded-[24px_6px_24px_6px] bg-surface p-5 text-[15px]">You&apos;ll wake to birds before the alarm. Gibbons call most mornings around six.</p>
        <p className="mt-5 text-[14.5px]">{facts(room).map(([, v]) => v).join(" · ")}</p>
      </Body>
      <Others hotel={hotel} room={room} title="Other nests" />
    </div>
  );
}

/* DRIFT — sideways photo strip along a wave line, voyage notes */
function Drift({ hotel, room }: P) {
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 md:pt-12">
        <Back hotel={hotel} label="All cabins" />
        <h1 className="lux-display mt-6 text-[48px] md:text-[96px]">{room.name}</h1>
        <p className="lux-eyebrow mt-2">{room.view ?? "River"} · {room.bed}</p>
      </section>
      <div tabIndex={0} role="region" aria-label="Cabin photos" className="mt-8 overflow-x-auto"><ul className="flex w-max snap-x snap-mandatory gap-4 px-4 pb-4 sm:px-6">{room.photos.map((p, i) => <li key={p} className="w-[86vw] max-w-[720px] shrink-0 snap-start"><Pic src={p} priority={i === 0} className="aspect-[16/10] rounded-[var(--lux-r)]" /></li>)}</ul></div>
      <svg aria-hidden viewBox="0 0 1200 30" preserveAspectRatio="none" className="h-6 w-full text-[color:var(--lux-accent-ink)] opacity-30"><path d="M0 15 Q 50 0 100 15 T 200 15 T 300 15 T 400 15 T 500 15 T 600 15 T 700 15 T 800 15 T 900 15 T 1000 15 T 1100 15 T 1200 15" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      <Body hotel={hotel} room={room} amen="line">
        <p className="text-[17px] leading-relaxed text-muted">{room.description}</p>
        <ol className="mt-8 space-y-3 border-l-2 border-[color:var(--lux-accent)] pl-5 text-[15px]"><li><b>Morning</b> — tea on deck as the mist lifts</li><li><b>Afternoon</b> — swim stop, lunch cooked on board</li><li><b>Night</b> — anchored under the stars</li></ol>
      </Body>
      <Others hotel={hotel} room={room} title="Other cabins aboard" />
    </div>
  );
}

/* ESTATE — catalogue plate: framed photo, index letter, double rules */
function Estate({ hotel, room }: P) {
  const i = hotel.rooms.findIndex((r) => r.id === room.id);
  return (
    <div className="pb-24">
      <section className="mx-auto max-w-[1100px] px-4 pt-8 sm:px-6 md:pt-14">
        <Back hotel={hotel} label="The register" />
        <div className="mt-6 grid gap-8 border-y-[3px] border-double border-ink py-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="lux-display text-[80px] leading-none text-[color:var(--lux-accent)]">{String.fromCharCode(65 + Math.max(0, i))}.</p>
            <h1 className="lux-display mt-3 text-[42px] md:text-[60px]">{room.name}</h1>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted">{room.description}</p>
            <table className="mt-6 w-full text-[14.5px]"><caption className="sr-only">Particulars</caption><tbody>{facts(room).map(([k, v]) => <tr key={k} className="border-b border-dotted border-line"><th scope="row" className="py-2 text-left font-semibold">{k}</th><td className="py-2 text-right text-muted">{v}</td></tr>)}</tbody></table>
          </div>
          <div className="border border-line p-2"><Pic src={room.photos[0]} priority className="aspect-[4/3]" /><p className="mt-2 text-center text-[12.5px] uppercase tracking-[0.18em] text-muted">Plate {String.fromCharCode(65 + Math.max(0, i))} — {room.name}</p></div>
        </div>
      </section>
      <Body hotel={hotel} room={room} amen="line" />
      <Others hotel={hotel} room={room} title="Elsewhere in the register" />
    </div>
  );
}

const DETAILS: Partial<Record<MasterTheme, (p: P) => ReactNode>> = {
  aurel: Aurel, courtyard: Courtyard, axis: Axis, waypoint: Waypoint, shanti: Shanti, reside: Reside, commons: Commons, roots: Roots, morning: Morning, matir: Matir,
  zamindar: Zamindar, maison: Maison, noir: Noir, orbit: Orbit, haven: Haven, summit: Summit, canopy: Canopy, drift: Drift, estate: Estate,
};

export function ThemeRoom({ hotel, room, master }: P & { master?: MasterTheme }) {
  const D = DETAILS[master ?? hotel.theme.master] ?? Aurel;
  return <D hotel={hotel} room={room} />;
}
