'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CAYE, PARTNER_EMAIL } from '@/lib/content'
import { useCopy } from '@/lib/i18n'
import type { CayeViewer } from '@/three/cayeViewer'
import { IconArrowUpRight } from './icons'

gsap.registerPlugin(ScrollTrigger)

const DESKTOP = '(min-width: 900px)'

/** The CAYE logo is a single-colour SVG: used as a mask so it takes the brass colour. */
function Logo({ className = '' }: { className?: string }) {
  return <span className={`caye-logo ${className}`} role="img" aria-label="CAYE" style={{ ['--src' as string]: `url(${CAYE.logo})` }} />
}

function Photo({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`caye-photo ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  )
}

/** Pinned block: the line-art machine turns with scroll, four notes appear left and right. */
function ModelStage() {
  const t = useCopy().caye
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = root.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let viewer: CayeViewer | null = null
    let ro: ResizeObserver | null = null
    let ctx: gsap.Context | null = null
    let cancelled = false

    // three.js scene is only built once the section is close to the viewport
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || viewer) return
        io.disconnect()
        const { createCayeViewer } = await import('@/three/cayeViewer')
        if (cancelled) return
        const lowTier = (navigator.hardwareConcurrency ?? 8) <= 4 || !window.matchMedia(DESKTOP).matches
        const v = (viewer = createCayeViewer(canvas.current!, lowTier))
        ro = new ResizeObserver(([e]) => v.resize(e.contentRect.width, e.contentRect.height))
        ro.observe(canvas.current!)

        ctx = gsap.context(() => {
          const notes = gsap.utils.toArray<HTMLElement>('.caye-note', el)
          if (reduced) {
            v.state.yaw = -0.5
            v.render()
            return
          }
          // One stop per note, in reading order: left 01, 02 then right 03, 04.
          // Each stop = where the camera looks (focus), how close (dist) and from which side (yaw/pitch).
          const F = v.focus
          const stops = [
            { f: F.hoppers, dist: 3.1, yaw: -0.45, pitch: 0.42, lift: 0 },
            { f: F.screen, dist: 2.3, yaw: 0.2, pitch: 0.08, lift: 0 },
            { f: F.burrs, dist: 2.6, yaw: 0.3, pitch: 0.6, lift: 1 },
            { f: F.spout, dist: 2.4, yaw: -0.55, pitch: 0.02, lift: 0 },
          ]
          const MOVE = 0.09 // travel between stops (timeline units, whole block = 1)
          const HOLD = 0.1 // time spent on each part
          const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
            onUpdate: v.render,
          })
          const go = (at: number, dur: number, f: { x: number; y: number; z: number }, p: Omit<(typeof stops)[number], 'f'>) =>
            tl.to(v.state, { fx: f.x, fy: f.y, fz: f.z, ...p, duration: dur }, at)

          // notes: all quietly present, the active one lit
          tl.fromTo(notes, { opacity: 0, y: 16 }, { opacity: 0.3, y: 0, duration: 0.05, stagger: 0.01, ease: 'power2.out' }, 0.02)
          let t = 0.08
          stops.forEach(({ f, ...p }, i) => {
            go(t, MOVE, f, p)
            tl.to(notes[i], { opacity: 1, duration: MOVE * 0.6 }, t + MOVE * 0.4)
            t += MOVE + HOLD
            if (i < stops.length - 1) tl.to(notes[i], { opacity: 0.3, duration: MOVE * 0.6 }, t)
          })
          // the burrs turn while the camera rests on them (stop 3)
          tl.fromTo(v.state, { spin: 0 }, { spin: Math.PI * 2, duration: MOVE + HOLD * 2, ease: 'none' }, 0.08 + 2 * (MOVE + HOLD) - HOLD * 0.5)
          // pull back out to the whole machine, finishing its turn
          go(t, 0.14, F.overview, { dist: 7, yaw: -0.75 + Math.PI * 2, pitch: 0.12, lift: 0 })
          tl.to(notes, { opacity: 1, duration: 0.06 }, t + 0.06)
          tl.set({}, {}, 1)
        }, el)
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(el)

    return () => {
      cancelled = true
      io.disconnect()
      ro?.disconnect()
      ctx?.revert()
      viewer?.dispose()
    }
  }, [])

  const note = ([h, p]: string[], i: number) => (
    <li key={h} className="caye-note">
      <span className="text-ui num">{String(i + 1).padStart(2, '0')}</span>
      <h3>{h}</h3>
      <p>{p}</p>
    </li>
  )

  return (
    <div ref={root} className="caye-stage">
      <div className="caye-stage-sticky">
        <ul className="caye-notes left">{t.model.left.map((n, i) => note(n, i))}</ul>
        <canvas ref={canvas} className="caye-canvas" aria-hidden />
        <ul className="caye-notes right">{t.model.right.map((n, i) => note(n, i + 2))}</ul>
      </div>
    </div>
  )
}

export function PartnerBand() {
  const f = useCopy().footer
  return (
    <section id="partnership" className="partner-band">
      <span className="text-ui">{f.partner.h}</span>
      <p>{f.partner.lead}</p>
      <a href={`mailto:${PARTNER_EMAIL}`} className="btn-partner text-ui">
        {PARTNER_EMAIL}
        <IconArrowUpRight />
      </a>
    </section>
  )
}

export function Caye() {
  const t = useCopy().caye
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const ctx = gsap.context(() => {
      // photos open like a shutter from the bottom, settling from a slight zoom
      gsap.utils.toArray<HTMLElement>('.caye-photo').forEach((p) => {
        gsap.fromTo(
          p,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: { trigger: p, start: 'top 85%', toggleActions: 'play none none reverse' },
          },
        )
        gsap.fromTo(
          p.querySelector('img'),
          { scale: 1.25 },
          { scale: 1.02, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 85%', toggleActions: 'play none none reverse' } },
        )
      })
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((block) => {
        gsap.from(block.children, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: block, start: 'top 80%', toggleActions: 'play none none reverse' },
        })
      })
      // the two extraction shots drift apart while scrolling past
      gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((p) => {
        gsap.fromTo(
          p,
          { yPercent: Number(p.dataset.drift) },
          { yPercent: -Number(p.dataset.drift), ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="caye" className="caye">
      {/* Intro — centred */}
      <header className="caye-intro" data-reveal>
        <Logo className="lg" />
        <span className="text-ui eyebrow-c">{t.eyebrow}</span>
        <h2>
          {t.title[0]}
          <br />
          {t.title[1]}
        </h2>
        <p>{t.lead}</p>
      </header>

      <ModelStage />

      {/* Form — photo left, text right-aligned on the right */}
      <div className="caye-row caye-form">
        <Photo src={CAYE.hero} alt={t.hero.title} className="tall" />
        <div className="caye-copy align-right" data-reveal>
          <span className="text-ui label">{t.hero.label}</span>
          <h3>{t.hero.title}</h3>
          <p>{t.hero.lead}</p>
        </div>
      </div>

      {/* Extraction — centred text, two drifting shots */}
      <div className="caye-pour">
        <div className="caye-copy align-center" data-reveal>
          <span className="text-ui label">{t.pour.label}</span>
          <h3>{t.pour.title}</h3>
          <p>{t.pour.lead}</p>
        </div>
        <div className="pour-pair">
          <figure data-drift="6">
            <Photo src={CAYE.pour} alt={t.pour.captions[0]} />
            <figcaption className="text-ui">
              <span>01</span>
              {t.pour.captions[0]}
            </figcaption>
          </figure>
          <figure data-drift="-10">
            <Photo src={CAYE.milk} alt={t.pour.captions[1]} />
            <figcaption className="text-ui">
              <span>02</span>
              {t.pour.captions[1]}
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Spaces — left-aligned title, three bars */}
      <div className="caye-spaces">
        <h3 className="caye-title" data-reveal>
          <span>{t.spaces.title[0]}</span>
          <span>{t.spaces.title[1]}</span>
        </h3>
        <ul>
          {t.spaces.items.map(([h, p], i) => (
            <li key={h}>
              <Photo src={CAYE.spaces[i]} alt={h} className="wide" />
              <div className="space-meta" data-reveal>
                <span className="text-ui">{String(i + 1).padStart(2, '0')}</span>
                <h4>{h}</h4>
                <p>{p}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Details — right-aligned heading, four close-ups */}
      <div className="caye-details">
        <div className="caye-copy align-right" data-reveal>
          <h3 className="caye-title">
            <span>{t.details.title[0]}</span>
            <span>{t.details.title[1]}</span>
          </h3>
          <p>{t.details.lead}</p>
        </div>
        <ul>
          {CAYE.details.map((src, i) => (
            <li key={src}>
              <Photo src={src} alt={t.details.items[i]} />
              <span className="text-ui">
                <b>{String(i + 1).padStart(2, '0')}</b>
                {t.details.items[i]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA — centred */}
      <div className="caye-cta" data-reveal>
        <Logo />
        <h3>{t.cta.title}</h3>
        <p>{t.cta.lead}</p>
        <a href={`mailto:${PARTNER_EMAIL}?subject=CAYE`} className="btn-partner text-ui">
          {t.cta.button}
          <IconArrowUpRight />
        </a>
      </div>
    </section>
  )
}
