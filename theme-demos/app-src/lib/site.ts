"use client";
// Site record — what Website Management edits. Prototype: kept in this browser (localStorage).
// Production: HMS backend `site_draft` / `site_published` / `site_versions` (see plan doc, Developer handoff).
import { useCallback, useSyncExternalStore } from "react";
import type { Hotel, MasterTheme } from "./types";
import type { ThemeId } from "./theme";
import { MANIFESTS } from "@/themes/manifest";
import { currentSearch } from "./href";

export type SectionState = { order: string[]; hidden: string[] };
export type SiteDoc = {
  master: MasterTheme;
  palette: ThemeId;
  heading: "sans" | "serif";
  logo: string | null;
  sections: Record<MasterTheme, SectionState>;
  text: Record<string, string>; // "hero.title" → words (EN); "bn:hero.title" → Bangla
  pages: Record<string, { menu: boolean; footer: boolean }>;
  rooms: Record<string, { visible: boolean; featured: boolean }>;
  offers: Record<string, { visible: boolean; featured: boolean }>;
  services: Record<string, { visible: boolean }>;
  hiddenReviews: string[];
  gallery: string[];
  pagePhotos: Record<string, string>; // banner photo per inner page
  info: { about: string; phone: string; whatsapp: string; email: string; address: string; facebook: string; instagram: string };
  booking: { payAtHotel: boolean; bkash: boolean; advance: boolean; advancePercent: number; extras: boolean; promo: boolean; guestAccount: "optional" | "required"; note: string };
  seo: { titleTemplate: string; description: string; shareImage: string; noindex: boolean };
  languages: { bn: boolean; defaultLang: "en" | "bn" };
  /** Paid themes only: how much 3D/motion the site uses (devices that can't, or guests who ask for less motion, get Calm). */
  motion?: "calm" | "lively" | "immersive";
};
export type Version = { id: string; at: string; note: string; doc: SiteDoc };
export type MediaItem = { id: string; src: string; name: string; uploaded: boolean; alt: string };
export type Post = { id: string; title: string; category: string; status: "draft" | "published"; date: string; body: string };
export type Inquiry = { id: string; name: string; phone: string; kind: "Contact" | "Meeting" | "Event" | "Group stay"; message: string; at: string; status: "new" | "replied" | "closed" };
export type Online = { booking: boolean; ordering: boolean; qr: boolean; marketplace: boolean };
export type DomainState = { custom: string; status: "none" | "pending_dns" | "verified" | "live" };

export type SiteRecord = {
  draft: SiteDoc;
  published: SiteDoc | null;
  publishedAt: string | null;
  versions: Version[];
  online: Online;
  domain: DomainState;
  media: MediaItem[];
  posts: Post[];
  inquiries: Inquiry[];
};

const KEY = (slug: string) => `bingi-site-v1-${slug}`;

export function defaultDoc(h: Hotel): SiteDoc {
  const sections = Object.fromEntries(
    (Object.keys(MANIFESTS) as MasterTheme[]).map((m) => [m, { order: MANIFESTS[m].sections.map((s) => s.id), hidden: [] as string[] }]),
  ) as unknown as Record<MasterTheme, SectionState>;
  const pages = Object.fromEntries(MANIFESTS.grand.pages.map((p) => [p.id, { menu: !["policies", "my-trip"].includes(p.id), footer: true }]));
  return {
    master: h.theme.master,
    palette: h.theme.id,
    heading: h.theme.heading,
    logo: null,
    sections,
    text: {},
    pages,
    rooms: Object.fromEntries(h.rooms.map((r) => [r.id, { visible: true, featured: !!r.featured }])),
    offers: Object.fromEntries(h.offers.map((o) => [o.id, { visible: true, featured: false }])),
    services: Object.fromEntries(h.services.map((s) => [s.id, { visible: true }])),
    hiddenReviews: [],
    gallery: h.gallery,
    pagePhotos: Object.fromEntries(Object.entries(h.pagePhotos).filter(([, v]) => !!v)) as Record<string, string>,
    info: { about: h.intro, phone: h.phone, whatsapp: h.whatsapp ?? "", email: h.email, address: h.address, facebook: h.social.facebook ?? "", instagram: h.social.instagram ?? "" },
    booking: {
      payAtHotel: h.payments.some((p) => p.kind === "pay-at-property"),
      bkash: h.payments.some((p) => p.kind === "mfs-manual"),
      advance: h.payments.some((p) => p.kind === "advance"),
      advancePercent: (h.payments.find((p) => p.kind === "advance") as { percent?: number } | undefined)?.percent ?? 30,
      extras: true,
      promo: h.promoCodes.length > 0,
      guestAccount: "optional",
      note: "We have received your booking. The hotel will confirm by SMS.",
    },
    seo: { titleTemplate: `{{page}} — ${h.name}`, description: h.intro, shareImage: h.heroPhoto, noindex: false },
    languages: { bn: true, defaultLang: "en" },
  };
}

