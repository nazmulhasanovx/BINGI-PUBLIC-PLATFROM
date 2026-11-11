import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
// Self-hosted fonts (no third-party render-blocking request); unicode-range loads only needed subsets.
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/500.css'
import '@fontsource/instrument-sans/600.css'
import '@fontsource/hind-siliguri/400.css'
import '@fontsource/hind-siliguri/500.css'
import '@fontsource/hind-siliguri/600.css'
import './index.css'
import App from './App'
import { seo } from './data/seo'
import { markHydrated } from './components/ui/timeline-animation'

const root = document.getElementById('root')!
const app = <StrictMode><App /></StrictMode>
const path = location.pathname.replace(/\/+$/, '') || '/'
const ssr = root.dataset.ssr
// Hydrate only when the prerendered HTML belongs to this URL ('*' = the 404 page for any unknown URL);
// otherwise (dev, single-file preview, host fallback to another page) render fresh.
const matches = ssr !== undefined && (ssr === '*' ? !(path in seo) : ssr === path)
if (matches && root.firstElementChild) hydrateRoot(root, app)
else { markHydrated(); root.textContent = ''; createRoot(root).render(app) }
