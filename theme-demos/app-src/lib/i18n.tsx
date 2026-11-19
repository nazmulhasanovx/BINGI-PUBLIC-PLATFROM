"use client";

// UI language (English / বাংলা) for the site chrome: navigation, buttons, booking labels.
// Hotel content (room names, descriptions) comes from HMS in the language the hotel entered;
// bilingual content fields are planned in the data contract.
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

export type Lang = "en" | "bn";

const BN: Record<string, string> = {
  Home: "হোম",
  Rooms: "রুম",
  Dining: "খাবার",
  Experiences: "অভিজ্ঞতা",
  Offers: "অফার",
  Explore: "পরিচিতি",
  Events: "ইভেন্ট",
  Policies: "নীতিমালা",
  "My Trip": "আমার ট্রিপ",
  Menu: "মেনু",
  "Book your stay": "বুকিং করুন",
  Book: "বুক",
  "Check rooms": "রুম দেখুন",
  "See rooms": "রুম দেখুন",
  "Check-in": "চেক-ইন",
  "Check-out": "চেক-আউট",
  Guests: "অতিথি",
  Adults: "প্রাপ্তবয়স্ক",
  Children: "শিশু",
  "Age 13+": "১৩+ বছর",
  "Age 0–12": "০–১২ বছর",
  "Add date": "তারিখ দিন",
  "Add your dates": "তারিখ দিন",
  "Your stay": "আপনার থাকা",
  "Rooms from": "রুম শুরু",
  "/ night": "/ রাত",
  from: "শুরু",
  Select: "বাছাই",
  Reserve: "রিজার্ভ",
  Continue: "এগিয়ে যান",
  "Book now": "বুক করুন",
  Visit: "ঘুরে দেখুন",
  Contact: "যোগাযোগ",
  "All rooms": "সব রুম",
  "All offers": "সব অফার",
  "All experiences": "সব অভিজ্ঞতা",
  "Explore the resort": "রিসোর্ট ঘুরে দেখুন",
  "View menu": "মেনু দেখুন",
  "Request a table": "টেবিল চাই",
  "Get directions": "দিকনির্দেশ",
  Call: "কল",
  "Guest reviews": "অতিথিদের মতামত",
  "Find us": "আমাদের ঠিকানা",
  "Rooms, suites & villas": "রুম, স্যুট ও ভিলা",
  "Life here": "এখানকার জীবন",
  "Simple, slow and comfortable": "সহজ, ধীর আর আরামদায়ক",
  "Add to your stay": "থাকার সাথে যোগ করুন",
  "Meals, walks and pickup": "খাবার, হাঁটা আর পিকআপ",
  "Add these when you book, or ask the host.": "বুক করার সময় যোগ করুন, অথবা হোস্টকে জিজ্ঞেস করুন।",
  "Getting here": "কীভাবে আসবেন",
  "See rooms & prices": "রুম ও দাম দেখুন",
  "Message the host": "হোস্টকে মেসেজ দিন",
  "Your host": "আপনার হোস্ট",
  "Choose your room": "আপনার রুম বেছে নিন",
  "Location": "লোকেশন",
  "Direct booking": "সরাসরি বুকিং",
  "Work": "কাজ",
  "Unwind": "বিশ্রাম",
  "Ask for a quote": "দাম জানতে চান",
  "Explore the hotel": "হোটেল ঘুরে দেখুন",
  "From": "শুরু",
  "Rooms & villas": "রুম ও ভিলা",
  "The home": "বাড়ি",
  "Apartments": "অ্যাপার্টমেন্ট",
  "Beds & dorms": "বেড ও ডর্ম",
  "Places to stay": "থাকার জায়গা",
  "Eat well, slow down": "ভালো খাবার, ধীর ছুটি",
  "Book direct, pay less": "সরাসরি বুক করুন, কম দিন",
  "Free cancellation": "ফ্রি বাতিল",
  "Pay at the hotel": "হোটেলে পেমেন্ট",
  "Pay on arrival": "পৌঁছে পেমেন্ট",
  About: "সম্পর্কে",
  "/ bed / night": "/ বেড / রাত",
  "/ room / night": "/ রুম / রাত",
  "Book this cottage": "এই কটেজ বুক করুন",
  "Book the villa": "ভিলা বুক করুন",
  "Per night": "প্রতি রাত",
  "About / month": "প্রায় / মাস",
  "From / night": "শুরু / রাত",
  "Add to stay": "বুকিংয়ে যোগ করুন",
  "add when you book": "বুক করার সময় যোগ করুন",
  "Dorm beds": "ডর্ম বেড",
  "Private rooms": "প্রাইভেট রুম",
  "Prices and free rooms update after you pick dates.": "তারিখ দিলে খালি রুম আর দাম দেখাবে।",
  "Website & booking by": "ওয়েবসাইট ও বুকিং:",
  Language: "ভাষা",
  Stay: "থাকা",
  Hotel: "হোটেল",
};

const listeners = new Set<() => void>();
const KEY = "bingi-lang";
function get(): Lang {
  try {
    return localStorage.getItem(KEY) === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function setLang(l: Lang) {
  try {
    localStorage.setItem(KEY, l);
  } catch {}
  listeners.forEach((f) => f());
}
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, get, () => "en");
}
export function useT() {
  const lang = useLang();
  return (s: string) => (lang === "bn" ? BN[s] ?? s : s);
}

/** <T>Check rooms</T> — renders English on the server, switches after load if the guest chose বাংলা. */
export function T({ children }: { children: string }) {
  return <>{useT()(children)}</>;
}

/** Keeps <html lang> in sync for screen readers and fonts. */
export function LangSync() {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}

export function LangToggle({ className = "" }: { className?: string }): ReactNode {
  const lang = useLang();
  return (
    <div role="group" aria-label="Language" className={`inline-flex rounded-full border border-line bg-surface p-0.5 text-[13px] font-semibold ${className}`}>
      {(["en", "bn"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`h-7 rounded-full px-2.5 ${lang === l ? "bg-ink text-canvas" : "text-muted hover:text-ink"}`}
        >
          {l === "en" ? "EN" : "বাং"}
        </button>
      ))}
    </div>
  );
}
