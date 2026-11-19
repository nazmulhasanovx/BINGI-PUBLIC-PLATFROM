"use client";
import Image from "next/image";
import type { ReactNode } from "react";
import { HeroIn, PhotoIn } from "@/components/motion/Reveal";
import { slotText, useSiteView } from "@/lib/site";
import { useLang } from "@/lib/i18n";

/** Inner pages: short hero with the page's own photo. Title, intro and photo can be changed in
 *  HMS › Website Management › Pages & Menu (page.<id>.title / page.<id>.intro / pagePhotos[id]). */
export function PageHero({ eyebrow, title, sub, photo, children, slug, pageId }: { eyebrow?: string; title: string; sub?: string; photo?: string; children?: ReactNode; slug?: string; pageId?: string }) {
  const doc = useSiteView(slug ?? "");
  const lang = useLang();
  const t = pageId ? slotText(doc, `page.${pageId}.title`, title, lang) : title;
  const intro = pageId ? slotText(doc, `page.${pageId}.intro`, sub ?? "", lang) : sub;
  const pic = (pageId && doc?.pagePhotos[pageId]) || photo;
  return (
    <section className="relative overflow-hidden bg-canvas md:border-b md:border-line md:bg-surface">
      {pic && (
        <>
          <PhotoIn className="absolute inset-0 hidden md:block">
            <Image src={pic} alt="" fill priority sizes="100vw" quality={85} className="object-cover object-[70%_center] opacity-90" unoptimized={pic.startsWith("data:")} />
          </PhotoIn>
          <div className="absolute inset-0 hidden bg-gradient-to-r from-white via-white/85 via-45% to-white/10 md:block" />
        </>
      )}
      <HeroIn className="relative mx-auto max-w-[1240px] px-4 pb-4 pt-5 sm:px-6 md:py-16">
        {eyebrow && <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-action">{eyebrow}</p>}
        <h1 className="max-w-xl text-[30px] font-bold leading-tight md:mt-2 md:text-5xl">{t}</h1>
        {intro && <p className="mt-3 max-w-lg text-[15px] text-ink/70 md:text-[17px]">{intro}</p>}
        {children}
      </HeroIn>
    </section>
  );
}
