"use client";

import { useSiteRules } from "@/lib/site-rules";
import { BookingPausedCard, useBookingPaused } from "@/components/site/BookingPaused";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Lock } from "lucide-react";
import type { Hotel, PaymentMethod } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { quote } from "@/lib/pricing";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { newBookingId, useGuestState, type GuestBooking, type PaymentChoice } from "@/lib/store";
import { PhoneOtp } from "@/components/account/PhoneOtp";
import { Button } from "@/components/ui/Button";
import { EmptyStay, PriceLines, StayHeader } from "./StaySummary";

interface Option {
  id: PaymentChoice;
  title: string;
  sub: string;
  dueNow: (total: number) => number;
  needsRef: boolean;
  mfs?: { provider: string; number: string };
}

/** Only methods the hotel has switched on. Card appears only when the gateway is approved. */
function paymentOptions(methods: PaymentMethod[]): Option[] {
  const mfs = methods.find((m) => m.kind === "mfs-manual") as Extract<PaymentMethod, { kind: "mfs-manual" }> | undefined;
  const out: Option[] = [];
  for (const m of methods) {
    if (m.kind === "pay-at-property")
      out.push({ id: "pay-at-property", title: "Pay on arrival", sub: "Cash or card when you check in.", dueNow: () => 0, needsRef: false });
    if (m.kind === "advance" && mfs)
      out.push({ id: "advance", title: `Pay ${m.percent}% now with ${mfs.provider}`, sub: "Rest on arrival.", dueNow: (t) => Math.round((t * m.percent) / 100), needsRef: true, mfs });
    if (m.kind === "mfs-manual")
      out.push({ id: "mfs-manual", title: `Pay in full with ${m.provider}`, sub: `Send Money to ${m.number}.`, dueNow: (t) => t, needsRef: true, mfs: { provider: m.provider, number: m.number } });
    if (m.kind === "card-online" && m.gatewayApproved)
      out.push({ id: "card-online", title: "Card / online", sub: "Secure online payment.", dueNow: (t) => t, needsRef: false });
  }
  return out;
}

