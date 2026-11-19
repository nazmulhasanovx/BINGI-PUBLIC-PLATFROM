"use client";
// HRM (Staff module) data + actions. Prototype: kept in this browser (localStorage), seeded from the
// HRM design (design-ref/hrm). Production: HMS HRM API. Every page reads and writes this one store,
// so an action anywhere (approve leave, mark attendance, confirm joining…) shows everywhere.
import { useCallback, useSyncExternalStore } from "react";

export const TODAY = "2026-11-04"; // demo "today" from the design
export const TZ = "Asia/Dhaka";

export type Dept = "Housekeeping" | "Front Office" | "Kitchen" | "Maintenance" | "Security" | "Finance" | "Management";
export type Employee = {
  id: string; // EMP001
  name: string;
  dept: Dept;
  position: string;
  status: "active" | "inactive" | "former";
  access: "linked" | "invited" | "not-invited" | "disabled";
  joined: string;
  manager: string;
  email: string;
  phone: string;
  emergency: string;
  type: "Full time" | "Part time" | "Contract";
  probationEnd?: string;
  docs: { name: string; expires?: string }[];
  salary: { basic: number; house: number; food: number; transport: number };
  assets: { name: string; tag: string; since: string }[];
  reviews: { date: string; by: string; score: number; note: string }[];
  trainings: { name: string; date: string; status: "done" | "planned" }[];
  exit?: { reason: string; lastDay: string; clearance: Record<string, boolean> };
};
export type AttStatus = "present" | "absent" | "leave" | "half" | "off";
export type Att = { status: AttStatus; in?: string; out?: string; remark?: string; source: "manual" | "zkt" };
export type Shift = "Morning" | "Evening" | "Night" | "Off" | "Leave";
export type LeaveReq = { id: string; emp: string; type: "Annual Leave" | "Sick Leave" | "Casual Leave"; from: string; to: string; days: number; note?: string; status: "pending" | "approved" | "rejected"; requested: string };
export type OpsReq = { id: string; kind: "Attendance correction" | "Overtime" | "Shift swap" | "Advance"; emp: string; date: string; details: string; status: "pending" | "approved" | "rejected"; requested: string; approver: string };
export type PayLine = { emp: string; gross: number; deductions: number; paid: number };
export type Payment = { emp: string; amount: number; date: string; method: "Cash" | "Bank" | "bKash"; note?: string };
export type PayrollRun = { id: string; month: string; label: string; step: 1 | 2 | 3 | 4; status: "draft" | "reviewed" | "approved"; lines: PayLine[]; payments: Payment[] };
export type Job = { id: string; title: string; dept: Dept; vacancy: number; status: "published" | "draft" | "closed"; salary: string; created: string };
export type Stage = "applied" | "shortlisted" | "interview" | "offer" | "joining" | "rejected";
export type Candidate = {
  id: string; name: string; job: string; phone: string; email: string; stage: Stage; applied: string;
  interview?: { date: string; time: string; with: string; result?: "pass" | "fail" };
  offer?: { salary: number; start: string; status: "sent" | "accepted" | "declined" };
  checklist: { identity: boolean; documents: boolean; confirmed: boolean };
  employeeId?: string; history: { date: string; text: string }[];
};
export type Activity = { at: string; text: string };
export type Settings = {
  attendance: "manual" | "machine" | "none";
  pendingAttendance?: "manual" | "machine" | "none";
  leaveTypes: { name: LeaveReq["type"]; days: number }[];
  payDay: number;
  approver: string;
  notify: { leave: boolean; attendance: boolean; payroll: boolean; hiring: boolean };
  departments: Dept[];
};
export type Notice = { id: string; title: string; body: string; to: string; date: string };
export type ServiceReq = { id: string; emp: string; kind: "Salary certificate" | "ID card" | "Experience letter"; date: string; status: "open" | "done" };
export type Holiday = { date: string; name: string };

