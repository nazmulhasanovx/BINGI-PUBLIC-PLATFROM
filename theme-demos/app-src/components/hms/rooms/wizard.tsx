"use client";
// Add accommodation — one 5-step wizard for all 14 cards / 6 Core Types (spec 02-accommodation-flows/00).
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDown, Lock, Plus, Search, X } from "lucide-react";
import { useProperty } from "../property";
import {
  BATCH_MAX, codeFor, leaves, node, nodePath, nowStamp, sameCode, uid, useRooms,
  type Category, type Config, type LocNode, type Pick, type RoomsState, type Unit,
} from "@/lib/rooms/store";
import { CODE_RE, CORE, PRESETS, coreChoices, preset as presetOf, youtubeId, type CoreType, type Preset, type PresetSlug } from "@/lib/rooms/catalog";
import { Btn, Field, Input, Select } from "../staff/ui";
import { AmenityPicker, ChoiceCard, PRESET_ICON, Section, Steps, money, useToast } from "./parts";
import { Hydrated, useRoomsBase } from "./parts";

const STEPS = ["Type", "Category", "Location & units", "Details & pricing", "Review"];
type Over = { rate?: number; video?: Unit["video"]; videoUrl?: string; note?: string };

const noop = () => () => {};
export function AddPage() {
  const h = useProperty();
  return <Hydrated><AddPageInner key={h.slug} /></Hydrated>;
}

function AddPageInner() {
  const q = useSearchParams();
  const base = useRoomsBase();
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const h = useProperty();
  const { st } = useRooms(h);
  if (!ready) return null;
  if (!st.config.configured) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <p className="text-[18px] font-semibold">Finish the one-time setup first</p>
          <Link href={`${base}/setup`} className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#b11c29] px-4 text-[14.5px] font-medium text-white">Start setup</Link>
        </div>
      </div>
    );
  }
  // Read the query through the router (not window.location): on a client-side jump the URL may not be updated yet.
  return <Wizard key={`${h.slug}|${q.get("draft")}|${q.get("type")}|${q.get("category")}`} draftId={q.get("draft")} type={q.get("type")} category={q.get("category")} />;
}

const blankCat = (core: CoreType, p: PresetSlug): Category => ({
  id: uid("cat"), name: "", core, preset: p, bed: p === "capsule" ? "1 Pod bed" : "1 King bed", maxAdults: p === "capsule" ? 1 : 2, maxChildren: 0, approval: "pending",
  amenities: ["Free Wi-Fi"], baseRate: 0, created: nowStamp(),
});

