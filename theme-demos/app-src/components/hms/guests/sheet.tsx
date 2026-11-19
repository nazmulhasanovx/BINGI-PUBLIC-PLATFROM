"use client";
// Add / edit guest — phone first (finds an existing guest so nobody is added twice), then only name + country.
// ID is optional here and required before check-in (the booking flow checks it), so the front desk is never blocked.
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { Camera, CircleAlert, Crown, IdCard, Upload } from "lucide-react";
import { COUNTRIES, PREFS, validId, validPhone, type Guest, type IdType } from "@/lib/guests/store";
import { Sheet, btnLine, btnPrimary, input, lbl } from "./ui";

const empty = (id: string): Guest => ({ id, name: "", phone: "", email: "", country: "Bangladesh", address: "", idType: "NID", idNo: "", verified: false, vip: false, prefs: [], notes: "", marketing: false, created: new Date().toISOString().slice(0, 10) });

export function GuestSheet({ guest, newId, findByPhone, onSave, onClose }: {
  guest?: Guest; newId: string; findByPhone: (p: string, except?: string) => Guest | undefined; onSave: (g: Guest) => void; onClose: () => void;
}) {
  const [g, setG] = useState<Guest>(guest ?? empty(newId));
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Guest>(k: K, v: Guest[K]) => setG((x) => ({ ...x, [k]: v }));
  const dup = g.phone ? findByPhone(g.phone, g.id) : undefined;
  const errs: Record<string, string> = {};
  if (!validPhone(g.phone, g.country)) errs.phone = g.country === "Bangladesh" ? "Enter a valid mobile number, e.g. 01711-204518" : "Enter the number with country code";
  if (dup) errs.phone = `${dup.name} already has this number`;
  if (!g.name.trim()) errs.name = "Enter the guest's name";
  if (!validId(g.idType, g.idNo.trim())) errs.idNo = g.idType === "NID" ? "NID is 10, 13 or 17 digits" : g.idType === "Passport" ? "Passport is 6–9 letters/numbers" : "Check the licence number";
  if (g.email && !/^\S+@\S+\.\S+$/.test(g.email)) errs.email = "Check the email";
  const save = () => { setTried(true); if (Object.keys(errs).length) return; onSave({ ...g, name: g.name.trim(), idNo: g.idNo.trim().toUpperCase(), verified: g.verified && !!g.idNo.trim() }); };
  const err = (k: string) => tried && errs[k] ? <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-[#c81e1e]"><CircleAlert className="size-3.5" />{errs[k]}</p> : null;
  const idTypes: IdType[] = g.country === "Bangladesh" ? ["NID", "Passport", "Driving licence"] : ["Passport"];

  return (
    <Sheet title={guest ? "Edit guest" : "Add guest"} sub={guest ? guest.id : "Phone first — we check if the guest is already here"} onClose={onClose}
      footer={<><button onClick={onClose} className={clsx(btnLine, "flex-1")}>Cancel</button><button onClick={save} className={clsx(btnPrimary, "flex-1")}>{guest ? "Save changes" : "Add guest"}</button></>}>
      <div className="space-y-5">
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <div><label htmlFor="g-country" className={lbl}>Country</label>
            <select id="g-country" value={g.country} onChange={(e) => { const c = e.target.value; setG((x) => ({ ...x, country: c, idType: c === "Bangladesh" ? x.idType : "Passport" })); }} className={input}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label htmlFor="g-phone" className={lbl}>Mobile number <span className="text-hms-red">*</span></label>
            <input id="g-phone" inputMode="tel" autoFocus={!guest} value={g.phone} onChange={(e) => set("phone", e.target.value)} placeholder={g.country === "Bangladesh" ? "01711-204518" : "+91 98301 22745"} className={input} aria-invalid={!!(tried && errs.phone)} />
          </div>
        </div>
        {dup && <div className="-mt-2 flex items-center gap-3 rounded-lg border border-[#f5d7a5] bg-[#fffaf0] px-3.5 py-2.5 text-[14px]"><span className="flex-1"><b>{dup.name}</b> is already a guest with this number.</span><Link href={`/hms/guests/${dup.id}`} onClick={onClose} className="font-semibold text-hms-red">Open profile</Link></div>}
        {err("phone")}

        <div><label htmlFor="g-name" className={lbl}>Full name <span className="text-hms-red">*</span></label>
          <input id="g-name" value={g.name} onChange={(e) => set("name", e.target.value)} placeholder="As on NID or passport" className={input} />{err("name")}</div>

        <fieldset className="rounded-xl border border-hms-line p-4">
          <legend className="flex items-center gap-1.5 px-1 text-[14px] font-semibold"><IdCard className="size-4" />ID <span className="font-normal text-hms-muted">— needed before check-in</span></legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="ID type">
            {idTypes.map((t) => <button key={t} type="button" role="radio" aria-checked={g.idType === t} onClick={() => set("idType", t)} className={clsx("h-9 rounded-lg border px-3 text-[13.5px] font-semibold", g.idType === t ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white")}>{t}</button>)}
          </div>
          <label htmlFor="g-id" className={clsx(lbl, "mt-3")}>{g.idType} number</label>
          <input id="g-id" value={g.idNo} onChange={(e) => set("idNo", e.target.value)} placeholder={g.idType === "NID" ? "10, 13 or 17 digits" : "e.g. Z4419872"} className={input} />{err("idNo")}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["idFront", "idBack"] as const).map((k) => (
              <div key={k} className="rounded-lg border border-dashed border-[#858c97] p-2.5 text-center">
                <p className="text-[12.5px] font-semibold">{k === "idFront" ? "Front photo" : "Back photo"}</p>
                {g[k] ? <p className="mt-1 truncate text-[12.5px] text-[#16693a]" title={g[k]}>✓ {g[k]}</p> : <p className="mt-1 text-[12px] text-hms-muted">Not added</p>}
                <div className="mt-2 flex justify-center gap-1.5">
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-hms-line px-2 text-[12.5px] font-medium hover:bg-hms-hover"><Upload className="size-3.5" />File<input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && set(k, e.target.files[0].name)} /></label>
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-hms-line px-2 text-[12.5px] font-medium hover:bg-hms-hover"><Camera className="size-3.5" />Camera<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => e.target.files?.[0] && set(k, e.target.files[0].name)} /></label>
                </div>
              </div>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-[14px]"><input type="checkbox" checked={g.verified} disabled={!g.idNo.trim()} onChange={(e) => set("verified", e.target.checked)} className="size-4 accent-[#b11c29]" />I checked the original ID</label>
        </fieldset>

        <details className="group rounded-xl border border-hms-line" open={!!guest}>
          <summary className="cursor-pointer list-none px-4 py-3 text-[14px] font-semibold">More details <span className="font-normal text-hms-muted">— email, address, preferences, notes</span></summary>
          <div className="space-y-4 border-t border-hms-line p-4">
            <div><label htmlFor="g-email" className={lbl}>Email</label><input id="g-email" type="email" value={g.email} onChange={(e) => set("email", e.target.value)} placeholder="guest@example.com" className={input} />{err("email")}</div>
            <div><label htmlFor="g-addr" className={lbl}>Address</label><input id="g-addr" value={g.address} onChange={(e) => set("address", e.target.value)} placeholder="Area, city" className={input} /></div>
            <div><p className={lbl}>Preferences</p><div className="flex flex-wrap gap-1.5">{PREFS.map((p) => { const on = g.prefs.includes(p); return <button key={p} type="button" aria-pressed={on} onClick={() => set("prefs", on ? g.prefs.filter((x) => x !== p) : [...g.prefs, p])} className={clsx("h-8 rounded-lg border px-2.5 text-[13px] font-medium", on ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{p}</button>; })}</div></div>
            <div><label htmlFor="g-notes" className={lbl}>Notes for the team</label><textarea id="g-notes" rows={3} value={g.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Allergies, special dates, how they like to pay…" className={clsx(input, "h-auto py-2.5")} /></div>
            <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={g.marketing} onChange={(e) => set("marketing", e.target.checked)} className="size-4 accent-[#b11c29]" />Guest agreed to receive offers</label>
          </div>
        </details>

        <label className="flex items-center gap-3 rounded-xl border border-hms-line px-4 py-3 text-[14.5px]"><Crown className="size-5 text-[#a76f00]" /><span className="flex-1 font-semibold">VIP guest</span><input type="checkbox" checked={g.vip} onChange={(e) => set("vip", e.target.checked)} className="size-4 accent-[#b11c29]" /></label>
        <p className="text-[12.5px] text-hms-muted">Prototype: ID photos are not uploaded anywhere — only the file name is kept in this browser.</p>
      </div>
    </Sheet>
  );
}
