"use client";
// Recipes & sales: a dish lists the ingredients one portion uses and which outlet store it comes from.
// Recording what was sold takes those ingredients out of that store ("Used in sales" in History).
// Production: Meal Management orders feed this automatically; here sales are entered by hand (prototype).
import clsx from "clsx";
import { useState } from "react";
import { ChefHat, Plus, Trash2 } from "lucide-react";
import { fmtQty, q, tk, type Recipe, type useInventory } from "@/lib/inventory/store";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";
import { Err, Foot, Hint, QtyInput } from "./sheets";
import { InventoryFrame, useInv } from "./frame";

type Inv = ReturnType<typeof useInventory>;
const card = "rounded-xl border border-hms-line bg-white";
const costOf = (inv: Inv, r: Recipe) => r.lines.reduce((s, l) => s + l.qty * (inv.st.items.find((i) => i.id === l.item)?.cost ?? 0), 0);

export function RecipesPage() { return <InventoryFrame tab="recipes"><Recipes /></InventoryFrame>; }
function Recipes() {
  const { inv, open } = useInv();
  const stores = new Map(inv.st.stores.map((s) => [s.id, s.name]));
  const items = new Map(inv.st.items.map((i) => [i.id, i]));
  const recent = inv.st.sales.slice(0, 8);
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section className={clsx(card, "self-start overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="mr-auto"><h2 className="text-[17px] font-bold">Recipes</h2><p className="text-[13px] text-hms-muted">Ingredients per portion and the food cost of each dish.</p></div>
          <button onClick={() => open({ k: "recipe" })} className={clsx(btnLine, "h-10")}><Plus className="size-4" />Add recipe</button>
          <button onClick={() => open({ k: "sales" })} disabled={!inv.st.recipes.length} className={clsx(btnPrimary, "h-10")}><ChefHat className="size-4" />Record sales</button>
        </div>
        {inv.st.recipes.length ? (
          <ul className="border-t border-hms-line">{inv.st.recipes.map((r) => {
            const c = costOf(inv, r), pct = r.price ? Math.round((c / r.price) * 100) : 0;
            return (
              <li key={r.id} className="border-t border-hms-line px-5 py-4 first:border-t-0">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1"><button onClick={() => open({ k: "recipe", recipe: r })} className="text-left text-[15.5px] font-semibold underline-offset-2 hover:underline">{r.name}</button><p className="text-[13px] text-hms-muted">From {stores.get(r.store)} · {r.lines.map((l) => `${items.get(l.item)?.name} ${fmtQty(l.qty, items.get(l.item)?.unit ?? "")}`).join(", ")}</p></div>
                  <dl className="flex gap-5 text-right text-[13px]">
                    <div><dt className="text-hms-muted">Cost</dt><dd className="font-semibold tabular-nums">{tk(Math.round(c * 100) / 100)}</dd></div>
                    <div><dt className="text-hms-muted">Price</dt><dd className="font-semibold tabular-nums">{r.price ? tk(r.price) : "—"}</dd></div>
                    <div><dt className="text-hms-muted">Food cost</dt><dd className={clsx("font-bold tabular-nums", pct > 35 ? "text-[#b11c29]" : "text-[#16693a]")}>{r.price ? `${pct}%` : "—"}</dd></div>
                  </dl>
                </div>
              </li>
            );
          })}</ul>
        ) : (
          <div className="border-t border-hms-line px-6 py-14 text-center"><p className="text-[16px] font-semibold">No recipes yet</p><p className="mt-1 text-[14px] text-hms-muted">Add a dish and the ingredients one portion uses.</p></div>
        )}
      </section>
      <section className={clsx(card, "self-start overflow-hidden")}>
        <div className="px-5 py-4"><h2 className="text-[17px] font-bold">Recent sales recorded</h2><p className="text-[13px] text-hms-muted">Each one takes ingredients out of the outlet store.</p></div>
        {recent.length ? <ul className="border-t border-hms-line">{recent.map((x, i) => <li key={`${x.id}-${i}`} className="flex justify-between gap-3 border-t border-hms-line px-5 py-3 text-[14px] first:border-t-0"><span><b>{inv.st.recipes.find((r) => r.id === x.recipe)?.name}</b> × {x.qty}<span className="block text-[12.5px] text-hms-muted">{x.id} · {x.at.slice(11, 16)} · {x.by}</span></span></li>)}</ul>
          : <p className="border-t border-hms-line px-5 py-6 text-[14px] text-hms-muted">Nothing recorded yet.</p>}
        <p className="border-t border-hms-line bg-[#f8f9fb] px-5 py-3 text-[12.5px] text-hms-muted">When Meal Management orders are connected, sold dishes are recorded here automatically. In this prototype you enter them by hand.</p>
      </section>
    </div>
  );
}

export function RecipeSheet({ inv, recipe, onClose }: { inv: Inv; recipe?: Recipe; onClose: () => void }) {
  const outlets = inv.st.stores.filter((s) => s.kind !== "housekeeping");
  const [name, setName] = useState(recipe?.name ?? "");
  const [store, setStore] = useState(recipe?.store ?? outlets.find((s) => s.kind === "kitchen")?.id ?? outlets[0]?.id ?? "");
  const [price, setPrice] = useState(recipe?.price ? String(recipe.price) : "");
  const [lines, setLines] = useState(recipe?.lines.map((l) => ({ item: l.item, qty: String(l.qty) })) ?? [{ item: inv.items[0]?.id ?? "", qty: "" }]);
  const [tried, setTried] = useState(false);
  const items = new Map(inv.items.map((i) => [i.id, i]));
  const cost = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (items.get(l.item)?.cost ?? 0), 0);
  const dup = inv.st.recipes.some((r) => r.id !== recipe?.id && r.name.trim().toLowerCase() === name.trim().toLowerCase());
  const err = !name.trim() ? "Enter the dish name" : dup ? "A recipe with this name exists" : !lines.length || lines.some((l) => !(Number(l.qty) > 0)) ? "Every ingredient needs a quantity" : new Set(lines.map((l) => l.item)).size !== lines.length ? "Each ingredient once" : "";
  const save = () => { setTried(true); if (err) return; inv.saveRecipe({ id: recipe?.id ?? inv.newId("r"), name: name.trim(), store, price: Number(price) || 0, lines: lines.map((l) => ({ item: l.item, qty: q(Number(l.qty)) })) }); onClose(); };
  return (
    <Sheet title={recipe ? "Edit Recipe" : "Add Recipe"} sub="What one portion uses." onClose={onClose} footer={<Foot onClose={onClose} label="Save Recipe" onSave={save} />}>
      <div className="space-y-4">
        <div><label htmlFor="rc-name" className={lbl}>Dish / drink</label><input id="rc-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beef Tehari" className={input} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="rc-store" className={lbl}>Made in</label><select id="rc-store" value={store} onChange={(e) => setStore(e.target.value)} className={input}>{outlets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label htmlFor="rc-price" className={lbl}>Selling price (৳)</label><input id="rc-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" className={input} /></div>
        </div>
        <div><p className={lbl}>Ingredients per portion</p>
          <div className="space-y-2">{lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_130px_36px] items-center gap-2">
              <select aria-label={`Ingredient ${i + 1}`} value={l.item} onChange={(e) => setLines(lines.map((x, j) => j === i ? { item: e.target.value, qty: "" } : x))} className={input}>{inv.items.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
              <div><QtyInput id={`rc-q${i}`} label={`Quantity of ${items.get(l.item)?.name}`} value={l.qty} onChange={(v) => setLines(lines.map((x, j) => j === i ? { ...x, qty: v } : x))} unit={items.get(l.item)?.unit ?? ""} /></div>
              <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label={`Remove ${items.get(l.item)?.name}`} className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><Trash2 className="size-4 text-hms-muted" /></button>
            </div>
          ))}</div>
          <button type="button" onClick={() => { const f = inv.items.find((x) => !lines.some((l) => l.item === x.id)); if (f) setLines([...lines, { item: f.id, qty: "" }]); }} className={clsx(btnLine, "mt-2 h-9 px-3")}><Plus className="size-4" />Add ingredient</button>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-[#f4f6f8] px-4 py-3 text-[14px]"><span>Cost per portion</span><b className="tabular-nums">{tk(Math.round(cost * 100) / 100)}{Number(price) > 0 && <span className="ml-2 font-normal text-hms-muted">· food cost {Math.round((cost / Number(price)) * 100)}%</span>}</b></div>
        {tried && err && <Err>{err}</Err>}
        {recipe && <button type="button" onClick={() => { inv.removeRecipe(recipe.id); onClose(); }} className="text-[13.5px] font-semibold text-[#c81e1e]">Delete recipe</button>}
      </div>
    </Sheet>
  );
}

