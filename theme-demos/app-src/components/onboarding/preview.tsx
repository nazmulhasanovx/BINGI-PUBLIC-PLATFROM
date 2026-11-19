"use client";
// Right column (desktop ≥1280): how guests will see the listing, filled live from the answers, plus a tip for the current step.
// It is a sample card: nothing is published until BinGi approves the property.
import { BedDouble, Clock, ImageIcon, Lightbulb, MapPin, ShieldCheck, Wallet } from "lucide-react";
import type { Category } from "@/lib/rooms/store";
import { num, stepOf, useL, type Draft, type StepId } from "@/lib/onboarding/store";
import { TYPE_META } from "./types";

const POLICY: Record<string, [string, string]> = { flexible: ["নমনীয় বাতিল", "Flexible cancellation"], moderate: ["মাঝারি বাতিল", "Moderate cancellation"], strict: ["কড়া বাতিল", "Strict cancellation"] };

const TIP: Partial<Record<StepId, [string, string]>> = {
  "1.1": ["ধরন দেখে পরের প্রশ্নগুলো আপনা-আপনি সাজানো হয় — যেমন রিসোর্টে কটেজ/ভিলা।", "The type sets up the next questions — e.g. cottages and villas for a resort."],
  "1.2": ["গেস্টরা যে নাম চেনে সেটাই দিন। এটাই ওয়েবসাইট আর মার্কেটপ্লেসে দেখাবে।", "Use the name guests know. It shows on your website and the marketplace."],
  "1.3": ["সঠিক পিন দিলে গেস্ট ম্যাপে সহজে খুঁজে পায়।", "An exact pin helps guests find you on the map."],
  "1.4": ["রেস্টুরেন্ট/বার বাছলে রেস্টুরেন্ট টুল আপনা-আপনি চালু হবে।", "Picking Restaurant/Bar turns on the restaurant tool for you."],
  "2.1": ["যা যা ভাড়া দেন সব বাছুন — পরে আলাদা আলাদা নম্বর পাবে।", "Pick everything you rent — each gets its own numbers."],
  "2.2": ["নম্বর আমরা বানিয়ে দিই — 101, 102… বা C01, C02… নিজে লিখতে হবে না।", "We make the numbers for you — 101, 102… or C01, C02…"],
  "2.3": ["একটা ধরন যোগ করুন, তারপর আরেকটা। ছবি পরে HMS-এ দেবেন।", "Add one type, then the next. Photos come later in HMS."],
  "3.1": ["বেশিরভাগ হোটেল মাঝারি বাতিল নিয়ম রাখে — গেস্ট ও আপনার দুজনের জন্যই নিরাপদ।", "Most hotels use moderate cancellation — fair to guests and to you."],
  "4.1": ["যা চালান না বন্ধ রাখুন — মেনু ছোট থাকবে। পরে যেকোনো সময় চালু করা যায়।", "Turn off what you don't run — a shorter menu. Turn on anytime."],
  "4.2": ["টিম এখনই না দিলেও চলবে — ড্যাশবোর্ড থেকে পরে দাওয়াত দিতে পারবেন।", "You can invite your team later from the dashboard."],
  "5.1": ["নগদ সবসময় চালু। অনলাইন পেমেন্ট BinGi যাচাইয়ের পর চালু হয়।", "Cash is always on. Online payments start after BinGi verifies you."],
  "5.2": ["থিম পরে যেকোনো সময় বদলানো যায় — লেখা, ছবি সব থাকবে।", "You can change the theme anytime — your text and photos stay."],
  "6.2": ["কাগজ এখন না থাকলে পরে দিন। যাচাই শেষ হলে অনলাইন বুকিং খোলে।", "No papers now? Add them later. Online booking opens after verification."],
};

