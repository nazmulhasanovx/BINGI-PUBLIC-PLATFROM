"use client";
// ISLE v2 — scroll voyage. A tall section with a sticky 3D island; five chapters fade in as the guest scrolls.
// Calm / low-end / no-WebGL: the same chapters as a normal photo hero + stacked panels (nothing is lost).
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Star } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney, showRating } from "@/lib/data";
import { useFx } from "@/fx/fx";
import { DraftText } from "@/components/site-draft/Draft";
import { Island3D, type IslandSpec } from "./Island3D";
import { overWater } from "./util";


type Chapter = { id: string; range: [number, number]; eyebrow: string; body: React.ReactNode };

function chapters(hotel: Hotel): Chapter[] {
  const water = hotel.rooms.filter((r) => overWater(r.view));
  const beach = hotel.rooms.filter((r) => !overWater(r.view));
  const nW = water.reduce((n, r) => n + r.units, 0);
  const nB = beach.reduce((n, r) => n + r.units, 0);
  const transfer = hotel.services.find((s) => s.category === "transfer");
  const bar = hotel.outlets.find((o) => o.kind === "bar") ?? hotel.outlets[0];
  const list = (rooms: typeof water) => (
    <ul className="mt-5 divide-y divide-white/25 border-y border-white/25">
      {rooms.map((r) => (
        <li key={r.id}>
          <Link href={`/hotel/${hotel.slug}/rooms/${r.slug}`} className="flex items-baseline justify-between gap-6 py-3 text-[15px] hover:opacity-80">
            <span className="font-semibold">{r.name}</span><span className="tabular-nums opacity-90">from {formatMoney(r.fromPrice)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
  return [
    {
      id: "welcome", range: [0, 0.15], eyebrow: `${hotel.area}, ${hotel.city}`,
      body: (
        <>
          <h1 className="lux-display text-[48px] text-white md:text-[96px]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
          <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-white/90 md:text-[18px]"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
          {showRating(hotel) && <p className="mt-5 flex items-center gap-2 text-[14px]"><Star className="size-4 fill-current" aria-hidden /> <b>{hotel.reviewScore}</b> · {hotel.reviewCount} reviews</p>}
        </>
      ),
    },
    {
      id: "arrival", range: [0.17, 0.33], eyebrow: "Arrival",
      body: (
        <>
          <h2 className="lux-display text-[40px] text-white md:text-[72px]">By speedboat, <span className="isle-accent">across the lagoon</span></h2>
          {transfer && <p className="mt-5 max-w-[460px] text-[16px] leading-relaxed text-white/90">{transfer.short} <b className="whitespace-nowrap tabular-nums">{formatMoney(transfer.price)}</b> {transfer.unit}.</p>}
          {hotel.nearby?.[0] && <p className="mt-2 text-[14px] text-white/80">{hotel.nearby[0].name} · {hotel.nearby[0].time}</p>}
        </>
      ),
    },
    {
      id: "water", range: [0.35, 0.55], eyebrow: "Over the water",
      body: (
        <>
          <h2 className="lux-display text-[40px] text-white md:text-[72px]"><span className="isle-accent">{nW}</span> villas on the lagoon</h2>
          <p className="mt-4 max-w-[440px] text-[16px] text-white/90">On stilts above the reef, each with its own deck and sea steps.</p>
          {list(water)}
        </>
      ),
    },
    {
      id: "beach", range: [0.57, 0.73], eyebrow: "On the beach",
      body: (
        <>
          <h2 className="lux-display text-[40px] text-white md:text-[72px]"><span className="isle-accent">{nB}</span> under the palms</h2>
          <p className="mt-4 max-w-[440px] text-[16px] text-white/90">Garden villas on the white sand, a hammock at the waterline.</p>
          {list(beach)}
        </>
      ),
    },
    {
      id: "sunset", range: [0.76, 1.01], eyebrow: "Sunset",
      body: (
        <>
          <h2 className="lux-display text-[40px] text-white md:text-[72px]">Then the sun <span className="isle-accent">goes down</span></h2>
          {bar && <p className="mt-5 max-w-[460px] text-[16px] leading-relaxed text-white/90">{bar.name} — {bar.short} <span className="whitespace-nowrap">{bar.hours}</span>.</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/hotel/${hotel.slug}/rooms`} className="lux-btn">Choose your villa <ArrowRight className="size-4" aria-hidden /></Link>
            <Link href={`/hotel/${hotel.slug}/island`} className="lux-btn-ghost lux-btn-ghost-light">See the island map</Link>
          </div>
        </>
      ),
    },
  ];
}

const opacityAt = (p: number, [a, b]: [number, number]) => {
  const fade = 0.035;
  if (p < a - fade || p > b + fade) return 0;
  if (p < a) return (p - (a - fade)) / fade;
  if (p > b) return 1 - (p - b) / fade;
  return 1;
};

export function Voyage({ hotel }: { hotel: Hotel }) {
  const fx = useFx();
  const live = fx.gl && fx.level === "immersive";
  return live ? <Live hotel={hotel} /> : <Still hotel={hotel} />;
}

function Live({ hotel }: { hotel: Hotel }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const dots = useRef<(HTMLButtonElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const list = useMemo(() => chapters(hotel), [hotel]);
  const spec: IslandSpec = {
    water: hotel.rooms.filter((r) => overWater(r.view)).reduce((n, r) => n + r.units, 0),
    beach: hotel.rooms.filter((r) => !overWater(r.view)).reduce((n, r) => n + r.units, 0),
    restaurant: hotel.outlets.length > 0,
  };
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const el = section.current!;
    const update = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(span, 1)));
      progress.current = p;
      list.forEach((c, i) => {
        const o = opacityAt(p, c.range);
        const node = panels.current[i];
        if (node) {
          node.style.opacity = String(o);
          node.style.transform = `translateY(${(1 - o) * 18}px)`;
          node.style.visibility = o < 0.02 ? "hidden" : "visible";
        }
        dots.current[i]?.setAttribute("aria-current", p >= c.range[0] - 0.02 && p <= c.range[1] ? "step" : "false");
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [list]);

  const jump = (i: number) => {
    const el = section.current!;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + span * (list[i].range[0] + 0.02), behavior: "smooth" });
  };

  return (
    <section ref={section} aria-label="A voyage across the island" className="relative h-[560svh] md:h-[640svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#0b5f8c]">
        <Island3D spec={spec} progress={progress} onReady={onReady} />
        <div className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}>
          <Image src={hotel.heroPhoto} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent md:from-black/50" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent md:hidden" />
        {list.map((c, i) => (
          <div
            key={c.id}
            ref={(n) => { panels.current[i] = n; }}
            className="absolute inset-x-0 bottom-[8svh] px-5 text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.35)] md:bottom-auto md:left-[max(24px,calc((100vw-1240px)/2+24px))] md:right-auto md:top-1/2 md:w-[min(620px,52vw)] md:-translate-y-1/2 md:px-0"
            style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
          >
            <p className="lux-eyebrow !text-white/90">{c.eyebrow}</p>
            <span aria-hidden className="lux-rule mt-4 !bg-white/70" />
            <div className="mt-5">{c.body}</div>
          </div>
        ))}
        <nav aria-label="Voyage chapters" className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex lg:right-8">
          {list.map((c, i) => (
            <button key={c.id} ref={(n) => { dots.current[i] = n; }} onClick={() => jump(i)} className="group flex items-center justify-end gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70 hover:text-white aria-[current=step]:text-white">
              <span className="opacity-0 transition-opacity group-hover:opacity-100 group-aria-[current=step]:opacity-100">{c.eyebrow}</span>
              <span className="block h-px w-6 bg-current transition-all group-aria-[current=step]:w-12" />
            </button>
          ))}
        </nav>
        <p aria-hidden className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-white/80 md:flex"><ArrowDown className="size-4 lux-float" /> Scroll to arrive</p>
      </div>
    </section>
  );
}

/** Calm version: photo hero + the chapters as panels (same content, no 3D). */
function Still({ hotel }: { hotel: Hotel }) {
  const [first, ...rest] = chapters(hotel);
  const photos = [hotel.heroPhoto, hotel.pagePhotos.explore, hotel.rooms.find((r) => overWater(r.view))?.photos[0], hotel.rooms.find((r) => !overWater(r.view))?.photos[0], hotel.pagePhotos.offers];
  return (
    <section aria-label="A voyage across the island">
      <div className="relative h-[86svh] min-h-[520px] overflow-hidden text-white">
        <Image src={hotel.heroPhoto} alt={hotel.name} fill priority sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1240px] px-5 pb-12 sm:px-6 md:pb-20">
          <p className="lux-eyebrow !text-white/90">{first.eyebrow}</p>
          <span aria-hidden className="lux-rule mt-4 !bg-white/70" />
          <div className="mt-5 max-w-[760px]">{first.body}</div>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1240px] gap-4 px-4 pt-4 sm:px-6 md:grid-cols-2">
        {rest.map((c, i) => (
          <div key={c.id} className="relative overflow-hidden rounded-[var(--lux-r)] text-white">
            {photos[i + 1] && <Image src={photos[i + 1]!} alt="" fill sizes="(max-width: 768px) 100vw, 620px" className="object-cover" />}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
            <div className="relative flex min-h-[420px] flex-col justify-end p-6 md:p-10 [&_h2]:!text-[38px] md:[&_h2]:!text-[48px]">
              <p className="lux-eyebrow !text-white/90">{c.eyebrow}</p>
              <div className="mt-4">{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
