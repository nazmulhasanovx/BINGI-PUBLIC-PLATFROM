"use client";
// Theme Store (paid aesthetic/3D themes) inside Website Management › Theme & Style.
// Plan: claude/design/Paid_Themes_Plan_v2.md. Prototype: licences live in this browser and NO money moves.
// Production: HMS billing add-on line + theme_licences; invoice only after payment success.
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, CircleCheck, ExternalLink, Eye, Lock, Monitor, ShoppingBag, Smartphone, Sparkles, X } from "lucide-react";
import { hrefFor } from "@/lib/href";
import { daysBetween, isLive, today, useLicences, type Licence } from "@/lib/licences";
import type { PaidTheme } from "@/lib/types";
import { MANIFESTS, PLAN_LABEL, planAllows } from "@/themes/manifest";
import { MOTION_LABEL, STORE, TIER, TIER_PRICE, fallbackMaster, isPaid, motionLevels, storeTheme, type StoreTheme } from "@/themes/paid";
import { formatMoney } from "@/lib/data";
import { useWM } from "./WebsiteModule";
import { Badge, Btn, Card } from "./ui";
import { FittedDevice, SiteNotReady, siteReady } from "./devices";

const fmtDay = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const priceText = (t: StoreTheme) => (TIER_PRICE[t.tier] === null ? "Price not set yet" : `${formatMoney(TIER_PRICE[t.tier]!)} / month`);

/* ---------------- Notices (Overview + Theme page) ---------------- */
/** Ended or ending licences for the theme that is live. Booking never stops; the site falls back to the included theme. */
export function LicenceNotice() {
  const { hotel, site } = useWM();
  const lic = useLicences(hotel.slug);
  const live = site.rec.published?.master;
  if (!live || !isPaid(live)) return null;
  const name = MANIFESTS[live].name;
  const fb = MANIFESTS[fallbackMaster(hotel)].name;
  const mine = lic.list.filter((l) => l.theme === live).sort((a, b) => (a.renews < b.renews ? 1 : -1))[0];
  if (lic.has(live)) {
    if (mine && mine.status === "cancelled") {
      const d = daysBetween(today(), mine.renews);
      if (d <= 7) return <Banner tone="amber" text={`${name} ends ${d <= 0 ? "today" : `in ${d} day${d === 1 ? "" : "s"}`} (${fmtDay(mine.renews)}). After that your website shows ${fb}. Bookings keep working.`} action={<Link href="/hms/website/design?tab=mine" onClick={() => setTimeout(() => window.dispatchEvent(new Event("bingi:url")), 50)} className="font-semibold underline">Keep {name}</Link>} />;
    }
    return null;
  }
  return <Banner tone="red" text={`Your ${name} licence has ended, so your website now shows ${fb}. Your content and bookings are safe.`} action={<Link href="/hms/website/design?tab=store" onClick={() => setTimeout(() => window.dispatchEvent(new Event("bingi:url")), 50)} className="font-semibold underline">Buy {name} again</Link>} />;
}
function Banner({ tone, text, action }: { tone: "amber" | "red"; text: string; action?: React.ReactNode }) {
  return (
    <div role="status" className={clsx("mb-5 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-[14px]", tone === "red" ? "border-red-200 bg-red-50 text-[#9b1c1c]" : "border-amber-200 bg-amber-50 text-[#7a4a0b]")}>
      <AlertTriangle className="size-4 shrink-0" /><span className="min-w-0 flex-1">{text}</span>{action}
    </div>
  );
}

