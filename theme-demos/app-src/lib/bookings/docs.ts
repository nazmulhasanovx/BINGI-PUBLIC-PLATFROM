// Printable booking documents (A4): confirmation, invoice, receipt, registration card, guest register, Form-C.
// Printed through the browser dialog (Save as PDF works). Same data as the booking page.
import type { Hotel } from "@/lib/types";
import type { Guest } from "@/lib/guests/store";
import { settingsOf } from "@/lib/settings/store";
import { bill, channelLabel, dmy, heldMeals, paidOf, preMealTotal, timeOf, tk, totalOf, type Booking, type Pay, type Settings } from "./store";

const esc = (s: string | undefined | null) => (s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const page = (title: string, body: string, landscape = false) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
@page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 14mm; } * { box-sizing: border-box; }
body { font: 12.5px/1.5 -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 0; }
.top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b11c29; padding-bottom: 10px; margin-bottom: 14px; }
h1 { font-size: 20px; margin: 0; } h2 { font-size: 15px; margin: 18px 0 6px; } .m { color: #555; } .r { text-align: right; } .b { font-weight: 700; }
table { width: 100%; border-collapse: collapse; } th, td { padding: 6px 8px; border-bottom: 1px solid #e3e6ea; text-align: left; vertical-align: top; }
th { background: #f5f6f8; font-size: 11.5px; text-transform: uppercase; letter-spacing: .03em; color: #555; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; } .kv { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 4px 0; }
.tot td { border: 0; padding: 3px 8px; } .big { font-size: 16px; font-weight: 800; } .sign { margin-top: 36px; display: flex; gap: 40px; } .sign div { flex: 1; border-top: 1px solid #333; padding-top: 4px; font-size: 11.5px; color: #555; }
.badge { display: inline-block; border: 1px solid #b11c29; color: #b11c29; border-radius: 4px; padding: 1px 6px; font-size: 11px; font-weight: 700; }
small { color: #666; }
</style></head><body>${body}</body></html>`;
/** Name, address, logo and tax numbers come from Settings → Property profile / Branding / Invoices. */
const head = (h: Hotel, title: string, sub: string) => { const st = settingsOf(h); const p = st.profile; const logo = st.docs.showLogo && st.branding.logo ? `<img src="${st.branding.logo}" alt="" style="height:44px;max-width:160px;object-fit:contain;margin-bottom:6px;display:block">` : "";
  return `<div class="top"><div>${logo}<h1>${esc(p.name || h.name)}</h1><div class="m">${esc(p.address || h.address)}<br>${esc(p.phone || h.phone)} · ${esc(p.email || h.email)}${p.bin ? `<br>VAT reg. (BIN) ${esc(p.bin)}` : ""}</div></div><div class="r"><div class="b" style="font-size:17px">${esc(title)}</div><div class="m">${sub}</div></div></div>`; };
const stayBlock = (b: Booking, g?: Guest) => `<div class="grid">
<div class="kv"><span>Guest</span><b>${esc(g?.name)}</b></div><div class="kv"><span>Booking</span><b>${b.code}</b></div>
<div class="kv"><span>Phone</span><span>${esc(g?.phone)}</span></div><div class="kv"><span>Source</span><span>${esc(channelLabel(b))}${b.channelRef ? ` · ${esc(b.channelRef)}` : ""}</span></div>
<div class="kv"><span>Room</span><span>${b.unit ? `${esc(b.unit)} · ` : ""}${esc(b.type)}</span></div><div class="kv"><span>Guests</span><span>${b.adults} adult(s)${b.children ? `, ${b.children} child(ren)` : ""}</span></div>
<div class="kv"><span>Check-in</span><span>${dmy(b.from)}</span></div><div class="kv"><span>Check-out</span><span>${dmy(b.to)} · ${b.nights.length} night(s)</span></div></div>`;

function charges(b: Booking, extras: { label: string; amount: number }[]) {
  const r = bill(b);
  const rows: [string, number][] = [[`Room · ${b.nights.length} night(s)${b.mealPlan ? ` incl. ${b.mealPlan.name}` : ""}`, r.rooms]];
  if (r.discount) rows.push(["Discount", -r.discount]);
  rows.push([`Service charge ${b.tax.service}%`, r.service], [`VAT ${b.tax.vat}%`, r.vat]);
  for (const m of heldMeals(b)) rows.push([`${m.qty}× ${m.name} (${dmy(m.date)})`, preMealTotal(m)]);
  for (const c of b.charges ?? []) rows.push([c.label, c.amount]);
  for (const e of extras) rows.push([e.label, e.amount]);
  return rows;
}

export function confirmationHtml(h: Hotel, b: Booking, g: Guest | undefined, s: Settings) {
  const total = totalOf(b), paid = paidOf(b);
  return page(`Confirmation ${b.code}`, `${head(h, "Booking confirmation", `${b.code} · issued ${dmy(b.created.slice(0, 10))}`)}
<p>Dear ${esc(g?.name)}, thank you for booking with us. Your stay is <span class="badge">${b.status === "Cancelled" ? "CANCELLED" : "CONFIRMED"}</span></p>
${stayBlock(b, g)}
<h2>Price</h2><table class="tot"><tr><td>Total (incl. VAT &amp; service)</td><td class="r b">${tk(total)}</td></tr><tr><td>Paid</td><td class="r">${tk(paid)}</td></tr><tr><td class="big">Due at the hotel</td><td class="r big">${tk(Math.max(0, total - paid))}</td></tr></table>
<h2>Good to know</h2><p>Check-in from ${s.checkIn} · check-out by ${s.checkOut}. Please bring your NID or passport.<br>
Free cancellation up to ${s.freeCancelDays} day(s) before arrival; later cancellations are charged ${s.cancelFeePct}% of the first night, no-shows ${s.noShowFeePct}%.</p>
${b.note ? `<p><b>Your request:</b> ${esc(b.note)}</p>` : ""}<p class="m">${esc(h.name)} · ${esc(h.phone)}</p>`);
}

export function invoiceHtml(h: Hotel, b: Booking, g: Guest | undefined, extras: { label: string; amount: number }[]) {
  const rows = charges(b, extras);
  const total = totalOf(b) + extras.reduce((s, e) => s + e.amount, 0);
  const paid = paidOf(b);
  const to = b.payer?.kind === "Company" ? `<b>${esc(b.payer.name)}</b><br><small>For guest ${esc(g?.name)}</small>` : `<b>${esc(g?.name)}</b><br><small>${esc(g?.address)}</small>`;
  return page(`Invoice ${b.code}`, `${head(h, "Invoice", `${esc(settingsOf(h).docs.prefix)}${b.code.slice(3)} · ${dmy(b.checkedOutAt?.slice(0, 10) ?? b.to)}`)}
<div class="grid" style="margin-bottom:10px"><div><small>Bill to</small><br>${to}</div><div class="r"><small>Stay</small><br>${dmy(b.from)} → ${dmy(b.to)}<br>Room ${esc(b.unit || "—")} · ${esc(b.type)}</div></div>
<table><tr><th>Description</th><th class="r">Amount</th></tr>${rows.map(([l, a]) => `<tr><td>${esc(l)}</td><td class="r">${a < 0 ? "−" : ""}${tk(Math.abs(a))}</td></tr>`).join("")}</table>
<table class="tot" style="margin-top:8px"><tr><td class="r">Total</td><td class="r b" style="width:140px">${tk(total)}</td></tr>
${b.payments.map((p) => `<tr><td class="r m">${p.amount < 0 ? "Refund" : "Paid"} · ${esc(p.method)} · ${dmy(p.at.slice(0, 10))}</td><td class="r">${p.amount < 0 ? "+" : "−"}${tk(Math.abs(p.amount))}</td></tr>`).join("")}
<tr><td class="r big">Balance</td><td class="r big">${tk(total - paid)}</td></tr></table>
${settingsOf(h).docs.terms ? `<p class="m" style="margin-top:14px">${esc(settingsOf(h).docs.terms)}</p>` : ""}
<div class="sign"><div>Guest signature</div><div>Front desk</div></div>${settingsOf(h).docs.footer ? `<p class="m" style="text-align:center;margin-top:18px">${esc(settingsOf(h).docs.footer)}</p>` : ""}`);
}

export function receiptHtml(h: Hotel, b: Booking, g: Guest | undefined, p: Pay) {
  return page(`Receipt ${b.code}`, `${head(h, p.amount < 0 ? "Refund receipt" : "Money receipt", `RCT-${p.id.slice(-6).toUpperCase()} · ${dmy(p.at.slice(0, 10))} ${timeOf(p.at)}`)}
<p>Received ${p.amount < 0 ? "back by" : "from"} <b>${esc(g?.name)}</b> the sum of <span class="big">${tk(Math.abs(p.amount))}</span> by <b>${esc(p.method)}</b>${p.note ? ` (${esc(p.note)})` : ""} for booking <b>${b.code}</b>, room ${esc(b.unit || "—")}, ${dmy(b.from)} → ${dmy(b.to)}.</p>
<table class="tot"><tr><td>Booking total</td><td class="r">${tk(totalOf(b))}</td></tr><tr><td>Paid so far</td><td class="r">${tk(paidOf(b))}</td></tr><tr><td class="b">Balance</td><td class="r b">${tk(Math.max(0, totalOf(b) - paidOf(b)))}</td></tr></table>
<div class="sign"><div>Received by · ${esc(p.by)}</div><div>Guest</div></div>`);
}

export function regCardHtml(h: Hotel, b: Booking, g: Guest | undefined) {
  const row = (k: string, v?: string) => `<div class="kv"><span>${k}</span><b>${esc(v) || "&nbsp;"}</b></div>`;
  return page(`Registration ${b.code}`, `${head(h, "Guest registration card", `${b.code} · ${dmy(b.from)}`)}
<div class="grid">${row("Full name", g?.name)}${row("Phone", g?.phone)}${row("Nationality", g?.country)}${row("Email", g?.email)}
${row(g?.idType || "ID", g?.idNo)}${row("Date of birth", g?.dob)}${row("Gender", g?.gender)}${row("Occupation", g?.occupation)}
${g?.country !== "Bangladesh" ? `${row("Visa no.", g?.visaNo)}${row("Visa valid until", g?.visaExpiry)}` : ""}
${row("Address", g?.address)}${row("Purpose of visit", b.purpose)}${row("Coming from", b.comingFrom)}${row("Going to", b.goingTo)}
${row("Room", b.unit)}${row("Arrival", `${dmy(b.from)}${b.eta ? ` · ${b.eta}` : ""}`)}${row("Departure", dmy(b.to))}${row("Booked through", channelLabel(b))}</div>
${b.companions?.length ? `<h2>Other guests in the room</h2><table><tr><th>Name</th><th>ID</th><th>Relation</th></tr>${b.companions.map((c) => `<tr><td>${esc(c.name)}</td><td>${esc(c.idType)} ${esc(c.idNo)}</td><td>${esc(c.relation)}</td></tr>`).join("")}</table>` : ""}
${(() => { const c = settingsOf(h).docs.contract; return c.on ? `<h2>${esc(c.title)}</h2><p>${esc(c.intro)}</p>${c.rules ? `<p style="white-space:pre-wrap">${esc(c.rules)}</p>` : ""}` : ""; })()}
<p class="m" style="margin-top:14px">I agree to the hotel's terms. Check-out by the agreed time; the hotel is not responsible for valuables not deposited at the front desk.</p>
<div class="sign"><div>Guest signature</div><div>Front desk</div></div>`);
}

/** Daily guest register — everyone staying tonight (kept by every hotel; asked for by police on inspection). */
export function registerHtml(h: Hotel, date: string, rows: { b: Booking; g?: Guest }[]) {
  return page(`Guest register ${date}`, `${head(h, "Guest register", `Night of ${dmy(date)} · ${rows.length} room(s)`)}
<table><tr><th>Room</th><th>Guest</th><th>Nationality</th><th>ID</th><th>Phone</th><th>From → to</th><th>Purpose</th><th>Coming from</th><th>Others</th></tr>
${rows.map(({ b, g }) => `<tr><td class="b">${esc(b.unit)}</td><td>${esc(g?.name)}<br><small>${b.code}</small></td><td>${esc(g?.country)}</td><td>${esc(g?.idType)} ${esc(g?.idNo) || "<b>missing</b>"}</td><td>${esc(g?.phone)}</td><td>${dmy(b.from)} → ${dmy(b.to)}</td><td>${esc(b.purpose)}</td><td>${esc(b.comingFrom)}</td><td>${(b.companions ?? []).map((c) => esc(c.name)).join(", ") || (b.adults + b.children > 1 ? `${b.adults + b.children - 1} unnamed` : "")}</td></tr>`).join("")}</table>
<div class="sign"><div>Prepared by</div><div>Manager</div></div>`, true);
}

/** Form-C style list of foreign guests (passport + visa) for the police / immigration. */
export function formCHtml(h: Hotel, date: string, rows: { b: Booking; g?: Guest }[]) {
  return page(`Form-C ${date}`, `${head(h, "Foreign guests (Form-C)", `${dmy(date)} · ${rows.length} guest(s)`)}
<table><tr><th>#</th><th>Name</th><th>Nationality</th><th>Passport</th><th>Visa / valid until</th><th>Date of birth</th><th>Arrived</th><th>Leaving</th><th>Room</th><th>Coming from / going to</th><th>Purpose</th></tr>
${rows.map(({ b, g }, i) => `<tr><td>${i + 1}</td><td class="b">${esc(g?.name)}</td><td>${esc(g?.country)}</td><td>${esc(g?.idNo) || "<b>missing</b>"}</td><td>${esc(g?.visaNo) || "—"}${g?.visaExpiry ? ` / ${dmy(g.visaExpiry)}` : ""}</td><td>${esc(g?.dob) || "—"}</td><td>${dmy(b.from)}</td><td>${dmy(b.to)}</td><td>${esc(b.unit)}</td><td>${esc(b.comingFrom) || "—"} / ${esc(b.goingTo) || "—"}</td><td>${esc(b.purpose) || "—"}</td></tr>`).join("") || `<tr><td colspan="11" class="m">No foreign guests tonight.</td></tr>`}</table>
<p class="m">Check the exact Form-C format required by your local police station before submitting.</p>
<div class="sign"><div>Prepared by</div><div>Manager</div></div>`, true);
}

/** Fill a message template ({guest}, {code}, {hotel}, {room}, {from}, {to}, {nights}, {total}, {paid}, {checkin}). */
/** Guest-facing pre-check-in page for this booking (works on the Next app and the hash-routed preview). */
export function precheckUrl(h: Hotel, b: Booking) {
  if (typeof window === "undefined") return `/hotel/${h.slug}/precheckin?b=${b.code}`;
  const { origin, pathname, hash } = window.location;
  return hash.startsWith("#/") ? `${origin}${pathname}#/hotel/${h.slug}/precheckin?b=${b.code}` : `${origin}/hotel/${h.slug}/precheckin?b=${b.code}`;
}
export function fillMsg(t: string, h: Hotel, b: Booking, g: Guest | undefined, s: Settings) {
  const map: Record<string, string> = { link: precheckUrl(h, b), guest: g?.name ?? "Guest", code: b.code, hotel: h.name, room: b.unit ? `Room ${b.unit} (${b.type})` : b.type, from: dmy(b.from), to: dmy(b.to), nights: String(b.nights.length), total: tk(totalOf(b)), paid: tk(paidOf(b)), checkin: s.checkIn };
  return t.replace(/\{(\w+)\}/g, (m, k) => map[k] ?? m);
}