export type HrmState = {
  v: number;
  employees: Employee[];
  attendance: Record<string, Record<string, Att>>; // date → emp → record
  roster: { week: string; status: "draft" | "published"; cells: Record<string, Record<string, Shift>>; openShifts: { date: string; shift: Shift; dept: Dept }[] };
  leaves: LeaveReq[];
  balances: Record<string, Record<LeaveReq["type"], number>>;
  holidays: Holiday[];
  requests: OpsReq[];
  runs: PayrollRun[];
  adjustments: { id: string; emp: string; kind: "Advance" | "Bonus" | "Deduction"; amount: number; month: string; note: string }[];
  benefits: { name: string; detail: string; who: string }[];
  jobs: Job[];
  candidates: Candidate[];
  zkt: { device: string; online: boolean; lastSync: string; logs: { emp: string; time: string; type: "in" | "out" }[] };
  services: ServiceReq[];
  notices: Notice[];
  settings: Settings;
  activity: Activity[];
};

// ---------------- seed (matches the design screens) ----------------
const P = (name: string, dept: Dept, position: string, i: number, extra: Partial<Employee> = {}): Employee => ({
  id: `EMP${String(i).padStart(3, "0")}`,
  name, dept, position,
  status: "active", access: "linked",
  joined: "2026-05-01", manager: "Hotel Manager",
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  phone: `01${700000000 + i * 1371}`.slice(0, 11),
  emergency: "", type: "Full time", docs: [{ name: "NID copy" }, { name: "Photo" }],
  salary: { basic: 12000, house: 4000, food: 2000, transport: 2000 },
  assets: [], reviews: [], trainings: [],
  ...extra,
});

