// Page loaders in one place so the router (lazy) and nav links (prefetch on hover) share them.
export const loaders = {
  '/products': () => import('./pages/products'),
  '/pricing': () => import('./pages/pricing'),
  '/help': () => import('./pages/help'),
  '/contact': () => import('./pages/contact'),
  '/solutions': () => import('./pages/solutions'),
  '/themes': () => import('./pages/themes'),
  '/blog': () => import('./pages/blog'),
  '/customers': () => import('./pages/customers'),
  '/changelog': () => import('./pages/changelog'),
  '/partners': () => import('./pages/partners'),
  '/careers': () => import('./pages/careers'),
  '/docs': () => import('./pages/docs'),
} as const
export const loadSolution = () => import('./pages/solutions/Detail')
export const loadPost = () => import('./pages/blog/Post')
export const loadDoc = () => import('./pages/docs/Page')
export const loadArticle = () => import('./pages/help/Article')
export const loadLegal = () => import('./pages/legal')
export const loadFoundation = () => import('./pages/foundation')
export const loadNotFound = () => import('./pages/not-found')

const done = new Set<string>()
export function prefetch(path: string) {
  const fn = (loaders as Record<string, () => Promise<unknown>>)[path]
  if (fn && !done.has(path)) { done.add(path); fn().catch(() => done.delete(path)) }
}