function Section({ n, title, children, done }: { n: number; title: string; children: React.ReactNode; done?: boolean }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-4 shadow-card md:p-6">
      <h2 className="flex items-center gap-3 text-lg font-bold">
        <span className={clsx("grid size-8 place-items-center rounded-full text-sm", done ? "bg-action text-on-action" : "bg-brand-soft text-action")}>
          {done ? <Check className="size-4" strokeWidth={3} /> : n}
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const input = "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[16px] outline-none focus:border-action";

export function Checkout({ hotel }: { hotel: Hotel }) {
  if (useBookingPaused(hotel.slug)) return <BookingPausedCard hotel={hotel} />;
  return <CheckoutForm hotel={hotel} />;
}

function CheckoutForm({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  const base = `/hotel/${hotel.slug}`;
  const { cart, session, addBooking, signIn, ready: loaded } = useGuestState(hotel.slug);
  // signed-in Marketplace guests are prefilled (session loads after hydration)
  const [nameIn, setName] = useState<string | null>(null);
  const [phoneIn, setPhone] = useState<string | null>(null);
  const name = nameIn ?? session?.name ?? "";
  const phone = phoneIn ?? session?.phone ?? "";
  const [email, setEmail] = useState("");
  const [arrival, setArrival] = useState("");
  const [request, setRequest] = useState("");
  const rules = useSiteRules(hotel);
  const options = paymentOptions(rules.methods);
  const [pay, setPay] = useState<PaymentChoice>(options[0]?.id ?? "pay-at-property");
  const [ref, setRef] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);

  const stay = cart.stay;
  const q = stay ? quote(hotel, stay, cart.extras, cart.promo) : null;
  if (!loaded) return <ListSkeleton rows={2} />;
  if (!stay || !q) return <EmptyStay base={base} />;

  const opt = options.find((o) => o.id === pay) ?? options[0];
  const dueNow = opt ? opt.dueNow(q.total) : 0;
  const guestOk = name.trim().length >= 2 && !!phone && (!email || /\S+@\S+\.\S+/.test(email));
  const payOk = !opt?.needsRef || ref.trim().length >= 6;
  const ready = guestOk && payOk && agree;

  const confirm = () => {
    setTried(true);
    if (!ready || !opt) return;
    const b: GuestBooking = {
      id: newBookingId(),
      createdAt: new Date().toISOString(),
      stay,
      extras: cart.extras,
      quote: q,
      guest: { name: name.trim(), phone, email: email || undefined, arrival: arrival || undefined, request: request || undefined },
      payment: { method: opt.id, dueNow, reference: ref || undefined, provider: opt.mfs?.provider },
      bookingStatus: "pending",
      paymentStatus: opt.id === "pay-at-property" ? "pay-at-hotel" : opt.id === "card-online" ? "paid" : "advance-submitted",
    };
    addBooking(b);
    signIn({ phone, name: name.trim() });
    router.push(`${base}/confirmation?id=${b.id}`);
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-32 pt-6 sm:px-6 md:pb-20 md:pt-10">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-action">Step 2 of 2</p>
      <h1 className="mt-1 text-[28px] font-bold md:text-4xl">Confirm and book</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div className="min-w-0 space-y-4">
          <Section n={1} title="Your details" done={guestOk}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold">Full name</span>
                <input className={clsx(input, "mt-1.5", tried && name.trim().length < 2 && "border-red-400")} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="As on your ID" />
              </label>
              <div className="sm:col-span-2">
                {phone ? (
                  <PhoneVerified phone={phone} onChange={() => setPhone("")} />
                ) : (
                  <PhoneOtp onVerified={setPhone} />
                )}
                {tried && !phone && <p className="mt-1.5 text-sm text-red-700">Verify your mobile number — your confirmation is sent here.</p>}
              </div>
              <label className="block">
                <span className="text-sm font-semibold">Email <span className="font-normal text-muted">(optional)</span></span>
                <input className={clsx(input, "mt-1.5")} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Arrival time <span className="font-normal text-muted">(optional)</span></span>
                <select className={clsx(input, "mt-1.5")} value={arrival} onChange={(e) => setArrival(e.target.value)}>
                  <option value="">I don’t know yet</option>
                  {["Before 12 PM", "12 – 2 PM", "2 – 4 PM", "4 – 6 PM", "6 – 9 PM", "After 9 PM"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold">Special request <span className="font-normal text-muted">(optional)</span></span>
                <textarea className="mt-1.5 w-full rounded-2xl border border-line bg-surface p-4 text-[16px] outline-none focus:border-action" rows={3} maxLength={500} value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Anything we should know" />
              </label>
            </div>
          </Section>

          <Section n={2} title="How you’ll pay" done={payOk && !!opt}>
            <div className="space-y-2" role="radiogroup" aria-label="Payment method">
              {options.map((o) => (
                <label key={o.id} className={clsx("flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors", pay === o.id ? "border-action bg-brand-soft" : "border-line hover:border-brand-ring")}>
                  <input type="radio" name="pay" className="sr-only" checked={pay === o.id} onChange={() => { setPay(o.id); setRef(""); }} />
                  <span className={clsx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2", pay === o.id ? "border-action bg-action" : "border-line")}>
                    {pay === o.id && <Check className="size-3 text-on-action" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap justify-between gap-x-3 font-semibold">{o.title}<span className="tabular-nums">{formatMoney(o.dueNow(q.total))} now</span></span>
                    <span className="mt-0.5 block text-[14px] text-muted">{o.sub}</span>
                  </span>
                </label>
              ))}
            </div>
            {opt?.needsRef && (
              <label className="mt-4 block">
                <span className="text-sm font-semibold">{opt.mfs?.provider} transaction ID</span>
                <input className={clsx(input, "mt-1.5 uppercase", tried && !payOk && "border-red-400")} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. 9JH4K2L8PQ" />
                <span className="mt-1.5 block text-[13px] text-muted">Send {formatMoney(dueNow)} to {opt.mfs?.number}. The hotel checks it and confirms your booking.</span>
              </label>
            )}
          </Section>

          <Section n={3} title="Review" done={agree}>
            <p className="text-[15px] text-muted">{rules.cancel}</p>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 accent-[var(--action)]" />
              <span className="text-[15px]">I agree to the <a href={`${base}/policies`} className="font-semibold text-action underline underline-offset-2">booking policies</a>.</span>
            </label>
            {tried && !agree && <p className="mt-1.5 text-sm text-red-700">Please accept the policies to continue.</p>}
            <Button size="lg" className="mt-5 hidden w-full md:flex" onClick={confirm}>
              <Lock className="size-4" /> {dueNow ? `Book · pay ${formatMoney(dueNow)} now` : "Book now · pay on arrival"}
            </Button>
          </Section>
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <details className="group rounded-3xl border border-line bg-surface p-4 shadow-card md:p-5 lg:pointer-events-none" open>
            <summary className="flex cursor-pointer list-none items-center justify-between lg:cursor-default [&::-webkit-details-marker]:hidden">
              <StayHeader hotel={hotel} stay={stay} compact />
            </summary>
            <div className="mt-4 border-t border-line pt-4">
              <PriceLines q={q} dueNow={dueNow} />
            </div>
          </details>
        </aside>
      </div>

      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 pt-3 shadow-[0_-8px_24px_-18px_rgb(22_24_29/0.35)] md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">{dueNow ? "Pay now" : "Pay on arrival"}</p>
            <p className="text-lg font-bold tabular-nums">{formatMoney(dueNow || q.total)}</p>
          </div>
          <Button size="lg" onClick={confirm}>Book now</Button>
        </div>
        {tried && !ready && <p className="pb-1 pt-2 text-center text-[13px] text-red-700">Complete the highlighted steps above.</p>}
      </div>
    </div>
  );
}

function PhoneVerified({ phone, onChange }: { phone: string; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
      <span className="flex items-center gap-2 font-semibold text-emerald-800"><Check className="size-5" /> {phone} verified</span>
      <button type="button" onClick={onChange} className="text-sm font-semibold text-emerald-800 underline">Change</button>
    </div>
  );
}
