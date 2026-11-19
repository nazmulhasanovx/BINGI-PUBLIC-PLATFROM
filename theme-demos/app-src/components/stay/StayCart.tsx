"use client";
import { useSiteView } from "@/lib/site";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { quote } from "@/lib/pricing";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useGuestState } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { EmptyStay, PriceLines, StayHeader } from "./StaySummary";
import { PromoField } from "./PromoField";

export function StayCart({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  const base = `/hotel/${hotel.slug}`;
  const { cart, setExtra, clearCart, setPromo, ready } = useGuestState(hotel.slug);
  const stay = cart.stay;
  const doc = useSiteView(hotel.slug);
  if (!ready) return <ListSkeleton rows={2} />;
  if (!stay) return <EmptyStay base={base} />;
  const q = quote(hotel, stay, cart.extras, cart.promo);
  if (!q) return <EmptyStay base={base} />;

  const extras = hotel.services.filter((s) => s.addToStay && doc?.services[s.id]?.visible !== false && !(stay.plan === "breakfast" && s.category === "stay"));
  const qty = (id: string) => cart.extras.find((e) => e.serviceId === id)?.qty ?? 0;
  const go = () => router.push(`${base}/checkout`);

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-32 pt-6 sm:px-6 md:pb-20 md:pt-10">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-action">Step 1 of 2</p>
      <h1 className="mt-1 text-[28px] font-bold md:text-4xl">Your stay</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div className="min-w-0 space-y-6">
          <section className="rounded-3xl border border-line bg-surface p-4 shadow-card md:p-5">
            <div className="flex items-start justify-between gap-3">
              <StayHeader hotel={hotel} stay={stay} />
              <button onClick={clearCart} aria-label="Remove stay" className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink">
                <Trash2 className="size-[18px]" />
              </button>
            </div>
            <Link href={`${base}/rooms/${stay.roomSlug}?in=${stay.checkIn}&out=${stay.checkOut}&adults=${stay.adults}&children=${stay.children}`} className="mt-4 inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-semibold hover:border-brand-ring">
              Change dates or rate
            </Link>
          </section>

          <section>
            <h2 className="text-xl font-bold">Add to your stay <span className="text-base font-medium text-muted">(optional)</span></h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {extras.map((s) => {
                const n = qty(s.id);
                return (
                  <li key={s.id} className={`flex gap-3 rounded-3xl border bg-surface p-3 transition-colors ${n ? "border-action" : "border-line"}`}>
                    {s.photo ? (
                      <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl"><Image src={s.photo} alt="" fill sizes="80px" className="object-cover" /></span>
                    ) : (
                      <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-brand-soft text-2xl">☕</span>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="font-semibold leading-snug">{s.name}</p>
                      <p className="text-[13px] text-muted">{formatMoney(s.price)} {s.unit}</p>
                      <div className="mt-auto flex items-center justify-end gap-2 pt-2">
                        {n === 0 ? (
                          <button onClick={() => setExtra(s.id, 1)} className="h-9 rounded-full bg-brand-soft px-4 text-sm font-semibold text-action hover:bg-brand-soft-2">Add</button>
                        ) : (
                          <>
                            <button aria-label={`Fewer ${s.name}`} onClick={() => setExtra(s.id, n - 1)} className="grid size-9 place-items-center rounded-full border border-line"><Minus className="size-4" /></button>
                            <span className="w-5 text-center font-semibold tabular-nums">{n}</span>
                            <button aria-label={`More ${s.name}`} onClick={() => setExtra(s.id, n + 1)} className="grid size-9 place-items-center rounded-full border border-line"><Plus className="size-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
            <h2 className="mb-3 font-bold">Price details</h2>
            <PriceLines q={q} />
            <PromoField hotel={hotel} nights={q.nights} applied={q.promoCode} entered={cart.promo} onApply={setPromo} />
            <Button size="lg" className="mt-5 hidden w-full md:flex" onClick={go}>Continue</Button>
          </div>
        </aside>
      </div>

      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 pt-3 shadow-[0_-8px_24px_-18px_rgb(22_24_29/0.35)] md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Total · incl. tax</p>
            <p className="text-lg font-bold tabular-nums">{formatMoney(q.total)}</p>
          </div>
          <Button size="lg" onClick={go}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
