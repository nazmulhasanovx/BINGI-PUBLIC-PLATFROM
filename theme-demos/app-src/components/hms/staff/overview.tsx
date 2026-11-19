"use client";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowLeftRight, CalendarDays, Check, ChevronRight, Clock, Hourglass, Plus, User, Users } from "lucide-react";
import { TODAY, fmt, fmtShort, fmtStamp, useHrm, type Dept, type Employee } from "@/lib/hrm/store";
import { addEmployee, pendingCounts } from "@/lib/hrm/actions";
import { useHrmMode } from "@/lib/hrm/mode";
import { EasyTeam } from "./easy";
import { StaffFrame, DateBox, useToast } from "./Frame";
import { Btn, Card, Chip, Drawer, Field, Input, Select, Table } from "./ui";

export const REQUIRED: Partial<Record<Dept, number>> = { Housekeeping: 6, "Front Office": 4, Kitchen: 4, Maintenance: 2, Security: 4 };

export function useDay(date: string) {
  const { st } = useHrm();
  const active = st.employees.filter((e) => e.status === "active");
  const recs = st.attendance[date] ?? {};
  const present = active.filter((e) => recs[e.id]?.status === "present" || recs[e.id]?.status === "half").length;
  const leave = active.filter((e) => recs[e.id]?.status === "leave").length;
  const absent = active.filter((e) => recs[e.id]?.status === "absent").length;
  const notMarked = active.filter((e) => !recs[e.id]).length;
  const late = active.filter((e) => /Late/.test(recs[e.id]?.remark ?? "")).length;
  return { active, recs, present, leave, absent, notMarked, late };
}

/** /hms/staff — Easy mode shows the simple team screen, Full mode the HR overview. */
export function StaffHome() {
  const { mode } = useHrmMode();
  return mode === "easy" ? <EasyTeam /> : <OverviewPage />;
}

