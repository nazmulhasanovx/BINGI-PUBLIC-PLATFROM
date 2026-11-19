"use client";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BedDouble, CalendarCheck, ChevronRight, Crown, Plus, Repeat, Search, Star, UserX } from "lucide-react";
import { bdt, dateShort, initials, useGuests, type GuestRow } from "@/lib/guests/store";
import { useProperty } from "../property";
import { GuestSheet } from "./sheet";
import { GuestsFrame, StateChip, Tag, btnPrimary } from "./ui";

type F = "all" | "inhouse" | "arriving" | "returning" | "vip" | "noid" | "blocked";
const FILTERS: { id: F; label: string; test: (g: GuestRow) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "inhouse", label: "In house", test: (g) => g.state === "In house" },
  { id: "arriving", label: "Arriving", test: (g) => g.state === "Arriving today" || g.state === "Upcoming" },
  { id: "returning", label: "Returning", test: (g) => g.returning },
  { id: "vip", label: "VIP", test: (g) => g.vip },
  { id: "noid", label: "ID missing", test: (g) => g.idMissing },
  { id: "blocked", label: "Blocked", test: (g) => !!g.blocked },
];
const ORDER = ["In house", "Arriving today", "Upcoming", "Checked out", "No stay yet"];

export function GuestsPage() {
  const h = useProperty();
  const router = useRouter();
  const { rows, reviews, saveGuest, findByPhone, nextId } = useGuests(h);
  const [q, setQ] = useState("");
  const [f, setF] = useState<F>("all");
  const [adding, setAdding] = useState<string | null>(null);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    const kd = k.replace(/\D/g, "");
    return rows
      .filter(FILTERS.find((x) => x.id === f)!.test)
      .filter((g) => !k || g.name.toLowerCase().includes(k) || g.id.toLowerCase().includes(k) || g.email.toLowerCase().includes(k) || g.idNo.toLowerCase().includes(k) || (kd.length >= 3 && g.phone.replace(/\D/g, "").includes(kd)))
      .sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || (b.stays[0]?.from ?? "").localeCompare(a.stays[0]?.from ?? ""));
  }, [rows, q, f]);
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const kpis = [
    { label: "In house now", value: rows.filter((g) => g.state === "In house").length, icon: BedDouble, card: "bg-[#e8f0fe]", ink: "text-[#1d4ed8]", go: () => setF("inhouse") },
    { label: "Arriving", value: rows.filter((g) => g.state === "Arriving today" || g.state === "Upcoming").length, icon: CalendarCheck, card: "bg-[#fdefe7]", ink: "text-[#d9622b]", go: () => setF("arriving") },
    { label: "Returning guests", value: rows.filter((g) => g.returning).length, icon: Repeat, card: "bg-[#e5f5ec]", ink: "text-[#1c7d45]", go: () => setF("returning") },
    { label: `Average rating · ${reviews.length} reviews`, value: avg ? avg.toFixed(1) : "—", icon: Star, card: "bg-[#fdf3d9]", ink: "text-[#a76f00]", go: () => router.push("/hms/guests/reviews") },
  ];
  const reply = reviews.filter((r) => !r.reply).length;

  return (
    <GuestsFrame tab="guests" counts={{ guests: rows.length, reply }} action={<button onClick={() => setAdding(nextId())} className={btnPrimary}><Plus className="size-4" />Add guest</button>}>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => (
          <button key={k.label} onClick={k.go} className={clsx("flex items-center gap-3 rounded-xl p-3.5 text-left sm:gap-4 sm:p-4 transition-shadow hover:shadow-[0_2px_10px_-4px_rgb(0_0_0/0.15)]", k.card)}>
            <span className={clsx("hidden size-11 shrink-0 place-items-center rounded-xl bg-white sm:grid shadow-[0_1px_2px_rgb(0_0_0/0.05)]", k.ink)}><k.icon className="size-5" strokeWidth={1.8} /></span>
            <span><span className="block text-[22px] font-bold leading-tight tabular-nums">{k.value}</span><span className="text-[13.5px] text-[#4d5664]">{k.label}</span></span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-hms-line bg-white px-3 focus-within:border-hms-ink">
          <Search className="size-4 text-hms-muted" /><span className="sr-only">Search guests</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, ID, email or guest code" className="h-full flex-1 bg-transparent text-[14.5px] outline-none" />
        </label>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="group" aria-label="Filter guests">
          {FILTERS.map((x) => {
            const n = rows.filter(x.test).length;
            return <button key={x.id} onClick={() => setF(x.id)} aria-pressed={f === x.id} className={clsx("h-9 shrink-0 whitespace-nowrap rounded-lg border px-3 text-[13.5px] font-semibold", f === x.id ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{x.label} <span className={f === x.id ? "text-white/70" : "text-hms-muted"}>{n}</span></button>;
          })}
        </div>
      </div>

      <section aria-label="Guest list" className="mt-4 overflow-hidden rounded-xl border border-hms-line bg-white">
        {list.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[16px] font-semibold">No guests found</p>
            <p className="mt-1 text-[14px] text-hms-muted">{q ? "Try another name or number." : "Nobody matches this filter yet."}</p>
            {q && <button onClick={() => setAdding(nextId())} className={clsx(btnPrimary, "mt-4")}><Plus className="size-4" />Add “{q}”</button>}
          </div>
        ) : (
          <>
            <table className="hidden w-full text-[14px] md:table">
              <thead><tr className="border-b border-hms-line text-left text-[12.5px] text-hms-muted">
                <th className="px-4 py-2.5 font-medium">Guest</th><th className="hidden px-3 py-2.5 font-medium lg:table-cell">Phone</th><th className="px-3 py-2.5 font-medium">Now</th>
                <th className="px-3 py-2.5 text-right font-medium">Stays</th><th className="hidden px-3 py-2.5 font-medium xl:table-cell">Last stay</th><th className="px-3 py-2.5 text-right font-medium">Spent</th><th className="w-10 px-3 py-2.5"><span className="sr-only">Open</span></th>
              </tr></thead>
              <tbody>
                {list.map((g) => (
                  <tr key={g.id} onClick={() => router.push(`/hms/guests/${g.id}`)} className="cursor-pointer border-b border-hms-line last:border-0 hover:bg-[#fafbfc]">
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-3">
                        <Avatar g={g} />
                        <span className="min-w-0">
                          <Link href={`/hms/guests/${g.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 font-semibold hover:text-hms-red">{g.name}{g.vip && <Crown className="size-3.5 text-[#a76f00]" aria-label="VIP" />}</Link>
                          <span className="flex flex-wrap items-center gap-1 text-[12px] text-hms-muted">{g.id}{g.country !== "Bangladesh" && <Tag tone="gray">{g.country}</Tag>}{g.returning && <Tag tone="green">Returning</Tag>}{g.idMissing && (g.state === "In house" ? <Tag tone="red">In house without ID</Tag> : <Tag tone="amber">ID missing</Tag>)}{g.blocked && <Tag tone="red"><UserX className="size-3" />Blocked</Tag>}</span>
                        </span>
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums lg:table-cell">{g.phone}</td>
                    <td className="px-3 py-2.5"><StateChip s={g.state} />{g.state === "In house" && <span className="ml-1.5 text-[12.5px] text-hms-muted">{g.stays.find((s) => s.status === "Checked in")?.room}</span>}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{g.stays.length}</td>
                    <td className="hidden whitespace-nowrap px-3 py-2.5 text-[13.5px] text-[#4d5664] xl:table-cell">{g.last ? dateShort(g.last) : "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums">{g.spent ? bdt(g.spent) : "—"}</td>
                    <td className="px-3 py-2.5 text-hms-muted"><ChevronRight className="size-4" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="divide-y divide-hms-line md:hidden">
              {list.map((g) => (
                <li key={g.id}><Link href={`/hms/guests/${g.id}`} className="flex items-center gap-3 px-4 py-3">
                  <Avatar g={g} />
                  <span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 font-semibold">{g.name}{g.vip && <Crown className="size-3.5 text-[#a76f00]" aria-label="VIP" />}</span><span className="block text-[13px] text-hms-muted">{g.phone} · {g.stays.length} stays</span></span>
                  <StateChip s={g.state} />
                </Link></li>
              ))}
            </ul>
          </>
        )}
      </section>
      <p className="mt-3 text-[12.5px] text-hms-muted">“Now” comes from bookings — nobody sets it by hand. Prototype: stays and reviews are demo data built from this property&apos;s rooms.</p>
      {adding && <GuestSheet newId={adding} findByPhone={findByPhone} onClose={() => setAdding(null)} onSave={(g) => { saveGuest(g); setAdding(null); router.push(`/hms/guests/${g.id}`); }} />}
    </GuestsFrame>
  );
}

export function Avatar({ g, size = 36 }: { g: { name: string; vip: boolean }; size?: number }) {
  return <span style={{ width: size, height: size, fontSize: size * 0.36 }} className={clsx("grid shrink-0 place-items-center rounded-full font-bold", g.vip ? "bg-[#fdf3d9] text-[#7a5200]" : "bg-hms-coral-soft text-hms-red")}>{initials(g.name)}</span>;
}
