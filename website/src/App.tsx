import { lazy, Suspense } from 'react'
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LangProvider } from './i18n/lang'
import { Layout } from './components/layout/Layout'
import Home from './pages/home'

const Products = lazy(() => import('./pages/products'))
const Pricing = lazy(() => import('./pages/pricing'))
const Help = lazy(() => import('./pages/help'))
const Article = lazy(() => import('./pages/help/Article'))
const Contact = lazy(() => import('./pages/contact'))
const Legal = lazy(() => import('./pages/legal'))
const NotFound = lazy(() => import('./pages/not-found'))

// Single-file preview build keeps routes in memory (works inside a sandboxed preview); the real site uses clean URLs.
const Router = import.meta.env.MODE === 'single' ? MemoryRouter : BrowserRouter

function Skeleton() {
  return <div className="container-x pt-14 space-y-4" aria-busy="true"><div className="h-10 w-2/3 mx-auto rounded-full bg-line/60 animate-pulse" /><div className="h-64 rounded-[16px] bg-line/40 animate-pulse" /></div>
}

export default function App() {
  return (
    <LangProvider>
      <Router>
        <Suspense fallback={<Skeleton />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="help" element={<Help />} />
              <Route path="help/:slug" element={<Article />} />
              <Route path="contact" element={<Contact />} />
              <Route path="legal/:doc" element={<Legal />} />
              {/* old URLs from the current site */}
              <Route path="ecosystem" element={<Navigate to="/products" replace />} />
              <Route path="start" element={<Navigate to="/pricing" replace />} />
              <Route path="training" element={<Navigate to="/help" replace />} />
              <Route path="connected" element={<Navigate to="/products" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </LangProvider>
  )
}
