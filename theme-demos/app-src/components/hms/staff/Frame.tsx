"use client";
import Link from "next/link";
import clsx from "clsx";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { ChevronDown, Filter, Search, Settings } from "lucide-react";
import { useProperty } from "../property";
import { useHrm } from "@/lib/hrm/store";
import { Menu, Toast } from "./ui";
import { useHrmMode } from "@/lib/hrm/mode";
import { ModeSwitch } from "./easy";

export type StaffTab = "overview" | "people" | "attendance" | "schedule" | "leave" | "payroll" | "hiring" | "operations" | "settings";
const MAIN: { id: StaffTab; label: string; href: string }[] = [
  { id: "overview", label: "Overview", href: "/hms/staff" },
  { id: "people", label: "People", href: "/hms/staff/people" },
  { id: "attendance", label: "Attendance", href: "/hms/staff/attendance" },
  { id: "schedule", label: "Schedule", href: "/hms/staff/schedule" },
];
export const MORE: { id: StaffTab; label: string; href: string }[] = [
  { id: "leave", label: "Leave", href: "/hms/staff/leave" },
  { id: "payroll", label: "Payroll & Benefits", href: "/hms/staff/payroll" },
  { id: "hiring", label: "Hiring", href: "/hms/staff/hiring" },
  { id: "operations", label: "Team Operations", href: "/hms/staff/operations" },
  { id: "settings", label: "Reports & Settings", href: "/hms/staff/settings" },
];

// Toasts live in a tiny module store so any component (inside or outside StaffFrame) can show one.
let toastText: string | null = null;
const toastSubs = new Set<() => void>();
const showToast = (t: string | null) => { toastText = t; toastSubs.forEach((f) => f()); };
const subToast = (f: () => void) => { toastSubs.add(f); return () => { toastSubs.delete(f); }; };
const hideToast = () => showToast(null);
export const useToast = () => showToast as (t: string) => void;

