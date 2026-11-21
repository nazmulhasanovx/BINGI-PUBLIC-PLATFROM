import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useLang } from '@/lib/i18n'
import { allModules } from '@/lib/modules'
import { Shell } from '@/components/Shell'
import { Empty, ListSkeleton } from '@/components/ui'
import { Forgot, Login, Reset } from '@/pages/Login'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Leads = lazy(() => import('@/pages/Leads'))
const Visitors = lazy(() => import('@/pages/Visitors'))
const Seo = lazy(() => import('@/pages/Seo'))
const Publish = lazy(() => import('@/pages/Publish'))
const ContentModule = lazy(() => import('@/pages/ContentModule'))
const Users = lazy(() => import('@/pages/System').then((m) => ({ default: m.Users })))
const Audit = lazy(() => import('@/pages/System').then((m) => ({ default: m.Audit })))
const MediaLibrary = lazy(() => import('@/pages/System').then((m) => ({ default: m.MediaLibrary })))
const Account = lazy(() => import('@/pages/System').then((m) => ({ default: m.Account })))

function Guard({ module, children }: { module?: string; children: ReactNode }) {
  const { user, ready, can } = useAuth()
  const { t } = useLang()
  const loc = useLocation()
  if (!ready) return <div className="p-8"><ListSkeleton /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (module && !can(module)) return <Shell><Empty title={t({ bn: 'এই পাতায় আপনার অনুমতি নেই', en: 'Your role cannot open this page' })} sub={t({ bn: 'দরকার হলে একজন ওনারকে বলুন।', en: 'Ask an owner if you need it.' })} /></Shell>
  return <Shell><Suspense fallback={<ListSkeleton />}>{children}</Suspense></Shell>
}

// Demo build runs inside an artifact frame: hash routing, no server paths
const Router = import.meta.env.MODE === 'demo' ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/" element={<Guard><Dashboard /></Guard>} />
        <Route path="/leads" element={<Guard module='M03'><Leads /></Guard>} />
        <Route path="/visitors" element={<Guard module='M04'><Visitors /></Guard>} />
        <Route path="/seo" element={<Guard module='M05'><Seo /></Guard>} />
        {allModules.filter((m) => m.types).map((m) => <Route key={m.id} path={m.path} element={<Guard module={m.id}><ContentModule mod={m} /></Guard>} />)}
        <Route path="/media" element={<Guard module='M19'><MediaLibrary /></Guard>} />
        <Route path="/publish" element={<Guard module='M20'><Publish /></Guard>} />
        <Route path="/users" element={<Guard module='M21'><Users /></Guard>} />
        <Route path="/audit" element={<Guard module='M22'><Audit /></Guard>} />
        <Route path="/account" element={<Guard><Account /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
