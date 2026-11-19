"use client";
import Image from "next/image";
import clsx from "clsx";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BedDouble, BookOpenText, ImagePlus, Images, Lock, MapPin, Plus, Star, Trash2, Upload, X } from "lucide-react";
import { formatMoney } from "@/lib/data";
import { PLAN_LABEL, planAllows } from "@/themes/manifest";
import type { MediaItem } from "@/lib/site";
import { useWM } from "./WebsiteModule";
import { Badge, Btn, Card, Empty, Field, Input, NotWired, PageHead, PlanLock, Segmented, SourceLink, TextArea, Toggle } from "./ui";

/* ================= Media Library ================= */
async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new window.Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const s = Math.min(1, 1600 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.8);
}

export function useUsage() {
  const { hotel, site } = useWM();
  const d = site.draft;
  return (src: string) => {
    const u: string[] = [];
    if (src === hotel.heroPhoto) u.push("Hero");
    if (d.gallery.includes(src)) u.push("Gallery");
    hotel.rooms.forEach((r) => r.photos.includes(src) && u.push(r.name));
    hotel.services.forEach((s) => s.photo === src && u.push(s.name));
    if (d.seo.shareImage === src) u.push("Share image");
    return u;
  };
}

export function MediaPage() {
  const { site } = useWM();
  const [filter, setFilter] = useState<"all" | "uploaded" | "hms">("all");
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const usage = useUsage();
  const items = site.rec.media.filter((m) => filter === "all" || (filter === "uploaded" ? m.uploaded : !m.uploaded));
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const added: MediaItem[] = [];
    for (const f of Array.from(files).slice(0, 10)) {
      if (!f.type.startsWith("image/")) continue;
      added.push({ id: `u${Date.now()}${added.length}`, src: await downscale(f), name: f.name, uploaded: true, alt: "" });
    }
    site.mutate((r) => { r.media = [...added, ...r.media]; });
    setBusy(false);
  };
  return (
    <>
      <PageHead title="Photos" desc="Upload once, use anywhere on the site." actions={<><input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} /><Btn onClick={() => input.current?.click()} disabled={busy}><Upload className="size-4" /> {busy ? "Uploading…" : "Upload photos"}</Btn></>} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <Segmented value={filter} onChange={setFilter} options={[{ v: "all", label: `All (${site.rec.media.length})` }, { v: "hms", label: "From HMS" }, { v: "uploaded", label: "Uploaded" }]} />
        
      </div>
      {items.length === 0 ? (
        <Card><Empty icon={<Images className="size-6" />} title="No uploads yet" desc="Upload photos of your property, food or area. They become available for the hero, gallery, offers and sharing." action={<Btn onClick={() => input.current?.click()}><Upload className="size-4" /> Upload photos</Btn>} /></Card>
      ) : (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        >
          {items.map((m) => {
            const u = usage(m.src);
            return (
              <button key={m.id} onClick={() => setSel(m)} className="group overflow-hidden rounded-xl border border-hms-line bg-white text-left">
                <span className="relative block aspect-[4/3]">
                  <Image src={m.src} alt={m.alt} fill sizes="240px" className="object-cover transition-transform group-hover:scale-[1.03]" unoptimized={m.uploaded} />
                </span>
                <span className="block px-2.5 py-2">
                  <span className="block truncate text-[12px] font-medium">{m.name}</span>
                  <span className="block truncate text-[11px] text-hms-muted">{u.length ? u.join(", ") : "Not used"}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      {sel && <MediaDrawer item={sel} onClose={() => setSel(null)} />}
    </>
  );
}

function MediaDrawer({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const { site } = useWM();
  const usage = useUsage()(item.src);
  const live = site.rec.media.find((m) => m.id === item.id) ?? item;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/20" onClick={onClose}>
      <aside className="h-full w-full max-w-[420px] overflow-y-auto bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-[17px] font-semibold">Photo</h2><button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><X className="size-5" /></button></div>
        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl"><Image src={live.src} alt={live.alt} fill sizes="420px" className="object-cover" unoptimized={live.uploaded} /></div>
        <p className="mt-3 truncate text-[13px] text-hms-muted">{live.name} · {live.uploaded ? "Uploaded" : "From HMS"}</p>
        <div className="mt-4"><Field label="Describe the photo"><Input value={live.alt} placeholder="e.g. Sea-view room with king bed" onChange={(e) => site.mutate((r) => { const m = r.media.find((x) => x.id === item.id); if (m) m.alt = e.target.value; })} /></Field></div>
        <p className="mt-4 text-[14px] font-medium">Used in</p>
        <p className="mt-1 text-[13px] text-hms-muted">{usage.length ? usage.join(" · ") : "Not used yet"}</p>
        {live.uploaded && <Btn variant="danger" className="mt-6" disabled={usage.length > 0} onClick={() => { site.mutate((r) => { r.media = r.media.filter((x) => x.id !== item.id); }); onClose(); }}><Trash2 className="size-4" /> Delete</Btn>}
        
      </aside>
    </div>
  );
}

export function MediaPicker({ onPick, onClose }: { onPick: (src: string) => void; onClose: () => void }) {
  const { site } = useWM();
  return (
    <div className="fixed inset-0 z-[75] grid place-items-center bg-black/25 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-[880px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-[17px] font-semibold">Choose a photo</h2><button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><X className="size-5" /></button></div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {site.rec.media.map((m) => (
            <button key={m.id} onClick={() => { onPick(m.src); onClose(); }} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-hms-line hover:ring-4 hover:ring-hms-coral/20">
              <Image src={m.src} alt={m.alt} fill sizes="200px" className="object-cover" unoptimized={m.uploaded} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= Rooms & Booking ================= */
export function RoomsPage() {
  const { hotel, site } = useWM();
  const d = site.draft;
  const set = (id: string, k: "visible" | "featured", v: boolean) => site.edit((x) => { const r = x.rooms[id] ?? { visible: true, featured: false }; r[k] = v; if (k === "visible" && !v) r.featured = false; x.rooms[id] = r; });
  return (
    <>
      <PageHead title="Rooms" desc="Choose which rooms guests see." actions={<SourceLink href="/hms/rooms" label="Edit rooms & rates" />} />
      <Card pad={false}>
        <div className="hidden grid-cols-[1fr_110px_90px_80px_80px] gap-4 border-b border-hms-line px-5 py-2.5 text-[12px] md:grid font-semibold uppercase tracking-wider text-hms-muted">
          <span>Room type</span><span>Rate / night</span><span>Units</span><span>Visible</span><span>Featured</span>
        </div>
        {hotel.rooms.length === 0 && <Empty icon={<BedDouble className="size-6" />} title="No room types yet" desc="Add room types in Rooms. They show here automatically." action={<SourceLink href="/hms/rooms" label="Add in Rooms" />} />}
        {hotel.rooms.map((r) => {
          const st = d.rooms[r.id] ?? { visible: true, featured: false };
          const reason = r.photos.length === 0 ? "Add a photo in Rooms to show it" : !st.visible ? "Hidden from the website" : null;
          return (
            <div key={r.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-1 border-b border-hms-line px-4 py-3 last:border-b-0 md:grid-cols-[1fr_110px_90px_80px_80px] md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-hms-hover">{r.photos[0] && <Image src={r.photos[0]} alt="" fill sizes="48px" className="object-cover" />}</span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium">{r.name}</p>
                  <p className="text-[12px] tabular-nums text-hms-muted md:hidden">{formatMoney(r.fromPrice)} · {r.units} units</p>
                  <p className={clsx("text-[12px]", reason ? "text-hms-amber" : "text-hms-green")}>{reason ?? "On the website"}</p>
                </div>
              </div>
              <span className="hidden text-[14px] tabular-nums md:block">{formatMoney(r.fromPrice)}</span>
              <span className="hidden text-[14px] tabular-nums text-hms-muted md:block">{r.units}</span>
              <span className="flex flex-col items-center gap-1"><span className="text-[11px] text-hms-muted md:hidden">Show</span><Toggle label={`${r.name} visible`} on={st.visible} onChange={(v) => set(r.id, "visible", v)} /></span>
              <span className="flex flex-col items-center gap-1"><span className="text-[11px] text-hms-muted md:hidden">Featured</span><Toggle label={`${r.name} featured`} on={st.featured} disabled={!st.visible} onChange={(v) => set(r.id, "featured", v)} /></span>
            </div>
          );
        })}
      </Card>
      
    </>
  );
}

/* ================= Services & Dining ================= */
export function ServicesPage() {
  const { hotel, site } = useWM();
  const d = site.draft;
  const [tab, setTab] = useState<"services" | "dining">("services");
  const diningOk = planAllows(hotel.plan, "ultra");
  return (
    <>
      <PageHead title="Services & Dining" desc="Extras guests can see and add." />
      <div className="mb-4"><Segmented value={tab} onChange={setTab} options={[{ v: "services", label: `Other Services (${hotel.services.length})` }, { v: "dining", label: `Meals & Dining (${hotel.outlets.length})` }]} /></div>
      {tab === "services" ? (
        <Card pad={false} title="Other Services" action={<SourceLink href="/hms/other-services" label="Edit in Other Services" />}>
          {hotel.services.length === 0 && <Empty icon={<Plus className="size-6" />} title="No services yet" desc="Add pickup, breakfast or tours in Other Services. Guests can then add them to a booking." />}
          {hotel.services.map((s) => (
            <div key={s.id} className="flex items-center gap-4 border-b border-hms-line px-5 py-3 last:border-b-0">
              <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-hms-hover">{s.photo && <Image src={s.photo} alt="" fill sizes="44px" className="object-cover" />}</span>
              <div className="min-w-0 flex-1"><p className="text-[14px] font-medium">{s.name}</p><p className="text-[12px] text-hms-muted">{formatMoney(s.price)} {s.unit}{s.addToStay ? " · can be added to a booking" : ""}</p></div>
              {!s.photo && <Badge tone="amber">No photo</Badge>}
              <Toggle label={`${s.name} on website`} on={d.services[s.id]?.visible !== false} onChange={(v) => site.edit((x) => { x.services[s.id] = { visible: v }; })} />
            </div>
          ))}
        </Card>
      ) : !diningOk ? (
        <Card><Empty icon={<Lock className="size-6" />} title="Dining page is on Ultra" desc={`Restaurant and bar pages come with the Ultra plan. You are on ${PLAN_LABEL[hotel.plan]}.`} action={<SourceLink href="/hms/settings/billing" label="See plans" />} /></Card>
      ) : (
        <Card pad={false} title="Restaurants & bars" action={<SourceLink href="/hms/meals" label="Menus in Meals" />}>
          {hotel.outlets.map((o) => (
            <div key={o.id} className="flex items-center gap-4 border-b border-hms-line px-5 py-3 last:border-b-0">
              <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-hms-hover">{o.photo && <Image src={o.photo} alt="" fill sizes="44px" className="object-cover" />}</span>
              <div className="min-w-0 flex-1"><p className="text-[14px] font-medium">{o.name}</p><p className="text-[12px] text-hms-muted">{o.hours} · {hotel.menu.filter((m) => m.outletId === o.id).length} menu items</p></div>
              <Badge tone="green">On Dining page</Badge>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

/* ================= Offers & Promotions ================= */
export function OffersPage() {
  const { hotel, site } = useWM();
  const d = site.draft;
  const [f, setF] = useState<"all" | "active" | "expired">("all");
  const today = "2026-11-09";
  const rows = hotel.offers.map((o) => ({ ...o, expired: !!o.validUntil && o.validUntil < today, planned: o.kind === "package" && !hotel.flags.packages })).filter((o) => f === "all" || (f === "expired" ? o.expired : !o.expired));
  const set = (id: string, k: "visible" | "featured", v: boolean) => site.edit((x) => { const o = x.offers[id] ?? { visible: true, featured: false }; o[k] = v; if (k === "visible" && !v) o.featured = false; x.offers[id] = o; });
  return (
    <>
      <PageHead title="Offers" desc="Direct-booking deals and promo codes." actions={<SourceLink href="/hms/discounts" label="Create in Discounts" />} />
      <div className="mb-4"><Segmented value={f} onChange={setF} options={[{ v: "all", label: "All" }, { v: "active", label: "Active" }, { v: "expired", label: "Expired" }]} /></div>
      <Card pad={false} className="mb-5">
        <div className="hidden grid-cols-[1fr_100px_80px_80px] gap-4 border-b border-hms-line px-5 py-2.5 text-[12px] md:grid font-semibold uppercase tracking-wider text-hms-muted"><span>Offer</span><span>Status</span><span>Visible</span><span>Featured</span></div>
        {rows.length === 0 && <Empty icon={<Plus className="size-6" />} title="No offers here" desc="Create a discount in Discounts and it appears here." />}
        {rows.map((o) => {
          const st = d.offers[o.id] ?? { visible: true, featured: false };
          return (
            <div key={o.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-1 border-b border-hms-line px-4 py-3 last:border-b-0 md:grid-cols-[1fr_100px_80px_80px] md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-hms-hover">{o.photo && <Image src={o.photo} alt="" fill sizes="44px" className="object-cover" />}</span>
                <div className="min-w-0"><p className="truncate text-[14px] font-medium">{o.title} <span className="font-normal text-hms-coral">· {o.value}</span></p><p className="truncate text-[12px] text-hms-muted">{o.conditions}</p><span className="mt-1 inline-block md:hidden"><Badge tone={o.expired || o.planned ? "gray" : "green"}>{o.planned ? "Packages: planned" : o.expired ? "Expired" : "Active"}</Badge></span></div>
              </div>
              <span className="hidden md:block"><Badge tone={o.expired || o.planned ? "gray" : "green"}>{o.planned ? "Packages: planned" : o.expired ? "Expired" : "Active"}</Badge></span>
              <span className="flex flex-col items-center gap-1"><span className="text-[11px] text-hms-muted md:hidden">Show</span><Toggle label={`${o.title} visible`} on={!o.expired && !o.planned && st.visible} disabled={o.expired || o.planned} onChange={(v) => set(o.id, "visible", v)} /></span>
              <span className="flex flex-col items-center gap-1"><span className="text-[11px] text-hms-muted md:hidden">Featured</span><Toggle label={`${o.title} featured`} on={!o.expired && !o.planned && st.featured} disabled={o.expired || o.planned || !st.visible} onChange={(v) => set(o.id, "featured", v)} /></span>
            </div>
          );
        })}
      </Card>
      <Card title="Promo codes" desc="Guests type these at checkout. One discount per booking — the better of offer or code.">
        <div className="mb-3 flex items-center justify-between rounded-xl bg-hms-nav px-4 py-3"><span className="text-[14px]">Show the promo code field at checkout</span><Toggle label="Promo field" on={d.booking.promo} onChange={(v) => site.edit((x) => { x.booking.promo = v; })} /></div>
        <div className="flex flex-wrap gap-2">{hotel.promoCodes.map((p) => <Badge key={p.code} tone="purple">{p.code} · {p.percent}%{p.minNights ? ` · ${p.minNights}+ nights` : ""}</Badge>)}</div>
      </Card>
    </>
  );
}

/* ================= Reviews ================= */
export function ReviewsPage() {
  const { hotel, site } = useWM();
  const d = site.draft;
  const shown = hotel.reviews.filter((r) => !d.hiddenReviews.includes(r.id));
  return (
    <>
      <PageHead title="Reviews" desc="Pick the reviews guests see." actions={<SourceLink href="/hms/guests/reviews" label="All reviews" />} />
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[32px] font-semibold leading-none">{hotel.reviewScore ?? "—"}</span>
        <span className="text-[14px] text-hms-muted"><Star className="mb-0.5 inline size-4 fill-hms-amber text-hms-amber" /> {hotel.reviewCount} reviews · {shown.length} shown on the site</span>
      </div>
      <Card pad={false}>
        {hotel.reviews.length === 0 && <Empty icon={<Star className="size-6" />} title="No reviews yet" desc="Reviews from guests appear here after their stay." />}
        {hotel.reviews.map((r) => (
          <div key={r.id} className="flex items-start gap-4 border-b border-hms-line px-5 py-4 last:border-b-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-hms-hover text-[13px] font-semibold">{r.name.split(" ").map((p) => p[0]).join("")}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{r.name} <span className="ml-1 text-hms-amber">★ {r.score}</span> <span className="font-normal text-hms-muted">· {r.stayed}</span></p>
              <p className="mt-1 text-[14px] text-hms-muted">{r.text}</p>
            </div>
            <Toggle label={`Show review by ${r.name}`} on={!d.hiddenReviews.includes(r.id)} onChange={(v) => site.edit((x) => { x.hiddenReviews = v ? x.hiddenReviews.filter((id) => id !== r.id) : [...x.hiddenReviews, r.id]; })} />
          </div>
        ))}
      </Card>
    </>
  );
}

/* ================= Photos: gallery + library ================= */
export function PhotosPage() {
  const { site } = useWM();
  const d = site.draft;
  const [pick, setPick] = useState(false);
  const move = (i: number, dir: -1 | 1) => site.edit((x) => { const g = [...x.gallery]; const j = i + dir; if (j < 0 || j >= g.length) return; [g[i], g[j]] = [g[j], g[i]]; x.gallery = g; });
  return (
    <>
      <MediaPage />
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div><h2 className="text-[17px] font-semibold">Gallery</h2><p className="text-[13px] text-hms-muted">Photos in the site gallery, in this order</p></div>
          <Btn variant="outline" onClick={() => setPick(true)}><ImagePlus className="size-4" /> Add</Btn>
        </div>
        <NotWired />
        {d.gallery.length === 0 ? (
          <Card><Empty icon={<Images className="size-6" />} title="Gallery is empty" desc="Add photos from your library." action={<Btn onClick={() => setPick(true)}>Add photo</Btn>} /></Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {d.gallery.map((src, i) => (
              <div key={src + i} className="group relative overflow-hidden rounded-xl">
                <div className="relative aspect-[4/3]"><Image src={src} alt="" fill sizes="240px" className="object-cover" unoptimized={src.startsWith("data:")} /></div>
                <span className="absolute left-2 top-2 grid size-6 place-items-center rounded-full bg-white/95 text-[12px] font-semibold">{i + 1}</span>
                <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <span className="flex rounded-full bg-white/95 shadow">
                    <button aria-label="Move left" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-8 place-items-center rounded-full disabled:opacity-30"><ArrowLeft className="size-4" /></button>
                    <button aria-label="Move right" onClick={() => move(i, 1)} disabled={i === d.gallery.length - 1} className="grid size-8 place-items-center rounded-full disabled:opacity-30"><ArrowRight className="size-4" /></button>
                  </span>
                  <button aria-label="Remove from gallery" onClick={() => site.edit((x) => { x.gallery = x.gallery.filter((_, k) => k !== i); })} className="grid size-8 place-items-center rounded-full bg-white/95 text-hms-red shadow"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(src) => site.edit((x) => { if (!x.gallery.includes(src)) x.gallery.push(src); })} />}
    </>
  );
}

/* ================= Contact & Policies ================= */
export function InfoPage() {
  const { hotel, site } = useWM();
  const d = site.draft;
  const set = (k: keyof typeof d.info, v: string) => site.edit((x) => { x.info[k] = v; });
  const policy = (k: "cancellation" | "children" | "pets", label: string) => {
    const key = `policy.${k}`;
    return (
      <Field key={k} label={label}>
        <TextArea value={d.text[key] ?? ""} placeholder={hotel.policies[k]} onChange={(e) => site.edit((x) => { if (e.target.value) x.text[key] = e.target.value; else delete x.text[key]; })} className="min-h-[72px]" />
      </Field>
    );
  };
  return (
    <>
      <PageHead title="Contact & Policies" desc="Shown in the header, footer and Policies page." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone"><Input value={d.info.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="WhatsApp"><Input value={d.info.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+8801…" /></Field>
            <Field label="Email"><Input type="email" value={d.info.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Address"><Input value={d.info.address} onChange={(e) => set("address", e.target.value)} /></Field>
          </div>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.info.address)}`} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-hms-blue"><MapPin className="size-4" /> Check on Google Maps</a>
        </Card>
        <Card title="Policies">
          <div className="space-y-4">
            {policy("cancellation", "Cancellation")}
            {policy("children", "Children & extra beds")}
            {policy("pets", "Pets")}
          </div>
        </Card>
        <Card title="Nearby" action={<span className="text-[12px] text-hms-muted">From property profile</span>}>
          {hotel.nearby?.length ? (
            <ul className="divide-y divide-hms-line">{hotel.nearby.map((n) => <li key={n.name} className="flex justify-between py-2.5 text-[14px]"><span>{n.name}</span><span className="text-hms-muted">{n.time} {n.mode}</span></li>)}</ul>
          ) : <p className="text-[14px] text-hms-muted">No nearby places yet.</p>}
        </Card>
        {hotel.host && (
          <Card title="Host">
            <div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-full bg-hms-coral-soft font-semibold text-hms-red">{hotel.host.name.split(" ").map((p) => p[0]).join("")}</span><div><p className="text-[14px] font-medium">{hotel.host.name}</p><p className="text-[13px] text-hms-muted">Since {hotel.host.since} · {hotel.host.languages.join(", ")}</p></div></div>
          </Card>
        )}
      </div>
    </>
  );
}

/* ================= Blog ================= */
export function BlogPage() {
  const { site } = useWM();
  const posts = site.rec.posts;
  const [edit, setEdit] = useState<string | null>(null);
  const post = useMemo(() => posts.find((p) => p.id === edit), [posts, edit]);
  const create = () => { const id = `p${Date.now()}`; site.mutate((r) => { r.posts.unshift({ id, title: "", category: "News", status: "draft", date: new Date().toISOString(), body: "" }); }); setEdit(id); };
  const upd = (k: "title" | "category" | "body" | "status", v: string) => site.mutate((r) => { const p = r.posts.find((x) => x.id === edit); if (p) (p as Record<string, string>)[k] = v; });
  if (post) {
    return (
      <>
        <PageHead title={post.title || "New article"} eyebrow="Blog" actions={<><Btn variant="outline" onClick={() => setEdit(null)}>Back</Btn><Btn onClick={() => { upd("status", post.status === "published" ? "draft" : "published"); }}>{post.status === "published" ? "Unpublish" : "Publish article"}</Btn></>} />
        <Card>
          <div className="space-y-4">
            <Field label="Title"><Input value={post.title} onChange={(e) => upd("title", e.target.value)} placeholder="e.g. 5 things to do near the hotel" /></Field>
            <Field label="Category"><Input value={post.category} onChange={(e) => upd("category", e.target.value)} /></Field>
            <Field label="Article"><TextArea value={post.body} onChange={(e) => upd("body", e.target.value)} className="min-h-[280px]" placeholder="Write here…" /></Field>
          </div>
        </Card>
      </>
    );
  }
  return (
    <>
      <PageHead title="Blog" desc="Articles for your website. The Blog page in the themes comes next — published articles will show there." actions={<Btn onClick={create}><Plus className="size-4" /> New article</Btn>} />
      <Card pad={false}>
        {posts.length === 0 ? (
          <Empty icon={<BookOpenText className="size-6" />} title="No articles yet" desc="Write about your area, food or events. Articles help guests find you on Google." action={<Btn onClick={create}>Write the first article</Btn>} />
        ) : posts.map((p) => (
          <button key={p.id} onClick={() => setEdit(p.id)} className="flex w-full items-center gap-4 border-b border-hms-line px-5 py-3.5 text-left last:border-b-0 hover:bg-hms-nav">
            <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-medium">{p.title || "Untitled"}</p><p className="text-[12px] text-hms-muted">{p.category}</p></div>
            <Badge tone={p.status === "published" ? "green" : "gray"}>{p.status === "published" ? "Published" : "Draft"}</Badge>
          </button>
        ))}
      </Card>
    </>
  );
}

export { PlanLock };
