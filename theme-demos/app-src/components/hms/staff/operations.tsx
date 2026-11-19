"use client";
import clsx from "clsx";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, CalendarDays, Check, ChevronDown, Clock, Eye, GraduationCap, Layers, Megaphone, Plus, UserRound, Wallet, FileText, LogOut } from "lucide-react";
import { TODAY, addDays, emp, fmt, money, useHrm, type Employee, type OpsReq, type ServiceReq } from "@/lib/hrm/store";
import { decideLeave, decideRequest } from "@/lib/hrm/actions";
import { FilterSelect, StaffFrame, useToast } from "./Frame";
import { Area, Btn, Card, Chip, Drawer, Empty, Field, Input, Menu, Pager, Person, Select, Table, useQuery } from "./ui";

type Item = { id: string; kind: "Leave" | OpsReq["kind"]; date: string; to?: string; detail: string; emp: string; requested: string; approver: string; status: "pending" | "approved" | "rejected" };
const ICON: Record<Item["kind"], [typeof Clock, string]> = { Leave: [CalendarDays, "bg-[#e9f0fc] text-[#2f6fd6]"], "Attendance correction": [Clock, "bg-[#efeafb] text-[#6d4bd0]"], Overtime: [Clock, "bg-[#efeafb] text-[#6d4bd0]"], "Shift swap": [ArrowLeftRight, "bg-[#e6f6ec] text-[#1f8f4a]"], Advance: [Wallet, "bg-[#fdf1e3] text-[#b45309]"] };
const PER = 6;
type OTab = "app" | "srv" | "perf" | "comm" | "off";

export function OperationsPage() {
  const qt = useQuery("t");
  const [tabState, setTab] = useState<OTab | null>(null);
  const tab: OTab = tabState ?? (qt === "off" || qt === "srv" || qt === "perf" || qt === "comm" ? qt : "app");
  const [q, setQ] = useState("");
  const [nr, setNr] = useState(false);
  const [fd, setFd] = useState("all");
  const { st } = useHrm();
  const action = tab === "app" ? <Btn kind="primary" onClick={() => setNr(true)}><Plus className="size-[18px]" /> New request</Btn> : undefined;
  return (
    <StaffFrame tab="operations" search={q} onSearch={setQ} action={action} activeFilters={fd !== "all" ? 1 : 0} onClearFilters={() => setFd("all")} filters={tab === "comm" ? undefined : <FilterSelect label="Department" value={fd} onChange={setFd} options={st.settings.departments.map((d) => ({ v: d, label: d }))} />}>
      <Card>
        <h2 className="text-[24px] font-semibold">Team Operations</h2>
        <div className="mt-3 flex flex-wrap gap-2 border-b border-[#e3e7ec] pb-3">
          {([["app", "Approvals"], ["srv", "Services"], ["perf", "Performance & training"], ["comm", "Communication"], ["off", "Offboarding"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} className={clsx("whitespace-nowrap rounded-xl px-5 py-2 text-[16px]", tab === v ? "bg-[#ffe7e4] font-medium text-[#b11c29]" : "hover:bg-[#f4f6f8]")}>{l}</button>
          ))}
        </div>
        <div className="mt-4">
          {tab === "app" && <Approvals q={q} dept={fd} />}
          {tab === "srv" && <Services q={q} dept={fd} />}
          {tab === "perf" && <Performance q={q} dept={fd} />}
          {tab === "comm" && <Communication />}
          {tab === "off" && <Offboarding q={q} dept={fd} />}
        </div>
      </Card>
      {nr && <NewRequest onClose={() => setNr(false)} />}
    </StaffFrame>
  );
}


function useItems(): Item[] {
  const { st } = useHrm();
  const leaves: Item[] = st.leaves.map((l) => ({ id: l.id, kind: "Leave", date: l.from, to: l.to, detail: `${l.days} ${l.days === 1 ? "day" : "days"}${l.note ? ` · ${l.note}` : ""}`, emp: l.emp, requested: l.requested.slice(0, 10), approver: st.settings.approver, status: l.status }));
  const reqs: Item[] = st.requests.map((r) => ({ id: r.id, kind: r.kind, date: r.date, detail: r.details, emp: r.emp, requested: r.requested.slice(0, 10), approver: r.approver, status: r.status }));
  return [...leaves, ...reqs].sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1) || b.requested.localeCompare(a.requested));
}

