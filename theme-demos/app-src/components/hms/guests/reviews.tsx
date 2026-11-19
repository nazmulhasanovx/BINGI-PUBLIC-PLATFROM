"use client";
// Reviews tab. Publication stays with BinGi Super Admin (as in live HMS). New here: summary, filters,
// reply (shown on the website after BinGi approves it) and report-to-BinGi.
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Flag, MessageSquareReply, Search, Send } from "lucide-react";
import { ASPECTS, type Review } from "@/lib/bookings/demo";
import { dateShort, useGuests, type GuestRow, type ReviewAct } from "@/lib/guests/store";
import { useProperty } from "../property";
import { GuestsFrame, Sheet, Stars, Tag, btnLine, btnPrimary, input, lbl } from "./ui";

type R = Review & ReviewAct;
type F = "all" | "reply" | "5" | "low" | "published" | "waiting";

export function ReviewsPage() {
  const h = useProperty();
  const { rows, reviews, act } = useGuests(h);
  const [f, setF] = useState<F>("all");
  const [q, setQ] = useState("");
  const byId = useMemo(() => new Map(rows.map((g) => [g.id, g])), [rows]);
  const tests: Record<F, [string, (r: R) => boolean]> = {
    all: ["All", () => true], reply: ["Needs reply", (r) => !r.reply], "5": ["5 ★", (r) => r.rating === 5], low: ["3 ★ or less", (r) => r.rating <= 3],
    published: ["Published", (r) => r.published], waiting: ["Waiting for BinGi", (r) => !r.published],
  };
  const list = reviews.filter(tests[f][1]).filter((r) => { const k = q.trim().toLowerCase(); if (!k) return true; const g = byId.get(r.guestId); return !!(g?.name.toLowerCase().includes(k) || r.stay.toLowerCase().includes(k) || r.text.toLowerCase().includes(k)); });
  const n = reviews.length;
  const avg = n ? reviews.reduce((a, r) => a + r.rating, 0) / n : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => [s, reviews.filter((r) => r.rating === s).length] as const);
  const asp = ASPECTS.map((a) => [a, n ? reviews.reduce((s, r) => s + r.aspects[a], 0) / n : 0] as const);
  const replied = reviews.filter((r) => r.reply).length;

  return (
    <GuestsFrame tab="reviews" counts={{ guests: rows.length, reply: reviews.filter((r) => !r.reply).length }}>
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-hms-line bg-white p-5">
          <p className="text-[13px] text-hms-muted">Average rating</p>
          <p className="mt-1 flex items-baseline gap-1.5"><span className="text-[36px] font-bold leading-none tabular-nums">{n ? avg.toFixed(1) : "—"}</span><span className="text-[15px] text-hms-muted">/ 5</span></p>
          <div className="mt-2"><Stars value={avg} size={18} /></div>
          <p className="mt-2 text-[13.5px] text-[#4d5664]">{n} reviews · {n ? Math.round((replied / n) * 100) : 0}% replied</p>
        </section>
        <section className="rounded-xl border border-hms-line bg-white p-5" aria-label="Rating breakdown">
          <ul className="space-y-1.5">
            {dist.map(([s, c]) => (
              <li key={s} className="flex items-center gap-2.5 text-[13.5px]"><span className="w-7 tabular-nums">{s} ★</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-hms-hover"><span className="block h-full rounded-full bg-[#f5a524]" style={{ width: `${n ? (c / n) * 100 : 0}%` }} /></span><span className="w-6 text-right tabular-nums text-hms-muted">{c}</span></li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-hms-line bg-white p-5" aria-label="Scores by area">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
            {asp.map(([a, v]) => <li key={a}><p className="text-[13px] text-hms-muted">{a}</p><p className="text-[18px] font-bold tabular-nums">{n ? v.toFixed(1) : "—"}</p></li>)}
          </ul>
        </section>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-hms-line bg-white px-3 focus-within:border-hms-ink">
          <Search className="size-4 text-hms-muted" /><span className="sr-only">Search reviews</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guest, booking or words" className="h-full flex-1 bg-transparent text-[14.5px] outline-none" />
        </label>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="group" aria-label="Filter reviews">
          {(['all', 'reply', '5', 'low', 'published', 'waiting'] as F[]).map((k) => <button key={k} onClick={() => setF(k)} aria-pressed={f === k} className={clsx("h-9 shrink-0 whitespace-nowrap rounded-lg border px-3 text-[13.5px] font-semibold", f === k ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{tests[k][0]} <span className={f === k ? "text-white/70" : "text-hms-muted"}>{reviews.filter(tests[k][1]).length}</span></button>)}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-3">
          {list.length ? list.map((r) => <ReviewCard key={r.id} r={r} guest={byId.get(r.guestId)} act={act} />) : <div className="rounded-xl border border-hms-line bg-white px-6 py-12 text-center text-[14px] text-hms-muted">No reviews match this filter.</div>}
        </div>
        <aside className="space-y-3">
          <section className="rounded-xl border border-hms-line bg-white p-5 text-[14px]">
            <h3 className="text-[15px] font-bold">How reviews work</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[#4d5664]">
              <li>Only guests who checked out can review.</li>
              <li>BinGi checks each review before it goes on your website and the marketplace.</li>
              <li>Your reply shows under the review after BinGi approves it.</li>
              <li>You can report a fake or abusive review — you can’t delete it.</li>
            </ul>
          </section>
          <section className="rounded-xl border border-dashed border-hms-line bg-white p-5 text-[14px]">
            <p className="flex items-center gap-2 font-bold">Ask guests for a review <Tag tone="gray">Coming soon</Tag></p>
            <p className="mt-1 text-[#4d5664]">Send a review link by SMS / WhatsApp after checkout. Needs messaging in Connectivity.</p>
          </section>
        </aside>
      </div>
    </GuestsFrame>
  );
}

export function ReviewCard({ r, guest, act, compact }: { r: R; guest?: GuestRow; act: (id: string, fn: (a: ReviewAct) => void) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(r.reply?.text ?? "");
  const [report, setReport] = useState(false);
  const [why, setWhy] = useState("");
  const stay = guest?.stays.find((s) => s.code === r.stay);
  const starter = r.rating >= 4 ? `Thank you, ${guest?.name.split(" ")[0] ?? "dear guest"}! We’re happy you enjoyed your stay and hope to welcome you again.` : `Thank you for telling us, ${guest?.name.split(" ")[0] ?? "dear guest"}. We’re sorry about this and have fixed it with our team.`;
  return (
    <article className={clsx("rounded-xl border border-hms-line bg-white", compact ? "p-4" : "p-5")}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {!compact && guest && <Link href={`/hms/guests/${guest.id}`} className="font-semibold hover:text-hms-red">{guest.name}</Link>}
        <Stars value={r.rating} />
        <span className="text-[13px] text-hms-muted">{dateShort(r.date)} · {r.source}{stay ? ` · ${stay.type}` : ""} · <span className="font-mono">{r.stay}</span></span>
        <span className="ml-auto flex gap-1.5">{r.published ? <Tag tone="green">Published</Tag> : <Tag tone="amber">Waiting for BinGi</Tag>}{r.report && <Tag tone="red">Reported</Tag>}</span>
      </header>
      <p className="mt-2 text-[15px] font-semibold">{r.title}</p>
      {r.text ? <p className="mt-0.5 text-[14.5px] leading-relaxed text-[#2f333b]">{r.text}</p> : <p className="mt-0.5 text-[14px] text-hms-muted">No written feedback.</p>}
      {!compact && <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-hms-muted">{ASPECTS.map((a) => <span key={a}>{a} <b className="text-[#2f333b]">{r.aspects[a]}</b></span>)}</p>}
      {r.reply && !open && (
        <div className="mt-3 rounded-lg bg-[#f4f6f8] px-3.5 py-2.5 text-[14px]">
          <p className="text-[12.5px] font-semibold text-hms-muted">Your reply · {dateShort(r.reply.at.slice(0, 10))} · shows after BinGi approves</p>
          <p className="mt-0.5">{r.reply.text}</p>
        </div>
      )}
      {open ? (
        <div className="mt-3">
          <label htmlFor={`rp-${r.id}`} className="sr-only">Reply</label>
          <textarea id={`rp-${r.id}`} rows={3} value={text} onChange={(e) => setText(e.target.value)} className={clsx(input, "h-auto py-2.5")} placeholder="Write a short, polite reply" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {!text && <button onClick={() => setText(starter)} className="text-[13.5px] font-semibold text-hms-red">Use a starter</button>}
            <span className="ml-auto flex gap-2"><button onClick={() => setOpen(false)} className={clsx(btnLine, "h-9")}>Cancel</button>
              <button disabled={!text.trim()} onClick={() => { act(r.id, (a) => { a.reply = { text: text.trim(), at: new Date().toISOString() }; }); setOpen(false); }} className={clsx(btnPrimary, "h-9")}><Send className="size-4" />Send reply</button></span>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setOpen(true)} className={clsx(btnLine, "h-9 px-3")}><MessageSquareReply className="size-4" />{r.reply ? "Edit reply" : "Reply"}</button>
          {!r.report && <button onClick={() => setReport(true)} className={clsx(btnLine, "h-9 px-3 text-[#4d5664]")}><Flag className="size-4" />Report</button>}
        </div>
      )}
      {report && (
        <Sheet title="Report this review to BinGi" sub="BinGi checks it. Reviews are not deleted by the hotel." onClose={() => setReport(false)}
          footer={<><button onClick={() => setReport(false)} className={clsx(btnLine, "flex-1")}>Cancel</button><button disabled={!why} onClick={() => { act(r.id, (a) => { a.report = { reason: why, at: new Date().toISOString() }; }); setReport(false); }} className={clsx(btnPrimary, "flex-1")}>Send report</button></>}>
          <p className={lbl}>Why?</p>
          <div className="grid gap-2" role="radiogroup" aria-label="Reason">
            {["Not a real guest", "Abusive or personal", "Wrong property", "Contains private details"].map((x) => <button key={x} role="radio" aria-checked={why === x} onClick={() => setWhy(x)} className={clsx("rounded-lg border px-3.5 py-3 text-left text-[14.5px]", why === x ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}>{x}</button>)}
          </div>
        </Sheet>
      )}
    </article>
  );
}
