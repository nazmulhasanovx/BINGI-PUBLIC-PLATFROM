"use client";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Bell, Building2, CalendarDays, Check, CheckCircle2, Download, FileClock, Info, KeyRound, Layers, Umbrella, Wallet, X } from "lucide-react";
import { TODAY, addDays, fmt, fmtStamp, money, monthLabel, runTotals, useHrm, type Dept, type HrmState, type Settings } from "@/lib/hrm/store";
import { useProperty } from "../property";
import { DateBox, StaffFrame, useToast } from "./Frame";
import { Btn, Card, Drawer, Field, Input, Select, Table, useQuery } from "./ui";

type Sec = "org" | "access" | "attendance" | "leave" | "payroll" | "approvals" | "notify" | "audit";
const NAV: { v: Sec; label: string; icon: typeof Building2 }[] = [
  { v: "org", label: "Organization", icon: Building2 }, { v: "access", label: "Access", icon: KeyRound }, { v: "attendance", label: "Attendance", icon: CalendarDays },
  { v: "leave", label: "Leave", icon: Umbrella }, { v: "payroll", label: "Payroll", icon: Wallet }, { v: "approvals", label: "Approvals", icon: CheckCircle2 },
  { v: "notify", label: "Notifications", icon: Bell }, { v: "audit", label: "Audit", icon: FileClock },
];
const MODES: { v: Settings["attendance"]; title: string; text: string; label: string }[] = [
  { v: "machine", title: "Machine attendance (ZKT)", text: "Use a ZKT device to record check in and check out attendance.", label: "Machine" },
  { v: "manual", title: "Manual attendance", text: "Record attendance manually by the HR team.", label: "Manual" },
  { v: "none", title: "No attendance", text: "No attendance tracking or automatic attendance deductions. Fixed payroll, leave and schedules remain available.", label: "None" },
];

/** Human-readable list of what changed between saved and draft settings. */
function diff(a: Settings, b: Settings, eff: string): string[] {
  const out: string[] = [];
  if (a.attendance !== b.attendance) out.push(`Attendance: ${MODES.find((m) => m.v === a.attendance)!.label} → ${MODES.find((m) => m.v === b.attendance)!.label} (applies now — effective-date scheduling needs the HMS backend; picked date: ${fmt(eff)})`);
  b.leaveTypes.forEach((t, i) => { if (a.leaveTypes[i]?.days !== t.days) out.push(`${t.name}: ${a.leaveTypes[i]?.days} → ${t.days} days / year`); });
  if (a.payDay !== b.payDay) out.push(`Pay day: ${a.payDay} → ${b.payDay} of the month`);
  if (a.approver !== b.approver) out.push(`Approver: ${a.approver} → ${b.approver}`);
  (Object.keys(b.notify) as (keyof Settings["notify"])[]).forEach((k) => { if (a.notify[k] !== b.notify[k]) out.push(`Notify on ${k}: ${a.notify[k] ? "on" : "off"} → ${b.notify[k] ? "on" : "off"}`); });
  if (a.departments.join() !== b.departments.join()) out.push(`Departments: ${b.departments.length} (${b.departments.filter((d) => !a.departments.includes(d)).map((d) => `+${d}`).concat(a.departments.filter((d) => !b.departments.includes(d)).map((d) => `−${d}`)).join(", ")})`);
  return out;
}

