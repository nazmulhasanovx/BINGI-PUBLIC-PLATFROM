"use client";
import clsx from "clsx";
import { useState } from "react";
import { CalendarDays, Eye, Plus, Trash2 } from "lucide-react";
import { TODAY, addDays, dayName, emp, fmt, fmtStamp, monthLabel, useHrm, type LeaveReq } from "@/lib/hrm/store";
import { addLeave, decideLeave, leaveDays } from "@/lib/hrm/actions";
import { DateBox, FilterSelect, StaffFrame, useToast } from "./Frame";
import { Area, Btn, Card, Chip, Drawer, Empty, Field, FilterChips, Input, Person, Select, Table } from "./ui";

const ST: Record<LeaveReq["status"], ["amber" | "green" | "red", string]> = { pending: ["amber", "Pending"], approved: ["green", "Approved"], rejected: ["red", "Rejected"] };
const range = (l: LeaveReq) => (l.from === l.to ? fmt(l.from) : l.from.slice(0, 7) === l.to.slice(0, 7) ? `${l.from.slice(8)} – ${fmt(l.to)}` : `${fmt(l.from)} – ${fmt(l.to)}`);

export function LeavePage() {
  const { st } = useHrm();
  const [tab, setTab] = useState<"req" | "bal" | "cal">("req");
  const [f, setF] = useState<"all" | LeaveReq["status"]>("all");
  const [q, setQ] = useState("");
  const [date, setDate] = useState(TODAY);
  const [add, setAdd] = useState(false);
  const [review, setReview] = useState<string | null>(null);
  const n = (s: LeaveReq["status"]) => st.leaves.filter((l) => l.status === s).length;
  const match = (l: LeaveReq) => { const e = emp(st, l.emp); return !q || `${e?.name} ${l.emp} ${l.type}`.toLowerCase().includes(q.toLowerCase()); };
  const [ft, setFt] = useState("all");
  const [fd, setFd] = useState("all");
  const list = st.leaves.filter((l) => (f === "all" || l.status === f) && (ft === "all" || l.type === ft) && (fd === "all" || emp(st, l.emp)?.dept === fd) && match(l));
  return (
    <StaffFrame tab="leave" search={q} onSearch={setQ} activeFilters={(ft !== "all" ? 1 : 0) + (fd !== "all" ? 1 : 0)} onClearFilters={() => { setFt("all"); setFd("all"); }} filters={<><FilterSelect label="Leave type" value={ft} onChange={setFt} options={st.settings.leaveTypes.map((t) => ({ v: t.name, label: t.name }))} /><FilterSelect label="Department" value={fd} onChange={setFd} options={st.settings.departments.map((d) => ({ v: d, label: d }))} /></>} searchPlaceholder="Search leave (name, ID, type)" action={<Btn kind="primary" onClick={() => setAdd(true)}><Plus className="size-[18px]" /> Add leave</Btn>} right={<DateBox value={date} onChange={setDate} label={fmt(date)} />}>
      <Card>
        <h2 className="flex items-center gap-3 text-[22px] font-semibold text-[#b11c29]"><CalendarDays className="size-6" /> Leave</h2>
        <div className="mt-4 flex flex-wrap gap-2 border-b border-[#e3e7ec] pb-3">
          {([["req", `Requests (${st.leaves.length})`], ["bal", "Balances"], ["cal", "Calendar & holidays"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} className={clsx("whitespace-nowrap rounded-xl px-4 py-2 text-[16px]", tab === v ? "bg-[#e9edf2] font-semibold" : "hover:bg-[#f4f6f8]")}>{l}</button>
          ))}
        </div>
        {tab === "req" && (
          <>
            <div className="mt-4"><FilterChips value={f} onChange={setF} items={[{ v: "all", label: `All (${st.leaves.length})` }, { v: "pending", label: `Pending (${n("pending")})` }, { v: "approved", label: `Approved (${n("approved")})` }, { v: "rejected", label: `Rejected (${n("rejected")})` }]} /></div>
            <div className="mt-4">
              {list.length === 0 ? <Empty icon={<CalendarDays className="size-6" />} title="No leave requests" text="Requests from staff and leave you add appear here." /> : (
                <Table cols={[{ label: "Employee", w: "19%" }, { label: "Leave type" }, { label: "Leave dates" }, { label: "Duration" }, { label: "Status" }, { label: "Current balance" }, { label: "Projected balance" }, { label: "Actions", w: "140px" }]}>
                  {list.map((l) => {
                    const e = emp(st, l.emp);
                    const bal = st.balances[l.emp]?.[l.type] ?? 0;
                    return (
                      <tr key={l.id}>
                        <td><Person name={e?.name ?? l.emp} id={l.emp} /></td>
                        <td>{l.type}</td>
                        <td>{range(l)}{l.note && <span className="block text-[14px] text-[#4d5664]">({l.note})</span>}</td>
                        <td>{l.days} {l.from !== l.to && l.days !== Math.round((+new Date(l.to) - +new Date(l.from)) / 864e5) + 1 ? `working day${l.days > 1 ? "s" : ""}` : `day${l.days > 1 ? "s" : ""}`}</td>
                        <td><Chip tone={ST[l.status][0]}>{ST[l.status][1]}</Chip></td>
                        <td>{bal} days</td>
                        <td>{l.status === "pending" ? <>{Math.max(0, bal - l.days)} days<span className="block text-[14px] text-[#4d5664]">(after approval)</span></> : l.status === "approved" ? <>{bal} days<span className="block text-[14px] text-[#4d5664]">(Already deducted)</span></> : <>{bal} days<span className="block text-[14px] text-[#4d5664]">(No change)</span></>}</td>
                        <td><Btn onClick={() => setReview(l.id)}><Eye className="size-[18px]" /> Review</Btn></td>
                      </tr>
                    );
                  })}
                </Table>
              )}
            </div>
          </>
        )}
        {tab === "bal" && <Balances q={q} />}
        {tab === "cal" && <Calendar month={date.slice(0, 7)} />}
      </Card>
      {add && <AddLeave onClose={() => setAdd(false)} />}
      {review && <ReviewLeave id={review} onClose={() => setReview(null)} />}
    </StaffFrame>
  );
}