function seed(): HrmState {
  const employees: Employee[] = [
    P("Imran Hasan", "Housekeeping", "Housekeeping Attendant", 1, { docs: [{ name: "NID copy" }, { name: "Medical certificate", expires: "2026-11-15" }], assets: [{ name: "Uniform set", tag: "UN-014", since: "2026-05-01" }, { name: "Locker key", tag: "LK-07", since: "2026-05-01" }], reviews: [{ date: "2026-08-01", by: "Hotel Manager", score: 4, note: "Rooms ready on time; good guest feedback." }], trainings: [{ name: "Fire safety", date: "2026-06-12", status: "done" }, { name: "Linen handling", date: "2026-11-20", status: "planned" }] }),
    P("Ayesha Rahman", "Front Office", "Front Office Executive", 2, { access: "invited", joined: "2026-08-12", probationEnd: "2026-11-12", salary: { basic: 11000, house: 3500, food: 2000, transport: 1500 } }),
    P("Nusrat Karim", "Finance", "Accounts Executive", 3, { salary: { basic: 22000, house: 7000, food: 3000, transport: 2000 } }),
    P("Mitu Islam", "Housekeeping", "Housekeeping Attendant", 4, { access: "not-invited" }),
    P("Farhan Ali", "Kitchen", "Chef", 5, { salary: { basic: 18000, house: 5000, food: 0, transport: 2000 } }),
    P("Sadia Noor", "Front Office", "Receptionist", 6),
    P("Kamal Uddin", "Security", "Security Guard", 7, { status: "inactive", access: "disabled" }),
    P("Rakib Hossain", "Housekeeping", "Room Attendant", 8),
    P("Shirin Akter", "Housekeeping", "Laundry Attendant", 9),
    P("Habib Rahman", "Housekeeping", "Supervisor", 10, { salary: { basic: 16000, house: 5000, food: 2000, transport: 2000 } }),
    P("Tania Sultana", "Housekeeping", "Room Attendant", 11),
    P("Jahid Hasan", "Front Office", "Night Auditor", 12),
    P("Mim Chowdhury", "Front Office", "Guest Relations", 13),
    P("Sohel Rana", "Kitchen", "Cook", 14),
    P("Arif Hossain", "Kitchen", "Kitchen Helper", 15),
    P("Nasir Uddin", "Maintenance", "Technician", 16),
    P("Belal Ahmed", "Maintenance", "Electrician", 17),
    P("Monir Hossain", "Security", "Security Guard", 18),
    P("Shafiq Islam", "Security", "Security Guard", 19),
    P("Rokon Miah", "Security", "Security Supervisor", 20),
    P("Lima Akter", "Housekeeping", "Room Attendant", 21),
    P("Tanvir Ahmed", "Management", "Hotel Manager", 22, { salary: { basic: 40000, house: 15000, food: 3000, transport: 5000 } }),
    P("Rubel Mia", "Kitchen", "Steward", 23, { status: "inactive", access: "disabled" }),
    P("Parvez Alam", "Front Office", "Bell Captain", 24),
  ];
  // set Imran's salary so gross = 20,000 like the design; Ayesha 18,000; Nusrat 34,000
  // attendance on TODAY: 18 present (2 late), 2 leave, 1 absent, 1 not marked (of 22 active)
  const active = employees.filter((e) => e.status === "active");
  const today: Record<string, Att> = {};
  active.forEach((e, i) => {
    if (e.id === "EMP003" || e.id === "EMP012") today[e.id] = { status: "leave", remark: "Approved leave", source: "manual" };
    else if (e.id === "EMP005") today[e.id] = { status: "absent", source: "manual" };
    else if (e.id === "EMP004") return; // not marked
    else today[e.id] = { status: "present", in: e.id === "EMP002" ? "08:12" : e.id === "EMP013" ? "08:20" : `0${7 + (i % 2)}:${i % 2 ? "55" : "58"}`.replace("07:58", "07:58"), remark: e.id === "EMP001" ? "Checkout pending" : e.id === "EMP002" ? "Late 12m" : e.id === "EMP013" ? "Late 20m" : undefined, source: "manual" };
  });
  today["EMP001"] = { status: "present", in: "08:00", remark: "Checkout pending", source: "manual" };
  const attendance: HrmState["attendance"] = { [TODAY]: today };
  // earlier days: everyone present with in/out
  ["2026-11-01", "2026-11-02", "2026-11-03"].forEach((d) => {
    attendance[d] = Object.fromEntries(active.map((e) => [e.id, { status: "present", in: "08:00", out: e.id === "EMP001" && d === "2026-11-02" ? "15:30" : "16:05", source: "manual" } as Att]));
  });

  const week = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"];
  const pattern: Record<string, Shift[]> = {
    EMP001: ["Morning", "Morning", "Morning", "Evening", "Off", "Morning", "Morning"],
    EMP002: ["Evening", "Evening", "Morning", "Morning", "Morning", "Evening", "Off"],
    EMP003: ["Morning", "Morning", "Leave", "Morning", "Evening", "Evening", "Morning"],
    EMP004: ["Off", "Morning", "Morning", "Evening", "Evening", "Morning", "Morning"],
    EMP005: ["Morning", "Off", "Evening", "Evening", "Morning", "Morning", "Evening"],
  };
  const cells: HrmState["roster"]["cells"] = {};
  active.forEach((e, i) => {
    const row = pattern[e.id] ?? week.map((_, d) => ((d + i) % 7 === 6 ? "Off" : (d + i) % 3 === 0 ? "Evening" : "Morning") as Shift);
    cells[e.id] = Object.fromEntries(week.map((d, k) => [d, row[k]]));
  });
  cells.EMP020["2026-11-04"] = "Morning"; // on duty today (matches attendance)

  return {
    v: 2,
    employees,
    attendance,
    roster: { week: week[0], status: "draft", cells, openShifts: [{ date: "2026-11-05", shift: "Evening", dept: "Front Office" }] },
    leaves: [
      { id: "LV-101", emp: "EMP001", type: "Annual Leave", from: "2026-11-06", to: "2026-11-07", days: 1, note: "06 Nov: roster off", status: "pending", requested: "2026-11-04T08:47" },
      { id: "LV-102", emp: "EMP002", type: "Annual Leave", from: "2026-11-10", to: "2026-11-10", days: 1, status: "pending", requested: "2026-11-04T08:47" },
      { id: "LV-100", emp: "EMP003", type: "Annual Leave", from: "2026-11-04", to: "2026-11-04", days: 1, status: "approved", requested: "2026-11-01T10:00" },
    ],
    balances: Object.fromEntries(employees.map((e) => [e.id, { "Annual Leave": e.id === "EMP003" ? 8 : 8, "Sick Leave": 10, "Casual Leave": 5 }])),
    holidays: [{ date: "2026-12-16", name: "Victory Day" }, { date: "2026-12-25", name: "Christmas Day" }, { date: "2027-02-21", name: "Language Martyrs' Day" }, { date: "2027-03-26", name: "Independence Day" }],
    requests: [
      { id: "REQ-1003", kind: "Attendance correction", emp: "EMP001", date: "2026-11-02", details: "Checkout time: 16:05", status: "pending", requested: TODAY, approver: "Hotel Manager" },
      { id: "REQ-1004", kind: "Overtime", emp: "EMP005", date: "2026-11-03", details: "1 hour", status: "pending", requested: TODAY, approver: "Hotel Manager" },
      { id: "REQ-1006", kind: "Overtime", emp: "EMP018", date: "2026-11-03", details: "2 hours", status: "pending", requested: TODAY, approver: "Hotel Manager" },
      { id: "REQ-1005", kind: "Shift swap", emp: "EMP004", date: "2026-11-06", details: "06 Nov 2026 ↔ 07 Nov 2026", status: "pending", requested: TODAY, approver: "Hotel Manager" },
    ],
    runs: [
      { id: "2026-10", month: "2026-10", label: "October 2026", step: 4, status: "approved", lines: [{ emp: "EMP001", gross: 20000, deductions: 0, paid: 10000 }, { emp: "EMP002", gross: 18000, deductions: 0, paid: 18000 }, { emp: "EMP003", gross: 34000, deductions: 0, paid: 0 }], payments: [{ emp: "EMP001", amount: 10000, date: "2026-11-01", method: "Cash" }, { emp: "EMP002", amount: 18000, date: "2026-11-01", method: "bKash" }] },
    ],
    adjustments: [{ id: "ADJ-1", emp: "EMP004", kind: "Advance", amount: 3000, month: "2026-11", note: "Family need" }, { id: "ADJ-2", emp: "EMP010", kind: "Bonus", amount: 2000, month: "2026-11", note: "Best supervisor, October" }],
    benefits: [{ name: "Festival bonus", detail: "2 × basic per year (Eid)", who: "All permanent staff" }, { name: "Staff meal", detail: "2 meals per shift", who: "All on duty" }, { name: "Uniform", detail: "2 sets per year", who: "Housekeeping, Front Office, Kitchen, Security" }],
    jobs: [
      { id: "HK001", title: "Housekeeping Attendant", dept: "Housekeeping", vacancy: 3, status: "published", salary: "BDT 18,000–20,000", created: "2026-10-20" },
      { id: "FO001", title: "Receptionist", dept: "Front Office", vacancy: 1, status: "draft", salary: "BDT 20,000", created: "2026-11-02" },
    ],
    candidates: [
      { id: "CAND001", name: "Rafi Ahmed", job: "HK001", phone: "01755-000101", email: "rafi@example.com", stage: "joining", applied: "2026-10-22", interview: { date: "2026-10-28", time: "11:00", with: "Hotel Manager", result: "pass" }, offer: { salary: 20000, start: "2026-11-07", status: "accepted" }, checklist: { identity: false, documents: false, confirmed: false }, history: [{ date: "2026-11-04", text: "Offer accepted by candidate." }, { date: "2026-11-03", text: "Offer sent (20,000 / month, start 07 Nov 2026)." }] },
      { id: "CAND002", name: "Shila Akter", job: "HK001", phone: "01755-000102", email: "shila@example.com", stage: "interview", applied: "2026-10-24", interview: { date: "2026-11-06", time: "10:30", with: "Housekeeping Supervisor" }, checklist: { identity: false, documents: false, confirmed: false }, history: [{ date: "2026-11-02", text: "Interview scheduled for 06 Nov, 10:30." }] },
      { id: "CAND003", name: "Jamal Hossain", job: "HK001", phone: "01755-000103", email: "jamal@example.com", stage: "applied", applied: "2026-11-01", checklist: { identity: false, documents: false, confirmed: false }, history: [{ date: "2026-11-01", text: "Applied through BinGi Jobs." }] },
    ],
    zkt: { device: "ZKT MB460", online: false, lastSync: "2026-11-04T08:30", logs: [{ emp: "EMP001", time: "08:00", type: "in" }, { emp: "EMP002", time: "08:12", type: "in" }] },
    services: [{ id: "SRV-1", emp: "EMP006", kind: "Salary certificate", date: "2026-11-03", status: "open" }, { id: "SRV-2", emp: "EMP011", kind: "ID card", date: "2026-11-02", status: "done" }],
    notices: [{ id: "N-1", title: "Uniform check on Friday", body: "All front-of-house staff: uniform and name badge check at 09:00.", to: "All staff", date: "2026-11-03" }],
    settings: {
      attendance: "manual",
      leaveTypes: [{ name: "Annual Leave", days: 10 }, { name: "Sick Leave", days: 10 }, { name: "Casual Leave", days: 5 }],
      payDay: 1,
      approver: "Hotel Manager",
      notify: { leave: true, attendance: true, payroll: true, hiring: false },
      departments: ["Housekeeping", "Front Office", "Kitchen", "Maintenance", "Security", "Finance", "Management"],
    },
    activity: [
      { at: "2026-11-04T09:14", text: "Attendance updated by Hotel Admin" },
      { at: "2026-11-04T08:47", text: "Leave request submitted by Ayesha Rahman" },
    ],
  };
}

