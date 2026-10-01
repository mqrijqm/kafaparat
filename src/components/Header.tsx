'use client'

import { LANGS, NAV_HREFS, PARTNER_HREF } from '@/lib/content'
import { useCopy, useLang } from '@/lib/i18n'
import { CartButton } from './Cart'
import { IconArrowUpRight } from './icons'

export default function Header() {
  const t = useCopy()
  const { lang, setLang } = useLang()
  return (
    <header className="site-header">
      <a href="#intro" className="logo cell" aria-label="Kafaparat">
        kafaparat<i />
        <small>No.1</small>
      </a>
      <nav className="nav cell text-ui" aria-label="Main">
        {NAV_HREFS.map((href, i) => (
          <a key={href} href={href}>
            <span className="num">0{i + 1}</span>
            {t.nav[i]}
          </a>
        ))}
      </nav>
      <div className="lang-toggle cell text-ui" role="group" aria-label={t.langLabel}>
        {LANGS.map((l) => (
          <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
            {l}
          </button>
        ))}
      </div>
      <CartButton className="cell" />
      <a href={PARTNER_HREF} className="btn-partner cell text-ui">
        <span className="hide-sm">{t.partner.long}</span>
        <span className="show-sm">{t.partner.short}</span>
        <IconArrowUpRight />
      </a>
    </header>
  )
}
