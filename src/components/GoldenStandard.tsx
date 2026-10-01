'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { GOLDEN_STANDARD } from '@/lib/content'
import { useCopy, useLang } from '@/lib/i18n'
import { IconArrowRight, IconArrowUpRight, IconPlus } from './icons'

/** "Powered by Golden Standard": the system behind the machine, coffee, milk and hygiene on this site. */
export function GoldenStandard() {
  const t = useCopy().gs
  const { lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const url = GOLDEN_STANDARD.url[lang]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // the emblem rises out of its own glow, then the copy and pillars follow
      gsap.fromTo(
        '.gs-logo',
        { opacity: 0, y: 40, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 70%', toggleActions: 'play none none reverse' } },
      )
      gsap.fromTo(
        '.gs-glow',
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top 70%', toggleActions: 'play none none reverse' } },
      )
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current).forEach((block) => {
        gsap.from(block.children, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: block, start: 'top 82%', toggleActions: 'play none none reverse' },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="golden-standard" className="gs">
      <div className="gs-glow" aria-hidden />
      <header className="gs-intro">
        <a href={url} target="_blank" rel="noopener" className="gs-logo" aria-label="Golden Standard — goldenstandard.eu">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={GOLDEN_STANDARD.logo} alt="Golden Standard" />
        </a>
        <div data-reveal className="gs-intro-copy">
          <span className="gs-eyebrow text-ui">{t.eyebrow}</span>
          <h2>
            <span>{t.title[0]}</span>
            <span>{t.title[1]}</span>
          </h2>
          <p>{t.lead}</p>
        </div>
      </header>

      <ol className="gs-pillars" data-reveal>
        {t.pillars.map(([h, p], i) => (
          <li key={h}>
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
            <h3>{h}</h3>
            <p>{p}</p>
          </li>
        ))}
      </ol>

      <div className="gs-split">
        <ul className="gs-machines" data-reveal>
          {t.machines.map(([name, sub]) => (
            <li key={name}>
              <a href={url} target="_blank" rel="noopener">
                <b>{name}</b>
                <span>{sub}</span>
                <IconArrowRight />
              </a>
            </li>
          ))}
        </ul>
        <div className="gs-faq" data-reveal>
          <details open>
            <summary>
              {t.faq.q}
              <IconPlus />
            </summary>
            <p>{t.faq.a}</p>
          </details>
        </div>
      </div>

      {/* the four brands they distribute, as a slow marquee */}
      <div className="gs-marquee" aria-label={GOLDEN_STANDARD.brands.join(', ')}>
        <div className="gs-track" aria-hidden>
          {[0, 1].map((k) => (
            <span key={k}>
              {GOLDEN_STANDARD.brands.map((b) => (
                <em key={b}>
                  {b}
                  <i />
                </em>
              ))}
            </span>
          ))}
        </div>
      </div>

      <footer className="gs-cta" data-reveal>
        <p>{t.claim}</p>
        <a href={url} target="_blank" rel="noopener" className="gs-button text-ui">
          {t.cta}
          <IconArrowUpRight />
        </a>
      </footer>
    </section>
  )
}
