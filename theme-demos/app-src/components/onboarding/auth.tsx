"use client";
// S0 — phone + OTP (demo code), then "আমার property" (new / continue / status). Bangla first.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ArrowRight, Building2, Clock, Plus, ShieldCheck } from "lucide-react";
import { setProperty } from "../hms/property";
import { Canvas, Ghost, Header, Primary, field } from "./shell";

import { SECTIONS, STEP_TITLE, newDraft, num, stepOf, useL, useOnboarding, validPhone } from "@/lib/onboarding/store";

const INTRO: [string, string][] = [["ধরন, নাম, ঠিকানা", "Type, name, address"], ["রুম, তলা, রুম নম্বর, দাম", "Rooms, floors, numbers, prices"], ["দামের নিয়ম, বাতিলের নিয়ম", "Price rules, cancellation"], ["কোন কোন কাজ, টিম", "Tools and team"], ["গেস্ট পেমেন্ট, ওয়েবসাইট", "Guest payments, website"], ["প্ল্যান, কাগজপত্র, জমা", "Plan, documents, submit"]];
import { TYPE_META as TYPES } from "./types";

const noop = () => () => {};
const DEMO_OTP = "123456";

export function OnboardingHome() {
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const { st } = useOnboarding();
  const { t } = useL();
  return (
    <Canvas>
      <Header right={st.verified ? <SignOut /> : undefined} />
      {!ready ? <p className="p-8 text-[15px] text-[#4d5664]" role="status">{t("লোড হচ্ছে…", "Loading…")}</p> : st.verified ? <MyProperties /> : <Auth />}
    </Canvas>
  );
}

function SignOut() {
  const { update } = useOnboarding();
  const { t } = useL();
  return <button onClick={() => update((s) => { s.verified = false; })} className="h-9 rounded-full bg-white px-3.5 text-[14px] font-semibold shadow-sm ring-1 ring-black/5">{t("বের হন", "Sign out")}</button>;
}

