"use client";
// Properties created through onboarding open HMS in "setup mode" until BinGi approves them (hybrid gate).
import Link from "next/link";
import { Clock, X } from "lucide-react";
import { useState } from "react";
import { STATUS_LABEL } from "@/components/onboarding/status";
import { TRIAL_DAYS, trialLeft, useDraftFor, useOnboarding } from "@/lib/onboarding/store";
import { useProperty } from "./property";

export function SetupModeBanner() {
  const h = useProperty();
  const d = useDraftFor(h.slug);
  const { update } = useOnboarding();
  const [hidden, setHidden] = useState("");
  if (!d || d.status === "draft" || hidden === `${h.slug}:${d.status}`) return null;
  const approved = d.status === "approved";
  return (
    <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#f1dfb8] bg-[#fdf8ec] px-4 py-2 text-[13.5px] text-[#6b4309] sm:px-6">
      <Clock className="size-4 shrink-0" />
      <span className="font-semibold">{approved ? "Approved" : "Setup mode"}</span>
      <span>{STATUS_LABEL[d.status]} · free trial {trialLeft(d)} of {TRIAL_DAYS} days left{approved ? "" : " · website listing and online payment open after approval"}</span>
      <Link href="/onboarding/status" onClick={() => update((x) => { x.current = d.id; })} className="font-semibold underline underline-offset-4">View status</Link>
      <button onClick={() => setHidden(`${h.slug}:${d.status}`)} aria-label="Hide for now" className="ml-auto grid size-7 place-items-center rounded-full hover:bg-black/5"><X className="size-4" /></button>
    </div>
  );
}
