"use client";
import { hrefFor } from "@/lib/href";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { FittedDevice } from "./devices";
import {
  ArrowDown, ArrowRight, ArrowUp, Check, ChevronDown, CircleAlert, CircleCheck, Eye, EyeOff, ExternalLink, Inbox, Lock, Sparkles,
} from "lucide-react";
import { THEMES, themeById } from "@/lib/theme";
import { formatMoney } from "@/lib/data";
import { MASTER_LIST, PLAN_LABEL, planAllows, sectionsFor, type SectionDef } from "@/themes/manifest";
import { presetFor } from "@/lib/presets";
import { slotText } from "@/lib/site";
import { useWM, PreviewFrame, ScaledSite } from "./WebsiteModule";
import { MediaPicker } from "./content";
import { Badge, Btn, Card, Field, Input, PageHead, PlanLock, Row, Segmented, SourceLink, TextArea, Toggle, fmtDate } from "./ui";

const SOURCE_LINK: Record<string, { href: string; label: string }> = {
  rooms: { href: "/hms/rooms", label: "Rooms" },
  reviews: { href: "/hms/guests/reviews", label: "Guest Reviews" },
  offers: { href: "/hms/discounts", label: "Discounts" },
  services: { href: "/hms/other-services", label: "Other Services" },
  facilities: { href: "/hms/website/info", label: "Property Info" },
  nearby: { href: "/hms/website/info", label: "Property Info" },
  host: { href: "/hms/website/info", label: "Property Info" },
  gallery: { href: "/hms/website/reviews", label: "Gallery" },
  outlets: { href: "/hms/meals", label: "Meals" },
  contact: { href: "/hms/website/info", label: "Property Info" },
};

