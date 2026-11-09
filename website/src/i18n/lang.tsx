import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'bn' | 'en'
export type L = { bn: string; en: string }

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('bingi-lang')
    if (saved === 'bn' || saved === 'en') return saved
  } catch { /* storage unavailable */ }
  return 'en' // English is the site language; বাংলা stays available from the header toggle
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const setLang = (l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('bingi-lang', l) } catch { /* ignore */ }
  }
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLang() {
  const { lang, setLang } = useContext(Ctx)
  const t = (l: L) => l[lang]
  const bnDigits = '০১২৩৪৫৬৭৮৯'
  const num = (n: number, opts?: Intl.NumberFormatOptions) => {
    const s = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, ...opts }).format(n)
    return lang === 'bn' ? s.replace(/\d/g, (d) => bnDigits[+d]) : s
  }
  const taka = (n: number) => `৳${num(n)}`
  return { lang, setLang, t, num, taka }
}
