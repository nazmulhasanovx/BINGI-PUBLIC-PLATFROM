import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'

/** Top announcement bar (admin → Site settings → Announcement). Hidden when empty or dismissed. */
export function Announcement() {
  const { t } = useLang()
  const a = site.announcement
  const key = a ? `bingi-ann-${a.en.slice(0, 40)}` : ''
  const [hidden, setHidden] = useState(true)
  useEffect(() => { try { setHidden(!a || !(a.bn || a.en) || localStorage.getItem(key) === '1') } catch { setHidden(!a) } }, [a, key])
  if (hidden || !a) return null
  return (
    <div className="relative bg-ink px-10 py-2 text-center text-[14px] text-white">
      {t(a)}
      <button type="button" aria-label={t({ bn: 'বন্ধ করুন', en: 'Close' })} onClick={() => { setHidden(true); try { localStorage.setItem(key, '1') } catch { /* private mode */ } }} className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full hover:bg-white/10"><X className="size-4" /></button>
    </div>
  )
}

/**
 * Google Analytics / Meta Pixel load ONLY after the visitor agrees, and only when an ID is set in the admin.
 * With no IDs (default) nothing loads and no banner shows — the site's own visitor count needs no cookies.
 */
export function Consent() {
  const { t } = useLang()
  const ids = { ga: site.gaId, px: site.pixelId }
  const [choice, setChoice] = useState<string | null>('unset')
  useEffect(() => { try { setChoice(localStorage.getItem('bingi-consent')) } catch { setChoice(null) } }, [])
  useEffect(() => {
    if (choice !== 'yes') return
    if (ids.ga && !document.getElementById('ga')) {
      const s = document.createElement('script'); s.id = 'ga'; s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${ids.ga}`; document.head.appendChild(s)
      const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void }
      w.dataLayer = w.dataLayer || []; w.gtag = function gtag() { w.dataLayer.push(arguments) }; w.gtag('js', new Date()); w.gtag('config', ids.ga)
    }
    if (ids.px && !document.getElementById('px')) {
      const s = document.createElement('script'); s.id = 'px'
      s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ids.px.replace(/\D/g, '')}');fbq('track','PageView');`
      document.head.appendChild(s)
    }
  }, [choice, ids.ga, ids.px])
  if ((!ids.ga && !ids.px) || choice !== null) return null
  const set = (v: 'yes' | 'no') => { setChoice(v); try { localStorage.setItem('bingi-consent', v) } catch { /* private mode */ } }
  return (
    <div role="dialog" aria-label={t({ bn: 'কুকি', en: 'Cookies' })} className="fixed inset-x-3 bottom-3 z-[75] mx-auto flex max-w-[560px] flex-col gap-3 rounded-[20px] border border-line bg-white p-4 shadow-lift sm:flex-row sm:items-center">
      <p className="text-[14px] text-muted-foreground">{t({ bn: 'বিজ্ঞাপন ও পরিসংখ্যানের জন্য আমরা Google/Meta কুকি ব্যবহার করতে চাই। রাজি?', en: 'We would like to use Google/Meta cookies for ads and statistics. OK?' })}</p>
      <div className="flex shrink-0 gap-2"><button type="button" onClick={() => set('no')} className="btn-ghost h-11 px-4 cursor-pointer">{t({ bn: 'না', en: 'No' })}</button><button type="button" onClick={() => set('yes')} className="btn-primary h-11 px-4 cursor-pointer">{t({ bn: 'রাজি', en: 'Accept' })}</button></div>
    </div>
  )
}
