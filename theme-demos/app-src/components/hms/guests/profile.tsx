"use client";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, CircleAlert, Crown, Mail, MapPin, MessageCircle, Pencil, Phone, Trash2, UserX } from "lucide-react";
import { bdt, dateShort, dm, useGuests } from "@/lib/guests/store";
import { useProperty } from "../property";
import { Avatar } from "./list";
import { ReviewCard } from "./reviews";
import { GuestSheet } from "./sheet";
import { GuestsFrame, Sheet, StateChip, Stars, Tag, btnLine, btnPrimary, input, lbl } from "./ui";

export function GuestProfilePage({ id }: { id: string }) {
  const h = useProperty();
  const router = useRouter();
  const { rows, reviews, saveGuest, removeGuest, findByPhone, act, nextId } = useGuests(h);
  const g = rows.find((x) => x.id === id);
  const [edit, setEdit] = useState(false);
  const [block, setBlock] = useState(false);
  const [reason, setReason] = useState("");
  const reply = reviews.filter((r) => !r.reply).length;
  if (!g) return (
    <GuestsFrame tab="guests" counts={{ guests: rows.length, reply }}>
      <div className="rounded-xl border border-hms-line bg-white p-8 text-center"><p className="text-[16px] font-semibold">Guest not found</p><Link href="/hms/guests" className="mt-2 inline-block font-semibold text-hms-red">Back to guests</Link></div>
    </GuestsFrame>
  );
  const mine = reviews.filter((r) => r.guestId === g.id);
  const wa = g.phone.replace(/\D/g, "").replace(/^0/, "880");
  const { idMissing, verified } = g;
  const stats = [["Stays", String(g.stays.length)], ["Nights", String(g.nights)], ["Paid so far", g.spent ? bdt(g.spent) : "—"], ["Rating given", g.rating ? g.rating.toFixed(1) : "—"]];

  return (
    <GuestsFrame tab="guests" counts={{ guests: rows.length, reply }}>
      <Link href="/hms/guests" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#4d5664] hover:text-hms-ink"><ArrowLeft className="size-4" />All guests</Link>
      {g.blocked && <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#f3c1c1] bg-[#fdf2f2] px-4 py-2.5 text-[14px] text-[#8a1c1c]"><UserX className="size-4" /><b>Blocked</b> · {g.blocked.reason} <button onClick={() => saveGuest({ ...g, blocked: undefined })} className="ml-auto font-semibold underline">Unblock</button></div>}

      <section className="rounded-xl border border-hms-line bg-white p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar g={g} size={56} />
          <div className="min-w-0 flex-1">
            <h2 className="flex flex-wrap items-center gap-2 text-[22px] font-bold">{g.name}{g.vip && <Tag tone="vip"><Crown className="size-3" />VIP</Tag>}<StateChip s={g.state} /></h2>
            <p className="text-[13.5px] text-hms-muted">{g.id} · {g.country} · guest since {dateShort(g.created)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${g.phone.replace(/[^\d+]/g, "")}`} className={btnLine}><Phone className="size-4" />Call</a>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className={btnLine}><MessageCircle className="size-4" />WhatsApp</a>
            <button onClick={() => setEdit(true)} className={btnPrimary}><Pencil className="size-4" />Edit</button>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([k, v]) => <div key={k} className="rounded-lg bg-[#f4f6f8] px-3.5 py-3"><dt className="text-[12.5px] text-hms-muted">{k}</dt><dd className="text-[18px] font-bold tabular-nums">{v}</dd></div>)}
        </dl>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          <section aria-labelledby="stays" className="rounded-xl border border-hms-line bg-white">
            <div className="flex items-center justify-between px-5 pb-2 pt-4"><h3 id="stays" className="text-[16px] font-bold">Stays</h3>{!g.blocked && <Link href={`/hms/bookings/new?guest=${g.id}`} className="text-[13.5px] font-semibold text-hms-red">+ New booking</Link>}</div>
            {g.stays.length ? (
              <div className="overflow-x-auto px-2 pb-2" tabIndex={0} role="region" aria-label="Stays table">
                <table className="w-full min-w-[560px] text-[14px]">
                  <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-3 py-2 font-medium">Booking</th><th className="px-3 py-2 font-medium">Room</th><th className="px-3 py-2 font-medium">Dates</th><th className="px-3 py-2 font-medium">Booking</th><th className="px-3 py-2 font-medium">Payment</th><th className="px-3 py-2 text-right font-medium">Amount</th></tr></thead>
                  <tbody>
                    {g.stays.map((s) => (
                      <tr key={s.code} className="border-t border-hms-line">
                        <td className="px-3 py-2.5"><Link href={`/hms/bookings/list?b=${s.code}`} className="font-mono text-[13px] font-semibold text-hms-red hover:underline">{s.code}</Link><span className="block text-[12px] text-hms-muted">{s.channel}</span></td>
                        <td className="px-3 py-2.5">{s.room}<span className="block max-w-[140px] truncate text-[12px] text-hms-muted">{s.type}</span></td>
                        <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">{dm(s.from)} – {dm(s.to)}<span className="block text-[12px] text-hms-muted">{s.nights} night{s.nights > 1 ? "s" : ""}</span></td>
                        <td className="px-3 py-2.5"><Tag tone={s.status === "Checked in" ? "gray" : s.status === "Confirmed" ? "green" : "gray"}>{s.status}</Tag></td>
                        <td className="px-3 py-2.5"><Tag tone={s.payment === "Paid" ? "green" : s.payment === "Due" ? "red" : "amber"}>{s.payment}</Tag></td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{bdt(s.total)}{s.due > 0 && <span className="block text-[12px] font-semibold text-hms-red">{bdt(s.due)} due</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="px-5 pb-5 text-[14px] text-hms-muted">No stays yet. New bookings for this phone number will show here.</p>}
          </section>

          <section aria-labelledby="rv" className="rounded-xl border border-hms-line bg-white p-5">
            <h3 id="rv" className="flex items-center gap-2 text-[16px] font-bold">Reviews {g.rating !== undefined && <Stars value={g.rating} />}</h3>
            {mine.length ? <div className="mt-3 space-y-3">{mine.map((r) => <ReviewCard key={r.id} r={r} guest={g} act={act} compact />)}</div> : <p className="mt-1 text-[14px] text-hms-muted">No reviews from this guest yet.</p>}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-hms-line bg-white p-5">
            <h3 className="text-[16px] font-bold">Contact & ID</h3>
            <ul className="mt-3 space-y-2.5 text-[14px]">
              <li className="flex items-center gap-2.5"><Phone className="size-4 text-hms-muted" />{g.phone}</li>
              <li className="flex items-center gap-2.5"><Mail className="size-4 text-hms-muted" />{g.email || <span className="text-hms-muted">No email</span>}</li>
              <li className="flex items-center gap-2.5"><MapPin className="size-4 text-hms-muted" />{g.address || <span className="text-hms-muted">No address</span>}</li>
            </ul>
            <div className={clsx("mt-4 rounded-lg px-3.5 py-3 text-[14px]", idMissing ? (g.state === "In house" ? "bg-[#fdf2f2]" : "bg-[#fffaf0]") : "bg-[#f4f6f8]")}>
              {idMissing ? <p className={clsx("flex items-center gap-2 font-semibold", g.state === "In house" ? "text-[#a11d2a]" : "text-[#7a5200]")}><CircleAlert className="size-4" />{g.state === "In house" ? "Checked in without ID — collect it now" : "ID needed before check-in"}</p> : (
                <>
                  <p className="font-semibold">{g.idType} · <span className="font-mono">{g.idNo}</span></p>
                  <p className={clsx("mt-0.5 flex items-center gap-1.5 text-[13px]", verified ? "text-[#16693a]" : "text-[#7a5200]")}>{verified ? <><BadgeCheck className="size-4" />Original checked</> : "Not checked yet"}</p>
                  <p className="mt-1 text-[12.5px] text-hms-muted">Photos: {[g.idFront && "front", g.idBack && "back"].filter(Boolean).join(" + ") || "none"}</p>
                </>
              )}
              <button onClick={() => setEdit(true)} className="mt-2 text-[13.5px] font-semibold text-hms-red">{idMissing ? "Add ID" : "Update ID"}</button>
            </div>
          </section>

          <section className="rounded-xl border border-hms-line bg-white p-5">
            <h3 className="text-[16px] font-bold">Preferences & notes</h3>
            {g.prefs.length ? <div className="mt-2.5 flex flex-wrap gap-1.5">{g.prefs.map((p) => <span key={p} className="rounded-md bg-[#e9edf2] px-2 py-1 text-[13px] font-medium">{p}</span>)}</div> : <p className="mt-1 text-[14px] text-hms-muted">No preferences saved.</p>}
            {g.notes && <p className="mt-3 rounded-lg bg-[#fffaf0] px-3.5 py-2.5 text-[14px]">{g.notes}</p>}
            <p className="mt-3 text-[12.5px] text-hms-muted">Offers: {g.marketing ? "agreed" : "not agreed"}</p>
          </section>

          <section className="rounded-xl border border-hms-line bg-white p-5">
            <h3 className="text-[16px] font-bold">Manage</h3>
            <div className="mt-3 grid gap-2">
              <button onClick={() => saveGuest({ ...g, vip: !g.vip })} className={btnLine}><Crown className="size-4" />{g.vip ? "Remove VIP" : "Mark as VIP"}</button>
              {!g.blocked && <button onClick={() => setBlock(true)} className={btnLine}><UserX className="size-4" />Block guest</button>}
              <button disabled={g.stays.length > 0} title={g.stays.length ? "Guests with stays are kept for your records — block instead" : undefined}
                onClick={() => { if (confirm(`Delete ${g.name}? This cannot be undone.`)) { removeGuest(g.id); router.push("/hms/guests"); } }} className={clsx(btnLine, "text-hms-red")}><Trash2 className="size-4" />Delete</button>
              {g.stays.length > 0 && <p className="text-[12.5px] text-hms-muted">Guests with stays can’t be deleted (records). Block them instead.</p>}
            </div>
          </section>
        </div>
      </div>

      {edit && <GuestSheet guest={g} newId={nextId()} findByPhone={findByPhone} onClose={() => setEdit(false)} onSave={(x) => { saveGuest(x); setEdit(false); }} />}
      {block && (
        <Sheet title={`Block ${g.name}?`} sub="The front desk sees a warning when this guest books again." onClose={() => setBlock(false)}
          footer={<><button onClick={() => setBlock(false)} className={clsx(btnLine, "flex-1")}>Cancel</button><button disabled={!reason.trim()} onClick={() => { saveGuest({ ...g, blocked: { reason: reason.trim(), at: new Date().toISOString() } }); setBlock(false); setReason(""); }} className={clsx(btnPrimary, "flex-1")}>Block guest</button></>}>
          <label htmlFor="b-reason" className={lbl}>Reason (team only)</label>
          <div className="mb-2 flex flex-wrap gap-1.5">{["Damage to property", "Unpaid bill", "Misbehaviour", "Fake ID"].map((x) => <button key={x} type="button" onClick={() => setReason(x)} className="h-8 rounded-lg border border-hms-line px-2.5 text-[13px] hover:bg-hms-hover">{x}</button>)}</div>
          <textarea id="b-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={clsx(input, "h-auto py-2.5")} />
        </Sheet>
      )}
    </GuestsFrame>
  );
}