export function StaffFrame({
  tab, action, search, onSearch, searchPlaceholder = "Search staff (name, ID, department)", right, children, hideSearch, searchFocus, onSubmit, filters, activeFilters = 0, onClearFilters,
}: {
  tab: StaffTab; action?: ReactNode; search?: string; onSearch?: (v: string) => void; searchPlaceholder?: string; right?: ReactNode; children: ReactNode; hideSearch?: boolean; searchFocus?: boolean; onSubmit?: (v: string) => void; filters?: ReactNode; activeFilters?: number; onClearFilters?: () => void;
}) {
  const hotel = useProperty();
  const { st, reset } = useHrm();
  const toast = useSyncExternalStore(subToast, () => toastText, () => null);
  const setToast = showToast;
  const { mode, setMode } = useHrmMode();
  const [more, setMore] = useState(false);
  const [fOpen, setFOpen] = useState(false);
  const inMore = MORE.some((m) => m.id === tab);
  const exportCsv = () => {
    const rows = [["ID", "Name", "Department", "Position", "Status", "Phone", "Email", "Joined"], ...st.employees.map((e) => [e.id, e.name, e.dept, e.position, e.status, e.phone, e.email, e.joined])];
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "staff.csv";
    a.click();
    setToast("staff.csv downloaded");
  };
  return (
    <>
      <div className="h-full overflow-y-auto bg-[#f4f6f8]">
        <div className="hms-page">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold leading-tight tracking-[-0.01em]">Team &amp; HR</h1>
              <p className="mt-0.5 text-[16px] text-[#4d5664]">{hotel.name}</p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-wrap sm:gap-2.5">
              <ModeSwitch />
              <Link href="/hms/staff/settings" aria-label="Settings" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-3 text-[14.5px] font-medium hover:bg-[#f4f6f8] sm:px-4"><Settings className="size-[18px]" /><span className="hidden sm:inline">Settings</span></Link>
              {action}
              <Menu label="More actions" items={[{ label: "Export staff (CSV)", onClick: exportCsv }, { label: "Reset demo data", onClick: () => { reset(); setToast("Demo data reset"); } , danger: true }]} />
            </div>
          </div>

          {mode === "easy" && (
            <div role="status" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[#f1dfb8] bg-[#fdf8ec] px-4 py-2.5 text-[14px] text-[#6b4309]">
              <span>This is a Full HR page. Easy mode only shows your team list.</span>
              <Link href="/hms/staff" className="font-semibold underline underline-offset-4">Back to Team</Link>
              <button onClick={() => setMode("full")} className="font-semibold underline underline-offset-4">Stay in Full HR</button>
            </div>
          )}
          <nav className="no-scrollbar mt-4 flex items-end gap-1 overflow-x-auto border-b border-hms-line sm:overflow-visible" aria-label="Team & HR">
            {[...MAIN, ...MORE.map((m) => ({ ...m, mobile: true }))].map((t) => (
              <Link key={t.id} href={t.href} aria-current={tab === t.id ? "page" : undefined} className={clsx("-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1 text-[14.5px] font-semibold transition-colors", "mobile" in t && "sm:hidden", tab === t.id ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>{t.label}</Link>
            ))}
            <div className="relative hidden sm:block">
              <button onClick={() => setMore((m) => !m)} aria-expanded={more} className={clsx("flex items-center gap-1.5 -mb-px border-b-2 px-3 pb-2.5 pt-1 text-[14.5px] font-semibold transition-colors", inMore ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>
                {inMore ? MORE.find((m) => m.id === tab)!.label : "More"} <ChevronDown className="size-4" />
              </button>
              {more && (
                <div className="hms-pop absolute left-0 top-full z-40 mt-1 w-[230px] rounded-xl border border-[#e3e7ec] bg-white p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]" onMouseLeave={() => setMore(false)}>
                  {MORE.map((m) => (
                    <Link key={m.id} href={m.href} onClick={() => setMore(false)} className={clsx("block rounded-lg px-3 py-2 text-[14.5px] hover:bg-[#f4f6f8]", tab === m.id && "font-semibold text-[#b11c29]")}>{m.label}</Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {!hideSearch && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex h-11 w-full max-w-[400px] items-center gap-2.5 rounded-xl border border-[#d3d8df] bg-white px-3.5">
                <Search className="size-[18px] text-[#4d5664]" />
                <input autoFocus={searchFocus} value={search ?? ""} onChange={(e) => onSearch?.(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && onSubmit) onSubmit((e.target as HTMLInputElement).value); }} enterKeyHint="search" placeholder={searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#7b8190]" />
              </label>
              <div className="ml-auto flex flex-wrap items-center gap-3">
                {right}
                {filters && (
                  <div className="relative">
                    <button onClick={() => setFOpen((o) => !o)} aria-expanded={fOpen} className={clsx("inline-flex h-11 items-center gap-2 rounded-xl border bg-white px-4 text-[15px] font-medium hover:bg-[#f4f6f8]", activeFilters ? "border-[#ef6f68] text-[#b11c29]" : "border-[#d3d8df]")}>
                      <Filter className="size-[18px]" /> Filters{activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#b11c29] text-[12px] text-white">{activeFilters}</span>}
                    </button>
                    {fOpen && (
                      <div role="dialog" aria-label="Filters" className="absolute right-0 top-full z-40 mt-2 w-[300px] space-y-3 rounded-2xl border border-[#e3e7ec] bg-white p-4 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.3)]">
                        {filters}
                        <div className="flex justify-between pt-1">
                          <button onClick={() => onClearFilters?.()} disabled={!activeFilters} className="text-[14px] font-medium text-[#b11c29] disabled:text-[#8a8f9c]">Clear all</button>
                          <button onClick={() => setFOpen(false)} className="rounded-lg bg-[#e9edf2] px-3 py-1.5 text-[14px] font-medium">Done</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div key={tab} className="hms-page-in mt-4">{children}</div>
        </div>
      </div>
      {toast && <Toast key={toast} text={toast} onDone={hideToast} />}
    </>
  );
}

/** Date picker button styled like the design ("📅 04 Nov 2026 ⌄"). */
export function DateBox({ value, onChange, type = "date", label }: { value: string; onChange: (v: string) => void; type?: "date" | "month" | "week"; label: string }) {
  return (
    <label className="relative inline-flex h-11 min-w-[200px] items-center gap-2.5 rounded-xl border border-[#d3d8df] bg-white px-4 text-[15px] font-medium">
      <svg aria-hidden className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
      <span className="flex-1">{label}</span>
      <ChevronDown className="size-4" />
      <input type={type} value={value} onChange={(e) => e.target.value && onChange(e.target.value)} aria-label="Choose date" className="absolute inset-0 cursor-pointer opacity-0" />
    </label>
  );
}

/** One labelled select inside the Filters panel. */
export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13.5px] font-medium text-[#4d5664]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-[#d3d8df] bg-white px-3 text-[14.5px] outline-none focus:border-[#b11c29]">
        <option value="all">All</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </label>
  );
}
