"use client";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Coins, ExternalLink, FileText, Gift, Hourglass, History, Plus, Printer, Trash2, Wallet } from "lucide-react";
import { TODAY, emp, fmt, gross, lineNet, money, monthLabel, payStatus, runPayStatus, runTotals, useHrm, type PayLine, type Payment, type PayrollRun } from "@/lib/hrm/store";
import { prepareRun, recordPayment } from "@/lib/hrm/actions";
import { DateBox, FilterSelect, StaffFrame, useToast } from "./Frame";
import { Btn, Card, Chip, Drawer, Empty, Field, Input, Menu, Person, Select, Table, useQuery, type Tone } from "./ui";

const PS_TONE = (s: string): Tone => (s === "Paid" ? "green" : s === "Unpaid" ? "red" : "amber");
const RUN_ST: Record<PayrollRun["status"], [string, Tone]> = { draft: ["Draft", "gray"], reviewed: ["Reviewed", "blue"], approved: ["Approved", "green"] };
const nextMonth = (m: string) => { const [y, mo] = m.split("-").map(Number); return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`; };

export function PayrollPage() {
  const { st, update } = useHrm();
  const go = useRouter().push;
  const toast = useToast();
  const [tab, setTab] = useState<"runs" | "struct" | "adj" | "ben">("runs");
  const [q, setQ] = useState("");
  const latest = st.runs[0]?.month ?? "2026-10";
  const [month, setMonth] = useState(latest);
  const [openRun, setOpenRun] = useState<string | null>(st.runs[0]?.id ?? null);
  const [prep, setPrep] = useState(false);
  const runs = st.runs.filter((r) => r.month === month || month === "all");
  const [fp, setFp] = useState("all");
  const nameOk = (id: string, l?: PayLine) => (fp === "all" || (!!l && payStatus(l) === fp)) && (!q || `${emp(st, id)?.name} ${id}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <StaffFrame tab="payroll" search={q} onSearch={setQ} searchPlaceholder="Search staff" activeFilters={fp !== "all" ? 1 : 0} onClearFilters={() => setFp("all")} filters={tab === "runs" ? <FilterSelect label="Payment status" value={fp} onChange={setFp} options={["Paid", "Partially paid", "Unpaid"].map((x) => ({ v: x, label: x }))} /> : undefined} action={<Btn kind="primary" onClick={() => setPrep(true)}><ArrowRight className="size-[18px]" /> Prepare payroll</Btn>}
      right={tab === "runs" ? <DateBox type="month" value={month === "all" ? latest : month} onChange={setMonth} label={month === "all" ? "All months" : monthLabel(month)} /> : undefined}>
      <Card>
        <h2 className="text-[24px] font-semibold">Payroll &amp; Benefits</h2>
        <div className="mt-3 flex flex-wrap gap-2 border-b border-[#e3e7ec] pb-3">
          {([["runs", "Payroll runs"], ["struct", "Salary structures"], ["adj", "Advances & adjustments"], ["ben", "Benefits"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} className={clsx("whitespace-nowrap rounded-xl px-4 py-2 text-[16px]", tab === v ? "bg-[#ffe7e4] font-medium text-[#b11c29]" : "hover:bg-[#f4f6f8]")}>{l}</button>
          ))}
        </div>
        {tab === "runs" && (
          <div className="mt-4 space-y-3">
            {runs.length === 0 && <Empty icon={<Coins className="size-6" />} title={`No payroll for ${monthLabel(month)}`} text="Prepare payroll to create the run from salary structures." action={<div className="flex gap-2"><Btn kind="primary" onClick={() => setPrep(true)}>Prepare payroll</Btn>{st.runs.length > 0 && <Btn onClick={() => setMonth("all")}>Show all runs</Btn>}</div>} />}
            {runs.map((r) => {
              const t = runTotals(r);
              const open = openRun === r.id;
              return (
                <div key={r.id}>
                  <div className="flex flex-wrap items-center gap-4 rounded-xl bg-[#ffe7e4] px-4 py-3">
                    <button onClick={() => setOpenRun(open ? null : r.id)} aria-label={open ? "Collapse" : "Expand"} className="grid size-8 place-items-center">{open ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}</button>
                    <span className="text-[21px] font-semibold">{monthLabel(r.month)}</span>
                    <Chip tone={RUN_ST[r.status][1]}>{RUN_ST[r.status][0]}</Chip>
                    {r.status === "approved" && <Chip tone={PS_TONE(runPayStatus(r))}>{runPayStatus(r)}</Chip>}
                    <span className="ml-auto flex flex-wrap items-center gap-4 text-[17px]"><span>Net BDT{money(t.net)}</span><span className="h-6 w-px bg-[#d3d8df]" /><span>Paid BDT{money(t.paid)}</span><span className="h-6 w-px bg-[#d3d8df]" /><span>Due BDT{money(t.due)}</span></span>
                    <Link href={`/hms/staff/payroll/${r.id}`} className="inline-flex h-10 items-center rounded-xl border border-[#d3d8df] bg-white px-4 text-[15.5px] font-medium hover:bg-[#f4f6f8]">Open</Link>
                  </div>
                  {open && (
                    <div className="mt-2">
                      <Table cols={[{ label: "Employee", w: "24%" }, { label: "Gross (BDT)", align: "right" }, { label: "Net (BDT)", align: "right" }, { label: "Paid (BDT)", align: "right" }, { label: "Due (BDT)", align: "right" }, { label: "Payment status", align: "center" }, { label: "Actions", w: "170px" }]}>
                        {r.lines.filter((l) => nameOk(l.emp, l)).map((l) => (
                          <tr key={l.emp}>
                            <td><Person name={emp(st, l.emp)?.name ?? l.emp} id="" /></td>
                            <td className="text-right">{money(l.gross)}</td>
                            <td className="text-right">{money(lineNet(l))}</td>
                            <td className="text-right">{money(l.paid)}</td>
                            <td className="text-right">{money(lineNet(l) - l.paid)}</td>
                            <td className="text-center"><Chip tone={PS_TONE(payStatus(l))}>{payStatus(l)}</Chip></td>
                            <td><div className="flex gap-2"><Link href={`/hms/staff/payroll/${r.id}?emp=${l.emp}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-4 text-[14.5px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-4" /> Open</Link>
                              <Menu label={`Payroll actions for ${emp(st, l.emp)?.name}`} items={[{ label: "Payslip", onClick: () => go(`/hms/staff/payroll/${r.id}?emp=${l.emp}`) }, ...(r.status === "approved" && lineNet(l) > l.paid ? [{ label: "Record payment", onClick: () => go(`/hms/staff/payroll/${r.id}?pay=${l.emp}`) }] : []), { label: "Open employee", onClick: () => go(`/hms/staff/people/${l.emp}`) }]} /></div></td>
                          </tr>
                        ))}
                      </Table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {tab === "struct" && <Structures q={q} />}
        {tab === "adj" && <Adjustments />}
        {tab === "ben" && <Benefits />}
      </Card>
      {prep && <PrepareDrawer onClose={() => setPrep(false)} onDone={(id) => { toast("Payroll prepared · review the lines"); go(`/hms/staff/payroll/${id}`); }} update={update} />}
    </StaffFrame>
  );
}

function PrepareDrawer({ onClose, onDone, update }: { onClose: () => void; onDone: (id: string) => void; update: ReturnType<typeof useHrm>["update"] }) {
  const { st } = useHrm();
  const [m, setM] = useState(st.runs.length ? nextMonth(st.runs[0].month) : TODAY.slice(0, 7));
  const exists = st.runs.some((r) => r.month === m);
  const active = st.employees.filter((e) => e.status === "active");
  const adj = st.adjustments.filter((a) => a.month === m);
  const total = active.reduce((t, e) => t + gross(e), 0) + adj.filter((a) => a.kind === "Bonus").reduce((t, a) => t + a.amount, 0);
  return (
    <Drawer title="Prepare payroll" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn>{exists ? <Btn kind="primary" onClick={() => onDone(m)}>Open existing run</Btn> : <Btn kind="primary" onClick={() => { update((s) => { prepareRun(s, m, monthLabel(m)); }, `Payroll prepared for ${monthLabel(m)}`); onDone(m); }}>Prepare {monthLabel(m)}</Btn>}</>}>
      <Field label="Month"><Input type="month" value={m} onChange={(e) => e.target.value && setM(e.target.value)} /></Field>
      {exists ? <p className="rounded-xl bg-[#fff6e5] px-4 py-3 text-[14.5px] text-[#8a5a00]">{monthLabel(m)} already has a payroll run.</p> : (
        <div className="rounded-xl border border-[#e3e7ec] px-4 py-3 text-[15px]">
          <div className="flex justify-between py-1"><span className="text-[#4d5664]">Active staff</span><span>{active.length}</span></div>
          <div className="flex justify-between py-1"><span className="text-[#4d5664]">Adjustments this month</span><span>{adj.length}</span></div>
          <div className="flex justify-between py-1 font-semibold"><span>Estimated gross</span><span>BDT {money(total)}</span></div>
        </div>
      )}
      <p className="text-[13.5px] text-[#4d5664]">Built from salary structures plus this month’s adjustments. You review every line before approving.</p>
    </Drawer>
  );
}

function Structures({ q }: { q: string }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const [edit, setEdit] = useState<string | null>(null);
  const list = st.employees.filter((e) => e.status === "active" && (!q || `${e.name} ${e.id}`.toLowerCase().includes(q.toLowerCase())));
  const e = edit ? emp(st, edit) : undefined;
  const [f, setF] = useState({ basic: 0, house: 0, food: 0, transport: 0 });
  return (
    <div className="mt-4">
      <Table cols={[{ label: "Employee", w: "24%" }, { label: "Basic", align: "right" }, { label: "House rent", align: "right" }, { label: "Food", align: "right" }, { label: "Transport", align: "right" }, { label: "Gross (BDT)", align: "right" }, { label: "", w: "100px" }]}>
        {list.map((x) => <tr key={x.id}><td><Person name={x.name} id={x.id} /></td><td className="text-right">{money(x.salary.basic)}</td><td className="text-right">{money(x.salary.house)}</td><td className="text-right">{money(x.salary.food)}</td><td className="text-right">{money(x.salary.transport)}</td><td className="text-right font-semibold">{money(gross(x))}</td><td><Btn onClick={() => { setF(x.salary); setEdit(x.id); }}>Edit</Btn></td></tr>)}
      </Table>
      {e && (
        <Drawer title={`Salary · ${e.name}`} onClose={() => setEdit(null)} footer={<><Btn onClick={() => setEdit(null)}>Cancel</Btn><Btn kind="primary" disabled={f.basic <= 0} onClick={() => { update((s) => { emp(s, e.id)!.salary = { ...f }; }, `Salary updated for ${e.name}: BDT ${money(f.basic + f.house + f.food + f.transport)}`); toast("Saved · applies from the next payroll run"); setEdit(null); }}>Save</Btn></>}>
          <div className="grid grid-cols-2 gap-3">{(["basic", "house", "food", "transport"] as const).map((k) => <Field key={k} label={k === "house" ? "House rent" : k[0].toUpperCase() + k.slice(1)}><Input type="number" min={0} value={f[k]} onChange={(ev) => setF({ ...f, [k]: Math.max(0, Number(ev.target.value) || 0) })} /></Field>)}</div>
          <p className="text-[15px]">Gross: <b>BDT {money(f.basic + f.house + f.food + f.transport)}</b> / month</p>
          <p className="text-[13.5px] text-[#4d5664]">Runs already prepared keep their amounts.</p>
        </Drawer>
      )}
    </div>
  );
}

function Adjustments() {
  const { st, update } = useHrm();
  const active = st.employees.filter((e) => e.status === "active");
  const [f, setF] = useState({ emp: active[0]?.id ?? "", kind: "Advance" as "Advance" | "Bonus" | "Deduction", amount: 0, month: st.runs.length ? nextMonth(st.runs[0].month) : TODAY.slice(0, 7), note: "" });
  const locked = (m: string) => st.runs.some((r) => r.month === m);
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
      <div>
        {st.adjustments.length === 0 ? <Empty icon={<Wallet className="size-6" />} title="No advances or adjustments" /> : (
          <Table cols={[{ label: "Employee", w: "26%" }, { label: "Type" }, { label: "Amount (BDT)", align: "right" }, { label: "Payroll month" }, { label: "Note" }, { label: "", w: "56px" }]}>
            {st.adjustments.map((a) => (
              <tr key={a.id}>
                <td><Person name={emp(st, a.emp)?.name ?? a.emp} id={a.emp} /></td>
                <td><Chip tone={a.kind === "Bonus" ? "green" : a.kind === "Advance" ? "blue" : "red"}>{a.kind}</Chip></td>
                <td className="text-right">{a.kind === "Bonus" ? "+" : "−"}{money(a.amount)}</td>
                <td>{monthLabel(a.month)}{locked(a.month) && <span className="block text-[13px] text-[#4d5664]">In prepared run</span>}</td>
                <td>{a.note}</td>
                <td>{!locked(a.month) && <button onClick={() => update((s) => { s.adjustments = s.adjustments.filter((x) => x.id !== a.id); }, `${a.kind} removed for ${emp(st, a.emp)?.name}`)} aria-label="Remove" className="grid size-9 place-items-center rounded-lg text-[#4d5664] hover:bg-[#f4f6f8] hover:text-[#b11c29]"><Trash2 className="size-4" /></button>}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
      <Card title="Add">
        <div className="space-y-3">
          <Field label="Staff"><Select value={f.emp} onChange={(e) => setF({ ...f, emp: e.target.value })}>{active.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Select></Field>
          <Field label="Type"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as typeof f.kind })}><option>Advance</option><option>Bonus</option><option>Deduction</option></Select></Field>
          <Field label="Amount (BDT)"><Input type="number" min={0} value={f.amount || ""} onChange={(e) => setF({ ...f, amount: Math.max(0, Number(e.target.value) || 0) })} /></Field>
          <Field label="Payroll month" hint={locked(f.month) ? "This month is already prepared — choose a later month." : undefined}><Input type="month" value={f.month} onChange={(e) => e.target.value && setF({ ...f, month: e.target.value })} /></Field>
          <Field label="Note"><Input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
          <Btn kind="primary" className="w-full" disabled={!f.amount || locked(f.month)} onClick={() => { update((s) => { s.adjustments.unshift({ id: `ADJ-${Date.now() % 100000}`, emp: f.emp, kind: f.kind, amount: f.amount, month: f.month, note: f.note.trim() }); }, `${f.kind} BDT ${money(f.amount)} added for ${emp(st, f.emp)?.name} (${monthLabel(f.month)})`); setF({ ...f, amount: 0, note: "" }); }}><Plus className="size-4" /> Add {f.kind.toLowerCase()}</Btn>
        </div>
      </Card>
    </div>
  );
}

function Benefits() {
  const { st, update } = useHrm();
  const [f, setF] = useState({ name: "", detail: "", who: "All staff" });
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
      <ul className="grid content-start gap-3 sm:grid-cols-2">
        {st.benefits.map((b) => (
          <li key={b.name} className="rounded-xl border border-[#e3e7ec] p-4">
            <div className="flex items-start justify-between gap-2"><Gift className="size-5 text-[#b11c29]" /><button onClick={() => update((s) => { s.benefits = s.benefits.filter((x) => x.name !== b.name); }, `Benefit removed: ${b.name}`)} aria-label={`Remove ${b.name}`} className="text-[#8a8f9c] hover:text-[#b11c29]"><Trash2 className="size-4" /></button></div>
            <p className="mt-2 text-[16px] font-semibold">{b.name}</p>
            <p className="text-[14.5px] text-[#4d5664]">{b.detail}</p>
            <p className="mt-2 text-[13.5px] text-[#4d5664]">{b.who}</p>
          </li>
        ))}
      </ul>
      <Card title="Add benefit">
        <div className="space-y-3">
          <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Health cover" /></Field>
          <Field label="Details"><Input value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} placeholder="What staff get" /></Field>
          <Field label="Who gets it"><Input value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })} /></Field>
          <Btn kind="primary" className="w-full" disabled={!f.name.trim() || st.benefits.some((b) => b.name === f.name.trim())} onClick={() => { update((s) => { s.benefits.push({ name: f.name.trim(), detail: f.detail.trim(), who: f.who.trim() || "All staff" }); }, `Benefit added: ${f.name}`); setF({ name: "", detail: "", who: "All staff" }); }}>Add benefit</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ================= HRM-11 Payroll workspace ================= */
const STEPS = ["Prepare", "Review", "Approve", "Payment"];
export function PayrollRunPage({ id }: { id: string }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [fp, setFp] = useState("all");
  const qEmp = useQuery("emp");
  const qPay = useQuery("pay");
  const [slipState, setSlip] = useState<string | null | undefined>(undefined);
  const [payState, setPay] = useState<string | null | undefined>(undefined);
  const slip = slipState === undefined ? qEmp : slipState;
  const pay = payState === undefined ? qPay : payState;
  const [hist, setHist] = useState(false);
  const r = st.runs.find((x) => x.id === id);
  if (!r) return <StaffFrame tab="payroll" hideSearch><Card><Empty icon={<Coins className="size-6" />} title="Payroll run not found" action={<Link href="/hms/staff/payroll" className="font-medium text-[#b11c29]">Back to Payroll</Link>} /></Card></StaffFrame>;
  const t = runTotals(r);
  const lines = r.lines.filter((l) => (fp === "all" || payStatus(l) === fp) && (!q || `${emp(st, l.emp)?.name} ${l.emp} ${emp(st, l.emp)?.dept}`.toLowerCase().includes(q.toLowerCase())));
  const advance = (step: 2 | 3 | 4, status: PayrollRun["status"], msg: string) => { update((s) => { const x = s.runs.find((y) => y.id === id)!; x.step = step; x.status = status; }, `${monthLabel(r.month)} payroll: ${msg}`); toast(msg); };
  const action =
    r.step === 1 ? <Btn kind="primary" onClick={() => advance(2, "draft", "Sent for review")}>Send for review</Btn>
    : r.step === 2 ? <Btn kind="primary" onClick={() => advance(3, "reviewed", "Marked as reviewed")}>Mark reviewed</Btn>
    : r.step === 3 ? <Btn kind="primary" onClick={() => advance(4, "approved", "Payroll approved")}>Approve payroll</Btn>
    : <Btn kind="primary" disabled={t.due <= 0} onClick={() => setPay(r.lines.find((l) => lineNet(l) > l.paid)?.emp ?? null)}>Record payment</Btn>;
  return (
    <StaffFrame tab="payroll" search={q} onSearch={setQ} action={action} activeFilters={fp !== "all" ? 1 : 0} onClearFilters={() => setFp("all")} filters={<FilterSelect label="Payment status" value={fp} onChange={setFp} options={["Paid", "Partially paid", "Unpaid"].map((x) => ({ v: x, label: x }))} />}>
      <Card>
        <Link href="/hms/staff/payroll" className="inline-flex items-center gap-4 text-[16px]"><span className="grid size-10 place-items-center rounded-xl border border-[#d3d8df]"><ArrowLeft className="size-5" /></span> Back to Payroll</Link>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <h2 className="text-[25px] font-semibold">{monthLabel(r.month)} run</h2>
          <Chip tone={RUN_ST[r.status][1]}>{RUN_ST[r.status][0]}</Chip>
          {r.status === "approved" && <Chip tone={PS_TONE(runPayStatus(r))}>{runPayStatus(r)}</Chip>}
        </div>
        <ol className="mx-auto mt-6 grid max-w-[1080px] grid-cols-4">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const done = n < r.step || (n === 4 && r.step === 4 && t.due <= 0);
            const cur = n === r.step && !done;
            return (
              <li key={s} className="relative flex flex-col items-center gap-2">
                {i > 0 && <span className={clsx("absolute right-1/2 top-[21px] h-0.5 w-full", n <= r.step ? "bg-[#f08b84]" : "bg-[#e3e7ec]")} />}
                <span className={clsx("relative z-10 grid size-11 place-items-center rounded-full text-[17px] font-semibold", done ? "bg-[#e9564d] text-white" : cur ? "border-2 border-[#b11c29] bg-white text-[#b11c29]" : "border-2 border-[#d3d8df] bg-white text-[#8a8f9c]")}>{done ? <Check className="size-5" /> : n}</span>
                <span className={clsx("text-[17px]", cur && "font-semibold")}>{s}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat icon={Coins} label="Total gross payable" v={money(t.gross)} />
          <Stat icon={Wallet} label="Total paid" v={money(t.paid)} />
          <Stat icon={Hourglass} label="Total due" v={money(t.due)} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Btn onClick={() => setSlip(r.lines[0]?.emp ?? null)}><FileText className="size-[18px]" /> Payslip</Btn>
          <Btn onClick={() => setHist(true)}><History className="size-[18px]" /> Payment history</Btn>
          {r.step < 4 && <span className="self-center text-[14px] text-[#4d5664]">{r.step === 1 ? "Check deductions in each breakdown, then send for review." : r.step === 2 ? "Reviewer checks the lines." : "Approve to unlock payments."}</span>}
        </div>
        <div className="mt-5">
          <Table cols={[{ label: "Employee", w: "22%" }, { label: "Gross (BDT)", align: "right" }, { label: "Deductions (BDT)", align: "right" }, { label: "Net (BDT)", align: "right" }, { label: "Paid (BDT)", align: "right" }, { label: "Due (BDT)", align: "right" }, { label: "Actions", w: "220px" }]}>
            {lines.map((l) => (
              <tr key={l.emp}>
                <td><Person name={emp(st, l.emp)?.name ?? l.emp} id={l.emp} /></td>
                <td className="text-right">{money(l.gross)}</td>
                <td className="text-right">{money(l.deductions)}</td>
                <td className="text-right">{money(lineNet(l))}</td>
                <td className="text-right">{money(l.paid)}</td>
                <td className="text-right">{money(lineNet(l) - l.paid)}</td>
                <td><button onClick={() => setSlip(l.emp)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-4 text-[15px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-4" /> Open (breakdown)</button></td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>
      {slip && <Payslip run={r} empId={slip} onClose={() => setSlip(null)} onPay={() => { setPay(slip); setSlip(null); }} onPick={setSlip} />}
      {pay && <PayDrawer run={r} empId={pay} onClose={() => setPay(null)} />}
      {hist && (
        <Drawer title="Payment history" onClose={() => setHist(false)}>
          {r.payments.length === 0 ? <p className="text-[15px] text-[#4d5664]">No payments recorded yet.</p> : (
            <ul className="divide-y divide-[#e3e7ec]">{r.payments.map((p, i) => <li key={i} className="flex items-center justify-between py-3"><span><span className="block text-[15.5px] font-medium">{emp(st, p.emp)?.name}</span><span className="text-[13.5px] text-[#4d5664]">{fmt(p.date)} · {p.method}{p.note ? ` · ${p.note}` : ""}</span></span><span className="text-[16px] font-semibold">BDT {money(p.amount)}</span></li>)}</ul>
          )}
        </Drawer>
      )}
    </StaffFrame>
  );
}

function Stat({ icon: Icon, label, v }: { icon: typeof Coins; label: string; v: string }) {
  return <div className="flex items-center gap-5 rounded-xl border border-[#e3e7ec] px-6 py-4"><Icon className="size-7" /><div><p className="text-[16px]">{label}</p><p className="text-[28px] font-semibold leading-tight">{v}</p></div></div>;
}

function Payslip({ run, empId, onClose, onPay, onPick }: { run: PayrollRun; empId: string; onClose: () => void; onPay: () => void; onPick: (id: string) => void }) {
  const { st, update } = useHrm();
  const l = run.lines.find((x) => x.emp === empId) as PayLine | undefined;
  const e = emp(st, empId);
  const [ded, setDed] = useState(l?.deductions ?? 0);
  if (!l || !e) return null;
  const adj = st.adjustments.filter((a) => a.emp === empId && a.month === run.month);
  const bonus = adj.filter((a) => a.kind === "Bonus").reduce((t, a) => t + a.amount, 0);
  const base = l.gross - bonus;
  const g = gross(e) || 1;
  const parts = (["basic", "house", "food", "transport"] as const).map((k) => [k === "house" ? "House rent" : k[0].toUpperCase() + k.slice(1), Math.round((e.salary[k] / g) * base)] as const);
  const pays = run.payments.filter((p) => p.emp === empId);
  return (
    <Drawer wide title={`Payslip · ${monthLabel(run.month)}`} onClose={onClose} footer={<><Btn onClick={() => window.print()}><Printer className="size-4" /> Print</Btn>{run.status === "approved" && lineNet(l) > l.paid && <Btn kind="primary" onClick={onPay}>Record payment</Btn>}</>}>
      <div className="flex items-center justify-between gap-3">
        <Person name={e.name} id={e.id} sub={`${e.id} · ${e.position}`} />
        <Select value={empId} onChange={(ev) => onPick(ev.target.value)} className="w-[200px]" aria-label="Employee">{run.lines.map((x) => <option key={x.emp} value={x.emp}>{emp(st, x.emp)?.name}</option>)}</Select>
      </div>
      <div className="rounded-xl border border-[#e3e7ec] px-4 py-2 text-[15px]">
        <p className="py-2 font-semibold">Earnings</p>
        {parts.map(([k, v]) => <div key={k} className="flex justify-between py-1.5"><span className="text-[#4d5664]">{k}</span><span>{money(v)}</span></div>)}
        {adj.filter((a) => a.kind === "Bonus").map((a) => <div key={a.id} className="flex justify-between py-1.5"><span className="text-[#4d5664]">Bonus · {a.note}</span><span>{money(a.amount)}</span></div>)}
        <div className="flex justify-between border-t border-[#e3e7ec] py-2 font-semibold"><span>Gross</span><span>{money(l.gross)}</span></div>
        <p className="pt-2 font-semibold">Deductions</p>
        {adj.filter((a) => a.kind !== "Bonus").map((a) => <div key={a.id} className="flex justify-between py-1.5"><span className="text-[#4d5664]">{a.kind} · {a.note}</span><span>−{money(a.amount)}</span></div>)}
        {run.step === 1 ? (
          <div className="flex items-center justify-between gap-3 py-1.5"><span className="text-[#4d5664]">Total deductions</span><Input type="number" min={0} max={l.gross} value={ded} onChange={(ev) => setDed(Math.min(l.gross, Math.max(0, Number(ev.target.value) || 0)))} className="w-[140px] text-right" /></div>
        ) : <div className="flex justify-between py-1.5"><span className="text-[#4d5664]">Total deductions</span><span>−{money(l.deductions)}</span></div>}
        <div className="flex justify-between border-t border-[#e3e7ec] py-2 text-[17px] font-semibold"><span>Net pay</span><span>BDT {money(l.gross - (run.step === 1 ? ded : l.deductions))}</span></div>
        <div className="flex justify-between py-1.5"><span className="text-[#4d5664]">Paid</span><span>{money(l.paid)}</span></div>
        <div className="flex justify-between py-1.5 font-medium"><span>Due</span><span>{money(lineNet(l) - l.paid)}</span></div>
      </div>
      {run.step === 1 && ded !== l.deductions && <Btn kind="primary" onClick={() => update((s) => { s.runs.find((x) => x.id === run.id)!.lines.find((x) => x.emp === empId)!.deductions = ded; }, `Deductions set to BDT ${money(ded)} for ${e.name} (${monthLabel(run.month)})`)}>Save deductions</Btn>}
      {run.step > 1 && run.step < 4 && <p className="text-[13.5px] text-[#4d5664]">Locked while in review. Payments open after approval.</p>}
      {pays.length > 0 && <div><p className="mb-1 text-[15px] font-semibold">Payments</p><ul className="text-[14.5px]">{pays.map((p, i) => <li key={i} className="flex justify-between py-1"><span>{fmt(p.date)} · {p.method}</span><span>BDT {money(p.amount)}</span></li>)}</ul></div>}
    </Drawer>
  );
}

function PayDrawer({ run, empId, onClose }: { run: PayrollRun; empId: string; onClose: () => void }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const [who, setWho] = useState(empId);
  const l = run.lines.find((x) => x.emp === who);
  const due = l ? lineNet(l) - l.paid : 0;
  const [amount, setAmount] = useState(due);
  const [method, setMethod] = useState<Payment["method"]>("Cash");
  const [date, setDate] = useState(TODAY);
  const [note, setNote] = useState("");
  const unpaid = run.lines.filter((x) => lineNet(x) > x.paid);
  return (
    <Drawer title="Record payment" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={run.status !== "approved" || amount <= 0 || amount > due} onClick={() => { update((s) => recordPayment(s, run.id, { emp: who, amount, method, date, note: note.trim() || undefined }), `Payment BDT ${money(amount)} recorded for ${emp(st, who)?.name} (${monthLabel(run.month)})`); toast(amount === due ? "Paid in full" : "Partial payment recorded"); onClose(); }}>Record BDT {money(amount)}</Btn></>}>
      {run.status !== "approved" && <p className="rounded-xl bg-[#fff6e5] px-4 py-3 text-[14.5px] text-[#8a5a00]">Approve the payroll first.</p>}
      <Field label="Employee"><Select value={who} onChange={(e) => { setWho(e.target.value); const x = run.lines.find((y) => y.emp === e.target.value)!; setAmount(lineNet(x) - x.paid); }}>{(unpaid.some((x) => x.emp === who) ? unpaid : [l!, ...unpaid]).map((x) => <option key={x.emp} value={x.emp}>{emp(st, x.emp)?.name} · due {money(lineNet(x) - x.paid)}</option>)}</Select></Field>
      <Field label={`Amount (BDT) · due ${money(due)}`}><Input type="number" min={1} max={due} value={amount || ""} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} /></Field>
      {amount > due && <p className="text-[14px] text-[#b11c29]">More than the amount due.</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Method"><Select value={method} onChange={(e) => setMethod(e.target.value as Payment["method"])}><option>Cash</option><option>Bank</option><option>bKash</option></Select></Field>
        <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      </div>
      <Field label="Reference / note"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" /></Field>
      <p className="text-[13.5px] text-[#4d5664]">This records a payment made outside BinGi (cash, bank, bKash). No money is sent from here.</p>
    </Drawer>
  );
}
