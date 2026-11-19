"use client";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, Check, CalendarOff, Clock, ExternalLink, Minus, Plus, RefreshCw, Tag, User, X, Fingerprint } from "lucide-react";
import { TODAY, addDays, emp, fmt, fmtStamp, useHrm, type Att, type AttStatus, type Employee } from "@/lib/hrm/store";
import { decideRequest } from "@/lib/hrm/actions";
import { DateBox, FilterSelect, StaffFrame, useToast } from "./Frame";
import { Btn, Card, Chip, Drawer, Empty, Field, Input, Menu, Pager, Person, Pills, Select, Table, type Tone } from "./ui";

const PER = 7;
export const ATT_LABEL: Record<AttStatus, [string, Tone]> = { present: ["Present", "green"], absent: ["Absent", "red"], leave: ["On approved leave", "blue"], half: ["Half day", "amber"], off: ["Day off", "gray"] };

function AttChip({ r }: { r?: Att }) {
  if (!r) return <Chip tone="gray"><Minus className="size-4" /> Not marked</Chip>;
  const [l, t] = ATT_LABEL[r.status];
  const Icon = r.status === "present" ? Check : r.status === "absent" ? X : r.status === "leave" ? CalendarDays : Minus;
  return <Chip tone={t}><Icon className="size-4" /> {l}</Chip>;
}
function Remark({ r }: { r?: Att }) {
  if (!r?.remark) return <span>—</span>;
  return <Chip tone={/late/i.test(r.remark) ? "amber" : "gray"}>{r.remark}</Chip>;
}

export function AttendancePage() {
  const { st } = useHrm();
  const mode = st.settings.attendance;
  if (mode === "machine") return <MachineAttendance />;
  if (mode === "none")
    return (
      <StaffFrame tab="attendance" hideSearch>
        <Card><Empty icon={<CalendarOff className="size-6" />} title="Attendance is off for this property" text="Staff, schedule, leave and fixed payroll still work. Turn attendance on any time." action={<Link href="/hms/staff/settings?s=attendance" className="font-medium text-[#b11c29]">Choose attendance method</Link>} /></Card>
      </StaffFrame>
    );
  return <ManualAttendance />;
}

