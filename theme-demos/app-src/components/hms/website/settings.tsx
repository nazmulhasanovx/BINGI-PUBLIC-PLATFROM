"use client";
import { can, minPlanLabel } from "@/lib/plan";
import { useLicences } from "@/lib/licences";
import { isPaid } from "@/themes/paid";
import { hrefFor } from "@/lib/href";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { BarChart3, Check, CircleCheck, Copy, ExternalLink, Eye, Inbox, MessageSquare, Phone, RotateCcw, Rocket } from "lucide-react";
import { MANIFESTS, PLAN_LABEL, planAllows } from "@/themes/manifest";
import { slotText, type Inquiry } from "@/lib/site";
import { useWM } from "./WebsiteModule";
import { MediaPicker } from "./content";
import { Badge, Btn, Card, Empty, Field, Input, NotWired, PageHead, PlanLock, Segmented, SourceLink, TextArea, Toggle, fmtDate } from "./ui";

/* ================= Booking Engine ================= */
export function BookingPage() {
  const { hotel, site, manifest } = useWM();
  const b = site.draft.booking;
  const set = <K extends keyof typeof b>(k: K, v: (typeof b)[K]) => site.edit((x) => { x.booking[k] = v; });
  const card = hotel.payments.find((p) => p.kind === "card-online") as { gatewayApproved?: boolean } | undefined;
  const bkash = hotel.payments.find((p) => p.kind === "mfs-manual") as { provider?: string; number?: string } | undefined;
  return (
    <>
      <PageHead title="Booking Engine" desc="How guests book and pay." actions={<SourceLink href="/hms/payments" label="Payments" />} />
      <NotWired what="Booking engine settings" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="How guests can pay" desc="Only methods you turn on here appear at checkout.">
          <ul className="divide-y divide-hms-line">
            <li className="flex items-center gap-3 py-3"><span className="flex-1"><b className="block text-[14px] font-medium">Pay on arrival</b><span className="text-[13px] text-hms-muted">Cash or card on arrival</span></span><Toggle label="Pay at the hotel" on={b.payAtHotel} onChange={(v) => set("payAtHotel", v)} /></li>
            <li className="flex items-center gap-3 py-3"><span className="flex-1"><b className="block text-[14px] font-medium">{bkash?.provider ?? "bKash"} (send money)</b><span className="text-[13px] text-hms-muted">{bkash?.number ? `To ${bkash.number} · guest enters the transaction ID` : "Add a number in Payments first"}</span></span><Toggle label="bKash" on={b.bkash && !!bkash} disabled={!bkash} onChange={(v) => set("bkash", v)} /></li>
            <li className="flex items-center gap-3 py-3">
              <span className="flex-1"><b className="block text-[14px] font-medium">Advance payment</b><span className="text-[13px] text-hms-muted">Guest pays part now, rest on arrival</span></span>
              {b.advance && <span className="flex items-center gap-1"><Input type="number" aria-label="Advance percent" min={10} max={90} step={5} value={b.advancePercent} onChange={(e) => set("advancePercent", Math.max(10, Math.min(90, Number(e.target.value) || 30)))} className="h-9 w-[72px] text-right" /><span className="text-[13px] text-hms-muted">%</span></span>}
              <Toggle label="Advance payment" on={b.advance} onChange={(v) => set("advance", v)} />
            </li>
            <li className="flex items-center gap-3 py-3"><span className="flex-1"><b className="block text-[14px] font-medium text-hms-muted">Card / online payment</b><span className="text-[13px] text-hms-muted">{card?.gatewayApproved ? "Gateway approved" : "Needs an approved payment gateway"}</span></span>{card?.gatewayApproved ? <Badge tone="green">Ready</Badge> : <SourceLink href="/hms/settings" label="Connect gateway" />}</li>
          </ul>
          {!b.payAtHotel && !b.bkash && !b.advance && <p className="mt-2 text-[13px] text-hms-red">Turn on at least one, or guests can&apos;t book.</p>}
        </Card>
        <Card title="During booking">
          <ul className="divide-y divide-hms-line">
            <li className="flex items-center gap-3 py-3"><span className="flex-1"><b className="block text-[14px] font-medium">Extras</b><span className="text-[13px] text-hms-muted">Pickup, breakfast and other services marked “add to booking”</span></span>{manifest.features.extras ? <Toggle label="Extras" on={b.extras} onChange={(v) => set("extras", v)} /> : <PlanLock plan="Not in theme" />}</li>
            <li className="flex items-center gap-3 py-3"><span className="flex-1"><b className="block text-[14px] font-medium">Promo code field</b><span className="text-[13px] text-hms-muted">{hotel.promoCodes.length} active code{hotel.promoCodes.length === 1 ? "" : "s"} in Discounts</span></span><Toggle label="Promo code" on={b.promo} onChange={(v) => set("promo", v)} /></li>
            <li className="py-3"><b className="block text-[14px] font-medium">Guest account</b><span className="mb-2 block text-[13px] text-hms-muted">BinGi Marketplace account (phone + OTP)</span><Segmented value={b.guestAccount} onChange={(v) => set("guestAccount", v)} options={[{ v: "optional", label: "Optional" }, { v: "required", label: "Required to book" }]} /></li>
          </ul>
        </Card>
        <Card title="Confirmation message" desc="Shown to the guest after booking. SMS/email sending is not connected yet." className="lg:col-span-2">
          <TextArea aria-label="Confirmation message" value={b.note} maxLength={240} onChange={(e) => set("note", e.target.value)} />
          
        </Card>
      </div>
    </>
  );
}

