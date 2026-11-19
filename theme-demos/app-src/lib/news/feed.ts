"use client";
// BinGi news — messages from BinGi (Super Admin) to every hotel: server updates, new features, notices.
// Prototype: the feed is demo data built around the real clock (Asia/Dhaka). In the product it comes from
// Super Admin (GET /platform/news) and is the same for every property; "seen" / "hidden" are per user.
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

export type NewsKind = "maintenance" | "update" | "notice" | "incident";
export type Impact = { module: string; en: string; bn: string };
export type News = {
  id: string;
  kind: NewsKind;
  title: string;
  titleBn: string;
  body: string;
  bodyBn: string;
  published: number; // ms
  start?: number; // maintenance / incident window
  end?: number;
  impact?: Impact[];
  link?: { label: string; href: string };
};
export type Phase = "upcoming" | "soon" | "live" | "done" | "past";

const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR, DHAKA = 6 * HOUR;
/** Midnight today in Dhaka, as a UTC timestamp. */
const dhakaMidnight = (now: number) => Math.floor((now + DHAKA) / DAY) * DAY - DHAKA;

export const KIND_LABEL: Record<NewsKind, string> = { maintenance: "Server update", update: "New feature", notice: "Notice", incident: "Service issue" };

/** Demo feed, rebuilt from "now" so the banners and countdowns are real. */
export function buildFeed(now: number, demo: Demo | null): News[] {
  const mid = dhakaMidnight(now);
  // 02:00–02:30 Dhaka slot: this morning's until 12 h after it ended ("finished" banner), then tonight's.
  let start = now < mid + 14 * HOUR + 30 * MIN ? mid + 2 * HOUR : mid + 26 * HOUR;
  let end = start + 30 * MIN;
  if (demo && now < demo.end) { start = demo.start; end = demo.end; }
  return [
    {
      id: "srv-2026-11-calendar",
      kind: "maintenance",
      title: "Server update: faster booking calendar",
      titleBn: "সার্ভার আপডেট: বুকিং ক্যালেন্ডার আরও দ্রুত",
      body: "We are moving the booking database to a faster server. Most screens keep working. Please don't start a check-out or a refund in the last 5 minutes before the update.",
      bodyBn: "বুকিং ডাটাবেস দ্রুত সার্ভারে নেওয়া হচ্ছে। বেশিরভাগ স্ক্রিন চালু থাকবে। আপডেটের আগের ৫ মিনিটে চেক-আউট বা রিফান্ড শুরু করবেন না।",
      published: Math.min(now, start - 20 * HOUR),
      start, end,
      impact: [
        { module: "Bookings", en: "Saving may pause for up to 2 minutes", bn: "সেভ হতে সর্বোচ্চ ২ মিনিট থামতে পারে" },
        { module: "Payments", en: "Online payments wait and retry by themselves", bn: "অনলাইন পেমেন্ট নিজে থেকেই আবার চেষ্টা করবে" },
        { module: "Website", en: "Booking page shows “back in a few minutes”", bn: "বুকিং পেজে “কয়েক মিনিটে ফিরে আসছি” দেখাবে" },
        { module: "Restaurant & others", en: "No change", bn: "কোনো পরিবর্তন নেই" },
      ],
    },
    {
      id: "upd-2026-11-money",
      kind: "update",
      title: "New: Payments, Expenses, Finance and Reports",
      titleBn: "নতুন: পেমেন্ট, খরচ, ফাইন্যান্স ও রিপোর্ট",
      body: "One place to see every payment, approve expenses, follow money paid online through BinGi, and print 12 ready reports.",
      bodyBn: "সব পেমেন্ট এক জায়গায়, খরচ অনুমোদন, BinGi-র মাধ্যমে অনলাইনে আসা টাকা আর ১২টা তৈরি রিপোর্ট।",
      published: Math.min(now - 5 * MIN, mid + 8 * HOUR),
      link: { label: "Open Payments", href: "/hms/payments" },
    },
    {
      id: "inc-2026-11-sms",
      kind: "incident",
      title: "SMS delay on one mobile operator — fixed",
      titleBn: "একটি মোবাইল অপারেটরে SMS দেরি — ঠিক হয়েছে",
      body: "Some booking SMS were late for about 40 minutes. They were all sent again. Emails were not affected.",
      bodyBn: "কিছু বুকিং SMS প্রায় ৪০ মিনিট দেরিতে গেছে। সবগুলো আবার পাঠানো হয়েছে। ইমেইলে সমস্যা হয়নি।",
      published: mid - 14 * HOUR,
      start: mid - 14 * HOUR, end: mid - 13 * HOUR - 20 * MIN,
      link: { label: "Check message history", href: "/hms/communication?tab=history" },
    },
    {
      id: "srv-2026-11-security",
      kind: "maintenance",
      title: "Server update: security patches",
      titleBn: "সার্ভার আপডেট: নিরাপত্তা আপডেট",
      body: "Routine security update. Finished on time, nothing for you to do.",
      bodyBn: "নিয়মিত নিরাপত্তা আপডেট। সময়মতো শেষ হয়েছে, আপনার কিছু করার নেই।",
      published: mid - 5 * DAY,
      start: mid - 4 * DAY + 2 * HOUR, end: mid - 4 * DAY + 2 * HOUR + 20 * MIN,
    },
    {
      id: "ntc-2026-11-docs",
      kind: "notice",
      title: "Help guides are now on bingi.app/docs",
      titleBn: "সাহায্যের গাইড এখন bingi.app/docs-এ",
      body: "Short guides for every module. Share the link with new staff.",
      bodyBn: "প্রতিটা মডিউলের ছোট গাইড। নতুন স্টাফদের লিংকটা দিন।",
      published: mid - 2 * DAY,
    },
  ].sort((a, b) => b.published - a.published) as News[];
}

