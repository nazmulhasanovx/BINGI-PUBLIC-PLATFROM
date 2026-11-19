"use client";
import clsx from "clsx";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Info, Layers, Pencil, UserPlus } from "lucide-react";
import { SHIFT_TIME, addDays, dayName, emp, fmt, fmtShort, useHrm, weekDays, type Shift } from "@/lib/hrm/store";
import { FilterSelect, StaffFrame, useToast } from "./Frame";
import { Btn, Card, Chip, Drawer, Empty, Field, Person, Select } from "./ui";

const TONE: Record<Shift, string> = { Morning: "bg-[#eef3fb]", Evening: "bg-[#fdf1e3]", Night: "bg-[#efeafb]", Off: "bg-[#e9edf2]", Leave: "bg-[#ffe7e4] text-[#b11c29]" };
const EDITABLE: Shift[] = ["Morning", "Evening", "Night", "Off"];

export function SchedulePage() {
  const { st, update } = useHrm();
  const toast = useToast();
  const [week, setWeek] = useState(st.roster.week);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<{ emp: string; date: string } | null>(null);
  const [tpl, setTpl] = useState(false);
  const [assign, setAssign] = useState<number | null>(null);
  const days = weekDays(week);
  const [fd, setFd] = useState("all");
  const staff = st.employees.filter((e) => e.status === "active" && (fd === "all" || e.dept === fd) && (!q || `${e.name} ${e.id} ${e.dept}`.toLowerCase().includes(q.toLowerCase())));
  const hasWeek = staff.some((e) => days.some((d) => st.roster.cells[e.id]?.[d]));
  const isCurrent = week === st.roster.week;
  const status = isCurrent ? st.roster.status : "draft";
  const gaps = st.roster.openShifts.map((o, i) => ({ ...o, i })).filter((o) => days.includes(o.date));
  const label = `${days[0].slice(8)} – ${fmt(days[6])}`;
  const publish = () => {
    if (!hasWeek) return toast("Nothing to publish — add shifts first");
    update((s) => { s.roster.week = week; s.roster.status = "published"; }, `Roster published for ${label}${gaps.length ? ` (${gaps.length} open shift${gaps.length > 1 ? "s" : ""})` : ""}`);
    toast(gaps.length ? `Published · ${gaps.length} shift still unassigned` : "Roster published · staff can see it");
  };
  const copyPrev = () => {
    update((s) => {
      for (const e of s.employees.filter((x) => x.status === "active")) {
        const row = (s.roster.cells[e.id] ??= {});
        for (const d of days) { const prev = row[addDays(d, -7)]; row[d] = prev === "Leave" || !prev ? "Morning" : prev; }
      }
      s.roster.week = week; s.roster.status = "draft";
    }, `Roster for ${label} copied from previous week`);
    toast("Copied from previous week · Draft");
  };
  return (
    <StaffFrame tab="schedule" search={q} onSearch={setQ} activeFilters={fd !== "all" ? 1 : 0} onClearFilters={() => setFd("all")} filters={<FilterSelect label="Department" value={fd} onChange={setFd} options={st.settings.departments.map((d) => ({ v: d, label: d }))} />} action={<Btn kind="primary" onClick={publish} disabled={status === "published" && isCurrent}>{status === "published" && isCurrent ? "Published" : "Publish roster"}</Btn>}
      right={
        <div className="flex h-11 items-center gap-1 rounded-xl border border-[#d3d8df] bg-white px-1.5 text-[16px] font-medium">
          <button onClick={() => setWeek(addDays(week, -7))} aria-label="Previous week" className="grid size-8 place-items-center rounded-lg hover:bg-[#e9edf2]"><ChevronLeft className="size-4" /></button>
          <span className="min-w-[170px] px-2 text-center">{label}</span>
          <button onClick={() => setWeek(addDays(week, 7))} aria-label="Next week" className="grid size-8 place-items-center rounded-lg hover:bg-[#e9edf2]"><ChevronRight className="size-4" /></button>
        </div>
      }>
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <span className={clsx("rounded-xl px-4 py-2 text-[16px] font-medium", status === "published" ? "bg-[#e3f5e8] text-[#1f8f4a]" : "bg-[#fdeee3] text-[#b11c29]")}>{status === "published" ? "Published" : "Draft"}</span>
          <span className="hidden h-8 w-px bg-[#e3e7ec] sm:block" />
          <div className="order-last flex w-full min-w-0 items-center gap-3 rounded-xl bg-[#e9edf2] px-4 py-2.5 text-[15px] text-[#4d5664] sm:order-none sm:w-auto sm:flex-1">
            <Info className="size-5 shrink-0" />
            {gaps.length ? (
              <span className="flex-1">Coverage gap: {gaps.length} shift{gaps.length > 1 ? "s are" : " is"} unassigned on {gaps.map((g) => `${dayName(g.date)} ${fmt(g.date)} (${g.shift})`).join(", ")}.</span>
            ) : <span className="flex-1">No coverage gaps this week.</span>}
            {gaps.length > 0 && <button onClick={() => setAssign(gaps[0].i)} className="flex shrink-0 items-center gap-1.5 font-medium text-[#b11c29]"><UserPlus className="size-4" /> Assign</button>}
          </div>
          <Btn onClick={() => setTpl(true)}><Layers className="size-[18px]" /> Shift templates</Btn>
        </div>

        {!hasWeek ? (
          <Empty icon={<Copy className="size-6" />} title={`No roster for ${label}`} text="Start from last week's pattern, then adjust shifts." action={<Btn kind="primary" onClick={copyPrev}>Copy previous week</Btn>} />
        ) : (
          <div className="mt-5 overflow-x-auto rounded-xl border border-[#e3e7ec]">
            <table className="w-full min-w-[960px] border-collapse text-[15px]">
              <thead>
                <tr className="bg-[#f4f6f8]">
                  <th className="w-[190px] px-3 py-3 text-left text-[16px] font-semibold">Employee</th>
                  {days.map((d) => <th key={d} className="border-l border-[#e3e7ec] px-2 py-2.5 text-center font-normal"><span className="block text-[16px] font-semibold">{dayName(d)}</span><span className="text-[#4d5664]">{fmt(d)}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {staff.map((e) => (
                  <tr key={e.id} className="border-t border-[#e3e7ec]">
                    <td className="px-3 py-3"><Person name={e.name} id={e.id} /></td>
                    {days.map((d) => {
                      const s = st.roster.cells[e.id]?.[d];
                      return (
                        <td key={d} className="border-l border-[#e3e7ec] px-1.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className={clsx("flex h-[50px] min-w-0 flex-1 flex-col justify-center rounded-xl px-2.5 leading-tight", s ? TONE[s] : "border border-dashed border-[#d3d8df]")}>
                              <span className="text-[15px]">{s ?? "—"}</span>
                              {s && SHIFT_TIME[s] && <span className="text-[14.5px] text-[#4d5664]">{SHIFT_TIME[s]}</span>}
                            </div>
                            <button onClick={() => setEdit({ emp: e.id, date: d })} aria-label={`Edit ${e.name} ${fmtShort(d)}`} className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#d3d8df] bg-white hover:bg-[#f4f6f8]"><Pencil className="size-3.5" /></button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {edit && <EditShift {...edit} onClose={() => setEdit(null)} />}
      {assign !== null && <AssignOpen i={assign} onClose={() => setAssign(null)} />}
      {tpl && (
        <Drawer title="Shift templates" onClose={() => setTpl(false)} footer={<><Btn onClick={() => setTpl(false)}>Close</Btn><Btn kind="primary" onClick={() => { copyPrev(); setTpl(false); }}>Copy previous week</Btn></>}>
          <p className="text-[15px] text-[#4d5664]">Default shift times (Asia/Dhaka).</p>
          <ul className="divide-y divide-[#e3e7ec] rounded-xl border border-[#e3e7ec]">
            {(["Morning", "Evening", "Night"] as Shift[]).map((s) => <li key={s} className="flex items-center gap-3 px-4 py-3"><span className={clsx("size-4 rounded", TONE[s])} /><span className="flex-1 text-[15.5px] font-medium">{s}</span><span className="text-[15px] text-[#4d5664]">{SHIFT_TIME[s]}</span></li>)}
            <li className="flex items-center gap-3 px-4 py-3"><span className={clsx("size-4 rounded", TONE.Off)} /><span className="flex-1 text-[15.5px] font-medium">Off</span><span className="text-[15px] text-[#4d5664]">Weekly day off</span></li>
          </ul>
        </Drawer>
      )}
    </StaffFrame>
  );
}

function EditShift({ emp: id, date, onClose }: { emp: string; date: string; onClose: () => void }) {
  const { st, update } = useHrm();
  const e = emp(st, id)!;
  const cur = st.roster.cells[id]?.[date];
  const pick = (s: Shift) => { update((x) => { (x.roster.cells[id] ??= {})[date] = s; x.roster.status = "draft"; }, `${e.name}: ${fmt(date)} set to ${s}`); onClose(); };
  return (
    <Drawer title="Edit shift" onClose={onClose}>
      <Person name={e.name} id={e.id} sub={`${dayName(date)} ${fmt(date)}`} />
      {cur === "Leave" ? (
        <p className="rounded-xl bg-[#ffe7e4] px-4 py-3 text-[15px] text-[#9b2c24]">On approved leave this day. Change it from the Leave page.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {EDITABLE.map((s) => (
            <button key={s} onClick={() => pick(s)} className={clsx("rounded-xl border-2 px-4 py-3 text-left", cur === s ? "border-[#b11c29]" : "border-transparent", TONE[s])}>
              <span className="block text-[16px] font-medium">{s}</span>
              <span className="text-[14px] text-[#4d5664]">{SHIFT_TIME[s] || "Day off"}</span>
            </button>
          ))}
        </div>
      )}
    </Drawer>
  );
}

function AssignOpen({ i, onClose }: { i: number; onClose: () => void }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const o = st.roster.openShifts[i];
  const free = st.employees.filter((e) => e.status === "active" && e.dept === o.dept && st.roster.cells[e.id]?.[o.date] === "Off");
  const others = st.employees.filter((e) => e.status === "active" && e.dept === o.dept && !free.includes(e));
  const [who, setWho] = useState(free[0]?.id ?? others[0]?.id ?? "");
  return (
    <Drawer title="Assign open shift" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!who} onClick={() => { update((s) => { (s.roster.cells[who] ??= {})[o.date] = o.shift; s.roster.openShifts.splice(i, 1); s.roster.status = "draft"; }, `${emp(st, who)?.name} assigned ${o.shift} on ${fmt(o.date)}`); toast("Shift assigned"); onClose(); }}>Assign</Btn></>}>
      <div className="flex items-center gap-3"><Chip tone="amber">{o.shift}</Chip><span className="text-[15.5px]">{dayName(o.date)} {fmt(o.date)} · {o.dept}</span></div>
      <Field label="Staff" hint={free.length ? "Staff who are off that day are listed first." : undefined}>
        <Select value={who} onChange={(e) => setWho(e.target.value)}>
          {free.length > 0 && <optgroup label="Off that day">{free.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.id}</option>)}</optgroup>}
          <optgroup label={`Other ${o.dept} staff (shift will be replaced)`}>{others.map((e) => <option key={e.id} value={e.id}>{e.name} · {st.roster.cells[e.id]?.[o.date] ?? "—"}</option>)}</optgroup>
        </Select>
      </Field>
    </Drawer>
  );
}
