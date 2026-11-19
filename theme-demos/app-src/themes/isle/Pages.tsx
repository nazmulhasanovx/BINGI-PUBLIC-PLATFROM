"use client";
// ISLE v2 — own inner pages: Villas (rooms list), Villa (room detail) and The Island (map).
// Booking logic is the shared engine (pricing, availability, RatePicker); only the layout is ISLE's.
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Sparkles, Utensils, Waves } from "lucide-react";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { dateList, fits, nightlyRate, unitsLeft } from "@/lib/pricing";
import { shortDate, useBooking } from "@/components/booking/BookingProvider";
import { guestLabel } from "@/components/booking/SearchFields";
import { SearchBar } from "@/components/booking/SearchBar";
import { RatePicker } from "@/components/rooms/RatePicker";
import { useSiteView } from "@/lib/site";
import { Reveal } from "@/components/motion/Reveal";
import { overWater } from "./util";

const where = (r: RoomCategory) => (overWater(r.view) ? "water" : "beach");

/* ================= Villas (rooms list) ================= */
export function IsleRooms({ hotel }: { hotel: Hotel }) {
  return <Suspense fallback={<div className="min-h-[60svh]" />}><Rooms hotel={hotel} /></Suspense>;
}

function Rooms({ hotel }: { hotel: Hotel }) {
  const params = useSearchParams();
  const { setSearch, openSearch } = useBooking();
  const urlIn = params.get("in") ?? "", urlOut = params.get("out") ?? "";
  const adults = Number(params.get("adults") ?? 2) || 2, children = Number(params.get("children") ?? 0) || 0;
  useEffect(() => { setSearch({ checkIn: urlIn, checkOut: urlOut, adults, children }); }, [urlIn, urlOut, adults, children, setSearch]);
  const doc = useSiteView(hotel.slug);
  const dates = useMemo(() => dateList(urlIn, urlOut), [urlIn, urlOut]);
  const has = dates.length > 0;
  const [tab, setTab] = useState<"all" | "water" | "beach">("all");
  const q = params.toString();
  const all = hotel.rooms.filter((r) => doc?.rooms[r.id]?.visible !== false).map((r) => ({ r, left: unitsLeft(r, dates), total: has ? dates.reduce((s, d) => s + nightlyRate(r, d), 0) : 0, fit: fits(r, adults, children) }));
  const list = all.filter((x) => tab === "all" || where(x.r) === tab);
  const count = (w: "water" | "beach") => all.filter((x) => where(x.r) === w).reduce((n, x) => n + x.r.units, 0);

  return (
    <div className="pb-16 md:pb-28">
      <header className="relative overflow-hidden bg-[#0e2a30] pb-14 pt-10 text-white md:pb-24 md:pt-20">
        <div aria-hidden className="absolute inset-0 opacity-30"><Image src={hotel.pagePhotos.rooms ?? hotel.heroPhoto} alt="" fill sizes="100vw" className="object-cover" /></div>
        <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6">
          <p className="isle-accent text-[18px] text-white/85">{hotel.name}</p>
          <h1 className="lux-display mt-2 text-[56px] text-white md:text-[120px]">Villas</h1>
          <div role="tablist" aria-label="Where" className="mt-6 inline-flex rounded-full bg-white/10 p-1 backdrop-blur">
            {([["all", `All · ${count("water") + count("beach")}`], ["water", `Over water · ${count("water")}`], ["beach", `Beach · ${count("beach")}`]] as const).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={clsx("h-10 rounded-full px-4 text-[14px] font-semibold transition-colors", tab === id ? "bg-white text-[#0e2a30]" : "text-white/85 hover:text-white")}>{label}</button>
            ))}
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto -mt-8 hidden max-w-[1040px] px-6 md:block"><SearchBar /></div>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <button onClick={openSearch} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left md:hidden">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-action"><CalendarDays className="size-5" aria-hidden /></span>
          <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{has ? `${shortDate(urlIn)} – ${shortDate(urlOut)}` : "Add dates for prices"}</span><span className="block text-sm text-muted">{guestLabel(adults, children)}</span></span>
        </button>
        <p className="mt-8 text-[15px] text-muted md:mt-14">{has ? `${list.filter((x) => x.left > 0 && x.fit).length} of ${list.length} available · ${dates.length} night${dates.length > 1 ? "s" : ""}` : <>Prices from — <button onClick={openSearch} className="font-semibold text-action underline underline-offset-2">add your dates</button> for live prices.</>}</p>
        <ol className="mt-6 space-y-10 md:space-y-16">
          {list.map(({ r, left, total, fit }, i) => {
            const off = has && (left === 0 || !fit);
            return (
              <li key={r.id}>
                <Reveal className={clsx("grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-14", off && "opacity-70")}>
                  <Link href={`/hotel/${hotel.slug}/rooms/${r.slug}${q ? `?${q}` : ""}`} className={clsx("group relative block", i % 2 && "md:order-2")}>
                    <span className="sr-only">{r.name}</span>
                    <div className="relative aspect-[16/11] overflow-hidden rounded-[28px]"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" /></div>
                    {r.photos[1] && <div className={clsx("absolute -bottom-6 hidden aspect-square w-[34%] overflow-hidden rounded-[22px] border-4 border-canvas md:block", i % 2 ? "-left-6" : "-right-6")}><Image src={r.photos[1]} alt="" fill sizes="240px" className="object-cover" /></div>}
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[12.5px] font-semibold text-[#0e2a30] backdrop-blur">{where(r) === "water" ? "Over the water" : "On the beach"}</span>
                    {has && left > 0 && left <= 2 && fit && <span className="absolute right-4 top-4 rounded-full bg-[#0e2a30] px-3 py-1 text-[12.5px] font-semibold text-white">Only {left} left</span>}
                  </Link>
                  <div>
                    <p className="isle-accent text-[20px] text-[color:var(--lux-accent-ink)]">N° {String(i + 1).padStart(2, "0")}</p>
                    <h2 className="lux-display mt-1 text-[40px] md:text-[56px]">{r.name}</h2>
                    <p className="mt-3 text-[16px] leading-relaxed text-muted">{r.description}</p>
                    <dl className="mt-5 grid grid-cols-3 border-y border-line text-center">
                      <div className="py-3"><dt className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Size</dt><dd className="mt-1 font-semibold tabular-nums">{r.sizeSqft ? `${r.sizeSqft.toLocaleString()} ft²` : "—"}</dd></div>
                      <div className="border-x border-line py-3"><dt className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Sleeps</dt><dd className="mt-1 font-semibold">{r.maxAdults + r.maxChildren}</dd></div>
                      <div className="py-3"><dt className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Bed</dt><dd className="mt-1 truncate px-1 font-semibold">{r.bed}</dd></div>
                    </dl>
                    <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                      {off ? <p className="font-semibold text-muted">{!fit ? `Fits up to ${r.maxAdults} adults` : "Not available for these dates"}</p>
                        : has ? <p><span className="block text-[13px] text-muted">{dates.length} night{dates.length > 1 ? "s" : ""}, before tax</span><b className="text-[24px] tabular-nums">{formatMoney(total)}</b></p>
                        : <p><span className="block text-[13px] text-muted">from</span><b className="text-[24px] tabular-nums">{formatMoney(r.fromPrice)}</b><span className="text-muted"> / night</span></p>}
                      <Link href={`/hotel/${hotel.slug}/rooms/${r.slug}${q ? `?${q}` : ""}`} className="lux-btn">{off ? "View villa" : "Select villa"} <ArrowRight className="size-4" aria-hidden /></Link>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ================= Villa (room detail) ================= */
export function IsleRoom({ hotel, room }: { hotel: Hotel; room: RoomCategory }) {
  const [shot, setShot] = useState(0);
  const others = hotel.rooms.filter((r) => r.id !== room.id);
  return (
    <div className="pb-28 md:pb-24">
      <section className="relative h-[72svh] min-h-[460px] overflow-hidden text-white md:h-[88svh]">
        {room.photos.map((p, i) => (
          <Image key={p} src={p} alt={i === 0 ? room.name : ""} fill priority={i === 0} sizes="100vw" className={clsx("object-cover transition-opacity duration-700", shot === i ? "opacity-100" : "opacity-0")} />
        ))}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/25" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1240px] px-4 pb-10 sm:px-6 md:pb-16">
          <Link href={`/hotel/${hotel.slug}/rooms`} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/85 hover:text-white"><ArrowLeft className="size-4" aria-hidden /> All villas</Link>
          <p className="isle-accent mt-6 text-[20px] text-white/90">{where(room) === "water" ? "Over the water" : "On the beach"}</p>
          <h1 className="lux-display mt-1 text-[52px] text-white md:text-[110px]">{room.name}</h1>
          {room.photos.length > 1 && (
            <div className="mt-6 flex gap-2" role="group" aria-label="Photos">
              {room.photos.map((p, i) => <button key={p} onClick={() => setShot(i)} aria-label={`Photo ${i + 1}`} aria-pressed={shot === i} className={clsx("h-1.5 rounded-full transition-all", shot === i ? "w-10 bg-white" : "w-5 bg-white/45")} />)}
            </div>
          )}
        </div>
      </section>
      <div className="mx-auto mt-10 grid max-w-[1240px] gap-10 px-4 sm:px-6 md:mt-16 lg:grid-cols-[1fr_400px] lg:gap-16">
        <div className="min-w-0">
          <p className="lux-display text-[30px] leading-snug md:text-[40px]">{room.short}</p>
          <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-muted">{room.description}</p>
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-4">
            {[["Size", room.sizeSqft ? `${room.sizeSqft.toLocaleString()} ft²` : "—"], ["Sleeps", `${room.maxAdults} adults${room.maxChildren ? ` + ${room.maxChildren}` : ""}`], ["Bed", room.bed], ["View", room.view ?? "—"]].map(([k, v]) => (
              <div key={k} className="bg-surface p-5"><dt className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">{k}</dt><dd className="isle-accent mt-1.5 text-[20px] leading-tight">{v}</dd></div>
            ))}
          </dl>
          <h2 className="lux-display mt-14 text-[36px]">In your villa</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {room.amenities.map((a) => <li key={a} className="flex items-center gap-3 border-b border-line pb-3 text-[15.5px]"><Check className="size-4 text-[color:var(--lux-accent-ink)]" aria-hidden /> {a}</li>)}
          </ul>
          <h2 className="lux-display mt-14 text-[36px]">Good to know</h2>
          <dl className="mt-5 divide-y divide-line border-y border-line text-[15px]">
            <div className="flex gap-4 py-4"><dt className="w-32 shrink-0 font-semibold">Check-in</dt><dd className="text-muted">From {hotel.checkIn} · check-out by {hotel.checkOut}</dd></div>
            <div className="flex gap-4 py-4"><dt className="w-32 shrink-0 font-semibold">Cancellation</dt><dd className="text-muted">{hotel.policies.cancellation}</dd></div>
            <div className="flex gap-4 py-4"><dt className="w-32 shrink-0 font-semibold">Children</dt><dd className="text-muted">{hotel.policies.children}</dd></div>
            <div className="flex gap-4 py-4"><dt className="w-32 shrink-0 font-semibold">Tax</dt><dd className="text-muted">{hotel.policies.tax}</dd></div>
          </dl>
        </div>
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <Suspense fallback={<div className="h-[520px] rounded-[28px] bg-surface" />}><RatePicker hotel={hotel} room={room} /></Suspense>
        </aside>
      </div>
      {others.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1240px] px-4 sm:px-6">
          <h2 className="lux-display text-[36px] md:text-[48px]">Other villas</h2>
          <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-5 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
            {others.map((r) => (
              <Link key={r.id} href={`/hotel/${hotel.slug}/rooms/${r.slug}`} className="group w-[70%] max-w-[340px] shrink-0 snap-start">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]"><Image src={r.photos[0]} alt="" fill sizes="340px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></div>
                <p className="lux-display mt-4 text-[26px]">{r.name}</p>
                <p className="text-[14px] text-muted">from <b className="text-ink tabular-nums">{formatMoney(r.fromPrice)}</b> / night</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ================= The Island (map) ================= */
type Spot = { id: string; x: number; y: number; icon: typeof Waves; title: string; text: string; meta?: string; href?: string };

export function IsleIsland({ hotel }: { hotel: Hotel }) {
  const water = hotel.rooms.filter((r) => where(r) === "water");
  const beach = hotel.rooms.filter((r) => where(r) === "beach");
  const spa = hotel.services.find((s) => s.category === "spa");
  const reef = hotel.services.find((s) => /reef|snorkel|dive/i.test(s.name));
  const spots: Spot[] = [
    water.length && { id: "water", x: 74, y: 30, icon: Waves, title: "Water villas", text: water.map((r) => r.name).join(" · "), meta: `${water.reduce((n, r) => n + r.units, 0)} villas on the lagoon walkway`, href: `/hotel/${hotel.slug}/rooms` },
    beach.length && { id: "beach", x: 24, y: 62, icon: Sparkles, title: "Beach villas", text: beach.map((r) => r.name).join(" · "), meta: `${beach.reduce((n, r) => n + r.units, 0)} villas under the palms`, href: `/hotel/${hotel.slug}/rooms` },
    ...hotel.outlets.map((o, i) => ({ id: o.id, x: [62, 40, 52][i % 3], y: [64, 40, 78][i % 3], icon: Utensils, title: o.name, text: o.short, meta: `${o.hours} · ${o.location}`, href: `/hotel/${hotel.slug}/dining` })),
    spa && { id: "spa", x: 86, y: 52, icon: Sparkles, title: spa.name, text: spa.short, meta: `${formatMoney(spa.price)} ${spa.unit}`, href: `/hotel/${hotel.slug}/experiences` },
    reef && { id: "reef", x: 88, y: 16, icon: Waves, title: reef.name, text: reef.short, meta: `${formatMoney(reef.price)} ${reef.unit}`, href: `/hotel/${hotel.slug}/experiences` },
    hotel.nearby?.[0] && { id: "jetty", x: 92, y: 80, icon: Clock, title: "Arrival jetty", text: hotel.nearby[0].name, meta: hotel.nearby[0].time },
  ].filter(Boolean) as Spot[];
  const [active, setActive] = useState(spots[0]?.id);
  const cur = spots.find((s) => s.id === active) ?? spots[0];
  return (
    <div className="pb-20">
      <header className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 md:pt-16">
        <p className="isle-accent text-[18px] text-[color:var(--lux-accent-ink)]">{hotel.name}</p>
        <h1 className="lux-display mt-2 text-[56px] md:text-[110px]">The Island</h1>
        <p className="mt-3 max-w-[620px] text-[16.5px] leading-relaxed text-muted">Tap a place on the map to see what is there, when it is open and what it costs.</p>
      </header>
      <section className="mx-auto mt-8 grid max-w-[1240px] gap-6 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="relative overflow-hidden rounded-[28px] bg-[#7fd8d0]">
          <svg viewBox="0 0 100 70" className="block h-auto w-full" aria-hidden>
            <defs><radialGradient id="isle-sea" cx="45%" cy="55%" r="65%"><stop offset="0" stopColor="#9be6dd" /><stop offset="0.55" stopColor="#53c3c7" /><stop offset="1" stopColor="#1d7fa2" /></radialGradient></defs>
            <rect width="100" height="70" fill="url(#isle-sea)" />
            <path d="M14 46 C 10 30, 26 20, 42 24 C 56 27, 66 36, 64 48 C 62 60, 42 66, 28 62 C 18 59, 16 54, 14 46Z" fill="#f1e5c9" />
            <path d="M20 46 C 18 34, 30 27, 42 30 C 52 33, 58 40, 56 48 C 54 56, 40 60, 30 57 C 22 55, 21 51, 20 46Z" fill="#8cc07e" />
            <path d="M58 40 C 66 34, 70 26, 78 24 C 84 22, 88 28, 94 26" fill="none" stroke="#a98157" strokeWidth="0.8" strokeLinecap="round" />
            {[64, 70, 76, 82, 88].map((x, i) => <rect key={x} x={x - 1.5} y={i % 2 ? 27 : 20} width="3" height="2.4" rx="0.4" fill="#fff" stroke="#a98157" strokeWidth="0.3" />)}
            <path d="M58 52 L 92 56" stroke="#a98157" strokeWidth="0.8" />
          </svg>
          {spots.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} aria-pressed={active === s.id} aria-label={s.title}
              className={clsx("absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white shadow-lg transition-transform md:size-11", active === s.id ? "scale-110 bg-[#0e2a30] text-white" : "bg-white text-[#0e2a30] hover:scale-105")}
              style={{ left: `${s.x}%`, top: `${(s.y / 70) * 100}%` }}>
              <s.icon className="size-4 md:size-5" aria-hidden />
            </button>
          ))}
        </div>
        {cur && (
          <aside aria-live="polite" className="rounded-[28px] border border-line bg-surface p-6 md:p-8">
            <p className="isle-accent text-[18px] text-[color:var(--lux-accent-ink)]">On the map</p>
            <h2 className="lux-display mt-1 text-[40px] leading-tight">{cur.title}</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{cur.text}</p>
            {cur.meta && <p className="mt-3 text-[14px] font-semibold">{cur.meta}</p>}
            {cur.href && <Link href={cur.href} className="lux-link mt-6">Open <ArrowRight className="size-4" aria-hidden /></Link>}
            <ul className="mt-8 flex flex-wrap gap-2">
              {spots.map((s) => <li key={s.id}><button onClick={() => setActive(s.id)} aria-pressed={active === s.id} className={clsx("h-9 rounded-full border px-3.5 text-[13.5px] font-semibold", active === s.id ? "border-[#0e2a30] bg-[#0e2a30] text-white" : "border-line hover:border-[color:var(--lux-accent)]")}>{s.title}</button></li>)}
            </ul>
          </aside>
        )}
      </section>
      <section className="mx-auto mt-16 grid max-w-[1240px] gap-6 px-4 sm:px-6 md:grid-cols-3">
        {hotel.facilities.map((f) => (
          <div key={f.name} className="border-t border-line pt-5"><h3 className="lux-display text-[26px]">{f.name}</h3><p className="mt-1 text-[15px] text-muted">{f.short}</p></div>
        ))}
      </section>
    </div>
  );
}
