"use client";
// Chat (live HMS: Messages list with All / Unread + search, one conversation per booking).
// Added: Enquiries filter, booking card beside the conversation, quick replies + payment details + location +
// online check-in link in the composer (D6: managed here), unread badge in the sidebar.
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, Link2, MapPin, MessageSquare, Pencil, Plus, Search, Send, X, Zap } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { channelLabel, dmy, dueOf, payState, timeOf, tk, useBookings } from "@/lib/bookings/store";
import { precheckUrl } from "@/lib/bookings/docs";
import { useGuestNames } from "@/lib/guests/store";
import { useSettings } from "@/lib/settings/store";
import { lastOf, unreadOf, useChat, type Ref, type Thread } from "@/lib/chat/store";
import { useProperty } from "../property";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";

/** Chat data for any screen (also the sidebar badge). */
export function useChatData() {
  const h = useProperty();
  const bk = useBookings(h);
  const gmap = useGuestNames(h);
  const refs: Ref[] = useMemo(() => bk.list.map((b) => ({ code: b.code, guest: gmap.get(b.guestId)?.name ?? "Guest", status: b.status, from: b.from, channel: b.channel, created: b.created })), [bk.list, gmap]);
  const chat = useChat(h, refs);
  return { h, bk, gmap, chat };
}
export function ChatBadge({ active }: { active: boolean }) {
  const { chat } = useChatData();
  if (!chat.unread) return null;
  return <span aria-label={`${chat.unread} unread`} className={clsx("grid size-5 place-items-center rounded-full text-[11px] font-semibold", active ? "bg-white/20" : "bg-hms-coral-soft text-hms-red")}>{chat.unread}</span>;
}

type Filter = "all" | "unread" | "enquiries";
const ago = (at: string) => (at.startsWith(TODAY) ? timeOf(at) : dmy(at.slice(0, 10)).slice(0, 6));