function Dd({ icon: Icon, value, onChange, children, label }: { icon: typeof Layers; value: string; onChange: (v: string) => void; children: React.ReactNode; label: string }) {
  return <label className="relative inline-flex h-11 items-center gap-2.5 rounded-xl border border-[#d3d8df] bg-white pl-4 pr-10 text-[15.5px]"><Icon className="size-[18px]" /><select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="appearance-none bg-transparent outline-none">{children}</select><ChevronDown className="pointer-events-none absolute right-3 size-4" /></label>;
}

function Approvals({ q, dept }: { q: string; dept: string }) {
  const { st, update } = useHrm();
  const items = useItems();
  const [type, setType] = useState("all");
  const [appr, setAppr] = useState("all");
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [rev, setRev] = useState<string | null>(null);
  const approvers = [...new Set(items.map((i) => i.approver))];
  const list = items.filter((i) => (dept === "all" || emp(st, i.emp)?.dept === dept) && (type === "all" || i.kind === type) && (appr === "all" || i.approver === appr) && (status === "all" || i.status === status) && (!q || `${emp(st, i.emp)?.name} ${i.emp} ${i.id} ${emp(st, i.emp)?.dept}`.toLowerCase().includes(q.toLowerCase())));
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const p = Math.min(page, pages);
  const decide = (i: Item, ok: boolean) => update((s) => {
    if (i.kind === "Leave") decideLeave(s, i.id, ok);
    else {
      decideRequest(s, i.id, ok);
      if (ok && i.kind === "Advance") {
        const amt = Number(i.detail.replace(/[^\d]/g, "")) || 0;
        let m = TODAY.slice(0, 7);
        while (s.runs.some((r) => r.month === m)) { const [y, mo] = m.split("-").map(Number); m = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`; }
        if (amt) s.adjustments.unshift({ id: `ADJ-${i.id}`, emp: i.emp, kind: "Advance", amount: amt, month: m, note: `From ${i.id}` });
      }
    }
  }, `${i.kind} ${i.id} ${ok ? "approved" : "rejected"} — ${emp(st, i.emp)?.name}`);
  const cur = items.find((i) => i.id === rev);
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Dd icon={Layers} label="Type" value={type} onChange={(v) => { setType(v); setPage(1); }}><option value="all">Type</option>{["Leave", "Attendance correction", "Overtime", "Shift swap", "Advance"].map((k) => <option key={k} value={k}>{k}</option>)}</Dd>
        <Dd icon={UserRound} label="Assigned approver" value={appr} onChange={(v) => { setAppr(v); setPage(1); }}><option value="all">Assigned approver</option>{approvers.map((a) => <option key={a}>{a}</option>)}</Dd>
        <Dd icon={Check} label="Status" value={status} onChange={(v) => { setStatus(v); setPage(1); }}><option value="pending">Pending ({items.filter((i) => i.status === "pending").length})</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All statuses</option></Dd>
      </div>
      <div className="mt-4">
        {list.length === 0 ? <Empty icon={<Check className="size-6" />} title={status === "pending" ? "All caught up" : "No requests"} text={status === "pending" ? "No approvals waiting." : undefined} /> : (
          <Table cols={[{ label: "Request", w: "18%" }, { label: "Details" }, { label: "Employee" }, { label: "Requested on" }, { label: "Assigned approver" }, { label: "Status" }, { label: "Actions", w: "170px" }]}>
            {list.slice((p - 1) * PER, p * PER).map((i) => {
              const [Icon, cls] = ICON[i.kind];
              return (
                <tr key={i.id}>
                  <td><span className="flex items-center gap-3"><span className={clsx("grid size-10 shrink-0 place-items-center rounded-full", cls)}><Icon className="size-5" /></span><span><b className="block text-[15.5px]">{i.kind}</b><span className="text-[14px] text-[#4d5664]">{i.id}</span></span></span></td>
                  <td>{i.kind === "Shift swap" ? i.detail : <>{i.to && i.to !== i.date ? `${fmt(i.date)} – ${fmt(i.to)}` : fmt(i.date)}<span className="block">{i.kind === "Leave" ? `(${i.detail})` : i.detail}</span></>}</td>
                  <td><Person name={emp(st, i.emp)?.name ?? i.emp} id={i.emp} /></td>
                  <td>{fmt(i.requested)}<span className="block text-[14px] text-[#4d5664]">Asia/Dhaka</span></td>
                  <td className="font-semibold">{i.approver}</td>
                  <td><Chip tone={i.status === "pending" ? "amber" : i.status === "approved" ? "green" : "red"}>{i.status[0].toUpperCase() + i.status.slice(1)}</Chip></td>
                  <td><div className="flex gap-2"><Btn onClick={() => setRev(i.id)}><Eye className="size-[18px]" /> Review</Btn>
                    {i.status === "pending" && <Menu label={`Quick actions for ${i.id}`} items={[{ label: "Approve", onClick: () => decide(i, true) }, { label: "Reject", danger: true, onClick: () => decide(i, false) }]} />}</div></td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
      {list.length > 0 && <Pager page={p} pages={pages} onPage={setPage} from={(p - 1) * PER + 1} to={Math.min(p * PER, list.length)} total={list.length} />}
      {cur && <ReviewItem i={cur} onClose={() => setRev(null)} onDecide={(ok) => { decide(cur, ok); setRev(null); }} />}
    </>
  );
}

const EFFECT: Record<Item["kind"], string> = {
  Leave: "Approving deducts the leave balance and marks the roster and attendance as Leave.",
  "Attendance correction": "Approving updates the check-out time on that day's attendance.",
  Overtime: "Approving records the overtime. Overtime pay is added manually as a Bonus in Payroll › Advances & adjustments.",
  "Shift swap": "Approving swaps the two roster days for this person.",
  Advance: "Approving adds an Advance deduction to the next payroll month that is not prepared yet.",
};
function ReviewItem({ i, onClose, onDecide }: { i: Item; onClose: () => void; onDecide: (ok: boolean) => void }) {
  const { st } = useHrm();
  const e = emp(st, i.emp);
  return (
    <Drawer title={`Review · ${i.kind}`} onClose={onClose} footer={i.status === "pending" ? <><Btn kind="danger" onClick={() => onDecide(false)}>Reject</Btn><Btn kind="primary" onClick={() => onDecide(true)}>Approve</Btn></> : <Btn onClick={onClose}>Close</Btn>}>
      <Person name={e?.name ?? i.emp} id={i.emp} sub={`${i.emp} · ${e?.dept}`} />
      <dl className="divide-y divide-[#e3e7ec] rounded-xl border border-[#e3e7ec] px-4 text-[15px]">
        {[["Request", i.id], ["Date", i.to && i.to !== i.date ? `${fmt(i.date)} – ${fmt(i.to)}` : fmt(i.date)], ["Details", i.detail], ["Requested on", fmt(i.requested)], ["Approver", i.approver], ["Status", i.status]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-[#4d5664]">{k}</dt><dd className="text-right capitalize-first">{v}</dd></div>)}
      </dl>
      {i.kind === "Shift swap" && (() => { const ds = [i.date, addDays(i.date, 1)]; return <p className="rounded-xl bg-[#f4f6f8] px-4 py-3 text-[14.5px]">Now: {ds.map((d) => `${fmt(d).slice(0, 6)} ${st.roster.cells[i.emp]?.[d] ?? "—"}`).join(" · ")}</p>; })()}
      <p className="text-[13.5px] text-[#4d5664]">{EFFECT[i.kind]}</p>
    </Drawer>
  );
}

function NewRequest({ onClose }: { onClose: () => void }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const router = useRouter();
  const active = st.employees.filter((e) => e.status === "active");
  const [kind, setKind] = useState<OpsReq["kind"] | "Leave">("Attendance correction");
  const [f, setF] = useState({ emp: active[0]?.id ?? "", date: TODAY, time: "16:00", hours: 1, date2: addDays(TODAY, 1), amount: 0, reason: "" });
  const details = kind === "Attendance correction" ? `Checkout time: ${f.time}` : kind === "Overtime" ? `${f.hours} hour${f.hours > 1 ? "s" : ""}` : kind === "Shift swap" ? `${fmt(f.date)} ↔ ${fmt(f.date2)}` : `BDT ${money(f.amount)}${f.reason ? ` · ${f.reason}` : ""}`;
  const ok = kind === "Advance" ? f.amount > 0 : kind === "Shift swap" ? f.date2 !== f.date : true;
  if (kind === "Leave")
    return (
      <Drawer title="New request" onClose={onClose} footer={<><Btn onClick={() => setKind("Attendance correction")}>Back</Btn><Btn kind="primary" onClick={() => { onClose(); router.push("/hms/staff/leave"); }}>Open Leave</Btn></>}>
        <p className="text-[15px]">Leave is added from <b>Leave › Add leave</b>, where the working days and balance are checked.</p>
      </Drawer>
    );
  return (
    <Drawer title="New request" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!ok} onClick={() => { update((s) => { const id = `REQ-${1000 + s.requests.length + s.leaves.length + 1}`; s.requests.unshift({ id, kind, emp: f.emp, date: f.date, details, status: "pending", requested: TODAY, approver: s.settings.approver }); }, `${kind} request added for ${emp(st, f.emp)?.name}`); toast("Request added · waiting for approval"); onClose(); }}>Submit request</Btn></>}>
      <Field label="Type"><Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>{["Attendance correction", "Overtime", "Shift swap", "Advance", "Leave"].map((k) => <option key={k}>{k}</option>)}</Select></Field>
      <Field label="Staff"><Select value={f.emp} onChange={(e) => setF({ ...f, emp: e.target.value })}>{active.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.id}</option>)}</Select></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={kind === "Shift swap" ? "Day 1" : "Date"}><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        {kind === "Attendance correction" && <Field label="Correct check-out"><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>}
        {kind === "Overtime" && <Field label="Hours"><Input type="number" min={1} max={8} value={f.hours} onChange={(e) => setF({ ...f, hours: Math.min(8, Math.max(1, Number(e.target.value) || 1)) })} /></Field>}
        {kind === "Shift swap" && <Field label="Day 2"><Input type="date" value={f.date2} onChange={(e) => setF({ ...f, date2: e.target.value })} /></Field>}
        {kind === "Advance" && <Field label="Amount (BDT)"><Input type="number" min={0} value={f.amount || ""} onChange={(e) => setF({ ...f, amount: Math.max(0, Number(e.target.value) || 0) })} /></Field>}
      </div>
      {kind === "Advance" && <Field label="Reason"><Input value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>}
      <p className="rounded-xl bg-[#f4f6f8] px-4 py-3 text-[14.5px]">Goes to <b>{st.settings.approver}</b> for approval. {EFFECT[kind]}</p>
    </Drawer>
  );
}

function Services({ q, dept }: { q: string; dept: string }) {
  const { st, update } = useHrm();
  const active = st.employees.filter((e) => e.status === "active");
  const [f, setF] = useState({ emp: active[0]?.id ?? "", kind: "Salary certificate" as ServiceReq["kind"] });
  const list = st.services.filter((s) => (dept === "all" || emp(st, s.emp)?.dept === dept) && !!(!q || `${emp(st, s.emp)?.name} ${s.emp} ${s.kind}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div>{list.length === 0 ? <Empty icon={<FileText className="size-6" />} title="No service requests" /> : (
        <Table cols={[{ label: "Request" }, { label: "Employee", w: "26%" }, { label: "Requested" }, { label: "Status" }, { label: "", w: "140px" }]}>
          {list.map((s) => <tr key={s.id}><td><b>{s.kind}</b><span className="block text-[14px] text-[#4d5664]">{s.id}</span></td><td><Person name={emp(st, s.emp)?.name ?? s.emp} id={s.emp} /></td><td>{fmt(s.date)}</td><td><Chip tone={s.status === "done" ? "green" : "amber"}>{s.status === "done" ? "Done" : "Open"}</Chip></td><td>{s.status === "open" && <Btn onClick={() => update((x) => { x.services.find((y) => y.id === s.id)!.status = "done"; }, `${s.kind} ready for ${emp(st, s.emp)?.name}`)}>Mark done</Btn>}</td></tr>)}
        </Table>
      )}</div>
      <Card title="New service request">
        <div className="space-y-3">
          <Field label="Staff"><Select value={f.emp} onChange={(e) => setF({ ...f, emp: e.target.value })}>{active.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Select></Field>
          <Field label="Document"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as ServiceReq["kind"] })}><option>Salary certificate</option><option>ID card</option><option>Experience letter</option></Select></Field>
          <Btn kind="primary" className="w-full" onClick={() => update((s) => { s.services.unshift({ id: `SRV-${s.services.length + 1}`, emp: f.emp, kind: f.kind, date: TODAY, status: "open" }); }, `${f.kind} requested for ${emp(st, f.emp)?.name}`)}>Add request</Btn>
          <p className="text-[13px] text-[#4d5664]">Document printing is planned.</p>
        </div>
      </Card>
    </div>
  );
}

function Performance({ q, dept }: { q: string; dept: string }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const router = useRouter();
  const [plan, setPlan] = useState(false);
  const [f, setF] = useState({ name: "", date: addDays(TODAY, 7), dept: "all" });
  const list = st.employees.filter((e) => e.status === "active" && (dept === "all" || e.dept === dept) && (!q || `${e.name} ${e.id} ${e.dept}`.toLowerCase().includes(q.toLowerCase())));
  const who = st.employees.filter((e) => e.status === "active" && (f.dept === "all" || e.dept === f.dept));
  return (
    <>
      <div className="mb-3 flex items-center justify-between"><p className="text-[15px] text-[#4d5664]">{st.employees.filter((e) => e.reviews.length).length} reviewed · {st.employees.reduce((t, e) => t + e.trainings.filter((x) => x.status === "planned").length, 0)} trainings planned</p><Btn onClick={() => setPlan(true)}><GraduationCap className="size-[18px]" /> Plan training</Btn></div>
      <Table cols={[{ label: "Employee", w: "26%" }, { label: "Department" }, { label: "Last review" }, { label: "Training" }, { label: "", w: "120px" }]}>
        {list.map((e) => {
          const r = e.reviews[0];
          const pl = e.trainings.filter((t) => t.status === "planned").length;
          return <tr key={e.id}><td><Person name={e.name} id={e.id} /></td><td>{e.dept}</td><td>{r ? <>{"★".repeat(r.score)}<span className="text-[#d3d8df]">{"★".repeat(5 - r.score)}</span><span className="ml-2 text-[14px] text-[#4d5664]">{fmt(r.date)}</span></> : <span className="text-[#4d5664]">No review</span>}</td><td>{e.trainings.length ? `${e.trainings.length - pl} done${pl ? ` · ${pl} planned` : ""}` : "—"}</td><td><Btn onClick={() => router.push(`/hms/staff/people/${e.id}`)}>Open</Btn></td></tr>;
        })}
      </Table>
      {plan && (
        <Drawer title="Plan training" onClose={() => setPlan(false)} footer={<><Btn onClick={() => setPlan(false)}>Cancel</Btn><Btn kind="primary" disabled={!f.name.trim() || !who.length} onClick={() => { update((s) => { for (const e of s.employees) if (who.some((w) => w.id === e.id)) e.trainings.push({ name: f.name.trim(), date: f.date, status: "planned" }); }, `Training planned: ${f.name} (${who.length} staff, ${fmt(f.date)})`); toast(`Planned for ${who.length} staff`); setPlan(false); }}>Plan for {who.length} staff</Btn></>}>
          <Field label="Training"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Fire safety" /></Field>
          <Field label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Who"><Select value={f.dept} onChange={(e) => setF({ ...f, dept: e.target.value })}><option value="all">All active staff</option>{st.settings.departments.map((d) => <option key={d}>{d}</option>)}</Select></Field>
        </Drawer>
      )}
    </>
  );
}

function Communication() {
  const { st, update } = useHrm();
  const [f, setF] = useState({ title: "", body: "", to: "All staff" });
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <div>{st.notices.length === 0 ? <Empty icon={<Megaphone className="size-6" />} title="No notices" /> : (
        <ul className="space-y-3">{st.notices.map((n) => <li key={n.id} className="rounded-xl border border-[#e3e7ec] p-4"><div className="flex items-start justify-between gap-3"><p className="text-[16.5px] font-semibold">{n.title}</p><Menu label={`Actions for ${n.title}`} items={[{ label: "Delete", danger: true, onClick: () => update((s) => { s.notices = s.notices.filter((x) => x.id !== n.id); }, `Notice deleted: ${n.title}`) }]} /></div><p className="mt-1 text-[15px] text-[#4d5664]">{n.body}</p><p className="mt-2 text-[13.5px] text-[#4d5664]">To {n.to} · {fmt(n.date)}</p></li>)}</ul>
      )}</div>
      <Card title="New notice">
        <div className="space-y-3">
          <Field label="Title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Message"><Area value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
          <Field label="To"><Select value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })}><option>All staff</option>{st.settings.departments.map((d) => <option key={d}>{d}</option>)}</Select></Field>
          <Btn kind="primary" className="w-full" disabled={!f.title.trim() || !f.body.trim()} onClick={() => { update((s) => { s.notices.unshift({ id: `N-${Date.now() % 100000}`, title: f.title.trim(), body: f.body.trim(), to: f.to, date: TODAY }); }, `Notice posted: ${f.title}`); setF({ title: "", body: "", to: "All staff" }); }}>Post notice</Btn>
          <p className="text-[13px] text-[#4d5664]">Saved on the HR board. Push/SMS delivery to the staff app is not connected yet.</p>
        </div>
      </Card>
    </div>
  );
}

