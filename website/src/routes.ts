// Page loaders in one place so the router (lazy) and nav links (prefetch on hover) share them.
export const loaders = {
  '/products': () => import('./pages/products'),
  '/pricing': () => import('./pages/pricing'),
  '/help': () => import('./pages/help'),
  '/contact': () => import('./pages/contact'),
} as const
export const loadArticle = () => import('./pages/help/Article')
export const loadLegal = () => import('./pages/legal')
export const loadNotFound = () => import('./pages/not-found')

const done = new Set<string>()
export function prefetch(path: string) {
  const fn = (loaders as Record<string, () => Promise<unknown>>)[path]
  if (fn && !done.has(path)) { done.add(path); fn().catch(() => done.delete(path)) }
}