function Wizard({ draftId, type, category }: { draftId: string | null; type: string | null; category: string | null }) {
  const base = useRoomsBase();
  const h = useProperty();
  const { st, update, createUnits } = useRooms(h);
  const router = useRouter();
  const toast = useToast();
  const draft = draftId ? st.drafts.find((d) => d.id === draftId) : undefined;
  const initCat = draft?.category ?? category ?? undefined;
  const existingInit = initCat ? st.categories.find((c) => c.id === initCat) : undefined;
  const initPreset = (draft?.preset ?? existingInit?.preset ?? (PRESETS.some((p) => p.slug === type) ? (type as PresetSlug) : undefined));

  const [p, setP] = useState<PresetSlug | undefined>(initPreset);
  const [core, setCore] = useState<CoreType | undefined>(draft?.core ?? existingInit?.core ?? (initPreset ? presetOf(initPreset).core : undefined));
  const [catId, setCatId] = useState<string | "new" | undefined>(existingInit?.id);
  const [cat, setCat] = useState<Category | undefined>();
  const [picks, setPicks] = useState<Pick[]>(draft?.picks ?? []);
  const [over, setOver] = useState<Record<string, Over>>({});
  const [step, setStep] = useState(draft ? 2 : existingInit ? 2 : initPreset ? 1 : 0);
  const [maxDone, setMaxDone] = useState(step);
  const [tried, setTried] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const pr = p ? presetOf(p) : undefined;
  const existing = catId && catId !== "new" ? st.categories.find((c) => c.id === catId) : undefined;
  const active: Category | undefined = existing ?? (catId === "new" ? cat : undefined);

  const choose = (np: Preset) => {
    setP(np.slug);
    setCore(np.core);
    if (catId && catId !== "new" && st.categories.find((c) => c.id === catId)?.core !== np.core) setCatId(undefined);
    if (cat && cat.core !== np.core) setCat(undefined);
    setPicks([]);
  };

  const errors = (i: number): string[] => {
    const e: string[] = [];
    if (i === 0) {
      if (!p || !core) e.push("Choose what you are adding.");
      else if (!st.config.enabled.includes(core)) e.push(`${CORE[core].label} is not turned on yet — turn it on below.`);
    }
    if (i === 1) {
      if (!catId) e.push("Choose a category or create a new one.");
      if (catId === "new" && cat) {
        if (!cat.name.trim()) e.push("Category name is required.");
        else if (st.categories.some((c) => c.name.trim().toLowerCase() === cat.name.trim().toLowerCase())) e.push(`A category called “${cat.name.trim()}” already exists — pick it from the list instead.`);
        if (!cat.bed.trim()) e.push("Bed setup is required.");
        if (!(cat.maxAdults >= 1)) e.push("Max adults must be at least 1.");
        if (!(cat.baseRate > 0)) e.push("Base price is required.");
        if (cat.video && !youtubeId(cat.video)) e.push("Video link must be a YouTube link (or leave it empty).");
      }
    }
    if (i === 2) {
      if (!picks.length) e.push("Select at least one unit number.");
      const taken = picks.filter((k) => st.units.some((u) => sameCode(u.code, k.code)));
      if (taken.length) e.push(`Already exists: ${taken.map((k) => k.code).join(", ")} — remove them.`);
    }
    if (i === 3) {
      for (const k of picks) {
        const o = over[k.code];
        if (o?.rate !== undefined && !(o.rate > 0)) e.push(`${k.code}: price must be more than 0.`);
        if (o?.video === "replace" && !youtubeId(o.videoUrl ?? "")) e.push(`${k.code}: add a valid YouTube link or choose “Same as category”.`);
      }
    }
    return e;
  };
  const go = (i: number) => {
    if (i > step) for (let k = step; k < i; k++) if (errors(k).length) { setTried(true); setStep(k); return; }
    if (i === 1 && !catId && core && !st.categories.some((c) => c.core === core)) { setCatId("new"); setCat(blankCat(core, p!)); }
    setTried(false); setConflicts([]); setStep(i); setMaxDone((m) => Math.max(m, i));
  };
  const err = tried ? errors(step) : [];

  const finish = (status: Unit["status"]) => {
    for (let k = 0; k < 4; k++) if (errors(k).length) { setTried(true); setStep(k); return; }
    if (!active) return;
    setBusy(true);
    const c = { ...active, name: active.name.trim(), core: core!, preset: p! };
    const r = createUnits(picks, c, status, over);
    setBusy(false);
    if (!r.ok) { setConflicts(r.conflicts); return; }
    if (draft) update((s) => { s.drafts = s.drafts.filter((d) => d.id !== draft.id); });
    toast(`${picks.length} ${picks.length === 1 ? "unit" : "units"} ${status === "published" ? "published" : "saved as draft (not bookable)"}`);
    router.push(base);
  };
  const saveSetupDraft = () => {
    if (!p || !core) { setTried(true); setStep(0); return; }
    const keepCat = catId === "new" && cat && cat.name.trim() && !errors(1).length ? cat : undefined;
    update((s) => {
      if (keepCat && !s.categories.some((c) => c.id === keepCat.id)) s.categories.push({ ...keepCat, name: keepCat.name.trim(), core, preset: p });
      const d = { id: draft?.id ?? uid("draft"), savedAt: nowStamp(), preset: p, core, category: existing?.id ?? keepCat?.id, picks };
      s.drafts = [d, ...s.drafts.filter((x) => x.id !== d.id)];
    }, `Setup draft saved · ${presetOf(p).label}${picks.length ? ` (${picks.length} numbers, not reserved)` : ""}`);
    toast("Setup draft saved — numbers are not reserved");
    router.push(base);
  };

  return (
    <Steps title={`Add ${pr ? pr.label.toLowerCase() : "room / accommodation"}`} steps={STEPS} step={step} onStep={go} maxDone={maxDone}
      footer={<>
        <Btn disabled={step === 0} onClick={() => go(step - 1)}>Back</Btn>
        {step === 2 && <span className="text-[14px] font-medium text-[#4d5664] lg:hidden" aria-live="polite">{picks.length} selected</span>}
        <span className="ml-auto" />
        {step > 0 && <Btn kind="ghost" className="px-3 sm:px-4" aria-label="Save setup draft" onClick={saveSetupDraft}><span>Save<span className="hidden sm:inline"> setup draft</span></span></Btn>}
        {step < 4 ? <Btn kind="primary" onClick={() => go(step + 1)}>Continue</Btn> : <>
          <Btn disabled={busy} onClick={() => finish("draft")}>Create as draft</Btn>
          <Btn kind="primary" disabled={busy || active?.approval !== "approved"} title={active?.approval !== "approved" ? "Category waits for BinGi approval" : undefined} onClick={() => finish("published")}>Publish {picks.length} {picks.length === 1 ? "unit" : "units"}</Btn>
        </>}
      </>}>
      {(err.length > 0 || conflicts.length > 0) && (
        <div role="alert" className="mb-4 rounded-xl border border-[#f3c4c0] bg-[#ffe7e4] px-4 py-3 text-[14.5px] text-[#a3261f]">
          {conflicts.length > 0 && <p className="font-semibold">Nothing was created. Fix these and try again:</p>}
          {[...err, ...conflicts].map((e) => <p key={e}>{e}</p>)}
        </div>
      )}
      {step === 0 && <TypeStep p={p} core={core} choose={choose} setCore={setCore} st={st} enable={(t) => update((s) => { if (!s.config.enabled.includes(t)) s.config.enabled.push(t); s.config.version += 1; }, `${CORE[t].label} turned on`)} />}
      {step === 1 && core && p && <CategoryStep st={st} core={core} p={p} catId={catId} setCatId={setCatId} cat={cat} setCat={setCat} />}
      {step === 2 && core && p && active && <UnitsStep st={st} core={core} p={p} cat={active} picks={picks} setPicks={setPicks} addNode={(n) => update((s) => { s.config.nodes.push(n); }, `Location added: ${n.name}`)} />}
      {step === 3 && active && <DetailsStep st={st} cat={active} picks={picks} over={over} setOver={setOver} editCat={() => go(1)} />}
      {step === 4 && active && core && p && <ReviewStep st={st} cat={active} core={core} p={p} picks={picks} over={over} isNew={catId === "new"} />}
    </Steps>
  );
}

