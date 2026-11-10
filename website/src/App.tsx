import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, StaticRouter } from 'react-router'
import { LangProvider } from './i18n/lang'
import { Layout } from './components/layout/Layout'
import Home from './pages/home'

import { loaders, loadArticle, loadLegal, loadNotFound, loadFoundation, loadSolution, loadPost, loadDoc } from './routes'

const Products = lazy(loaders['/products'])
const Pricing = lazy(loaders['/pricing'])
const Help = lazy(loaders['/help'])
const Article = lazy(loadArticle)
const Contact = lazy(loaders['/contact'])
const Legal = lazy(loadLegal)
const NotFound = lazy(loadNotFound)
const Foundation = lazy(loadFoundation)
const Solutions = lazy(loaders['/solutions'])
const SolutionDetail = lazy(loadSolution)
const Themes = lazy(loaders['/themes'])
const Blog = lazy(loaders['/blog'])
const Post = lazy(loadPost)
const Customers = lazy(loaders['/customers'])
const Changelog = lazy(loaders['/changelog'])
const Partners = lazy(loaders['/partners'])
const Careers = lazy(loaders['/careers'])
const Docs = lazy(loaders['/docs'])
const Doc = lazy(loadDoc)

// Prerender (build time) uses StaticRouter; the single-file review build keeps routes in memory;
// the real site uses clean URLs.
function Router({ ssrUrl, children }: { ssrUrl?: string; children: ReactNode }) {
  if (ssrUrl !== undefined) return <StaticRouter location={ssrUrl}>{children}</StaticRouter>
  if (import.meta.env.MODE === 'single') return <MemoryRouter>{children}</MemoryRouter>
  return <BrowserRouter>{children}</BrowserRouter>
}

function Skeleton() {
  return <div className="container-x pt-14 space-y-4" aria-busy="true"><div className="h-10 w-2/3 mx-auto rounded-full bg-line/60 animate-pulse" /><div className="h-64 rounded-[16px] bg-line/40 animate-pulse" /></div>
}

export default function App({ ssrUrl }: { ssrUrl?: string }) {
  return (
    <LangProvider>
      <Router ssrUrl={ssrUrl}>
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
              <Route path="foundation" element={<Foundation />} />
              <Route path="solutions" element={<Solutions />} />
              <Route path="solutions/:slug" element={<SolutionDetail />} />
              <Route path="themes" element={<Themes />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<Post />} />
              <Route path="customers" element={<Customers />} />
              <Route path="changelog" element={<Changelog />} />
              <Route path="partners" element={<Partners />} />
              <Route path="careers" element={<Careers />} />
              <Route path="docs" element={<Docs />} />
              <Route path="docs/:slug" element={<Doc />} />
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