// ---------------- store ----------------
const KEY = "bingi-hrm-v1";
const listeners = new Set<() => void>();
let cache: { raw: string | null; st: HrmState } | null = null;
let fallback: HrmState | null = null;
const base = () => (fallback ??= seed());
function read(): HrmState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (cache && cache.raw === raw) return cache.st;
  let st = base();
  if (raw) try {
    const parsed = JSON.parse(raw);
    // ignore saved data from an older/broken version and fall back to the demo seed
    if (parsed && parsed.v === st.v && Array.isArray(parsed.employees) && parsed.settings && parsed.roster) st = parsed;
  } catch {}
  cache = { raw, st };
  return st;
}
function write(st: HrmState) {
  const raw = JSON.stringify(st);
  try { localStorage.setItem(KEY, raw); } catch {}
  cache = { raw, st };
  listeners.forEach((l) => l());
}
const sub = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

export function useHrm() {
  const st = useSyncExternalStore(sub, read, base);
  const update = useCallback((fn: (s: HrmState) => void, log?: string) => {
    const next = structuredClone(read());
    fn(next);
    if (log) next.activity.unshift({ at: nowStamp(), text: log });
    next.activity = next.activity.slice(0, 60);
    write(next);
  }, []);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY); } catch {} cache = null; fallback = null; listeners.forEach((l) => l()); }, []);
  return { st, update, reset };
}

