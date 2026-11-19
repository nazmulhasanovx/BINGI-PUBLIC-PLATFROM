"use client";
// HMS home for a property created through onboarding — plan-aware (Starter / Business / Ultra views,
// from Nazmul's 3 dashboard references). Truthful: a new property has no bookings yet, so numbers are 0.
import Link from "next/link";
import clsx from "clsx";
import { BedDouble, CalendarCheck, Camera, Check, ChefHat, ClipboardList, FileText, Globe, Percent, Sparkles, UsersRound, Wallet } from "lucide-react";
import { PLANS, checks, type Draft } from "@/lib/onboarding/store";
import { useRooms } from "@/lib/rooms/store";
import { useProperty } from "./property";

export function SetupDashboard({ d }: { d: Draft }) {
  const h = useProperty();
  const { st } = useRooms(h);
  const live = st.units.filter((u) => u.status !== "archived");
  const bookable = live.filter((u) => u.status === "published").length;
  const cs = checks(d, { total: live.length, published: bookable, categories: st.categories.length });
  const tasks = [
    { id: "photos", label: "Add room photos", done: st.categories.some((c) => c.photo), href: "/hms/rooms/categories", icon: Camera },
    { id: "bookings", label: "Add bookings you already have", done: d.existing.rows.length > 0, href: "/hms/bookings", icon: CalendarCheck },
    { id: "team", label: "Invite your team", done: d.team.length > 0, href: "/hms/staff/people", icon: UsersRound },
    { id: "docs", label: "Upload NID and trade licence", done: cs.find((c) => c.id === "verify")!.ok, href: "/onboarding/flow", icon: FileText },
    { id: "site", label: "Publish your website", done: false, href: "/hms/website/overview", icon: Globe },
  ];
  const done = tasks.filter((x) => x.done).length;
  const hour = new Date().getHours();
  const kpis = [
    { label: "Arriving today", value: "0", icon: CalendarCheck, tint: "bg-[#fff1ea] text-[#d9622b]" },
    { label: "Occupancy", value: "0%", sub: `0 of ${bookable} rooms`, icon: Percent, tint: "bg-[#f1edff] text-[#6b55e0]" },
    { label: "Rooms set up", value: String(live.length), sub: bookable ? `${bookable} bookable` : "Bookable after approval", icon: BedDouble, tint: "bg-[#fff6dd] text-[#b07a00]" },
    { label: "Room revenue today", value: "BDT 0", icon: Wallet, tint: "bg-[#e9f7ef] text-[#1c7d45]" },
  ];
  return (
    <div className="h-full overflow-y-auto">
      <div className="hms-page space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold tracking-[-0.01em]">{hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"} — welcome to BinGi</h1>
            <p className="text-[14px] text-hms-muted">{h.name} · {PLANS[d.plan].label} plan · setup mode</p>
          </div>
          <Link href="/hms/bookings/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-hms-coral px-4 text-[14px] font-semibold text-white">+ New booking</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="flex items-center gap-3 rounded-xl border border-hms-line bg-white p-4">
              <span className={clsx("grid size-11 place-items-center rounded-xl", k.tint)}><k.icon className="size-5" /></span>
              <div><p className="text-[22px] font-bold leading-none">{k.value}</p><p className="mt-1 text-[13px] text-hms-muted">{k.label}{k.sub ? ` · ${k.sub}` : ""}</p></div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-xl border border-hms-line bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl bg-hms-coral-soft text-hms-red"><ClipboardList className="size-6" /></span>
              <div className="flex-1"><h2 className="text-[17px] font-bold">Getting started</h2><p className="text-[13.5px] text-hms-muted">{done} of {tasks.length} done</p></div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-hms-hover"><div className="h-full rounded-full bg-hms-coral transition-[width]" style={{ width: `${(done / tasks.length) * 100}%` }} /></div>
            <ul className="mt-4 divide-y divide-hms-line">
              {tasks.map((x) => (
                <li key={x.id} className="flex items-center gap-3 py-2.5">
                  <span className={clsx("grid size-8 place-items-center rounded-lg", x.done ? "bg-[#e9f7ef] text-[#1c7d45]" : "bg-hms-hover text-hms-muted")}>{x.done ? <Check className="size-4" /> : <x.icon className="size-4" />}</span>
                  <span className={clsx("flex-1 text-[14.5px]", x.done && "text-hms-muted line-through")}>{x.label}</span>
                  {!x.done && <Link href={x.href} className="text-[13.5px] font-semibold text-hms-red">Start</Link>}
                </li>
              ))}
            </ul>
          </section>
          <PlanCard d={d} />
        </div>
      </div>
    </div>
  );
}

function PlanCard({ d }: { d: Draft }) {
  if (d.plan === "starter") {
    return (
      <section className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-[#b11c29] to-[#7a1320] p-5 text-white">
        <div><Sparkles className="size-6" /><h2 className="mt-3 text-[19px] font-bold">Need more tools?</h2><p className="mt-1 text-[14px] text-white/85">Business adds housekeeping, restaurant, QR ordering, expenses and other services.</p></div>
        <Link href="/hms/settings/billing" className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-[14px] font-semibold text-[#8e1621]">View Business</Link>
      </section>
    );
  }
  if (d.plan === "ultra") {
    return (
      <section className="rounded-xl border border-hms-line bg-white p-5">
        <h2 className="flex items-center gap-2 text-[17px] font-bold"><UsersRound className="size-5 text-hms-red" />Team & inventory</h2>
        <dl className="mt-3 divide-y divide-hms-line text-[14px]">
          <div className="flex justify-between py-2"><dt className="text-hms-muted">Staff on duty</dt><dd className="font-semibold">0</dd></div>
          <div className="flex justify-between py-2"><dt className="text-hms-muted">Low stock</dt><dd className="font-semibold">0 items</dd></div>
          <div className="flex justify-between py-2"><dt className="text-hms-muted">Team invited</dt><dd className="font-semibold">{d.team.length}</dd></div>
        </dl>
        <Link href="/hms/staff" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-hms-line text-[14px] font-semibold hover:bg-hms-hover">View operations</Link>
      </section>
    );
  }
  if (d.modules.includes("restaurant")) {
    return (
      <section className="rounded-xl border border-hms-line bg-white p-5">
        <h2 className="flex items-center gap-2 text-[17px] font-bold"><ChefHat className="size-5 text-hms-red" />Restaurant today</h2>
        <p className="mt-1 text-[13.5px] text-hms-muted">No menu yet. Add your menu to take room-service and QR orders.</p>
        <Link href="/hms/meals" className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg border border-hms-line text-[14px] font-semibold hover:bg-hms-hover">Add menu</Link>
      </section>
    );
  }
  return (
    <section className="rounded-xl border border-hms-line bg-white p-5">
      <h2 className="flex items-center gap-2 text-[17px] font-bold"><Globe className="size-5 text-hms-red" />Website & booking</h2>
      <p className="mt-2 inline-flex rounded-full bg-[#fdf6e7] px-2.5 py-0.5 text-[12.5px] font-semibold text-[#7a4a0b]">Draft · publishes after approval</p>
      <p className="mt-2 text-[13.5px] text-hms-muted">Theme: {d.site.theme ? d.site.theme.toUpperCase() : "not chosen"}</p>
      <Link href="/hms/website/overview" className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-hms-line text-[14px] font-semibold hover:bg-hms-hover">Manage website</Link>
    </section>
  );
}
