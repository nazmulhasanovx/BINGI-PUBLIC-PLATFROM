"use client";
// Real device frames for previews: iPhone 16 Pro Max (440×956 pt) and iPad Pro 12.9″ (1024×1366 pt).
// The site renders at the device's true CSS width (height minus the status bar); the whole frame is scaled to fit the space it gets.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BatteryFull, Globe, Signal, Wifi } from "lucide-react";

export const DEVICE_SPEC = {
  iphone: { label: "iPhone 16 Pro Max", w: 440, h: 956, bezel: 14, outer: 70, inner: 56 },
  ipad: { label: "iPad Pro 12.9″", w: 1024, h: 1366, bezel: 24, outer: 46, inner: 22 },
} as const;
export type DeviceKind = keyof typeof DEVICE_SPEC;

/** One device at real size, scaled to fit the parent box (width and height). */
export function FittedDevice({ kind, children, pad = 24, landscape = false }: { kind: DeviceKind; children: ReactNode; pad?: number; landscape?: boolean }) {
  const s = DEVICE_SPEC[kind];
  const sw = landscape ? s.h : s.w;
  const sh = landscape ? s.w : s.h;
  const fw = sw + s.bezel * 2;
  const fh = sh + s.bezel * 2;
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, (el.clientWidth - pad * 2) / fw, (el.clientHeight - pad * 2) / fh));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fw, fh, pad]);
  return (
    <div ref={box} className="flex size-full min-h-0 items-center justify-center overflow-clip">
      <div style={{ width: fw * scale, height: fh * scale }} className="relative shrink-0">
        <div
          aria-label={s.label}
          role="group"
          style={{ width: fw, height: fh, padding: s.bezel, borderRadius: s.outer, transform: `scale(${scale})`, transformOrigin: "top left" }}
          className="absolute left-0 top-0 bg-[#15161a] shadow-[0_0_0_2px_#3a3d44,0_30px_80px_-24px_rgb(0_0_0/0.45)]"
        >
          {kind === "iphone" ? <PhoneHardware /> : <TabletHardware landscape={landscape} />}
          <div style={{ width: sw, height: sh, borderRadius: s.inner }} className="relative flex flex-col overflow-clip bg-white">
            <StatusBar kind={kind} />
            <div className="min-h-0 flex-1">{children}</div>
            {kind === "iphone" && <span aria-hidden className="pointer-events-none absolute left-1/2 top-[11px] z-10 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" />}
            {kind === "iphone" && <span aria-hidden className="pointer-events-none absolute bottom-[8px] left-1/2 z-10 h-[5px] w-[150px] -translate-x-1/2 rounded-full bg-black/80 mix-blend-difference" />}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The device status bar: the site starts below it, as in Safari. */
function StatusBar({ kind }: { kind: DeviceKind }) {
  const phone = kind === "iphone";
  return (
    <div aria-hidden className={phone ? "flex h-[54px] shrink-0 items-center justify-between bg-white px-[34px] pt-[6px] text-[17px] font-semibold text-black" : "flex h-[24px] shrink-0 items-center justify-between bg-white px-5 text-[13px] font-semibold text-black"}>
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <Signal className={phone ? "size-[18px]" : "size-3.5"} strokeWidth={2.4} />
        <Wifi className={phone ? "size-[18px]" : "size-3.5"} strokeWidth={2.4} />
        <BatteryFull className={phone ? "size-[24px]" : "size-[18px]"} strokeWidth={1.8} />
      </span>
    </div>
  );
}

function PhoneHardware() {
  // Side buttons: action + volume (left), side button (right).
  const b = "absolute w-[4px] rounded-sm bg-[#2b2d33]";
  return (
    <>
      <span aria-hidden className={b} style={{ left: -4, top: 170, height: 34 }} />
      <span aria-hidden className={b} style={{ left: -4, top: 236, height: 62 }} />
      <span aria-hidden className={b} style={{ left: -4, top: 312, height: 62 }} />
      <span aria-hidden className={b} style={{ right: -4, top: 268, height: 100 }} />
    </>
  );
}

function TabletHardware({ landscape }: { landscape: boolean }) {
  return landscape
    ? <span aria-hidden className="absolute left-[9px] top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-[#2f323a]" />
    : <span aria-hidden className="absolute left-1/2 top-[9px] size-[7px] -translate-x-1/2 rounded-full bg-[#2f323a]" />;
}

/** Shown in place of the site while the property has no website yet (new property waiting for approval). */
export function SiteNotReady({ name }: { name?: string }) {
  return (
    <div className="grid size-full place-items-center bg-[#f4f6f8] p-8 text-center">
      <div className="max-w-[360px]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-[#4d5664] shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-[#e3e7ec]"><Globe className="size-7" strokeWidth={1.6} /></span>
        <p className="mt-5 text-[22px] font-semibold text-[#0f1720]">Website not created yet</p>
        <p className="mt-2 text-[15px] leading-relaxed text-[#4d5664]">{name ? `${name}'s` : "This property's"} website is built after BinGi approves the setup. Until then you can try themes in the Theme Store.</p>
      </div>
    </div>
  );
}

export const siteReady = (slug: string) => !slug.startsWith("onb-");
