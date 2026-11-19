// Print a guest bill or a kitchen ticket (KOT) on the browser's printer dialog — 80 mm receipt layout.
// A hidden iframe keeps the HMS page as it is. Thermal-printer direct printing stays in the live HMS.
import { METHOD_LABEL, SERVICE_LABEL, bill, tk, type Order } from "@/lib/meals/seed";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const page = (title: string, body: string) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
@page { size: 80mm auto; margin: 4mm; } * { box-sizing: border-box; }
body { font: 12px/1.45 ui-monospace, Menlo, Consolas, monospace; color: #000; width: 72mm; margin: 0 auto; }
h1 { font-size: 15px; text-align: center; margin: 0 0 2px; } .c { text-align: center; } .m { color: #444; }
table { width: 100%; border-collapse: collapse; } td { padding: 2px 0; vertical-align: top; } td.r { text-align: right; white-space: nowrap; }
hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; } .big { font-size: 15px; font-weight: 700; } .note { font-style: italic; padding-left: 14px; }
</style></head><body>${body}</body></html>`;

export function printHtml(html: string) {
  const f = document.createElement("iframe");
  f.setAttribute("aria-hidden", "true");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(f);
  const d = f.contentDocument!;
  d.open(); d.write(html); d.close();
  setTimeout(() => { try { f.contentWindow?.focus(); f.contentWindow?.print(); } catch {} setTimeout(() => f.remove(), 1500); }, 120);
}

export function billHtml(o: Order, hotel: string, where: string) {
  const b = bill(o);
  const rows = o.lines.map((l) => `<tr><td>${l.qty}× ${esc(l.name)}</td><td class="r">${tk(l.price * l.qty)}</td></tr>`).join("");
  const paid = o.pay === "unpaid" ? "<p class='c big'>NOT PAID</p>" : `<p class="c">${o.pay === "room" ? `Charged to room ${esc(o.room ?? "")}` : `Paid · ${o.payments?.length ? o.payments.map((p) => `${METHOD_LABEL[p.method]} ${tk(p.amount)}`).join(" + ") : METHOD_LABEL[o.method ?? "cash"]}`}</p>`;
  return page(`Bill ${o.no}`, `<h1>${esc(hotel)}</h1><p class="c m">${esc(o.outlet)}</p><hr>
<p>Bill ${o.no}<br>${o.at.slice(0, 10)} ${o.at.slice(11, 16)} · ${SERVICE_LABEL[o.service]} · ${esc(where)}${o.guest ? `<br>Guest: ${esc(o.guest)}` : ""}</p><hr>
<table>${rows}</table><hr><table>
<tr><td>Subtotal</td><td class="r">${tk(b.sub)}</td></tr>
${b.disc ? `<tr><td>Discount${o.discount?.kind === "percent" ? ` ${o.discount.value}%` : ""}</td><td class="r">−${tk(b.disc)}</td></tr>` : ""}
<tr><td>Service charge ${o.sc}%</td><td class="r">${tk(b.sc)}</td></tr>
<tr><td>VAT ${o.vat}%</td><td class="r">${tk(b.vat)}</td></tr>
<tr><td class="big">TOTAL</td><td class="r big">${tk(b.total)}</td></tr></table><hr>${paid}<p class="c m">Thank you</p>`);
}

/** Kitchen ticket for one round (added items print as their own ticket). */
export function kotHtml(o: Order, where: string, round = o.round ?? 1) {
  const ls = o.lines.filter((l) => (l.round ?? 1) === round);
  return page(`KOT ${o.no}`, `<h1>KITCHEN · ${esc(where)}</h1><p class="c">${o.no}${round > 1 ? ` · ADDED (round ${round})` : ""}<br>${o.at.slice(11, 16)} · ${SERVICE_LABEL[o.service]}</p><hr>
<table>${ls.map((l) => `<tr><td class="big">${l.qty}×</td><td class="big">${esc(l.name)}</td></tr>${l.note ? `<tr><td></td><td class="note">${esc(l.note)}</td></tr>` : ""}`).join("")}</table><hr>`);
}