export function SettingsPage() {
  const { st, update } = useHrm();
  const toast = useToast();
  const [viewState, setView] = useState<"reports" | "settings" | null>(null);
  const qs = useQuery("s");
  const view = viewState ?? (qs === "reports" ? "reports" : "settings");
  const [secState, setSec] = useState<Sec | null>(null);
  const sec: Sec = secState ?? (NAV.some((n) => n.v === qs) ? (qs as Sec) : "attendance");
  const [q, setQ] = useState("");
  // null = nothing edited; the page shows the saved settings
  const [edit, setDraft] = useState<Settings | null>(null);
  const draft = edit ?? st.settings;
  const [eff, setEff] = useState(addDays(TODAY, 1));
  const [review, setReview] = useState(false);
  const changes = useMemo(() => diff(st.settings, draft, eff), [st.settings, draft, eff]);
  const nav = NAV.filter((n) => !q || n.label.toLowerCase().includes(q.toLowerCase()));
  const apply = () => {
    update((s) => { s.settings = { ...draft, pendingAttendance: undefined }; }, `HR settings changed: ${changes.join("; ")}`);
    toast(`${changes.length} change${changes.length > 1 ? "s" : ""} saved`);
    setDraft(null);
    setReview(false);
  };
  return (
    <StaffFrame tab="settings" search={q} onSearch={setQ} searchPlaceholder="Search settings"
      action={view === "settings" ? <Btn kind="primary" disabled={!changes.length} onClick={() => setReview(true)}><Check className="size-[18px]" /> Review changes{changes.length ? ` (${changes.length})` : ""}</Btn> : undefined}
      right={view === "settings" ? <DateBox value={eff} onChange={setEff} label={fmt(eff)} /> : undefined}>
      <Card>
        <h2 className="text-[24px] font-semibold">Reports &amp; Settings</h2>
        <div className="mt-3 inline-flex flex-wrap gap-1 rounded-xl bg-[#e9edf2] p-1">
          {(["reports", "settings"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={clsx("rounded-lg px-6 py-2 text-[16px] capitalize", view === v ? "bg-[#ffe7e4] font-medium text-[#b11c29]" : "")}>{v}</button>)}
        </div>
        <div className="mt-4 border-t border-[#e3e7ec] pt-4">
          {view === "reports" ? <Reports /> : (
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <nav className="space-y-1 lg:border-r lg:border-[#e3e7ec] lg:pr-5" aria-label="Settings sections">
                {nav.map((n) => (
                  <button key={n.v} onClick={() => setSec(n.v)} className={clsx("flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[16.5px]", sec === n.v ? "bg-[#ffe7e4] font-medium text-[#b11c29]" : "hover:bg-[#f4f6f8]")}><n.icon className="size-5" /> {n.label}</button>
                ))}
              </nav>
              <div className="min-w-0">
                {sec === "attendance" && <AttendanceSec d={draft} set={setDraft} eff={eff} saved={st.settings.attendance} />}
                {sec === "org" && <OrgSec d={draft} set={setDraft} st={st} />}
                {sec === "access" && <AccessSec st={st} />}
                {sec === "leave" && <LeaveSec d={draft} set={setDraft} />}
                {sec === "payroll" && <PayrollSec d={draft} set={setDraft} />}
                {sec === "approvals" && <ApprovalSec d={draft} set={setDraft} st={st} />}
                {sec === "notify" && <NotifySec d={draft} set={setDraft} />}
                {sec === "audit" && <AuditSec st={st} />}
              </div>
            </div>
          )}
        </div>
      </Card>
      {review && (
        <Drawer title="Review changes" onClose={() => setReview(false)} footer={<><Btn onClick={() => { setDraft(null); setReview(false); }}>Discard</Btn><Btn kind="primary" onClick={apply}>Save {changes.length} change{changes.length > 1 ? "s" : ""}</Btn></>}>
          <ul className="space-y-2">{changes.map((c) => <li key={c} className="rounded-xl bg-[#f4f6f8] px-4 py-3 text-[15px]">{c}</li>)}</ul>
          <p className="flex gap-2 text-[14px] text-[#4d5664]"><Info className="mt-0.5 size-4 shrink-0" /> Applies to this property only. Previous records stay available.</p>
        </Drawer>
      )}
    </StaffFrame>
  );
}

type SP = { d: Settings; set: (s: Settings) => void };
function Head({ title, sub }: { title: string; sub?: string }) {
  return <div className="mb-4"><h3 className="text-[25px] font-semibold leading-tight">{title}</h3>{sub && <p className="text-[16px] text-[#4d5664]">{sub}</p>}</div>;
}

function AttendanceSec({ d, set, eff, saved }: SP & { eff: string; saved: Settings["attendance"] }) {
  const hotel = useProperty();
  return (
    <>
      <Head title="Attendance settings" sub={hotel.name.split(" ").slice(0, 2).join(" ")} />
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2.5 rounded-xl border border-[#d3d8df] px-4 py-2 text-[15.5px]"><CalendarDays className="size-[18px]" /> Effective date: <b className="font-medium">{fmt(eff)}</b></span>
        <span className="inline-flex items-center gap-2.5 rounded-xl border border-[#d3d8df] px-4 py-2 text-[15.5px]"><Layers className="size-[18px]" /> Current mode: <b className="font-medium">{MODES.find((m) => m.v === saved)!.label}</b></span>
        <span className="ml-auto inline-flex items-center gap-2.5 rounded-xl bg-[#e9edf2] px-4 py-2 text-[15.5px] text-[#4d5664]"><Info className="size-[18px]" /> Review changes before saving.</span>
      </div>
      <div className="mt-5 space-y-3" role="radiogroup" aria-label="Attendance method">
        {MODES.map((m) => (
          <button key={m.v} role="radio" aria-checked={d.attendance === m.v} onClick={() => set({ ...d, attendance: m.v })} className={clsx("flex w-full items-center gap-6 rounded-xl border-2 px-6 py-4 text-left", d.attendance === m.v ? "border-[#ef6f68] bg-[#ffe7e4]" : "border-[#e3e7ec] hover:bg-[#f4f6f8]")}>
            <span className={clsx("grid size-6 shrink-0 place-items-center rounded-full border-2", d.attendance === m.v ? "border-[#b11c29]" : "border-[#8a8f9c]")}>{d.attendance === m.v && <span className="size-3 rounded-full bg-[#b11c29]" />}</span>
            <span><span className="block text-[17px] font-semibold">{m.title}</span><span className="text-[15.5px] text-[#3b404c]">{m.text}</span></span>
          </button>
        ))}
      </div>
      {d.attendance === "machine" && saved !== "machine" && <p className="mt-3 rounded-xl bg-[#fff6e5] px-4 py-3 text-[14.5px] text-[#8a5a00]">The ZKT device link is not live in this build. You can switch to see the machine screens; punches will show as sample logs.</p>}
      <p className="mt-5 flex items-center gap-3 text-[15.5px] text-[#4d5664]"><Info className="size-5" /> Applies to this property only. Previous records stay available.</p>
    </>
  );
}

function OrgSec({ d, set, st }: SP & { st: HrmState }) {
  const hotel = useProperty();
  const [n, setN] = useState("");
  const count = (x: Dept) => st.employees.filter((e) => e.dept === x && e.status !== "former").length;
  return (
    <>
      <Head title="Organization" sub={hotel.name} />
      <Table cols={[{ label: "Department" }, { label: "Staff", align: "right" }, { label: "", w: "60px" }]}>
        {d.departments.map((x) => <tr key={x}><td>{x}</td><td className="text-right">{count(x)}</td><td>{count(x) === 0 && <button onClick={() => set({ ...d, departments: d.departments.filter((y) => y !== x) })} aria-label={`Remove ${x}`} className="grid size-8 place-items-center rounded-lg text-[#4d5664] hover:bg-[#f4f6f8]"><X className="size-4" /></button>}</td></tr>)}
      </Table>
      <div className="mt-3 flex max-w-[420px] gap-2"><Input value={n} onChange={(e) => setN(e.target.value)} placeholder="New department" /><Btn disabled={!n.trim() || d.departments.includes(n.trim() as Dept)} onClick={() => { set({ ...d, departments: [...d.departments, n.trim() as Dept] }); setN(""); }}>Add</Btn></div>
      <p className="mt-3 text-[14px] text-[#4d5664]">Departments with staff can’t be removed.</p>
    </>
  );
}

function AccessSec({ st }: { st: HrmState }) {
  const c = (a: string) => st.employees.filter((e) => e.access === a).length;
  const roles: [string, string][] = [["Hotel Admin", "Everything in Team & HR, including payroll and settings"], ["HR / Manager", "People, attendance, schedule, leave, approvals"], ["Supervisor", "Own department attendance and schedule"], ["Staff (app)", "Own roster, leave requests, payslips"]];
  return (
    <>
      <Head title="Access" sub="Who can use Team & HR" />
      <div className="grid gap-3 sm:grid-cols-4">{[["Linked", c("linked")], ["Invited", c("invited")], ["Not invited", c("not-invited")], ["Disabled", c("disabled")]].map(([k, v]) => <div key={k as string} className="rounded-xl border border-[#e3e7ec] px-4 py-3"><p className="text-[14px] text-[#4d5664]">{k}</p><p className="text-[24px] font-semibold">{v}</p></div>)}</div>
      <div className="mt-4"><Table cols={[{ label: "Role" }, { label: "Can do" }]}>{roles.map(([r, t]) => <tr key={r}><td className="font-medium">{r}</td><td>{t}</td></tr>)}</Table></div>
      <p className="mt-3 text-[14px] text-[#4d5664]">Role permissions are managed in HMS Settings › Users & roles.</p>
    </>
  );
}

function LeaveSec({ d, set }: SP) {
  return (
    <>
      <Head title="Leave" sub="Yearly entitlement per person" />
      <div className="max-w-[520px] space-y-3">
        {d.leaveTypes.map((t, i) => (
          <div key={t.name} className="flex items-center justify-between rounded-xl border border-[#e3e7ec] px-4 py-3"><span className="text-[16px]">{t.name}</span><span className="flex items-center gap-2"><Input type="number" min={0} max={60} value={t.days} onChange={(e) => set({ ...d, leaveTypes: d.leaveTypes.map((x, j) => (j === i ? { ...x, days: Math.min(60, Math.max(0, Number(e.target.value) || 0)) } : x)) })} className="w-[90px] text-right" aria-label={`${t.name} days`} /> days</span></div>
        ))}
      </div>
      <p className="mt-3 text-[14px] text-[#4d5664]">Current balances don’t change.</p>
    </>
  );
}

function PayrollSec({ d, set }: SP) {
  return (
    <>
      <Head title="Payroll" sub="Currency: BDT" />
      <Field label="Salary pay day (day of next month)"><Select value={d.payDay} onChange={(e) => set({ ...d, payDay: Number(e.target.value) })} className="max-w-[240px]">{Array.from({ length: 28 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
      <p className="mt-3 text-[14px] text-[#4d5664]">Payments are recorded only — bank/bKash transfers are not connected.</p>
    </>
  );
}

function ApprovalSec({ d, set, st }: SP & { st: HrmState }) {
  const opts = ["Hotel Manager", "Hotel Admin", ...st.employees.filter((e) => e.status === "active" && /Supervisor|Manager/.test(e.position)).map((e) => e.name)];
  return (
    <>
      <Head title="Approvals" sub="Leave, corrections, overtime, shift swaps, advances" />
      <Field label="Assigned approver"><Select value={d.approver} onChange={(e) => set({ ...d, approver: e.target.value })} className="max-w-[320px]">{[...new Set(opts)].map((o) => <option key={o}>{o}</option>)}</Select></Field>
      <p className="mt-3 text-[14px] text-[#4d5664]">Existing requests keep their approver.</p>
    </>
  );
}

function NotifySec({ d, set }: SP) {
  const rows: [keyof Settings["notify"], string][] = [["leave", "Leave requests"], ["attendance", "Missing attendance & corrections"], ["payroll", "Payroll ready / due"], ["hiring", "New candidates & joinings"]];
  return (
    <>
      <Head title="Notifications" sub="In-app alerts for HR admins" />
      <ul className="max-w-[560px] divide-y divide-[#e3e7ec] rounded-xl border border-[#e3e7ec]">
        {rows.map(([k, l]) => (
          <li key={k} className="flex items-center justify-between px-4 py-3.5 text-[16px]">{l}
            <button role="switch" aria-checked={d.notify[k]} aria-label={l} onClick={() => set({ ...d, notify: { ...d.notify, [k]: !d.notify[k] } })} className={clsx("relative h-7 w-12 rounded-full transition-colors", d.notify[k] ? "bg-[#34c759]" : "bg-[#d3d8df]")}><span className={clsx("absolute top-0.5 size-6 rounded-full bg-white shadow transition-all", d.notify[k] ? "left-[22px]" : "left-0.5")} /></button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[14px] text-[#4d5664]">Email/SMS delivery is not connected yet.</p>
    </>
  );
}

function AuditSec({ st }: { st: HrmState }) {
  const csv = () => download("hr-audit.csv", [["Time", "Change"], ...st.activity.map((a) => [fmtStamp(a.at), a.text])]);
  return (
    <>
      <div className="flex items-start justify-between"><Head title="Audit" sub={`${st.activity.length} recorded changes`} /><Btn onClick={csv}><Download className="size-4" /> CSV</Btn></div>
      <ul className="max-h-[520px] divide-y divide-[#e3e7ec] overflow-y-auto rounded-xl border border-[#e3e7ec]">{st.activity.map((a, i) => <li key={i} className="flex justify-between gap-4 px-4 py-2.5 text-[15px]"><span>{a.text}</span><span className="shrink-0 text-[#4d5664]">{fmtStamp(a.at)}</span></li>)}</ul>
    </>
  );
}

function download(name: string, rows: readonly (readonly (string | number)[])[]) {
  const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

function Reports() {
  const { st } = useHrm();
  const toast = useToast();
  const active = st.employees.filter((e) => e.status === "active");
  const byDept = st.settings.departments.map((d) => [d, active.filter((e) => e.dept === d).length] as const).filter(([, n]) => n > 0);
  const days = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6));
  const att = days.map((d) => { const day = st.attendance[d] ?? {}; return { d, present: active.filter((e) => ["present", "half"].includes(day[e.id]?.status ?? "")).length, leave: active.filter((e) => day[e.id]?.status === "leave").length, absent: active.filter((e) => day[e.id]?.status === "absent").length }; });
  const leaveUse = st.settings.leaveTypes.map((t) => [t.name, st.leaves.filter((l) => l.type === t.name && l.status === "approved").reduce((s, l) => s + l.days, 0), st.leaves.filter((l) => l.type === t.name && l.status === "pending").reduce((s, l) => s + l.days, 0)] as const);
  const max = Math.max(1, ...byDept.map(([, n]) => n));
  const dl = (name: string, rows: readonly (readonly (string | number)[])[]) => { download(name, rows); toast(`${name} downloaded`); };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Headcount by department" right={<Btn onClick={() => dl("headcount.csv", [["Department", "Active staff"], ...byDept])}><Download className="size-4" /> CSV</Btn>}>
        <ul className="space-y-2.5">{byDept.map(([d, n]) => <li key={d} className="grid grid-cols-[130px_1fr_32px] items-center gap-3 text-[15px]"><span>{d}</span><span className="h-3 rounded-full bg-[#e9edf2]"><span className="block h-3 rounded-full bg-[#ef6f68]" style={{ width: `${(n / max) * 100}%` }} /></span><span className="text-right">{n}</span></li>)}</ul>
        <p className="mt-3 text-[14px] text-[#4d5664]">{active.length} active · {st.employees.filter((e) => e.status === "inactive").length} inactive · {st.employees.filter((e) => e.status === "former").length} former</p>
      </Card>
      <Card title="Attendance · last 7 days" right={<Btn onClick={() => dl("attendance-7d.csv", [["Date", "Present", "Leave", "Absent"], ...att.map((a) => [a.d, a.present, a.leave, a.absent])])}><Download className="size-4" /> CSV</Btn>}>
        {st.settings.attendance === "none" ? <p className="text-[15px] text-[#4d5664]">Attendance is off.</p> : (
          <Table cols={[{ label: "Date" }, { label: "Present", align: "right" }, { label: "Leave", align: "right" }, { label: "Absent", align: "right" }]}>{att.map((a) => <tr key={a.d}><td>{fmt(a.d)}</td><td className="text-right">{a.present}</td><td className="text-right">{a.leave}</td><td className="text-right">{a.absent}</td></tr>)}</Table>
        )}
      </Card>
      <Card title="Leave usage" right={<Btn onClick={() => dl("leave-usage.csv", [["Type", "Approved days", "Pending days"], ...leaveUse])}><Download className="size-4" /> CSV</Btn>}>
        <Table cols={[{ label: "Type" }, { label: "Approved days", align: "right" }, { label: "Pending days", align: "right" }]}>{leaveUse.map(([t, a, p]) => <tr key={t}><td>{t}</td><td className="text-right">{a}</td><td className="text-right">{p}</td></tr>)}</Table>
      </Card>
      <Card title="Payroll cost" right={<Btn onClick={() => dl("payroll.csv", [["Month", "Gross", "Net", "Paid", "Due"], ...st.runs.map((r) => { const t = runTotals(r); return [monthLabel(r.month), t.gross, t.net, t.paid, t.due]; })])}><Download className="size-4" /> CSV</Btn>}>
        {st.runs.length === 0 ? <p className="text-[15px] text-[#4d5664]">No payroll yet.</p> : (
          <Table cols={[{ label: "Month" }, { label: "Net (BDT)", align: "right" }, { label: "Paid", align: "right" }, { label: "Due", align: "right" }]}>{st.runs.map((r) => { const t = runTotals(r); return <tr key={r.id}><td>{monthLabel(r.month)}</td><td className="text-right">{money(t.net)}</td><td className="text-right">{money(t.paid)}</td><td className={clsx("text-right", t.due > 0 && "font-medium text-[#b45309]")}>{money(t.due)}</td></tr>; })}</Table>
        )}
        <p className="mt-2 text-[13.5px] text-[#4d5664]">Monthly salary bill (active staff): BDT {money(active.reduce((t, e) => t + e.salary.basic + e.salary.house + e.salary.food + e.salary.transport, 0))}</p>
      </Card>
    </div>
  );
}