// ---------------- 1. Type ----------------
function TypeStep({ p, core, choose, setCore, st, enable }: { p?: PresetSlug; core?: CoreType; choose: (p: Preset) => void; setCore: (c: CoreType) => void; st: RoomsState; enable: (t: CoreType) => void }) {
  const [q, setQ] = useState("");
  const [special, setSpecial] = useState(true);
  const match = (x: Preset) => !q || `${x.label} ${x.desc}`.toLowerCase().includes(q.toLowerCase());
  const groups: { id: Preset["group"]; label: string }[] = [{ id: "standard", label: "Standard stays" }, { id: "specialty", label: "Specialty stays" }, { id: "other", label: "Other" }];
  const pr = p ? presetOf(p) : undefined;
  return (
    <div className="space-y-4">
      <Section title="What are you adding?" desc="Specialty stays are presets — they use one of six booking engines, so availability and pricing stay safe."
        right={<label className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-3 sm:w-[240px]"><Search className="size-4 text-[#4d5664]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search types" aria-label="Search types" className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none" /></label>}>
        <div className="space-y-5">
          {groups.map((g) => {
            const items = PRESETS.filter((x) => x.group === g.id && match(x));
            if (!items.length) return null;
            const collapsible = g.id === "specialty";
            const open = !collapsible || special || !!q;
            return (
              <div key={g.id}>
                {collapsible ? (
                  <button onClick={() => setSpecial((s) => !s)} aria-expanded={open} className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-[#4d5664]">{g.label} <ChevronDown className={clsx("size-4 transition-transform", !open && "-rotate-90")} /></button>
                ) : <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#4d5664]">{g.label}</p>}
                {open && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((x) => (
                      <ChoiceCard key={x.slug} on={p === x.slug} onClick={() => choose(x)} icon={PRESET_ICON[x.slug]} title={x.label} sub={`${x.desc} · ${x.example}`}
                        badge={!st.config.enabled.includes(x.core) ? "Off" : x.group !== "standard" ? CORE[x.core].label : undefined} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>
      {pr && core && (
        <Section title={`${pr.label} — how it is sold`}>
          <div className="grid gap-4 md:grid-cols-2">
            {coreChoices(pr).length > 1 ? (
              <Field label="Works as" hint="Pick the engine that matches the real building. Changing it later needs a booking review.">
                <Select value={core} onChange={(e) => setCore(e.target.value as CoreType)}>
                  {coreChoices(pr).map((c) => <option key={c} value={c}>{CORE[c].label} — {CORE[c].inventory.toLowerCase()}</option>)}
                </Select>
              </Field>
            ) : <div><p className="text-[14px] font-medium">Booking engine</p><p className="mt-1 text-[15px]">{CORE[core].label} · {CORE[core].inventory}</p></div>}
            <div className="text-[14px] text-[#4d5664]">
              <p><b className="text-[#0f1720]">Location:</b> {CORE[core].strategy === "floor" ? "Building → Floor" : "Zone → optional Block"}</p>
              <p className="mt-1"><b className="text-[#0f1720]">Numbers like:</b> {pr.example}</p>
            </div>
          </div>
          {!st.config.enabled.includes(core) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#fdf6e7] px-4 py-3 text-[14.5px] text-[#7a4a0b]">
              <span className="flex-1">{CORE[core].label} is not turned on for this property yet.</span>
              <Btn onClick={() => enable(core)}>Turn on {CORE[core].label}</Btn>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

// ---------------- 2. Category ----------------
function CategoryStep({ st, core, p, catId, setCatId, cat, setCat }: { st: RoomsState; core: CoreType; p: PresetSlug; catId?: string; setCatId: (v: string | "new") => void; cat?: Category; setCat: (c: Category) => void }) {
  const list = st.categories.filter((c) => c.core === core).sort((a, b) => Number(b.preset === p) - Number(a.preset === p));
  const count = (id: string) => st.units.filter((u) => u.category === id).length;
  const pod = p === "capsule";
  const c = cat ?? blankCat(core, p);
  const set = (patch: Partial<Category>) => setCat({ ...c, ...patch });
  const vid = c.video ? youtubeId(c.video) : null;
  return (
    <div className="space-y-4">
      <Section title="Category" desc="A category holds everything units share — beds, guests, amenities, photos, video and base price. You set it once.">
        <div role="radiogroup" aria-label="Category" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((x) => (
            <button key={x.id} role="radio" aria-checked={catId === x.id} onClick={() => setCatId(x.id)}
              className={clsx("rounded-2xl border p-3.5 text-left", catId === x.id ? "border-[#b11c29] bg-[#ffe7e4] shadow-[0_0_0_3px_rgb(216_55_46/0.12)]" : "border-[#e3e7ec] bg-white hover:border-[#858c97]")}>
              <span className="block text-[15px] font-semibold">{x.name}</span>
              <span className="mt-0.5 block text-[13.5px] text-[#4d5664]">৳{money(x.baseRate)} / night · {count(x.id)} units · {presetOf(x.preset).label}{x.approval !== "approved" ? " · waiting for approval" : ""}</span>
            </button>
          ))}
          <button role="radio" aria-checked={catId === "new"} onClick={() => { setCatId("new"); if (!cat) setCat(blankCat(core, p)); }}
            className={clsx("flex items-center gap-3 rounded-2xl border border-dashed p-3.5 text-left", catId === "new" ? "border-[#b11c29] bg-[#ffe7e4]" : "border-[#858c97] bg-white hover:bg-[#f4f6f8]")}>
            <span className="grid size-9 place-items-center rounded-xl bg-[#e9edf2]"><Plus className="size-5" /></span>
            <span><span className="block text-[15px] font-semibold">Create new category</span><span className="block text-[13.5px] text-[#4d5664]">e.g. {pod ? "Single Pod" : core === "VILLA" ? "Pool Villa" : core === "COTTAGE" ? "Garden Cottage" : core === "APARTMENT" ? "Two-Bedroom Flat" : "Deluxe Twin"}</span></span>
          </button>
        </div>
      </Section>

      {catId === "new" && (
        <Section title="New category" desc="Saved together with the units in the last step.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category name"><Input value={c.name} onChange={(e) => set({ name: e.target.value })} placeholder={`e.g. ${pod ? "Single Pod" : core === "VILLA" ? "Pool Villa" : core === "COTTAGE" ? "Garden Cottage" : core === "APARTMENT" ? "Two-Bedroom Flat" : core === "OTHER" ? "Canopy Treehouse" : "Deluxe Twin"}`} /></Field>
            <Field label="Beds"><Input value={c.bed} onChange={(e) => set({ bed: e.target.value })} placeholder="1 King bed" /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Max adults"><Input type="number" min={1} value={c.maxAdults} onChange={(e) => set({ maxAdults: Number(e.target.value) })} /></Field>
              <Field label="Max children"><Input type="number" min={0} value={c.maxChildren} onChange={(e) => set({ maxChildren: Number(e.target.value) })} /></Field>
              <Field label="Size (sqft)"><Input type="number" min={0} value={c.sizeSqft ?? ""} onChange={(e) => set({ sizeSqft: e.target.value ? Number(e.target.value) : undefined })} /></Field>
            </div>
            {(core === "VILLA" || core === "APARTMENT" || core === "COTTAGE") && (
              <Field label="Bedrooms"><Input type="number" min={0} value={c.bedrooms ?? ""} onChange={(e) => set({ bedrooms: e.target.value ? Number(e.target.value) : undefined })} placeholder="0 = studio" /></Field>
            )}
            <Field label="Base price per night (৳)" hint="Starting price. Date-wise rates and offers come from Rate Plans.">
              <Input type="number" min={0} value={c.baseRate || ""} onChange={(e) => set({ baseRate: Number(e.target.value) })} placeholder={pod ? "e.g. 1200" : "e.g. 6500"} />
            </Field>
            <Field label="YouTube video (optional)" hint={c.video ? (vid ? "Valid YouTube video" : "Only YouTube links (youtube.com/watch, youtu.be, shorts)") : "Never required. Plays only when a guest taps it."}>
              <Input value={c.video ?? ""} onChange={(e) => set({ video: e.target.value || undefined })} placeholder="https://youtu.be/…" aria-invalid={!!c.video && !vid} />
            </Field>
            <div className="md:col-span-2"><Field label="Amenities" group><AmenityPicker value={c.amenities} onChange={(a) => set({ amenities: a })} /></Field></div>
            <p className="text-[13.5px] text-[#4d5664] md:col-span-2">Photos are added in the category after saving (the photo library uploads to the HMS media store).</p>
          </div>
        </Section>
      )}
    </div>
  );
}

// ---------------- 3. Location & units (full number library) ----------------
type Mode = "pick" | "generate" | "range" | "manual";
function UnitsStep({ st, core, p, cat, picks, setPicks, addNode }: { st: RoomsState; core: CoreType; p: PresetSlug; cat: Category; picks: Pick[]; setPicks: (v: Pick[]) => void; addNode: (n: LocNode) => void }) {
  const c = st.config;
  const ls = leaves(c, core);
  const [mode, setMode] = useState<Mode>("pick");
  const [leafId, setLeafId] = useState(ls[0]?.id ?? "");
  const [n, setN] = useState("5");
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("5");
  const [manual, setManual] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const custom = c.numbering[core].template === "custom";
  const taken = (code: string) => st.units.find((u) => sameCode(u.code, code));
  const picked = (code: string) => picks.find((k) => sameCode(k.code, code));
  const leaf = node(c, leafId) ?? ls[0];

  const freeFrom = (lf: LocNode, count: number, start = 1): Pick[] => {
    const out: Pick[] = [];
    for (let i = start; out.length < count && i < start + 2000; i++) {
      const k = codeFor(c, core, p, lf, i);
      if (!k) break;
      if (!taken(k.code) && !picked(k.code) && !out.some((o) => sameCode(o.code, k.code))) out.push({ node: lf.id, ...k });
    }
    return out;
  };
  const add = (more: Pick[], skipped: string[] = []) => {
    const room = Math.max(0, BATCH_MAX - picks.length);
    if (more.length > room) { skipped = [...skipped, `${more.length - room} more (max ${BATCH_MAX} in one batch)`]; more = more.slice(0, room); }
    setPicks([...picks, ...more]);
    setNote(skipped.length ? `Not added (already exist or already selected): ${skipped.join(", ")}` : more.length ? `Added ${more.length}: ${more.map((m) => m.code).slice(0, 8).join(", ")}${more.length > 8 ? "…" : ""}` : "Nothing new to add.");
  };

  if (!ls.length) return <AddLocation c={c} core={core} addNode={addNode} />;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Section title="Choose unit numbers" desc={`${cat.name} · ${CORE[core].strategy === "floor" ? "pick numbers on any floor, in one go" : "pick numbers in any zone"}`}>
        <div role="tablist" aria-label="How to choose" className="mb-4 inline-flex flex-wrap rounded-xl bg-[#e9edf2] p-1">
          {([["pick", "Pick from list"], ["generate", "Next N"], ["range", "Range"], ["manual", "Type numbers"]] as [Mode, string][]).map(([v, l]) => (
            <button key={v} role="tab" aria-selected={mode === v} onClick={() => { setMode(v); setNote(null); }} className={clsx("rounded-lg px-3.5 py-1.5 text-[14px] font-medium", mode === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>
          ))}
        </div>

        {mode !== "pick" && (
          <div className="mb-3 max-w-[360px]"><Field label="Location"><Select value={leaf?.id} onChange={(e) => setLeafId(e.target.value)}>{ls.map((l) => <option key={l.id} value={l.id}>{nodePath(c, l.id)}</option>)}</Select></Field></div>
        )}
        {mode === "pick" && (custom
          ? <p className="text-[14.5px] text-[#4d5664]">This type uses manual numbering — use <b>Type numbers</b>.</p>
          : <>
            <label className="mb-3 flex h-10 max-w-[300px] items-center gap-2 rounded-xl border border-[#d3d8df] bg-white px-3"><Search className="size-4 text-[#4d5664]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a number" aria-label="Find a number" className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none" /></label>
            <div className="space-y-2">{ls.map((l, i) => <LeafGrid key={l.id} c={c} core={core} p={p} leaf={l} startOpen={i < 4} q={q} taken={taken} picked={picked} toggle={(k) => setPicks(picked(k.code) ? picks.filter((x) => !sameCode(x.code, k.code)) : [...picks, k])} />)}</div>
          </>)}
        {mode === "generate" && leaf && !custom && (
          <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); add(freeFrom(leaf, Math.min(100, Math.max(1, Number(n))))); }}>
            <div className="w-[120px]"><Field label="How many"><Input type="number" min={1} max={100} value={n} onChange={(e) => setN(e.target.value)} /></Field></div>
            <Btn type="submit">Add next {Math.min(100, Math.max(1, Number(n) || 1))} free numbers</Btn>
          </form>
        )}
        {mode === "range" && leaf && !custom && (
          <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => {
            e.preventDefault();
            const a = Math.max(1, Number(from)), z = Math.min(a + 199, Number(to));
            const more: Pick[] = [], skipped: string[] = [];
            for (let i = a; i <= z; i++) { const k = codeFor(c, core, p, leaf, i); if (!k) break; if (taken(k.code) || picked(k.code)) skipped.push(k.code); else more.push({ node: leaf.id, ...k }); }
            add(more, skipped);
          }}>
            <div className="w-[100px]"><Field label="From no."><Input type="number" min={1} value={from} onChange={(e) => setFrom(e.target.value)} /></Field></div>
            <div className="w-[100px]"><Field label="To no."><Input type="number" min={1} value={to} onChange={(e) => setTo(e.target.value)} /></Field></div>
            <Btn type="submit">Add {codeFor(c, core, p, leaf, Math.max(1, Number(from)))?.code} – {codeFor(c, core, p, leaf, Math.max(1, Number(to)))?.code}</Btn>
          </form>
        )}
        {(mode === "generate" || mode === "range") && custom && <p className="text-[14.5px] text-[#4d5664]">Manual numbering — use <b>Type numbers</b>.</p>}
        {mode === "manual" && leaf && (
          <form className="space-y-2" onSubmit={(e) => {
            e.preventDefault();
            const b = CORE[core].strategy === "floor" ? node(c, leaf.parent) : undefined;
            const more: Pick[] = [], skipped: string[] = [], bad: string[] = [];
            for (const raw of manual.split(/[\s,]+/).filter(Boolean)) {
              const t = raw.toUpperCase();
              if (!CODE_RE.test(t)) { bad.push(raw); continue; }
              const code = b?.code && !t.startsWith(`${b.code}-`) ? `${b.code}-${t}` : t;
              if (taken(code) || picked(code) || more.some((m) => sameCode(m.code, code))) skipped.push(code); else more.push({ node: leaf.id, local: t, code });
            }
            add(more, [...skipped, ...bad.map((x) => `${x} (invalid)`)]);
            if (more.length) setManual("");
          }}>
            <Field label="Numbers" hint="Separate with commas or spaces, e.g. 101, 103, SKY-501. Letters, numbers and dashes only."><Input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="101, 103, 105" /></Field>
            <Btn type="submit" disabled={!manual.trim()}>Add numbers</Btn>
          </form>
        )}
        {note && <p role="status" className="mt-3 text-[14px] text-[#4d5664]">{note}</p>}
      </Section>

      <aside className="lg:sticky lg:top-0 lg:self-start">
        <Section title={`Selected (${picks.length})`} right={picks.length > 0 ? <button onClick={() => { setPicks([]); setNote(null); }} className="text-[14px] font-medium text-[#b11c29]">Clear</button> : undefined}>
          {!picks.length ? <p className="text-[14px] text-[#4d5664]">Nothing selected yet.</p> : (
            <>
              <ul className="flex max-h-[280px] flex-wrap gap-1.5 overflow-y-auto" aria-label="Selected units">
                {picks.map((k) => (
                  <li key={k.code} className="inline-flex items-center gap-1 rounded-lg bg-[#ffe7e4] py-1 pl-2.5 pr-1 font-mono text-[13.5px] font-medium text-[#8e1621]">
                    {k.code}<button aria-label={`Remove ${k.code}`} onClick={() => setPicks(picks.filter((x) => x.code !== k.code))} className="grid size-5 place-items-center rounded hover:bg-white"><X className="size-3" /></button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12.5px] text-[#4d5664]">Not reserved until you create them. Another staff member can still use these numbers before you finish.</p>
            </>
          )}
        </Section>
      </aside>
    </div>
  );
}

function LeafGrid({ c, core, p, leaf, startOpen, q, taken, picked, toggle }: { c: Config; core: CoreType; p: PresetSlug; leaf: LocNode; startOpen: boolean; q: string; taken: (code: string) => Unit | undefined; picked: (code: string) => Pick | undefined; toggle: (k: Pick) => void }) {
  const [open, setOpen] = useState(startOpen);
  const [count, setCount] = useState(12);
  const slots = useMemo(() => {
    const out: (Pick & { unit?: Unit })[] = [];
    for (let i = 1; i <= count; i++) { const k = codeFor(c, core, p, leaf, i); if (!k) break; out.push({ node: leaf.id, ...k, unit: taken(k.code) }); }
    return out;
  }, [c, core, p, leaf, count, taken]);
  const shown = q ? slots.filter((s) => s.code.toLowerCase().includes(q.toLowerCase())) : slots;
  const sel = slots.filter((s) => picked(s.code)?.node === leaf.id).length;
  if (q && !shown.length) return null;
  return (
    <div className="rounded-xl border border-[#e3e7ec]">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open || !!q} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[14.5px] font-medium">
        <ChevronDown className={clsx("size-4 transition-transform", !(open || q) && "-rotate-90")} />{nodePath(c, leaf.id)}
        {sel > 0 && <span className="ml-auto rounded-md bg-[#ffe7e4] px-2 py-0.5 text-[12.5px] text-[#8e1621]">{sel} selected</span>}
      </button>
      {(open || q) && (
        <div className="border-t border-[#e3e7ec] p-3">
          <div className="flex flex-wrap gap-1.5">
            {shown.map((s) => {
              const pk = picked(s.code);
              const elsewhere = pk && pk.node !== leaf.id;
              const disabled = !!s.unit || !!elsewhere;
              return (
                <button key={s.code} type="button" disabled={disabled} aria-pressed={!!pk && !elsewhere} onClick={() => toggle({ node: leaf.id, local: s.local, code: s.code })}
                  title={s.unit ? `${s.code} exists (${s.unit.status})` : elsewhere ? `Picked in ${nodePath(c, pk.node)}` : undefined}
                  className={clsx("inline-flex min-w-[64px] items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 font-mono text-[13.5px]",
                    s.unit ? "border-[#e3e7ec] bg-[#e9edf2] text-[#80869a]" : elsewhere ? "border-dashed border-[#d3d8df] text-[#80869a]" : pk ? "border-[#b11c29] bg-[#b11c29] font-semibold text-white" : "border-[#e3e7ec] bg-white hover:border-[#858c97]")}>
                  {s.unit && <Lock className="size-3" />}{s.code}
                </button>
              );
            })}
          </div>
          {!q && count < 99 && <button onClick={() => setCount((x) => Math.min(99, x + 12))} className="mt-2.5 text-[13.5px] font-medium text-[#b11c29]">Show more numbers</button>}
          <p className="mt-2 flex flex-wrap gap-3 text-[12px] text-[#4d5664]"><span className="inline-flex items-center gap-1"><Lock className="size-3" /> exists</span><span>Dashed = picked in another location</span></p>
        </div>
      )}
    </div>
  );
}

/** Focused "add a location" panel when the type has nowhere to go yet. Selections stay in the wizard. */
function AddLocation({ c, core, addNode }: { c: Config; core: CoreType; addNode: (n: LocNode) => void }) {
  const floor = CORE[core].strategy === "floor";
  const buildings = c.nodes.filter((n) => ["BUILDING", "TOWER", "WING"].includes(n.kind) && n.active);
  const [b, setB] = useState(buildings[0]?.id ?? "new");
  const [bName, setBName] = useState("Main Building");
  const [level, setLevel] = useState("1");
  const [zone, setZone] = useState(core === "VILLA" ? "Villa Zone" : core === "COTTAGE" ? "Garden Zone" : "Outdoor Zone");
  return (
    <Section title={floor ? "Add a floor first" : "Add a zone first"} desc={`${CORE[core].plural} need a ${floor ? "building and floor" : "zone"}. It is saved to your setup and you continue right here.`}>
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => {
        e.preventDefault();
        if (floor) {
          let bid = b;
          if (b === "new") { bid = uid("loc"); addNode({ id: bid, kind: "BUILDING", name: bName.trim() || "Main Building", code: "", active: true }); }
          const l = Math.max(0, Number(level));
          addNode({ id: uid("loc"), kind: "FLOOR", name: l === 0 ? "Ground floor" : `Floor ${l}`, code: String(l), parent: bid, level: l, active: true });
        } else addNode({ id: uid("loc"), kind: "ZONE", name: zone.trim() || "Zone", code: "", active: true });
      }}>
        {floor ? <>
          <div className="w-[220px]"><Field label="Building"><Select value={b} onChange={(e) => setB(e.target.value)}>{buildings.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}<option value="new">+ New building</option></Select></Field></div>
          {b === "new" && <div className="w-[200px]"><Field label="Building name"><Input value={bName} onChange={(e) => setBName(e.target.value)} /></Field></div>}
          <div className="w-[110px]"><Field label="Floor"><Input type="number" min={0} value={level} onChange={(e) => setLevel(e.target.value)} /></Field></div>
        </> : <div className="w-[240px]"><Field label="Zone name"><Input value={zone} onChange={(e) => setZone(e.target.value)} /></Field></div>}
        <Btn kind="primary" type="submit"><Plus className="size-4" /> Add and continue</Btn>
      </form>
    </Section>
  );
}

// ---------------- 4. Details & pricing ----------------
function DetailsStep({ st, cat, picks, over, setOver, editCat }: { st: RoomsState; cat: Category; picks: Pick[]; over: Record<string, Over>; setOver: (o: Record<string, Over>) => void; editCat: () => void }) {
  const set = (code: string, patch: Over) => setOver({ ...over, [code]: { ...over[code], ...patch } });
  const unit = "night";
  return (
    <div className="space-y-4">
      <Section title={`From the category: ${cat.name}`} desc="Every unit gets these. You don&apos;t enter them again." right={<Btn onClick={editCat}>Edit category</Btn>}>
        <dl className="grid gap-x-6 gap-y-2 text-[14.5px] sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-[#4d5664]">Base price</dt><dd className="font-semibold">৳{money(cat.baseRate)} / {unit}</dd></div>
          <div><dt className="text-[#4d5664]">Guests</dt><dd className="font-medium">{cat.maxAdults} {cat.maxAdults === 1 ? "adult" : "adults"}{cat.maxChildren ? ` + ${cat.maxChildren} children` : ""}</dd></div>
          <div><dt className="text-[#4d5664]">Beds</dt><dd className="font-medium">{cat.bed}{cat.bedrooms !== undefined ? ` · ${cat.bedrooms === 0 ? "studio" : `${cat.bedrooms} bedroom${cat.bedrooms > 1 ? "s" : ""}`}` : ""}</dd></div>
          <div><dt className="text-[#4d5664]">Video</dt><dd className="font-medium">{cat.video ? "YouTube video" : "None (optional)"}</dd></div>
          <div className="sm:col-span-2 lg:col-span-4"><dt className="text-[#4d5664]">Amenities</dt><dd className="font-medium">{cat.amenities.join(", ") || "—"}</dd></div>
        </dl>
      </Section>
      <Section title="Only what is different for a unit" desc="Leave empty to use the category. Room readiness, maintenance and bookings are managed in Housekeeping and Bookings.">
        <div className="hidden grid-cols-[110px_1fr_150px_190px] gap-3 border-b border-[#e3e7ec] pb-2 text-[13px] font-medium text-[#4d5664] lg:grid"><span>Unit</span><span>Location</span><span>Price (৳/{unit})</span><span>Video</span></div>
        <ul className="divide-y divide-[#e3e7ec]">
          {picks.map((k) => {
            const o = over[k.code] ?? {};
            return (
              <li key={k.code} className="grid gap-2 py-3 lg:grid-cols-[110px_1fr_150px_190px] lg:items-center lg:gap-3">
                <span className="font-mono text-[14.5px] font-semibold">{k.code}</span>
                <span className="text-[14px] text-[#4d5664]">{nodePath(st.config, k.node)}</span>
                <label className="text-[12.5px] font-medium text-[#4d5664] lg:hidden" htmlFor={`rate-${k.code}`}>Own price (optional)</label>
                <input id={`rate-${k.code}`} type="number" min={0} aria-label={`Price for ${k.code}`} placeholder={String(cat.baseRate)} value={o.rate ?? ""} onChange={(e) => set(k.code, { rate: e.target.value === "" ? undefined : Number(e.target.value) })} className="h-9 rounded-lg border border-[#d3d8df] px-2.5 text-[14px] outline-none focus:border-[#b11c29]" />
                <div className="space-y-1.5">
                  <select aria-label={`Video for ${k.code}`} value={o.video ?? "inherit"} onChange={(e) => set(k.code, { video: e.target.value as Unit["video"] })} className="h-9 w-full rounded-lg border border-[#d3d8df] px-2 text-[14px]">
                    <option value="inherit">Same as category</option><option value="replace">This unit&apos;s own video</option><option value="hide">No video</option>
                  </select>
                  {o.video === "replace" && <input aria-label={`Video link for ${k.code}`} placeholder="https://youtu.be/…" value={o.videoUrl ?? ""} onChange={(e) => set(k.code, { videoUrl: e.target.value })} className="h-9 w-full rounded-lg border border-[#d3d8df] px-2.5 text-[14px] outline-none focus:border-[#b11c29]" />}
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

// ---------------- 5. Review ----------------
function ReviewStep({ st, cat, core, p, picks, over, isNew }: { st: RoomsState; cat: Category; core: CoreType; p: PresetSlug; picks: Pick[]; over: Record<string, Over>; isNew: boolean }) {
  const byNode = picks.reduce<Record<string, Pick[]>>((a, k) => ((a[k.node] ??= []).push(k), a), {});
  const rates = picks.map((k) => over[k.code]?.rate ?? cat.baseRate);
  const live = picks.filter((k) => st.units.some((u) => sameCode(u.code, k.code)));
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Section title="You are creating">
        <dl className="grid grid-cols-[130px_1fr] gap-y-2.5 text-[14.5px]">
          <dt className="text-[#4d5664]">Type</dt><dd className="font-medium">{presetOf(p).label}{presetOf(p).group !== "standard" && ` · works as ${CORE[core].label}`}</dd>
          <dt className="text-[#4d5664]">Category</dt><dd className="font-medium">{cat.name}{isNew && <span className="ml-2 rounded-md bg-[#e6efff] px-1.5 py-0.5 text-[12px] text-[#2457c5]">New</span>}</dd>
          <dt className="text-[#4d5664]">Units</dt><dd className="font-medium">{picks.length}</dd>
          <dt className="text-[#4d5664]">Price</dt><dd className="font-medium">৳{money(Math.min(...rates))}{Math.max(...rates) !== Math.min(...rates) && ` – ৳${money(Math.max(...rates))}`} / night</dd>
          <dt className="text-[#4d5664]">Video</dt><dd className="font-medium">{cat.video ? "Category video" : "None — that's fine"}</dd>
        </dl>
        <div className="mt-5 space-y-3">
          {Object.entries(byNode).map(([id, ks]) => (
            <div key={id}>
              <p className="text-[13.5px] font-semibold text-[#4d5664]">{nodePath(st.config, id)} · {ks.length}</p>
              <p className="mt-1 flex flex-wrap gap-1.5">{ks.map((k) => <span key={k.code} className="rounded-md bg-[#e9edf2] px-2 py-0.5 font-mono text-[13.5px]">{k.code}</span>)}</p>
            </div>
          ))}
        </div>
      </Section>
      <div className="space-y-4">
        <Section title="Checks">
          <ul className="space-y-2 text-[14px]">
            <Check ok={!live.length} text={live.length ? `Already exist now: ${live.map((k) => k.code).join(", ")}` : "Every code is unique in this property"} />
            <Check ok={cat.baseRate > 0} text="Price is set" />
            <Check ok text="Locations exist" />
            <Check ok text="Each unit is sold as a whole" />
            <Check ok={cat.approval === "approved"} text={cat.approval === "approved" ? "Category approved by BinGi" : "Category waits for BinGi approval — you can create drafts now, publish after approval"} />
            <Check ok={picks.length <= BATCH_MAX} text={`${picks.length} of max ${BATCH_MAX} units in one batch`} />
            <li className="text-[13px] text-[#4d5664]">Subscription unit limit is checked by the HMS backend when it is connected.</li>
          </ul>
        </Section>
        <Section title="What each button does">
          <ul className="space-y-2 text-[13.5px] text-[#4d5664]">
            <li><b className="text-[#0f1720]">Save setup draft</b> — keeps your choices. Numbers are not reserved.</li>
            <li><b className="text-[#0f1720]">Create as draft</b> — units are created and numbers reserved, but guests can&apos;t book them.</li>
            <li><b className="text-[#0f1720]">Publish</b> — units can be sold on dates where rates and availability allow.</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
function Check({ ok, text }: { ok: boolean; text: string }) {
  return <li className={clsx("flex items-start gap-2", ok ? "text-[#1c7d45]" : "text-[#b11c29]")}><span aria-hidden className="mt-0.5">{ok ? "✓" : "!"}</span><span className="text-[#0f1720]">{text}</span></li>;
}
