import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ACCENTS, FEATURES, MATERIALS } from '@/lib/content'
import { PALETTE_DARK, PALETTE_LIGHT } from './materials'
import { stage } from './stage'
import type { ModuleKey } from './grinder'

gsap.registerPlugin(ScrollTrigger)

const DEG = Math.PI / 180
const DESKTOP = '(min-width: 900px)'
const MOBILE = '(max-width: 899px)'

/*
  Architecture (mirrors animejs.com):
  - intro(): time-based, plays once on load (~4s) — the image "develops" out of black.
  - master: ONE timeline whose time unit is "viewport heights of scroll". Each chapter's tweens are
    placed at that section's scroll position, and the whole thing is scrubbed by a single ScrollTrigger.
  - light/dark switches, feature activation, cards: discrete ScrollTriggers with short time-based tweens.
*/

export function buildChoreography() {
  const g = stage.grinder!
  const Z = stage.Z!
  const lensEl = stage.lensEl!
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mm = gsap.matchMedia()

  const q = (s: string) => Array.from(lensEl.querySelectorAll<HTMLElement>(s))
  const ringBgPaths = q('.ring-bg path')
  const ringFg = q('.ring-fg path')
  const ringBg = lensEl.querySelector<SVGElement>('.ring-bg')!
  const ringFgSvg = lensEl.querySelector<SVGElement>('.ring-fg')!
  const ticks = q('.clock .tick')
  const photo = lensEl.querySelector<HTMLElement>('.photo')!
  const photos = q('.photo img')

  gsap.set(ringFg, { strokeDasharray: '1 1', attr: { pathLength: 1 }, strokeDashoffset: 1 })

  mm.add({ desktop: DESKTOP, mobile: MOBILE }, (ctx) => {
    const desk = ctx.conditions!.desktop
    const V = <T,>(d: T, m: T) => (desk ? d : m)

    // ───────── initial pose ─────────
    Z.position.set(0, 0, V(52, 90))
    Z.rotation.set(0, 0, 0)
    stage.lensGroup!.position.z = 25

    // ───────── INTRO (time-based) ─────────
    const intro = gsap.timeline({ defaults: { ease: 'none' } })
    const P = stage.palette
    const introPalette = { ...PALETTE_DARK }
    intro
      .to(P, { outline: introPalette.outline, duration: 0.6 }, 1)
      .to(P, { rim: introPalette.rim, duration: 2.5 }, 0.5)
      .to(P, { shadow: introPalette.shadow, world: introPalette.world, bg: introPalette.bg, duration: 3 }, 0)
      .to(document.body, { backgroundColor: PALETTE_DARK.bg, duration: 3 }, 0)
      .fromTo(stage.light, { x: 100 }, { x: -200, duration: 3, ease: 'power1.inOut' }, 0)
      .to(Z.position, { z: V(58, 92), duration: 1.5, ease: 'power2.inOut' }, 0.9)
      .fromTo(ticks, { opacity: 0 }, { opacity: 0.4, duration: 0.3, stagger: { amount: 0.5, ease: 'power2.out' } }, 0.3)
      .to(stage.lens, { grid: 1, duration: 0.8, ease: 'power2.out' }, 1)
      .to(stage.lens, { burr: 1, duration: 1.4, ease: 'power3.out' }, 1.2)
      .from('.hero h1 .char', { x: '0.35em', opacity: 0, duration: 1, ease: 'expo.out', stagger: { each: 0.025, ease: 'power1.inOut' } }, 1.4)
      .from('.hero h1 .dot', { x: '0.25em', opacity: 0, color: '#ffffff', duration: 0.6, ease: 'power3.inOut' }, 1.95)
      .from('.hero-lead', { opacity: 0, y: 12, duration: 0.8, ease: 'expo.out' }, 1.8)
      .to(['.site-header', '.heading-links'], { opacity: 1, duration: 0.35 }, 1.9)
      .add(() => document.querySelector('.heading-links')?.classList.add('is-on'), 1.9)
    // ring segments flicker on like a CRT
    ringBgPaths.forEach((p) => {
      intro.fromTo(
        p,
        { opacity: 0 },
        { keyframes: { opacity: [0, 1, 0, 1, 0, 1] }, duration: 0.2, ease: 'steps(5)' },
        0.6 + Math.random() * 0.8,
      )
    })
    gsap.set(ringBg, { opacity: 1 })
    if (reduced) intro.progress(1)

    // ───────── MASTER (scroll-scrubbed) ─────────
    const vh = window.innerHeight
    const top = (id: string) => (document.getElementById(id)!.getBoundingClientRect().top + window.scrollY) / vh
    const h = (id: string) => document.getElementById(id)!.offsetHeight / vh
    const total = (document.documentElement.scrollHeight - vh) / vh

    const I = { t: 0, d: top('anatomy') } // hero chapter = everything above anatomy
    const A = { t: top('anatomy'), d: h('anatomy') }
    const M = { t: top('materials'), d: h('materials') }
    const AT = { t: top('atelier'), d: h('atelier') }
    const S = { t: top('start'), d: h('start') }

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    // overlays only do per-frame projection work while they are visible
    tl.eventCallback('onUpdate', () => {
      const t = tl.time()
      document.body.classList.toggle('show-callouts', t > I.t + 0.78 * I.d && t < A.t + 0.42 * A.d)
      document.body.classList.toggle('show-tags', t > M.t + 0.2 * M.d && t < M.t + 0.54 * M.d)
    })
    const mz = g.modules
    const mods = (k: ModuleKey) => mz[k].position
    const allShells = [...g.shells.front, ...g.shells.mid, ...g.shells.back]

    // HEADING — the grinder turns and explodes
    tl.fromTo(Z.position, { z: V(58, 92) }, { z: V(15, -50), duration: I.d, ease: 'power3.out' }, I.t)
      .fromTo(Z.rotation, { x: 0 }, { x: 90 * DEG, duration: I.d, ease: 'power3.out' }, I.t)
      .fromTo(Z.rotation, { y: 0 }, { y: -135 * DEG, duration: I.d, ease: 'power2.inOut' }, I.t)
      .to('.heading-links', { y: 200, opacity: 0, duration: 0.12 * I.d, ease: 'power2.in' }, I.t + 0.02 * I.d)
      .to('.hero .section-text', { opacity: 0, duration: 0.2 * I.d }, I.t + 0.12 * I.d)
    ;(['front', 'mid', 'back'] as const).forEach((k, ci) => {
      g.shells[k].forEach((m, i) => {
        const hx = m.userData.home.x
        const hy = m.userData.home.y
        tl.fromTo(
          m.position,
          { x: hx, y: hy },
          { x: Math.sign(hx) * 8, y: Math.sign(hy) * 8, duration: 0.14 * I.d, ease: 'power2.in' },
          I.t + (0.05 + ci * 0.02 + i * 0.004) * I.d,
        ).fromTo(m.scale, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 0, duration: 0.14 * I.d, ease: 'power2.in' }, '<')
      })
    })
    tl.fromTo(mz.bezel.rotation, { z: 0 }, { z: -2 * Math.PI, duration: 0.3 * I.d, ease: 'power2.inOut' }, I.t + 0.04 * I.d)
    const spread: Partial<Record<ModuleKey, number>> = {
      bezel: 3.3,
      cupRing: 2.72,
      cup: 2.2,
      outerBurr: 1.55,
      dial: 0.18,
      bearingA: -0.35,
      bearingB: -1.75,
      lid: -2.15,
      hub: -2.55,
      crank: -3.0,
    }
    Object.entries(spread).forEach(([k, z]) => {
      tl.fromTo(mods(k as ModuleKey), { z: g.baseZ[k as ModuleKey] }, { z, duration: 0.2 * I.d, ease: 'power2.inOut' }, I.t + 0.06 * I.d)
    })
    tl.fromTo(stage.lensGroup!.position, { z: 25 }, { z: 30, duration: 0.2 * I.d }, I.t + 0.06 * I.d)
    g.slats.forEach((s, i) => {
      tl.fromTo(s.rotation, { z: 0 }, { z: -200 * DEG, duration: 0.18 * I.d, ease: 'power2.in' }, I.t + (0.07 + i * 0.006) * I.d)
      tl.fromTo(s.scale, { x: 1, y: 1, z: 1 }, { x: 0.001, y: 0.001, z: 0.001, duration: 0.02 * I.d }, I.t + (0.23 + i * 0.006) * I.d)
    })
    tl.to(ringBg, { opacity: 0.001, duration: 0.04 * I.d }, I.t + 0.1 * I.d)
      .to(ticks, { opacity: 0, duration: 0.04 * I.d }, I.t + 0.1 * I.d)
      .to(stage.lens, { burr: 0, grid: 0, duration: 0.06 * I.d }, I.t + 0.06 * I.d)

    // Callouts draw in at the end of the hero chapter, out early in anatomy
    tl.fromTo('.labels li', { opacity: 0 }, { opacity: 1, duration: 0.05 * I.d, stagger: { each: 0.004 * I.d, from: 'end' } }, I.t + 0.8 * I.d)
      .fromTo('.leader-lines polyline', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.08 * I.d, ease: 'power3.out' }, I.t + 0.82 * I.d)
      .to('.leader-lines polyline', { strokeDashoffset: 1, duration: 0.06 * A.d, ease: 'power2.in' }, A.t + 0.34 * A.d)
      .to('.labels li', { opacity: 0, duration: 0.05 * A.d }, A.t + 0.36 * A.d)

    // ANATOMY — turns back to face the camera, lens returns
    tl.fromTo(Z.position, { z: V(15, -50) }, { z: V(55, 92), duration: A.d, ease: 'power2.inOut' }, A.t)
      .fromTo(Z.rotation, { x: 90 * DEG }, { x: 0, duration: A.d, ease: 'power2.inOut' }, A.t)
      .fromTo(Z.rotation, { y: -135 * DEG }, { y: -360 * DEG, duration: A.d, ease: 'power2.inOut' }, A.t)
    Object.entries(spread).forEach(([k, z]) => {
      tl.fromTo(mods(k as ModuleKey), { z }, { z: g.baseZ[k as ModuleKey] + (z - g.baseZ[k as ModuleKey]) * 0.35, duration: 0.4 * A.d, ease: 'power2.inOut' }, A.t + 0.5 * A.d)
    })
    tl.fromTo(stage.lensGroup!.position, { z: 30 }, { z: 25, duration: 0.3 * A.d }, A.t + 0.6 * A.d)
      .to(ringBg, { opacity: 0.125, duration: 0.08 * A.d }, A.t + 0.9 * A.d)
      .to(ticks, { opacity: 0.4, duration: 0.08 * A.d, stagger: { amount: 0.05 * A.d } }, A.t + 0.88 * A.d)
      .to(stage.lens, { grid: 1, duration: 0.1 * A.d }, A.t + 0.9 * A.d)

    // MATERIALS — parts slide out with their material, then everything reassembles and spins
    const out: ModuleKey[] = ['cup', 'outerBurr', 'dial', 'carrier', 'bearingA', 'lid']
    tl.to(Z.position, { z: V(20, -15), duration: 0.25 * M.d, ease: 'power2.inOut' }, M.t)
      .to(Z.rotation, { x: 45 * DEG, duration: 0.25 * M.d, ease: 'power2.inOut' }, M.t)
      .to([ringBg, ringFgSvg], { opacity: 0.001, duration: 0.06 * M.d }, M.t + 0.02 * M.d)
      .to(ticks, { opacity: 0, duration: 0.06 * M.d }, M.t + 0.02 * M.d)
      .to(stage.lens, { grid: 0, duration: 0.06 * M.d }, M.t + 0.02 * M.d)
    out.forEach((k, i) => {
      tl.to(mods(k), { x: (i % 2 ? -1 : 1) * 2.4, duration: 0.18 * M.d, ease: 'power3.inOut' }, M.t + (0.12 + i * 0.012) * M.d)
      tl.to(mods(k), { x: 0, duration: 0.14 * M.d, ease: 'power3.inOut' }, M.t + (0.52 + i * 0.01) * M.d)
    })
    tl.fromTo('.part-tag', { opacity: 0, x: 0 }, { opacity: 1, duration: 0.04 * M.d, stagger: 0.01 * M.d }, M.t + 0.24 * M.d)
      .to('.part-tag', { opacity: 0, duration: 0.03 * M.d }, M.t + 0.5 * M.d)
    Object.keys(spread).forEach((k) => {
      tl.to(mods(k as ModuleKey), { z: g.baseZ[k as ModuleKey], duration: 0.3 * M.d, ease: 'power2.inOut' }, M.t + 0.5 * M.d)
    })
    tl.to(Z.position, { z: V(57, 92), duration: 0.4 * M.d, ease: 'power2.inOut' }, M.t + 0.44 * M.d)
      .to(Z.rotation, { x: 0, y: -720 * DEG, duration: 0.4 * M.d, ease: 'power2.inOut' }, M.t + 0.44 * M.d)
    allShells.forEach((m, i) => {
      tl.to(m.position, { x: m.userData.home.x, y: m.userData.home.y, duration: 0.3 * M.d, ease: 'power3.out' }, M.t + (0.5 + i * 0.008) * M.d)
      tl.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.3 * M.d, ease: 'power3.out' }, '<')
    })
    g.slats.forEach((s, i) => {
      tl.to(s.scale, { x: 1, y: 1, z: 1, duration: 0.02 * M.d }, M.t + (0.6 + i * 0.008) * M.d)
      tl.to(s.rotation, { z: 0, duration: 0.2 * M.d, ease: 'power3.out' }, M.t + (0.6 + i * 0.008) * M.d)
    })
    tl.to(Z.position, { z: V(64, 100), duration: 0.35 * M.d, ease: 'power3.out' }, M.t + 0.65 * M.d)

    // ATELIER — lens returns with the bean pattern
    tl.to(ringBg, { opacity: 1, duration: 0.15 * AT.d }, AT.t + 0.1 * AT.d)
      .to(ticks, { opacity: 0.4, duration: 0.1 * AT.d, stagger: { amount: 0.1 * AT.d } }, AT.t + 0.1 * AT.d)
      .to(stage.lens, { bean: 1, duration: 0.3 * AT.d, ease: 'power2.out' }, AT.t + 0.2 * AT.d)

    // START — the grinder tips over and leaves upward, lens facing down at the text
    tl.to(Z.position, { z: V(60, 96), duration: 0.5 * S.d, ease: 'power3.out' }, S.t)
      .to(Z.position, { y: V(40, 72), duration: 0.7 * S.d, ease: 'power2.inOut' }, S.t + 0.05 * S.d)
      .to(Z.rotation, { x: 100 * DEG, y: -720 * DEG + 20 * DEG, duration: 0.7 * S.d, ease: 'power2.inOut' }, S.t + 0.05 * S.d)
      .to(stage.lensGroup!.position, { z: 20, duration: 0.5 * S.d }, S.t)

    tl.set({}, {}, total) // make timeline length == scroll length

    const master = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: 'max',
      scrub: reduced ? true : 0.6,
      animation: tl,
      onUpdate: (self) => {
        if (self.progress > 0 && intro.progress() < 1) intro.progress(1)
      },
    })

    // ───────── Light / dark switches ─────────
    const setLight = (on: boolean) => {
      gsap.to(stage.palette, { ...(on ? PALETTE_LIGHT : PALETTE_DARK), duration: 0.25, ease: 'power1.inOut', overwrite: true })
      gsap.to(document.body, { backgroundColor: on ? PALETTE_LIGHT.bg : PALETTE_DARK.bg, duration: 0.25 })
      document.body.classList.toggle('is-light', on)
    }
    const fade = (sel: string, on: boolean) => gsap.to(sel, { opacity: on ? 1 : 0, duration: 0.35, ease: 'none' })
    ScrollTrigger.create({
      trigger: '#anatomy',
      start: 'top 35%',
      end: 'bottom 90%',
      onToggle: (s) => {
        setLight(s.isActive)
        fade('#anatomy .fixed-text', s.isActive)
      },
    })
    ScrollTrigger.create({
      trigger: '#materials',
      start: 'top 10%',
      end: '78% bottom',
      onToggle: (s) => {
        setLight(s.isActive)
        fade('#materials .fixed-text', s.isActive)
      },
    })
    gsap.set(['#anatomy .fixed-text', '#materials .fixed-text'], { opacity: 0 })

    // ───────── Features gallery ─────────
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-card]'))
    const showCard = (id: string | null) => {
      cards.forEach((c) => {
        const on = c.dataset.card === id
        gsap.to(c, on
          ? { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power3.inOut', delay: 0.1 }
          : { yPercent: 120, opacity: 0, duration: 0.25, ease: 'power2.in' })
      })
    }
    gsap.set(cards, { yPercent: 120, opacity: 0 })

    const activate = (i: number | null) => {
      gsap.to(photo, { opacity: i === null ? 0 : 1, duration: 0.35, ease: 'power2.inOut' })
      photos.forEach((img, j) => {
        gsap.to(img, j === i
          ? { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }
          : { opacity: 0, scale: 1.15, duration: 0.35, ease: 'power2.in' })
      })
      const color = i === null ? ACCENTS.brass : ACCENTS[FEATURES[i].accent]
      gsap.to(stage.lens, { tick: color, grid: i === null ? 1 : 0.45, duration: 0.25 })
      gsap.to(ticks, { backgroundColor: color, duration: 0.25, stagger: { amount: 0.15, from: 'center' } })
      showCard(i === null ? null : FEATURES[i].id)
    }

    FEATURES.forEach((f, i) => {
      const sec = document.getElementById(f.id)!
      const text = sec.querySelectorAll('h2, p')
      const bullets = sec.querySelector<HTMLElement>('.bullets')!
      const lis = sec.querySelectorAll('.bullets li')
      gsap.set(text, { opacity: 0.5 })
      gsap.set(lis, { opacity: 0 })
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (s) => {
          if (s.isActive) {
            activate(i)
            gsap.to(text, { opacity: 1, duration: 0.25, ease: 'power3.out' })
            gsap.fromTo(bullets, { '--rule': 0 }, { '--rule': 1, duration: 0.3, ease: 'power2.inOut' })
            gsap.fromTo(lis, { opacity: 0, x: -4 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.1, delay: 0.25 })
          } else {
            gsap.to(text, { opacity: 0.5, duration: 0.25 })
            gsap.to(lis, { opacity: 0, duration: 0.2 })
          }
        },
      })
      // this feature's ring segment draws with scroll = progress bar
      gsap.fromTo(
        ringFg[i],
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top 55%', end: 'bottom 55%', scrub: true },
        },
      )
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (s) => gsap.to(ringFg[i], { strokeWidth: s.isActive ? 10 : 5, duration: 0.1 }),
      })
    })
    // fg ring stays visible through the gallery, hidden elsewhere
    ScrollTrigger.create({
      trigger: '#features',
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (s) => {
        gsap.to(ringFgSvg, { opacity: s.isActive ? 1 : 0.001, duration: 0.3 })
        if (!s.isActive) activate(null)
      },
    })
    gsap.set(ringFgSvg, { opacity: 0.001 })

    // ───────── Materials weight card ─────────
    const count = { v: 0 }
    const countEl = document.querySelector<HTMLElement>('.weight-count')!
    const bars = Array.from(document.querySelectorAll<HTMLElement>('.weight-card .bars span'))
    ScrollTrigger.create({
      trigger: '#materials',
      start: 'top 10%',
      end: '78% bottom',
      onToggle: (s) => {
        showCard(s.isActive ? 'materials' : null)
        gsap.to(count, {
          v: s.isActive ? MATERIALS.total : 0,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: () => (countEl.textContent = Math.round(count.v).toString()),
        })
        bars.forEach((b, i) =>
          gsap.to(b, { width: s.isActive ? `${b.dataset.w}%` : '0%', duration: 0.9, delay: s.isActive ? i * 0.08 : 0, ease: 'power3.inOut' }),
        )
      },
    })

    // ───────── Atelier images reveal ─────────
    gsap.fromTo(
      '.atelier-grid img',
      { scale: 1.25, opacity: 0 },
      {
        scale: 1.05,
        opacity: 1,
        stagger: 0.08,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '#atelier', start: 'top 40%', toggleActions: 'play none none reverse' },
      },
    )

    return () => {
      intro.kill()
      master.kill()
      stage.palette = { ...PALETTE_DARK }
    }
  })

  return () => mm.revert()
}
