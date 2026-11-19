"use client";
// HRM Easy mode — for small properties: one screen with the team, add / edit a person, call them.
// Uses the same HRM store as Full mode, so anything added here shows up in attendance, roster and payroll.
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { MoreHorizontal, Pencil, Phone, Plus, Search, UserMinus, UserRound, Users } from "lucide-react";
import { TODAY, fmt, useHrm, type Dept, type Employee } from "@/lib/hrm/store";
import { addEmployee } from "@/lib/hrm/actions";
import { useHrmMode, type HrmMode } from "@/lib/hrm/mode";
import { useProperty } from "../property";
import { useToast } from "./Frame";
import { Avatar, Btn, Chip, Drawer, Field, Input, Select } from "./ui";

/** Easy / Full switch shown at the top of Team & HR in both modes. */
export function ModeSwitch({ className }: { className?: string }) {
  const { mode, setMode } = useHrmMode();
  return (
    <div role="radiogroup" aria-label="Team & HR view" className={clsx("inline-flex h-10 rounded-xl border border-[#d3d8df] bg-white p-1", className)}>
      {([["easy", "Easy"], ["full", "Full HR"]] as [HrmMode, string][]).map(([m, l]) => (
        <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={clsx("whitespace-nowrap rounded-lg px-3 text-[14px] sm:px-3.5 font-semibold transition-colors", mode === m ? "bg-[#0f1720] text-white" : "text-[#4d5664] hover:text-[#0f1720]")}>{l}</button>
      ))}
    </div>
  );
}

const ROLES: Record<Dept, string[]> = {
  "Front Office": ["Receptionist", "Front Office Manager", "Night Auditor"],
  Housekeeping: ["Room Attendant", "Housekeeping Supervisor", "Laundry"],
  Kitchen: ["Cook", "Chef", "Kitchen Helper", "Waiter"],
  Maintenance: ["Technician", "Electrician", "Gardener"],
  Security: ["Security Guard", "Driver"],
  Finance: ["Accountant", "Cashier"],
  Management: ["Manager", "Owner", "Assistant Manager"],
};
const phoneOk = (p: string) => /^01\d{9}$/.test(p.replace(/\D/g, ""));
const tel = (p: string) => `tel:+88${p.replace(/\D/g, "")}`;