const CLEAR: [string, string][] = [["assets", "Assets returned"], ["dues", "Final dues settled"], ["access", "System access removed"]];
function Offboarding({ q, dept }: { q: string; dept: string }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const [start, setStart] = useState(false);
  const list = st.employees.filter((e) => e.exit && (dept === "all" || e.dept === dept) && (!q || `${e.name} ${e.id}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <div className="mb-3 flex justify-end"><Btn onClick={() => setStart(true)}><LogOut className="size-[18px]" /> Start offboarding</Btn></div>
      {list.length === 0 ? <Empty icon={<LogOut className="size-6" />} title="No one is leaving" text="Start offboarding from here or from a staff profile." /> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {list.map((e) => {
            const x = e.exit!;
            const done = CLEAR.every(([k]) => x.clearance[k]);
            return (
              <div key={e.id} className="rounded-xl border border-[#e3e7ec] p-4">
                <div className="flex items-center justify-between"><Person name={e.name} id={e.id} sub={`${e.position} · last day ${fmt(x.lastDay)}`} /><Chip tone={e.status === "former" ? "gray" : done ? "green" : "amber"}>{e.status === "former" ? "Left" : done ? "Cleared" : x.reason}</Chip></div>
                <ul className="mt-3 space-y-2">
                  {CLEAR.map(([k, l]) => (
                    <li key={k}><label className="flex items-center gap-3 text-[15px]"><input type="checkbox" disabled={e.status === "former"} checked={!!x.clearance[k]} onChange={() => update((s) => { const c = emp(s, e.id)!.exit!.clearance; c[k] = !c[k]; if (k === "access" && c[k]) emp(s, e.id)!.access = "disabled"; }, `${e.name}: ${l.toLowerCase()} ${x.clearance[k] ? "unchecked" : "done"}`)} className="size-5 accent-[#b11c29]" />{l}{k === "assets" && e.assets.length > 0 && <span className="text-[13.5px] text-[#b45309]">({e.assets.length} still issued)</span>}</label></li>
                  ))}
                </ul>
                {e.status !== "former" && (
                  <div className="mt-3 flex gap-2">
                    <Btn kind="primary" disabled={!done} onClick={() => { update((s) => { const y = emp(s, e.id)!; y.status = "former"; y.access = "disabled"; }, `${e.name} moved to former staff`); toast(`${e.name} is now former staff`); }}>Complete exit</Btn>
                    <Btn kind="ghost" onClick={() => update((s) => { delete emp(s, e.id)!.exit; }, `Offboarding cancelled for ${e.name}`)}>Cancel</Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {start && <StartExit onClose={() => setStart(false)} />}
    </>
  );
}

function StartExit({ onClose }: { onClose: () => void }) {
  const { st, update } = useHrm();
  const list = st.employees.filter((e) => e.status !== "former" && !e.exit);
  const [f, setF] = useState({ emp: list[0]?.id ?? "", reason: "Resignation", lastDay: addDays(TODAY, 30) });
  return (
    <Drawer title="Start offboarding" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="danger" disabled={!f.emp} onClick={() => { update((s) => { emp(s, f.emp)!.exit = { reason: f.reason, lastDay: f.lastDay, clearance: { assets: false, dues: false, access: false } }; }, `Offboarding started for ${emp(st, f.emp)?.name}`); onClose(); }}>Start</Btn></>}>
      <Field label="Staff"><Select value={f.emp} onChange={(e) => setF({ ...f, emp: e.target.value })}>{list.map((e: Employee) => <option key={e.id} value={e.id}>{e.name} · {e.id}</option>)}</Select></Field>
      <Field label="Reason"><Select value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })}><option>Resignation</option><option>End of contract</option><option>Termination</option><option>Retirement</option></Select></Field>
      <Field label="Last working day"><Input type="date" value={f.lastDay} onChange={(e) => setF({ ...f, lastDay: e.target.value })} /></Field>
    </Drawer>
  );
}
