"use client";
import { hrefFor } from "@/lib/href";
import Link from "next/link";
import clsx from "clsx";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Check, ExternalLink, Laptop, Monitor, Pencil, Smartphone, Tablet, X } from "lucide-react";
import { useProperty } from "../property";
import { useSite } from "@/lib/site";
import { MANIFESTS, type ThemeManifest } from "@/themes/manifest";
import type { Hotel } from "@/lib/types";
import { WM_PAGES } from "./pages";
import { DEVICE_SPEC, FittedDevice, SiteNotReady, siteReady } from "./devices";
import { Btn } from "./ui";
import { PAGE_COMPONENTS } from "./registry";

type WM = { hotel: Hotel; site: ReturnType<typeof useSite>; manifest: ThemeManifest; openPreview: (sectionId?: string) => void; siteUrl: string };
const Ctx = createContext<WM | null>(null);
export const useWM = () => useContext(Ctx)!;

export function WebsiteModule({ page }: { page: string }) {
  const hotel = useProperty();
  const site = useSite(hotel);
  const manifest = MANIFESTS[site.draft.master];
  const [preview, setPreview] = useState<{ open: boolean; section?: string }>({ open: false });
  const siteUrl = `/hotel/${hotel.slug}`;
  const Page = PAGE_COMPONENTS[page] ?? PAGE_COMPONENTS.overview;
  return (
    <Ctx.Provider value={{ hotel, site, manifest, openPreview: (section) => setPreview({ open: true, section }), siteUrl }}>
      <div className="flex h-full min-h-0">
        <InnerNav active={page} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PublishBar />
          <PhoneNav active={page} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div key={page} className="hms-page hms-page-in">
              <Page />
            </div>
          </div>
        </div>
      </div>
      {preview.open && <DevicePreview section={preview.section} onClose={() => setPreview({ open: false })} />}
    </Ctx.Provider>
  );
}