export function SalesSheet({ inv, onClose, onDone }: { inv: Inv; onClose: () => void; onDone: (m: string) => void }) {
  const [qty, setQty] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const items = new Map(inv.st.items.map((i) => [i.id, i]));
  const stores = new Map(inv.st.stores.map((s) => [s.id, s.name]));
  const use = new Map<string, number>();
  for (const r of inv.st.recipes) { const n = Number(qty[r.id]) || 0; if (!n) continue; for (const l of r.lines) { const k = `${l.item}|${r.store}`; use.set(k, q((use.get(k) ?? 0) + l.qty * n)); } }
  const save = () => { const e = inv.recordSales(inv.st.recipes.map((r) => ({ recipe: r.id, qty: Math.round(Number(qty[r.id]) || 0) }))); if (e) { setErr(e); return; } onDone("Sales recorded — ingredients taken from outlet stores"); onClose(); };
  return (
    <Sheet title="Record Sales" sub="How many of each dish were sold. Ingredients leave the outlet store." onClose={onClose} footer={<Foot onClose={onClose} label="Save" onSave={save} disabled={!use.size} />}>
      <div className="space-y-4">
        <ul className="divide-y divide-hms-line rounded-xl border border-hms-line">{inv.st.recipes.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
            <label htmlFor={`sl-${r.id}`} className="min-w-0 flex-1"><span className="block font-semibold">{r.name}</span><span className="text-[12.5px] text-hms-muted">{stores.get(r.store)}</span></label>
            <input id={`sl-${r.id}`} inputMode="numeric" value={qty[r.id] ?? ""} onChange={(e) => { setQty({ ...qty, [r.id]: e.target.value.replace(/\D/g, "") }); setErr(""); }} placeholder="0" className={clsx(input, "h-10 w-24 text-right")} />
          </li>
        ))}</ul>
        {use.size > 0 && (
          <div><p className="text-[14px] font-semibold">Will be taken from stock</p>
            <ul className="mt-2 space-y-1 text-[13.5px]">{[...use].map(([k, n]) => { const [item, store] = k.split("|"); const it = items.get(item)!; const have = it.stock[store] ?? 0; return (
              <li key={k} className="flex justify-between gap-3"><span>{it.name} <span className="text-hms-muted">· {stores.get(store)}</span></span><span className={clsx("tabular-nums", n > have && "font-semibold text-[#c81e1e]")}>−{fmtQty(n, it.unit)} <span className="text-hms-muted">of {fmtQty(have, it.unit)}</span></span></li>
            ); })}</ul>
          </div>
        )}
        {err && <Err>{err}</Err>}
        <Hint>Prototype: enter sales by hand. Connected to Meal Management, every closed order does this on its own.</Hint>
      </div>
    </Sheet>
  );
}
