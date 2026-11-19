import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { THEMES, contrast, tokensFor } from "@/lib/theme";

export const metadata = { title: "Theme Lab — GRAND colour themes" };

function Ratio({ a, b, min, pass }: { a: string; b: string; min: number; pass: string }) {
  const r = contrast(a, b);
  const ok = r >= min;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
      {r.toFixed(1)}:1 {ok ? pass : "check"}
    </span>
  );
}

export default function ThemeLab() {
  return (
    <main className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 md:py-14">
      <Image src="/brand/bingi-master.svg" alt="BinGi" width={96} height={32} className="h-8 w-auto" />
      <p className="mt-4 text-sm font-semibold text-muted">Web Themes · GRAND</p>
      <h1 className="mt-1 text-3xl font-bold md:text-4xl">10 colour themes</h1>
      <p className="mt-2 max-w-2xl text-muted">
        The hotel picks one in HMS → Website Management → Theme & Appearance. <b>Brand</b> is the chosen colour (logo tile, accents).
        <b> Action</b> is derived automatically so white button text always passes WCAG AA (4.5:1).
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((t, i) => {
          const tk = tokensFor(t.id);
          return (
            <section key={t.id} style={tk as CSSProperties} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
              <div className="flex h-20 items-end justify-between bg-brand-soft p-4">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand font-bold text-white">{i + 1}</span>
                <span className="rounded-full bg-action px-4 py-2 text-sm font-semibold text-on-action">Check rooms</span>
              </div>
              <div className="space-y-2 p-4 text-sm">
                <p className="text-lg font-bold">{t.name}</p>
                <p className="flex items-center justify-between"><span>Brand <code className="text-muted">{tk["--brand"]}</code></span><Ratio a={tk["--brand"]} b="#FFFFFF" min={3} pass="AA · UI fill" /></p>
                <p className="flex items-center justify-between"><span>Action <code className="text-muted">{tk["--action"]}</code></span><Ratio a={tk["--action"]} b="#FFFFFF" min={4.5} pass="AA · text" /></p>
                <div className="flex gap-1.5 pt-1">
                  {["--brand", "--action", "--action-hover", "--brand-soft-2", "--brand-soft"].map((k) => (
                    <span key={k} title={k} className="h-6 flex-1 rounded-md border border-line" style={{ background: tk[k] }} />
                  ))}
                </div>
                <Link href={`/hotel/azure-bay?theme=${t.id}`} className="mt-2 inline-flex h-10 items-center rounded-full border border-brand-ring px-4 font-semibold text-action hover:bg-brand-soft">
                  Preview on demo hotel →
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