export function phaseOf(n: News, now: number): Phase {
  if (n.start == null || n.end == null) return now - n.published < 7 * DAY ? "done" : "past";
  if (now < n.start - HOUR) return "upcoming";
  if (now < n.start) return "soon";
  if (now < n.end) return "live";
  if (now < n.end + 12 * HOUR) return "done";
  return "past";
}

// ---------------- per-user state (seen popups, hidden banners, demo) ----------------
type Demo = { start: number; end: number };
type UserState = { seen: string[]; hidden: string[]; demo: Demo | null };
const KEY = "hms-news-v1";
const subs = new Set<() => void>();
const raw = () => { try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; } };
const parse = (r: string): UserState => { try { const x = JSON.parse(r); return { seen: x.seen ?? [], hidden: x.hidden ?? [], demo: x.demo ?? null }; } catch { return { seen: [], hidden: [], demo: null }; } };
function save(f: (s: UserState) => void) {
  const s = parse(raw()); f(s);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  subs.forEach((x) => x());
}

/** Ticks so banners move from "tonight" → "in 40 min" → "live" → "done" without a reload. */
export function useNow(ms = 15_000) {
  // 0 until mounted: the clock is read in the browser only (no prerendered time).
  const [now, setNow] = useState(0);
  useEffect(() => { const tick = () => setNow(Date.now()); const f = setTimeout(tick, 0); const t = setInterval(tick, ms); return () => { clearTimeout(f); clearInterval(t); }; }, [ms]);
  return now;
}

export function useNews() {
  const r = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, raw, () => "");
  const u = useMemo(() => parse(r), [r]);
  const now = useNow();
  const feed = useMemo(() => (now ? buildFeed(now, u.demo) : []), [now, u.demo]);
  return {
    now, feed, user: u,
    phase: (n: News) => phaseOf(n, now),
    markSeen: (id: string) => save((s) => { if (!s.seen.includes(id)) s.seen.push(id); }),
    hide: (key: string) => save((s) => { if (!s.hidden.includes(key)) s.hidden.push(key); }),
    startDemo: (mins = 10) => save((s) => { const t = Date.now(); s.demo = { start: t - MIN, end: t + mins * MIN }; s.hidden = s.hidden.filter((k) => !k.startsWith("srv-2026-11-calendar")); }),
    endDemo: () => save((s) => { s.demo = null; }),
  };
}

// ---------------- time text (always Dhaka time) ----------------
const tf = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "numeric", minute: "2-digit", hour12: true });
const df = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short" });
export const clock = (t: number) => tf.format(t).replace(" ", "").toUpperCase().replace(":00", "");
export function whenText(t: number, now: number) {
  const d = dhakaMidnight(t), today = dhakaMidnight(now);
  const day = d === today ? "today" : d === today + DAY ? (new Date(t + DHAKA).getUTCHours() < 6 ? "tonight" : "tomorrow") : d === today - DAY ? "yesterday" : df.format(t);
  return `${day} ${clock(t)}`;
}
export function inText(ms: number) {
  if (ms <= 0) return "now";
  const m = Math.ceil(ms / MIN);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim();
}
export const minutes = (n: News) => (n.start != null && n.end != null ? Math.round((n.end - n.start) / MIN) : 0);