/* ================= Inquiries ================= */
export function InquiriesPage() {
  const { site } = useWM();
  const [f, setF] = useState<"all" | Inquiry["status"]>("all");
  const list = site.rec.inquiries.filter((q) => f === "all" || q.status === f);
  const [sel, setSel] = useState<string | null>(list[0]?.id ?? null);
  const q = site.rec.inquiries.find((x) => x.id === sel);
  const setStatus = (s: Inquiry["status"]) => site.mutate((r) => { const x = r.inquiries.find((i) => i.id === sel); if (x) x.status = s; });
  const counts = { new: site.rec.inquiries.filter((x) => x.status === "new").length };
  return (
    <>
      <PageHead title="Inquiries" desc="Questions sent from your website." actions={<SourceLink href="/hms/chat" label="Open Chat" />} />
      <div className="mb-4"><Segmented value={f} onChange={setF} options={[{ v: "all", label: "All" }, { v: "new", label: `New (${counts.new})` }, { v: "replied", label: "Replied" }, { v: "closed", label: "Closed" }]} /></div>
      {list.length === 0 ? (
        <Card><Empty icon={<Inbox className="size-6" />} title="Nothing here" desc="When a guest sends a question from your website, it shows here and in Chat." /></Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <Card pad={false}>
            {list.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={clsx("block w-full border-b border-hms-line px-4 py-3 text-left last:border-b-0", sel === x.id ? "bg-hms-coral-soft/50" : "hover:bg-hms-nav")}>
                <span className="flex items-center gap-2"><span className="flex-1 truncate text-[14px] font-medium">{x.name}</span>{x.status === "new" && <span className="size-2 rounded-full bg-hms-coral" />}</span>
                <span className="mt-0.5 flex items-center gap-2 text-[12px] text-hms-muted"><Badge tone="blue">{x.kind}</Badge>{fmtDate(x.at)}</span>
                <span className="mt-1 line-clamp-1 block text-[13px] text-hms-muted">{x.message}</span>
              </button>
            ))}
          </Card>
          {q && (
            <Card title={q.name} desc={`${q.kind} · ${fmtDate(q.at)}`} action={<Badge tone={q.status === "new" ? "red" : q.status === "replied" ? "green" : "gray"}>{q.status}</Badge>}>
              <p className="text-[15px] leading-relaxed">{q.message}</p>
              <p className="mt-4 flex items-center gap-2 text-[14px] text-hms-muted"><Phone className="size-4" /> {q.phone}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/hms/chat" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-hms-coral px-4 text-[14px] font-medium text-white"><MessageSquare className="size-4" /> Reply in Chat</Link>
                {q.status !== "replied" && <Btn variant="outline" onClick={() => setStatus("replied")}><Check className="size-4" /> Mark replied</Btn>}
                {q.status !== "closed" && <Btn variant="ghost" onClick={() => setStatus("closed")}>Close</Btn>}
                {q.status === "closed" && <Btn variant="ghost" onClick={() => setStatus("new")}>Reopen</Btn>}
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

/* ================= SEO & Sharing ================= */
export function SeoPage() {
  const { hotel, site } = useWM();
  const s = site.draft.seo;
  const [pick, setPick] = useState(false);
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => site.edit((x) => { x.seo[k] = v; });
  const title = s.titleTemplate.replace("{{page}}", "Home");
  return (
    <>
      <PageHead title="Google & Sharing" desc="How your site looks in search and on social." />
      <NotWired what="SEO settings" />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card title="Search">
            <div className="space-y-4">
              <Field label="Page title"><Input value={s.titleTemplate} onChange={(e) => set("titleTemplate", e.target.value)} /></Field>
              <Field label="Description" count={`${s.description.length}/155`}><TextArea value={s.description} maxLength={200} onChange={(e) => set("description", e.target.value)} /></Field>
              <div className="flex items-center justify-between rounded-xl bg-hms-nav px-4 py-3"><b className="text-[14px] font-medium">Hide from Google</b><Toggle label="Hide from search engines" on={s.noindex} onChange={(v) => set("noindex", v)} /></div>
              
            </div>
          </Card>
          <Card title="Share image" desc="1200 × 630 works best.">
            <div className="flex items-center gap-4">
              <span className="relative h-[84px] w-[160px] overflow-hidden rounded-lg bg-hms-hover">{s.shareImage && <Image src={s.shareImage} alt="" fill sizes="160px" className="object-cover" unoptimized={s.shareImage.startsWith("data:")} />}</span>
              <Btn variant="outline" onClick={() => setPick(true)}>Choose from Media</Btn>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-hms-muted">Google</p>
          <div className="rounded-2xl border border-hms-line bg-white p-4">
            <p className="text-[12px] text-[#4d5156]">bingi.app › hotel › {hotel.slug}</p>
            <p className="mt-0.5 line-clamp-1 text-[18px] text-[#1a0dab]">{title}</p>
            <p className="mt-0.5 line-clamp-2 text-[13px] text-[#4d5156]">{s.description || "Add a description."}</p>
          </div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-hms-muted">Facebook / WhatsApp</p>
          <div className="overflow-hidden rounded-2xl border border-hms-line bg-white">
            <div className="relative aspect-[1200/630] bg-hms-hover">{s.shareImage && <Image src={s.shareImage} alt="" fill sizes="380px" className="object-cover" unoptimized={s.shareImage.startsWith("data:")} />}</div>
            <div className="bg-[#f0f2f5] px-3 py-2"><p className="text-[11px] uppercase text-[#65676b]">bingi.app</p><p className="line-clamp-1 text-[15px] font-semibold text-[#050505]">{title}</p></div>
          </div>
        </div>
      </div>
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(src) => set("shareImage", src)} />}
    </>
  );
}

/* ================= Analytics (planned) ================= */
export function AnalyticsPage() {
  return (
    <>
      <PageHead title="Analytics" desc="Visits and bookings from your website." />
      <Card><Empty icon={<BarChart3 className="size-6" />} title="Coming soon" desc="Visits, where guests come from, and how many book — from real website data. Until then, website bookings appear in Bookings with source “Website”." action={<SourceLink href="/hms/bookings" label="Open Bookings" />} /></Card>
    </>
  );
}

/* ================= Domain & Access ================= */
export function DomainPage() {
  const { hotel, site } = useWM();
  const dm = site.rec.domain;
  const [value, setValue] = useState(dm.custom);
  const [copied, setCopied] = useState("");
  const free = `bingi.app/hotel/${hotel.slug}`;
  const copy = (t: string) => { navigator.clipboard?.writeText(t).catch(() => {}); setCopied(t); setTimeout(() => setCopied(""), 1500); };
  const valid = /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(value.trim());
  const steps = [
    { id: "pending_dns", label: "Add DNS records" },
    { id: "verified", label: "Ownership verified" },
    { id: "live", label: "SSL on · live" },
  ] as const;
  const at = dm.status === "none" ? -1 : steps.findIndex((s) => s.id === dm.status);
  return (
    <>
      <PageHead title="Domain" desc="Your website address." />
      <Card title="Free address" className="mb-5" action={<Badge tone="green">Live</Badge>}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[15px]">{free}</span>
          <Btn variant="outline" className="h-8 px-3 text-[13px]" onClick={() => copy(`https://${free}`)}>{copied === `https://${free}` ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}</Btn>
          <a href={hrefFor(`/hotel/${hotel.slug}`)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[13px] font-medium text-hms-blue">Open <ExternalLink className="size-3.5" /></a>
        </div>
      </Card>
      <Card title="Your own domain" desc="e.g. www.yourhotel.com">
        <div className="flex flex-wrap gap-2">
          <Input value={value} onChange={(e) => setValue(e.target.value.replace(/^https?:\/\//, "").replace(/\/.*$/, ""))} placeholder="www.yourhotel.com" className="max-w-[420px]" />
          <Btn disabled={!valid || value === dm.custom} onClick={() => site.mutate((r) => { r.domain = { custom: value.trim().toLowerCase(), status: "pending_dns" }; })}>Save domain</Btn>
          {dm.custom && <Btn variant="ghost" onClick={() => { site.mutate((r) => { r.domain = { custom: "", status: "none" }; }); setValue(""); }}>Remove</Btn>}
        </div>
        {value && !valid && <p className="mt-2 text-[13px] text-hms-red">Enter only the address, like www.yourhotel.com</p>}
        {dm.custom && (
          <>
            <ol className="mt-6 grid gap-3 sm:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.id} className={clsx("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px]", i <= at ? "border-green-200 bg-hms-green-soft text-hms-green" : "border-hms-line text-hms-muted")}>
                  {i < at || dm.status === "live" ? <CircleCheck className="size-4" /> : <span className="grid size-4 place-items-center rounded-full border text-[10px]">{i + 1}</span>} {s.label}
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[14px] font-medium">Add these at your domain provider</p>
            <div className="mt-2 overflow-hidden rounded-xl border border-hms-line">
              {[["TXT", `_bingi.${dm.custom.replace(/^www\./, "")}`, `bingi-verify=${hotel.slug}`], ["CNAME", dm.custom, "sites.bingi.app"]].map(([t, n, v]) => (
                <div key={t} className="grid grid-cols-[70px_1fr_1fr_40px] items-center gap-3 border-b border-hms-line px-4 py-2.5 font-mono text-[13px] last:border-b-0">
                  <span className="font-sans font-semibold">{t}</span><span className="truncate">{n}</span><span className="truncate">{v}</span>
                  <button aria-label="Copy value" onClick={() => copy(v)} className="grid size-8 place-items-center rounded-lg hover:bg-hms-hover">{copied === v ? <Check className="size-4 text-hms-green" /> : <Copy className="size-4" />}</button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Btn variant="outline" disabled title="Needs the BinGi backend">Check now</Btn>
              <p className="text-[13px] text-hms-muted">Needs the BinGi backend</p>
            </div>
          </>
        )}
      </Card>
      
    </>
  );
}

/* ================= Languages ================= */
export function LanguagesPage() {
  const { hotel, site, manifest } = useWM();
  const d = site.draft;
  const fields = manifest.sections.flatMap((s) => (s.fields ?? []).map((f) => ({ key: `${s.id}.${f.key}`, label: `${s.name} · ${f.label}`, en: slotText(d, `${s.id}.${f.key}`, f.fallback?.(hotel) ?? "") })));
  const done = fields.filter((f) => d.text[`bn:${f.key}`]).length;
  return (
    <>
      <PageHead title="Languages" desc="English and বাংলা for guests." />
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3"><Toggle label="Bangla on the website" on={d.languages.bn} onChange={(v) => site.edit((x) => { x.languages.bn = v; if (!v) x.languages.defaultLang = "en"; })} /><span className="text-[14px] font-medium">বাংলা on the website</span></div>
          <div className="flex items-center gap-3"><span className="text-[14px] text-hms-muted">Default language</span><Segmented value={d.languages.defaultLang} onChange={(v) => site.edit((x) => { x.languages.defaultLang = v; })} options={[{ v: "en", label: "English" }, ...(d.languages.bn ? [{ v: "bn" as const, label: "বাংলা" }] : [])]} /></div>
        </div>
      </Card>
      {d.languages.bn && (
        <Card pad={false} title="Your text in Bangla" desc={`${done} of ${fields.length} translated. Missing ones show in English.`}>
          {fields.map((f) => (
            <div key={f.key} className="grid gap-3 border-b border-hms-line px-5 py-3.5 last:border-b-0 md:grid-cols-[220px_1fr_1fr]">
              <p className="text-[13px] font-medium">{f.label}</p>
              <p className="text-[14px] text-hms-muted">{f.en}</p>
              <Input value={d.text[`bn:${f.key}`] ?? ""} placeholder="বাংলায় লিখুন" onChange={(e) => site.edit((x) => { if (e.target.value) x.text[`bn:${f.key}`] = e.target.value; else delete x.text[`bn:${f.key}`]; })} />
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

/* ================= Online Controls ================= */
export function OnlinePage() {
  const { hotel, site } = useWM();
  const o = site.rec.online;
  const ultra = planAllows(hotel.plan, "ultra");
  const rows: { k: keyof typeof o; label: string; desc: string; lock?: boolean }[] = [
    { k: "booking", label: "Website booking", desc: "Guests can book rooms on your website" },
    { k: "marketplace", label: "BinGi Marketplace", desc: "Guests can find and book you on bingi.app" },
    { k: "ordering", label: "Website food ordering", desc: "Guests order from your menu online", lock: !ultra },
    { k: "qr", label: "QR ordering", desc: "Guests order by scanning the table QR", lock: !can(hotel, "qrOrdering") },
  ];
  return (
    <>
      <PageHead title="Online On/Off" desc="Pause new bookings or orders anytime." />
      <p className="mb-4 text-[13px] text-hms-muted">Applies at once on your website — no publish needed. Pausing stops new requests only; existing bookings stay.</p>
      <Card pad={false}>
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-4 border-b border-hms-line px-5 py-4 last:border-b-0">
            <div className="min-w-0 flex-1"><p className={clsx("text-[15px] font-medium", r.lock && "text-hms-muted")}>{r.label}</p><p className="text-[13px] text-hms-muted">{r.desc}</p></div>
            {r.lock ? <PlanLock plan={`${r.k === "qr" ? minPlanLabel("qrOrdering") : PLAN_LABEL.ultra}+`} /> : <><Badge tone={o[r.k] ? "green" : "gray"}>{o[r.k] ? "Accepting" : "Paused"}</Badge><Toggle label={r.label} on={o[r.k]} onChange={(v) => site.mutate((x) => { x.online[r.k] = v; })} /></>}
          </div>
        ))}
      </Card>
    </>
  );
}

/* ================= Preview & Publish ================= */
export function PublishPage() {
  const { hotel, site, openPreview } = useWM();
  const lic = useLicences(hotel.slug);
  const blocked = isPaid(site.draft.master) && !lic.has(site.draft.master) ? MANIFESTS[site.draft.master].name : null;
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const n = site.changes.length;
  const rec = site.rec;
  return (
    <>
      <PageHead title="Publish" actions={<Btn variant="outline" onClick={() => openPreview()}><Eye className="size-4" /> Preview</Btn>} />
      <div className="max-w-[760px]">
        <div className="space-y-5">
          <Card title={n ? `${n} change${n > 1 ? "s" : ""} ready` : "Everything is live"}>
            {n > 0 ? (
              <>
                <ul className="mb-4 flex flex-wrap gap-2">{site.changes.map((c) => <Badge key={c} tone="amber">{c}</Badge>)}</ul>
                <Field label="Note (optional)"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. New winter photos" /></Field>
                {blocked && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[14px] text-[#7a4a0b]">Your draft uses {blocked}, a paid theme you haven&apos;t bought. <Link href="/hms/website/design?tab=store" className="font-semibold underline">Buy it</Link> or choose an included theme before publishing.</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Btn disabled={!!blocked} onClick={() => { site.publish(note); setNote(""); setDone(true); setTimeout(() => setDone(false), 4000); }}><Rocket className="size-4" /> Publish now</Btn>
                  <Btn variant="ghost" onClick={() => confirm("Discard all unpublished changes?") && site.discard()}><RotateCcw className="size-4" /> Discard changes</Btn>
                </div>
              </>
            ) : (
              <p className={clsx("flex items-center gap-2 text-[14px]", done ? "font-medium text-hms-green" : "text-hms-muted")}><CircleCheck className="size-4" /> {done ? "Published. Guests see it now." : "Changes you make save automatically. Publish when ready."}</p>
            )}
          </Card>
          <Card pad={false} title="History">
            {rec.versions.map((v, i) => (
              <div key={v.id} className="flex items-center gap-4 border-b border-hms-line px-5 py-3 last:border-b-0">
                <div className="min-w-0 flex-1"><p className="text-[14px] font-medium">{v.note} {i === 0 && <Badge tone="green">Live</Badge>}</p><p className="text-[12px] text-hms-muted">{fmtDate(v.at)} · {v.doc.master.toUpperCase()} theme</p></div>
                {i > 0 && <Btn variant="outline" className="h-8 px-3 text-[13px]" onClick={() => site.restore(v.id)}>Restore</Btn>}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
