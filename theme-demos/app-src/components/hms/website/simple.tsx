"use client";
// The 6 pages of Website Management. Simple first: one job per page, tabs instead of more pages.
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRight, Check, CircleAlert, ExternalLink, Eye, MessageSquare } from "lucide-react";
import { THEMES, themeById } from "@/lib/theme";
import { hrefFor } from "@/lib/href";
import { slotText } from "@/lib/site";
import { MASTER_LIST, PLAN_LABEL, planAllows } from "@/themes/manifest";
import { useWM } from "./WebsiteModule";
import { Badge, Btn, Card, Embedded, PlanLock } from "./ui";
import { PagesPage, SectionsPage } from "./design";
import { MediaPage, OffersPage, ReviewsPage, RoomsPage, ServicesPage } from "./content";
import { BookingPage, DomainPage, LanguagesPage, OnlinePage, PublishPage, SeoPage } from "./settings";
import { InfoPage } from "./content";
import { LicenceNotice, MotionCard, MyThemesTab, StoreTab } from "./store";
import { isPaid } from "@/themes/paid";
import { MANIFESTS } from "@/themes/manifest";
import { currentSearch } from "@/lib/href";
import { useLicences } from "@/lib/licences";

function Title({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h1 className="text-[24px] font-bold tracking-[-0.01em]">{children}</h1>
      {right}
    </div>
  );
}

function Tabs({ tabs }: { tabs: { id: string; label: string; el: ReactNode }[] }) {
  const [t, setT] = useState(tabs[0].id);
  return (
    <>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-hms-line" role="tablist">
        {tabs.map((x) => (
          <button key={x.id} role="tab" aria-selected={t === x.id} onClick={() => setT(x.id)} className={clsx("-mb-px whitespace-nowrap border-b-2 px-3.5 pb-2.5 pt-1 text-[14px] font-medium transition-colors", t === x.id ? "border-hms-coral text-[#c42f2f]" : "border-transparent text-hms-muted hover:text-hms-ink")}>
            {x.label}
          </button>
        ))}
      </div>
      <Embedded.Provider value={true}>{tabs.find((x) => x.id === t)?.el}</Embedded.Provider>
    </>
  );
}

/* ---------- Overview ---------- */
export function OverviewSimple() {
  const { hotel, site, manifest, openPreview, siteUrl } = useWM();
  const d = site.draft;
  const todo = [
    { label: "Add a search description", ok: d.seo.description.length >= 50, href: "seo" },
    { label: "Show at least one room with a photo", ok: hotel.rooms.some((r) => d.rooms[r.id]?.visible !== false && r.photos.length > 0), href: "rooms" },
    { label: "Add phone and address", ok: !!d.info.phone && !!d.info.address, href: "info" },
    { label: "Write the headline in বাংলা", ok: !d.languages.bn || !!d.text["bn:hero.title"], href: "languages" },
  ].filter((x) => !x.ok);
  const newMsgs = site.rec.inquiries.filter((q) => q.status === "new").length;
  return (
    <>
      <Title>Website</Title>
      <LicenceNotice />
      <Card pad={false} className="overflow-hidden">
        <div className="grid md:grid-cols-[320px_1fr]">
          <div className="relative aspect-[16/10] md:aspect-auto"><Image src={`/themes/${manifest.id}.jpg`} alt={`${manifest.name} theme`} fill sizes="320px" className="object-cover object-top" /></div>
          <div className="flex flex-col justify-center gap-3 p-6">
            <div className="flex items-center gap-2">
              <Badge tone="green">● Live</Badge>
              {site.changes.length > 0 && <Badge tone="amber">{site.changes.length} not published</Badge>}
            </div>
            <div>
              <h2 className="text-[22px] font-semibold">{hotel.name}</h2>
              <a href={hrefFor(siteUrl)} target="_blank" rel="noopener" className="mt-0.5 inline-flex items-center gap-1 text-[14px] text-hms-blue hover:underline">bingi.app{siteUrl} <ExternalLink className="size-3.5" /></a>
            </div>
            <p className="text-[14px] text-hms-muted">{manifest.name} theme · {themeById(d.palette).name}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/hms/website/homepage" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-hms-coral px-4 text-[14px] font-medium text-white">Edit homepage <ArrowRight className="size-4" /></Link>
              <Btn variant="outline" onClick={() => openPreview()}><Eye className="size-4" /> Preview</Btn>
            </div>
          </div>
        </div>
      </Card>

      <Tiles />

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card title={todo.length ? `${todo.length} thing${todo.length > 1 ? "s" : ""} to finish` : "Everything is ready"}>
          {todo.length ? (
            <ul className="-my-1">
              {todo.map((x) => (
                <li key={x.label}><Link href={`/hms/website/${x.href}`} className="flex items-center gap-2.5 rounded-lg py-2 text-[14px] hover:text-hms-coral"><CircleAlert className="size-[18px] text-hms-amber" /> <span className="flex-1">{x.label}</span><ArrowRight className="size-4 text-hms-muted" /></Link></li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-[14px] text-hms-green"><Check className="size-4" /> Your website has everything it needs.</p>
          )}
        </Card>
        <Card title="Inquiries">
          <Link href="/hms/website/inquiries" className="flex items-center gap-3 text-[14px] hover:text-hms-coral">
            <span className="grid size-10 place-items-center rounded-xl bg-hms-coral-soft text-hms-coral"><MessageSquare className="size-5" /></span>
            <span className="flex-1">{newMsgs ? <><b>{newMsgs} new</b> inquir{newMsgs > 1 ? "ies" : "y"}</> : "No new inquiries"}</span>
            <ArrowRight className="size-4 text-hms-muted" />
          </Link>
        </Card>
      </div>
    </>
  );
}

function Tiles() {
  const { hotel, site, manifest } = useWM();
  const d = site.draft;
  const st = d.sections[manifest.id];
  const rooms = hotel.rooms.filter((r) => d.rooms[r.id]?.visible !== false).length;
  const offers = hotel.offers.filter((o) => d.offers[o.id]?.visible !== false && (o.kind === "discount" || hotel.flags.packages)).length;
  const reviews = hotel.reviews.length - d.hiddenReviews.length;
  const pay = [d.booking.payAtHotel && "Pay on arrival", d.booking.bkash && "bKash", d.booking.advance && `${d.booking.advancePercent}% advance`].filter(Boolean).join(" · ");
  const tiles = [
    { href: "design", label: "Theme & Style", value: `${manifest.name} · ${themeById(d.palette).name}` },
    { href: "homepage", label: "Homepage", value: `${st.order.length - st.hidden.length} sections shown` },
    { href: "rooms", label: "Rooms", value: `${rooms} of ${hotel.rooms.length} shown` },
    { href: "offers", label: "Offers", value: offers ? `${offers} live` : "None" },
    { href: "reviews", label: "Reviews", value: `${reviews} shown` },
    { href: "booking", label: "Booking", value: pay || "No payment method" },
    { href: "domain", label: "Domain", value: site.rec.domain.custom || "bingi.app address" },
    { href: "online", label: "Online", value: site.rec.online.booking ? "Taking bookings" : "Bookings paused" },
  ];
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <Link key={t.href} href={`/hms/website/${t.href}`} className="group rounded-2xl border border-hms-line bg-white px-4 py-3.5 transition-shadow hover:shadow-[0_6px_20px_-12px_rgb(0_0_0/0.25)]">
          <span className="flex items-center justify-between text-[13px] text-hms-muted">{t.label}<ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" /></span>
          <span className="mt-1 block truncate text-[15px] font-semibold">{t.value}</span>
        </Link>
      ))}
    </div>
  );
}