export function OverviewPage() {
  const { st } = useHrm();
  const [date, setDate] = useState(TODAY);
  const [q, setQ] = useState("");
  const [add, setAdd] = useState(false);
  const d = useDay(date);
  const pc = pendingCounts(st);
  const duty = (Object.keys(REQUIRED) as Dept[]).map((dept) => {
    const assigned = d.active.filter((e) => e.dept === dept && ["Morning", "Evening", "Night"].includes(st.roster.cells[e.id]?.[date] ?? "")).length;
    const req = REQUIRED[dept]!;
    return { dept, assigned, req, cov: Math.round((Math.min(assigned, req) / req) * 100) };
  });
  const updates = [
    ...st.candidates.filter((c) => c.offer?.status === "accepted" && !c.employeeId).map((c) => ({ name: c.name, text: `Joining on ${fmt(c.offer!.start)}`, date: c.offer!.start, href: `/hms/staff/hiring/${c.id}` })),
    ...st.employees.filter((e) => e.probationEnd && e.probationEnd >= date).map((e) => ({ name: e.name, text: `Probation review on ${fmt(e.probationEnd!)}`, date: e.probationEnd!, href: `/hms/staff/people/${e.id}` })),
    ...st.employees.flatMap((e) => e.docs.filter((x) => x.expires && x.expires >= date).map((x) => ({ name: e.name, text: `Document renewal on ${fmt(x.expires!)}`, date: x.expires!, href: `/hms/staff/people/${e.id}` }))),
  ].filter((u) => !q || u.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const total = st.employees.filter((e) => e.status !== "former").length;
  const approvals = [
    { icon: CalendarDays, label: "Leave requests", n: pc.leave, href: "/hms/staff/leave" },
    { icon: Clock, label: "Attendance corrections", n: pc.corrections, href: "/hms/staff/operations" },
    { icon: Hourglass, label: "Overtime requests", n: pc.overtime, href: "/hms/staff/operations" },
    { icon: ArrowLeftRight, label: "Shift swap", n: pc.swap, href: "/hms/staff/operations" },
  ];
  const mode = st.settings.attendance;
  return (
    <StaffFrame tab="overview" search={q} onSearch={setQ} action={<Btn kind="primary" onClick={() => setAdd(true)}><Plus className="size-[18px]" /> Add staff</Btn>} right={<DateBox value={date} onChange={setDate} label={fmt(date)} />}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi icon={<Users className="size-6 text-[#b11c29]" />} bg="bg-[#ffe7e4]" label="Total staff" value={total} href="/hms/staff/people" />
        <Kpi icon={<Check className="size-6 text-[#1c7d45]" />} bg="bg-[#e5f6ea]" label="Present" value={d.present} href="/hms/staff/attendance" />
        <Kpi icon={<CalendarDays className="size-6 text-[#1d4ed8]" />} bg="bg-[#e7effd]" label="On leave" value={d.leave} href="/hms/staff/leave" />
        <Kpi icon={<AlertTriangle className="size-6 text-[#c47f12]" />} bg="bg-[#fdf3df]" label="Needs attention" value={d.absent + d.notMarked} href="/hms/staff/attendance" />
      </div>
      <p className="mt-2.5 text-[14px] text-[#4d5664]">{d.active.length} active staff · Includes {d.late} late arrival{d.late === 1 ? "" : "s"}</p>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <Card title="Today’s duty" right={<Link href="/hms/staff/schedule" className="text-[15px] font-medium text-[#b11c29]">View schedule</Link>}>
            <Table cols={[{ label: "Department" }, { label: "Assigned" }, { label: "Required" }, { label: "Coverage" }]}>
              {duty.map((r) => (
                <tr key={r.dept}>
                  <td className="font-medium">{r.dept}</td>
                  <td>{r.assigned}</td>
                  <td>{r.req}</td>
                  <td><Chip tone={r.cov >= 100 ? "green" : r.cov >= 75 ? "amber" : "red"}>{r.cov}%</Chip></td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card title="People updates">
            {updates.length === 0 && <p className="text-[14px] text-[#4d5664]">Nothing coming up.</p>}
            <ul className="divide-y divide-[#e3e7ec]">
              {updates.map((u) => (
                <li key={u.name + u.text}>
                  <Link href={u.href} className="grid grid-cols-[28px_1fr_1.4fr_auto] items-center gap-3 py-2.5 text-[15px] hover:text-[#b11c29]">
                    <User className="size-5 text-[#4d5664]" /><span className="font-medium">{u.name}</span><span className="text-[#4d5664]">{u.text}</span><span className="text-[#4d5664]">{fmtShort(u.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="Pending approvals" right={<Link href="/hms/staff/operations" className="text-[15px] font-medium text-[#b11c29]">View all</Link>}>
            <ul className="divide-y divide-[#e3e7ec]">
              {approvals.map((a) => (
                <li key={a.label}>
                  <Link href={a.href} className="flex items-center gap-3 py-2 text-[15px] hover:text-[#b11c29]">
                    <span className="grid size-8 place-items-center rounded-lg bg-[#ffe7e4] text-[#b11c29]"><a.icon className="size-[18px]" /></span>
                    <span className="flex-1">{a.label}</span>
                    <Chip tone={a.n ? "red" : "gray"}>{a.n}</Chip>
                    <ChevronRight className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="text-[12.5px] font-medium uppercase tracking-wider text-[#4d5664]">Property setting</p>
            <p className="mt-1 flex items-center gap-2 text-[19px] font-semibold">Attendance method <Chip tone="red">{mode === "machine" ? "Machine" : mode === "manual" ? "Manual" : "No attendance"}</Chip></p>
            <p className="mt-1.5 text-[14.5px] text-[#4d5664]">{mode === "manual" ? "Daily attendance is entered by authorised managers." : mode === "machine" ? "Check-in and check-out come from the ZKT device." : "Daily attendance is not tracked for this property."}</p>
            <p className="mt-1 text-[14px] text-[#4d5664]">Available methods: Machine · Manual · No attendance</p>
            <Link href="/hms/staff/settings?s=attendance" className="mt-2 inline-flex items-center gap-1 text-[15px] font-medium text-[#b11c29]">Manage attendance settings <ChevronRight className="size-4" /></Link>
          </Card>
          <Card title="Recent activity">
            <ul className="space-y-2.5">
              {st.activity.slice(0, 4).map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-[14.5px]"><Clock className="mt-0.5 size-[18px] shrink-0 text-[#4d5664]" /><span className="flex-1">{a.text}</span><span className="shrink-0 text-[#4d5664]">{fmtStamp(a.at)}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      {add && <AddStaff onClose={() => setAdd(false)} />}
    </StaffFrame>
  );
}

function Kpi({ icon, bg, label, value, href }: { icon: React.ReactNode; bg: string; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e3e7ec] bg-white px-4 py-3.5 transition-shadow hover:shadow-[0_8px_24px_-16px_rgb(0_0_0/0.3)] sm:gap-5 sm:px-6 sm:py-4">
      <span className={`hidden size-14 shrink-0 place-items-center rounded-xl sm:grid ${bg}`}>{icon}</span>
      <span className="min-w-0"><span className="block truncate text-[14px] text-[#4d5664] sm:text-[15px]">{label}</span><span className="block text-[22px] font-bold leading-tight sm:text-[26px]">{value}</span></span>
    </Link>
  );
}

/** Add staff (also used by People). Creates the employee, leave balances and a roster row. */
export function AddStaff({ onClose, initial }: { onClose: () => void; initial?: Partial<Employee> }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const [f, setF] = useState({ name: initial?.name ?? "", dept: (initial?.dept ?? "Housekeeping") as Dept, position: initial?.position ?? "", phone: "", email: "", joined: TODAY, type: "Full time" as Employee["type"], basic: 12000, invite: true });
  const ok = f.name.trim().length > 2 && f.position.trim() && /^01\d{9}$/.test(f.phone.replace(/\D/g, ""));
  const save = () => {
    let id = "";
    update((s) => { id = addEmployee(s, { ...f, phone: f.phone.replace(/\D/g, "") }); }, `${f.name} added to staff`);
    toast(`${f.name} added as ${id}`);
    onClose();
  };
  return (
    <Drawer title="Add staff" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!ok} onClick={save}>Add staff</Btn></>}>
      <div className="space-y-4">
        <Field label="Full name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Rahim Uddin" autoFocus /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Department"><Select value={f.dept} onChange={(e) => setF({ ...f, dept: e.target.value as Dept })}>{st.settings.departments.map((d) => <option key={d}>{d}</option>)}</Select></Field>
          <Field label="Position"><Input value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} placeholder="e.g. Room Attendant" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mobile" hint="11 digits, starts with 01"><Input inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="01XXXXXXXXX" /></Field>
          <Field label="Email (optional)"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Joining date"><Input type="date" value={f.joined} onChange={(e) => setF({ ...f, joined: e.target.value })} /></Field>
          <Field label="Employment"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Employee["type"] })}><option>Full time</option><option>Part time</option><option>Contract</option></Select></Field>
        </div>
        <Field label="Basic salary (BDT / month)" hint="House, food and transport are added from the salary template"><Input type="number" min={0} value={f.basic} onChange={(e) => setF({ ...f, basic: Number(e.target.value) || 0 })} /></Field>
        <label className="flex items-center gap-2.5 text-[14.5px]"><input type="checkbox" checked={f.invite} onChange={(e) => setF({ ...f, invite: e.target.checked })} className="size-4 accent-[#b11c29]" /> Send BinGi staff app invitation by SMS</label>
      </div>
    </Drawer>
  );
}
