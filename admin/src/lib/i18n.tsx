import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type L = { bn: string; en: string }
type Lang = 'bn' | 'en'
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (l: L | string | undefined | null) => string }>(null!)

/** Every UI string is { bn, en }. The admin remembers the chosen language in this browser. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => { try { return (localStorage.getItem('bingi-admin-lang') as Lang) || 'bn' } catch { return 'bn' } })
  useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('bingi-admin-lang', lang) } catch { /* private mode */ } }, [lang])
  const t = (l: L | string | undefined | null) => (l == null ? '' : typeof l === 'string' ? l : l[lang] || l.en || l.bn || '')
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}
export const useLang = () => useContext(Ctx)
