'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLenis } from 'lenis/react'
import { cart } from '@/lib/cart'
import { SHOP } from '@/lib/content'
import { useCopy, useLang } from '@/lib/i18n'
import { IconArrowDown, IconCheck, IconPlus } from './icons'

function Chars({ text, tail }: { text: string; tail?: React.ReactNode }) {
  // chars are inline-blocks for the reveal; the word wrapper keeps the browser from breaking mid-word
  return (
    <span className="word">
      {text.split('').map((c, i) => (
        <span key={i} className="char">
          {c === ' ' ? ' ' : c}
        </span>
      ))}
      {tail}
    </span>
  )
}

/**
 * Cycles the last word: old chars collapse, new ones stretch in (like the reference "animate the ___.").
 * The slot is owned by GSAP (innerHTML), never by React, so re-renders can't fight the animation.
 */
function WordCycler({ words }: { words: string[] }) {
  const slot = useRef<HTMLSpanElement>(null)
  const dot = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const render = (w: string) => {
      slot.current!.innerHTML = w
        .split('')
        .map((c) => `<span class="c">${c === ' ' ? '&nbsp;' : c}</span>`)
        .join('')
      return slot.current!.querySelectorAll('.c')
    }
    render(words[0])
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let i = 0
    let alive = true
    let tl: gsap.core.Timeline | undefined
    const loop = () => {
      if (!alive) return
      const out = slot.current!.querySelectorAll('.c')
      tl = gsap.timeline({ onComplete: () => void gsap.delayedCall(1.4, loop) })
      tl.to(out, { opacity: 0, scaleX: 0, duration: 0.15, stagger: { each: 0.025, from: 'end' }, ease: 'power2.in' })
      tl.to(dot.current, { scaleX: 6, color: '#f6efe6', duration: 0.15, ease: 'power2.out' }, '<')
      tl.add(() => {
        i = (i + 1) % words.length
        const chars = render(words[i])
        gsap.fromTo(
          chars,
          { scaleX: 0, x: 10, opacity: 0 },
          { scaleX: 1, x: 0, opacity: 1, duration: 0.15, stagger: 0.025, ease: 'power2.out' },
        )
      })
      tl.to(dot.current, { scaleX: 1, color: '#c9a36a', duration: 0.3, ease: 'power3.out' })
    }
    const start = gsap.delayedCall(4, loop)
    return () => {
      alive = false
      start.kill()
      tl?.kill()
      gsap.killTweensOf(loop)
    }
  }, [words])

  return (
    <>
      <span ref={slot} className="word-slot" />
      <span ref={dot} className="word-dot">
        .
      </span>
    </>
  )
}

export function Hero() {
  const t = useCopy()
  const { lang } = useLang()
  return (
    <div className="section hero">
      <div className="section-inner">
        <div className="section-text">
          <h1 key={lang}>
            {t.hero.title.map((line, i) => (
              <span key={line}>
                {i === t.hero.title.length - 1 ? (
                  <Chars text={line} tail={<span className="dot">.</span>} />
                ) : (
                  <>
                    <Chars text={line} />
                    <br />{' '}
                  </>
                )}
              </span>
            ))}
          </h1>
          <p className="hero-lead">
            {t.hero.lead} <WordCycler words={t.hero.words} />
          </p>
        </div>
      </div>
    </div>
  )
}

export function HeadingLinks() {
  const lenis = useLenis()
  const t = useCopy()
  const [added, setAdded] = useState(false)
  return (
    <div className="heading-links text-ui">
      <div className="group">
        <div className="price-pill mono">
          {t.hero.price}
          <button aria-label={t.hero.add} onClick={() => {
              cart.add({ id: SHOP.machine.id, finish: 0, config: 0 })
              setAdded(true)
            }}>
            {added ? <IconCheck className="w-4 h-4" /> : <IconPlus className="w-4 h-4" />}
          </button>
        </div>
        <button
          className="ui-button text-ui"
          onClick={() => lenis?.scrollTo(window.innerHeight * 3, { duration: 2.5, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) })}
        >
          {t.hero.discover}
          <span className="arrow-loop">
            <IconArrowDown className="w-full h-full" />
            <IconArrowDown className="w-full h-full" />
          </span>
        </button>
      </div>
      <div className="hallmark">
        <span>{t.hero.hallmark}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/hallmark.webp" alt="Kafaparat" />
      </div>
    </div>
  )
}