function defaultRecord(h: Hotel): SiteRecord {
  const doc = defaultDoc(h);
  const photos = [h.heroPhoto, ...h.gallery, ...h.rooms.flatMap((r) => r.photos), ...h.services.flatMap((s) => (s.photo ? [s.photo] : []))];
  const uniq = [...new Set(photos)];
  return {
    draft: doc,
    published: structuredClone(doc),
    publishedAt: "2026-11-09T10:00:00",
    versions: [{ id: "v1", at: "2026-11-09T10:00:00", note: "First publish", doc: structuredClone(doc) }],
    online: { booking: true, ordering: h.plan === "ultra" || h.plan === "enterprise", qr: false, marketplace: true },
    domain: { custom: "", status: "none" },
    media: uniq.map((src, i) => ({ id: `m${i}`, src, name: src.split("/").pop() ?? src, uploaded: false, alt: "" })),
    posts: [],
    inquiries: [
      { id: "q1", name: "Shamima Akter", phone: "01711-000111", kind: "Group stay", message: "We are 12 people for 2 nights in December. Do you have a group rate?", at: "2026-11-09T09:12:00", status: "new" },
      { id: "q2", name: "Rashed Karim", phone: "01819-000222", kind: "Meeting", message: "Need a room for 20 people, half day, next Thursday.", at: "2026-11-08T16:40:00", status: "replied" },
      { id: "q3", name: "Nadia Islam", phone: "01911-000333", kind: "Contact", message: "Is airport pickup available at night?", at: "2026-11-07T21:05:00", status: "closed" },
    ],
  };
}

// ---------- store ----------
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; rec: SiteRecord | null }>();
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => e.key?.startsWith("bingi-site-v1-") && (cache.clear(), l());
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}
function readRaw(slug: string): string | null {
  try {
    return localStorage.getItem(KEY(slug));
  } catch {
    return null;
  }
}
function readRecord(slug: string): SiteRecord | null {
  const raw = readRaw(slug);
  const hit = cache.get(slug);
  if (hit && hit.raw === raw) return hit.rec;
  let rec: SiteRecord | null = null;
  try {
    rec = raw ? (JSON.parse(raw) as SiteRecord) : null;
  } catch {
    rec = null;
  }
  if (rec) for (const d of [rec.draft, rec.published]) if (d) fillSections(d);
  cache.set(slug, { raw, rec });
  return rec;
}
function writeRecord(slug: string, rec: SiteRecord) {
  const raw = JSON.stringify(rec);
  try {
    localStorage.setItem(KEY(slug), raw);
  } catch {
    // storage full (large uploads) — keep in memory for this session
  }
  cache.set(slug, { raw, rec });
  listeners.forEach((l) => l());
}

