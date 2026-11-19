import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '@/lib/auth'
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

function Guard({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, ready } = useAuth()
  const { t } = useLang()
  const loc = useLocation()
  if (!ready) return <div className="p-8"><ListSkeleton /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (roles && !roles.includes(user.role)) return <Shell><Empty title={t({ bn: 'এই পাতায় আপনার অনুমতি নেই', en: 'Your role cannot open this page' })} sub={t({ bn: 'দরকার হলে একজন ওনারকে বলুন।', en: 'Ask an owner if you need it.' })} /></Shell>
  return <Shell><Suspense fallback={<ListSkeleton />}>{children}</Suspense></Shell>
}

// Demo build runs inside an artifact frame: hash routing, no server paths
const Router = import.meta.env.MODE === 'demo' ? HashRouter : BrowserRouter
const mod = (id: string) => allModules.find((m) => m.id === id)!

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/" element={<Guard><Dashboard /></Guard>} />
        <Route path="/leads" element={<Guard roles={mod('M03').roles}><Leads /></Guard>} />
        <Route path="/visitors" element={<Guard roles={mod('M04').roles}><Visitors /></Guard>} />
        <Route path="/seo" element={<Guard roles={mod('M05').roles}><Seo /></Guard>} />
        {allModules.filter((m) => m.types).map((m) => <Route key={m.id} path={m.path} element={<Guard roles={m.roles}><ContentModule mod={m} /></Guard>} />)}
        <Route path="/media" element={<Guard roles={mod('M19').roles}><MediaLibrary /></Guard>} />
        <Route path="/publish" element={<Guard roles={mod('M20').roles}><Publish /></Guard>} />
        <Route path="/users" element={<Guard roles={mod('M21').roles}><Users /></Guard>} />
        <Route path="/audit" element={<Guard roles={mod('M22').roles}><Audit /></Guard>} />
        <Route path="/account" element={<Guard><Account /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
