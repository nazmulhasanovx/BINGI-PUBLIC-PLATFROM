"use client";
// Approval status (hybrid gate): HMS opens now in setup mode; public listing + online payment wait for approval.
import Link from "next/link";
import clsx from "clsx";
import { useSyncExternalStore } from "react";
import { Check, Clock, Globe, LayoutGrid, Lock, Wallet } from "lucide-react";
import { PLANS, TRIAL_DAYS, hotelOf, num, trialLeft, useL, useOnboarding, type Status } from "@/lib/onboarding/store";
import { useRooms } from "@/lib/rooms/store";
import { setProperty } from "../hms/property";
import { Canvas, Ghost, Header } from "./shell";

const noop = () => () => {};
export const STATUS_LABEL: Record<Status, string> = { draft: "Not submitted", pending: "Waiting for BinGi approval", "needs-changes": "Needs changes", approved: "Approved" };
const STATUS_BN: Record<Status, string> = { draft: "জমা হয়নি", pending: "BinGi অনুমোদনের অপেক্ষায়", "needs-changes": "কিছু ঠিক করতে হবে", approved: "অনুমোদিত" };

export function OnboardingStatus() {
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const { draft } = useOnboarding();
  const { t } = useL();
  return (
    <Canvas>
      <Header right={<Link href="/onboarding" className="inline-flex h-9 items-center rounded-full bg-white px-3.5 text-[14px] font-semibold shadow-sm ring-1 ring-black/5">{t("আমার property", "My properties")}</Link>} />
      {!ready ? <p className="p-8 text-[15px] text-[#4d5664]" role="status">{t("লোড হচ্ছে…", "Loading…")}</p> : !draft || draft.status === "draft"
        ? <div className="p-8"><p className="text-[17px] font-semibold">{t("এই property এখনো জমা হয়নি।", "This property is not submitted yet.")}</p><Link href="/onboarding/flow" className="mt-3 inline-block font-semibold text-[#b11c29]">{t("সেটআপ চালিয়ে যান", "Continue setup")}</Link></div>
        : <Body />}
    </Canvas>
  );
}

