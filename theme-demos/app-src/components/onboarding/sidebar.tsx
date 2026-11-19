"use client";
// Left sidebar (host-extranet style): property, % complete, the 6 parts with their steps and what is done.
import clsx from "clsx";
import { useState } from "react";
import { BedDouble, Building2, CalendarCheck, Check, ChevronDown, Circle, CircleDot, LayoutGrid, Send, Wallet, type LucideIcon } from "lucide-react";

const ICON: Record<string, LucideIcon> = { s1: Building2, s2: BedDouble, s3: CalendarCheck, s4: LayoutGrid, s5: Wallet, s6: Send };
import { ORDER, SECTIONS, STEP_TITLE, minutesLeft, num, sectionOf, stepOf, useL, type Check as C, type Draft, type StepId } from "@/lib/onboarding/store";

/** A step is done when the owner has moved past it (or, for required data, when the check passes). */
function stepDone(d: Draft, s: StepId, cs: C[]) {
  const req = cs.find((c) => c.step === s && c.level === "required");
  if (req) return req.ok;
  return d.seen.includes(s) && ORDER.indexOf(s) < ORDER.indexOf(stepOf(d.step));
}

export function Sidebar({ d, cs, pct, go }: { d: Draft; cs: C[]; pct: number; go: (s: StepId) => void }) {
  const { t, lang } = useL();
  return (
    <nav aria-label={t("সেটআপের ধাপ", "Setup steps")} className="p-5">
      <p className="text-[13px] font-medium text-[#4d5664]">{t("সেটআপ", "Setup")}</p>
      <p className="mt-0.5 truncate text-[17px] font-semibold">{d.name || t("নতুন property", "New property")}</p>
      <div className="mt-3 flex items-center gap-2.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e3e7ec]"><div className="h-full rounded-full bg-[#1c7d45] transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>
        <span className="text-[13px] font-semibold tabular-nums">{num(pct, lang)}%</span>
      </div>
      <p className="mt-1.5 text-[12.5px] text-[#4d5664]">{t(`বাকি প্রায় ${num(minutesLeft(d.step), lang)} মিনিট`, `About ${minutesLeft(d.step)} min left`)}</p>
      <ol className="mt-5 space-y-1">
        {SECTIONS.map((s, i) => {
          const cur = sectionOf(d.step) === i;
          const done = s.steps.every((x) => stepDone(d, x, cs));
          const started = s.steps.some((x) => d.seen.includes(x));
          return (
            <li key={s.id}>
              <button onClick={() => started && go((s.steps.find((x) => !stepDone(d, x, cs) && d.seen.includes(x)) ?? s.steps.filter((x) => d.seen.includes(x)).at(-1) ?? s.steps[0]) as StepId)} disabled={!started}
                className={clsx("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14.5px] disabled:cursor-default", cur ? "bg-[#e9edf2] font-semibold" : "enabled:hover:bg-[#f4f6f8]", !started && "text-[#80869a]")}>
                {(() => { const I = ICON[s.id]; return (
                  <span className={clsx("relative grid size-8 shrink-0 place-items-center rounded-lg", cur ? "bg-[#0f1720] text-white" : done ? "bg-[#e8f4ec] text-[#1c7d45]" : "bg-[#e9edf2] text-[#4d5664]")}>
                    <I className="size-[17px]" strokeWidth={1.9} aria-hidden />
                    {done && <span className="absolute -bottom-1 -right-1 grid size-[15px] place-items-center rounded-full bg-[#1c7d45] text-white ring-2 ring-white"><Check className="size-2.5" strokeWidth={3.5} /></span>}
                  </span>); })()}
                <span className="flex-1">{t(s.bn, s.label)}</span>
                {done && !cur && <span className="text-[12px] font-medium text-[#1c7d45]">{t("হয়েছে", "Done")}</span>}
              </button>
              {cur && (
                <ol className="mb-2 ml-[26px] mt-1 space-y-0.5 border-l border-[#e3e7ec] pl-4">
                  {s.steps.map((x) => {
                    const ok = stepDone(d, x, cs);
                    const here = x === stepOf(d.step);
                    return (
                      <li key={x}>
                        <button onClick={() => go(x)} disabled={!d.seen.includes(x)} aria-current={here ? "step" : undefined}
                          className={clsx("flex w-full items-center gap-2 rounded-md py-1.5 pl-1 text-left text-[13.5px]", here ? "font-semibold text-[#0f1720]" : d.seen.includes(x) ? "text-[#4d5664] hover:text-[#0f1720]" : "text-[#80869a]")}>
                          {ok ? <Check className="size-3.5 text-[#1c7d45]" strokeWidth={3} /> : here ? <CircleDot className="size-3.5 text-[#b11c29]" /> : <Circle className="size-3.5 text-[#b8bdc7]" />}
                          {t(...STEP_TITLE[x])}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 rounded-lg bg-[#f4f6f8] px-3 py-2.5 text-[12.5px] leading-relaxed text-[#4d5664]">{t("সব কিছু আপনা-আপনি সেভ হয়। যেকোনো সময় বের হয়ে পরে চালিয়ে যান।", "Everything saves automatically. Leave anytime and continue later.")}</p>
    </nav>
  );
}

/** Phone: one line with the part and a sheet with the same list. */
export function MobileSteps({ d, cs, pct, go }: { d: Draft; cs: C[]; pct: number; go: (s: StepId) => void }) {
  const [open, setOpen] = useState(false);
  const { t, lang } = useL();
  const i = sectionOf(d.step);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="text-[13px] font-semibold text-[#4d5664]">{lang === "bn" ? `ধাপ ${num(i + 1, lang)}/৬` : `Part ${i + 1}/6`}</span>
        <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold">{t(SECTIONS[i].bn, SECTIONS[i].label)} · {t(...STEP_TITLE[stepOf(d.step)])}</span>
        <span className="text-[13px] font-semibold tabular-nums">{num(pct, lang)}%</span>
        <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="onb-in border-t border-[#e3e7ec]"><Sidebar d={d} cs={cs} pct={pct} go={(s) => { setOpen(false); go(s); }} /></div>}
    </div>
  );
}
