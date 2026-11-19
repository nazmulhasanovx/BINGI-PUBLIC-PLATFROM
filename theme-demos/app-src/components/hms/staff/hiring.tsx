"use client";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, ExternalLink, History, Info, Plus, UserPlus, Wallet, Briefcase } from "lucide-react";
import { TODAY, addDays, fmt, money, useHrm, type Candidate, type Dept, type Job, type Stage } from "@/lib/hrm/store";
import { confirmJoining } from "@/lib/hrm/actions";
import { FilterSelect, StaffFrame, useToast } from "./Frame";
import { Area, Avatar, Btn, Card, Chip, Drawer, Empty, Field, FilterChips, Input, Menu, Person, Select, Table, useQuery, type Tone } from "./ui";

const STAGES: Stage[] = ["applied", "shortlisted", "interview", "offer", "joining"];
const STAGE_LABEL: Record<Stage, [string, Tone]> = { applied: ["Applied", "gray"], shortlisted: ["Shortlisted", "blue"], interview: ["Interview", "purple"], offer: ["Offer", "amber"], joining: ["Joining", "green"], rejected: ["Rejected", "red"] };
const JOB_ST: Record<Job["status"], [string, Tone]> = { published: ["Published", "green"], draft: ["Draft", "gray"], closed: ["Closed", "red"] };
const offerLabel = (c: Candidate): [string, Tone] => !c.offer ? ["No offer", "gray"] : c.offer.status === "accepted" ? ["Offer accepted", "green"] : c.offer.status === "sent" ? ["Offer sent", "amber"] : ["Declined", "red"];
const stamp = (s: { update: ReturnType<typeof useHrm>["update"] }, id: string, fn: (c: Candidate) => void, text: string, log: string) =>
  s.update((st) => { const c = st.candidates.find((x) => x.id === id)!; fn(c); c.history.unshift({ date: TODAY, text }); }, log);

