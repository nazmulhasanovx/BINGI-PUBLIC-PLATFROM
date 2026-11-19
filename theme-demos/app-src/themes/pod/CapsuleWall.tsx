"use client";
// POD capsule wall (FX4): drawn from the property's real setup (HMS → Rooms → Capsule/Pod units; each pod is one whole unit).
// It is an illustration of pod types and counts — guests book a pod type; the exact pod is assigned at check-in.
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { nodePath, useRooms } from "@/lib/rooms/store";
import { Tilt } from "@/fx/effects";
import { useFx } from "@/fx/fx";
import { T } from "@/lib/i18n";

const GLOW = ["#22d3ee", "#c084fc", "#f472b6", "#fbbf24"];

export function CapsuleWall({ hotel }: { hotel: Hotel }) {
  const { st } = useRooms(hotel);
  const fx = useFx();
  // A "bay" = one location (e.g. a pod room) holding published Capsule/Pod units.
  const bays = useMemo(() => {
    const pods = st.units.filter((u) => u.preset === "capsule" && u.status === "published").sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    const by = new Map<string, typeof pods>();
    pods.forEach((u) => by.set(`${u.node}|${u.category}`, [...(by.get(`${u.node}|${u.category}`) ?? []), u]));
    return [...by.entries()].map(([key, units]) => ({ id: key, node: units[0].node, category: units[0].category, units }));
  }, [st.units]);
  const cats = useMemo(() => [...new Set(bays.map((b) => b.category))].map((id, i) => {
    const c = st.categories.find((x) => x.id === id);
    const room = hotel.rooms.find((r) => `cat-${r.id}` === id);
    return { id, name: c?.name ?? "Pods", price: c?.baseRate ?? room?.fromPrice ?? 0, room, glow: GLOW[i % GLOW.length], pods: bays.filter((b) => b.category === id).reduce((n, b) => n + b.units.length, 0) };
  }), [bays, st.categories, hotel.rooms]);
  const [sel, setSel] = useState<string | null>(null);
  if (!bays.length) return null;
  const selected = cats.find((c) => c.id === (sel ?? cats[0].id))!;
  const total = cats.reduce((n, c) => n + c.pods, 0);
  const anim = fx.level !== "calm";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-10">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Pod types">
          {cats.map((c) => (
            <button key={c.id} onClick={() => setSel(c.id)} aria-pressed={selected.id === c.id}
              className={clsx("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[14px] font-medium transition-colors", selected.id === c.id ? "border-white bg-white text-[#0b0a1a]" : "border-white/25 text-white hover:border-white/60")}>
              <span className="size-2.5 rounded-full" style={{ background: c.glow, boxShadow: `0 0 10px ${c.glow}` }} />{c.name} · {c.pods}
            </button>
          ))}
        </div>
        <Tilt max={4} glare={false} className="rounded-[24px]">
          <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm md:p-6">
            {bays.map((b) => {
              const c = cats.find((x) => x.id === b.category)!;
              const beds = b.units;
              const cols = Math.ceil(beds.length / 2);
              return (
                <div key={b.id}>
                  <p className="mb-2 text-[12.5px] font-medium uppercase tracking-[0.14em] text-white/70">{nodePath(st.config, b.node)} · {c.name}</p>
                  <div className="-mx-1 overflow-x-auto px-1 pb-1">
                    <div className="grid w-max gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoFlow: "column", gridTemplateRows: "repeat(2, auto)" }}>
                      {beds.map((bed, i) => {
                        const on = selected.id === c.id;
                        return (
                          <button key={bed.code} onClick={() => setSel(c.id)} aria-label={`${c.name}, pod ${bed.code}, ${formatMoney(c.price)} per night`}
                            className={clsx("relative h-9 w-12 rounded-[12px] border transition-all duration-500 md:h-10 md:w-14", on ? "border-transparent" : "border-white/15 opacity-60 hover:opacity-100")}
                            style={on ? { background: `linear-gradient(180deg, ${c.glow}55, ${c.glow}22)`, boxShadow: `0 0 0 1px ${c.glow}, 0 0 18px -4px ${c.glow}`, transitionDelay: anim ? `${(i % 12) * 25}ms` : undefined } : { background: "rgb(255 255 255 / .04)" }}>
                            <span aria-hidden className="absolute inset-x-2 top-1.5 h-1 rounded-full bg-white/50" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Tilt>
        <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-white/70"><Sparkles className="size-3.5" aria-hidden /> <T>Illustration from our pod setup</T> · {total} pods. <T>Your exact pod is assigned at check-in.</T></p>
      </div>

      <aside aria-live="polite" className="overflow-hidden rounded-[24px] bg-white text-ink lg:self-start">
        {selected.room?.photos[0] && <div className="relative aspect-[16/10]"><Image src={selected.room.photos[0]} alt={selected.name} fill sizes="340px" className="object-cover" /></div>}
        <div className="p-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#6d28d9" }}>{selected.pods} pods</p>
          <h3 className="mt-1 text-[22px] font-bold">{selected.name}</h3>
          {selected.room && <p className="mt-1 text-[14.5px] text-muted">{selected.room.short}</p>}
          <p className="mt-3"><b className="text-[24px] tabular-nums">{formatMoney(selected.price)}</b> <span className="text-[13px] text-muted"><T>/ night</T></span></p>
          {selected.room ? (
            <Link href={`/hotel/${hotel.slug}/rooms/${selected.room.slug}`} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-action text-[15px] font-semibold text-on-action"><T>Book a pod</T> <ArrowRight className="size-4" /></Link>
          ) : <p className="mt-4 text-[14px] text-muted"><T>Ask the front desk to book this pod type.</T></p>}
        </div>
      </aside>
    </div>
  );
}
