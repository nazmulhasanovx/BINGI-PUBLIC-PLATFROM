"use client";
import { createPortal } from "react-dom";
// Address sheet (reference: "ঠিকানাটি নিশ্চিত করুন" — map with a pin + fields).
// Prototype: an illustrated map; tap or drag to move the pin. Production: Google/OSM map (needs an API key).
import { useRef, useState } from "react";
import { X } from "lucide-react";
import { useL, useOnboarding, type Draft } from "@/lib/onboarding/store";
import { Primary, field } from "./shell";

const DIVISIONS: [string, string][] = [["Dhaka", "ঢাকা"], ["Chattogram", "চট্টগ্রাম"], ["Sylhet", "সিলেট"], ["Khulna", "খুলনা"], ["Rajshahi", "রাজশাহী"], ["Barishal", "বরিশাল"], ["Rangpur", "রংপুর"], ["Mymensingh", "ময়মনসিংহ"]];

export function AddressSheet({ d, onClose }: { d: Draft; onClose: () => void }) {
  const { edit } = useOnboarding();
  const { t } = useL();
  const [f, setF] = useState({ road: d.road, area: d.area, city: d.city, division: d.division || "Chattogram", postcode: d.postcode, pin: d.pin ?? { x: 0.5, y: 0.45 } });
  const [err, setErr] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const move = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    setF((s) => ({ ...s, pin: { x: Math.min(0.95, Math.max(0.05, (e.clientX - r.left) / r.width)), y: Math.min(0.92, Math.max(0.12, (e.clientY - r.top) / r.height)) } }));
  };
  const save = () => {
    if (!f.road.trim() || !f.city.trim()) { setErr(true); return; }
    edit((x) => { x.road = f.road.trim(); x.area = f.area.trim(); x.city = f.city.trim(); x.division = f.division; x.postcode = f.postcode.trim(); x.pin = f.pin; x.address = [f.road, f.area, f.city, f.postcode].filter(Boolean).join(", "); });
    onClose();
  };
  const inp = (k: "road" | "area" | "city" | "postcode", label: string, ph: string, p: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label htmlFor={`a-${k}`} className="block text-[13.5px] font-semibold">{label}</label><input id={`a-${k}`} value={f[k]} onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value }))} placeholder={ph} {...p} className={field + " mt-1 h-11 text-[15px]"} /></div>
  );
  return createPortal(
    <div className="bingi-ui fixed inset-0 z-50 flex items-end justify-center bg-[#0f1720]/15 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t("ঠিকানা নিশ্চিত করুন", "Confirm the address")} onClick={(e) => e.stopPropagation()} className="onb-in max-h-[94dvh] w-full max-w-[860px] overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-[#e9edf2] px-5 py-4">
          <h2 className="text-[18px] font-semibold">{t("ঠিকানাটি নিশ্চিত করুন", "Confirm the address")}</h2>
          <button onClick={onClose} aria-label={t("বন্ধ করুন", "Close")} className="grid size-9 place-items-center rounded-full border border-[#c6ccd4] hover:bg-[#e9edf2]"><X className="size-5" /></button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-[1.1fr_1fr]">
          <div>
            <div ref={box} onPointerDown={(e) => { drag.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); move(e); }} onPointerMove={(e) => drag.current && move(e)} onPointerUp={() => { drag.current = false; }}
              className="relative aspect-[4/3] cursor-crosshair touch-none overflow-hidden rounded-xl bg-[#e8f3ea]" aria-label={t("ম্যাপে ট্যাপ করে পিন সরান", "Tap the map to move the pin")} role="application">
              <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden>
                <path d="M0 110 L400 80 M0 220 L400 240 M120 0 L150 300 M280 0 L260 300" stroke="#fff" strokeWidth="14" />
                <path d="M0 160 Q 200 120 400 170" stroke="#cfe3f6" strokeWidth="22" fill="none" />
                <path d="M300 0 L400 0 L400 60 Q 340 70 300 0 Z" fill="#cfe3f6" />
              </svg>
              <div className="pointer-events-none absolute" style={{ left: `${f.pin.x * 100}%`, top: `${f.pin.y * 100}%`, transform: "translate(-50%,-100%)" }}>
                <svg width="36" height="46" viewBox="0 0 36 46" aria-hidden><path d="M18 46 C 6 30, 0 22, 0 16 A 18 18 0 0 1 36 16 C 36 22, 30 30, 18 46 Z" fill="#d9343f" /><circle cx="18" cy="16" r="7" fill="#fff" /></svg>
              </div>
              <span className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-[#4d5664]">{(21.2 + f.pin.y * 0.5).toFixed(4)}, {(91.9 + f.pin.x * 0.4).toFixed(4)}</span>
            </div>
            <p className="mt-2 text-[12.5px] text-[#4d5664]">{t("প্রোটোটাইপ: আঁকা ম্যাপ। আসল ম্যাপ পরে যুক্ত হবে।", "Prototype: illustrated map. A real map comes later.")}</p>
          </div>
          <div className="grid content-start gap-3">
            <div><span className="block text-[13.5px] font-semibold">{t("দেশ", "Country")}</span><p className={field + " mt-1 flex h-11 items-center bg-[#f4f6f8] text-[15px]"}>{t("বাংলাদেশ", "Bangladesh")}</p></div>
            {inp("road", t("রাস্তা / বাড়ি", "Road / house"), t("যেমন: কলাতলী রোড", "e.g. Kolatoli Road"))}
            {inp("area", t("এলাকা", "Area"), t("যেমন: কলাতলী", "e.g. Kolatoli"))}
            <div className="grid grid-cols-2 gap-3">
              {inp("city", t("শহর / জেলা", "City / district"), t("কক্সবাজার", "Cox's Bazar"))}
              <div><label htmlFor="a-div" className="block text-[13.5px] font-semibold">{t("বিভাগ", "Division")}</label><select id="a-div" value={f.division} onChange={(e) => setF((s) => ({ ...s, division: e.target.value }))} className={field + " mt-1 h-11 text-[15px]"}>{DIVISIONS.map(([en, bn]) => <option key={en} value={en}>{t(bn, en)}</option>)}</select></div>
            </div>
            {inp("postcode", t("পোস্টকোড", "Postcode"), "4700", { inputMode: "numeric", maxLength: 4 })}
            {err && <p role="alert" className="text-[14px] font-medium text-[#8e1621]">{t("রাস্তা আর শহর দিন।", "Add the road and city.")}</p>}
          </div>
        </div>
        <div className="border-t border-[#e9edf2] p-4"><Primary onClick={save} className="w-full">{t("এই ঠিকানা ব্যবহার করুন", "Use this address")}</Primary></div>
      </div>
    </div>,
    document.body,

  );
}
