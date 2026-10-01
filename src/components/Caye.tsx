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

/** Muted loop that only plays while on screen (and never under reduced motion). */
function LoopVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current!
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) v.src = src // nothing is downloaded until it is near the viewport
        v.play().catch(() => {})
      } else v.pause()
    }, { rootMargin: '25% 0px' })
    io.observe(v)
    return () => io.disconnect()
  }, [src])
  return <video ref={ref} poster={poster} muted loop playsInline preload="none" aria-hidden />
}

/** Line-art coffee bean (brass stroke), drawn in a 40×56 box. */
function Bean() {
  return (
    <svg viewBox="0 0 40 56" className="bean" aria-hidden>
      <ellipse cx="20" cy="28" rx="17" ry="25" />
      <path d="M20 4c-7 8 7 16 0 24s7 16 0 24" />
    </svg>
  )
}

/** Minimal closing strip before the footer: beans tumble in, then roll with the scroll. */
function BeanStrip() {
  const t = useCopy().caye.beans
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const beans = gsap.utils.toArray<HTMLElement>('.bean-wrap')
      gsap.from(beans, {
        y: -140,
        rotation: () => gsap.utils.random(-180, 180),
        opacity: 0,
        duration: 1.1,
        ease: 'bounce.out',
        stagger: { each: 0.06, from: 'random' },
        scrollTrigger: { trigger: root.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      })
      // after landing they keep rolling as you scroll: each bean turns, the row drifts sideways
      gsap.to('.bean-row', {
        xPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      beans.forEach((b, i) =>
        gsap.to(b.querySelector('svg'), {
          rotation: (i % 2 ? -1 : 1) * 200,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }),
      )
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <div ref={root} className="bean-strip">
      <div className="bean-row">
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} className="bean-wrap">
            <Bean />
          </span>
        ))}
      </div>
      <div className="bean-caption text-ui">
        <span>{t.line}</span>
        <Logo />
        <span>{t.place}</span>
      </div>
    </div>
  )
}

/** Pinned block: the line-art machine turns with scroll, four notes appear left and right. */
function ModelStage() {
  const t = useCopy().caye
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const finale = useRef<HTMLDivElement>(null)

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
            { f: F.burrs, dist: 2.1, yaw: 0.3, pitch: 0.42, lift: 1 },
            { f: F.spout, dist: 2.4, yaw: -0.55, pitch: 0.02, lift: 0 },
          ]
          const MOVE = 0.055 // travel between stops (timeline units, whole block = 1)
          const HOLD = 0.065 // time spent on each part
          const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
            onUpdate: v.render,
          })
          const go = (at: number, dur: number, f: { x: number; y: number; z: number }, p: Partial<typeof v.state>) =>
            tl.to(v.state, { fx: f.x, fy: f.y, fz: f.z, ...p, duration: dur }, at)

          // notes: all quietly present, the active one lit
          tl.fromTo(notes, { opacity: 0, y: 16 }, { opacity: 0.3, y: 0, duration: 0.04, stagger: 0.008, ease: 'power2.out' }, 0.01)
          let t = 0.06
          stops.forEach(({ f, ...p }, i) => {
            go(t, MOVE, f, p)
            tl.to(notes[i], { opacity: 1, duration: MOVE * 0.6 }, t + MOVE * 0.4)
            // the burrs turn while the camera rests on them
            if (i === 2) tl.fromTo(v.state, { spin: 0 }, { spin: Math.PI * 2, duration: MOVE + HOLD, ease: 'none' }, t + MOVE * 0.5)
            t += MOVE + HOLD
            if (i < stops.length - 1) tl.to(notes[i], { opacity: 0.3, duration: MOVE * 0.6 }, t)
          })
          // pull back out to the whole machine, finishing its turn; all notes light up
          const Y = Math.PI * 2
          go(t, 0.08, F.overview, { dist: 7, yaw: -0.75 + Y, pitch: 0.12, lift: 0 })
          tl.to(notes, { opacity: 1, duration: 0.03 }, t + 0.04)

          // FINALE — notes leave, camera drops to the grid, a cup arrives and the machine pours
          tl.to(notes, { opacity: 0, y: -12, duration: 0.03, stagger: 0.005 }, 0.64)
          go(0.65, 0.07, F.cup, { dist: 1.9, yaw: -0.2 + Y, pitch: 0.12 })
          tl.to(v.state, { cup: 1, duration: 0.04, ease: 'back.out(1.6)' }, 0.69)
            .to(v.state, { pour: 1, duration: 0.02, ease: 'power1.in' }, 0.73)
            .to(v.state, { fill: 1, duration: 0.08, ease: 'power1.out' }, 0.74)
            .to(v.state, { stop: 1, duration: 0.03, ease: 'power1.in' }, 0.81)
          // the machine lifts away: only the cup is left, closer and seen from above (crema)
          tl.to(v.state, { away: 1, duration: 0.07, ease: 'power2.in' }, 0.84)
          go(0.84, 0.08, { x: F.cup.x, y: F.cup.y - 0.05, z: F.cup.z }, { dist: 1.1, yaw: 0.35 + Y, pitch: 0.42 })
          tl.fromTo(finale.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.04, ease: 'power2.out' }, 0.9)
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
        <div ref={finale} className="caye-finale">
          <h3>
            {t.finale.title[0]}
            <br />
            {t.finale.title[1]}
          </h3>
          <p>{t.finale.lead}</p>
        </div>
      </div>
    </div>
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
          p.querySelector('img, video'),
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

      {/* Spaces — left title, one real loop from the CAYE film, three bars as text */}
      <div className="caye-spaces">
        <h3 className="caye-title" data-reveal>
          <span>{t.spaces.title[0]}</span>
          <span>{t.spaces.title[1]}</span>
        </h3>
        <div className="caye-photo caye-film">
          <LoopVideo src={CAYE.spacesVideo} poster={CAYE.spacesPoster} />
        </div>
        <ul>
          {t.spaces.items.map(([h, p], i) => (
            <li key={h} className="space-meta" data-reveal>
              <span className="text-ui">{String(i + 1).padStart(2, '0')}</span>
              <h4>{h}</h4>
              <p>{p}</p>
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

      <BeanStrip />
    </section>
  )
}
