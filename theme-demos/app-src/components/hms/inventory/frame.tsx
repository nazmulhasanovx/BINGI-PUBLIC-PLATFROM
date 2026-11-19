"use client";
import Link from "next/link";
import clsx from "clsx";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftRight, BarChart3, ChefHat, ClipboardCheck, ClipboardList, Download, History, Lock, MoreHorizontal, Package, Plus, ShoppingCart, Store, Trash2, Upload, CircleCheck, UserRound } from "lucide-react";
import { ROLE_LABEL, hasInventory, useInventory, type Category, type Item, type Location, type Po, type Recipe, type Supplier } from "@/lib/inventory/store";
import { useProperty } from "../property";
import { btnIcon, btnLine, btnPrimary } from "../guests/ui";
import { CategorySheet, ItemSheet, MoveSheet, StoreSheet, SupplierSheet, TransferSheet } from "./sheets";
import { PoSheet, PoView } from "./purchasing";
import { RecipeSheet, SalesSheet } from "./recipes";

export type Open =
  | { k: "item"; item?: Item }
  | { k: "move"; type: "receive" | "issue" | "wastage" | "adjust"; item?: string }
  | { k: "transfer"; item?: string }
  | { k: "cat"; cat?: Category }
  | { k: "sup"; sup?: Supplier }
  | { k: "store"; store?: Location }
  | { k: "po"; po?: Po; prefill?: { supplier: string; lines: { item: string; qty: number }[] } }
  | { k: "poView"; id: string }
  | { k: "recipe"; recipe?: Recipe }
  | { k: "sales" };
type Ctx = { inv: ReturnType<typeof useInventory>; open: (o: Open) => void; store: string; setStore: (s: string) => void; toast: (t: string) => void };
const C = createContext<Ctx | null>(null);
export const useInv = () => useContext(C)!;

export type InvTab = "stock" | "purchase" | "count" | "recipes" | "history" | "reports" | "setup";
const TABS: { id: InvTab; label: string; href: string; icon: typeof Package }[] = [
  { id: "stock", label: "Stock", href: "/hms/inventory", icon: Package },
  { id: "purchase", label: "Purchase orders", href: "/hms/inventory/purchase", icon: ShoppingCart },
  { id: "count", label: "Stock count", href: "/hms/inventory/count", icon: ClipboardList },
  { id: "recipes", label: "Recipes & sales", href: "/hms/inventory/recipes", icon: ChefHat },
  { id: "history", label: "History", href: "/hms/inventory/history", icon: History },
  { id: "reports", label: "Reports", href: "/hms/inventory/reports", icon: BarChart3 },
  { id: "setup", label: "Setup", href: "/hms/inventory/setup", icon: Store },
];

let storePick = ""; // remembered across inventory tabs in this visit