/* ================= Overview ================= */
export function Overview() {
  const { hotel, site, manifest, openPreview, siteUrl } = useWM();
  const d = site.draft;
  const rec = site.rec;
  const checks = useReadiness();
  const done = checks.filter((c) => c.ok).length;
  const newInq = rec.inquiries.filter((i) => i.status === "new");
  return (
    <>
      <PageHead title="Website" desc="Your hotel website and booking engine. Edit here, preview, then publish." />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card pad={false} className="overflow-hidden">
          <div className="grid sm:grid-cols-[240px_1fr]">
            <div className="relative aspect-[4/3] sm:aspect-auto">
              <Image src={hotel.heroPhoto} alt="" fill sizes="240px" className="object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <Badge tone={rec.published ? "green" : "gray"}>{rec.published ? "● Live" : "Not published"}</Badge>
                {site.changes.length > 0 && <Badge tone="amber">{site.changes.length} unpublished</Badge>}
              </div>
              <h2 className="mt-3 text-[20px] font-semibold">{hotel.name}</h2>
              <a href={hrefFor(siteUrl)} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-[14px] text-hms-blue hover:underline">bingi.app{siteUrl} <ExternalLink className="size-3.5" /></a>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <dt className="text-hms-muted">Theme</dt><dd className="font-medium">{manifest.name} · {themeById(d.palette).name}</dd>
                <dt className="text-hms-muted">Plan</dt><dd className="font-medium">{PLAN_LABEL[hotel.plan]}</dd>
                <dt className="text-hms-muted">Last published</dt><dd className="font-medium">{rec.publishedAt ? fmtDate(rec.publishedAt) : "—"}</dd>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Btn variant="outline" onClick={() => openPreview()}><Eye className="size-4" /> Preview</Btn>
                <Link href="/hms/website/sections" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-hms-coral px-4 text-[14px] font-medium text-white">Edit homepage <ArrowRight className="size-4" /></Link>
              </div>
            </div>
          </div>
        </Card>
        <Card title="Ready to go" desc={`${done} of ${checks.length} done`}>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-hms-hover"><div className="h-full rounded-full bg-hms-green" style={{ width: `${(done / checks.length) * 100}%` }} /></div>
          <ul className="space-y-1">
            {checks.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-[14px] hover:bg-hms-hover">
                  {c.ok ? <CircleCheck className="size-[18px] text-hms-green" /> : <CircleAlert className="size-[18px] text-hms-amber" />}
                  <span className={clsx("flex-1", c.ok && "text-hms-muted")}>{c.label}</span>
                  {!c.ok && <span className="text-[12px] font-medium text-hms-blue">Fix</span>}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Card title="Inquiries" action={<Link href="/hms/website/inquiries" className="text-[13px] font-medium text-hms-blue">Open</Link>}>
          {newInq.length ? (
            <ul className="space-y-3">
              {newInq.slice(0, 2).map((q) => (
                <li key={q.id} className="text-[14px]"><span className="font-medium">{q.name}</span> <Badge tone="blue">{q.kind}</Badge><p className="mt-0.5 line-clamp-1 text-[13px] text-hms-muted">{q.message}</p></li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-[14px] text-hms-muted"><Inbox className="size-4" /> No new inquiries</p>
          )}
        </Card>
        <Card title="Online channels" action={<Link href="/hms/website/online" className="text-[13px] font-medium text-hms-blue">Manage</Link>}>
          <ul className="space-y-2 text-[14px]">
            {([["Website booking", rec.online.booking], ["Marketplace", rec.online.marketplace], ["Website ordering", rec.online.ordering], ["QR ordering", rec.online.qr]] as const).map(([l, on]) => (
              <li key={l} className="flex items-center justify-between"><span>{l}</span><Badge tone={on ? "green" : "gray"}>{on ? "On" : "Off"}</Badge></li>
            ))}
          </ul>
        </Card>
        <Card title="Website bookings" desc="Visits and bookings from your website">
          <p className="text-[14px] text-hms-muted">Coming soon. Bookings from the website already appear in <Link href="/hms/bookings" className="font-medium text-hms-blue">Bookings</Link> with source “Website”.</p>
        </Card>
      </div>
    </>
  );
}

function useReadiness() {
  const { hotel, site } = useWM();
  const d = site.draft;
  const visibleRooms = hotel.rooms.filter((r) => d.rooms[r.id]?.visible !== false);
  return [
    { label: "Theme selected", ok: true, href: "/hms/website/theme" },
    { label: "Homepage headline", ok: !!slotText(d, "hero.title", hotel.tagline), href: "/hms/website/sections" },
    { label: "At least one room with a photo on the website", ok: visibleRooms.some((r) => r.photos.length > 0), href: "/hms/website/rooms" },
    { label: "Contact phone and address", ok: !!d.info.phone && !!d.info.address, href: "/hms/website/info" },
    { label: "Search description", ok: d.seo.description.length >= 50, href: "/hms/website/seo" },
    { label: "Bangla headline (optional)", ok: !!d.text["bn:hero.title"] || !d.languages.bn, href: "/hms/website/languages" },
  ];
}

/* ================= Theme & Appearance ================= */
export function ThemePage() {
  const { hotel, site, openPreview } = useWM();
  const d = site.draft;
  const published = site.rec.published?.master;
  return (
    <>
      <PageHead title="Theme & Appearance" desc="Pick a layout, then a colour and a heading font. Changes go to draft until you publish." actions={<Btn variant="outline" onClick={() => openPreview()}><Eye className="size-4" /> Preview</Btn>} />
      <div className="grid gap-4 md:grid-cols-3">
        {MASTER_LIST.map((m) => {
          const allowed = planAllows(hotel.plan, m.minPlan);
          const selected = d.master === m.id;
          const fit = m.bestFor.includes(hotel.propertyType);
          return (
            <article key={m.id} className={clsx("flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow", selected ? "border-hms-coral ring-4 ring-hms-coral/10" : "border-hms-line hover:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.2)]")}>
              <div className="relative aspect-[16/10] bg-hms-hover">
                <ThemeShot slug={m.demo} />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {published === m.id && <Badge tone="green">Live</Badge>}
                  {selected && published !== m.id && <Badge tone="amber">In draft</Badge>}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[17px] font-semibold">{m.name} <span className="font-normal text-hms-muted">· {m.tagline}</span></h3>
                  {!allowed && <PlanLock plan={`${PLAN_LABEL[m.minPlan]}+`} />}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-hms-muted">{m.description}</p>
                {fit && <p className="mt-2 flex items-center gap-1 text-[12px] font-medium text-hms-green"><Sparkles className="size-3.5" /> Suits a {presetFor(hotel.propertyType).place}</p>}
                <div className="mt-auto flex gap-2 pt-4">
                  <a href={hrefFor(`/hotel/${m.demo}`)} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1 rounded-full border border-hms-line px-3.5 text-[13px] font-medium hover:bg-hms-hover">Demo <ExternalLink className="size-3.5" /></a>
                  {allowed ? (
                    <Btn disabled={selected} onClick={() => site.edit((x) => { x.master = m.id; })} className="flex-1 text-[13px]">{selected ? <><Check className="size-4" /> Selected</> : "Use this theme"}</Btn>
                  ) : (
                    <Link href="/hms/settings/billing" className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-hms-line text-[13px] font-medium text-hms-muted hover:bg-hms-hover">Upgrade to {PLAN_LABEL[m.minPlan]}</Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <Card title="Colour" desc="10 colours. Text and buttons stay readable automatically (WCAG AA).">
            <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => site.edit((x) => { x.palette = t.id; })} className="flex flex-col items-center gap-1.5" aria-pressed={d.palette === t.id}>
                  <span className={clsx("grid size-10 place-items-center rounded-full transition-transform hover:scale-105", d.palette === t.id && "ring-2 ring-hms-ink ring-offset-2")} style={{ background: t.brand }}>
                    {d.palette === t.id && <Check className="size-4 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-[11px] text-hms-muted">{t.name}</span>
                </button>
              ))}
            </div>
          </Card>
          <Card title="Heading font">
            <div className="grid grid-cols-2 gap-3">
              {(["sans", "serif"] as const).map((h) => (
                <button key={h} onClick={() => site.edit((x) => { x.heading = h; })} className={clsx("rounded-xl border p-4 text-left", d.heading === h ? "border-hms-coral bg-hms-coral-soft/40" : "border-hms-line hover:bg-hms-hover")}>
                  <span className={clsx("block text-[24px] leading-tight", h === "serif" ? "font-[Fraunces_Variable,serif]" : "font-[Plus_Jakarta_Sans_Variable,sans-serif] font-bold")}>Aa Stay well</span>
                  <span className="mt-1 block text-[13px] text-hms-muted">{h === "sans" ? "Sans · modern" : "Serif · warm, classic"}</span>
                </button>
              ))}
            </div>
          </Card>
          <Card title="Logo" desc="Shown in the header and footer.">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-xl text-white" style={{ background: themeById(d.palette).brand }}>{hotel.logoText.slice(0, 1)}</span>
              <div className="flex-1">
                <p className="text-[14px] font-medium">{hotel.logoText}</p>
                <p className="text-[13px] text-hms-muted">From Settings › Branding</p>
              </div>
              <SourceLink href="/hms/settings" label="Branding" />
            </div>
          </Card>
        </div>
        <PhonePreview />
      </div>
    </>
  );
}

/** Real screenshot of a theme: its demo hotel, scaled down (the site itself, not a drawing). */
function ThemeShot({ slug }: { slug: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <iframe title="" tabIndex={-1} aria-hidden src={hrefFor(`/hotel/${slug}?preview=shot`)} className="origin-top-left border-0" style={{ width: 1440, height: 900, transform: "scale(0.27)" }} loading="lazy" />
    </div>
  );
}

function PhonePreview() {
  const { hotel } = useWM();
  return (
    <div className="lg:sticky lg:top-0 lg:self-start">
      <div className="mb-2 flex items-center justify-between text-[13px]">
        <span className="font-medium">Live preview · phone</span>
        <span className="text-hms-muted">draft</span>
      </div>
      <div className="mx-auto h-[660px] w-full max-w-[340px]">
        <FittedDevice kind="iphone" pad={4}><PreviewFrame slug={hotel.slug} title="Phone preview" name={hotel.name} /></FittedDevice>
      </div>
    </div>
  );
}

/* ================= Content & Sections (homepage builder) ================= */
export function SectionsPage() {
  const { hotel, site, manifest } = useWM();
  const d = site.draft;
  const state = d.sections[manifest.id];
  const defs = sectionsFor(manifest, hotel);
  const ordered = [...state.order, ...defs.map((s) => s.id).filter((id) => !state.order.includes(id))].map((id) => defs.find((s) => s.id === id)!).filter(Boolean);
  const [open, setOpen] = useState<string | null>("hero");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const move = (id: string, dir: -1 | 1) =>
    site.edit((x) => {
      const o = [...ordered.map((s) => s.id)];
      const i = o.indexOf(id), j = i + dir;
      if (j < 1 || j >= o.length) return; // hero stays first
      [o[i], o[j]] = [o[j], o[i]];
      x.sections[manifest.id].order = o;
    });
  const toggle = (id: string) =>
    site.edit((x) => {
      const h = x.sections[manifest.id].hidden;
      x.sections[manifest.id].hidden = h.includes(id) ? h.filter((v) => v !== id) : [...h, id];
    });

  return (
    <>
      <PageHead title="Homepage" desc={<>Sections of the <b className="font-semibold text-hms-ink">{manifest.name}</b> theme.</>} />
      <div className="grid gap-5 xl:grid-cols-[440px_1fr]">
        <div className="space-y-2">
          {ordered.map((s, i) => {
            const hidden = state.hidden.includes(s.id);
            const isOpen = open === s.id;
            return (
              <div key={s.id} className={clsx("rounded-2xl border bg-white", isOpen ? "border-hms-coral/50" : "border-hms-line", (hidden || !s.available) && "bg-hms-nav")}>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className="flex flex-col">
                    <button aria-label="Move up" disabled={s.required || i <= 1} onClick={() => move(s.id, -1)} className="grid size-5 place-items-center rounded text-hms-muted hover:bg-hms-hover disabled:opacity-25"><ArrowUp className="size-3.5" /></button>
                    <button aria-label="Move down" disabled={s.required || i === ordered.length - 1} onClick={() => move(s.id, 1)} className="grid size-5 place-items-center rounded text-hms-muted hover:bg-hms-hover disabled:opacity-25"><ArrowDown className="size-3.5" /></button>
                  </div>
                  <button onClick={() => setOpen(isOpen ? null : s.id)} className="min-w-0 flex-1 text-left">
                    <span className={clsx("block text-[14px] font-semibold", (hidden || !s.available) && "text-hms-muted")}>{s.name}</span>
                  </button>
                  {!s.available ? (
                    <PlanLock plan={s.minPlan && !planAllows(hotel.plan, s.minPlan) ? `${PLAN_LABEL[s.minPlan]}+` : "Not for this property"} />
                  ) : s.required ? (
                    <Badge>Always on</Badge>
                  ) : (
                    <button onClick={() => toggle(s.id)} aria-label={hidden ? "Show section" : "Hide section"} className="grid size-8 place-items-center rounded-lg text-hms-muted hover:bg-hms-hover">
                      {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  )}
                  <ChevronDown className={clsx("size-4 text-hms-muted transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && <SectionEditor s={s} />}
              </div>
            );
          })}
        </div>
        <div className="xl:sticky xl:top-0 xl:self-start">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-medium text-hms-muted">Preview</span>
            <Segmented value={device} onChange={setDevice} options={[{ v: "desktop", label: "Desktop" }, { v: "phone", label: "Phone" }]} />
          </div>
          {device === "desktop" ? (
            <ScaledSite slug={hotel.slug} section={open ?? undefined} width={1440} height={620} title="Homepage preview" />
          ) : (
            <div className="mx-auto h-[620px] w-full max-w-[320px]">
              <FittedDevice kind="iphone" pad={4}><PreviewFrame slug={hotel.slug} section={open ?? undefined} title="Homepage preview phone" name={hotel.name} /></FittedDevice>
            </div>
          )}
          
        </div>
      </div>
    </>
  );
}

function SectionEditor({ s }: { s: SectionDef & { available: boolean } }) {
  const { hotel, site } = useWM();
  const d = site.draft;
  const [lang, setLang] = useState<"en" | "bn">("en");
  const src = s.source ? SOURCE_LINK[s.source] : null;
  return (
    <div className="space-y-4 border-t border-hms-line px-4 py-4">
      {s.fields?.length ? (
        <>
          {d.languages.bn && <Segmented value={lang} onChange={setLang} options={[{ v: "en", label: "English" }, { v: "bn", label: "বাংলা" }]} />}
          {s.fields.map((f) => {
            const key = `${lang === "bn" ? "bn:" : ""}${s.id}.${f.key}`;
            const fallback = f.fallback?.(hotel) ?? "";
            const value = d.text[key] ?? "";
            const set = (v: string) => site.edit((x) => { if (v) x.text[key] = v; else delete x.text[key]; });
            const shown = value || (lang === "en" ? fallback : "");
            return (
              <Field key={key} label={f.label} hint={undefined} count={f.max ? `${shown.length}/${f.max}` : undefined}>
                {f.type === "textarea" ? (
                  <TextArea value={value} placeholder={lang === "en" ? fallback : "বাংলায় লিখুন"} maxLength={f.max} onChange={(e) => set(e.target.value)} />
                ) : (
                  <Input value={value} placeholder={lang === "en" ? fallback : "বাংলায় লিখুন"} maxLength={f.max} onChange={(e) => set(e.target.value)} />
                )}
              </Field>
            );
          })}
        </>
      ) : null}
      {src && (
        <p className="text-[13px] text-hms-muted">From <SourceLink href={src.href} label={src.label} /></p>
      )}
      {!s.fields?.length && !src && <p className="text-[13px] text-hms-muted">Nothing to set.</p>}
      {!s.available && <p className="flex items-center gap-1.5 text-[13px] text-hms-muted"><Lock className="size-3.5" /> {s.propertyTypes ? `Only for ${s.propertyTypes.join(" / ")} properties.` : `Available on ${PLAN_LABEL[s.minPlan!]} and above.`}</p>}
    </div>
  );
}

/* ================= Pages & Menu ================= */
export function PagesPage() {
  const { hotel, site, manifest } = useWM();
  const d = site.draft;
  const [open, setOpen] = useState<string | null>(null);
  const has = { dining: hotel.outlets.length > 0, events: hotel.flags.events, experiences: hotel.services.some((s) => s.photo), offers: hotel.offers.length > 0 };
  const rows = manifest.pages.map((p) => ({ ...p, planOk: planAllows(hotel.plan, p.minPlan), dataOk: !p.needs || has[p.needs] }));
  const menu = rows.filter((p) => p.planOk && p.dataOk && d.pages[p.id]?.menu !== false && p.id !== "my-trip" && p.id !== "policies");
  const setMenu = (id: string, v: boolean) => site.edit((x) => { x.pages[id] = { ...(x.pages[id] ?? { menu: true, footer: true }), menu: v }; });
  return (
    <>
      <PageHead title="Pages & Menu" desc="Every page of your site, its banner and title." />
      <div className="mb-6 flex flex-wrap items-center gap-1 rounded-2xl border border-hms-line bg-white px-4 py-3">
        <span className="mr-4 font-semibold">{hotel.logoText}</span>
        {menu.map((p) => <span key={p.id} className="rounded-full px-3 py-1 text-[14px] text-hms-muted">{p.name}</span>)}
        <span className="ml-auto rounded-full bg-hms-coral px-3 py-1 text-[13px] font-medium text-white">Book now</span>
      </div>
      <Card pad={false}>
        {rows.map((p) => {
          const off = !p.planOk || !p.dataOk;
          const editable = p.id !== "home" && p.id !== "my-trip" && !off;
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="border-b border-hms-line last:border-b-0">
              <div className="flex items-center gap-4 px-5 py-3">
                <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-hms-hover">
                  {(d.pagePhotos[p.id] || (p.id === "home" && hotel.heroPhoto)) && <Image src={d.pagePhotos[p.id] || hotel.heroPhoto} alt="" fill sizes="44px" className="object-cover" unoptimized={(d.pagePhotos[p.id] ?? "").startsWith("data:")} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={clsx("text-[15px] font-medium", off && "text-hms-muted")}>{slotText(d, `page.${p.id}.title`, p.name)}</p>
                  <p className="text-[12px] text-hms-muted">{!p.planOk ? `${PLAN_LABEL[p.minPlan!]} plan` : !p.dataOk ? "No content yet" : p.id === "home" ? "Edit in Homepage" : `/${p.id === "home" ? "" : p.id}`}</p>
                </div>
                {!p.planOk && <PlanLock plan={PLAN_LABEL[p.minPlan!]} />}
                {p.id !== "home" && p.id !== "my-trip" && p.id !== "policies" && (
                  <label className="flex items-center gap-2 text-[13px] text-hms-muted">In menu <Toggle label={`${p.name} in menu`} on={!off && d.pages[p.id]?.menu !== false} disabled={off} onChange={(v) => setMenu(p.id, v)} /></label>
                )}
                {editable ? (
                  <Btn variant="ghost" className="h-8 px-3 text-[13px]" onClick={() => setOpen(isOpen ? null : p.id)}>{isOpen ? "Done" : "Edit"}</Btn>
                ) : p.id === "home" ? (
                  <Link href="/hms/website/homepage" className="px-3 text-[13px] font-medium text-hms-blue">Edit</Link>
                ) : <span className="w-[52px]" />}
              </div>
              {isOpen && <PageEditor id={p.id} name={p.name} />}
            </div>
          );
        })}
      </Card>
    </>
  );
}

function PageEditor({ id, name }: { id: string; name: string }) {
  const { site } = useWM();
  const d = site.draft;
  const [pick, setPick] = useState(false);
  const text = (k: string, v: string) => site.edit((x) => { if (v) x.text[k] = v; else delete x.text[k]; });
  const photo = d.pagePhotos[id];
  return (
    <div className="grid gap-5 border-t border-hms-line bg-hms-nav px-5 py-5 md:grid-cols-[220px_1fr]">
      <div>
        <p className="mb-1.5 text-[14px] font-medium">Banner</p>
        <button onClick={() => setPick(true)} className="relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-dashed border-hms-line bg-white">
          {photo ? <Image src={photo} alt="" fill sizes="220px" className="object-cover" unoptimized={photo.startsWith("data:")} /> : <span className="grid h-full place-items-center text-[13px] text-hms-muted">Choose photo</span>}
        </button>
        {photo && <button onClick={() => site.edit((x) => { delete x.pagePhotos[id]; })} className="mt-1.5 text-[12px] text-hms-muted hover:text-hms-red">Remove</button>}
      </div>
      <div className="space-y-4">
        <Field label="Title"><Input value={d.text[`page.${id}.title`] ?? ""} placeholder={name} maxLength={50} onChange={(e) => text(`page.${id}.title`, e.target.value)} /></Field>
        <Field label="Short intro (optional)"><Input value={d.text[`page.${id}.intro`] ?? ""} placeholder="One line under the title" maxLength={120} onChange={(e) => text(`page.${id}.intro`, e.target.value)} /></Field>
      </div>
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(src) => site.edit((x) => { x.pagePhotos[id] = src; })} />}
    </div>
  );
}

export const money = formatMoney;
export { Row };
