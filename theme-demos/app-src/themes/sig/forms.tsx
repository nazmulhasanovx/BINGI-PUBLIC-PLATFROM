"use client";
// Enquiry forms for theme pages (AXIS meetings, RESIDE long stays). PROTOTYPE: nothing is sent anywhere.
// Production: posts to HMS (Enquiries / Reservations) — backend endpoint not built yet.
import { useState } from "react";
import type { Hotel } from "@/lib/types";
import { waLink } from "../shared";

type Field = { name: string; label: string; type?: string; required?: boolean; options?: string[] };

function Enquiry({ hotel, title, fields, cta, note }: { hotel: Hotel; title: string; fields: Field[]; cta: string; note: string }) {
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (sent)
    return (
      <div role="status" className="rounded-[var(--lux-r)] border border-line bg-surface p-6">
        <h2 className="lux-display text-[26px]">Request noted</h2>
        <p className="mt-2 text-[15px] text-muted">This is a demo: nothing was sent. On a live site your request goes to the hotel team in BinGi HMS and they reply by phone or email.</p>
        <a href={waLink(hotel, `Hello ${hotel.name}, ${title.toLowerCase()}.`)} target="_blank" rel="noopener" className="lux-btn mt-5 !h-11">Message on WhatsApp</a>
      </div>
    );
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const missing = fields.filter((x) => x.required && !String(f.get(x.name) ?? "").trim());
        if (missing.length) { setErr(`Please fill in: ${missing.map((m) => m.label).join(", ")}.`); return; }
        setErr(null);
        setSent(true);
      }}
      className="rounded-[var(--lux-r)] border border-line bg-surface p-6"
      aria-label={title}
    >
      <h2 className="lux-display text-[26px]">{title}</h2>
      <div className="mt-5 grid gap-4">
        {fields.map((x) => (
          <label key={x.name} className="grid gap-1.5 text-[14px] font-semibold">
            {x.label}{x.required && <span className="sr-only"> (required)</span>}
            {x.options ? (
              <select name={x.name} className="h-11 rounded-[6px] border border-line bg-canvas px-3 font-normal">{x.options.map((o) => <option key={o}>{o}</option>)}</select>
            ) : (
              <input name={x.name} type={x.type ?? "text"} required={x.required} className="h-11 rounded-[6px] border border-line bg-canvas px-3 font-normal" />
            )}
          </label>
        ))}
      </div>
      {err && <p role="alert" className="mt-4 text-[14px] font-semibold text-[#b42318]">{err}</p>}
      <button type="submit" className="lux-btn mt-6 w-full justify-center !h-12">{cta}</button>
      <p className="mt-3 text-[12.5px] text-muted">{note}</p>
    </form>
  );
}

export function MeetForm({ hotel }: { hotel: Hotel }) {
  return (
    <Enquiry hotel={hotel} title="Plan a meeting" cta="Send request" note="Demo form — nothing is sent. The team confirms availability and price."
      fields={[{ name: "name", label: "Your name", required: true }, { name: "company", label: "Company" }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "date", label: "Date", type: "date", required: true }, { name: "people", label: "People", options: ["Up to 14", "15–30", "31–60", "61–120"] }, { name: "space", label: "Space", options: ["Boardroom", "Meeting room", "Event space"] }]} />
  );
}

export function LongStayForm({ hotel }: { hotel: Hotel }) {
  return (
    <Enquiry hotel={hotel} title="Ask for a monthly rate" cta="Request a quote" note="Demo form — nothing is sent. Monthly prices are confirmed by the team."
      fields={[{ name: "name", label: "Your name", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "from", label: "Move-in date", type: "date", required: true }, { name: "months", label: "How long", options: ["1 month", "2–3 months", "4–6 months", "6+ months"] }, { name: "unit", label: "Apartment", options: hotel.rooms.map((r) => r.name) }]} />
  );
}
