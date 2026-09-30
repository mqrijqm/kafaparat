'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLenis } from 'lenis/react'
import { HERO } from '@/lib/content'
import { IconArrowDown, IconCheck, IconPlus } from './icons'

function Chars({ text }: { text: string }) {
  // chars are inline-blocks for the reveal; the word wrapper keeps the browser from breaking mid-word
  return (
    <span className="word">
      {text.split('').map((c, i) => (
        <span key={i} className="char">
          {c}
        </span>
      ))}
    </span>
  )
}

/** Cycles the last word: old chars collapse, new ones stretch in (like the reference "animate the ___."). */
function WordCycler() {
  const slot = useRef<HTMLSpanElement>(null)
  const dot = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let i = 0
    let alive = true
    const render = (w: string) => {
      slot.current!.innerHTML = w
        .split('')
        .map((c) => `<span class="c">${c === ' ' ? '&nbsp;' : c}</span>`)
        .join('')
      return slot.current!.querySelectorAll('.c')
    }
    const loop = () => {
      if (!alive) return
      const out = slot.current!.querySelectorAll('.c')
      const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(1.4, loop) })
      tl.to(out, { opacity: 0, scaleX: 0, duration: 0.15, stagger: { each: 0.025, from: 'end' }, ease: 'power2.in' })
      tl.to(dot.current, { scaleX: 6, color: '#f6efe6', duration: 0.15, ease: 'power2.out' }, '<')
      tl.add(() => {
        i = (i + 1) % HERO.words.length
        const chars = render(HERO.words[i])
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
    }
  }, [])

  return (
    <>
      <span ref={slot} className="word-slot">
        {HERO.words[0].split('').map((c, i) => (
          <span key={i} className="c">
            {c}
          </span>
        ))}
      </span>
      <span ref={dot} className="word-dot">
        .
      </span>
    </>
  )
}

export function Hero() {
  return (
    <div className="section hero">
      <div className="section-inner">
        <div className="section-text">
          <h1>
            {HERO.title.map((line, i) => (
              <span key={line}>
                <Chars text={line} />
                {i === HERO.title.length - 1 ? <span className="dot">.</span> : <br />}
                {i < HERO.title.length - 1 && ' '}
              </span>
            ))}
          </h1>
          <p className="hero-lead">
            {HERO.lead} <WordCycler />
          </p>
        </div>
      </div>
    </div>
  )
}

export function HeadingLinks() {
  const lenis = useLenis()
  const [added, setAdded] = useState(false)
  return (
    <div className="heading-links text-ui">
      <div className="group">
        <div className="price-pill mono">
          {HERO.price}
          <button aria-label="Add to reservation" onClick={() => setAdded(true)}>
            {added ? <IconCheck className="w-4 h-4" /> : <IconPlus className="w-4 h-4" />}
          </button>
        </div>
        <button
          className="ui-button text-ui"
          onClick={() => lenis?.scrollTo(window.innerHeight * 3, { duration: 2.5, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) })}
        >
          Discover
          <span className="arrow-loop">
            <IconArrowDown className="w-full h-full" />
            <IconArrowDown className="w-full h-full" />
          </span>
        </button>
      </div>
      <div className="hallmark">
        <span>Hallmarked by hand</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/hallmark.webp" alt="MOLA hallmark" />
      </div>
    </div>
  )
}
