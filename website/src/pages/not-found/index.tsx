import { Link } from 'react-router-dom'
import { useLang } from '../../i18n/lang'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="container-x pt-24 text-center">
      <p className="display text-[120px] md:text-[160px] text-brand/90">404</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-semibold tracking-[-0.02em]">{t({ bn: 'পেজটা পাওয়া যায়নি', en: 'Page not found' })}</h1>
      <p className="lead mt-2">{t({ bn: 'লিংকটা পুরনো হতে পারে।', en: 'The link may be outdated.' })}</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary">{t({ bn: 'হোমে যান', en: 'Go home' })}</Link>
        <Link to="/help" className="btn-ghost">{t({ bn: 'হেল্পে খুঁজুন', en: 'Search help' })}</Link>
      </div>
    </div>
  )
}