function Balances({ q }: { q: string }) {
  const { st } = useHrm();
  const types = st.settings.leaveTypes;
  const list = st.employees.filter((e) => e.status === "active" && (!q || `${e.name} ${e.id}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="mt-4">
      <p className="mb-3 text-[15px] text-[#4d5664]">Yearly entitlement: {types.map((t) => `${t.name} ${t.days}`).join(" · ")} days. Change in Reports & Settings › Leave.</p>
      <Table cols={[{ label: "Employee", w: "26%" }, ...types.map((t) => ({ label: `${t.name} (left)`, align: "right" as const })), { label: "Pending", align: "right" }]}>
        {list.map((e) => (
          <tr key={e.id}>
            <td><Person name={e.name} id={e.id} /></td>
            {types.map((t) => { const b = st.balances[e.id]?.[t.name] ?? t.days; return <td key={t.name} className={clsx("text-right", b <= 2 && "font-medium text-[#b11c29]")}>{b} / {t.days}</td>; })}
            <td className="text-right">{st.leaves.filter((l) => l.emp === e.id && l.status === "pending").reduce((t, l) => t + l.days, 0) || "—"}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function Calendar({ month }: { month: string }) {
  const { st, update } = useHrm();
  const [name, setName] = useState("");
  const [d, setD] = useState("");
  const first = `${month}-01`;
  const lead = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const n = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => addDays(first, i))];
  const on = (day: string) => st.leaves.filter((l) => l.status !== "rejected" && l.from <= day && l.to >= day);
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
      <div>
        <p className="mb-2 text-[17px] font-semibold">{monthLabel(month)}</p>
        <div className="grid grid-cols-7 gap-1.5 text-[14px]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => <span key={x} className="px-2 py-1 font-semibold text-[#4d5664]">{x}</span>)}
          {cells.map((day, i) => {
            if (!day) return <span key={i} />;
            const ls = on(day);
            const hol = st.holidays.find((h) => h.date === day);
            return (
              <div key={day} className={clsx("min-h-[78px] rounded-xl border p-1.5", day === TODAY ? "border-[#b11c29]" : "border-[#e3e7ec]", hol && "bg-[#fff6e5]")}>
                <span className="text-[13px] font-medium">{+day.slice(8)}</span>
                {hol && <span className="block truncate text-[12px] text-[#8a5a00]">{hol.name}</span>}
                {ls.slice(0, 2).map((l) => <span key={l.id} className={clsx("mt-0.5 block truncate rounded px-1 text-[12px]", l.status === "approved" ? "bg-[#e7effc] text-[#2554a8]" : "bg-[#fdf1e3] text-[#8a5a00]")}>{emp(st, l.emp)?.name.split(" ")[0]}</span>)}
                {ls.length > 2 && <span className="text-[12px] text-[#4d5664]">+{ls.length - 2}</span>}
              </div>
            );
          })}
        </div>
        <p className="mt-2 flex gap-4 text-[13px] text-[#4d5664]"><span><span className="mr-1 inline-block size-2.5 rounded bg-[#e7effc]" />Approved</span><span><span className="mr-1 inline-block size-2.5 rounded bg-[#fdf1e3]" />Pending</span><span><span className="mr-1 inline-block size-2.5 rounded bg-[#fff6e5] ring-1 ring-[#f0d9a8]" />Holiday</span></p>
      </div>
      <Card title="Holidays">
        <ul className="divide-y divide-[#e3e7ec]">
          {[...st.holidays].sort((a, b) => a.date.localeCompare(b.date)).map((h) => (
            <li key={h.date} className="flex items-center justify-between py-2.5 text-[15px]"><span>{h.name}<span className="block text-[13.5px] text-[#4d5664]">{dayName(h.date)}, {fmt(h.date)}</span></span>
              <button onClick={() => update((s) => { s.holidays = s.holidays.filter((x) => x.date !== h.date); }, `Holiday removed: ${h.name}`)} aria-label={`Remove ${h.name}`} className="grid size-8 place-items-center rounded-lg text-[#4d5664] hover:bg-[#f4f6f8] hover:text-[#b11c29]"><Trash2 className="size-4" /></button></li>
          ))}
        </ul>
        <div className="mt-3 space-y-2 rounded-xl bg-[#f4f6f8] p-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Holiday name" />
          <Input type="date" value={d} onChange={(e) => setD(e.target.value)} aria-label="Holiday date" />
          <Btn disabled={!name.trim() || !d || st.holidays.some((h) => h.date === d)} onClick={() => { update((s) => { s.holidays.push({ date: d, name: name.trim() }); }, `Holiday added: ${name} (${fmt(d)})`); setName(""); setD(""); }}>Add holiday</Btn>
        </div>
      </Card>
    </div>
  );
}

function AddLeave({ onClose }: { onClose: () => void }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const active = st.employees.filter((e) => e.status === "active");
  const [who, setWho] = useState(active[0]?.id ?? "");
  const [type, setType] = useState<LeaveReq["type"]>("Annual Leave");
  const [from, setFrom] = useState(addDays(TODAY, 1));
  const [to, setTo] = useState(addDays(TODAY, 1));
  const [note, setNote] = useState("");
  const [approve, setApprove] = useState(false);
  const days = to >= from ? leaveDays(st, who, from, to) : 0;
  const bal = st.balances[who]?.[type] ?? 0;
  const overlap = st.leaves.some((l) => l.emp === who && l.status !== "rejected" && l.from <= to && l.to >= from);
  const err = to < from ? "End date is before start date." : days === 0 ? "All selected days are roster days off." : days > bal ? `Only ${bal} ${type} days left.` : overlap ? "Overlaps another leave for this person." : "";
  return (
    <Drawer title="Add leave" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!!err} onClick={() => { update((s) => { const id = addLeave(s, { emp: who, type, from, to, note: note.trim() || undefined }); if (approve) decideLeave(s, id, true); }, `Leave ${approve ? "added and approved" : "requested"} for ${emp(st, who)?.name} (${fmt(from)})`); toast(approve ? "Leave approved · balance, roster and attendance updated" : "Leave added as Pending"); onClose(); }}>{approve ? "Add & approve" : "Add leave"}</Btn></>}>
      <Field label="Staff"><Select value={who} onChange={(e) => setWho(e.target.value)}>{active.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.id}</option>)}</Select></Field>
      <Field label="Leave type"><Select value={type} onChange={(e) => setType(e.target.value as LeaveReq["type"])}>{st.settings.leaveTypes.map((t) => <option key={t.name}>{t.name}</option>)}</Select></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From"><Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); if (to < e.target.value) setTo(e.target.value); }} /></Field>
        <Field label="To"><Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></Field>
      </div>
      <div className="rounded-xl bg-[#f4f6f8] px-4 py-3 text-[15px]">
        <p><b>{days}</b> working day{days === 1 ? "" : "s"} · balance {bal} → <b>{Math.max(0, bal - days)}</b> days</p>
        <p className="text-[13.5px] text-[#4d5664]">Roster days off are not counted.</p>
      </div>
      {err && <p className="text-[14px] text-[#b11c29]">{err}</p>}
      <Field label="Note"><Area value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" /></Field>
      <label className="flex items-center gap-3 text-[15px]"><input type="checkbox" checked={approve} onChange={(e) => setApprove(e.target.checked)} className="size-5 accent-[#b11c29]" /> Approve now (I am the approver)</label>
    </Drawer>
  );
}

function ReviewLeave({ id, onClose }: { id: string; onClose: () => void }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const l = st.leaves.find((x) => x.id === id)!;
  const e = emp(st, l.emp);
  const bal = st.balances[l.emp]?.[l.type] ?? 0;
  const days: string[] = [];
  for (let d = l.from; d <= l.to; d = addDays(d, 1)) days.push(d);
  const clash = st.leaves.filter((x) => x.id !== l.id && x.status === "approved" && x.from <= l.to && x.to >= l.from && emp(st, x.emp)?.dept === e?.dept);
  const act = (ok: boolean) => { update((s) => decideLeave(s, l.id, ok), `${l.id} ${ok ? "approved" : "rejected"} — ${e?.name}`); toast(ok ? "Approved · balance, roster and attendance updated" : "Leave rejected"); onClose(); };
  return (
    <Drawer title="Review leave" onClose={onClose} footer={l.status === "pending" ? <><Btn kind="danger" onClick={() => act(false)}>Reject</Btn><Btn kind="primary" disabled={l.days > bal} onClick={() => act(true)}>Approve</Btn></> : <Btn onClick={onClose}>Close</Btn>}>
      <div className="flex items-center justify-between"><Person name={e?.name ?? l.emp} id={l.emp} sub={`${l.emp} · ${e?.dept}`} /><Chip tone={ST[l.status][0]}>{ST[l.status][1]}</Chip></div>
      <dl className="divide-y divide-[#e3e7ec] rounded-xl border border-[#e3e7ec] px-4 text-[15px]">
        {[["Request", l.id], ["Type", l.type], ["Dates", range(l)], ["Working days", String(l.days)], ["Requested", fmtStamp(l.requested)], ["Balance", l.status === "pending" ? `${bal} → ${Math.max(0, bal - l.days)} days` : `${bal} days`]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-[#4d5664]">{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <div>
        <p className="mb-2 text-[15px] font-semibold">Roster on these days</p>
        <ul className="space-y-1">{days.map((d) => { const s = st.roster.cells[l.emp]?.[d]; return <li key={d} className="flex justify-between text-[14.5px]"><span>{dayName(d)} {fmt(d)}</span><span className={clsx(s === "Off" && "text-[#4d5664]")}>{s ?? "Not on roster"}{s === "Off" && " · not counted"}</span></li>; })}</ul>
      </div>
      {l.note && <p className="rounded-xl bg-[#f4f6f8] px-4 py-3 text-[14.5px]">Note: {l.note}</p>}
      {clash.length > 0 && <p className="rounded-xl bg-[#fff6e5] px-4 py-3 text-[14px] text-[#8a5a00]">Also on leave in {e?.dept}: {clash.map((x) => emp(st, x.emp)?.name).join(", ")}.</p>}
      {l.status === "pending" && l.days > bal && <p className="text-[14px] text-[#b11c29]">Not enough balance to approve.</p>}
      {l.status === "pending" && <p className="text-[13.5px] text-[#4d5664]">Approving deducts the balance and marks the roster and attendance as Leave.</p>}
    </Drawer>
  );
}
