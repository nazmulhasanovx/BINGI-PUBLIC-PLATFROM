// Build-time prerender entry. Renders one URL to HTML, waiting for lazy pages (React 19 static prerender).
import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import App from './App'

export async function render(url: string): Promise<string> {
  const { prelude } = await prerender(<StrictMode><App ssrUrl={url} /></StrictMode>)
  return new Response(prelude).text()
}