/* ---------- Design: theme, colour, font ---------- */
// Re-read ?tab= on back/forward, hash routes (preview build) and same-page links (they fire "bingi:url").
const subUrl = (f: () => void) => { const ev = ["popstate", "hashchange", "bingi:url"]; ev.forEach((e) => window.addEventListener(e, f)); return () => ev.forEach((e) => window.removeEventListener(e, f)); };
type DesignTab = "included" | "store" | "mine";
export function DesignSimple() {
  const { hotel, site, openPreview } = useWM();
  const d = site.draft;
  const live = site.rec.published?.master;
  const lic = useLicences(hotel.slug);
  const q = useSyncExternalStore(subUrl, () => currentSearch().get("tab"), () => null);
  const [pick, setPick] = useState<{ q: string | null; t: DesignTab } | null>(null);
  const tab: DesignTab = pick && pick.q === q ? pick.t : q === "store" || q === "mine" ? q : "included";
  const owned = lic.list.length;
  return (
    <>
      <Title>Theme & Style</Title>
      <LicenceNotice />
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-hms-line" role="tablist" aria-label="Themes">
        {([["included", "Included themes"], ["store", "Theme Store"], ["mine", `My themes${owned ? ` (${owned})` : ""}`]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setPick({ q, t: id })} className={clsx("-mb-px whitespace-nowrap border-b-2 px-3.5 pb-2.5 pt-1 text-[14px] font-medium transition-colors", tab === id ? "border-hms-coral text-[#c42f2f]" : "border-transparent text-hms-muted hover:text-hms-ink")}>{label}</button>
        ))}
      </div>
      {tab === "store" && <StoreTab />}
      {tab === "mine" && <MyThemesTab />}
      {tab === "included" && (
      <div>
        <div className="space-y-6">
          {isPaid(d.master) && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#e3dcf7] bg-[#f6f3ff] px-4 py-3 text-[14px]">
              <span className="flex-1">Your draft uses <b>{MANIFESTS[d.master].name}</b>, a paid theme. Pick an included theme below to switch back.</span>
              <button onClick={() => setPick({ q, t: "mine" })} className="font-semibold text-[#5b3fb5]">My themes</button>
            </div>
          )}
          <section>
            <h2 className="mb-3 text-[15px] font-semibold">Theme</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {MASTER_LIST.map((m) => {
                const allowed = planAllows(hotel.plan, m.minPlan);
                const on = d.master === m.id;
                return (
                  <div key={m.id} className={clsx("overflow-hidden rounded-2xl border bg-white transition-shadow", on ? "border-hms-coral ring-4 ring-hms-coral/10" : "border-hms-line hover:shadow-[0_8px_24px_-14px_rgb(0_0_0/0.25)]")}>
                    <button
                      disabled={!allowed}
                      aria-pressed={on}
                      onClick={() => site.edit((x) => { x.master = m.id; })}
                      className={clsx("block w-full text-left", !allowed && "cursor-not-allowed")}
                    >
                      <span className="relative block aspect-[16/10] bg-hms-hover">
                        <Image src={`/themes/${m.id}.jpg`} alt="" fill sizes="300px" className={clsx("object-cover object-top", !allowed && "opacity-50 grayscale")} />
                        {on && <span className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-hms-coral text-white"><Check className="size-4" strokeWidth={3} /></span>}
                        {live === m.id && <span className="absolute left-2.5 top-2.5"><Badge tone="green">Live</Badge></span>}
                      </span>
                      <span className="flex items-center justify-between gap-2 px-4 py-3">
                        <span className="min-w-0">
                          <span className="block text-[15px] font-semibold">{m.name}</span>
                          <span className="block truncate text-[13px] text-hms-muted">{m.tagline}</span>
                        </span>
                        {!allowed && <PlanLock plan={PLAN_LABEL[m.minPlan]} />}
                      </span>
                    </button>
                    {on && (
                      <div className="flex gap-2 border-t border-hms-line px-3 py-2.5">
                        <Btn variant="outline" className="h-8 flex-1 px-3 text-[13px]" onClick={() => openPreview()}><Eye className="size-4" /> Preview & edit</Btn>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[12.5px] text-hms-muted">Click a theme to put it in your draft, then open Preview. In Preview, tap Edit to change any heading or text right on the page.</p>
          </section>
          <section>
            <h2 className="mb-3 text-[15px] font-semibold">Colour</h2>
            <div className="flex flex-wrap gap-3">
              {THEMES.map((t) => (
                <button key={t.id} title={t.name} aria-label={t.name} aria-pressed={d.palette === t.id} onClick={() => site.edit((x) => { x.palette = t.id; })} className={clsx("grid size-10 place-items-center rounded-full transition-transform hover:scale-105", d.palette === t.id && "ring-2 ring-hms-ink ring-offset-2")} style={{ background: t.brand }}>
                  {d.palette === t.id && <Check className="size-4 text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-[15px] font-semibold">Heading font</h2>
            <div className="grid max-w-[420px] grid-cols-2 gap-3">
              {(["sans", "serif"] as const).map((h) => (
                <button key={h} onClick={() => site.edit((x) => { x.heading = h; })} className={clsx("rounded-xl border px-4 py-3 text-left", d.heading === h ? "border-hms-coral bg-white ring-4 ring-hms-coral/10" : "border-hms-line bg-white hover:bg-hms-hover")}>
                  <span className={clsx("block text-[22px] leading-tight", h === "serif" ? "font-[Fraunces_Variable,serif]" : "font-[Plus_Jakarta_Sans_Variable,sans-serif] font-bold")}>Aa</span>
                  <span className="text-[13px] text-hms-muted">{h === "sans" ? "Modern" : "Classic"}</span>
                </button>
              ))}
            </div>
          </section>
          <MotionCard />
        </div>
      </div>
      )}
    </>
  );
}

/* ---------- Homepage: sections + menu ---------- */
export function HomepageSimple() {
  return (
    <>
      <Title>Homepage</Title>
      <Tabs tabs={[{ id: "sections", label: "Sections", el: <SectionsPage /> }, { id: "menu", label: "Menu", el: <PagesPage /> }]} />
    </>
  );
}

/* ---------- Content: what the site shows from HMS ---------- */
export function ContentSimple() {
  return (
    <>
      <Title>Content</Title>
      <Tabs
        tabs={[
          { id: "rooms", label: "Rooms", el: <RoomsPage /> },
          { id: "services", label: "Services", el: <ServicesPage /> },
          { id: "offers", label: "Offers", el: <OffersPage /> },
          { id: "reviews", label: "Reviews & gallery", el: <ReviewsPage /> },
          { id: "photos", label: "Photos", el: <MediaPage /> },
        ]}
      />
    </>
  );
}

/* ---------- Settings ---------- */
export function SettingsSimple() {
  return (
    <>
      <Title>Settings</Title>
      <Tabs
        tabs={[
          { id: "booking", label: "Booking", el: <BookingPage /> },
          { id: "contact", label: "Contact", el: <InfoPage /> },
          { id: "seo", label: "Google & sharing", el: <SeoPage /> },
          { id: "domain", label: "Domain", el: <DomainPage /> },
          { id: "language", label: "Language", el: <LanguagesPage /> },
          { id: "channels", label: "Online on/off", el: <OnlinePage /> },
        ]}
      />
    </>
  );
}

export function PublishSimple() {
  return <PublishPage />;
}

export { slotText };
