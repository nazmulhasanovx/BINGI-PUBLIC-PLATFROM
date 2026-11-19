"use client";
// BinGi news in the HMS: one banner under the header for server updates / service issues,
// one small popup for new features, a full list at /hms/news, and entries in the bell.
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Info, Megaphone, Server, Sparkles, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { KIND_LABEL, clock, phaseOf, inText, minutes, useNews, whenText, type News, type NewsKind, type Phase } from "@/lib/news/feed";

const KIND_ICON: Record<NewsKind, LucideIcon> = { maintenance: Server, update: Sparkles, notice: Megaphone, incident: TriangleAlert };
const KIND_TONE: Record<NewsKind, string> = {
  maintenance: "bg-hms-blue-soft text-hms-blue",
  update: "bg-hms-coral-soft text-hms-red",
  notice: "bg-hms-hover text-hms-ink",
  incident: "bg-hms-amber-soft text-hms-amber",
};
const H48 = 48 * 3_600_000;

/** The one window (server update / service issue) that should show in the banner right now, if any. */
function useBannerItem() {
  const n = useNews();
  const win = n.feed.filter((x) => (x.kind === "maintenance" || x.kind === "incident") && x.start != null);
  let pick: { x: News; p: Phase } | null = null;
  for (const p of ["live", "soon", "upcoming", "done"] as Phase[]) {
    const x = win.find((w) => phaseOf(w, n.now) === p && (p !== "upcoming" || w.start! - n.now < H48));
    if (x) { pick = { x, p }; break; }
  }
  return { ...n, pick };
}

export function NewsBanner() {
  const { pick, user, hide, now } = useBannerItem();
  if (!pick) return null;
  const { x, p } = pick;
  const key = `${x.id}:${p}`;
  if (p !== "live" && user.hidden.includes(key)) return null;
  const first = x.impact?.find((i) => i.en !== "No change");
  const span = `${clock(x.start!)}–${clock(x.end!)}`;
  const text =
    p === "upcoming" ? <><b className="font-semibold">{KIND_LABEL[x.kind]} {whenText(x.start!, now).split(" ")[0]} {span}</b> ({minutes(x)} min){first ? ` · ${first.module}: ${first.en.toLowerCase()}` : ""}</>
    : p === "soon" ? <><b className="font-semibold">{KIND_LABEL[x.kind]} starts in {inText(x.start! - now)}</b> ({clock(x.start!)}) · finish check-outs and refunds now</>
    : p === "live" ? <><b className="font-semibold">{x.kind === "incident" ? x.title : "Server update in progress"}</b> · about {inText(x.end! - now)} left{first ? ` · ${first.en}` : ""}. Your data is safe.</>
    : <><b className="font-semibold">{KIND_LABEL[x.kind]} finished</b> at {clock(x.end!)} · everything is back to normal</>;
  const tone =
    p === "live" ? "border-[#cfdcf7] bg-[#eef3fd] text-[#1e3a8a]"
    : p === "done" ? "border-[#cde9d8] bg-[#eef8f2] text-[#14532d]"
    : p === "soon" ? "border-[#f0d49a] bg-[#fdf3d9] text-[#6b4309]"
    : "border-[#f1dfb8] bg-[#fdf8ec] text-[#6b4309]";
  const Icon = p === "done" ? CheckCircle2 : p === "live" ? Server : Clock;
  return (
    <div role={p === "live" || p === "soon" ? "alert" : "region"} aria-label={p === "live" || p === "soon" ? undefined : "BinGi notice"} data-news-banner={p} className={clsx("flex items-start gap-2.5 border-b px-4 py-2 text-[13.5px] sm:items-center sm:px-6", tone)}>
      <span className="relative mt-0.5 shrink-0 sm:mt-0">
        <Icon className="size-4" aria-hidden />
        {p === "live" && <span className="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-[#2563eb] motion-reduce:animate-none" aria-hidden />}
      </span>
      <p className="min-w-0 flex-1 leading-snug">
        {text}
        <span lang="bn" className="ml-2 hidden opacity-80 xl:inline">· {x.titleBn}</span>
      </p>
      <Link href={`/hms/news?id=${x.id}`} className="shrink-0 font-semibold underline underline-offset-4">Details</Link>
      {p !== "live" && (
        <button onClick={() => hide(key)} aria-label="Hide this notice" className="-my-1 grid size-7 shrink-0 place-items-center rounded-full hover:bg-black/5"><X className="size-4" /></button>
      )}
    </div>
  );
}