export function HiringPage() {
  const { st, update } = useHrm();
  const toast = useToast();
  const router = useRouter();
  const [tab, setTab] = useState<"jobs" | "cands" | "int">("jobs");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<"all" | Stage>("all");
  const [job, setJob] = useState<Job | "new" | null>(null);
  const [addCand, setAddCand] = useState(false);
  const [fj, setFj] = useState("all");
  const m = (s: string) => !q || s.toLowerCase().includes(q.toLowerCase());
  const jobs = st.jobs.filter((j) => (fj === "all" || j.id === fj) && m(`${j.title} ${j.id}`));
  const cands = st.candidates.filter((c) => (stage === "all" || c.stage === stage) && (fj === "all" || c.job === fj) && m(`${c.name} ${c.id} ${c.job}`));
  const upcoming = st.candidates.filter((c) => c.offer?.status === "accepted" && !c.employeeId && (fj === "all" || c.job === fj));
  const ints = st.candidates.filter((c) => c.interview && (fj === "all" || c.job === fj) && m(`${c.name} ${c.id}`)).sort((a, b) => a.interview!.date.localeCompare(b.interview!.date));
  const upd = <span className="text-[15.5px] text-[#4d5664]">Last updated {fmt(TODAY)} (Asia/Dhaka)</span>;
  return (
    <StaffFrame tab="hiring" search={q} onSearch={setQ} activeFilters={fj !== "all" ? 1 : 0} onClearFilters={() => setFj("all")} filters={<FilterSelect label="Job" value={fj} onChange={setFj} options={st.jobs.map((j) => ({ v: j.id, label: `${j.title} · ${j.id}` }))} />} searchPlaceholder="Search jobs, candidates, ID (e.g. HK001, CAND001)" action={tab === "cands" ? <Btn kind="primary" onClick={() => setAddCand(true)}><Plus className="size-[18px]" /> Add candidate</Btn> : <Btn kind="primary" onClick={() => setJob("new")}><Plus className="size-[18px]" /> Create job</Btn>}>
      <h2 className="text-[26px] font-semibold">Hiring</h2>
      <div className="mt-3 flex flex-wrap gap-2 border-b border-[#e3e7ec] pb-2.5">
        {([["jobs", "Jobs"], ["cands", `Candidates (${st.candidates.length})`], ["int", "Interviews"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={clsx("whitespace-nowrap rounded-xl px-6 py-2 text-[16px]", tab === v ? "bg-[#ffe7e4] font-medium text-[#b11c29]" : "hover:bg-[#e9edf2]")}>{l}</button>
        ))}
      </div>
      {tab === "jobs" && (
        <div className="mt-4 space-y-5">
          <Card title={`Jobs (${st.jobs.length})`} right={upd}>
            {jobs.length === 0 ? <Empty icon={<Briefcase className="size-6" />} title="No jobs" action={<Btn kind="primary" onClick={() => setJob("new")}>Create job</Btn>} /> : (
              <Table cols={[{ label: "Job title", w: "24%" }, { label: "Job ID" }, { label: "Vacancy" }, { label: "Applicants" }, { label: "Status" }, { label: "Action", w: "200px" }]}>
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="font-semibold">{j.title}</td><td>{j.id}</td><td>{j.vacancy}</td><td>{st.candidates.filter((c) => c.job === j.id).length}</td>
                    <td><Chip tone={JOB_ST[j.status][1]}>{JOB_ST[j.status][0]}</Chip></td>
                    <td><div className="flex gap-2"><Btn onClick={() => setJob(j)}><ExternalLink className="size-4" /> Open</Btn>
                      <Menu label={`Actions for ${j.title}`} items={[
                        ...(j.status !== "published" ? [{ label: "Publish", onClick: () => update((s) => { s.jobs.find((x) => x.id === j.id)!.status = "published"; }, `Job ${j.id} published`) }] : []),
                        ...(j.status === "published" ? [{ label: "Close job", onClick: () => update((s) => { s.jobs.find((x) => x.id === j.id)!.status = "closed"; }, `Job ${j.id} closed`) }] : []),
                        { label: "View candidates", onClick: () => { setQ(j.id); setTab("cands"); } },
                      ]} /></div></td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
          <Card title={`Upcoming joining (${upcoming.length})`} right={upd}>
            {upcoming.length === 0 ? <p className="text-[15px] text-[#4d5664]">No one is joining soon.</p> : (
              <Table cols={[{ label: "Candidate", w: "20%" }, { label: "Candidate ID" }, { label: "Job ID" }, { label: "Offer status" }, { label: "Joining date" }, { label: "Employee" }, { label: "Action", w: "290px" }]}>
                {upcoming.map((c) => (
                  <tr key={c.id}>
                    <td><span className="flex items-center gap-3"><Avatar name={c.name} id={c.id} /><b className="text-[16px]">{c.name}</b></span></td>
                    <td>{c.id}</td><td>{c.job}</td><td><Chip tone="green">Offer accepted</Chip></td><td>{fmt(c.offer!.start)}</td><td><Chip tone="gray">Not yet employee</Chip></td>
                    <td><div className="flex gap-2"><Link href={`/hms/staff/hiring/${c.id}`} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d3d8df] bg-white text-[15.5px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-[18px]" /> Open</Link>
                      <Menu label={`Actions for ${c.name}`} items={[{ label: "Joining checklist", onClick: () => router.push(`/hms/staff/hiring/${c.id}`) }]} /></div></td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </div>
      )}
      {tab === "cands" && (
        <Card className="mt-4">
          <FilterChips value={stage} onChange={setStage} items={[{ v: "all", label: `All (${st.candidates.length})` }, ...[...STAGES, "rejected" as Stage].map((s) => ({ v: s, label: `${STAGE_LABEL[s][0]} (${st.candidates.filter((c) => c.stage === s).length})` }))]} />
          <div className="mt-4">
            {cands.length === 0 ? <Empty icon={<UserPlus className="size-6" />} title="No candidates" /> : (
              <Table cols={[{ label: "Candidate", w: "24%" }, { label: "Job" }, { label: "Applied" }, { label: "Stage" }, { label: "Next step" }, { label: "", w: "120px" }]}>
                {cands.map((c) => (
                  <tr key={c.id}>
                    <td><Person name={c.name} id={c.id} /></td>
                    <td>{st.jobs.find((j) => j.id === c.job)?.title ?? c.job}<span className="block text-[13.5px] text-[#4d5664]">{c.job}</span></td>
                    <td>{fmt(c.applied)}</td>
                    <td><Chip tone={STAGE_LABEL[c.stage][1]}>{STAGE_LABEL[c.stage][0]}</Chip></td>
                    <td className="text-[14.5px] text-[#4d5664]">{nextStep(c)}</td>
                    <td><Link href={`/hms/staff/hiring/${c.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-4 text-[14.5px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-4" /> Open</Link></td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </Card>
      )}
      {tab === "int" && (
        <Card className="mt-4" title="Interviews">
          {ints.length === 0 ? <Empty icon={<CalendarDays className="size-6" />} title="No interviews scheduled" /> : (
            <Table cols={[{ label: "Candidate", w: "26%" }, { label: "Date & time" }, { label: "With" }, { label: "Result" }, { label: "", w: "120px" }]}>
              {ints.map((c) => (
                <tr key={c.id}>
                  <td><Person name={c.name} id={c.id} /></td>
                  <td>{fmt(c.interview!.date)}, {c.interview!.time}{c.interview!.date === TODAY && <Chip tone="blue" className="ml-2">Today</Chip>}</td>
                  <td>{c.interview!.with}</td>
                  <td>{c.interview!.result ? <Chip tone={c.interview!.result === "pass" ? "green" : "red"}>{c.interview!.result === "pass" ? "Passed" : "Not selected"}</Chip> : <Chip tone="amber">Upcoming</Chip>}</td>
                  <td><Link href={`/hms/staff/hiring/${c.id}?t=interview`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-4 text-[14.5px] font-medium hover:bg-[#f4f6f8]"><ExternalLink className="size-4" /> Open</Link></td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      )}
      {job && <JobDrawer job={job === "new" ? null : job} onClose={() => setJob(null)} onSaved={(t) => toast(t)} />}
      {addCand && <AddCandidate onClose={() => setAddCand(false)} />}
    </StaffFrame>
  );
}

function nextStep(c: Candidate) {
  if (c.stage === "applied") return "Shortlist or reject";
  if (c.stage === "shortlisted") return "Schedule interview";
  if (c.stage === "interview") return c.interview?.result ? "Record result" : `Interview ${fmt(c.interview!.date)}`;
  if (c.stage === "offer") return c.offer?.status === "sent" ? "Waiting for answer" : "Send offer";
  if (c.stage === "joining") return c.employeeId ? `Joined as ${c.employeeId}` : "Joining checklist";
  return "—";
}

function JobDrawer({ job, onClose, onSaved }: { job: Job | null; onClose: () => void; onSaved: (t: string) => void }) {
  const { st, update } = useHrm();
  const [f, setF] = useState({ title: job?.title ?? "", dept: job?.dept ?? ("Housekeeping" as Dept), vacancy: job?.vacancy ?? 1, salary: job?.salary ?? "", status: job?.status ?? ("draft" as Job["status"]) });
  const prefix: Record<Dept, string> = { Housekeeping: "HK", "Front Office": "FO", Kitchen: "KT", Maintenance: "MT", Security: "SC", Finance: "FN", Management: "MG" };
  const newId = () => { const p = prefix[f.dept]; const n = st.jobs.filter((j) => j.id.startsWith(p)).length + 1; return `${p}${String(n).padStart(3, "0")}`; };
  const save = (status: Job["status"]) => {
    update((s) => {
      if (job) Object.assign(s.jobs.find((x) => x.id === job.id)!, { ...f, title: f.title.trim(), status });
      else s.jobs.unshift({ id: newId(), title: f.title.trim(), dept: f.dept, vacancy: f.vacancy, salary: f.salary.trim(), status, created: TODAY });
    }, job ? `Job ${job.id} updated` : `Job created: ${f.title} (${status})`);
    onSaved(status === "published" ? "Job published" : "Job saved as draft");
    onClose();
  };
  const ok = f.title.trim().length > 1 && f.vacancy > 0;
  return (
    <Drawer title={job ? `${job.title} · ${job.id}` : "Create job"} onClose={onClose} footer={<><Btn onClick={() => save(job?.status === "closed" ? "closed" : "draft")} disabled={!ok}>Save {job?.status === "closed" ? "" : "draft"}</Btn><Btn kind="primary" disabled={!ok} onClick={() => save("published")}>{job?.status === "published" ? "Save" : "Publish"}</Btn></>}>
      <Field label="Job title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Room Attendant" /></Field>
      <Field label="Department"><Select value={f.dept} disabled={!!job} onChange={(e) => setF({ ...f, dept: e.target.value as Dept })}>{st.settings.departments.map((d) => <option key={d}>{d}</option>)}</Select></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vacancy"><Input type="number" min={1} value={f.vacancy} onChange={(e) => setF({ ...f, vacancy: Math.max(1, Number(e.target.value) || 1) })} /></Field>
        <Field label="Salary range"><Input value={f.salary} onChange={(e) => setF({ ...f, salary: e.target.value })} placeholder="BDT 18,000–20,000" /></Field>
      </div>
      {job && <p className="text-[14.5px] text-[#4d5664]">{st.candidates.filter((c) => c.job === job.id).length} applicants · created {fmt(job.created)}</p>}
      <p className="text-[13.5px] text-[#4d5664]">Published jobs are listed for your team. Posting to job sites or the hotel website is not connected yet.</p>
    </Drawer>
  );
}

function AddCandidate({ onClose }: { onClose: () => void }) {
  const { st, update } = useHrm();
  const open = st.jobs.filter((j) => j.status !== "closed");
  const [f, setF] = useState({ name: "", job: open[0]?.id ?? "", phone: "", email: "" });
  const phoneOk = /^01\d{9}$/.test(f.phone.replace(/[-\s]/g, ""));
  return (
    <Drawer title="Add candidate" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!f.name.trim() || !f.job || !phoneOk} onClick={() => { update((s) => { const id = `CAND${String(s.candidates.length + 1).padStart(3, "0")}`; s.candidates.push({ id, name: f.name.trim(), job: f.job, phone: f.phone, email: f.email, stage: "applied", applied: TODAY, checklist: { identity: false, documents: false, confirmed: false }, history: [{ date: TODAY, text: "Added by Hotel Admin." }] }); }, `Candidate added: ${f.name}`); onClose(); }}>Add candidate</Btn></>}>
      <Field label="Full name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Job"><Select value={f.job} onChange={(e) => setF({ ...f, job: e.target.value })}>{open.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.id}</option>)}</Select></Field>
      <Field label="Mobile" hint="11 digits, starts with 01"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="01XXXXXXXXX" /></Field>
      {f.phone && !phoneOk && <p className="text-[14px] text-[#b11c29]">Enter a valid Bangladesh mobile number.</p>}
      <Field label="Email (optional)"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
    </Drawer>
  );
}

/* ================= HRM-12 Candidate workspace ================= */
type CTab = "profile" | "interview" | "offer" | "joining";
export function CandidatePage({ id }: { id: string }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const c = st.candidates.find((x) => x.id === id);
  const qt = useQuery("t");
  const [tabState, setTab] = useState<CTab | null>(null);
  const tab: CTab = tabState ?? (qt === "interview" || qt === "offer" || qt === "profile" || qt === "joining" ? qt : c?.stage === "joining" ? "joining" : c?.stage === "offer" ? "offer" : c?.stage === "interview" || c?.stage === "shortlisted" ? "interview" : "profile");
  if (!c) return <StaffFrame tab="hiring" hideSearch><Card><Empty icon={<UserPlus className="size-6" />} title="Candidate not found" action={<Link href="/hms/staff/hiring" className="font-medium text-[#b11c29]">Back to Hiring</Link>} /></Card></StaffFrame>;
  const job = st.jobs.find((j) => j.id === c.job);
  const si = c.stage === "rejected" ? -1 : STAGES.indexOf(c.stage);
  const ready = c.checklist.identity && c.checklist.documents && !c.employeeId;
  const dateOk = !!c.offer && c.offer.start <= TODAY;
  const canConfirm = c.stage === "joining" && ready && dateOk;
  const confirm = () => { let newId: string | null = null; update((s) => { newId = confirmJoining(s, c.id); }, `${c.name} joined — added to staff`); toast(`${c.name} added to staff${newId ? ` as ${newId}` : ""}`); };
  const ol = offerLabel(c);
  return (
    <StaffFrame tab="hiring" hideSearch action={c.employeeId ? <Link href={`/hms/staff/people/${c.employeeId}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#b11c29] px-5 text-[15.5px] font-medium text-white hover:bg-[#8e1621]">Open employee {c.employeeId}</Link> : <Btn kind="primary" disabled={!canConfirm} onClick={confirm} className={clsx(!canConfirm && "!bg-[#e3e7ec] !text-[#8a8f9c]")}>Confirm joining</Btn>}>
      <Link href="/hms/staff/hiring" className="inline-flex h-11 items-center gap-3 rounded-xl border border-[#d3d8df] bg-white px-5 text-[16px] hover:bg-[#f4f6f8]"><ArrowLeft className="size-5" /> Back to Hiring</Link>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={c.name} id={c.id} size={52} />
          <div className="flex-1"><p className="text-[21px] font-semibold">{c.name}</p><p className="text-[15.5px] text-[#4d5664]">{c.id} <span className="mx-2 text-[#c7cad2]">|</span> {job?.title} <span className="mx-2 text-[#c7cad2]">|</span> {c.job}</p></div>
          {c.stage === "rejected" ? <Chip tone="red">Rejected</Chip> : <Chip tone={ol[1]}>{ol[0]}</Chip>}
          {c.offer && <><span className="hidden h-12 w-px bg-[#e3e7ec] md:block" /><span className="flex items-center gap-3 text-[16px]"><CalendarDays className="size-6" /><span>Joining {fmt(c.offer.start)}<span className="block">(today {fmt(TODAY).slice(0, 6)})</span></span></span></>}
        </div>
        <ol className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#e3e7ec] pt-4">
          {STAGES.map((s, i) => {
            const done = c.employeeId ? true : i < si;
            const cur = i === si && !c.employeeId;
            return (
              <li key={s} className="flex flex-1 items-center gap-3">
                <span className={clsx("grid size-7 shrink-0 place-items-center rounded-full", done ? "bg-[#2fa45a] text-white" : cur ? "border-2 border-[#b11c29]" : "border-2 border-[#d3d8df]")}>{done && <Check className="size-4" />}</span>
                <span className={clsx("text-[16.5px]", cur && "font-medium text-[#b11c29]")}>{STAGE_LABEL[s][0]}</span>
                {i < STAGES.length - 1 && <span className={clsx("h-0.5 flex-1", done ? "bg-[#9fd7b2]" : "bg-[#e3e7ec]")} />}
              </li>
            );
          })}
        </ol>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["profile", "interview", "offer", "joining"] as CTab[]).map((t) => <button key={t} onClick={() => setTab(t)} className={clsx("whitespace-nowrap rounded-xl px-6 py-2.5 text-[16.5px] ", tab === t ? "bg-[#ffe7e4] font-medium text-[#b11c29]" : "hover:bg-[#e9edf2]")}>{t[0].toUpperCase() + t.slice(1)}</button>)}
      </div>
      <div className="mt-3 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div>
          {tab === "profile" && <ProfileC c={c} />}
          {tab === "interview" && <InterviewC c={c} />}
          {tab === "offer" && <OfferC c={c} />}
          {tab === "joining" && (
            <Card title="Joining checklist">
              {c.stage !== "joining" ? <p className="text-[15px] text-[#4d5664]">Opens after the candidate accepts the offer.</p> : (
                <>
                  <ul className="divide-y divide-[#e3e7ec] border-t border-[#e3e7ec]">
                    <Check1 done label="Offer accepted" sub="Candidate has accepted the offer." />
                    <Check1 done={c.checklist.identity} label="Identity match" sub="Verify identity with a valid government ID." onToggle={c.employeeId ? undefined : () => stamp({ update }, c.id, (x) => { x.checklist.identity = !x.checklist.identity; }, c.checklist.identity ? "Identity check undone." : "Identity verified.", `${c.name}: identity ${c.checklist.identity ? "unchecked" : "verified"}`)} />
                    <Check1 done={c.checklist.documents} label="Documents" sub="Collect required joining documents (e.g., ID copy, photo, etc.)." onToggle={c.employeeId ? undefined : () => stamp({ update }, c.id, (x) => { x.checklist.documents = !x.checklist.documents; }, c.checklist.documents ? "Documents unmarked." : "Joining documents collected.", `${c.name}: documents ${c.checklist.documents ? "unmarked" : "collected"}`)} />
                    <Check1 done={c.checklist.confirmed} label="Joining confirmation" sub="Confirm actual joining on the scheduled date." />
                  </ul>
                  <p className="mt-4 flex items-center gap-3 text-[15.5px] text-[#4d5664]"><Info className="size-5" />
                    {c.employeeId ? `Joined. Now staff member ${c.employeeId}.` : !ready ? "Complete identity check and confirm actual joining first." : !dateOk ? `Joining date is ${fmt(c.offer!.start)}. Confirm on the day the person starts (or change the date in Offer).` : "Ready — use Confirm joining at the top."}
                  </p>
                </>
              )}
            </Card>
          )}
        </div>
        <div className="space-y-3">
          <Card title="Offer details">
            {c.offer ? <div className="space-y-1.5 text-[16px]"><p className="flex items-center gap-3"><Wallet className="size-5" /><span className="w-24">Salary</span>BDT{money(c.offer.salary)} / month</p><p className="flex items-center gap-3"><CalendarDays className="size-5" /><span className="w-24">Start date</span>{fmt(c.offer.start)}</p></div> : <p className="text-[15px] text-[#4d5664]">No offer yet.</p>}
          </Card>
          <Card>
            <div className="flex items-start gap-3"><UserPlus className="mt-0.5 size-6" /><div className="flex-1"><p className="text-[18px] font-semibold">Account invitation</p><p className="text-[15px] text-[#4d5664]">{c.employeeId ? "Sent to the staff app." : "Will be sent after joining is confirmed."}</p></div><Chip tone={c.employeeId ? "green" : "amber"}>{c.employeeId ? "Sent" : "Pending"}</Chip></div>
          </Card>
          <div className="flex items-start gap-3 rounded-2xl border border-[#e3e7ec] bg-[#f4f6f8] p-5"><Info className="mt-0.5 size-5" /><div>{c.employeeId ? <><p className="text-[16.5px] font-semibold">Employee {c.employeeId}</p><Link href={`/hms/staff/people/${c.employeeId}`} className="text-[15px] font-medium text-[#b11c29]">Open profile</Link></> : <><p className="text-[16.5px] font-semibold">Not an employee yet.</p><p className="text-[15px] text-[#4d5664]">The candidate will be added to staff after joining is confirmed.</p></>}</div></div>
          <Card>
            <p className="flex items-center gap-3 text-[18px] font-semibold"><History className="size-5" /> History</p>
            <ul className="mt-2 space-y-1.5 pl-9">{c.history.map((h, i) => <li key={i} className="grid grid-cols-[110px_1fr] gap-3 text-[15px]"><span>{fmt(h.date)}</span><span>{h.text}</span></li>)}</ul>
          </Card>
        </div>
      </div>
    </StaffFrame>
  );
}

function Check1({ done, label, sub, onToggle }: { done: boolean; label: string; sub: string; onToggle?: () => void }) {
  const box = <span className={clsx("grid size-7 shrink-0 place-items-center rounded-full", done ? "bg-[#2fa45a] text-white" : "border-2 border-[#c7cad2]")}>{done && <Check className="size-4" />}</span>;
  return (
    <li className="flex items-center gap-4 py-3">
      {onToggle ? <button onClick={onToggle} aria-pressed={done} aria-label={label}>{box}</button> : box}
      <div className="flex-1"><p className="text-[16px] font-semibold">{label}</p><p className="text-[14.5px] text-[#4d5664]">{sub}</p></div>
      <Chip tone={done ? "green" : "amber"}>{done ? "Complete" : "Pending"}</Chip>
    </li>
  );
}

function ProfileC({ c }: { c: Candidate }) {
  const { update } = useHrm();
  return (
    <Card title="Profile">
      <dl className="divide-y divide-[#e3e7ec] text-[15.5px]">{[["Mobile", c.phone], ["Email", c.email || "—"], ["Applied", fmt(c.applied)], ["Stage", STAGE_LABEL[c.stage][0]]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-[#4d5664]">{k}</dt><dd>{v}</dd></div>)}</dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {c.stage === "applied" && <Btn kind="primary" onClick={() => stamp({ update }, c.id, (x) => { x.stage = "shortlisted"; }, "Shortlisted.", `${c.name} shortlisted`)}>Shortlist</Btn>}
        {c.stage !== "rejected" && !c.employeeId && <Btn kind="danger" onClick={() => stamp({ update }, c.id, (x) => { x.stage = "rejected"; }, "Not selected.", `${c.name} rejected`)}>Reject</Btn>}
        {c.stage === "rejected" && <Btn onClick={() => stamp({ update }, c.id, (x) => { x.stage = "applied"; }, "Moved back to Applied.", `${c.name} reopened`)}>Reopen</Btn>}
      </div>
    </Card>
  );
}

function InterviewC({ c }: { c: Candidate }) {
  const { update } = useHrm();
  const [f, setF] = useState({ date: c.interview?.date ?? addDays(TODAY, 2), time: c.interview?.time ?? "11:00", with: c.interview?.with ?? "Hotel Manager" });
  if (c.stage === "applied") return <Card title="Interview"><p className="text-[15px] text-[#4d5664]">Shortlist the candidate first.</p></Card>;
  const canEdit = c.stage === "shortlisted" || (c.stage === "interview" && !c.interview?.result);
  return (
    <Card title="Interview">
      {c.interview && <p className="mb-3 text-[16px]">{fmt(c.interview.date)}, {c.interview.time} · with {c.interview.with} {c.interview.result && <Chip tone={c.interview.result === "pass" ? "green" : "red"} className="ml-2">{c.interview.result === "pass" ? "Passed" : "Not selected"}</Chip>}</p>}
      {canEdit && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Time"><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
          <Field label="With"><Input value={f.with} onChange={(e) => setF({ ...f, with: e.target.value })} /></Field>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {canEdit && <Btn kind={c.interview ? "outline" : "primary"} disabled={!f.date || !f.time} onClick={() => stamp({ update }, c.id, (x) => { x.interview = { ...f }; x.stage = "interview"; }, `Interview ${c.interview ? "moved" : "scheduled"} for ${fmt(f.date).slice(0, 6)}, ${f.time}.`, `Interview ${c.interview ? "rescheduled" : "scheduled"} for ${c.name}`)}>{c.interview ? "Reschedule" : "Schedule interview"}</Btn>}
        {c.stage === "interview" && !c.interview?.result && <>
          <Btn kind="primary" onClick={() => stamp({ update }, c.id, (x) => { x.interview!.result = "pass"; x.stage = "offer"; }, "Interview passed.", `${c.name} passed the interview`)}>Passed → make offer</Btn>
          <Btn kind="danger" onClick={() => stamp({ update }, c.id, (x) => { x.interview!.result = "fail"; x.stage = "rejected"; }, "Not selected after interview.", `${c.name} not selected`)}>Not selected</Btn>
        </>}
      </div>
    </Card>
  );
}

function OfferC({ c }: { c: Candidate }) {
  const { update } = useHrm();
  const [f, setF] = useState({ salary: c.offer?.salary ?? 18000, start: c.offer?.start ?? addDays(TODAY, 7) });
  const [note, setNote] = useState("");
  if (!["offer", "joining"].includes(c.stage)) return <Card title="Offer"><p className="text-[15px] text-[#4d5664]">Available after the interview is passed.</p></Card>;
  const locked = !!c.employeeId;
  return (
    <Card title="Offer">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Salary (BDT / month)"><Input type="number" min={1} disabled={locked || c.offer?.status === "accepted"} value={f.salary} onChange={(e) => setF({ ...f, salary: Math.max(0, Number(e.target.value) || 0) })} /></Field>
        <Field label="Start date"><Input type="date" disabled={locked} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field>
      </div>
      {!locked && <Field label="Message (optional)"><Area value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shared with the candidate by phone/SMS — sending is not connected yet." /></Field>}
      <div className="mt-4 flex flex-wrap gap-2">
        {!locked && !c.offer && <Btn kind="primary" disabled={f.salary <= 0} onClick={() => stamp({ update }, c.id, (x) => { x.offer = { ...f, status: "sent" }; }, `Offer sent (${money(f.salary)} / month, start ${fmt(f.start)}).`, `Offer sent to ${c.name}`)}>Send offer</Btn>}
        {!locked && c.offer?.status === "sent" && <>
          <Btn kind="primary" onClick={() => stamp({ update }, c.id, (x) => { x.offer!.status = "accepted"; x.stage = "joining"; }, "Offer accepted by candidate.", `${c.name} accepted the offer`)}>Mark accepted</Btn>
          <Btn kind="danger" onClick={() => stamp({ update }, c.id, (x) => { x.offer!.status = "declined"; x.stage = "rejected"; }, "Offer declined.", `${c.name} declined the offer`)}>Mark declined</Btn>
        </>}
        {!locked && c.offer && f.start !== c.offer.start && <Btn onClick={() => stamp({ update }, c.id, (x) => { x.offer!.start = f.start; }, `Joining date changed to ${fmt(f.start)}.`, `${c.name}: joining date ${fmt(f.start)}`)}>Save new start date</Btn>}
      </div>
    </Card>
  );
}