export function EasyTeam() {
  const hotel = useProperty();
  const { st } = useHrm();
  const [q, setQ] = useState("");
  const [show, setShow] = useState<"active" | "inactive">("active");
  const [edit, setEdit] = useState<Employee | "new" | null>(null);
  const team = st.employees.filter((e) => e.status !== "former");
  const list = team
    .filter((e) => (show === "active" ? e.status === "active" : e.status === "inactive"))
    .filter((e) => !q || `${e.name} ${e.position} ${e.dept} ${e.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  const inactive = team.filter((e) => e.status === "inactive").length;
  const depts = new Set(team.filter((e) => e.status === "active").map((e) => e.dept)).size;

  return (
    <div className="h-full overflow-y-auto bg-[#f4f6f8]">
      <div className="hms-page">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-[-0.01em]">Team</h1>
            <p className="mt-0.5 text-[16px] text-[#4d5664]">{hotel.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <ModeSwitch />
            <Btn kind="primary" onClick={() => setEdit("new")}><Plus className="size-[18px]" /> Add team member</Btn>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[["People", team.filter((e) => e.status === "active").length], ["Departments", depts], ["Not working now", inactive]].map(([l, n]) => (
            <div key={l as string} className="rounded-2xl border border-[#e3e7ec] bg-white p-4"><p className="text-[13.5px] text-[#4d5664] sm:text-[14.5px]">{l}</p><p className="mt-0.5 text-[24px] font-bold leading-tight">{n}</p></div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#d3d8df] bg-white px-3.5 sm:max-w-[380px]">
            <Search className="size-[18px] shrink-0 text-[#4d5664]" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, role or phone" aria-label="Search team" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#7b8190]" />
          </label>
          <div role="tablist" aria-label="Show" className="flex gap-1 rounded-xl bg-[#e9edf2] p-1">
            {([["active", "Working"], ["inactive", `Not working${inactive ? ` (${inactive})` : ""}`]] as const).map(([v, l]) => (
              <button key={v} role="tab" aria-selected={show === v} onClick={() => setShow(v)} className={clsx("h-9 rounded-lg px-3.5 text-[14px] font-semibold", show === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#d3d8df] bg-white px-6 py-14 text-center">
            <Users className="mx-auto size-9 text-[#8a8f9c]" aria-hidden />
            <p className="mt-3 text-[17px] font-semibold">{q ? "No one matches that search" : show === "active" ? "No team members yet" : "Everyone is working"}</p>
            <p className="mt-1 text-[14.5px] text-[#4d5664]">{q ? "Try a different name or phone number." : show === "active" ? "Add the people who work at your property — it takes a minute each." : "People you mark as not working will show here."}</p>
            {!q && show === "active" && <Btn kind="primary" className="mt-5" onClick={() => setEdit("new")}><Plus className="size-[18px]" /> Add team member</Btn>}
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-[#e3e7ec] overflow-hidden rounded-2xl border border-[#e3e7ec] bg-white">
            {list.map((e) => <Row key={e.id} e={e} onEdit={() => setEdit(e)} />)}
          </ul>
        )}

        <p className="mt-6 text-[14px] text-[#4d5664]">
          Need attendance, shifts, leave or payroll? Switch to <b>Full HR</b> at the top — your team stays the same.
        </p>
      </div>
      {edit && <MemberForm initial={edit === "new" ? undefined : edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function Row({ e, onEdit }: { e: Employee; onEdit: () => void }) {
  const { update } = useHrm();
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const setStatus = (status: Employee["status"], msg: string) => { update((s) => { const x = s.employees.find((y) => y.id === e.id); if (x) x.status = status; }, msg); toast(msg); setMenu(false); };
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 sm:gap-4">
      <Avatar name={e.name} id={e.id} />
      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[15.5px] font-semibold">{e.name}</span>
        <span className="block truncate text-[14px] text-[#4d5664]">{e.position} · {e.dept}</span>
      </button>
      <span className="hidden w-[120px] text-[14px] tabular-nums text-[#4d5664] md:block">{e.phone}</span>
      <span className="hidden w-[92px] sm:block">{e.access === "linked" ? <Chip tone="green">Uses app</Chip> : e.access === "invited" ? <Chip tone="amber">Invited</Chip> : <Chip>No app</Chip>}</span>
      <a href={tel(e.phone)} aria-label={`Call ${e.name}`} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d3d8df] hover:bg-[#f4f6f8]"><Phone className="size-[18px]" aria-hidden /></a>
      <div className="relative">
        <button onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={`More for ${e.name}`} className="grid size-10 place-items-center rounded-xl hover:bg-[#e9edf2]"><MoreHorizontal className="size-5" aria-hidden /></button>
        {menu && (
          <div className="hms-pop absolute right-0 top-full z-30 mt-1 w-[220px] rounded-xl border border-[#e3e7ec] bg-white p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]" onMouseLeave={() => setMenu(false)}>
            <button onClick={() => { setMenu(false); onEdit(); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14.5px] hover:bg-[#f4f6f8]"><Pencil className="size-4" aria-hidden /> Edit details</button>
            {e.status === "active"
              ? <button onClick={() => setStatus("inactive", `${e.name} marked as not working`)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14.5px] hover:bg-[#f4f6f8]"><UserMinus className="size-4" aria-hidden /> Mark not working</button>
              : <button onClick={() => setStatus("active", `${e.name} is working again`)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14.5px] hover:bg-[#f4f6f8]"><UserRound className="size-4" aria-hidden /> Mark working again</button>}
            <Link href={`/hms/staff/people/${e.id}`} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14.5px] hover:bg-[#f4f6f8]"><Users className="size-4" aria-hidden /> Open full profile</Link>
          </div>
        )}
      </div>
    </li>
  );
}

/** Add or edit — only the basics. Salary and app access are optional. */
function MemberForm({ initial, onClose }: { initial?: Employee; onClose: () => void }) {
  const { st, update } = useHrm();
  const toast = useToast();
  const [f, setF] = useState({
    name: initial?.name ?? "", phone: initial?.phone ?? "", dept: (initial?.dept ?? "Front Office") as Dept, position: initial?.position ?? "",
    joined: initial?.joined ?? TODAY, basic: initial?.salary.basic ?? 0, invite: initial ? initial.access !== "not-invited" : true,
  });
  const [tried, setTried] = useState(false);
  const errs = { name: f.name.trim().length < 2 ? "Enter the person's name" : "", phone: !phoneOk(f.phone) ? "11 digits, starting with 01" : "", position: !f.position.trim() ? "Pick or type a role" : "" };
  const ok = !errs.name && !errs.phone && !errs.position;
  const save = () => {
    setTried(true);
    if (!ok) return;
    const phone = f.phone.replace(/\D/g, "");
    if (initial) {
      update((s) => {
        const x = s.employees.find((y) => y.id === initial.id);
        if (!x) return;
        Object.assign(x, { name: f.name.trim(), phone, dept: f.dept, position: f.position.trim(), joined: f.joined });
        x.salary = { ...x.salary, basic: f.basic, house: Math.round(f.basic * 0.3) };
        if (f.invite && x.access === "not-invited") x.access = "invited";
        if (!f.invite && x.access === "invited") x.access = "not-invited";
      }, `${f.name} updated`);
      toast(`${f.name.trim()} updated`);
    } else {
      update((s) => { addEmployee(s, { name: f.name.trim(), phone, dept: f.dept, position: f.position.trim(), email: "", joined: f.joined, type: "Full time", basic: f.basic, invite: f.invite }); }, `${f.name} added to team`);
      toast(f.invite ? `${f.name.trim()} added — app invite will go by SMS` : `${f.name.trim()} added to the team`);
    }
    onClose();
  };
  const err = (k: keyof typeof errs) => (tried && errs[k] ? <span className="mt-1 block text-[13px] font-medium text-[#b11c29]">{errs[k]}</span> : null);
  return (
    <Drawer title={initial ? "Edit team member" : "Add team member"} onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" onClick={save}>{initial ? "Save" : "Add to team"}</Btn></>}>
      <div className="space-y-4">
        <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Rahim Uddin" autoFocus aria-invalid={tried && !!errs.name} />{err("name")}</Field>
        <Field label="Mobile number"><Input inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="01XXXXXXXXX" aria-invalid={tried && !!errs.phone} />{err("phone")}</Field>
        <Field label="Department"><Select value={f.dept} onChange={(e) => setF({ ...f, dept: e.target.value as Dept })}>{st.settings.departments.map((d) => <option key={d}>{d}</option>)}</Select></Field>
        <div>
          <Field label="Role"><Input value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} placeholder="e.g. Receptionist" aria-invalid={tried && !!errs.position} /></Field>
          <div role="group" aria-label="Common roles" className="mt-2 flex flex-wrap gap-1.5">{(ROLES[f.dept] ?? []).map((r) => <button key={r} type="button" onClick={() => setF({ ...f, position: r })} aria-pressed={f.position === r} className={clsx("rounded-full border px-3 py-1 text-[13.5px]", f.position === r ? "border-[#b11c29] bg-[#ffe7e4] text-[#8e1621]" : "border-[#d3d8df] bg-white hover:bg-[#f4f6f8]")}>{r}</button>)}</div>
          {err("position")}
        </div>
        <details className="rounded-xl border border-[#e3e7ec] bg-[#f8f9fb] px-4 py-3" open={!!initial}>
          <summary className="cursor-pointer text-[14.5px] font-semibold">More (optional)</summary>
          <div className="mt-3 space-y-4">
            <Field label="Started on"><Input type="date" value={f.joined} onChange={(e) => setF({ ...f, joined: e.target.value })} /></Field>
            <Field label="Monthly salary (BDT)" hint="Leave 0 if you don't track salary here"><Input type="number" min={0} value={f.basic || ""} placeholder="0" onChange={(e) => setF({ ...f, basic: Number(e.target.value) || 0 })} /></Field>
          </div>
        </details>
        <label className="flex items-start gap-2.5 rounded-xl border border-[#e3e7ec] p-3 text-[14.5px]">
          <input type="checkbox" checked={f.invite} onChange={(e) => setF({ ...f, invite: e.target.checked })} className="mt-0.5 size-4 accent-[#b11c29]" />
          <span><b className="block">Give BinGi app access</b><span className="text-[#4d5664]">They get an SMS invite to log in and see their tasks.</span></span>
        </label>
        {initial && <p className="text-[13px] text-[#4d5664]">Staff ID {initial.id} · started {fmt(initial.joined)}</p>}
      </div>
    </Drawer>
  );
}
