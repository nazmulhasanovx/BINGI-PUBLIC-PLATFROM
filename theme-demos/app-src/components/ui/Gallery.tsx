"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { lockScroll } from "@/components/motion/SmoothScroll";

/** Photo grid with full-screen viewer (swipe on phones, arrows/keyboard on desktop). */
export function Gallery({ photos, alt, layout = "hero" }: { photos: string[]; alt: string; layout?: "hero" | "grid" }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    lockScroll(true);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, go]);

  return (
    <>
      {layout === "hero" ? (
        <div className="relative">
          {/* phone: swipe strip */}
          <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:hidden">
            {photos.map((p, i) => (
              <button key={p + i} onClick={() => setOpen(i)} className="relative aspect-[4/3] w-full shrink-0 snap-center" aria-label={`Open photo ${i + 1}`}>
                <Image src={p} alt={`${alt} ${i + 1}`} fill sizes="100vw" priority={i === 0} className="object-cover" />
              </button>
            ))}
          </div>
          <span className="absolute bottom-3 right-3 rounded-full bg-[#16181d]/60 px-2.5 py-1 text-xs font-semibold text-white md:hidden">{photos.length} photos</span>
          {/* tablet/desktop: 1 big + up to 2 small */}
          <div className="hidden gap-2 overflow-hidden rounded-[28px] md:grid md:h-[420px] md:grid-cols-[2fr_1fr] md:grid-rows-2">
            {photos.slice(0, 3).map((p, i) => (
              <button key={p + i} onClick={() => setOpen(i)} className={`group relative overflow-hidden ${i === 0 ? "row-span-2" : ""} ${photos.length < 3 && i === 1 ? "row-span-2" : ""}`} aria-label={`Open photo ${i + 1}`}>
                <Image src={p} alt={`${alt} ${i + 1}`} fill sizes="(max-width: 1240px) 66vw, 800px" priority={i === 0} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              </button>
            ))}
            <button onClick={() => setOpen(0)} className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-full bg-surface/95 px-4 py-2 text-sm font-semibold shadow-card md:flex">
              <Expand className="size-4" /> All photos
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
          {photos.map((p, i) => (
            <button key={p + i} onClick={() => setOpen(i)} className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-square"}`} aria-label={`Open photo ${i + 1}`}>
              <Image src={p} alt={`${alt} ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 300px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open !== null && (
          <motion.div className="fixed inset-0 z-[80] flex flex-col bg-[#16181d]/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Photos">
            <div className="flex items-center justify-between p-3 text-white">
              <span className="pl-2 text-sm">{open + 1} / {photos.length}</span>
              <button onClick={close} aria-label="Close" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X className="size-5" /></button>
            </div>
            <motion.div
              key={open}
              className="relative flex-1 touch-pan-y"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                if (info.offset.x > 60) go(-1);
              }}
            >
              <Image src={photos[open]} alt={`${alt} ${open + 1}`} fill sizes="100vw" className="object-contain" />
            </motion.div>
            <div className="pb-safe flex justify-center gap-3 p-3">
              <button onClick={() => go(-1)} aria-label="Previous" className="grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="size-6" /></button>
              <button onClick={() => go(1)} aria-label="Next" className="grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="size-6" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
