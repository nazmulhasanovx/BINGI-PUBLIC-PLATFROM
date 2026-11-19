"use client";
// Chat — one conversation per booking (live HMS), plus website enquiries before a booking exists.
// Owns: threads and messages. Quick replies, payment note and location are edited here but stored in Settings
// (messages.shortcuts / paymentNote / location) so the booking page uses the same ones (D6).
// Prototype: guest messages are demo data; production: chat_threads, chat_messages (guest app + website widget).
import { useCallback, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";

export type ChatMsg = { id: string; at: string; from: "guest" | "staff"; text: string; by?: string };
export type Thread = { id: string; booking?: string; guest: string; contact?: string; enquiry?: boolean; msgs: ChatMsg[]; readAt?: string; closed?: boolean };
type State = { v: 1; threads: Thread[]; next: number };
export type Ref = { code: string; guest: string; status: string; from: string; channel: string; created: string };

export const ME = "Md Yeapas";
const add = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const lastOf = (t: Thread) => t.msgs.at(-1);
/** Unread = guest messages after the last time staff opened the thread. */
export const unreadOf = (t: Thread) => t.msgs.filter((m) => m.from === "guest" && (!t.readAt || m.at > t.readAt)).length;

const Q: [string, string][] = [
  ["Hi, can I check in early? Our flight lands at 9 am.", "Early check-in depends on the room being ready. We'll try our best and message you on the day."],
  ["Is breakfast included?", "Yes, breakfast is included for all guests, 7–10 am."],
  ["Do you have airport pickup?", ""],
  ["Can we get a baby cot in the room?", "Of course — we'll set one up before you arrive."],
  ["How do I pay the advance?", ""],
  ["Is there parking?", "Yes, free parking for guests."],
];
function seed(refs: Ref[]): State {
  const threads: Thread[] = [];
  let n = 1;
  refs.filter((r) => r.status === "Confirmed" || r.status === "Checked in").slice(0, 9).forEach((r, i) => {
    const [q, a] = Q[i % Q.length];
    const day = r.created.slice(0, 10) <= TODAY ? r.created.slice(0, 10) : TODAY;
    const msgs: ChatMsg[] = [{ id: `c${n++}`, at: `${day}T${String(10 + (i % 8)).padStart(2, "0")}:1${i % 6}`, from: "guest", text: q }];
    if (a) msgs.push({ id: `c${n++}`, at: `${day}T${String(10 + (i % 8)).padStart(2, "0")}:3${i % 6}`, from: "staff", text: a, by: i % 2 ? "Rahim (Front desk)" : ME });
    if (i === 1) msgs.push({ id: `c${n++}`, at: `${TODAY}T08:4${i}`, from: "guest", text: "Thank you! Can we also get a late check-out?" });
    threads.push({ id: `t-${r.code}`, booking: r.code, guest: r.guest, msgs, readAt: a && i !== 1 ? msgs.at(-1)!.at : undefined });
  });
  threads.push({ id: "t-enq-1", guest: "Farhana Akter", contact: "01712-345678", enquiry: true, msgs: [{ id: `c${n++}`, at: `${TODAY}T09:20`, from: "guest", text: "Do you have a family room for 2 adults and 2 kids on 20–22 Dec?" }] });
  threads.push({ id: "t-enq-2", guest: "James Carter", contact: "james.carter@example.com", enquiry: true, msgs: [{ id: `c${n++}`, at: `${add(TODAY, -2)}T18:05`, from: "guest", text: "What is your best rate for a week in January?" }, { id: `c${n++}`, at: `${add(TODAY, -2)}T18:40`, from: "staff", text: "Thanks James — for 7 nights we can offer 10% off. Shall I hold a room?", by: ME }], readAt: `${add(TODAY, -2)}T18:40` });
  return { v: 1, threads, next: n };
}

const KEY = (slug: string) => `bingi-chat-v1-${slug}`;
const cache = new Map<string, { raw: string | null; sig: string; st: State }>();
const seeds = new Map<string, State>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const EMPTY: State = { v: 1, threads: [], next: 1 };
function read(h: Hotel, refs: Ref[]): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(h.slug)); } catch {}
  const sk = `${h.slug}|${refs.map((r) => r.code).join(",")}`;
  const hit = cache.get(h.slug);
  if (hit && hit.raw === raw && (raw || hit.sig === sk)) return hit.st;
  if (!seeds.has(sk)) seeds.set(sk, seed(refs));
  let st = seeds.get(sk)!;
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 1 && Array.isArray(p.threads)) st = p; } catch {}
  cache.set(h.slug, { raw, sig: sk, st });
  return st;
}
function write(slug: string, st: State) { const raw = JSON.stringify(st); try { localStorage.setItem(KEY(slug), raw); } catch {} cache.set(slug, { raw, sig: cache.get(slug)?.sig ?? "", st }); listeners.forEach((l) => l()); }
const stamp = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;

export function useChat(h: Hotel, refs: Ref[]) {
  const st = useSyncExternalStore(sub, () => read(h, refs), () => EMPTY);
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h, refs)); fn(n); write(h.slug, n); }, [h, refs]);
  return {
    st, unread: st.threads.reduce((s, t) => s + (t.closed ? 0 : unreadOf(t)), 0),
    send: (id: string, text: string) => update((s) => { const t = s.threads.find((x) => x.id === id); if (!t) return; const at = stamp(); t.msgs.push({ id: `c${s.next++}`, at, from: "staff", text, by: ME }); t.readAt = at; t.closed = false; }),
    read: (id: string) => update((s) => { const t = s.threads.find((x) => x.id === id); if (t && unreadOf(t)) t.readAt = lastOf(t)!.at; }),
    /** Start a conversation on a booking that has none yet. Returns the thread id. */
    open: (r: { code: string; guest: string }) => { const id = `t-${r.code}`; if (!read(h, refs).threads.some((t) => t.id === id)) update((s) => { s.threads.unshift({ id, booking: r.code, guest: r.guest, msgs: [] }); }); return id; },
    setClosed: (id: string, closed: boolean) => update((s) => { const t = s.threads.find((x) => x.id === id); if (t) t.closed = closed; }),
    /** Link a website enquiry to the booking made for it. */
    link: (id: string, code: string) => update((s) => { const t = s.threads.find((x) => x.id === id); if (t) { t.booking = code; t.enquiry = false; } }),
    /** Demo only: a guest writes from the guest app / website widget. */
    simulate: (id: string, text: string) => update((s) => { const t = s.threads.find((x) => x.id === id); if (t) t.msgs.push({ id: `c${s.next++}`, at: stamp(), from: "guest", text }); }),
  };
}
export type Chat = ReturnType<typeof useChat>;
