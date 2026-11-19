import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, post } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useLang } from '@/lib/i18n'
import { Button, Field, Input } from '@/components/ui'

function Frame({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-[radial-gradient(80%_60%_at_50%_0%,#FFE7E4,transparent_70%)] px-4">
      <div className="w-full max-w-[400px]">
        <img src={`${import.meta.env.BASE_URL}bingi-logo.png`} alt="BinGi" className="mx-auto h-9 w-auto" />
        <div className="mt-6 rounded-[28px] border border-line bg-white p-6 shadow-lift md:p-8">
          <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-[14px] text-soft">{sub}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function Login() {
  const { t } = useLang()
  const { login } = useAuth()
  const nav = useNavigate()
  const demo = import.meta.env.MODE === 'demo'
  const [email, setEmail] = useState(demo ? 'demo@bingi.local' : '')
  const [password, setPassword] = useState(demo ? 'demo' : '')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true)
    try { await login(email, password); nav('/', { replace: true }) } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <Frame title={t({ bn: 'অ্যাডমিনে সাইন ইন', en: 'Sign in to the admin' })} sub={t({ bn: 'BinGi পাবলিক সাইটের কনটেন্ট, লিড আর ভিজিটর।', en: 'Content, leads and visitors of the BinGi public site.' })}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label={t({ bn: 'ইমেইল', en: 'Email' })} htmlFor="email"><Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label={t({ bn: 'পাসওয়ার্ড', en: 'Password' })} htmlFor="password"><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        {err && <p role="alert" className="rounded-[12px] bg-bad-soft px-3 py-2 text-[14px] text-bad">{err}</p>}
        <Button type="submit" variant="primary" loading={busy} className="w-full">{t({ bn: 'সাইন ইন', en: 'Sign in' })}</Button>
        <Link to="/forgot" className="block text-center text-[14px] text-link hover:underline">{t({ bn: 'পাসওয়ার্ড ভুলে গেছেন?', en: 'Forgot password?' })}</Link>
      </form>
    </Frame>
  )
}

export function Forgot() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <Frame title={t({ bn: 'পাসওয়ার্ড রিসেট', en: 'Reset password' })} sub={t({ bn: 'ইমেইলে একটা লিংক যাবে।', en: 'We will email you a link.' })}>
      {sent ? <p role="status" className="rounded-[12px] bg-ok-soft px-3 py-3 text-[14px] text-ok">{t({ bn: 'এই ইমেইলে অ্যাকাউন্ট থাকলে লিংক পাঠানো হয়েছে।', en: 'If this email has an account, a link is on its way.' })}</p> : (
        <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await post('/auth/forgot', { email }) } catch { /* same answer either way */ } setSent(true); setBusy(false) }} className="space-y-4">
          <Field label={t({ bn: 'ইমেইল', en: 'Email' })} htmlFor="email"><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <Button type="submit" variant="primary" loading={busy} className="w-full">{t({ bn: 'লিংক পাঠান', en: 'Send link' })}</Button>
        </form>
      )}
      <Link to="/login" className="mt-4 block text-center text-[14px] text-link hover:underline">{t({ bn: 'সাইন ইনে ফিরুন', en: 'Back to sign in' })}</Link>
    </Frame>
  )
}

export function Reset() {
  const { t } = useLang()
  const [q] = useSearchParams()
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  return (
    <Frame title={t({ bn: 'নতুন পাসওয়ার্ড', en: 'Set a new password' })} sub={t({ bn: 'কমপক্ষে 10 অক্ষর।', en: 'At least 10 characters.' })}>
      <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(null); try { await post('/auth/reset', { email: q.get('email'), token: q.get('token'), password: pw }); nav('/login') } catch (x) { setErr(x instanceof ApiError ? (x.fields.password ?? x.message) : String(x)) } finally { setBusy(false) } }} className="space-y-4">
        <Field label={t({ bn: 'নতুন পাসওয়ার্ড', en: 'New password' })} htmlFor="pw" error={err ?? undefined}><Input id="pw" type="password" autoComplete="new-password" minLength={10} value={pw} onChange={(e) => setPw(e.target.value)} required /></Field>
        <Button type="submit" variant="primary" loading={busy} className="w-full">{t({ bn: 'সেভ করুন', en: 'Save' })}</Button>
      </form>
    </Frame>
  )
}