function InnerNav({ active }: { active: string }) {
  const groups = [...new Set(WM_PAGES.map((p) => p.group))];
  return (
    <aside className="no-scrollbar hidden w-[212px] shrink-0 overflow-y-auto border-r border-hms-line bg-hms-nav px-2.5 py-3 lg:block" aria-label="Website Management">
      {groups.map((g) => (
        <div key={g || "top"} className={g && g !== "Publish" ? "mt-2.5" : g === "Publish" ? "mt-2.5 border-t border-hms-line pt-2.5" : ""}>
          {g && g !== "Publish" && <p className="px-3 pb-0.5 text-[11.5px] font-medium text-hms-muted">{g}</p>}
          {WM_PAGES.filter((p) => p.group === g).map((p) => {
            const Icon = p.icon;
            const on = p.id === active;
            return (
              <Link
                key={p.id}
                href={`/hms/website/${p.id}`}
                aria-current={on ? "page" : undefined}
                className={clsx("flex h-[30px] items-center gap-2.5 rounded-lg px-3 text-[13.5px] transition-colors", on ? "bg-white font-semibold text-hms-coral shadow-[0_1px_3px_rgb(0_0_0/0.08)]" : "text-hms-ink hover:bg-white/70")}
              >
                <Icon className="size-4 shrink-0" strokeWidth={on ? 2.2 : 1.8} />
                {p.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

/** Phones and tablets (< lg): the page menu as one swipeable row; the current page scrolls into view. */
function PhoneNav({ active }: { active: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: "nearest", inline: "center" }); }, [active]);
  return (
    <nav aria-label="Website Management pages" className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto border-b border-hms-line bg-white px-4 py-2 lg:hidden">
      {WM_PAGES.map((p) => {
        const on = p.id === active;
        const Icon = p.icon;
        return (
          <Link key={p.id} ref={on ? ref : undefined} href={`/hms/website/${p.id}`} aria-current={on ? "page" : undefined}
            className={clsx("flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[14px] transition-colors", on ? "bg-hms-coral font-semibold text-white" : "bg-hms-nav text-hms-ink")}>
            <Icon className="size-4" strokeWidth={on ? 2.2 : 1.8} /> {p.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** One slim bar on every page: live status, address, unpublished changes, Preview, Publish. */
function PublishBar() {
  const { site, siteUrl, openPreview } = useWM();
  const n = site.changes.length;
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-hms-line bg-white px-6 py-2.5 lg:px-8">
      <span className="size-2 rounded-full bg-green-500" aria-hidden />
      <a href={hrefFor(siteUrl)} target="_blank" rel="noopener" className="flex min-w-0 items-center gap-1 truncate text-[14px] font-medium hover:text-hms-blue">
        bingi.app{siteUrl} <ExternalLink className="size-3.5 shrink-0 text-hms-muted" />
      </a>
      <div className="ml-auto flex items-center gap-2">
        {n > 0 && <span className="hidden text-[13px] text-hms-amber sm:inline">{n} change{n > 1 ? "s" : ""} not published</span>}
        <Btn variant="outline" onClick={() => openPreview()} className="h-8 px-3.5 text-[13px]">Preview</Btn>
        {n > 0 && <Link href="/hms/website/publish" className="inline-flex h-8 items-center rounded-full bg-hms-coral px-3.5 text-[13px] font-medium text-white hover:bg-[#8e1621]">Publish</Link>}
      </div>
    </div>
  );
}

const DEVICES = [
  { id: "desktop", label: "Desktop", w: 1440, icon: Monitor },
  { id: "laptop", label: "Laptop", w: 1280, icon: Laptop },
  { id: "tablet", label: DEVICE_SPEC.ipad.label, w: DEVICE_SPEC.ipad.w, icon: Tablet },
  { id: "phone", label: DEVICE_SPEC.iphone.label, w: DEVICE_SPEC.iphone.w, icon: Smartphone },
] as const;

export function DevicePreview({ section, onClose }: { section?: string; onClose: () => void }) {
  const { hotel, site } = useWM();
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(0);
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "bingi:edit-text") return;
      const key = String(e.data.key);
      const value = String(e.data.value ?? "").slice(0, 300);
      site.edit((x) => { if (value) x.text[key] = value; else delete x.text[key]; });
      setSaved((n) => n + 1);
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [site]);
  const d = DEVICES.find((x) => x.id === device)!;
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => box.current && setScale(Math.min(1, (box.current.clientWidth - 48) / d.w));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [d.w]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="hms-app fixed inset-0 z-[80] flex flex-col bg-[#e9edf2]" role="dialog" aria-label="Preview">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-hms-line bg-white px-4">
        <p className="text-[15px] font-semibold">Preview · draft</p>
        <span className="hidden text-[13px] text-hms-muted lg:inline">{edit ? (saved ? `${saved} change${saved > 1 ? "s" : ""} saved to draft` : "Click any outlined text to change it") : "Only you see this"}</span>
        <div className="mx-auto flex rounded-full border border-hms-line bg-hms-hover p-0.5">
          {DEVICES.map((x) => (
            <button key={x.id} onClick={() => setDevice(x.id)} className={clsx("flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium", device === x.id ? "bg-white shadow-sm" : "text-hms-muted")}>
              <x.icon className="size-4" /> <span className="hidden md:inline">{x.label}</span>
            </button>
          ))}
        </div>
        <Btn variant={edit ? "primary" : "outline"} onClick={() => setEdit((v) => !v)} aria-pressed={edit} className="h-8 px-3">{edit ? <><Check className="size-4" /> Done</> : <><Pencil className="size-4" /> Edit</>}</Btn>
        <Btn variant="outline" onClick={onClose} className="h-8 px-3"><X className="size-4" /> Close</Btn>
      </div>
      {edit && <p className="shrink-0 border-b border-hms-line bg-[#fff7ed] px-4 py-2 text-center text-[13px] text-[#7a4a0b]">Edit mode: click outlined text to type, press Enter to save. Room names, prices and reviews come from HMS — change them in Rooms, Rates or Reviews.</p>}
      {device === "tablet" || device === "phone" ? (
        <div className="min-h-0 flex-1">
          <FittedDevice kind={device === "phone" ? "iphone" : "ipad"}>
            <PreviewFrame slug={hotel.slug} section={section} edit={edit} title={`${hotel.name} draft preview`} name={hotel.name} />
          </FittedDevice>
        </div>
      ) : (
        <div ref={box} className="flex min-h-0 flex-1 justify-center overflow-hidden p-6">
          <div style={{ width: d.w * scale, height: "100%" }} className="relative">
            <div style={{ width: d.w, height: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: "top left" }} className="overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_-20px_rgb(0_0_0/0.35)]">
              <PreviewFrame slug={hotel.slug} section={section} edit={edit} title={`${hotel.name} draft preview`} name={hotel.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** The real site, rendering the draft (?preview=draft). Updates live as the draft changes. */
export function PreviewFrame({ slug, section, title, edit = false, name }: { slug: string; section?: string; title: string; edit?: boolean; name?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const sendEdit = () => ref.current?.contentWindow?.postMessage({ type: "bingi:edit-mode", on: edit }, window.location.origin);
  useEffect(() => {
    ref.current?.contentWindow?.postMessage({ type: "bingi:edit-mode", on: edit }, window.location.origin);
  }, [edit]);
  useEffect(() => {
    if (!section) return;
    const send = () => ref.current?.contentWindow?.postMessage({ type: "bingi:scroll-to", id: section }, window.location.origin);
    const t = setTimeout(send, 600);
    return () => clearTimeout(t);
  }, [section]);
  if (!siteReady(slug)) return <SiteNotReady name={name} />;
  return <iframe ref={ref} title={title} src={hrefFor(`/hotel/${slug}?preview=draft`)} className="size-full border-0" onLoad={() => { sendEdit(); if (section) ref.current?.contentWindow?.postMessage({ type: "bingi:scroll-to", id: section }, window.location.origin); }} />;
}

/** Fits a full-width site (e.g. 1440) into whatever column it sits in, scaled down. */
export function ScaledSite({ slug, section, width, height, title }: { slug: string; section?: string; width: number; height: number; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-2xl border border-hms-line bg-white" style={{ height }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width, height: height / scale, transform: `scale(${scale})` }}>
        <PreviewFrame slug={slug} section={section} title={title} />
      </div>
    </div>
  );
}