/** Admin side: full record with actions. */
export function useSite(h: Hotel) {
  const stored = useSyncExternalStore(subscribe, () => readRecord(h.slug), () => null);
  const rec = stored ?? defaultRecordCached(h);
  const ready = typeof window !== "undefined";

  const mutate = useCallback(
    (fn: (r: SiteRecord) => void) => {
      const next = structuredClone(readRecord(h.slug) ?? defaultRecordCached(h));
      fn(next);
      writeRecord(h.slug, next);
    },
    [h],
  );
  const edit = useCallback((fn: (d: SiteDoc) => void) => mutate((r) => fn(r.draft)), [mutate]);
  const publish = useCallback(
    (note: string) =>
      mutate((r) => {
        const at = new Date().toISOString();
        r.published = structuredClone(r.draft);
        r.publishedAt = at;
        r.versions.unshift({ id: `v${r.versions.length + 1}`, at, note: note || "Published", doc: structuredClone(r.draft) });
        r.versions = r.versions.slice(0, 20);
      }),
    [mutate],
  );
  const discard = useCallback(() => mutate((r) => r.published && (r.draft = structuredClone(r.published))), [mutate]);
  const restore = useCallback((id: string) => mutate((r) => { const v = r.versions.find((x) => x.id === id); if (v) r.draft = structuredClone(v.doc); }), [mutate]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); }, [h.slug]);

  return { ready, rec, draft: rec.draft, changes: diff(rec.draft, rec.published), edit, mutate, publish, discard, restore, reset };
}

/** Records saved before a theme existed get that theme's default section order. */
function fillSections(d: SiteDoc) {
  for (const m of Object.keys(MANIFESTS) as MasterTheme[]) d.sections[m] ??= { order: MANIFESTS[m].sections.map((s) => s.id), hidden: [] };
}

const defaults = new Map<string, SiteRecord>();
function defaultRecordCached(h: Hotel) {
  if (!defaults.has(h.slug)) defaults.set(h.slug, defaultRecord(h));
  return defaults.get(h.slug)!;
}

/** Public site side: the doc to render — draft inside the admin preview, published on the live site. */
export function useSiteView(slug: string): SiteDoc | null {
  const rec = useSyncExternalStore(subscribe, () => readRecord(slug), () => null);
  const isPreview = useSyncExternalStore(subscribe, () => currentSearch().get("preview") === "draft", () => false);
  if (!rec) return null;
  return isPreview ? rec.draft : rec.published;
}
/** Online On/Off switches as the public site sees them (they apply at once, no publish step). */
export function useOnline(slug: string): Online | null {
  const rec = useSyncExternalStore(subscribe, () => readRecord(slug), () => null);
  return rec?.online ?? null;
}
/** Any embedded view inside the admin (draft preview or theme screenshot) — hides the designer bar. */
export function useIsPreview() {
  return useSyncExternalStore(subscribe, () => currentSearch().has("preview"), () => false);
}

// ---------- changes (draft vs live) ----------
const LABELS: Record<keyof SiteDoc, string> = {
  master: "Theme",
  palette: "Colour",
  heading: "Heading font",
  logo: "Logo",
  sections: "Homepage sections",
  text: "Homepage text",
  pages: "Pages & menu",
  rooms: "Rooms on the website",
  offers: "Offers on the website",
  services: "Services on the website",
  hiddenReviews: "Reviews shown",
  gallery: "Gallery",
  pagePhotos: "Page banners",
  info: "Property info",
  booking: "Booking engine",
  seo: "SEO & sharing",
  languages: "Languages",
  motion: "Motion & 3D",
};
export function diff(a: SiteDoc, b: SiteDoc | null): string[] {
  if (!b) return ["Everything (never published)"];
  return (Object.keys(LABELS) as (keyof SiteDoc)[]).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k])).map((k) => LABELS[k]);
}

/** Text slot value with fallback. */
export function slotText(doc: SiteDoc | null, key: string, fallback: string, lang: "en" | "bn" = "en") {
  if (!doc) return fallback;
  if (lang === "bn" && doc.text[`bn:${key}`]) return doc.text[`bn:${key}`];
  return doc.text[key] || fallback;
}
