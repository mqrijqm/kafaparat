'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { CAYE, GOLDEN_STANDARD } from '@/lib/content'
import { useCopy, useLang } from '@/lib/i18n'
import { IconArrowUpRight } from './icons'

/** CAYE × Golden Standard: both wordmarks in brass, one line, one link. */
export function GoldenStandard() {
  const t = useCopy().gs
  const { lang } = useLang()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // the two marks slide in toward the ×, then the copy follows
      const st = { trigger: root.current, start: 'top 75%', toggleActions: 'play none none reverse' }
      gsap.from('.gs-collab > *', {
        opacity: 0,
        x: (i: number) => (i - 1) * -40,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: st,
      })
      gsap.from('.gs > :not(.gs-collab)', { opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.2, scrollTrigger: st })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="golden-standard" className="gs">
      <a href={GOLDEN_STANDARD.url[lang]} target="_blank" rel="noopener" className="gs-collab" aria-label="CAYE × Golden Standard">
        <span className="caye-logo" style={{ ['--src' as string]: `url(${CAYE.logo})` }} />
        <span className="gs-x" aria-hidden>
          ×
        </span>
        <span className="gs-wordmark" style={{ ['--src' as string]: `url(${GOLDEN_STANDARD.wordmark})` }} />
      </a>
      <span className="gs-eyebrow text-ui">{t.eyebrow}</span>
      <h2>
        <span>{t.title[0]}</span>
        <span>{t.title[1]}</span>
      </h2>
      <p>{t.lead}</p>
      <a href={GOLDEN_STANDARD.url[lang]} target="_blank" rel="noopener" className="btn-partner text-ui">
        {t.cta}
        <IconArrowUpRight />
      </a>
    </section>
  )
}
