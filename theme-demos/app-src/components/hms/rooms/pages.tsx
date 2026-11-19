"use client";
// Rooms / Accommodations — Units list, Categories, Setup summary.
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Building2, MapPin, Plus, Search } from "lucide-react";
import { useProperty } from "../property";
import { TODAY, leaves, nodePath, publishIssues, unitRate, useRooms, type Category, type RoomsState, type Unit } from "@/lib/rooms/store";
import { CORE, TEMPLATES, preset as presetOf, propertyTypeFor, youtubeId, type CoreType } from "@/lib/rooms/catalog";
import { Btn, Chip, Drawer, Empty, Field, Input, Select } from "../staff/ui";
import { AmenityPicker, PRESET_ICON, RoomsFrame, Section, money, useToast } from "./parts";
import { STATE, useUnitStates } from "./state";
import { useHousekeeping } from "@/lib/housekeeping/store";

const fmtStamp = (s?: string) => (s ? `${s.slice(8, 10)} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}${s.length > 10 ? `, ${s.slice(11, 16)}` : ""}` : "—");

// ---------------- Units ----------------
export function UnitsPage() {
  const h = useProperty();
  const { st, update } = useRooms(h);
  const toast = useToast();
  const [q, setQ] = useState("");
  const [core, setCore] = useState<CoreType | "all">("all");
  const [status, setStatus] = useState<"all" | Unit["status"]>("all");
  const [now, setNow] = useState<"" | "available" | "booked" | "dirty" | "ooo">("");
  const hk = useHousekeeping(h);
  const [open, setOpen] = useState<string | null>(null);
  const cat = (id: string) => st.categories.find((c) => c.id === id);
  const tonight = useUnitStates(st);
  const dirty = (u: Unit) => u.status === "published" && !hk.isReady(u.code) && tonight.get(u.id) !== "ooo";
  const list = st.units.filter((u) =>
    (core === "all" || u.core === core) && (status === "all" ? u.status !== "archived" : u.status === status) &&
    (!now || (now === "dirty" ? dirty(u) : tonight.get(u.id) === now)) &&
    (!q || `${u.code} ${cat(u.category)?.name ?? ""} ${presetOf(u.preset).label}`.toLowerCase().includes(q.toLowerCase())));
  const groups = useMemo(() => {
    const g = new Map<string, Unit[]>();
    for (const u of list) g.set(u.node, [...(g.get(u.node) ?? []), u]);
    return [...g.entries()].sort((a, b) => nodePath(st.config, a[0]).localeCompare(nodePath(st.config, b[0]), undefined, { numeric: true }));
  }, [list, st.config]);
  const drafts = st.units.filter((u) => u.status === "draft");
  const used = st.units.filter((u) => u.status !== "archived").length;
  const archived = st.units.filter((u) => u.status === "archived").length;
  const cores = st.config.enabled.filter((t) => st.units.some((u) => u.core === t));
  const publishAll = () => {
    const ok = drafts.filter((u) => !publishIssues(st, u).length);
    const blocked = drafts.length - ok.length;
    update((s) => { for (const u of s.units) if (ok.some((o) => o.id === u.id)) u.status = "published"; }, `${ok.length} draft units published`);
    toast(blocked ? `${ok.length} published · ${blocked} need fixing first` : `${ok.length} units published`);
  };
  const u = open ? st.units.find((x) => x.id === open) : undefined;
  const count = (k: "available" | "booked" | "ooo") => st.units.filter((x) => tonight.get(x.id) === k).length;

  return (
    <RoomsFrame tab="units">
      <div role="radiogroup" aria-label="Rooms tonight" className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-hms-line bg-white md:grid-cols-4">
        {([["available", "Available tonight", count("available"), "bg-[#1c7d45]"], ["booked", "Booked tonight", count("booked"), "bg-[#2457c5]"], ["dirty", "Needs cleaning", st.units.filter(dirty).length, "bg-[#c2410c]"], ["ooo", "Out of order", count("ooo"), "bg-[#b26a00]"]] as const).map(([id, l, c, dot], i) => (
          <button key={id} role="radio" aria-checked={now === id} onClick={() => setNow(now === id ? "" : id)} className={clsx("flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors", i % 2 === 1 && "border-l border-hms-line", i > 1 && "border-t border-hms-line md:border-t-0", i === 2 && "md:border-l", now === id ? "bg-[#fff6f6]" : "hover:bg-hms-hover")}>
            <span aria-hidden className={clsx("size-2.5 rounded-full", dot)} /><span className="min-w-0 flex-1 truncate text-[14px] font-medium">{l}</span><b className="text-[18px] tabular-nums">{c}</b>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[12.5px] text-[#4d5664]">{used} rooms in use{drafts.length ? ` · ${drafts.length} draft (not bookable)` : ""}{archived ? ` · ${archived} archived` : ""} · package limit comes from Billing (not connected in this prototype).</p>
      {(st.excluded?.length ?? 0) > 0 && (
        <section role="status" className="mt-4 rounded-2xl border border-[#d8dcf0] bg-[#f5f6fd] p-4 text-[14px]">
          <p className="font-semibold">Not in this release</p>
          <ul className="mt-1 space-y-0.5 text-[#4d5664]">{st.excluded!.map((x) => <li key={x.name}><b>{x.name}</b> — {x.reason}</li>)}</ul>
        </section>
      )}

      {st.drafts.length > 0 && (
        <section className="mt-4 rounded-2xl border border-[#f1dfb8] bg-[#fffaf0] p-4">
          <h2 className="text-[15.5px] font-semibold">Unfinished additions</h2>
          <ul className="mt-2 divide-y divide-[#f1e6cc]">
            {st.drafts.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 py-2.5 text-[14.5px]">
                <span className="min-w-0 flex-1"><b>{presetOf(d.preset).label}</b>{d.category && ` · ${cat(d.category)?.name ?? ""}`} · {d.picks.length} numbers picked (not reserved) · saved {fmtStamp(d.savedAt)}</span>
                <Link href={`/hms/rooms/new?draft=${d.id}`} className="font-medium text-[#b11c29]">Continue</Link>
                <button onClick={() => update((s) => { s.drafts = s.drafts.filter((x) => x.id !== d.id); }, "Setup draft discarded")} className="text-[#4d5664] hover:text-[#0f1720]">Discard</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <label className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-[#d3d8df] bg-white px-3.5 sm:max-w-[340px]">
          <Search className="size-[18px] text-[#4d5664]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number or category" aria-label="Search units" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#7b8190]" />
        </label>
        <select aria-label="Type" value={core} onChange={(e) => setCore(e.target.value as CoreType | "all")} className="h-11 rounded-xl border border-[#d3d8df] bg-white px-3 text-[14.5px]">
          <option value="all">All types</option>{cores.map((t) => <option key={t} value={t}>{CORE[t].plural}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="h-11 rounded-xl border border-[#d3d8df] bg-white px-3 text-[14.5px]">
          <option value="all">Published & drafts</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
        </select>
        {drafts.length > 0 && <Btn className="sm:ml-auto" onClick={publishAll}>Publish all drafts ({drafts.length})</Btn>}
      </div>

      <div className="mt-4 space-y-4">
        {!st.units.length && <div className="rounded-2xl border border-[#e3e7ec] bg-white"><Empty icon={<Building2 className="size-6" />} title="No units yet" text="Add your first rooms, cottages or beds." action={<Link href="/hms/rooms/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#b11c29] px-4 text-[14.5px] font-medium text-white"><Plus className="size-4" /> Add accommodation</Link>} /></div>}
        {st.units.length > 0 && !list.length && <p className="rounded-2xl border border-[#e3e7ec] bg-white p-6 text-center text-[15px] text-[#4d5664]">No unit matches these filters.</p>}
        {groups.map(([nid, us]) => (
          <section key={nid} className="rounded-2xl border border-[#e3e7ec] bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-[15.5px] font-semibold">{["FLOOR", "LEVEL"].includes(st.config.nodes.find((n) => n.id === nid)?.kind ?? "") ? <Building2 className="size-[18px] text-[#4d5664]" /> : <MapPin className="size-[18px] text-[#4d5664]" />}{nodePath(st.config, nid)}<span className="font-normal text-[#4d5664]">· {us.length}</span></h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
              {us.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })).map((x) => {
                const Icon = PRESET_ICON[x.preset];
                return (
                  <li key={x.id}>
                    <button onClick={() => setOpen(x.id)} className="w-full rounded-xl border border-[#e3e7ec] p-3 text-left transition-colors hover:border-[#858c97] hover:bg-[#f4f6f8]">
                      <span className="flex items-center justify-between gap-2"><span className="font-mono text-[17px] font-semibold">{x.code}</span><Icon className="size-4 text-[#4d5664]" aria-label={presetOf(x.preset).label} /></span>
                      <span className="mt-0.5 block truncate text-[13.5px] text-[#4d5664]">{cat(x.category)?.name}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-1.5">
                        {x.status === "published" ? (() => { const k = tonight.get(x.id) ?? "available"; return <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"><span aria-hidden className={clsx("size-2 rounded-full", STATE[k].dot)} />{STATE[k].label}</span>; })()
                          : <Chip tone={x.status === "draft" ? "amber" : "gray"} className="!px-2 !py-0.5 !text-[12.5px]">{x.status === "draft" ? "Draft · not bookable" : "Archived"}</Chip>}

                      </span>
                      {x.status === "published" && <span className={clsx("mt-1 block text-[12.5px]", tonight.get(x.id) === "ooo" ? "text-[#4d5664]" : hk.isReady(x.code) ? "text-[#16693a]" : "font-semibold text-[#c2410c]")}>{tonight.get(x.id) === "ooo" ? "Maintenance" : hk.isReady(x.code) ? "Room clean" : hk.stateOf(x.code) === "Dirty" ? "Needs cleaning" : hk.stateOf(x.code) === "Cleaning" ? "Being cleaned" : "Waiting inspection"}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      {u && <UnitDrawer st={st} u={u} onClose={() => setOpen(null)} />}
    </RoomsFrame>
  );
}

export function UnitDrawer({ st, u, onClose }: { st: RoomsState; u: Unit; onClose: () => void }) {
  const h = useProperty();
  const { update } = useRooms(h);
  const toast = useToast();
  const cat = st.categories.find((c) => c.id === u.category);
  const [rate, setRate] = useState(u.rate === undefined ? "" : String(u.rate));
  const [video, setVideo] = useState(u.video);
  const [url, setUrl] = useState(u.videoUrl ?? "");
  const [note, setNote] = useState(u.note ?? "");
  const issues = publishIssues(st, u);
  const dirty = rate !== (u.rate === undefined ? "" : String(u.rate)) || video !== u.video || url !== (u.videoUrl ?? "") || note !== (u.note ?? "");
  const badRate = rate !== "" && !(Number(rate) > 0);
  const badUrl = video === "replace" && !youtubeId(url);
  const save = () => {
    update((s) => { const x = s.units.find((y) => y.id === u.id)!; x.rate = rate === "" ? undefined : Number(rate); x.video = video; x.videoUrl = video === "replace" ? url : undefined; x.note = note.trim() || undefined; }, `${u.code} details updated`);
    toast(`${u.code} saved`);
  };
  return (
    <Drawer title={`${presetOf(u.preset).label} ${u.code}`} onClose={onClose} footer={<>
      {u.status === "draft" && <Btn kind="danger" onClick={() => { if (!window.confirm(`Archive draft ${u.code}? It frees one unit of capacity; the code ${u.code} stays reserved.`)) return; update((s) => { s.units.find((x) => x.id === u.id)!.status = "archived"; }, `Draft ${u.code} archived (code kept)`); toast(`${u.code} archived`); onClose(); }}>Archive draft</Btn>}
      <span className="mr-auto" />
      {dirty && <Btn disabled={badRate || badUrl} onClick={save}>Save changes</Btn>}
      {u.status === "archived" ? null : u.status === "draft"
        ? <Btn kind="primary" disabled={issues.length > 0 || dirty} onClick={() => { update((s) => { s.units.find((x) => x.id === u.id)!.status = "published"; }, `${u.code} published`); toast(`${u.code} published`); }}>Publish</Btn>
        : <Btn onClick={() => { update((s) => { s.units.find((x) => x.id === u.id)!.status = "draft"; }, `${u.code} moved to draft`); toast(`${u.code} is now a draft (not bookable)`); }}>Move to draft</Btn>}
    </>}>
      <div className="space-y-5">
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-[14.5px]">
          <dt className="text-[#4d5664]">Status</dt><dd><Chip tone={u.status === "published" ? "green" : u.status === "draft" ? "amber" : "gray"}>{u.status === "published" ? "Published — can be sold" : u.status === "draft" ? "Draft — not bookable" : "Archived — history only"}</Chip></dd>
          <dt className="text-[#4d5664]">Unit code</dt><dd className="font-mono font-semibold">{u.code}</dd>
          <dt className="text-[#4d5664]">Door number</dt><dd className="font-mono">{u.local}</dd>
          <dt className="text-[#4d5664]">Location</dt><dd>{nodePath(st.config, u.node)}</dd>
          <dt className="text-[#4d5664]">Category</dt><dd>{cat?.name ?? "—"}</dd>
          <dt className="text-[#4d5664]">Sold as</dt><dd>{CORE[u.core].label} · {CORE[u.core].inventory.toLowerCase()}</dd>
          <dt className="text-[#4d5664]">Price</dt><dd className="font-semibold">৳{money(unitRate(u, cat))} / night{u.rate !== undefined && <span className="ml-1.5 text-[12.5px] font-normal text-[#4d5664]">(own price)</span>}</dd>
        </dl>
        {u.status === "draft" && issues.length > 0 && (
          <div role="alert" className="rounded-xl border border-[#f3c4c0] bg-[#ffe7e4] px-3.5 py-2.5 text-[14px] text-[#a3261f]"><p className="font-semibold">Can&apos;t publish yet</p>{issues.map((i) => <p key={i}>{i}</p>)}</div>
        )}
        {u.status === "published" && <OutOfOrder u={u} />}
        <div className="space-y-3 border-t border-[#e3e7ec] pt-4">
          <p className="text-[14px] font-semibold">Only for this unit</p>
          <Field label="Own price (leave empty to use category)" hint={badRate ? "Must be more than 0" : undefined}><Input type="number" min={0} value={rate} placeholder={String(cat?.baseRate ?? "")} onChange={(e) => setRate(e.target.value)} /></Field>
          <Field label="Video"><Select value={video} onChange={(e) => setVideo(e.target.value as Unit["video"])}><option value="inherit">Same as category</option><option value="replace">This unit&apos;s own video</option><option value="hide">No video</option></Select></Field>
          {video === "replace" && <Field label="YouTube link" hint={url && badUrl ? "Only YouTube links" : undefined}><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtu.be/…" /></Field>}
          <Field label="Note for staff (optional)"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Connecting door to 103" /></Field>
        </div>
        <p className="text-[13px] text-[#4d5664]">Cleaning / readiness is in Housekeeping; reservations in Bookings. Moving a booked unit to draft is checked against bookings by the HMS backend.</p>
      </div>
    </Drawer>
  );
}

/** Out of order = maintenance. Separate from publish status and from bookings; it stops new sales of this room. */
function OutOfOrder({ u }: { u: Unit }) {
  const h = useProperty();
  const { update } = useRooms(h);
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [since, setSince] = useState(TODAY);
  const [until, setUntil] = useState("");
  if (u.ooo) return (
    <div className="rounded-xl border border-[#f1dfb8] bg-[#fffaf0] px-3.5 py-3 text-[14px]">
      <p className="font-semibold text-[#7a4a0b]">Out of order {u.ooo.since.slice(0, 10) > TODAY ? "from" : "since"} {fmtStamp(u.ooo.since)}{u.ooo.until ? ` · back ${fmtStamp(u.ooo.until)}` : ""}</p>
      <p className="text-[#4d5664]">{u.ooo.reason}. Not sold {u.ooo.until ? "on these dates" : "until it’s back"}.</p>
      <Btn className="mt-2 h-9" onClick={() => { update((s) => { delete s.units.find((x) => x.id === u.id)!.ooo; }, `${u.code} back in service`); toast(`${u.code} is back in service`); }}>Back in service</Btn>
    </div>
  );
  return (
    <div className="space-y-2 rounded-xl border border-[#e3e7ec] px-3.5 py-3">
      <p className="text-[14px] font-semibold">Out of order (maintenance)</p>
      <div className="flex gap-2">
        <Input aria-label="Out of order reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason, e.g. AC repair" />
        <Btn className="shrink-0" disabled={!reason.trim() || (!!until && until <= since)} onClick={() => { update((s) => { s.units.find((x) => x.id === u.id)!.ooo = { reason: reason.trim(), since: since < TODAY ? TODAY : since, ...(until ? { until } : {}) }; }, `${u.code} out of order: ${reason.trim()}`); toast(`${u.code} marked out of order`); setReason(""); }}>Mark out of order</Btn>
      </div>
      <div className="flex flex-wrap gap-3 text-[13px]">
        <label className="flex items-center gap-2">From <input type="date" aria-label="Out of order from" min={TODAY} value={since} onChange={(e) => setSince(e.target.value || TODAY)} className="h-9 rounded-lg border border-[#c9ced6] px-2" /></label>
        <label className="flex items-center gap-2">Back on <input type="date" aria-label="Back in service on" min={since} value={until} onChange={(e) => setUntil(e.target.value)} className="h-9 rounded-lg border border-[#c9ced6] px-2" /><span className="text-[#4d5664]">(optional)</span></label>
      </div>
      <p className="text-[12.5px] text-[#4d5664]">Existing bookings are not changed — move guests from Bookings if needed.</p>
    </div>
  );
}

// ---------------- Categories ----------------
export function CategoriesPage() {
  const h = useProperty();
  const { st, update } = useRooms(h);
  const toast = useToast();
  const [edit, setEdit] = useState<string | null>(null);
  const c = edit ? st.categories.find((x) => x.id === edit) : undefined;
  return (
    <RoomsFrame tab="types">
      {!st.categories.length && <div className="rounded-2xl border border-[#e3e7ec] bg-white"><Empty icon={<Building2 className="size-6" />} title="No categories yet" text="Categories are created while adding units." /></div>}
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {st.categories.filter((x) => !x.archived).map((x) => {
          const us = st.units.filter((u) => u.category === x.id);
          const Icon = PRESET_ICON[x.preset];
          return (
            <li key={x.id} className="flex flex-col rounded-2xl border border-[#e3e7ec] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9edf2]"><Icon className="size-5 text-[#4d5664]" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-semibold">{x.name}</p>
                  <p className="text-[13.5px] text-[#4d5664]">{presetOf(x.preset).label}{presetOf(x.preset).group !== "standard" && ` · works as ${CORE[x.core].label}`}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-[13.5px]">
                <div><dt className="text-[#4d5664]">Base price</dt><dd className="font-semibold">৳{money(x.baseRate)}</dd></div>
                <div><dt className="text-[#4d5664]">Units</dt><dd className="font-semibold">{us.length}{us.some((u) => u.status === "draft") && <span className="font-normal text-[#9c5f0e]"> ({us.filter((u) => u.status === "draft").length} draft)</span>}</dd></div>
                <div><dt className="text-[#4d5664]">Guests</dt><dd className="font-semibold">{x.maxAdults}{x.maxChildren ? `+${x.maxChildren}` : ""}</dd></div>
              </dl>
              <p className="mt-2 line-clamp-2 text-[13px] text-[#4d5664]">{x.amenities.join(" · ")}</p>
              {x.approval !== "approved" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[#fdf6e7] px-3 py-2 text-[13px] text-[#7a4a0b]">
                  <span className="flex-1">Waiting for BinGi approval — units stay drafts until approved.</span>
                  <button onClick={() => { update((s) => { s.categories.find((y) => y.id === x.id)!.approval = "approved"; }, `Category ${x.name} approved (demo of Superadmin approval)`); toast(`${x.name} approved (demo)`); }} className="font-semibold underline">Approve (BinGi demo)</button>
                </div>
              )}
              <div className="mt-auto flex gap-2 pt-3">
                <Btn className="h-9 flex-1" onClick={() => setEdit(x.id)}>Edit</Btn>
                {us.length > 0 && us.every((u) => u.status === "archived") && <Btn kind="danger" className="h-9" onClick={() => { update((s) => { s.categories.find((y) => y.id === x.id)!.archived = true; }, `Category ${x.name} archived`); toast(`${x.name} archived`); }}>Archive</Btn>}
                <Link href={`/hms/rooms/new?category=${x.id}`} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#d3d8df] bg-white text-[14px] font-medium hover:bg-[#f4f6f8]"><Plus className="size-4" /> Add units</Link>
              </div>
            </li>
          );
        })}
      </ul>
      {c && <CategoryDrawer st={st} c={c} onClose={() => setEdit(null)} />}
    </RoomsFrame>
  );
}

function CategoryDrawer({ st, c, onClose }: { st: RoomsState; c: Category; onClose: () => void }) {
  const h = useProperty();
  const { update } = useRooms(h);
  const toast = useToast();
  const [d, setD] = useState<Category>(c);
  const n = st.units.filter((u) => u.category === c.id).length;
  const own = st.units.filter((u) => u.category === c.id && u.rate !== undefined).length;
  const errs = [
    !d.name.trim() && "Name is required",
    st.categories.some((x) => x.id !== c.id && x.name.trim().toLowerCase() === d.name.trim().toLowerCase()) && "Another category has this name",
    !(d.baseRate > 0) && "Base price is required",
    !(d.maxAdults >= 1) && "Max adults must be at least 1",
    d.video && !youtubeId(d.video) && "Video must be a YouTube link",
  ].filter(Boolean) as string[];
  return (
    <Drawer wide title={`Edit ${c.name}`} onClose={onClose} footer={<>
      <Btn onClick={onClose}>Cancel</Btn>
      <Btn kind="primary" disabled={errs.length > 0} onClick={() => { update((s) => { const i = s.categories.findIndex((x) => x.id === c.id); s.categories[i] = { ...d, name: d.name.trim() }; }, `Category ${d.name.trim()} updated (${n} units)`); toast("Category saved"); onClose(); }}>Save</Btn>
    </>}>
      <div className="space-y-4">
        <p className="rounded-xl bg-[#f4f6f8] px-3.5 py-2.5 text-[14px] text-[#4d5664]">{n} units use this category. Changes apply to all of them{own ? `; ${own} with their own price keep it` : ""}. Bookings already made keep their price.</p>
        {errs.length > 0 && <div role="alert" className="text-[14px] text-[#b11c29]">{errs.map((e) => <p key={e}>{e}</p>)}</div>}
        <Field label="Name"><Input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Base price (৳ / night)"><Input type="number" min={0} value={d.baseRate || ""} onChange={(e) => setD({ ...d, baseRate: Number(e.target.value) })} /></Field>
          <Field label="Beds"><Input value={d.bed} onChange={(e) => setD({ ...d, bed: e.target.value })} /></Field>
          <Field label="Max adults"><Input type="number" min={1} value={d.maxAdults} onChange={(e) => setD({ ...d, maxAdults: Number(e.target.value) })} /></Field>
          <Field label="Max children"><Input type="number" min={0} value={d.maxChildren} onChange={(e) => setD({ ...d, maxChildren: Number(e.target.value) })} /></Field>
        </div>
        <Field label="YouTube video (optional)"><Input value={d.video ?? ""} onChange={(e) => setD({ ...d, video: e.target.value || undefined })} placeholder="https://youtu.be/…" /></Field>
        <Field label="Amenities" group><AmenityPicker value={d.amenities} onChange={(a) => setD({ ...d, amenities: a })} /></Field>
      </div>
    </Drawer>
  );
}

// ---------------- Setup summary ----------------
export function ConfigurationPage() {
  const h = useProperty();
  const { st } = useRooms(h);
  const c = st.config;
  const count = (id: string) => st.units.filter((u) => u.node === id || c.nodes.some((n) => n.parent === id && n.id === u.node)).length;
  return (
    <RoomsFrame tab="setup">
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Setup" desc={`Version ${c.version} · saved ${fmtStamp(c.savedAt)}`} right={<Link href="/hms/rooms/setup" className="inline-flex h-10 items-center rounded-xl border border-[#d3d8df] bg-white px-4 text-[14.5px] font-medium hover:bg-[#f4f6f8]">Edit setup</Link>}>
          <dl className="grid grid-cols-[130px_1fr] gap-y-2 text-[14.5px]">
            <dt className="text-[#4d5664]">Property type</dt><dd className="font-medium">{propertyTypeFor(h).label}</dd>
            <dt className="text-[#4d5664]">Types on</dt><dd className="font-medium">{c.enabled.map((t) => CORE[t].plural).join(", ")}</dd>
          </dl>
        </Section>
        <Section title="Numbering">
          <ul className="space-y-1.5 text-[14.5px]">
            {c.enabled.map((t) => <li key={t}><span className="font-medium">{CORE[t].plural}:</span> {TEMPLATES.find((x) => x.v === c.numbering[t].template)?.label} · {leaves(c, t).length} {leaves(c, t).length === 1 ? "location" : "locations"}</li>)}
          </ul>
        </Section>
        <Section title="Locations">
          <ul className="space-y-3 text-[14.5px]">
            {c.nodes.filter((n) => !n.parent).map((p) => (
              <li key={p.id}>
                <p className="font-medium">{p.name}{p.code && <span className="ml-1.5 rounded bg-[#e9edf2] px-1.5 font-mono text-[12.5px]">{p.code}</span>} <span className="font-normal text-[#4d5664]">· {count(p.id)} units</span></p>
                <p className="mt-1 flex flex-wrap gap-1.5">{c.nodes.filter((n) => n.parent === p.id).map((n) => <span key={n.id} className="rounded-md bg-[#e9edf2] px-2 py-0.5 text-[13px]">{n.name} · {st.units.filter((u) => u.node === n.id).length}</span>)}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Recent changes">
          <ul className="space-y-2 text-[14px]">
            {st.activity.slice(0, 8).map((a, i) => <li key={i}><span className="text-[#4d5664]">{fmtStamp(a.at)}</span> · {a.text}</li>)}
          </ul>
        </Section>
      </div>
    </RoomsFrame>
  );
}