export function InventoryFrame({ tab, children }: { tab: InvTab; children: ReactNode }) {
  const h = useProperty();
  const inv = useInventory(h);
  const [o, setO] = useState<Open | null>(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [store, setStoreS] = useState(storePick);
  const setStore = (s: string) => { storePick = s; setStoreS(s); };
  const mref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const c = (e: MouseEvent) => { if (!mref.current?.contains(e.target as Node)) setMenu(false); };
    const k = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", c); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", c); document.removeEventListener("keydown", k); };
  }, [menu]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toast]);

  if (!hasInventory(h)) return (
    <div className="h-full overflow-y-auto"><div className="mx-auto max-w-[720px] p-6">
      <div className="mt-10 rounded-2xl border border-hms-line bg-white p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-hms-coral-soft text-hms-red"><Lock className="size-7" /></span>
        <h1 className="mt-4 text-[22px] font-bold">Inventory is part of Ultra</h1>
        <p className="mx-auto mt-2 max-w-[440px] text-[14.5px] text-hms-muted">Track amenities, linen, food and cleaning stock, record what is used, and get low-stock alerts. {h.name} is on the {h.plan[0].toUpperCase() + h.plan.slice(1)} plan.</p>
        <Link href="/hms/settings/billing" className={clsx(btnPrimary, "mt-5")}>See Ultra plan</Link>
      </div>
    </div></div>
  );

  const empty = inv.items.length === 0;
  return (
    <C.Provider value={{ inv, open: setO, store, setStore, toast: setToast }}>
      <div className="h-full overflow-y-auto">
        <div className="hms-page">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.01em]">Inventory</h1>
              <p className="flex flex-wrap items-center gap-x-2 text-[14px] text-hms-muted">Stock across {inv.st.stores.length} stores, purchasing and costs.
                <Link href="/hms/inventory/setup#roles" className="inline-flex items-center gap-1 rounded-md bg-hms-hover px-2 py-0.5 text-[12.5px] font-semibold text-[#4d5664] hover:text-hms-ink"><UserRound className="size-3.5" aria-hidden />{ROLE_LABEL[inv.role]}</Link></p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setO({ k: "item" })} aria-label="Add Item" className={clsx(empty ? btnPrimary : btnLine, "max-sm:w-10 max-sm:px-0")}><Plus className="size-4" /><span className="max-sm:hidden">Add Item</span></button>
              <button disabled={empty} onClick={() => setO({ k: "transfer" })} aria-label="Transfer" className={clsx(btnLine, "max-sm:w-10 max-sm:px-0")}><ArrowLeftRight className="size-4" /><span className="max-sm:hidden">Transfer</span></button>
              <button disabled={empty} onClick={() => setO({ k: "move", type: "issue" })} aria-label="Issue Stock" className={clsx(btnLine, "max-sm:w-10 max-sm:px-0")}><Upload className="size-4" /><span className="max-sm:hidden">Issue</span></button>
              <button disabled={empty} onClick={() => setO({ k: "move", type: "receive" })} className={empty ? btnLine : btnPrimary}><Download className="size-4" />Receive</button>
              <div ref={mref} className="relative">
                <button disabled={empty} onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label="More stock actions" className={btnIcon}><MoreHorizontal className="size-4" /></button>
                {menu && (
                  <div role="menu" className="hms-pop absolute right-0 top-11 z-30 w-64 rounded-xl border border-hms-line bg-white p-1.5 shadow-lg">
                    {([["wastage", Trash2, "Record Wastage", "Damaged or unusable stock"], ["adjust", ClipboardCheck, "Adjust Stock", "Fix one item's balance"]] as const).map(([t, I, l, s]) => (
                      <button key={t} role="menuitem" onClick={() => { setMenu(false); setO({ k: "move", type: t }); }} className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-hms-hover">
                        <I className="mt-0.5 size-4 text-hms-muted" /><span><span className="block text-[14px] font-semibold">{l}</span><span className="text-[12.5px] text-hms-muted">{s}</span></span>
                      </button>
                    ))}
                    <button role="menuitem" onClick={() => { setMenu(false); setO({ k: "po" }); }} className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-hms-hover"><ShoppingCart className="mt-0.5 size-4 text-hms-muted" /><span><span className="block text-[14px] font-semibold">New purchase order</span><span className="text-[12.5px] text-hms-muted">Order from a supplier</span></span></button>
                    <button role="menuitem" onClick={() => { setMenu(false); setO({ k: "sales" }); }} className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-hms-hover"><ChefHat className="mt-0.5 size-4 text-hms-muted" /><span><span className="block text-[14px] font-semibold">Record sales</span><span className="text-[12.5px] text-hms-muted">Use ingredients by recipe</span></span></button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <nav aria-label="Inventory sections" className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-hms-line">
            {TABS.map((t) => {
              const badge = t.id === "purchase" ? inv.st.pos.filter((p) => p.status === "pending").length : t.id === "stock" ? inv.st.approvals.filter((a) => a.status === "pending").length : 0;
              return (
                <Link key={t.id} href={t.href} aria-current={tab === t.id ? "page" : undefined} className={clsx("-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-[14.5px] font-semibold", tab === t.id ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>
                  <t.icon className="size-4" />{t.label}{badge > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-[#b11c29] px-1.5 text-[11.5px] text-white">{badge}<span className="sr-only"> waiting</span></span>}
                </Link>
              );
            })}
          </nav>
          <div key={tab} className="hms-page-in mt-5">{children}</div>
        </div>
      </div>
      {o?.k === "item" && <ItemSheet inv={inv} item={o.item} onClose={() => setO(null)} />}
      {o?.k === "move" && <MoveSheet inv={inv} type={o.type} itemId={o.item} store={store} onClose={() => setO(null)} onDone={setToast} />}
      {o?.k === "transfer" && <TransferSheet inv={inv} itemId={o.item} from={store} onClose={() => setO(null)} onDone={setToast} />}
      {o?.k === "cat" && <CategorySheet inv={inv} cat={o.cat} onClose={() => setO(null)} />}
      {o?.k === "sup" && <SupplierSheet inv={inv} sup={o.sup} onClose={() => setO(null)} />}
      {o?.k === "store" && <StoreSheet inv={inv} loc={o.store} onClose={() => setO(null)} />}
      {o?.k === "po" && <PoSheet inv={inv} po={o.po} prefill={o.prefill} onClose={() => setO(null)} onDone={(id, msg) => { setToast(msg); setO({ k: "poView", id }); }} />}
      {o?.k === "poView" && <PoView inv={inv} id={o.id} onClose={() => setO(null)} onEdit={(po) => setO({ k: "po", po })} onDone={setToast} />}
      {o?.k === "recipe" && <RecipeSheet inv={inv} recipe={o.recipe} onClose={() => setO(null)} />}
      {o?.k === "sales" && <SalesSheet inv={inv} onClose={() => setO(null)} onDone={setToast} />}
      {toast && <div role="status" className="hms-up fixed bottom-6 left-1/2 z-[95] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0f1720] px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"><CircleCheck className="size-4 shrink-0 text-[#7ee2a8]" />{toast}</div>}
    </C.Provider>
  );
}

/** Store picker used on Stock, History and Reports ("" = all stores). */
export function StorePicker({ className }: { className?: string }) {
  const { inv, store, setStore } = useInv();
  return (
    <select aria-label="Store" value={store} onChange={(e) => setStore(e.target.value)} className={clsx("h-10 rounded-lg border border-hms-line bg-white px-3 text-[14px] font-semibold outline-none focus:border-hms-ink", className)}>
      <option value="">All stores</option>
      {inv.st.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}
