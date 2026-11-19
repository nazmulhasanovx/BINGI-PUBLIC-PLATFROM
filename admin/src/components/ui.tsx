import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react'
import { useLang, type L } from '@/lib/i18n'

/* ── Buttons ─────────────────────────────────────────── */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'quiet' | 'danger'; size?: 'md' | 'sm'; loading?: boolean }
export function Button({ variant = 'ghost', size = 'md', loading, className, children, disabled, ...p }: BtnProps) {
  return (
    <button type="button" {...p} disabled={disabled || loading}
      className={clsx('inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition-[transform,box-shadow,background,opacity] duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'md' ? 'h-11 px-5 text-[15px]' : 'h-9 px-3.5 text-[14px]',
        variant === 'primary' && 'border border-brand-edge bg-linear-to-t from-brand to-brand-2 text-white shadow-[0_8px_20px_-10px_rgb(177_28_41/0.8)] hover:brightness-110',
        variant === 'ghost' && 'border border-line bg-white text-ink shadow-soft hover:shadow-lift',
        variant === 'quiet' && 'text-ink hover:bg-black/[0.05]',
        variant === 'danger' && 'border border-[#F3C5C5] bg-white text-bad hover:bg-bad-soft',
        className)}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
export function IconButton({ label, children, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button type="button" aria-label={label} title={label} {...p} className={clsx('grid size-10 cursor-pointer place-items-center rounded-full text-ink/70 hover:bg-black/[0.05] hover:text-ink disabled:opacity-40', className)}>{children}</button>
}

/* ── Form controls ───────────────────────────────────── */
const control = 'w-full rounded-[12px] border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-soft/70 transition-[border,box-shadow] focus:border-link focus:outline-none focus:ring-4 focus:ring-link/10 aria-[invalid=true]:border-bad'
export const Input = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={clsx(control, 'h-11', className)} />
export const Textarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={3} {...p} className={clsx(control, 'py-2.5 leading-relaxed', className)} />
export const Select = ({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={clsx(control, 'h-11 cursor-pointer pr-8', className)}>{children}</select>

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={clsx('relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors', checked ? 'bg-ok' : 'bg-[#D5DBE3]')}>
      <span className={clsx('size-6 rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-[22px]' : 'translate-x-[2px]')} />
    </button>
  )
}

export function Field({ label, help, error, children, required, htmlFor }: { label: string; help?: string; error?: string; children: ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[14px] font-medium text-ink">{label}{required && <span className="text-bad"> *</span>}</label>
      {children}
      {error ? <p role="alert" className="text-[13px] text-bad">{error}</p> : help ? <p className="text-[13px] text-soft">{help}</p> : null}
    </div>
  )
}
export const useFieldId = () => useId()

/* ── Surfaces ────────────────────────────────────────── */
export const Card = ({ className, children }: { className?: string; children: ReactNode }) => <div className={clsx('rounded-[20px] border border-line bg-white shadow-soft', className)}>{children}</div>

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[30px]">{title}</h1>
        {sub && <div className="mt-1 max-w-[640px] text-[15px] text-soft">{sub}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Chip({ tone = 'neutral', children }: { tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'brand'; children: ReactNode }) {
  return <span className={clsx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium',
    tone === 'neutral' && 'bg-canvas text-soft border border-line', tone === 'ok' && 'bg-ok-soft text-ok', tone === 'warn' && 'bg-warn-soft text-warn',
    tone === 'bad' && 'bg-bad-soft text-bad', tone === 'info' && 'bg-info-soft text-link', tone === 'brand' && 'bg-brand-soft text-brand')}>{children}</span>
}

export function StateChip({ state }: { state: 'draft' | 'changed' | 'published' | 'deleted' }) {
  const { t } = useLang()
  const map = { draft: ['info', { bn: 'নতুন · পাবলিশ বাকি', en: 'New · not published' }], changed: ['warn', { bn: 'বদলানো · পাবলিশ বাকি', en: 'Changed · not published' }], published: ['ok', { bn: 'পাবলিশড', en: 'Published' }], deleted: ['bad', { bn: 'মুছবে', en: 'Will be removed' }] } as const
  const [tone, l] = map[state]
  return <Chip tone={tone}>{t(l)}</Chip>
}

export function Tabs<T extends string>({ items, value, onChange }: { items: { id: T; label: string; badge?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="no-scrollbar -mx-1 mb-5 flex gap-1 overflow-x-auto px-1">
      {items.map((i) => (
        <button key={i.id} role="tab" type="button" aria-selected={value === i.id} onClick={() => onChange(i.id)}
          className={clsx('inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors', value === i.id ? 'bg-ink text-white' : 'text-soft hover:bg-black/[0.05] hover:text-ink')}>
          {i.label}{!!i.badge && <span className={clsx('rounded-full px-1.5 text-[11px]', value === i.id ? 'bg-white/20' : 'bg-warn-soft text-warn')}>{i.badge}</span>}
        </button>
      ))}
    </div>
  )
}

/* ── States: loading · empty · error ─────────────────── */
export const Skeleton = ({ className }: { className?: string }) => <div className={clsx('skeleton', className)} aria-hidden="true" />
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return <div className="space-y-3" aria-busy="true">{Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-16" />)}</div>
}
export function Empty({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-dashed border-line-strong bg-white/60 px-6 py-12 text-center">
      <p className="text-[16px] font-semibold">{title}</p>
      {sub && <p className="mx-auto mt-1 max-w-[420px] text-[14px] text-soft">{sub}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}
export function ErrorBox({ error, retry }: { error: unknown; retry?: () => void }) {
  const { t } = useLang()
  const msg = error instanceof Error ? error.message : String(error)
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-[16px] border border-[#F3C5C5] bg-bad-soft px-5 py-4 text-[14px] text-bad sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" aria-hidden="true" />{msg}</span>
      {retry && <Button size="sm" variant="ghost" onClick={retry}>{t({ bn: 'আবার চেষ্টা', en: 'Try again' })}</Button>}
    </div>
  )
}

/* ── Drawer (side sheet) and confirm dialog ──────────── */
function useEscape(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [open, close])
}
export function Drawer({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const { t } = useLang()
  useEscape(open, onClose)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (open) setTimeout(() => ref.current?.querySelector<HTMLElement>('input,textarea,select')?.focus(), 60) }, [open])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="animate-fade absolute inset-0 bg-ink/25" onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={clsx('animate-sheet relative flex h-full w-full flex-col bg-pearl shadow-2xl', wide ? 'max-w-[860px]' : 'max-w-[620px]')}>
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-5">
          <h2 className="truncate text-[17px] font-semibold">{title}</h2>
          <IconButton label={t({ bn: 'বন্ধ করুন', en: 'Close' })} onClick={onClose}><X className="size-5" /></IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-white px-5 py-3">{footer}</div>}
      </div>
    </div>, document.body)
}

type Confirm = { title: string; body?: string; ok: string; danger?: boolean }
const ConfirmCtx = createContext<(c: Confirm) => Promise<boolean>>(async () => false)
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const [c, setC] = useState<(Confirm & { resolve: (v: boolean) => void }) | null>(null)
  const ask = useCallback((x: Confirm) => new Promise<boolean>((resolve) => setC({ ...x, resolve })), [])
  const done = (v: boolean) => { c?.resolve(v); setC(null) }
  useEscape(!!c, () => done(false))
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {c && createPortal(
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <div className="animate-fade absolute inset-0 bg-ink/30" onClick={() => done(false)} aria-hidden="true" />
          <div role="alertdialog" aria-modal="true" aria-label={c.title} className="animate-pop relative w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl">
            <h2 className="text-[18px] font-semibold">{c.title}</h2>
            {c.body && <p className="mt-2 text-[15px] text-soft">{c.body}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => done(false)}>{t({ bn: 'বাতিল', en: 'Cancel' })}</Button>
              <Button variant={c.danger ? 'danger' : 'primary'} onClick={() => done(true)} autoFocus>{c.ok}</Button>
            </div>
          </div>
        </div>, document.body)}
    </ConfirmCtx.Provider>
  )
}
export const useConfirm = () => useContext(ConfirmCtx)

/* ── Toasts ──────────────────────────────────────────── */
type Toast = { id: number; tone: 'ok' | 'bad' | 'info'; text: string }
const ToastCtx = createContext<(tone: Toast['tone'], text: string | L) => void>(() => {})
export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const [list, setList] = useState<Toast[]>([])
  const push = useCallback((tone: Toast['tone'], text: string | L) => {
    const id = Date.now() + Math.random()
    setList((l) => [...l, { id, tone, text: t(text) }])
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4200)
  }, [t])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-[70] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2" aria-live="polite">
          {list.map((x) => (
            <div key={x.id} className="animate-pop pointer-events-auto flex items-center gap-2.5 rounded-[16px] bg-ink px-4 py-3 text-[14px] text-white shadow-lift">
              {x.tone === 'ok' ? <CheckCircle2 className="size-4 text-[#7BE0A0]" /> : x.tone === 'bad' ? <AlertTriangle className="size-4 text-[#FF9A94]" /> : <Info className="size-4 text-[#9EC1FF]" />}
              {x.text}
            </div>
          ))}
        </div>, document.body)}
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)