export function GuestPreview({ d, cats, units }: { d: Draft; cats: Category[]; units: number }) {
  const { t, lang } = useL();
  const type = TYPE_META.find((x) => x.slug === d.propertyType);
  const from = cats.length ? Math.min(...cats.map((c) => c.baseRate).filter((x) => x > 0)) : 0;
  const money = (v: number) => `৳${num(v.toLocaleString("en-IN"), lang)}`;
  const place = [d.area, d.city].filter(Boolean).join(", ");
  const pays = [d.pay.cash && t("নগদ", "Cash"), d.pay.bkash && "bKash", d.pay.nagad && "Nagad", d.pay.bank && t("ব্যাংক", "Bank")].filter(Boolean).join(" · ");
  const tip = TIP[stepOf(d.step)];
  const TypeIcon = type?.icon ?? BedDouble;
  return (
    <div className="space-y-4">
      <p className="text-[13px] font-semibold text-[#4d5664]">{t("অতিথিরা যেভাবে দেখবেন", "What guests will see")} <span className="font-normal">· {t("নমুনা", "sample")}</span></p>
      <div className="overflow-hidden rounded-xl border border-[#e3e7ec] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
        <div className="relative grid aspect-[16/10] place-items-center bg-[#e9edf2] text-[#4d5664]">
          <span className="flex flex-col items-center gap-1.5 text-[12.5px]"><ImageIcon className="size-7" strokeWidth={1.5} />{t("ছবি পরে HMS-এ দেবেন", "Photos are added later in HMS")}</span>
          {type && <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[12px] font-semibold text-[#0f1720] shadow-sm"><TypeIcon className="size-3.5" />{t(type.bn, type.en)}</span>}
        </div>
        <div className="space-y-2.5 p-4">
          <div>
            <p className={d.name ? "text-[17px] font-semibold" : "text-[17px] font-semibold text-[#6b7280]"}>{d.name || t("আপনার property-র নাম", "Your property name")}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[13.5px] text-[#4d5664]"><MapPin className="size-3.5 shrink-0" />{place || t("এলাকা, শহর", "Area, city")}</p>
          </div>
          <ul className="space-y-1.5 border-t border-[#e3e7ec] pt-2.5 text-[13.5px] text-[#4d5664]">
            <li className="flex items-center gap-2"><BedDouble className="size-4 shrink-0 text-[#8a909c]" />{units ? t(`${num(units, lang)}টা রুম · ${num(cats.length, lang)} ধরন`, `${units} rooms · ${cats.length} types`) : t("রুম এখনো যোগ হয়নি", "No rooms yet")}</li>
            {d.policy.preset && <li className="flex items-center gap-2"><ShieldCheck className="size-4 shrink-0 text-[#8a909c]" />{t(...POLICY[d.policy.preset])}</li>}
            {d.seen.includes("3.1") && <li className="flex items-center gap-2"><Clock className="size-4 shrink-0 text-[#8a909c]" />{t("চেক-ইন", "Check-in")} {num(d.policy.checkIn, lang)} · {t("চেক-আউট", "Check-out")} {num(d.policy.checkOut, lang)}</li>}
            {d.seen.includes("5.1") && pays && <li className="flex items-center gap-2"><Wallet className="size-4 shrink-0 text-[#8a909c]" />{pays}</li>}
          </ul>
          <div className="flex items-end justify-between border-t border-[#e3e7ec] pt-2.5">
            {from ? <p className="text-[13px] text-[#4d5664]">{t("শুরু", "From")} <b className="text-[18px] text-[#0f1720]">{money(from)}</b> /{t("রাত", "night")}</p> : <p className="text-[13px] text-[#6b7280]">{t("দাম রুম যোগ করলে দেখাবে", "Price shows after rooms")}</p>}
          </div>
        </div>
      </div>
      {tip && (
        <div className="flex gap-2.5 rounded-xl bg-[#e9edf2] p-3.5 text-[13.5px] leading-relaxed text-[#4d5664]">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#b7791f]" />
          <p>{t(...tip)}</p>
        </div>
      )}
    </div>
  );
}