/** New-feature popup: once per user, only on the Dashboard (never in the middle of work), never during a live server update. */
export function NewsPopup() {
  const { feed, user, markSeen, pick, now } = useBannerItem();
  const path = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 1200); return () => clearTimeout(t); }, []);
  const item = feed.find((x) => x.kind === "update" && !user.seen.includes(x.id) && now - x.published < 7 * 86_400_000);
  if (!ready || !item || pick?.p === "live" || path !== "/hms") return null;
  return (
    <div role="dialog" aria-labelledby="news-pop-title" data-news-popup className="hms-pop fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-3 z-40 w-[min(360px,calc(100vw-24px))] rounded-2xl border border-hms-line bg-white p-4 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.25)] md:bottom-5 md:right-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-hms-coral-soft text-hms-red"><Sparkles className="size-[18px]" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-hms-muted">New in BinGi</p>
          <p id="news-pop-title" className="mt-0.5 text-[15px] font-bold leading-snug">{item.title}</p>
          <p className="mt-1 text-[13.5px] leading-snug text-hms-muted">{item.body}</p>
          <p lang="bn" className="mt-1 text-[13px] leading-snug text-hms-muted">{item.titleBn}</p>
        </div>
        <button onClick={() => markSeen(item.id)} aria-label="Close" className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full hover:bg-hms-hover"><X className="size-4" /></button>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={() => markSeen(item.id)} className="h-9 rounded-lg px-3 text-[13.5px] font-semibold text-hms-muted hover:bg-hms-hover">Later</button>
        <Link href={`/hms/news?id=${item.id}`} onClick={() => markSeen(item.id)} className="inline-flex h-9 items-center rounded-lg btn-glow px-3 text-[13.5px] font-semibold text-white">See what’s new</Link>
      </div>
    </div>
  );
}

/** Bell entries: the current server window + unseen new features. */
export function useNewsNotes() {
  const { pick, feed, user, now } = useBannerItem();
  return useMemo(() => {
    const out: { id: string; icon: LucideIcon; tone: string; title: string; sub: string; href: string }[] = [];
    if (pick && pick.p !== "done") {
      const { x, p } = pick;
      out.push({
        id: `news-${x.id}-${p}`, icon: Server, tone: p === "live" ? "bg-[#e8f0fe] text-[#1d4ed8]" : "bg-[#fdf3d9] text-[#a76f00]",
        title: p === "live" ? "Server update in progress" : `${KIND_LABEL[x.kind]} ${p === "soon" ? `in ${inText(x.start! - now)}` : whenText(x.start!, now).split(" ")[0]}`,
        sub: `${clock(x.start!)}–${clock(x.end!)} · ${x.title.replace(/^Server update: /, "")}`, href: `/hms/news?id=${x.id}`,
      });
    }
    for (const x of feed) if (x.kind === "update" && !user.seen.includes(x.id) && now - x.published < 7 * 86_400_000)
      out.push({ id: `news-${x.id}`, icon: Sparkles, tone: "bg-hms-coral-soft text-hms-red", title: x.title, sub: "New in BinGi · tap to read", href: `/hms/news?id=${x.id}` });
    return out;
  }, [pick, feed, user.seen, now]);
}

// ---------------- /hms/news ----------------
const FILTERS: { id: "all" | NewsKind; label: string }[] = [
  { id: "all", label: "All" }, { id: "maintenance", label: "Server updates" }, { id: "update", label: "New features" }, { id: "incident", label: "Service issues" }, { id: "notice", label: "Notices" },
];
const PHASE_PILL: Record<Phase, { t: string; c: string } | null> = {
  upcoming: { t: "Planned", c: "bg-hms-amber-soft text-hms-amber" },
  soon: { t: "Starting soon", c: "bg-hms-amber-soft text-hms-amber" },
  live: { t: "In progress", c: "bg-hms-blue-soft text-hms-blue" },
  done: { t: "Done", c: "bg-hms-green-soft text-hms-green" },
  past: { t: "Done", c: "bg-hms-hover text-hms-muted" },
};