function Auth() {
  const { update } = useOnboarding();
  const { t, lang } = useL();
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPhone(phone)) { setErr(t("সঠিক মোবাইল নম্বর দিন, যেমন 01712 345678", "Enter a Bangladesh mobile number, e.g. 01712 345678")); return; }
    setErr(""); setSent(true);
  };
  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== DEMO_OTP) { setErr(t("কোডটা মেলেনি। SMS দেখে আবার দিন।", "That code is not right. Check the SMS and try again.")); return; }
    update((s) => { s.phone = phone.replace(/[\s-]/g, ""); s.verified = true; });
  };
  return (
    <main className="mx-auto max-w-[1000px] px-3 py-8 sm:px-6 sm:py-14">
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgb(16_24_40/0.05),0_20px_50px_-30px_rgb(16_24_40/0.25)] ring-1 ring-[#e8e9ee] lg:grid lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden border-r border-[#e3e7ec] bg-[#f4f6f8] p-10 lg:block">
          <p className="text-[15px] font-semibold">{t("সেটআপে যা যা করবেন", "What you'll set up")}</p>
          <ol className="mt-5 space-y-4">
            {SECTIONS.map((x, i) => (
              <li key={x.id} className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#858c97] bg-white text-[13px] font-semibold">{num(i + 1, lang)}</span>
                <span><span className="block text-[15px] font-semibold">{t(x.bn, x.label)}</span><span className="text-[13.5px] text-[#4d5664]">{t(...INTRO[i])}</span></span>
              </li>
            ))}
          </ol>
        </div>
        <div className="p-6 sm:p-10">
                    {!sent ? (
            <form onSubmit={send} noValidate>
              <h1 className="mt-1 text-[28px] font-semibold leading-tight sm:text-[32px]">{t("আপনার property সেটআপ করুন", "Set up your property")}</h1>
              <p className="mt-2 text-[16px] text-[#4d5664]">{t("৬টা ছোট ধাপ। যেকোনো সময় থামিয়ে পরে চালিয়ে যেতে পারবেন।", "Six short parts. Stop anytime and continue later.")}</p>
              <ul className="mt-5 space-y-2 text-[15px]">
                {[t("৭ দিন ফ্রি ট্রায়াল", "7-day free trial"), t("রুম, কটেজ, ভিলা — সব এক জায়গায়", "Rooms, cottages, villas — one setup"), t("যেকোনো ধাপে BinGi টিমের সাহায্য", "Help from the BinGi team at any step")].map((x) => <li key={x} className="flex items-center gap-2.5"><ShieldCheck className="size-5 text-[#1c7d45]" />{x}</li>)}
              </ul>
              <label className="mt-7 block text-[15px] font-semibold" htmlFor="ph">{t("মোবাইল নম্বর", "Mobile number")}</label>
              <div className="mt-2 flex gap-2">
                <span className="grid h-12 place-items-center rounded-xl border border-[#c6ccd4] bg-[#f4f6f8] px-3 text-[15px] font-semibold">🇧🇩 +880</span>
                <input id="ph" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01712 345678" className={field + " flex-1 text-[17px]"} aria-invalid={!!err} aria-describedby={err ? "pherr" : undefined} />
              </div>
              {err && <p id="pherr" role="alert" className="mt-2 text-[14px] font-medium text-[#8e1621]">{err}</p>}
              <Primary type="submit" className="mt-6 w-full">{t("কোড পাঠান", "Send code")}</Primary>
              <p className="mt-4 text-[13px] text-[#4d5664]">{t("চালিয়ে গেলে আপনি BinGi-র শর্ত ও গোপনীয়তা নীতিতে রাজি।", "By continuing you agree to BinGi's Terms and Privacy Policy.")}</p>
            </form>
          ) : (
            <form onSubmit={verify} noValidate>
              <h1 className="mt-1 text-[28px] font-semibold leading-tight sm:text-[32px]">{t("কোডটা দিন", "Enter the code")}</h1>
              <p className="mt-2 text-[16px] text-[#4d5664]">{t(`${phone} নম্বরে পাঠানো হয়েছে।`, `Sent to ${phone}.`)} <button type="button" onClick={() => { setSent(false); setCode(""); setErr(""); }} className="font-semibold text-[#b11c29]">{t("নম্বর বদলান", "Change")}</button></p>
              <label className="mt-7 block text-[15px] font-semibold" htmlFor="otp">{t("৬ সংখ্যার কোড", "6-digit code")}</label>
              <input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={field + " mt-2 h-14 text-center font-mono text-[26px] tracking-[0.45em]"} aria-invalid={!!err} />
              {err && <p role="alert" className="mt-2 text-[14px] font-medium text-[#8e1621]">{err}</p>}
              <p className="mt-3 rounded-xl bg-[#fdf6e7] px-3 py-2 text-[13.5px] text-[#7a4a0b]">{t(`প্রোটোটাইপ: SMS যায় না। কোড ${DEMO_OTP} দিন।`, `Prototype: no SMS is sent. Use code ${DEMO_OTP}.`)}</p>
              <Primary type="submit" className="mt-6 w-full" disabled={code.length !== 6}>{t("যাচাই করুন", "Verify")}</Primary>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function MyProperties() {
  const { st, update } = useOnboarding();
  const { t, lang } = useL();
  const router = useRouter();
  const start = () => {
    const d = newDraft(st.drafts.length);
    d.phone = st.phone;
    update((s) => { s.drafts.unshift(d); s.current = d.id; });
    router.push("/onboarding/flow");
  };
  const open = (id: string, submitted: boolean) => { update((s) => { s.current = id; }); router.push(submitted ? "/onboarding/status" : "/onboarding/flow"); };
  return (
    <main className="mx-auto max-w-[760px] px-4 pb-10 pt-4 sm:px-6">
      <h1 className="text-[30px] font-semibold">{t("আমার property", "My properties")}</h1>
      <p className="mt-1 text-[15.5px] text-[#4d5664]">{t("প্রতিটা property-র আলাদা সেটআপ।", "Each property has its own setup.")} · {num(st.phone, lang)}</p>
      <button onClick={start} className="mt-6 flex w-full items-center gap-4 rounded-xl border border-dashed border-[#efb7b1] bg-white p-5 text-left transition-shadow hover:shadow-[0_14px_30px_-18px_rgb(200_35_46/0.5)]">
        <span className="grid size-14 place-items-center rounded-xl bg-[#b11c29] text-white"><Plus className="size-7" /></span>
        <span><span className="block text-[19px] font-semibold">{t("নতুন property যোগ করুন", "Add a new property")}</span><span className="text-[14.5px] text-[#4d5664]">{t("প্রায় ৮–১০ মিনিট", "About 8–10 minutes")}</span></span>
        <ArrowRight className="ml-auto size-6 text-[#b11c29]" />
      </button>
      {st.drafts.length > 0 && (
        <ul className="mt-5 space-y-3">
          {st.drafts.map((d) => {
            const ty = TYPES.find((x) => x.slug === d.propertyType);
            const I = ty?.icon ?? Building2;
            const submitted = d.status !== "draft";
            return (
              <li key={d.id} className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#e8e9ee]">
                <span className="grid size-12 place-items-center rounded-xl bg-[#ffe7e4] text-[#b11c29]"><I className="size-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-semibold">{d.name || t("নাম নেই", "Untitled property")}</span>
                  <span className="text-[14px] text-[#4d5664]">{[ty ? t(ty.bn, ty.en) : null, d.city].filter(Boolean).join(" · ") || t("শুরু হয়নি", "Not started")}</span>
                </span>
                {submitted
                  ? <span className="rounded-full bg-[#fdf6e7] px-3 py-1 text-[13px] font-semibold text-[#7a4a0b]">{d.status === "approved" ? t("অনুমোদিত", "Approved") : d.status === "needs-changes" ? t("ঠিক করতে হবে", "Needs changes") : t("অনুমোদনের অপেক্ষায়", "Waiting for approval")}</span>
                  : <span className="inline-flex items-center gap-1 text-[13.5px] text-[#4d5664]"><Clock className="size-4" /> {t("পরের ধাপ", "Next")}: {t(...STEP_TITLE[stepOf(d.step)])}</span>}
                <Ghost onClick={() => open(d.id, submitted)} className="h-10">{submitted ? t("স্ট্যাটাস", "Status") : t("চালিয়ে যান", "Continue")}</Ghost>
                {submitted && <Link href="/hms" onClick={() => { update((s) => { s.current = d.id; }); setProperty(d.slug); }} className="inline-flex h-10 items-center rounded-xl bg-[#0f1720] px-4 text-[14.5px] font-semibold text-white">{t("HMS খুলুন", "Open HMS")}</Link>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-8 text-[14px] text-[#4d5664]">{t("অনেকগুলো property একসাথে? Enterprise প্ল্যান BinGi টিম সেটআপ করে দেয় — উপরে সাহায্য চাপুন।", "Several properties as a group? BinGi sets up Enterprise with you — tap Help above.")}</p>
    </main>
  );
}