export function ChatPage() {
  const { h, bk, gmap, chat } = useChatData();
  const set = useSettings(h);
  const sp = useSearchParams();
  const router = useRouter();
  const [f, setF] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [newChat, setNewChat] = useState(false);
  const [manage, setManage] = useState(false);
  const cur = sp.get("t") ?? "";
  const pick = (id: string) => router.replace(id ? `/hms/chat?t=${id}` : "/hms/chat", { scroll: false });
  // open a booking's conversation straight from the booking page: /hms/chat?b=BK-…
  const fromBooking = sp.get("b");
  useEffect(() => {
    if (!fromBooking) return;
    const b = bk.list.find((x) => x.code === fromBooking);
    if (b) pick(chat.open({ code: b.code, guest: gmap.get(b.guestId)?.name ?? "Guest" }));
  }, [fromBooking]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = q.trim().toLowerCase();
  const list = chat.st.threads
    .filter((t) => (f === "all" ? true : f === "unread" ? unreadOf(t) > 0 : t.enquiry) && (!s || [t.guest, t.booking ?? "", t.contact ?? "", lastOf(t)?.text ?? ""].some((x) => x.toLowerCase().includes(s))))
    .sort((a, b) => (lastOf(b)?.at ?? "").localeCompare(lastOf(a)?.at ?? ""));
  const t = chat.st.threads.find((x) => x.id === cur);
  useEffect(() => { if (t && unreadOf(t)) chat.read(t.id); }, [t?.id, t?.msgs.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = { all: chat.st.threads.length, unread: chat.st.threads.filter((x) => unreadOf(x) > 0).length, enquiries: chat.st.threads.filter((x) => x.enquiry).length };

  return (
    <div className="flex h-full min-h-0">
      <aside className={clsx("flex w-full min-w-0 flex-col border-r border-hms-line bg-white md:w-[340px] md:shrink-0", t && "hidden md:flex")}>
        <div className="flex items-center gap-2 px-4 pb-2 pt-4">
          <h1 className="flex-1 text-[22px] font-bold">Chat</h1>
          <button onClick={() => setManage(true)} className={clsx(btnLine, "h-9 px-3")} aria-label="Quick replies"><Zap className="size-4" aria-hidden /><span className="hidden lg:inline">Quick replies</span></button>
          <button onClick={() => setNewChat(true)} className={clsx(btnPrimary, "h-9 px-3")} aria-label="New conversation"><Plus className="size-4" aria-hidden /></button>
        </div>
        <div className="flex gap-1.5 px-4" role="group" aria-label="Show">
          {([["all", "All"], ["unread", "Unread"], ["enquiries", "Enquiries"]] as [Filter, string][]).map(([k, l]) => <button key={k} aria-pressed={f === k} onClick={() => setF(k)} className={clsx("h-8 rounded-full border px-3 text-[13px] font-medium", f === k ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line hover:bg-hms-hover")}>{l} {counts[k]}</button>)}
        </div>
        <label className="relative mx-4 mt-2"><span className="sr-only">Search conversations</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Guest, booking or text" className={clsx(input, "h-10 pl-9")} /></label>
        <ul className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 && <li className="p-6 text-center text-[14px] text-hms-muted">{f === "unread" ? "All caught up." : "No conversations."}</li>}
          {list.map((x) => { const last = lastOf(x); const u = unreadOf(x); const b = x.booking ? bk.list.find((y) => y.code === x.booking) : undefined; return (
            <li key={x.id}><button onClick={() => pick(x.id)} aria-current={x.id === cur ? "true" : undefined} className={clsx("flex w-full items-start gap-3 border-b border-hms-line px-4 py-3 text-left", x.id === cur ? "bg-hms-coral-soft/50" : "hover:bg-[#f8f9fb]")}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-hms-hover text-[13px] font-semibold">{x.guest.slice(0, 2).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><b className={clsx("min-w-0 flex-1 truncate text-[14.5px]", u ? "font-bold" : "font-semibold")}>{x.guest}</b>{last && <span className="shrink-0 text-[12px] text-hms-muted">{ago(last.at)}</span>}</span>
                <span className="block truncate text-[12.5px] text-hms-muted">{x.enquiry ? <span className="mr-1 rounded bg-hms-blue-soft px-1.5 py-0.5 text-[11px] font-semibold text-hms-blue">ENQUIRY</span> : null}{x.booking ?? x.contact}{b ? ` · ${b.status}` : ""}</span>
                <span className="flex items-center gap-2"><span className={clsx("min-w-0 flex-1 truncate text-[13px]", u ? "text-hms-ink" : "text-hms-muted")}>{last ? `${last.from === "staff" ? "You: " : ""}${last.text}` : "No messages yet"}</span>{u > 0 && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-hms-red text-[11px] font-semibold text-white">{u}</span>}</span>
              </span>
            </button></li>
          ); })}
        </ul>
      </aside>
      <section className={clsx("min-w-0 flex-1", !t && "hidden md:block")}>
        {t ? <Conversation key={t.id} t={t} back={() => pick("")} /> : (
          <div className="grid h-full place-items-center p-6 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-hms-hover"><MessageSquare className="size-6 text-hms-muted" aria-hidden /></span><p className="mt-3 text-[16px] font-semibold">Pick a conversation</p><p className="text-[14px] text-hms-muted">Every booking has its own chat.</p></div></div>
        )}
      </section>
      {newChat && <NewChat onClose={() => setNewChat(false)} start={(code) => { const b = bk.list.find((x) => x.code === code)!; const id = chat.open({ code, guest: gmap.get(b.guestId)?.name ?? "Guest" }); setNewChat(false); pick(id); }} />}
      {manage && <Manage onClose={() => setManage(false)} h={h} set={set} />}
    </div>
  );

  function NewChat({ onClose, start }: { onClose: () => void; start: (code: string) => void }) {
    const open = bk.list.filter((b) => b.status === "Confirmed" || b.status === "Checked in");
    const [code, setCode] = useState(open[0]?.code ?? "");
    return (
      <Sheet title="New conversation" onClose={onClose} footer={<button disabled={!code} onClick={() => start(code)} className={clsx(btnPrimary, "flex-1")}>Open chat</button>}>
        <label htmlFor="nc" className={lbl}>Booking</label>
        <select id="nc" value={code} onChange={(e) => setCode(e.target.value)} className={input}>{open.map((b) => <option key={b.code} value={b.code}>{b.code} · {gmap.get(b.guestId)?.name ?? "Guest"} · {dmy(b.from)}</option>)}</select>
        <p className="mt-2 text-[13px] text-hms-muted">The guest sees it in the guest app and on their booking page.</p>
      </Sheet>
    );
  }
}

function Conversation({ t, back }: { t: Thread; back: () => void }) {
  const { h, bk, gmap, chat } = useChatData();
  const { st: s } = useSettings(h);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [t.msgs.length]);
  const b = t.booking ? bk.list.find((x) => x.code === t.booking) : undefined;
  const g = b ? gmap.get(b.guestId) : undefined;
  const methods = s.payments.filter((p) => p.enabled && p.kind !== "cash" && p.account.trim());
  const payText = [s.messages.paymentNote.trim(), ...methods.map((m) => `${m.name}: ${m.account}`), b && dueOf(b) > 0 ? `Amount due: ${tk(dueOf(b))} (booking ${b.code})` : ""].filter(Boolean).join("\n");
  const add = (x: string) => setText((v) => (v ? `${v}\n${x}` : x));
  const send = () => { const v = text.trim(); setErr(""); if (!v) return; if (v.length > 2000) return setErr("Keep it under 2,000 characters"); chat.send(t.id, v); setText(""); };
  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-hms-line bg-white px-4 py-3">
          <button onClick={back} className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover md:hidden" aria-label="Back to conversations"><ArrowLeft className="size-5" aria-hidden /></button>
          <div className="min-w-0 flex-1"><b className="block truncate text-[16px]">{t.guest}</b><span className="block truncate text-[13px] text-hms-muted">{t.enquiry ? `Enquiry · ${t.contact}` : `${t.booking}${b ? ` · ${b.unit ? `Room ${b.unit} · ` : ""}${dmy(b.from)} → ${dmy(b.to)}` : ""}`}</span></div>
          {b && <Link href={`/hms/bookings/view?b=${b.code}&from=${encodeURIComponent(`/hms/chat?t=${t.id}`)}`} className={clsx(btnLine, "h-9 px-3 xl:hidden")}>Booking</Link>}
          {t.enquiry && <Link href="/hms/bookings/new" className={clsx(btnPrimary, "h-9 px-3")}>Make booking</Link>}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-hms-canvas px-4 py-4">
          {t.msgs.length === 0 && <p className="mt-10 text-center text-[14px] text-hms-muted">No messages yet. Say hello.</p>}
          {t.msgs.map((m, i) => {
            const day = m.at.slice(0, 10); const show = i === 0 || t.msgs[i - 1].at.slice(0, 10) !== day;
            return (
              <div key={m.id}>
                {show && <p className="my-3 text-center text-[12px] font-semibold text-hms-muted">{day === TODAY ? "Today" : dmy(day)}</p>}
                <div className={clsx("mb-2 flex", m.from === "staff" ? "justify-end" : "justify-start")}>
                  <div className={clsx("max-w-[78%] rounded-2xl px-3.5 py-2 text-[14.5px] shadow-sm", m.from === "staff" ? "rounded-br-md bg-hms-ink text-white" : "rounded-bl-md bg-white")}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={clsx("mt-0.5 text-right text-[11.5px]", m.from === "staff" ? "text-white/70" : "text-hms-muted")}>{m.from === "staff" ? `${m.by?.split(" (")[0] ?? "Staff"} · ` : ""}{timeOf(m.at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={end} />
        </div>
        <div className="border-t border-hms-line bg-white p-3">
          <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
            {payText && <Chip icon={CreditCard} label="Payment details" onClick={() => add(payText)} />}
            {s.messages.location.trim() && <Chip icon={MapPin} label="Location" onClick={() => add(s.messages.location.trim())} />}
            {b && b.status === "Confirmed" && <Chip icon={Link2} label="Online check-in link" onClick={() => add(`Save time at the desk — check in online: ${precheckUrl(h, b)}`)} />}
            {s.messages.shortcuts.map((x) => <Chip key={x.id} icon={Zap} label={x.title} onClick={() => add(x.text)} />)}
          </div>
          <div className="flex items-end gap-2">
            <label htmlFor="msg" className="sr-only">Message</label>
            <textarea id="msg" rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Write a message…" className={clsx(input, "h-auto max-h-36 min-h-11 flex-1 resize-none py-2.5")} />
            <button onClick={send} disabled={!text.trim()} className={clsx(btnPrimary, "h-11 px-4")} aria-label="Send"><Send className="size-4" aria-hidden /></button>
          </div>
          {err && <p role="alert" className="mt-1 text-[13.5px] font-semibold text-hms-red">{err}</p>}
          <div className="mt-1.5 flex justify-between text-[12px] text-hms-muted"><span>Enter to send · Shift+Enter for a new line</span><button onClick={() => chat.simulate(t.id, "Thanks! See you soon.")} className="underline underline-offset-2">Demo: guest replies</button></div>
        </div>
      </div>
      {b && (
        <aside aria-label="Booking" className="hidden w-[280px] shrink-0 overflow-y-auto border-l border-hms-line bg-white p-4 xl:block">
          <h2 className="text-[15px] font-bold">{b.code}</h2>
          <dl className="mt-2 space-y-2 text-[14px]">
            {([["Status", b.status], ["Payment", payState(b)], ["Room", b.unit ? `${b.unit} · ${b.type}` : b.type], ["Stay", `${dmy(b.from)} → ${dmy(b.to)}`], ["Source", channelLabel(b)], ["Due", tk(dueOf(b))], ["Phone", g?.phone || "—"], ["Email", g?.email || "—"]] as [string, string][]).map(([k, v]) => <div key={k}><dt className="text-[12.5px] text-hms-muted">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}
          </dl>
          <Link href={`/hms/bookings/view?b=${b.code}&from=${encodeURIComponent(`/hms/chat?t=${t.id}`)}`} className={clsx(btnLine, "mt-4 w-full")}>Open booking</Link>
        </aside>
      )}
    </div>
  );
}

function Chip({ icon: Icon, label, onClick }: { icon: typeof Zap; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-hms-line px-3 text-[13px] font-medium hover:bg-hms-hover"><Icon className="size-3.5" aria-hidden />{label}</button>;
}

/** Quick replies, payment note and location — managed here (D6), stored in Settings › messages. */
function Manage({ onClose, h, set }: { onClose: () => void; h: ReturnType<typeof useProperty>; set: ReturnType<typeof useSettings> }) {
  const m = set.st.messages;
  const [note, setNote] = useState(m.paymentNote);
  const [loc, setLoc] = useState(m.location);
  const [items, setItems] = useState(m.shortcuts);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [edit, setEdit] = useState<string | null>(null);
  const addOne = () => { if (!title.trim() || !body.trim()) return; if (edit) setItems(items.map((x) => (x.id === edit ? { ...x, title: title.trim(), text: body.trim() } : x))); else setItems([...items, { id: `q${Date.now().toString(36)}`, title: title.trim(), text: body.trim() }]); setTitle(""); setBody(""); setEdit(null); };
  const dirty = note !== m.paymentNote || loc !== m.location || JSON.stringify(items) !== JSON.stringify(m.shortcuts);
  return (
    <Sheet title="Quick replies" sub={h.name} wide onClose={onClose} footer={<><button onClick={onClose} className={btnLine}>Cancel</button><button disabled={!dirty} onClick={() => { set.save((s) => { s.messages = { ...s.messages, paymentNote: note.trim(), location: loc.trim(), shortcuts: items }; }, "Chat quick replies updated"); onClose(); }} className={clsx(btnPrimary, "flex-1")}>Save</button></>}>
      <label htmlFor="qn" className={lbl}>Payment note</label>
      <textarea id="qn" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Send the advance by bKash and share the TrxID" className={clsx(input, "h-auto py-2")} />
      <p className="mt-1 text-[12.5px] text-hms-muted">“Payment details” adds this note, your bKash / bank accounts from <Link href="/hms/settings/payments" className="underline underline-offset-2">Guest payments</Link>, and the amount due.</p>
      <label htmlFor="ql" className={clsx(lbl, "mt-3")}>Location / directions</label>
      <textarea id="ql" rows={2} value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Map link and a landmark" className={clsx(input, "h-auto py-2")} />
      <h3 className="mt-5 text-[14px] font-bold">Saved replies</h3>
      <ul className="mt-1 divide-y divide-hms-line">{items.map((x) => <li key={x.id} className="flex items-start gap-2 py-2.5"><span className="min-w-0 flex-1"><b className="block text-[14px]">{x.title}</b><span className="text-[13px] text-hms-muted">{x.text}</span></span>
        <button onClick={() => { setEdit(x.id); setTitle(x.title); setBody(x.text); }} aria-label={`Edit ${x.title}`} className="grid size-8 place-items-center rounded-lg hover:bg-hms-hover"><Pencil className="size-4" aria-hidden /></button>
        <button onClick={() => setItems(items.filter((y) => y.id !== x.id))} aria-label={`Remove ${x.title}`} className="grid size-8 place-items-center rounded-lg hover:bg-hms-hover"><X className="size-4" aria-hidden /></button></li>)}
        {items.length === 0 && <li className="py-2.5 text-[13.5px] text-hms-muted">None yet.</li>}</ul>
      <div className="mt-2 grid gap-2 sm:grid-cols-[180px_1fr_auto]">
        <input aria-label="Reply name" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name, e.g. Breakfast" className={input} />
        <input aria-label="Reply text" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Breakfast is 7–10 am on the 1st floor." className={input} />
        <button disabled={!title.trim() || !body.trim()} onClick={addOne} className={btnLine}>{edit ? "Update" : <><Plus className="size-4" aria-hidden />Add</>}</button>
      </div>
    </Sheet>
  );
}