export function NewsPage() {
  const n = useNews();
  const sp = useSearchParams();
  const focus = sp.get("id");
  const [f, setF] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [bn, setBn] = useState(false);
  const list = n.feed.filter((x) => f === "all" || x.kind === f);
  const ready = n.feed.length > 0;
  useEffect(() => {
    if (!focus || !ready) return;
    if (n.feed.find((x) => x.id === focus)?.kind === "update") n.markSeen(focus);
    document.getElementById(`news-${focus}`)?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, ready]);
  const demoOn = !!n.user.demo && n.now < n.user.demo.end;
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[860px] px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">BinGi news</h1>
            <p className="mt-1 text-[14px] text-hms-muted">Server updates, new features and notices from BinGi. Times are Dhaka time. <span lang="bn">· BinGi-র খবর ও সার্ভার আপডেট</span></p>
          </div>
          <button onClick={() => setBn((b) => !b)} aria-pressed={bn} className="h-9 rounded-lg border border-hms-line bg-white px-3 text-[13.5px] font-semibold hover:bg-hms-hover">{bn ? "Show English" : "বাংলায় পড়ুন"}</button>
        </div>

        <div role="tablist" aria-label="Filter news" className="mt-5 flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((x) => (
            <button key={x.id} role="tab" aria-selected={f === x.id} onClick={() => setF(x.id)} className={clsx("h-8 shrink-0 rounded-full px-3 text-[13px] font-semibold", f === x.id ? "bg-hms-ink text-white" : "bg-white text-hms-ink ring-1 ring-hms-line hover:bg-hms-hover")}>{x.label}</button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-hms-line bg-white p-6 text-center text-[14px] text-hms-muted">Nothing here yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((x) => <NewsCard key={x.id} x={x} phase={n.phase(x)} now={n.now} bn={bn} focus={focus === x.id} />)}
          </ul>
        )}

        <section aria-label="Prototype demo" className="mt-8 rounded-2xl border border-dashed border-hms-line bg-white p-4">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold"><Info className="size-4 text-hms-muted" />Prototype only</p>
          <p className="mt-1 text-[13px] text-hms-muted">In the real product BinGi publishes these from Super Admin and every hotel sees them. Here the news is demo data. Try how a live server update looks:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {demoOn ? (
              <button onClick={n.endDemo} className="h-9 rounded-lg border border-hms-line px-3 text-[13.5px] font-semibold hover:bg-hms-hover">End demo update</button>
            ) : (
              <button onClick={() => n.startDemo(10)} className="h-9 rounded-lg border border-hms-line px-3 text-[13.5px] font-semibold hover:bg-hms-hover">Start a 10-minute demo update</button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function NewsCard({ x, phase, now, bn, focus }: { x: News; phase: Phase; now: number; bn: boolean; focus: boolean }) {
  const Icon = KIND_ICON[x.kind];
  const pill = x.start != null ? PHASE_PILL[phase] : null;
  return (
    <li id={`news-${x.id}`} className={clsx("scroll-mt-4 rounded-2xl border bg-white p-4 sm:p-5", focus ? "border-hms-red/40 ring-2 ring-hms-red/15" : "border-hms-line")}>
      <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
        <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold", KIND_TONE[x.kind])}><Icon className="size-3.5" aria-hidden />{KIND_LABEL[x.kind]}</span>
        {pill && <span className={clsx("rounded-full px-2 py-0.5 font-semibold", pill.c)}>{pill.t}{phase === "soon" ? ` · in ${inText(x.start! - now)}` : phase === "live" ? ` · ${inText(x.end! - now)} left` : ""}</span>}
        <span className="text-hms-muted">{x.start != null ? `${whenText(x.start, now)}–${clock(x.end!)} · ${minutes(x)} min` : `Posted ${whenText(x.published, now)}`}</span>
      </div>
      <h2 lang={bn ? "bn" : undefined} className="mt-2 text-[16px] font-bold leading-snug">{bn ? x.titleBn : x.title}</h2>
      <p lang={bn ? "bn" : undefined} className="mt-1 text-[14px] leading-relaxed text-hms-muted">{bn ? x.bodyBn : x.body}</p>
      {x.impact && (
        <div className="mt-3 overflow-hidden rounded-xl border border-hms-line">
          <p className="bg-hms-canvas px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-hms-muted">{bn ? "আপনার জন্য কী বদলাবে" : "What changes for you"}</p>
          <ul className="divide-y divide-hms-line">
            {x.impact.map((i) => (
              <li key={i.module} className="flex flex-col gap-0.5 px-3 py-2 text-[13.5px] sm:flex-row sm:gap-3">
                <span className="font-semibold sm:w-44 sm:shrink-0">{i.module}</span>
                <span lang={bn ? "bn" : undefined} className={i.en === "No change" ? "text-hms-muted" : ""}>{bn ? i.bn : i.en}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {x.link && <Link href={x.link.href} className="mt-3 inline-flex text-[13.5px] font-semibold text-hms-red underline-offset-4 hover:underline">{x.link.label} →</Link>}
    </li>
  );
}