function Body() {
  const { draft: d, edit } = useOnboarding();
  const { t, lang } = useL();
  const rooms = useRooms(hotelOf(d!));
  if (!d) return null;
  const approved = d.status === "approved";
  const steps = [{ bn: "জমা হয়েছে", en: "Submitted", ok: true }, { bn: "BinGi যাচাই", en: "BinGi review", ok: approved, now: !approved }, { bn: "অনুমোদিত", en: "Approved", ok: approved }];
  const decide = (s: Status) => {
    edit((x) => { x.status = s; x.note = s === "needs-changes" ? "ট্রেড লাইসেন্সের পরিষ্কার ছবি দিন। / Please upload a clearer trade licence photo." : undefined; });
    if (s === "approved") rooms.update((st) => { st.categories.forEach((c) => { c.approval = "approved"; }); }, "Categories approved with the property (demo of BinGi review)");
  };
  return (
    <main className="mx-auto max-w-[760px] px-4 pb-10 pt-4 sm:px-6">
      <div className="rounded-xl bg-white p-6 shadow-[0_30px_80px_-40px_rgb(16_24_40/0.25)] ring-1 ring-[#e8e9ee] sm:p-8">
        <p className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13.5px] font-semibold", approved ? "bg-[#eef8f1] text-[#1c6b3c]" : "bg-[#fdf6e7] text-[#7a4a0b]")}>{approved ? <Check className="size-4" /> : <Clock className="size-4" />}{t(STATUS_BN[d.status], STATUS_LABEL[d.status])}</p>
        <h1 className="mt-3 text-[28px] font-semibold">{d.name || t("নাম নেই", "Untitled property")}</h1>
        <p className="mt-1 text-[15px] text-[#4d5664]">{PLANS[d.plan].label} · {t(`ফ্রি ট্রায়াল: ${num(trialLeft(d), lang)}/${num(TRIAL_DAYS, lang)} দিন বাকি`, `free trial: ${trialLeft(d)} of ${TRIAL_DAYS} days left`)}</p>
        <ol className="mt-6 flex items-center gap-1.5 sm:gap-2" aria-label={t("অনুমোদনের ধাপ", "Approval progress")}>
          {steps.map((s, i) => (
            <li key={s.en} className="flex flex-1 items-center gap-1.5 sm:gap-2">
              <span className={clsx("grid size-7 shrink-0 place-items-center rounded-full text-[12.5px] font-semibold", s.ok ? "bg-[#1c7d45] text-white" : s.now ? "bg-[#b11c29] text-white" : "bg-[#e9edf2] text-[#4d5664]")}>{s.ok ? <Check className="size-4" /> : num(i + 1, lang)}</span>
              <span className="whitespace-nowrap text-[13.5px] font-semibold sm:text-[14.5px]">{t(s.bn, s.en)}</span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-[#e3e7ec]" />}
            </li>
          ))}
        </ol>
        {d.status === "needs-changes" && (
          <div role="alert" className="mt-6 rounded-xl border border-[#f6cfcb] bg-[#fff4f3] p-4">
            <p className="font-semibold text-[#9b241d]">{t("BinGi একটা পরিবর্তন চেয়েছে", "BinGi asked for a change")}</p>
            <p className="mt-1 text-[14.5px] text-[#9b241d]">{d.note}</p>
            <Link href="/onboarding/flow" onClick={() => edit((x) => { x.step = "6.2"; x.status = "draft"; })} className="mt-3 inline-flex h-10 items-center rounded-xl bg-[#0f1720] px-4 text-[14.5px] font-semibold text-white">{t("ঠিক করে আবার জমা দিন", "Fix and resubmit")}</Link>
          </div>
        )}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Gate icon={LayoutGrid} title="HMS" on text={t("এখনই চালু (সেটআপ মোড)", "Open now in setup mode")} />
          <Gate icon={Globe} title={t("ওয়েবসাইট ও লিস্টিং", "Website & listing")} on={approved && !!d.site.theme} text={approved ? (d.site.theme ? t("প্রকাশ করা যাবে", "Ready to publish") : t("HMS-এ লুক বাছুন", "Choose a look in HMS")) : t("অনুমোদনের পরে", "After approval")} />
          <Gate icon={Wallet} title={t("অনলাইন পেমেন্ট", "Online payment")} on={false} text={approved ? t("সেটিংস থেকে আবেদন", "Apply in Settings") : t("অনুমোদন + যাচাইয়ের পরে", "After approval + verification")} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/hms" onClick={() => setProperty(d.slug)} className="inline-flex h-12 items-center rounded-xl bg-[#b11c29] px-6 text-[15.5px] font-semibold text-white">{t("HMS খুলুন", "Open HMS")}</Link>
          {d.status !== "needs-changes" && <Ghost onClick={() => edit((x) => { x.status = "draft"; x.step = "6.3"; })} className="h-12">{t("সেটআপ বদলান", "Edit setup")}</Ghost>}
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-dashed border-[#d5d8e0] bg-white/60 p-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#4d5664]">Prototype only — BinGi review (Super Admin)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={() => decide("approved")} className="h-9 rounded-xl border border-[#d3d8df] bg-white px-3 text-[14px] font-medium">Approve</button>
          <button onClick={() => decide("needs-changes")} className="h-9 rounded-xl border border-[#d3d8df] bg-white px-3 text-[14px] font-medium">Ask for changes</button>
          <button onClick={() => decide("pending")} className="h-9 rounded-xl border border-[#d3d8df] bg-white px-3 text-[14px] font-medium">Back to pending</button>
        </div>
      </div>
    </main>
  );
}

function Gate({ icon: I, title, text, on }: { icon: typeof Lock; title: string; text: string; on: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#c6ccd4] bg-white p-4 sm:block">
      <span className={clsx("grid size-10 shrink-0 place-items-center rounded-xl", on ? "bg-[#eef8f1] text-[#1c7d45]" : "bg-[#e9edf2] text-[#4d5664]")}>{on ? <I className="size-5" /> : <Lock className="size-[18px]" />}</span>
      <div className="sm:mt-3"><p className="text-[15px] font-semibold">{title}</p><p className="text-[13.5px] text-[#4d5664]">{text}</p></div>
    </div>
  );
}
