"use client";
// One upgrade card for every plan-gated module (rules in src/lib/plan.ts).
import Link from "next/link";
import clsx from "clsx";
import { Lock } from "lucide-react";
import { BILLING_HREF, minPlanLabel, planLabel, type Feature } from "@/lib/plan";
import type { Hotel } from "@/lib/types";
import { btnPrimary } from "./guests/ui";

export function PlanGate({ h, f, title, text }: { h: Pick<Hotel, "plan" | "name">; f: Feature; title: string; text: string }) {
  const min = minPlanLabel(f);
  return (
    <div className="h-full overflow-y-auto"><div className="mx-auto max-w-[720px] p-6">
      <div className="mt-10 rounded-2xl border border-hms-line bg-white p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-hms-coral-soft text-hms-red"><Lock className="size-7" aria-hidden /></span>
        <h1 className="mt-4 text-[22px] font-bold">{title} is part of {min}</h1>
        <p className="mx-auto mt-2 max-w-[440px] text-[14.5px] text-hms-muted">{text} {h.name} is on the {planLabel(h)} plan.</p>
        <Link href={BILLING_HREF} className={clsx(btnPrimary, "mt-5")}>See {min} plan</Link>
      </div>
    </div></div>
  );
}
