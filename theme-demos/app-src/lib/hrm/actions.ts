// HRM business rules in one place (used by every page). Pure functions on a draft state.
import { addDays, emp, gross, TODAY, type Employee, type HrmState, type LeaveReq, type OpsReq, type Payment } from "./store";

const dates = (from: string, to: string) => { const out: string[] = []; for (let d = from; d <= to; d = addDays(d, 1)) out.push(d); return out; };

/** Approve leave: deduct the working days, mark attendance + roster as Leave. */
export function decideLeave(s: HrmState, id: string, approve: boolean) {
  const l = s.leaves.find((x) => x.id === id);
  if (!l || l.status !== "pending") return;
  l.status = approve ? "approved" : "rejected";
  if (!approve) return;
  s.balances[l.emp][l.type] = Math.max(0, s.balances[l.emp][l.type] - l.days);
  for (const d of dates(l.from, l.to)) {
    const rosterDay = s.roster.cells[l.emp]?.[d];
    if (rosterDay === "Off") continue; // roster off days don't use leave
    if (rosterDay !== undefined) s.roster.cells[l.emp][d] = "Leave";
    (s.attendance[d] ??= {})[l.emp] = { status: "leave", remark: "Approved leave", source: "manual" };
  }
}

/** Working days between dates, skipping the employee's roster Off days. */
export function leaveDays(s: HrmState, empId: string, from: string, to: string) {
  return dates(from, to).filter((d) => s.roster.cells[empId]?.[d] !== "Off").length;
}

export function addLeave(s: HrmState, l: Omit<LeaveReq, "id" | "status" | "requested" | "days">) {
  const id = `LV-${100 + s.leaves.length + 1}`;
  const days = leaveDays(s, l.emp, l.from, l.to);
  const offs = dates(l.from, l.to).filter((d) => s.roster.cells[l.emp]?.[d] === "Off");
  s.leaves.unshift({ ...l, id, days, status: "pending", requested: `${TODAY}T09:00`, note: l.note || (offs.length ? `${offs.map((d) => d.slice(8)).join(", ")} Nov: roster off` : undefined) });
  return id;
}

/** Approve / reject other requests. */
export function decideRequest(s: HrmState, id: string, approve: boolean) {
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "pending") return;
  r.status = approve ? "approved" : "rejected";
  if (!approve) return;
  if (r.kind === "Attendance correction") {
    const m = r.details.match(/(\d{2}:\d{2})/);
    const rec = (s.attendance[r.date] ??= {})[r.emp] ?? { status: "present", source: "manual" };
    if (m) rec.out = m[1];
    rec.remark = "Corrected";
    s.attendance[r.date][r.emp] = rec;
  }
  if (r.kind === "Shift swap") {
    const ds = r.details.match(/(\d{2}) Nov \d{4} ↔ (\d{2}) Nov/);
    if (ds) {
      const a = `2026-11-${ds[1]}`, b = `2026-11-${ds[2]}`;
      const row = s.roster.cells[r.emp];
      if (row && row[a] && row[b]) [row[a], row[b]] = [row[b], row[a]];
    }
  }
}

export function pendingCounts(s: HrmState) {
  const p = s.requests.filter((r) => r.status === "pending");
  return {
    leave: s.leaves.filter((l) => l.status === "pending").length,
    corrections: p.filter((r) => r.kind === "Attendance correction").length,
    overtime: p.filter((r) => r.kind === "Overtime").length,
    swap: p.filter((r) => r.kind === "Shift swap").length,
  };
}

export function nextEmpId(s: HrmState) {
  const n = Math.max(...s.employees.map((e) => Number(e.id.slice(3)))) + 1;
  return `EMP${String(n).padStart(3, "0")}`;
}

export function addEmployee(s: HrmState, e: Pick<Employee, "name" | "dept" | "position" | "phone" | "email" | "joined" | "type"> & { basic: number; invite: boolean }) {
  const id = nextEmpId(s);
  s.employees.push({
    id, name: e.name, dept: e.dept, position: e.position, phone: e.phone, email: e.email, joined: e.joined, type: e.type,
    status: "active", access: e.invite ? "invited" : "not-invited", manager: s.settings.approver, emergency: "",
    probationEnd: addDays(e.joined, 90), docs: [], assets: [], reviews: [], trainings: [],
    salary: { basic: e.basic, house: Math.round(e.basic * 0.3), food: 2000, transport: 1500 },
  });
  s.balances[id] = Object.fromEntries(s.settings.leaveTypes.map((t) => [t.name, t.days])) as HrmState["balances"][string];
  s.roster.cells[id] = Object.fromEntries(Object.keys(Object.values(s.roster.cells)[0] ?? {}).map((d) => [d, "Morning"]));
  return id;
}

/** New payroll run for a month from each active employee's salary structure + adjustments. */
export function prepareRun(s: HrmState, month: string, label: string) {
  if (s.runs.some((r) => r.month === month)) return month;
  const lines = s.employees.filter((e) => e.status === "active").map((e) => {
    const adj = s.adjustments.filter((a) => a.emp === e.id && a.month === month);
    const bonus = adj.filter((a) => a.kind === "Bonus").reduce((t, a) => t + a.amount, 0);
    const ded = adj.filter((a) => a.kind !== "Bonus").reduce((t, a) => t + a.amount, 0);
    return { emp: e.id, gross: gross(e) + bonus, deductions: ded, paid: 0 };
  });
  s.runs.unshift({ id: month, month, label, step: 1, status: "draft", lines, payments: [] });
  return month;
}

export function recordPayment(s: HrmState, runId: string, p: Payment) {
  const r = s.runs.find((x) => x.id === runId);
  const l = r?.lines.find((x) => x.emp === p.emp);
  if (!r || !l) return;
  const due = l.gross - l.deductions - l.paid;
  const amt = Math.min(p.amount, due);
  if (amt <= 0) return;
  l.paid += amt;
  r.payments.unshift({ ...p, amount: amt });
}

/** Candidate → employee, only when the joining checklist is done. */
export function confirmJoining(s: HrmState, candId: string) {
  const c = s.candidates.find((x) => x.id === candId);
  if (!c || !c.checklist.identity || !c.checklist.documents || c.employeeId) return null;
  const job = s.jobs.find((j) => j.id === c.job);
  const id = addEmployee(s, { name: c.name, dept: job?.dept ?? "Housekeeping", position: job?.title ?? "Staff", phone: c.phone, email: c.email, joined: c.offer?.start ?? TODAY, type: "Full time", basic: Math.round((c.offer?.salary ?? 18000) * 0.6), invite: true });
  const e = emp(s, id)!;
  const total = c.offer?.salary ?? 18000;
  e.salary = { basic: Math.round(total * 0.6), house: Math.round(total * 0.2), food: Math.round(total * 0.1), transport: total - Math.round(total * 0.6) - Math.round(total * 0.2) - Math.round(total * 0.1) };
  e.docs = [{ name: "NID copy" }, { name: "Photo" }];
  c.checklist.confirmed = true;
  c.employeeId = id;
  c.history.unshift({ date: TODAY, text: `Joining confirmed. Added to staff as ${id}; account invitation sent.` });
  return id;
}

export type { OpsReq };
