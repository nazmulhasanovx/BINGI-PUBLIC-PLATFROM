"use client";
// One-time accommodation setup — 4 steps (spec 01-foundations/02-one-time-configuration).
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import { Building2, MapPin, Plus, X } from "lucide-react";
import { useProperty } from "../property";
import { codeFor, emptyConfig, isBuilding, isFloor, isZone, leaves, nowStamp, prefixOf, uid, useRooms, type Config, type LocNode } from "@/lib/rooms/store";
import { BUILDING_KINDS, CORE, CORE_TYPES, PRESETS, TEMPLATES, ZONE_KINDS, kindLabel, propertyTypeFor, type CoreType, type LocKindCode } from "@/lib/rooms/catalog";
import { Btn, Field, Input, Select } from "../staff/ui";
import { CORE_ICON, ChoiceCard, Section, Steps, useToast } from "./parts";
import { Hydrated, useRoomsBase } from "./parts";

const STEPS = ["Types", "Locations", "Numbering", "Review"];
const floorName = (l: number) => (l === 0 ? "Ground floor" : `Floor ${l}`);

export function SetupPage() {
  const h = useProperty();
  return <Hydrated><SetupPageInner key={h.slug} /></Hydrated>;
}

function SetupPageInner() {
  const base = useRoomsBase();
  const h = useProperty();
  const { st, update } = useRooms(h);
  const router = useRouter();
  const toast = useToast();
  const pt = propertyTypeFor(h);
  const [c, setC] = useState<Config>(() => (st.config.configured ? structuredClone(st.config) : { ...emptyConfig(), enabled: pt.suggest.slice(0, 1) }));
  const [step, setStep] = useState(0);
  const [maxDone, setMaxDone] = useState(st.config.configured ? 3 : 0);
  const [tried, setTried] = useState(false);
  // Optimistic version: if someone else saved setup since this screen opened, saving is refused (backend returns a stale-version conflict).
  const [loadedVersion, setLoadedVersion] = useState(st.config.version);
  const [stale, setStale] = useState(false);
  const used = (core: CoreType) => st.units.filter((u) => u.core === core).length;
  const nodeUsed = (id: string) => st.units.some((u) => u.node === id || c.nodes.some((n) => n.parent === id && u.node === n.id));
  const needFloors = c.enabled.some((t) => CORE[t].strategy === "floor");
  const needZones = c.enabled.some((t) => CORE[t].strategy === "zone");
  const buildings = c.nodes.filter(isBuilding);
  const zones = c.nodes.filter(isZone);

  const errors = (i: number): string[] => {
    const e: string[] = [];
    if (i === 0 && !c.enabled.length) e.push("Choose at least one accommodation type.");
    if (i === 1) {
      if (needFloors && !buildings.some((b) => c.nodes.some((f) => f.parent === b.id && isFloor(f)))) e.push("Add at least one building with a floor.");
      if (needZones && !zones.length) e.push("Add at least one zone (for cottages, villas or other stays).");
      if (c.nodes.some((n) => !n.name.trim())) e.push("Every building, floor and zone needs a name.");
      const codes = c.nodes.filter((n) => (isBuilding(n) || isZone(n)) && n.code).map((n) => n.code.toUpperCase());
      if (new Set(codes).size !== codes.length) e.push("Two buildings or zones have the same code.");
      if (codes.some((k) => !/^[A-Z0-9]{1,4}$/.test(k))) e.push("Codes use 1–4 letters or numbers (e.g. TA, G).");
    }
    return e;
  };
  const go = (i: number) => {
    if (i > step) {
      for (let k = step; k < i; k++) if (errors(k).length) { setTried(true); setStep(k); return; }
    }
    setTried(false);
    setStep(i);
    setMaxDone((m) => Math.max(m, i));
  };
  const save = () => {
    for (let k = 0; k < 3; k++) if (errors(k).length) { setTried(true); setStep(k); return; }
    if (st.config.version !== loadedVersion) { setStale(true); return; }
    const first = !st.config.configured;
    update((s) => { s.config = { ...c, configured: true, version: s.config.version + 1, savedAt: nowStamp() }; }, first ? "Accommodation setup saved" : `Accommodation setup updated (version ${st.config.version + 1})`);
    toast(first ? "Setup saved — now add your units" : "Setup updated");
    router.push(first ? `${base}/new` : base === "/hms/rooms" ? `${base}/configuration` : base);
  };
  const set = (fn: (c: Config) => void) => setC((old) => { const n = structuredClone(old); fn(n); return n; });
  const err = tried ? errors(step) : [];

  return (
    <Steps title={st.config.configured ? "Edit accommodation setup" : "Accommodation setup"} steps={STEPS} step={step} onStep={go} maxDone={maxDone}
      footer={<>
        <Btn disabled={step === 0} onClick={() => go(step - 1)}>Back</Btn>
        <span className="ml-auto" />
        {step < 3 ? <Btn kind="primary" onClick={() => go(step + 1)}>Continue</Btn> : <Btn kind="primary" onClick={save}>Save setup</Btn>}
      </>}>
      {stale && (
        <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#f3c4c0] bg-[#ffe7e4] px-4 py-3 text-[14.5px] text-[#a3261f]">
          <span className="flex-1">Someone else saved the setup while you were editing (now version {st.config.version}). Nothing was saved. Reload to see the latest, then make your change again.</span>
          <Btn onClick={() => { setC(structuredClone(st.config)); setLoadedVersion(st.config.version); setStale(false); }}>Reload latest</Btn>
        </div>
      )}
      {err.length > 0 && (
        <div role="alert" className="mb-4 rounded-xl border border-[#f3c4c0] bg-[#ffe7e4] px-4 py-3 text-[14.5px] text-[#a3261f]">{err.map((e) => <p key={e}>{e}</p>)}</div>
      )}

      {step === 0 && (
        <Section title="What do you rent out?" desc={`Choose every type this property has. Suggestions are for a ${pt.label}; nothing is locked.`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_TYPES.map((t) => {
              const on = c.enabled.includes(t);
              const n = used(t);
              return (
                <ChoiceCard key={t} on={on} icon={CORE_ICON[t]} title={CORE[t].label} sub={`${CORE[t].desc} ${n ? `· ${n} units exist` : ""}`}
                  badge={pt.suggest.includes(t) ? "Suggested" : undefined}
                  onClick={() => {
                    if (on && n) { toast(`${n} ${CORE[t].plural.toLowerCase()} exist — can't turn off`); return; }
                    set((d) => { d.enabled = on ? d.enabled.filter((x) => x !== t) : CORE_TYPES.filter((x) => x === t || d.enabled.includes(x)); });
                  }} />
              );
            })}
          </div>
          <p className="mt-4 text-[13.5px] text-[#4d5664]">Bungalow, Cabin, Treehouse, Glamping and other special stays are picked later when you add a unit — they use one of these engines.</p>
        </Section>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {!needFloors && !needZones && <p className="text-[15px] text-[#4d5664]">Choose a type first.</p>}
          {needFloors && (
            <Section title="Buildings & floors" desc={`For ${c.enabled.filter((t) => CORE[t].strategy === "floor").map((t) => CORE[t].plural.toLowerCase()).join(", ")}. A code like TA makes room numbers TA-101.`}
              right={<Btn onClick={() => set((d) => { d.nodes.push({ id: uid("loc"), kind: "BUILDING", name: buildings.length ? `Building ${buildings.length + 1}` : "Main Building", code: "", active: true }); })}><Plus className="size-4" /> Add building</Btn>}>
              <div className="space-y-3">
                {!buildings.length && <p className="text-[14.5px] text-[#4d5664]">No building yet.</p>}
                {buildings.map((b) => <BuildingRow key={b.id} b={b} c={c} set={set} used={nodeUsed} />)}
              </div>
            </Section>
          )}
          {needZones && (
            <Section title="Zones & blocks" desc={`For ${c.enabled.filter((t) => CORE[t].strategy === "zone").map((t) => CORE[t].plural.toLowerCase()).join(", ")}. No floors needed. Blocks are optional.`}
              right={<Btn onClick={() => set((d) => { d.nodes.push({ id: uid("loc"), kind: "ZONE", name: zones.length ? `Zone ${zones.length + 1}` : "Garden Zone", code: "", active: true }); })}><Plus className="size-4" /> Add zone</Btn>}>
              <div className="space-y-3">
                {!zones.length && <p className="text-[14.5px] text-[#4d5664]">No zone yet.</p>}
                {zones.map((z) => <ZoneRow key={z.id} z={z} c={c} set={set} used={nodeUsed} />)}
              </div>
            </Section>
          )}
        </div>
      )}

      {step === 2 && (
        <Section title="How you number units" desc="Used to suggest numbers. You can always type your own. Changing this later does not rename existing units.">
          <div className="divide-y divide-[#e3e7ec]">
            {c.enabled.map((t) => {
              const main = PRESETS.find((p) => p.core === t && p.group === "standard") ?? PRESETS.find((p) => p.slug === "custom")!;
              const leaf = leaves(c, t)[0];
              const prev = leaf ? [1, 2, 3].map((i) => codeFor(c, t, main.slug, leaf, i)?.code).filter(Boolean) : [];
              const Icon = CORE_ICON[t];
              return (
                <div key={t} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[180px_1fr_110px_110px] md:items-end">
                  <p className="flex items-center gap-2 text-[15px] font-semibold md:pb-2"><Icon className="size-[18px] text-[#4d5664]" />{CORE[t].plural}</p>
                  <Field label="Style">
                    <Select value={c.numbering[t].template} onChange={(e) => set((d) => { d.numbering[t].template = e.target.value as Config["numbering"][CoreType]["template"]; })}>
                      {TEMPLATES.filter((x) => x.for.includes(CORE[t].strategy)).map((x) => <option key={x.v} value={x.v}>{x.label} ({x.example})</option>)}
                    </Select>
                  </Field>
                  <Field label="Prefix">
                    <Input value={prefixOf(c, main.slug)} maxLength={3} onChange={(e) => set((d) => { d.prefixes[main.slug] = e.target.value.toUpperCase().replace(/[^A-Z]/g, ""); })} />
                  </Field>
                  <Field label="Digits">
                    <Select value={c.numbering[t].digits} onChange={(e) => set((d) => { d.numbering[t].digits = Number(e.target.value) as 2 | 3; })}>
                      <option value={2}>2 (01)</option><option value={3}>3 (001)</option>
                    </Select>
                  </Field>
                  <p className="text-[13.5px] text-[#4d5664] md:col-span-4 md:col-start-2">
                    {c.numbering[t].template === "custom" ? "You will type numbers yourself." : prev.length ? <>Preview: <span className="font-mono font-medium text-[#0f1720]">{prev.join(", ")}</span>{leaf && ` (${leaf.name})`}</> : "Add a location to see a preview."}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {step === 3 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Property" desc="From the Property profile — edit it there.">
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-[14.5px]">
              <dt className="text-[#4d5664]">Name</dt><dd className="font-medium">{h.name}</dd>
              <dt className="text-[#4d5664]">Property type</dt><dd className="font-medium">{pt.label}</dd>
              <dt className="text-[#4d5664]">Types</dt><dd className="font-medium">{c.enabled.map((t) => CORE[t].label).join(", ")}</dd>
            </dl>
          </Section>
          <Section title="Locations">
            <ul className="space-y-1.5 text-[14.5px]">
              {c.nodes.filter((n) => !n.parent).map((p) => (
                <li key={p.id}>
                  <span className="font-medium">{p.name}</span>{p.code && <span className="ml-1.5 rounded bg-[#e9edf2] px-1.5 font-mono text-[12.5px]">{p.code}</span>}
                  <span className="text-[#4d5664]"> · {c.nodes.filter((n) => n.parent === p.id).map((n) => n.name).join(", ") || (isZone(p) ? "no blocks" : "no floors")} <span className="text-[12px]">({kindLabel(p.kind)})</span></span>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Numbering">
            <ul className="space-y-1.5 text-[14.5px]">
              {c.enabled.map((t) => <li key={t}><span className="font-medium">{CORE[t].plural}:</span> {TEMPLATES.find((x) => x.v === c.numbering[t].template)?.label}</li>)}
            </ul>
          </Section>
          <Section title="After saving">
            <p className="text-[14.5px] text-[#4d5664]">You go straight to <b className="text-[#0f1720]">Add accommodation</b>. Locations and numbering are reused every time — you never type them again.</p>
          </Section>
        </div>
      )}
    </Steps>
  );
}

function BuildingRow({ b, c, set, used }: { b: LocNode; c: Config; set: (fn: (c: Config) => void) => void; used: (id: string) => boolean }) {
  const floors = c.nodes.filter((n) => n.parent === b.id).sort((x, y) => (x.level ?? 0) - (y.level ?? 0));
  const top = floors.length ? Math.max(...floors.map((f) => f.level ?? 0)) : 0;
  const [from, setFrom] = useState(String(top + 1));
  const [to, setTo] = useState(String(top + 3));
  const add = () => {
    const a = Math.max(0, Number(from)), z = Math.min(150, Number(to));
    if (!(z >= a)) return;
    set((d) => {
      for (let l = a; l <= z; l++) if (!d.nodes.some((n) => n.parent === b.id && n.level === l)) d.nodes.push({ id: uid("loc"), kind: "FLOOR", name: floorName(l), code: String(l), parent: b.id, level: l, active: true });
    });
    setFrom(String(z + 1)); setTo(String(z + 3));
  };
  return (
    <div className="rounded-xl border border-[#e3e7ec] p-3.5">
      <div className="flex flex-wrap items-end gap-2.5">
        <Building2 className="mb-2.5 size-5 text-[#4d5664]" />
        <div className="min-w-[180px] flex-1"><Field label="Building name"><Input value={b.name} onChange={(e) => set((d) => { d.nodes.find((n) => n.id === b.id)!.name = e.target.value; })} /></Field></div>
        <div className="w-[130px]"><Field label="Kind"><Select value={b.kind} onChange={(e) => set((d) => { d.nodes.find((n) => n.id === b.id)!.kind = e.target.value as LocKindCode; })}>{BUILDING_KINDS.map((k) => <option key={k} value={k}>{kindLabel(k)}</option>)}</Select></Field></div>
        <div className="w-[110px]"><Field label="Code (optional)"><Input value={b.code} maxLength={4} placeholder="TA" onChange={(e) => set((d) => { d.nodes.find((n) => n.id === b.id)!.code = e.target.value.toUpperCase(); })} /></Field></div>
        <Btn kind="ghost" aria-label={`Remove ${b.name}`} disabled={used(b.id)} title={used(b.id) ? "Has units" : undefined} onClick={() => set((d) => { d.nodes = d.nodes.filter((n) => n.id !== b.id && n.parent !== b.id); })}><X className="size-4" /></Btn>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {floors.map((f) => (
          <span key={f.id} className="inline-flex items-center gap-1 rounded-lg bg-[#e9edf2] py-1 pl-2.5 pr-1 text-[13.5px] font-medium">
            {f.name}
            <button aria-label={`Remove ${f.name}`} disabled={used(f.id)} title={used(f.id) ? "Has units" : undefined} onClick={() => set((d) => { d.nodes = d.nodes.filter((n) => n.id !== f.id); })} className="grid size-5 place-items-center rounded hover:bg-white disabled:opacity-30"><X className="size-3" /></button>
          </span>
        ))}
        {!floors.length && <span className="text-[13.5px] text-[#4d5664]">No floors yet.</span>}
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="w-[96px]"><Field label="Floors from"><Input type="number" min={0} max={150} value={from} onChange={(e) => setFrom(e.target.value)} /></Field></div>
        <div className="w-[96px]"><Field label="to"><Input type="number" min={0} max={150} value={to} onChange={(e) => setTo(e.target.value)} /></Field></div>
        <Btn onClick={add}><Plus className="size-4" /> Add floors</Btn>
        <span className="pb-2.5 text-[12.5px] text-[#4d5664]">0 = ground floor</span>
      </div>
    </div>
  );
}

function ZoneRow({ z, c, set, used }: { z: LocNode; c: Config; set: (fn: (c: Config) => void) => void; used: (id: string) => boolean }) {
  const blocks = c.nodes.filter((n) => n.parent === z.id);
  const [name, setName] = useState("");
  return (
    <div className="rounded-xl border border-[#e3e7ec] p-3.5">
      <div className="flex flex-wrap items-end gap-2.5">
        <MapPin className="mb-2.5 size-5 text-[#4d5664]" />
        <div className="min-w-[180px] flex-1"><Field label="Zone name"><Input value={z.name} onChange={(e) => set((d) => { d.nodes.find((n) => n.id === z.id)!.name = e.target.value; })} /></Field></div>
        <div className="w-[130px]"><Field label="Kind"><Select value={z.kind} onChange={(e) => set((d) => { d.nodes.find((n) => n.id === z.id)!.kind = e.target.value as LocKindCode; })}>{ZONE_KINDS.map((k) => <option key={k} value={k}>{kindLabel(k)}</option>)}</Select></Field></div>
        <div className="w-[110px]"><Field label="Code (optional)"><Input value={z.code} maxLength={4} placeholder="G" onChange={(e) => set((d) => { d.nodes.find((n) => n.id === z.id)!.code = e.target.value.toUpperCase(); })} /></Field></div>
        <Btn kind="ghost" aria-label={`Remove ${z.name}`} disabled={used(z.id)} title={used(z.id) ? "Has units" : undefined} onClick={() => set((d) => { d.nodes = d.nodes.filter((n) => n.id !== z.id && n.parent !== z.id); })}><X className="size-4" /></Btn>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {blocks.map((f) => (
          <span key={f.id} className="inline-flex items-center gap-1 rounded-lg bg-[#e9edf2] py-1 pl-2.5 pr-1 text-[13.5px] font-medium">
            {f.name}
            <button aria-label={`Remove ${f.name}`} disabled={used(f.id)} onClick={() => set((d) => { d.nodes = d.nodes.filter((n) => n.id !== f.id); })} className="grid size-5 place-items-center rounded hover:bg-white disabled:opacity-30"><X className="size-3" /></button>
          </span>
        ))}
        <form className={clsx("flex items-center gap-1.5")} onSubmit={(e) => { e.preventDefault(); const v = name.trim(); if (!v) return; set((d) => { d.nodes.push({ id: uid("loc"), kind: "BLOCK", name: v, code: "", parent: z.id, active: true }); }); setName(""); }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add block (optional)" aria-label={`Add block to ${z.name}`} className="h-8 w-[170px] rounded-lg border border-[#d3d8df] px-2.5 text-[13.5px] outline-none focus:border-[#b11c29]" />
          <Btn type="submit" className="h-8 px-3" disabled={!name.trim()}>Add</Btn>
        </form>
      </div>
    </div>
  );
}