/* ---------------- Motion (paid themes only) ---------------- */
export function MotionCard() {
  const { site } = useWM();
  const d = site.draft;
  if (!isPaid(d.master)) return null;
  const levels = motionLevels(d.master);
  const cur = d.motion ?? levels[levels.length - 1];
  return (
    <Card title="Motion & 3D" desc="How much movement the website uses. Phones that can't, and guests who ask for less motion, always get Calm.">
      <div role="radiogroup" aria-label="Motion" className="grid gap-2 sm:grid-cols-3">
        {(["calm", "lively", "immersive"] as const).map((m) => {
          const ok = levels.includes(m);
          return (
            <button key={m} role="radio" aria-checked={cur === m} disabled={!ok} onClick={() => site.edit((x) => { x.motion = m; })}
              className={clsx("rounded-xl border p-3 text-left disabled:opacity-45", cur === m ? "border-hms-coral bg-hms-coral-soft/40" : "border-hms-line hover:bg-hms-hover")}>
              <span className="block text-[14px] font-semibold">{MOTION_LABEL[m].name}</span>
              <span className="mt-0.5 block text-[12.5px] text-hms-muted">{ok ? MOTION_LABEL[m].desc : `Not in ${MANIFESTS[d.master].name}`}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------------- Store tab ---------------- */
export function StoreTab() {
  const { hotel, site } = useWM();
  const lic = useLicences(hotel.slug);
  const [filter, setFilter] = useState<"all" | "fit" | "L" | "A" | "B" | "C">("all");
  const [open, setOpen] = useState<string | null>(null);
  const list = STORE.filter((t) => filter === "all" || (filter === "fit" ? t.propertyTypes.includes(hotel.propertyType) : t.tier === filter))
    .sort((a, b) => Number(b.status === "available") - Number(a.status === "available"));
  const t = open ? storeTheme(open) : undefined;
  return (
    <>
      <div className="mb-4 rounded-2xl border border-hms-line bg-white p-4 text-[14px] text-hms-muted">
        <p><b className="text-hms-ink">Paid themes</b> add depth, motion and 3D on top of your included themes. Bought per property as a monthly add-on on your BinGi bill. Prices come from BinGi and are <b className="text-hms-ink">not set yet</b> — this preview does not charge anything.</p>
      </div>
      <div role="group" aria-label="Filter themes" className="mb-4 flex flex-wrap gap-2">
        {([["all", "All"], ["fit", "Fits your property"], ["L", "Luxury Collection · 5★–7★"], ["A", `Tier A · ${TIER.A.name}`], ["B", `Tier B · ${TIER.B.name}`], ["C", `Tier C · ${TIER.C.name}`]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} aria-pressed={filter === v} className={clsx("rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium", filter === v ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{l}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((x) => {
          const owned = x.status === "available" && lic.has(x.id);
          const live = site.rec.published?.master === x.id;
          return (
            <article key={x.id} className="flex flex-col overflow-hidden rounded-2xl border border-hms-line bg-white">
              <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,#1d2433,#3b2f55)]">
                {x.status === "available" ? <Image src={`/themes/${x.id}.jpg`} alt={`${x.name} theme`} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover object-top" /> : <div className="absolute inset-0 grid place-items-center"><span className="text-[30px] font-bold tracking-[0.2em] text-white/80">{x.name}</span></div>}
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <Badge tone="purple">{x.tier === "L" ? "Luxury Collection" : `Tier ${x.tier}`}</Badge>
                  {x.status === "coming-soon" && <Badge tone="gray">Coming soon</Badge>}
                  {owned && <Badge tone="green">{live ? "Live" : "Owned"}</Badge>}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-[17px] font-semibold">{x.name} <span className="font-normal text-hms-muted">· {x.tagline}</span></h3>
                <p className="mt-1 text-[13px] leading-relaxed text-hms-muted">{x.bestFor}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">{x.fx.slice(0, 3).map((f) => <li key={f} className="rounded-md bg-hms-hover px-2 py-0.5 text-[12px]">{f}</li>)}</ul>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <span className="text-[13px] font-medium text-hms-muted">{owned ? "Included in your licence" : priceText(x)}</span>
                  <Btn variant={x.status === "available" ? "primary" : "outline"} className="h-8 px-3.5 text-[13px]" onClick={() => setOpen(x.id)}>{x.status === "available" ? "Details" : "See plan"}</Btn>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {t && <Detail t={t} onClose={() => setOpen(null)} />}
    </>
  );
}

/* ---------------- Detail ---------------- */
function Detail({ t, onClose }: { t: StoreTheme; onClose: () => void }) {
  const { hotel, site } = useWM();
  const lic = useLicences(hotel.slug);
  const [buy, setBuy] = useState(false);
  const [preview, setPreview] = useState(false);
  const owned = t.status === "available" && lic.has(t.id);
  const planOk = planAllows(hotel.plan, t.minPlan);
  const inDraft = site.draft.master === t.id;
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && !buy && !preview && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose, buy, preview]);
  return (
    <div className="hms-app fixed inset-0 z-[80] flex justify-end bg-[#1b2136]/30" onClick={onClose}>
      <aside role="dialog" aria-label={`${t.name} theme`} className="flex h-full w-full max-w-[640px] flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-hms-line px-6 py-4">
          <h2 className="text-[20px] font-semibold">{t.name} <span className="text-[15px] font-normal text-hms-muted">· {t.tagline}</span></h2>
          <button aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><X className="size-5" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-hms-line bg-[linear-gradient(135deg,#1d2433,#3b2f55)]">
            {t.demo ? <div className="pointer-events-none absolute inset-0 overflow-hidden"><iframe title={`${t.name} demo`} tabIndex={-1} src={hrefFor(`/hotel/${t.demo}?preview=shot`)} className="origin-top-left border-0" style={{ width: 1440, height: 900, transform: "scale(0.4)" }} /></div>
              : <div className="absolute inset-0 grid place-items-center text-[34px] font-bold tracking-[0.2em] text-white/80">{t.name}</div>}
          </div>
          <p className="mt-4 text-[15px] leading-relaxed">{t.description}</p>
          <dl className="mt-4 grid grid-cols-[130px_1fr] gap-y-2 text-[14px]">
            <dt className="text-hms-muted">Best for</dt><dd>{t.bestFor}</dd>
            <dt className="text-hms-muted">Tier</dt><dd>{t.tier} · {TIER[t.tier].name} — {TIER[t.tier].desc}</dd>
            <dt className="text-hms-muted">Effects</dt><dd>{t.fx.join(" · ")}</dd>
            <dt className="text-hms-muted">Motion</dt><dd>Up to {MOTION_LABEL[t.maxMotion].name}. Low-end phones and reduced-motion guests get a calm 2D version.</dd>
            <dt className="text-hms-muted">Plan</dt><dd>{t.minPlan ? `${PLAN_LABEL[t.minPlan]} only` : "Any plan"}</dd>
            <dt className="text-hms-muted">Price</dt><dd>{priceText(t)} · monthly add-on, per property</dd>
          </dl>
          <p className="mt-4 rounded-xl bg-hms-hover px-3.5 py-2.5 text-[13px] text-hms-muted">Booking engine, rooms, prices and content stay the same — only the look changes. If the licence ends, your site goes back to an included theme and nothing is lost.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-hms-line px-6 py-4">
          {t.demo && <a href={hrefFor(`/hotel/${t.demo}`)} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1 rounded-full border border-hms-line px-3.5 text-[14px] font-medium hover:bg-hms-hover">Demo site <ExternalLink className="size-3.5" /></a>}
          <span className="ml-auto" />
          {t.status === "coming-soon" ? <Badge tone="gray">Coming soon</Badge> : !planOk ? (
            <span className="flex items-center gap-1.5 text-[14px] text-hms-muted"><Lock className="size-4" /> Needs the {PLAN_LABEL[t.minPlan!]} plan</span>
          ) : (
            <>
              <Btn variant="outline" onClick={() => setPreview(true)}><Eye className="size-4" /> Preview with my hotel</Btn>
              {owned ? (
                <Btn disabled={inDraft} onClick={() => { site.edit((x) => { x.master = t.id as PaidTheme; }); onClose(); }}>{inDraft ? <><Check className="size-4" /> In your draft</> : "Use this theme"}</Btn>
              ) : <Btn onClick={() => setBuy(true)}><ShoppingBag className="size-4" /> Buy & apply</Btn>}
            </>
          )}
        </div>
      </aside>
      {preview && <TryPreview theme={t} onClose={() => setPreview(false)} />}
      {buy && <BuySheet t={t} onClose={() => setBuy(false)} onDone={onClose} />}
    </div>
  );
}

/* ---------------- Preview with my hotel ---------------- */
function TryPreview({ theme, onClose }: { theme: StoreTheme; onClose: () => void }) {
  const { hotel } = useWM();
  const [phone, setPhone] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const w = 1440;
  useEffect(() => { const fit = () => box.current && setScale(Math.min(1, (box.current.clientWidth - 32) / w)); fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit); }, [w, phone]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-[#e9edf2]" role="dialog" aria-label={`Preview of ${theme.name}`} onClick={(e) => e.stopPropagation()}>
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-hms-line bg-white px-4">
        <p className="min-w-0 truncate text-[15px] font-semibold">{theme.name} with {hotel.name}</p>
        <span className="hidden text-[13px] text-hms-muted md:inline">Only you see this · not on your live site</span>
        <div className="mx-auto flex rounded-full border border-hms-line bg-hms-hover p-0.5">
          <button onClick={() => setPhone(false)} aria-pressed={!phone} className={clsx("flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium", !phone ? "bg-white shadow-sm" : "text-hms-muted")}><Monitor className="size-4" /> <span className="hidden md:inline">Desktop</span></button>
          <button onClick={() => setPhone(true)} aria-pressed={phone} className={clsx("flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium", phone ? "bg-white shadow-sm" : "text-hms-muted")}><Smartphone className="size-4" /> <span className="hidden md:inline">iPhone 16 Pro Max</span></button>
        </div>
        <Btn variant="outline" onClick={onClose} className="h-8 px-3"><X className="size-4" /> Close</Btn>
      </div>
      {(() => {
        const frame = siteReady(hotel.slug)
          ? <iframe title={`${theme.name} preview`} src={hrefFor(`/hotel/${hotel.slug}?preview=try&try=${theme.id}`)} className="size-full border-0" />
          : <SiteNotReady name={hotel.name} />;
        return phone ? (
          <div className="min-h-0 flex-1"><FittedDevice kind="iphone">{frame}</FittedDevice></div>
        ) : (
          <div ref={box} className="flex min-h-0 flex-1 justify-center overflow-hidden p-4">
            <div style={{ width: w * scale, height: "100%" }}>
              <div style={{ width: w, height: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: "top left" }} className="overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_-20px_rgb(0_0_0/0.35)]">{frame}</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ---------------- Buy sheet ---------------- */
function BuySheet({ t, onClose, onDone }: { t: StoreTheme; onClose: () => void; onDone: () => void }) {
  const { hotel, site } = useWM();
  const lic = useLicences(hotel.slug);
  const [method, setMethod] = useState<"saved" | "invoice">("saved");
  const [fail, setFail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Licence | null>(null);
  const confirmBuy = () => {
    setError(null);
    const r = lic.buy(t.id as PaidTheme, { fail });
    if (!r.ok) { setError(r.error); return; }
    site.edit((x) => { x.master = t.id as PaidTheme; });
    setDone(r.licence);
  };
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-[#1b2136]/40 p-4" onClick={(e) => { e.stopPropagation(); if (!done) onClose(); }}>
      <div role="dialog" aria-label={`Buy ${t.name}`} className="w-full max-w-[480px] rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="p-6 text-center">
            <CircleCheck className="mx-auto size-10 text-hms-green" />
            <h3 className="mt-3 text-[20px] font-semibold">{t.name} is yours</h3>
            <p className="mt-1.5 text-[14px] text-hms-muted">It is in your draft now. Check it in Preview, then publish to make it live. Renews {fmtDay(done.renews)}.</p>
            <p className="mt-1 text-[12.5px] text-hms-muted">Demo receipt {done.invoice} · no money was charged in this preview</p>
            <div className="mt-5 flex justify-center gap-2">
              <Btn variant="outline" onClick={() => { onClose(); onDone(); }}>Later</Btn>
              <Link href="/hms/website/publish" className="inline-flex h-9 items-center rounded-full bg-hms-coral px-4 text-[14px] font-medium text-white">Go to Publish</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-hms-line px-5 py-4">
              <h3 className="text-[18px] font-semibold">Buy {t.name}</h3>
              <button aria-label="Close" onClick={onClose} className="grid size-8 place-items-center rounded-lg hover:bg-hms-hover"><X className="size-4" /></button>
            </div>
            <div className="space-y-4 px-5 py-4 text-[14px]">
              <dl className="grid grid-cols-[120px_1fr] gap-y-2">
                <dt className="text-hms-muted">Theme</dt><dd className="font-medium">{t.name} · Tier {t.tier}</dd>
                <dt className="text-hms-muted">Property</dt><dd className="font-medium">{hotel.name}</dd>
                <dt className="text-hms-muted">Billing</dt><dd>Monthly add-on on your BinGi bill, per property. Cancel any time; it runs to the end of the paid month.</dd>
                <dt className="text-hms-muted">This month</dt><dd>{TIER_PRICE[t.tier] === null ? <span className="font-medium text-[#9c5f0e]">Price not set by BinGi yet</span> : "Prorated from today"}</dd>
              </dl>
              <div role="radiogroup" aria-label="Payment" className="space-y-2">
                {([["saved", "Payment method on file", "Charged now"], ["invoice", "Add to my next invoice", "Pay with your subscription"]] as const).map(([v, l, s]) => (
                  <button key={v} role="radio" aria-checked={method === v} onClick={() => setMethod(v)} className={clsx("flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left", method === v ? "border-hms-coral bg-hms-coral-soft/40" : "border-hms-line")}>
                    <span className={clsx("grid size-4 place-items-center rounded-full border", method === v ? "border-hms-coral" : "border-hms-line")}>{method === v && <span className="size-2 rounded-full bg-hms-coral" />}</span>
                    <span><span className="block font-medium">{l}</span><span className="block text-[12.5px] text-hms-muted">{s}</span></span>
                  </button>
                ))}
              </div>
              <p className="text-[12.5px] text-hms-muted">Only the owner or someone with Billing permission can buy. In production the invoice is created only after the payment succeeds.</p>
              <label className="flex items-center gap-2 rounded-lg bg-hms-hover px-3 py-2 text-[12.5px] text-hms-muted"><input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} /> Demo: simulate a failed payment</label>
              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13.5px] text-[#9b1c1c]">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-hms-line px-5 py-4">
              <Btn variant="outline" onClick={onClose}>Cancel</Btn>
              <Btn onClick={confirmBuy}><Sparkles className="size-4" /> Confirm purchase</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- My themes ---------------- */
export function MyThemesTab() {
  const { hotel, site } = useWM();
  const lic = useLicences(hotel.slug);
  const list = [...lic.list].sort((a, b) => (a.start < b.start ? 1 : -1));
  if (!list.length) {
    return (
      <Card>
        <div className="py-8 text-center">
          <ShoppingBag className="mx-auto size-8 text-hms-muted" />
          <p className="mt-2 text-[16px] font-semibold">No paid themes yet</p>
          <p className="mt-1 text-[14px] text-hms-muted">Themes you buy for {hotel.name} show here.</p>
          <Link href="/hms/website/design?tab=store" className="mt-4 inline-flex h-9 items-center rounded-full bg-hms-coral px-4 text-[14px] font-medium text-white">Open Theme Store</Link>
        </div>
      </Card>
    );
  }
  return (
    <Card pad={false} title="Your paid themes" desc={`Licences for ${hotel.name}. Only one theme is live at a time.`}>
      {list.map((l) => {
        const m = MANIFESTS[l.theme];
        const liveNow = isLive(l);
        const inDraft = site.draft.master === l.theme;
        return (
          <div key={l.id} className="flex flex-wrap items-center gap-3 border-t border-hms-line px-5 py-4">
            <div className="min-w-[200px] flex-1">
              <p className="text-[15px] font-semibold">{m.name} <span className="font-normal text-hms-muted">· {m.tagline}</span></p>
              <p className="mt-0.5 text-[13px] text-hms-muted">
                {l.status === "active" && liveNow && `Active · renews ${fmtDay(l.renews)}`}
                {l.status === "cancelled" && liveNow && `Cancelled · works until ${fmtDay(l.renews)}`}
                {!liveNow && `Ended ${fmtDay(l.endedAt ?? l.renews)}`}
                {l.invoice && ` · ${l.invoice}`}
              </p>
            </div>
            <Badge tone={liveNow ? (l.status === "active" ? "green" : "amber") : "gray"}>{liveNow ? (l.status === "active" ? "Active" : "Ending") : "Ended"}</Badge>
            {liveNow && <Btn variant="outline" className="h-8 px-3 text-[13px]" disabled={inDraft} onClick={() => site.edit((x) => { x.master = l.theme; })}>{inDraft ? "In draft" : "Use"}</Btn>}
            {liveNow && l.status === "active" && <Btn variant="ghost" className="h-8 px-3 text-[13px]" onClick={() => lic.cancel(l.id)}>Cancel renewal</Btn>}
            {liveNow && l.status === "cancelled" && <Btn variant="outline" className="h-8 px-3 text-[13px]" onClick={() => lic.resume(l.id)}>Keep it</Btn>}
            {liveNow && (
              <details className="relative">
                <summary className="cursor-pointer list-none rounded-full px-2 py-1 text-[12px] text-hms-muted hover:bg-hms-hover [&::-webkit-details-marker]:hidden">Demo</summary>
                <div className="absolute right-0 top-full z-20 mt-1 w-[210px] rounded-xl border border-hms-line bg-white p-1 shadow-lg">
                  <button className="block w-full rounded-lg px-3 py-2 text-left text-[13px] hover:bg-hms-hover" onClick={() => lic.demoEndSoon(l.id)}>Jump to last 5 days</button>
                  <button className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-hms-red hover:bg-hms-hover" onClick={() => lic.demoEnd(l.id)}>End licence now</button>
                </div>
              </details>
            )}
          </div>
        );
      })}
    </Card>
  );
}