/* ---------------- HRM-03A Manual ---------------- */
function ManualAttendance() {
  const { st, update } = useHrm();
  const toast = useToast();
  const [date, setDate] = useState(TODAY);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"daily" | "corr" | "hist">("daily");
  const [sel, setSel] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [mark, setMark] = useState<string[] | null>(null);
  const day = st.attendance[date] ?? {};
  const active = st.employees.filter((e) => e.status === "active");
  const [fd, setFd] = useState("all");
  const [fs, setFs] = useState("all");
  const list = active.filter((e) => (fd === "all" || e.dept === fd) && (fs === "all" || (fs === "none" ? !day[e.id] : day[e.id]?.status === fs)) && (!q || `${e.name} ${e.id} ${e.dept}`.toLowerCase().includes(q.toLowerCase())));
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const p = Math.min(page, pages);
  const rows = list.slice((p - 1) * PER, p * PER);
  const c = { present: active.filter((e) => day[e.id]?.status === "present" || day[e.id]?.status === "half").length, leave: active.filter((e) => day[e.id]?.status === "leave").length, absent: active.filter((e) => day[e.id]?.status === "absent").length, nm: active.filter((e) => !day[e.id]).length };
  const corr = st.requests.filter((r) => r.kind === "Attendance correction");
  const allSel = rows.length > 0 && rows.every((r) => sel.includes(r.id));
  return (
    <StaffFrame tab="attendance" search={q} onSearch={(v) => { setQ(v); setPage(1); }} activeFilters={(fd !== "all" ? 1 : 0) + (fs !== "all" ? 1 : 0)} onClearFilters={() => { setFd("all"); setFs("all"); }}
      filters={<><FilterSelect label="Department" value={fd} onChange={(v) => { setFd(v); setPage(1); }} options={st.settings.departments.map((d) => ({ v: d, label: d }))} /><FilterSelect label="Attendance" value={fs} onChange={(v) => { setFs(v); setPage(1); }} options={[{ v: "present", label: "Present" }, { v: "half", label: "Half day" }, { v: "absent", label: "Absent" }, { v: "leave", label: "On leave" }, { v: "off", label: "Day off" }, { v: "none", label: "Not marked" }]} /></>} action={<Btn kind="primary" onClick={() => setMark(sel.length ? sel : [])}><Plus className="size-[18px]" /> Mark attendance</Btn>}
      right={<><DateBox value={date} onChange={(v) => { setDate(v); setSel([]); }} label={fmt(date)} /><span className="rounded-lg bg-[#e9edf2] px-3 py-1.5 text-[15px] text-[#4d5664]">Asia/Dhaka</span></>}>
      <Card>
        <span className="inline-block rounded-xl bg-[#ffe7e4] px-4 py-2 text-[15.5px] font-medium text-[#b11c29]">Manual attendance</span>
        <div className="mt-3 flex flex-wrap gap-1 border-b border-[#e3e7ec]">
          {([["daily", "Daily"], ["corr", `Corrections${corr.some((r) => r.status === "pending") ? ` (${corr.filter((r) => r.status === "pending").length})` : ""}`], ["hist", "History"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} className={clsx("whitespace-nowrap -mb-px rounded-t-xl px-5 py-2.5 text-[15.5px] font-medium", tab === v ? "border-b-2 border-[#b11c29] bg-[#ffe7e4] text-[#b11c29]" : "hover:bg-[#f4f6f8]")}>{l}</button>
          ))}
        </div>

        {tab === "daily" && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-y-3 rounded-xl border border-[#e3e7ec] px-4 py-4 sm:grid-cols-5 sm:divide-x sm:divide-[#e3e7ec]">
              <Kpi icon={<User className="size-5 text-[#4d5664]" />} text={`${active.length} active`} />
              <Kpi icon={<span className="grid size-6 place-items-center rounded-full bg-[#e3f5e8]"><Check className="size-4 text-[#1f8f4a]" /></span>} text={`${c.present} present`} />
              <Kpi icon={<CalendarDays className="size-5 text-[#4d5664]" />} text={`${c.leave} leave`} />
              <Kpi icon={<span className="grid size-6 place-items-center rounded-full bg-[#ffe7e4]"><X className="size-4 text-[#b11c29]" /></span>} text={`${c.absent} absent`} />
              <Kpi icon={<span className="grid size-6 place-items-center rounded-full bg-[#e9edf2]"><Minus className="size-4" /></span>} text={`${c.nm} not marked`} />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-3 text-[15px] text-[#4d5664]"><input type="checkbox" checked={allSel} onChange={() => setSel(allSel ? sel.filter((s) => !rows.some((r) => r.id === s)) : [...new Set([...sel, ...rows.map((r) => r.id)])])} className="size-5 accent-[#b11c29]" aria-label="Select page" /> {sel.length} selected</label>
              <Btn disabled={!sel.length} onClick={() => setMark(sel)} className={clsx(!sel.length && "border-transparent bg-[#e9edf2] text-[#8a8f9c]")}>Mark selected</Btn>
              {c.nm > 0 && <button onClick={() => setMark(active.filter((e) => !day[e.id]).map((e) => e.id))} className="ml-auto text-[14.5px] font-medium text-[#b11c29]">Mark all not marked ({c.nm})</button>}
            </div>
            <div className="mt-3">
              <Table cols={[{ label: <span className="sr-only">Select</span>, w: "44px" }, { label: "Employee", w: "22%" }, { label: "Attendance" }, { label: "Check-in" }, { label: "Check-out" }, { label: "Remark" }, { label: "Actions", w: "270px", align: "right" }]}>
                {rows.map((e) => {
                  const r = day[e.id];
                  return (
                    <tr key={e.id}>
                      <td><input type="checkbox" checked={sel.includes(e.id)} onChange={() => setSel(sel.includes(e.id) ? sel.filter((s) => s !== e.id) : [...sel, e.id])} className="size-5 accent-[#b11c29]" aria-label={`Select ${e.name}`} /></td>
                      <td><Person name={e.name} id={e.id} /></td>
                      <td><AttChip r={r} /></td>
                      <td>{r?.in ?? "—"}</td>
                      <td>{r?.out ?? "—"}</td>
                      <td><Remark r={r} /></td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {!r && <button onClick={() => setMark([e.id])} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#f3a9a3] px-4 text-[14.5px] font-medium text-[#b11c29] hover:bg-[#ffe7e4]"><Plus className="size-4" /> Mark</button>}
                          <Link href={`/hms/staff/people/${e.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-4 text-[14.5px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-4" /> Open</Link>
                          <Menu label={`Attendance actions for ${e.name}`} items={[
                            { label: r ? "Edit attendance" : "Mark attendance", onClick: () => setMark([e.id]) },
                            ...(r?.status === "present" && !r.out ? [{ label: "Check out now", onClick: () => { update((s) => { s.attendance[date][e.id].out = new Date().toTimeString().slice(0, 5); s.attendance[date][e.id].remark = undefined; }, `${e.name} checked out`); toast(`${e.name} checked out`); } }] : []),
                            ...(r ? [{ label: "Clear record", danger: true, onClick: () => update((s) => { delete s.attendance[date][e.id]; }, `Attendance cleared for ${e.name} (${fmt(date)})`) }] : []),
                          ]} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            </div>
            {list.length === 0 ? <Empty icon={<User className="size-6" />} title="No staff found" /> : <Pager page={p} pages={pages} onPage={setPage} from={(p - 1) * PER + 1} to={Math.min(p * PER, list.length)} total={list.length} />}
          </>
        )}
        {tab === "corr" && <Corrections />}
        {tab === "hist" && <AttHistory onDay={(d) => { setDate(d); setTab("daily"); }} />}
      </Card>
      {mark && <MarkDrawer ids={mark} date={date} onClose={() => { setMark(null); setSel([]); }} />}
    </StaffFrame>
  );
}

function Kpi({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center justify-center gap-3 text-[16.5px]">{icon}{text}</div>;
}

function Corrections() {
  const { st, update } = useHrm();
  const toast = useToast();
  const list = st.requests.filter((r) => r.kind === "Attendance correction");
  if (!list.length) return <Empty icon={<Clock className="size-6" />} title="No correction requests" text="When staff ask to fix a missed punch, it shows here." />;
  return (
    <div className="mt-4">
      <Table cols={[{ label: "Request" }, { label: "Employee" }, { label: "Date" }, { label: "Change" }, { label: "Status" }, { label: "Action", w: "210px" }]}>
        {list.map((r) => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td><Person name={emp(st, r.emp)?.name ?? r.emp} id={r.emp} /></td>
            <td>{fmt(r.date)}</td>
            <td>{r.details}</td>
            <td><Chip tone={r.status === "pending" ? "amber" : r.status === "approved" ? "green" : "red"}>{r.status[0].toUpperCase() + r.status.slice(1)}</Chip></td>
            <td>{r.status === "pending" ? <div className="flex gap-2"><Btn kind="primary" onClick={() => { update((s) => decideRequest(s, r.id, true), `${r.id} approved — attendance corrected`); toast("Approved · attendance updated"); }}>Approve</Btn><Btn onClick={() => update((s) => decideRequest(s, r.id, false), `${r.id} rejected`)}>Reject</Btn></div> : "—"}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function AttHistory({ onDay }: { onDay: (d: string) => void }) {
  const { st } = useHrm();
  const active = st.employees.filter((e) => e.status === "active");
  const days = Array.from({ length: 7 }, (_, i) => addDays(TODAY, -i));
  return (
    <div className="mt-4">
      <Table cols={[{ label: "Date" }, { label: "Present", align: "right" }, { label: "Leave", align: "right" }, { label: "Absent", align: "right" }, { label: "Not marked", align: "right" }, { label: "", w: "120px" }]}>
        {days.map((d) => {
          const day = st.attendance[d] ?? {};
          const n = (s: AttStatus) => active.filter((e) => day[e.id]?.status === s).length;
          const nm = active.filter((e) => !day[e.id]).length;
          return (
            <tr key={d}>
              <td>{fmt(d)}{d === TODAY && <span className="ml-2 text-[13px] text-[#4d5664]">Today</span>}</td>
              <td className="text-right">{n("present") + n("half")}</td><td className="text-right">{n("leave")}</td><td className="text-right">{n("absent")}</td>
              <td className={clsx("text-right", nm && "font-medium text-[#b45309]")}>{nm}</td>
              <td><button onClick={() => onDay(d)} className="font-medium text-[#b11c29]">Open day</button></td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

function MarkDrawer({ ids, date, onClose }: { ids: string[]; date: string; onClose: () => void }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const first = ids.length === 1 ? st.attendance[date]?.[ids[0]] : undefined;
  const [who, setWho] = useState<string[]>(ids);
  const [status, setStatus] = useState<AttStatus>(first?.status ?? "present");
  const [tin, setIn] = useState(first?.in ?? "08:00");
  const [tout, setOut] = useState(first?.out ?? "");
  const [remark, setRemark] = useState(first?.remark ?? "");
  const [pick, setPick] = useState("");
  const active = st.employees.filter((e) => e.status === "active");
  const onLeave = who.filter((id) => st.attendance[date]?.[id]?.status === "leave" && status !== "leave");
  const bad = (status === "present" || status === "half") && (!tin || (!!tout && tout <= tin));
  const save = () => {
    update((s) => {
      const d = (s.attendance[date] ??= {});
      for (const id of who) d[id] = { status, in: status === "present" || status === "half" ? tin : undefined, out: status === "present" || status === "half" ? tout || undefined : undefined, remark: remark.trim() || (status === "present" && !tout ? "Checkout pending" : undefined), source: "manual" };
    }, `Attendance marked ${ATT_LABEL[status][0].toLowerCase()} for ${who.length} staff (${fmt(date)})`);
    toast(`Saved for ${who.length} staff`);
    onClose();
  };
  return (
    <Drawer title="Mark attendance" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!who.length || bad} onClick={save}>Save attendance</Btn></>}>
      <p className="text-[15px] text-[#4d5664]">{fmt(date)} · Asia/Dhaka</p>
      <Field group label={`Staff (${who.length})`}>
        <div className="flex flex-wrap gap-2">
          {who.map((id) => <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-[#e9edf2] py-1 pl-3 pr-1.5 text-[14px]">{emp(st, id)?.name}<button onClick={() => setWho(who.filter((x) => x !== id))} aria-label={`Remove ${emp(st, id)?.name}`} className="grid size-5 place-items-center rounded-full hover:bg-[#e2e4ea]"><X className="size-3.5" /></button></span>)}
        </div>
        <Select value={pick} onChange={(e) => { if (e.target.value) setWho([...who, e.target.value]); setPick(""); }} className="mt-2" aria-label="Add staff">
          <option value="">+ Add staff</option>
          {active.filter((e) => !who.includes(e.id)).map((e) => <option key={e.id} value={e.id}>{e.name} · {e.id}</option>)}
        </Select>
      </Field>
      <Field group label="Attendance">
        <Pills choice value={status} onChange={setStatus} size="sm" items={[{ v: "present", label: "Present" }, { v: "half", label: "Half day" }, { v: "absent", label: "Absent" }, { v: "leave", label: "Leave" }, { v: "off", label: "Day off" }]} />
      </Field>
      {(status === "present" || status === "half") && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in"><Input type="time" value={tin} onChange={(e) => setIn(e.target.value)} /></Field>
          <Field label="Check-out" hint="Leave empty if still on duty"><Input type="time" value={tout} onChange={(e) => setOut(e.target.value)} /></Field>
        </div>
      )}
      {bad && <p className="text-[14px] text-[#b11c29]">Check-out must be after check-in.</p>}
      <Field label="Remark"><Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="e.g. Late 12m" /></Field>
      {onLeave.length > 0 && <p className="rounded-xl bg-[#fff6e5] px-3 py-2.5 text-[14px] text-[#8a5a00]">{onLeave.map((id) => emp(st, id)?.name).join(", ")} {onLeave.length > 1 ? "are" : "is"} on approved leave. Saving will replace the leave mark (the leave balance is not returned).</p>}
    </Drawer>
  );
}

/* ---------------- HRM-03B Machine (ZKT) ---------------- */
type MRow = { e: Employee; in?: string; out?: string; status: "Missing punch" | "Awaiting sync" | "Complete" };
function MachineAttendance() {
  const { st, update } = useHrm();
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"daily" | "corr" | "dev">("daily");
  const [date, setDate] = useState(TODAY);
  const [open, setOpen] = useState<string | null>("EMP001");
  const [md, setMd] = useState("all");
  const [ms, setMs] = useState("all");
  const z = st.zkt;
  const day = st.attendance[date] ?? {};
  const rows: MRow[] = st.employees.filter((e) => e.status === "active").flatMap((e): MRow[] => {
    const logs = date === TODAY ? z.logs.filter((l) => l.emp === e.id) : [];
    const r = day[e.id];
    const tin = logs.find((l) => l.type === "in")?.time ?? (r?.source === "zkt" ? r.in : undefined);
    const tout = logs.find((l) => l.type === "out")?.time ?? (r?.source === "zkt" || r?.remark === "Corrected" ? r?.out : undefined);
    if (r?.status === "leave" || r?.status === "absent" || r?.status === "off") return [];
    if (tin && tout) return [{ e, in: tin, out: tout, status: "Complete" }];
    if (tin) return [{ e, in: tin, status: "Missing punch" }];
    if (!r) return [{ e, status: "Awaiting sync" }];
    return [];
  }).filter((r) => (md === "all" || r.e.dept === md) && (ms === "all" || r.status === ms) && (!q || `${r.e.name} ${r.e.id} ${r.e.dept}`.toLowerCase().includes(q.toLowerCase())));
  const sel = rows.find((r) => r.e.id === open);
  const sync = () => {
    if (!z.online) { toast("ZKT MB460 is offline — nothing synced. Check the device power and network."); return; }
    update((s) => { s.zkt.lastSync = `${TODAY}T${new Date().toTimeString().slice(0, 5)}`; }, "ZKT logs synced");
  };
  return (
    <StaffFrame tab="attendance" search={q} onSearch={setQ} activeFilters={(md !== "all" ? 1 : 0) + (ms !== "all" ? 1 : 0)} onClearFilters={() => { setMd("all"); setMs("all"); }}
      filters={<><FilterSelect label="Department" value={md} onChange={setMd} options={st.settings.departments.map((d) => ({ v: d, label: d }))} /><FilterSelect label="Status" value={ms} onChange={setMs} options={["Missing punch", "Awaiting sync", "Complete"].map((x) => ({ v: x, label: x }))} /></>} action={<Btn kind="primary" onClick={sync}><RefreshCw className="size-[18px]" /> Sync logs</Btn>}
      right={<DateBox value={date} onChange={setDate} label={fmt(date)} />}>
      <div className={clsx("grid gap-4", sel && tab === "daily" && "xl:grid-cols-[minmax(0,1fr)_330px]")}>
        <Card className="min-w-0">
          <div className="flex flex-wrap gap-1">
            {([["daily", "Daily"], ["corr", "Corrections"], ["dev", "Devices & logs"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} className={clsx("whitespace-nowrap rounded-xl px-5 py-2.5 text-[15.5px] font-medium", tab === v ? "bg-[#ffe7e4] text-[#b11c29]" : "hover:bg-[#f4f6f8]")}>{l}</button>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-[#e3e7ec] p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Fingerprint className="size-7" />
              <span className="text-[18px] font-semibold">{z.device}</span>
              <Chip tone="blue">Machine</Chip>
              <Chip tone={z.online ? "green" : "red"}><span className={clsx("size-2.5 rounded-full", z.online ? "bg-[#1f8f4a]" : "bg-[#b11c29]")} /> {z.online ? "Online" : "Offline"}</Chip>
              <span className="text-[15px] text-[#4d5664]">Last successful sync: {fmtStamp(z.lastSync)}</span>
            </div>
            {!z.online && <p className="mt-3 flex items-center gap-3 rounded-xl bg-[#fff1d6] px-4 py-3 text-[16px] text-[#8a5a00]"><AlertTriangle className="size-5" /> Device offline — attendance may be incomplete.</p>}
          </div>

          {tab === "daily" && (
            <>
              <div className="mt-4 flex justify-between text-[15px] text-[#4d5664]"><span>Last synced: {fmtStamp(z.lastSync)} Asia/Dhaka</span><span>Source: {z.device}</span></div>
              <div className="mt-3">
                {rows.length === 0 ? <Empty icon={<Check className="size-6" />} title="Nothing to review" text="All punches for this day are complete." /> : (
                  <Table cols={[{ label: "Employee", w: "24%" }, { label: "Department" }, { label: "In" }, { label: "Out" }, { label: "Status" }, { label: "Source" }, { label: "Actions", w: "150px" }]}>
                    {rows.map((r) => (
                      <tr key={r.e.id} onClick={() => setOpen(r.e.id)} className={clsx("cursor-pointer", open === r.e.id && "[&>td]:bg-[#ffe7e4]")}>
                        <td><Person name={r.e.name} id={r.e.id} /></td>
                        <td>{r.e.dept}</td>
                        <td>{r.in ?? "—"}</td>
                        <td>{r.out ?? "—"}</td>
                        <td><Chip tone={r.status === "Missing punch" ? "red" : r.status === "Awaiting sync" ? "amber" : "green"}>{r.status}</Chip></td>
                        <td className="whitespace-nowrap">{z.device}</td>
                        <td onClick={(ev) => ev.stopPropagation()}>
                          <div className="flex gap-2">
                            <button onClick={() => setOpen(r.e.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-3.5 text-[14.5px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-4" /> Open</button>
                            <Menu label={`Actions for ${r.e.name}`} items={[{ label: "Open employee", onClick: () => router.push(`/hms/staff/people/${r.e.id}`) }, { label: "Mark absent", danger: true, onClick: () => update((s) => { (s.attendance[date] ??= {})[r.e.id] = { status: "absent", source: "manual", remark: "Marked by admin" }; }, `${r.e.name} marked absent (${fmt(date)})`) }]} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Table>
                )}
              </div>
              {rows.length > 0 && <Pager page={1} pages={1} onPage={() => {}} from={1} to={rows.length} total={rows.length} />}
            </>
          )}
          {tab === "corr" && <Corrections />}
          {tab === "dev" && (
            <div className="mt-4 space-y-4">
              <Table cols={[{ label: "Time" }, { label: "Employee" }, { label: "Punch" }, { label: "Device" }]}>
                {z.logs.map((l, i) => <tr key={i}><td>{fmt(TODAY)} {l.time}</td><td><Person name={emp(st, l.emp)?.name ?? l.emp} id={l.emp} /></td><td>{l.type === "in" ? "Check-in" : "Check-out"}</td><td>{z.device}</td></tr>)}
              </Table>
              <p className="rounded-xl bg-[#f4f6f8] px-4 py-3 text-[14.5px] text-[#4d5664]">Demo logs only. The live ZKT connection (device → BinGi cloud) is not connected in this build — logs here are sample punches.</p>
            </div>
          )}
        </Card>
        {sel && tab === "daily" && <ReviewEntry r={sel} date={date} device={z.device} onClose={() => setOpen(null)} />}
      </div>
    </StaffFrame>
  );
}

function ReviewEntry({ r, date, device, onClose }: { r: MRow; date: string; device: string; onClose: () => void }) {
  const { update } = useHrm();
  const toast = useToast();
  const [out, setOut] = useState("");
  const [tin, setIn] = useState("");
  return (
    <Card>
      <div className="flex items-center justify-between"><h2 className="text-[21px] font-semibold">Review entry</h2><button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg hover:bg-[#e9edf2]"><X className="size-5" /></button></div>
      <div className="mt-4 flex items-center gap-3 border-b border-[#e3e7ec] pb-4"><Person name={r.e.name} id={r.e.id} sub={`${r.e.id} · ${r.e.dept}`} /></div>
      <div className="divide-y divide-[#e3e7ec]">
        <RRow icon={CalendarDays} label="Date" v={fmt(date)} />
        <RRow icon={Clock} label="In" v={r.in ?? "—"} />
        <RRow icon={Clock} label="Out" v={r.out ?? "—"} />
        <RRow icon={Tag} label="Status" v={<Chip tone={r.status === "Missing punch" ? "red" : r.status === "Awaiting sync" ? "amber" : "green"}>{r.status}</Chip>} />
        <RRow icon={Fingerprint} label="Source" v={device} />
      </div>
      {r.status !== "Complete" && (
        <div className="mt-3 space-y-2 rounded-xl bg-[#f4f6f8] p-3">
          <p className="text-[14.5px] font-medium">Fix manually</p>
          {!r.in && <Field label="Check-in"><Input type="time" value={tin} onChange={(e) => setIn(e.target.value)} /></Field>}
          <Field label="Check-out"><Input type="time" value={out} onChange={(e) => setOut(e.target.value)} /></Field>
          <Btn kind="primary" className="w-full" disabled={!(r.in || tin) || (!!out && out <= (r.in || tin))} onClick={() => { update((s) => { (s.attendance[date] ??= {})[r.e.id] = { status: "present", in: r.in || tin, out: out || undefined, remark: "Corrected", source: "zkt" }; }, `Punch corrected for ${r.e.name} (${fmt(date)})`); toast("Entry corrected"); }}>Save correction</Btn>
        </div>
      )}
      <Link href={`/hms/staff/people/${r.e.id}`} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d3d8df] text-[16px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-[18px]" /> Open</Link>
    </Card>
  );
}
function RRow({ icon: Icon, label, v }: { icon: typeof Clock; label: string; v: React.ReactNode }) {
  return <div className="flex items-center gap-3 py-3 text-[15.5px]"><Icon className="size-5 text-[#4d5664]" /><span className="flex-1">{label}</span><span>{v}</span></div>;
}
