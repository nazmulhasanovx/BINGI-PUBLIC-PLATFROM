"use client";
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, CalendarDays, ChevronDown, ChevronUp, ExternalLink, FileText, GraduationCap, History, Layers, LogIn, Mail, Network, Pencil, Phone, Plus, User, UserRound } from "lucide-react";
import { TODAY, emp, fmt, fmtStamp, gross, money, monthLabel, payStatus, useHrm, type Dept, type Employee } from "@/lib/hrm/store";
import { FilterSelect, StaffFrame, useToast } from "./Frame";
import { AddStaff } from "./overview";
import { Btn, Card, Chip, Drawer, Empty, Field, FilterChips, Input, Menu, Pager, Person, Pills, Select, Table, useQuery, type Tone } from "./ui";

const ACCESS: Record<Employee["access"], [string, Tone]> = { linked: ["Linked", "gray"], invited: ["Invited", "blue"], "not-invited": ["Not invited", "gray"], disabled: ["Disabled", "gray"] };
const STATUS: Record<Employee["status"], [string, Tone]> = { active: ["Active", "green"], inactive: ["Inactive", "red"], former: ["Former", "gray"] };
const PER = 7;

export function PeoplePage() {
  const { st, update } = useHrm();
  const toast = useToast();
  const qq = useQuery("q");
  const [qState, setQ] = useState<string | null>(null);
  const q = qState ?? qq ?? "";
  const [tab, setTab] = useState<"dir" | "inv" | "join">("dir");
  const [f, setF] = useState<"all" | "active" | "inactive" | "former">("all");
  const [dept, setDept] = useState<"all" | Dept>("all");
  const [acc, setAcc] = useState("all");
  const [etype, setEtype] = useState("all");
  const [page, setPage] = useState(1);
  const [add, setAdd] = useState(false);
  const counts = { all: st.employees.filter((e) => e.status !== "former").length, active: st.employees.filter((e) => e.status === "active").length, inactive: st.employees.filter((e) => e.status === "inactive").length, former: st.employees.filter((e) => e.status === "former").length };
  const list = st.employees.filter((e) => (f === "all" ? e.status !== "former" : e.status === f) && (dept === "all" || e.dept === dept) && (acc === "all" || e.access === acc) && (etype === "all" || e.type === etype) && (!q || `${e.name} ${e.id} ${e.dept} ${e.position}`.toLowerCase().includes(q.toLowerCase())));
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const p = Math.min(page, pages);
  const invites = st.employees.filter((e) => e.access === "invited" || e.access === "not-invited");
  const joining = [...st.candidates.filter((c) => c.offer?.status === "accepted" && !c.employeeId), ...st.employees.filter((e) => e.probationEnd && e.probationEnd >= TODAY)];
  const setStatus = (id: string, status: Employee["status"]) => update((s) => { const e = emp(s, id)!; e.status = status; if (status !== "active") e.access = "disabled"; }, `${emp(st, id)?.name} marked ${status}`);
  return (
    <StaffFrame tab="people" search={q} onSearch={(v) => { setQ(v); setPage(1); }} activeFilters={(acc !== "all" ? 1 : 0) + (etype !== "all" ? 1 : 0)} onClearFilters={() => { setAcc("all"); setEtype("all"); }}
      filters={<><FilterSelect label="Account access" value={acc} onChange={(v) => { setAcc(v); setPage(1); }} options={[{ v: "linked", label: "Linked" }, { v: "invited", label: "Invited" }, { v: "not-invited", label: "Not invited" }, { v: "disabled", label: "Disabled" }]} /><FilterSelect label="Employment" value={etype} onChange={(v) => { setEtype(v); setPage(1); }} options={["Full time", "Part time", "Contract"].map((x) => ({ v: x, label: x }))} /></>} action={<Btn kind="primary" onClick={() => setAdd(true)}><Plus className="size-[18px]" /> Add staff</Btn>}
      right={<label className="relative inline-flex h-11 items-center gap-2.5 rounded-xl border border-[#d3d8df] bg-white px-4 text-[15px] font-medium"><Layers className="size-[18px]" /><select value={dept} onChange={(e) => { setDept(e.target.value as Dept); setPage(1); }} className="appearance-none bg-transparent pr-6 outline-none" aria-label="Department"><option value="all">All departments</option>{st.settings.departments.map((d) => <option key={d}>{d}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 size-4" /></label>}>
      <Card>
        <div className="mb-4 border-b border-[#e3e7ec] pb-3">
          <Pills value={tab} onChange={setTab} items={[{ v: "dir", label: `Staff directory (${counts.all})` }, { v: "inv", label: `Invitations (${invites.length})` }, { v: "join", label: `Joining & probation (${joining.length})` }]} />
        </div>
        {tab === "dir" && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <FilterChips value={f} onChange={(v) => { setF(v); setPage(1); }} items={[{ v: "all", label: `All (${counts.all})` }, { v: "active", label: `Active (${counts.active})` }, { v: "inactive", label: `Inactive (${counts.inactive})` }, { v: "former", label: counts.former ? `Former staff (${counts.former})` : "Former staff" }]} />
              <span className="text-[14.5px] text-[#4d5664]">{counts.all} staff · {counts.active} active · {counts.inactive} inactive</span>
            </div>
            {list.length === 0 ? <Empty icon={<UserRound className="size-6" />} title="No staff found" text="Try another name, ID or department." /> : (
              <Table cols={[{ label: "Employee", w: "24%" }, { label: "Department" }, { label: "Position" }, { label: "Employment" }, { label: "Account access" }, { label: "Actions", w: "160px" }]}>
                {list.slice((p - 1) * PER, p * PER).map((e) => (
                  <tr key={e.id}>
                    <td><Person name={e.name} id={e.id} /></td>
                    <td>{e.dept}</td>
                    <td>{e.position}</td>
                    <td><Chip tone={STATUS[e.status][1]}>{STATUS[e.status][0]}</Chip></td>
                    <td><Chip tone={ACCESS[e.access][1]}>{ACCESS[e.access][0]}</Chip></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link href={`/hms/staff/people/${e.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-4 text-[14.5px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-4" /> Open</Link>
                        <Menu label={`Actions for ${e.name}`} items={[
                          ...(e.access !== "linked" && e.status === "active" ? [{ label: e.access === "invited" ? "Resend invitation" : "Invite to staff app", onClick: () => { update((s) => { emp(s, e.id)!.access = "invited"; }, `Invitation sent to ${e.name}`); toast(`Invitation marked as sent to ${e.name}`); } }] : []),
                          e.status === "active" ? { label: "Mark inactive", onClick: () => setStatus(e.id, "inactive") } : { label: "Reactivate", onClick: () => { update((s) => { const x = emp(s, e.id)!; x.status = "active"; x.access = "not-invited"; }, `${e.name} reactivated`); } },
                          ...(e.status !== "former" ? [{ label: "Start offboarding", onClick: () => { update((s) => { emp(s, e.id)!.exit = { reason: "Resignation", lastDay: TODAY, clearance: { assets: false, dues: false, access: false } }; }, `Offboarding started for ${e.name}`); toast("Added to Team Operations › Offboarding"); }, danger: true }] : []),
                        ]} />
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
            {list.length > 0 && <Pager page={p} pages={pages} onPage={setPage} from={(p - 1) * PER + 1} to={Math.min(p * PER, list.length)} total={list.length} />}
          </>
        )}
        {tab === "inv" && (
          <Table cols={[{ label: "Employee" }, { label: "Mobile" }, { label: "Status" }, { label: "Action", w: "200px" }]}>
            {invites.map((e) => (
              <tr key={e.id}>
                <td><Person name={e.name} id={e.id} /></td>
                <td>{e.phone}</td>
                <td><Chip tone={ACCESS[e.access][1]}>{ACCESS[e.access][0]}</Chip></td>
                <td>
                  {e.access === "invited" ? (
                    <div className="flex gap-2"><Btn onClick={() => toast(`Invitation marked as resent to ${e.name}`)}>Resend</Btn><Btn kind="ghost" onClick={() => update((s) => { emp(s, e.id)!.access = "linked"; }, `${e.name} joined the staff app`)}>Mark linked</Btn></div>
                  ) : (
                    <Btn kind="primary" onClick={() => update((s) => { emp(s, e.id)!.access = "invited"; }, `Invitation sent to ${e.name}`)}>Send invitation</Btn>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
        {tab === "join" && (
          <Table cols={[{ label: "Person" }, { label: "What" }, { label: "Date" }, { label: "Action", w: "160px" }]}>
            {st.candidates.filter((c) => c.offer?.status === "accepted" && !c.employeeId).map((c) => (
              <tr key={c.id}><td><Person name={c.name} id={c.id} /></td><td>Joining (offer accepted)</td><td>{fmt(c.offer!.start)}</td><td><Link href={`/hms/staff/hiring/${c.id}`} className="font-medium text-[#b11c29]">Open joining</Link></td></tr>
            ))}
            {st.employees.filter((e) => e.probationEnd && e.probationEnd >= TODAY).map((e) => (
              <tr key={e.id}><td><Person name={e.name} id={e.id} /></td><td>Probation review</td><td>{fmt(e.probationEnd!)}</td><td><Btn onClick={() => { update((s) => { const x = emp(s, e.id)!; delete x.probationEnd; x.reviews.unshift({ date: TODAY, by: s.settings.approver, score: 4, note: "Probation completed — confirmed." }); }, `${e.name} confirmed after probation`); toast(`${e.name} confirmed`); }}>Confirm</Btn></td></tr>
            ))}
          </Table>
        )}
      </Card>
      {add && <AddStaff onClose={() => setAdd(false)} />}
    </StaffFrame>
  );
}

/* ================= Employee workspace (HRM-10) ================= */
type ETab = "profile" | "work" | "attendance" | "pay" | "assets" | "reviews" | "joining" | "history";
export function EmployeePage({ id }: { id: string }) {
  const { st } = useHrm();
  const router = useRouter();
  const [find, setFind] = useState("");
  const e = emp(st, id);
  const [tab, setTab] = useState<ETab>("profile");
  const [more, setMore] = useState(false);
  const [edit, setEdit] = useState(false);
  if (!e) return <StaffFrame tab="people" hideSearch><Card><Empty icon={<User className="size-6" />} title="Employee not found" action={<Link href="/hms/staff/people" className="font-medium text-[#b11c29]">Back to People</Link>} /></Card></StaffFrame>;
  const moreItems: { v: ETab; label: string; icon: typeof Briefcase }[] = [{ v: "assets", label: "Assets & benefits", icon: Briefcase }, { v: "reviews", label: "Reviews & training", icon: GraduationCap }, { v: "joining", label: "Joining & exit", icon: LogIn }, { v: "history", label: "History", icon: History }];
  return (
    <StaffFrame tab="people" search={find} onSearch={setFind} onSubmit={(v) => v.trim() && router.push(`/hms/staff/people?q=${encodeURIComponent(v.trim())}`)} action={<Btn kind="primary" onClick={() => setEdit(true)}><Pencil className="size-4" /> Edit employee</Btn>}>
      <Card>
        <Link href="/hms/staff/people" className="inline-flex items-center gap-2 text-[15px] hover:text-[#b11c29]"><ArrowLeft className="size-[18px]" /> People</Link>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-[#ffe7e4] text-[22px] font-semibold text-[#b11c29]">{e.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>
          <div><p className="text-[24px] font-semibold leading-tight">{e.name}</p><p className="text-[15px] text-[#4d5664]">{e.id}</p></div>
          <span className="h-8 w-px bg-[#e3e7ec]" />
          <Chip tone={STATUS[e.status][1]}>{STATUS[e.status][0]}</Chip>
          <span className="h-8 w-px bg-[#e3e7ec]" />
          <span className="text-[16px]">{e.position}</span>
        </div>
        <div className="relative mt-5 flex items-center gap-1 border-b border-[#e3e7ec] pb-2.5">
          {(["profile", "work", "attendance", "pay"] as ETab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={clsx("whitespace-nowrap rounded-xl px-4 py-2 text-[15px] font-medium ", tab === t ? "bg-[#ffe7e4] text-[#b11c29]" : "hover:bg-[#e9edf2]")}>{t[0].toUpperCase() + t.slice(1)}</button>
          ))}
          <button onClick={() => setMore((m) => !m)} aria-label="More employee sections" aria-expanded={more} className={clsx("flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[15px] font-medium", moreItems.some((m) => m.v === tab) ? "border-transparent bg-[#ffe7e4] text-[#b11c29]" : "border-[#d3d8df]")}>
            {moreItems.find((m) => m.v === tab)?.label ?? "More"} {more ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {more && (
            <div className="absolute left-[330px] top-full z-30 mt-1 w-[250px] rounded-xl border border-[#e3e7ec] bg-white p-1.5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]">
              {moreItems.map((m) => <button key={m.v} onClick={() => { setTab(m.v); setMore(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] hover:bg-[#f4f6f8]"><m.icon className="size-5" /> {m.label}</button>)}
            </div>
          )}
        </div>
        <div className="mt-5">
          {tab === "profile" && <ProfileTab e={e} />}
          {tab === "work" && <WorkTab e={e} />}
          {tab === "attendance" && <EmpAttendance e={e} />}
          {tab === "pay" && <EmpPay e={e} />}
          {tab === "assets" && <AssetsTab e={e} />}
          {tab === "reviews" && <ReviewsTab e={e} />}
          {tab === "joining" && <JoiningTab e={e} />}
          {tab === "history" && <HistoryTab e={e} />}
        </div>
      </Card>
      {edit && <EditEmployee e={e} onClose={() => setEdit(false)} />}
    </StaffFrame>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: React.ReactNode }) {
  return <div className="grid grid-cols-[28px_150px_1fr] items-center gap-3 border-b border-[#e3e7ec] py-3 last:border-0"><Icon className="size-5 text-[#4d5664]" /><span className="text-[15px] text-[#4d5664]">{label}</span><span className="text-[15.5px]">{value}</span></div>;
}

function ProfileTab({ e }: { e: Employee }) {
  const renewal = e.docs.find((d) => d.expires);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Employment summary"><Row icon={Network} label="Department" value={e.dept} /><Row icon={CalendarDays} label="Joining date" value={fmt(e.joined)} /><Row icon={User} label="Manager" value={e.manager} /></Card>
      <div className="space-y-4">
        <Card title="Personal details"><Row icon={Mail} label="Email" value={e.email || "Not provided"} /><Row icon={Phone} label="Mobile" value={e.phone} /><Row icon={Phone} label="Emergency contact" value={e.emergency || "Not provided"} /></Card>
        <Card title="Documents"><div className="flex items-center gap-3"><FileText className="size-5 text-[#4d5664]" /><span className="flex-1 text-[16px]">Documents ({e.docs.length})</span>{renewal && <Chip tone="red">Pending renewal: {fmt(renewal.expires!).slice(0, 6)}</Chip>}</div>
          <ul className="mt-2 space-y-1 pl-8 text-[14px] text-[#4d5664]">{e.docs.map((d) => <li key={d.name}>{d.name}{d.expires ? ` · expires ${fmt(d.expires)}` : ""}</li>)}</ul>
        </Card>
      </div>
    </div>
  );
}

function WorkTab({ e }: { e: Employee }) {
  const { st } = useHrm();
  const week = Object.entries(st.roster.cells[e.id] ?? {});
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Work"><Row icon={Network} label="Department" value={e.dept} /><Row icon={Briefcase} label="Position" value={e.position} /><Row icon={User} label="Reports to" value={e.manager} /><Row icon={FileText} label="Employment" value={e.type} /><Row icon={CalendarDays} label="Probation" value={e.probationEnd ? `Until ${fmt(e.probationEnd)}` : "Completed"} /></Card>
      <Card title="This week’s roster" right={<Link href="/hms/staff/schedule" className="text-[14.5px] font-medium text-[#b11c29]">Schedule</Link>}>
        <ul className="divide-y divide-[#e3e7ec]">{week.map(([d, s]) => <li key={d} className="flex justify-between py-2 text-[15px]"><span>{fmt(d)}</span><Chip tone={s === "Off" ? "gray" : s === "Leave" ? "red" : s === "Evening" ? "amber" : "blue"}>{s}</Chip></li>)}</ul>
      </Card>
    </div>
  );
}

function EmpAttendance({ e }: { e: Employee }) {
  const { st } = useHrm();
  const days = Object.keys(st.attendance).sort().reverse();
  const recs = days.map((d) => ({ d, r: st.attendance[d][e.id] }));
  const present = recs.filter((x) => x.r?.status === "present").length;
  if (st.settings.attendance === "none") return <Empty icon={<CalendarDays className="size-6" />} title="Attendance is off for this property" text="Fixed payroll, leave and schedule still work." />;
  return (
    <>
      <p className="mb-3 text-[15px] text-[#4d5664]">{present} present of {recs.length} recorded days · Leave balance: {st.balances[e.id]?.["Annual Leave"] ?? 0} annual days</p>
      <Table cols={[{ label: "Date" }, { label: "Attendance" }, { label: "Check-in" }, { label: "Check-out" }, { label: "Remark" }]}>
        {recs.map(({ d, r }) => (
          <tr key={d}><td>{fmt(d)}</td><td><Chip tone={!r ? "gray" : r.status === "present" ? "green" : r.status === "leave" ? "blue" : r.status === "absent" ? "red" : "amber"}>{r ? r.status[0].toUpperCase() + r.status.slice(1) : "Not marked"}</Chip></td><td>{r?.in ?? "—"}</td><td>{r?.out ?? "—"}</td><td>{r?.remark ?? "—"}</td></tr>
        ))}
      </Table>
    </>
  );
}

function EmpPay({ e }: { e: Employee }) {
  const { st } = useHrm();
  const lines = st.runs.flatMap((r) => r.lines.filter((l) => l.emp === e.id).map((l) => ({ r, l })));
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <Card title="Salary structure">
        {(["basic", "house", "food", "transport"] as const).map((k) => <div key={k} className="flex justify-between border-b border-[#e3e7ec] py-2.5 text-[15px] capitalize last:border-0"><span className="text-[#4d5664]">{k === "house" ? "House rent" : k}</span><span>BDT {money(e.salary[k])}</span></div>)}
        <div className="mt-2 flex justify-between text-[16px] font-semibold"><span>Gross / month</span><span>BDT {money(gross(e))}</span></div>
      </Card>
      <Card title="Payslips">
        {lines.length === 0 ? <p className="text-[14.5px] text-[#4d5664]">No payroll run yet.</p> : (
          <Table cols={[{ label: "Month" }, { label: "Net (BDT)", align: "right" }, { label: "Paid (BDT)", align: "right" }, { label: "Status" }, { label: "" }]}>
            {lines.map(({ r, l }) => <tr key={r.id}><td>{monthLabel(r.month)}</td><td className="text-right">{money(l.gross - l.deductions)}</td><td className="text-right">{money(l.paid)}</td><td><Chip tone={payStatus(l) === "Paid" ? "green" : payStatus(l) === "Unpaid" ? "red" : "amber"}>{payStatus(l)}</Chip></td><td><Link href={`/hms/staff/payroll/${r.id}?emp=${e.id}`} className="font-medium text-[#b11c29]">Open</Link></td></tr>)}
          </Table>
        )}
      </Card>
    </div>
  );
}

function AssetsTab({ e }: { e: Employee }) {
  const { st, update } = useHrm();
  const [name, setName] = useState("");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Assets issued">
        {e.assets.length === 0 && <p className="mb-3 text-[14.5px] text-[#4d5664]">No assets issued.</p>}
        <ul className="divide-y divide-[#e3e7ec]">{e.assets.map((a) => <li key={a.tag} className="flex items-center justify-between py-2.5 text-[15px]"><span>{a.name} <span className="text-[#4d5664]">· {a.tag}</span></span><span className="flex items-center gap-3 text-[#4d5664]">since {fmt(a.since)}<button onClick={() => update((s) => { const x = emp(s, e.id)!; x.assets = x.assets.filter((y) => y.tag !== a.tag); }, `${a.name} returned by ${e.name}`)} className="text-[13px] font-medium text-[#b11c29]">Return</button></span></li>)}</ul>
        <div className="mt-3 flex gap-2"><Input value={name} onChange={(ev) => setName(ev.target.value)} placeholder="e.g. Uniform set" /><Btn disabled={!name.trim()} onClick={() => { update((s) => { emp(s, e.id)!.assets.push({ name: name.trim(), tag: `AS-${Math.floor(Math.random() * 900 + 100)}`, since: TODAY }); }, `${name} issued to ${e.name}`); setName(""); }}>Issue</Btn></div>
      </Card>
      <Card title="Benefits">
        <ul className="divide-y divide-[#e3e7ec]">{st.benefits.map((b) => <li key={b.name} className="py-2.5"><p className="text-[15px] font-medium">{b.name}</p><p className="text-[14px] text-[#4d5664]">{b.detail}</p></li>)}</ul>
      </Card>
    </div>
  );
}

function ReviewsTab({ e }: { e: Employee }) {
  const { update } = useHrm();
  const [note, setNote] = useState("");
  const [score, setScore] = useState(4);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Performance reviews">
        <ul className="mb-3 divide-y divide-[#e3e7ec]">{e.reviews.map((r, i) => <li key={i} className="py-2.5"><p className="text-[15px] font-medium">{"★".repeat(r.score)}<span className="text-[#d3d8df]">{"★".repeat(5 - r.score)}</span> <span className="ml-2 text-[14px] font-normal text-[#4d5664]">{fmt(r.date)} · {r.by}</span></p><p className="text-[14.5px] text-[#4d5664]">{r.note}</p></li>)}</ul>
        {e.reviews.length === 0 && <p className="mb-3 text-[14.5px] text-[#4d5664]">No reviews yet.</p>}
        <div className="space-y-2 rounded-xl bg-[#f4f6f8] p-3">
          <Select value={score} onChange={(ev) => setScore(Number(ev.target.value))} aria-label="Score">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}</Select>
          <Input value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Short note" />
          <Btn disabled={!note.trim()} onClick={() => { update((s) => { emp(s, e.id)!.reviews.unshift({ date: TODAY, by: s.settings.approver, score, note: note.trim() }); }, `Review added for ${e.name}`); setNote(""); }}>Add review</Btn>
        </div>
      </Card>
      <Card title="Training">
        <ul className="divide-y divide-[#e3e7ec]">{e.trainings.map((t, i) => <li key={i} className="flex items-center justify-between py-2.5 text-[15px]"><span>{t.name} <span className="text-[#4d5664]">· {fmt(t.date)}</span></span>{t.status === "done" ? <Chip tone="green">Done</Chip> : <button onClick={() => update((s) => { emp(s, e.id)!.trainings[i].status = "done"; }, `${t.name} completed by ${e.name}`)} className="text-[14px] font-medium text-[#b11c29]">Mark done</button>}</li>)}</ul>
        {e.trainings.length === 0 && <p className="text-[14.5px] text-[#4d5664]">No training planned.</p>}
      </Card>
    </div>
  );
}

function JoiningTab({ e }: { e: Employee }) {
  const { update } = useHrm();
  const toast = useToast();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Joining"><Row icon={CalendarDays} label="Joined" value={fmt(e.joined)} /><Row icon={FileText} label="Probation" value={e.probationEnd ? `Review on ${fmt(e.probationEnd)}` : "Completed"} /><Row icon={FileText} label="Documents" value={`${e.docs.length} on file`} /></Card>
      <Card title="Exit">
        {e.exit ? (
          <>
            <p className="text-[15px]">{e.exit.reason} · last day {fmt(e.exit.lastDay)}</p>
                        <Link href="/hms/staff/operations?t=off" className="mt-3 inline-block font-medium text-[#b11c29]">Open offboarding</Link>
          </>
        ) : (
          <>
            <p className="text-[14.5px] text-[#4d5664]">No exit in progress.</p>
            <Btn kind="danger" className="mt-3" onClick={() => { update((s) => { emp(s, e.id)!.exit = { reason: "Resignation", lastDay: TODAY, clearance: { assets: false, dues: false, access: false } }; }, `Offboarding started for ${e.name}`); toast("Offboarding started"); }}>Start offboarding</Btn>
          </>
        )}
      </Card>
    </div>
  );
}

function HistoryTab({ e }: { e: Employee }) {
  const { st } = useHrm();
  const items = st.activity.filter((a) => a.text.includes(e.name.split(" ")[0]));
  return items.length ? <ul className="space-y-2.5">{items.map((a, i) => <li key={i} className="flex justify-between gap-4 border-b border-[#e3e7ec] pb-2.5 text-[15px]"><span>{a.text}</span><span className="text-[#4d5664]">{fmtStamp(a.at)}</span></li>)}</ul> : <Empty icon={<History className="size-6" />} title="No history yet" text="Changes to this employee appear here." />;
}

function EditEmployee({ e, onClose }: { e: Employee; onClose: () => void }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const [f, setF] = useState({ name: e.name, dept: e.dept, position: e.position, phone: e.phone, email: e.email, emergency: e.emergency, manager: e.manager, type: e.type, basic: e.salary.basic, house: e.salary.house, food: e.salary.food, transport: e.salary.transport });
  const managers = useMemo(() => ["Hotel Manager", ...st.employees.filter((x) => /Supervisor|Manager/.test(x.position)).map((x) => x.name)], [st.employees]);
  return (
    <Drawer title="Edit employee" onClose={onClose} wide footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!f.name.trim()} onClick={() => { update((s) => { const x = emp(s, e.id)!; Object.assign(x, { name: f.name.trim(), dept: f.dept, position: f.position, phone: f.phone, email: f.email, emergency: f.emergency, manager: f.manager, type: f.type }); x.salary = { basic: f.basic, house: f.house, food: f.food, transport: f.transport }; }, `${f.name} updated`); toast("Saved"); onClose(); }}>Save changes</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={f.name} onChange={(ev) => setF({ ...f, name: ev.target.value })} /></Field>
        <Field label="Position"><Input value={f.position} onChange={(ev) => setF({ ...f, position: ev.target.value })} /></Field>
        <Field label="Department"><Select value={f.dept} onChange={(ev) => setF({ ...f, dept: ev.target.value as Dept })}>{st.settings.departments.map((d) => <option key={d}>{d}</option>)}</Select></Field>
        <Field label="Reports to"><Select value={f.manager} onChange={(ev) => setF({ ...f, manager: ev.target.value })}>{managers.map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <Field label="Mobile"><Input value={f.phone} onChange={(ev) => setF({ ...f, phone: ev.target.value })} /></Field>
        <Field label="Email"><Input value={f.email} onChange={(ev) => setF({ ...f, email: ev.target.value })} /></Field>
        <Field label="Emergency contact"><Input value={f.emergency} onChange={(ev) => setF({ ...f, emergency: ev.target.value })} placeholder="Name · mobile" /></Field>
        <Field label="Employment"><Select value={f.type} onChange={(ev) => setF({ ...f, type: ev.target.value as Employee["type"] })}><option>Full time</option><option>Part time</option><option>Contract</option></Select></Field>
      </div>
      <p className="mb-2 mt-6 text-[15px] font-semibold">Salary (BDT / month)</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["basic", "house", "food", "transport"] as const).map((k) => <Field key={k} label={k === "house" ? "House rent" : k[0].toUpperCase() + k.slice(1)}><Input type="number" min={0} value={f[k]} onChange={(ev) => setF({ ...f, [k]: Number(ev.target.value) || 0 })} /></Field>)}
      </div>
      <p className="mt-2 text-[14px] text-[#4d5664]">Gross: BDT {money(f.basic + f.house + f.food + f.transport)} — applies from the next payroll run.</p>
    </Drawer>
  );
}
