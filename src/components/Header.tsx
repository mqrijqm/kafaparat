'use client'

import { CAYE, GOLDEN_STANDARD, LANGS, NAV_HREFS } from '@/lib/content'
import { useCopy, useLang } from '@/lib/i18n'
import { CartButton } from './Cart'

export default function Header() {
  const t = useCopy()
  const { lang, setLang } = useLang()
  return (
    <header className="site-header">
      {/* CAYE × Golden Standard, both in gold */}
      <a href="#intro" className="logo cell" aria-label="CAYE × Golden Standard">
        <span className="caye-logo" style={{ ['--src' as string]: `url(${CAYE.logo})` }} />
        <span className="logo-x" aria-hidden>
          ×
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={GOLDEN_STANDARD.mark} alt="" className="logo-gs" />
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
      <a href={GOLDEN_STANDARD.url[lang]} target="_blank" rel="noopener" className="gs-partner cell text-ui">
        <span className="hide-sm">{t.partner}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={GOLDEN_STANDARD.mark} alt="Golden Standard" />
      </a>
    </header>
  )
}