// ---------------- helpers ----------------
export const nowStamp = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;
export const emp = (st: HrmState, id: string) => st.employees.find((e) => e.id === id);
export const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("");
export const gross = (e: Employee) => e.salary.basic + e.salary.house + e.salary.food + e.salary.transport;
export const money = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n));
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmt = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
export const fmtShort = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]}`;
export const fmtStamp = (s: string) => `${fmt(s.slice(0, 10))}, ${s.slice(11, 16)}`;
export const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const weekDays = (start: string) => Array.from({ length: 7 }, (_, i) => addDays(start, i));
export const dayName = (iso: string) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(`${iso}T00:00:00Z`).getUTCDay()];
export const monthLabel = (m: string) => `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
export const SHIFT_TIME: Record<Shift, string> = { Morning: "08 – 16", Evening: "16 – 00", Night: "00 – 08", Off: "", Leave: "" };

export function lineNet(l: PayLine) { return l.gross - l.deductions; }
export function runTotals(r: PayrollRun) {
  const net = r.lines.reduce((s, l) => s + lineNet(l), 0);
  const paid = r.lines.reduce((s, l) => s + l.paid, 0);
  return { gross: r.lines.reduce((s, l) => s + l.gross, 0), net, paid, due: net - paid };
}
export const payStatus = (l: PayLine) => (l.paid <= 0 ? "Unpaid" : l.paid >= lineNet(l) ? "Paid" : "Partially paid");
export const runPayStatus = (r: PayrollRun) => { const t = runTotals(r); return t.paid <= 0 ? "Unpaid" : t.due <= 0 ? "Paid" : "Partially paid"; };
