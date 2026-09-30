'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ACCENTS, ANATOMY, FEATURES, MATERIALS } from '@/lib/content'
import { stage } from '@/three/stage'
import type { ModuleKey } from '@/three/grinder'

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Callout labels + 45° leader lines that follow projected 3D anchor points. */
export function Callouts() {
  const svg = useRef<SVGSVGElement>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const items = [
      ...ANATOMY.left.map((l) => ({ ...l, side: 1 as const, list: 'left' })),
      ...ANATOMY.right.map((l) => ({ ...l, side: -1 as const, list: 'right' })),
    ]
    const lis = root.current!.querySelectorAll<HTMLLIElement>('li')
    const lines = svg.current!.querySelectorAll<SVGPolylineElement>('polyline')
    const smooth = items.map(() => ({ x: 0, y: 0, init: false }))
    const p = { x: 0, y: 0 }

    const update = () => {
      if (!stage.ready || !document.body.classList.contains('show-callouts')) return
      items.forEach((it, i) => {
        stage.project(it.part as ModuleKey, it.side, p)
        const s = smooth[i]
        if (!s.init) Object.assign(s, { x: p.x, y: p.y, init: true })
        s.x = lerp(s.x, p.x, 0.35)
        s.y = lerp(s.y, p.y, 0.35)
        const r = lis[i].getBoundingClientRect()
        const ly = r.top + r.height / 2
        let pts: string
        if (it.list === 'left') {
          const lx = r.right + 4
          const d = Math.max(0, Math.min(Math.abs(s.y - ly), s.x - lx))
          pts = `${lx},${ly} ${s.x - d},${ly} ${s.x},${s.y}`
        } else {
          const lx = r.left - 4
          const d = Math.max(0, Math.min(Math.abs(s.y - ly), lx - s.x))
          pts = `${lx},${ly} ${s.x + d},${ly} ${s.x},${s.y}`
        }
        lines[i].setAttribute('points', pts)
      })
    }
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <div ref={root} className="callouts">
      <svg ref={svg} className="leader-lines" aria-hidden>
        {[...ANATOMY.left, ...ANATOMY.right].map((l) => (
          <polyline key={l.label} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} />
        ))}
      </svg>
      <ul className="labels labels-left mono">
        {ANATOMY.left.map((l) => (
          <li key={l.label}>{l.label}</li>
        ))}
      </ul>
      <ul className="labels labels-right mono">
        {ANATOMY.right.map((l) => (
          <li key={l.label}>{l.label}</li>
        ))}
      </ul>
    </div>
  )
}

/** Material tags that ride next to the parts while they slide out in the Materials chapter. */
export function PartTags() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const tags = root.current!.querySelectorAll<HTMLDivElement>('.part-tag')
    const p = { x: 0, y: 0 }
    const update = () => {
      if (!stage.ready || !document.body.classList.contains('show-tags')) return
      MATERIALS.items.forEach((m, i) => {
        stage.project(m.part as ModuleKey, i % 2 ? -1 : 1, p)
        const w = tags[i].offsetWidth
        const x = i % 2 ? p.x - w - 16 : p.x + 16
        tags[i].style.transform = `translate(${x}px, ${p.y - 12}px)`
      })
    }
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])
  return (
    <div ref={root} className="part-tags" aria-hidden>
      {MATERIALS.items.map((m) => (
        <div key={m.name} className="part-tag text-ui" style={{ ['--c' as string]: ACCENTS[m.accent] }}>
          <i />
          {m.name} · {m.grams} g
        </div>
      ))}
    </div>
  )
}

/** Bottom-right stack: feature spec cards, weight card, and the timeline scrubber. */
export function SubNav({ chapters }: { chapters: string[] }) {
  const bar = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const ghost = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c)!)
    const n = els.length
    // chapter i spans [top_i, top_{i+1}] in scroll px, but gets an equal 1/n of the bar
    const bounds = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const tops = els.map((e) => Math.min(max, e.getBoundingClientRect().top + window.scrollY))
      tops.push(max)
      return tops
    }
    const toBar = (y: number) => {
      const t = bounds()
      for (let i = 0; i < n; i++) {
        if (y < t[i + 1] || i === n - 1) {
          const local = Math.min(1, Math.max(0, (y - t[i]) / Math.max(1, t[i + 1] - t[i])))
          return (i + local) / n
        }
      }
      return 1
    }
    const toScroll = (x: number) => {
      const t = bounds()
      const i = Math.min(n - 1, Math.floor(x * n))
      return t[i] + (x * n - i) * (t[i + 1] - t[i])
    }

    let shown = false
    gsap.set(card.current, { yPercent: 110 })
    const update = () => {
      if (!bar.current || !cursor.current) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      const prog = y / max
      const w = bar.current!.clientWidth
      gsap.set(cursor.current, { x: toBar(y) * w })
      const show = prog > 0.02 && prog < 0.98
      if (show !== shown) {
        shown = show
        gsap.to(card.current, { yPercent: show ? 0 : 110, duration: 0.25, ease: 'power2.inOut' })
        if (show) gsap.fromTo(cursor.current, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', delay: 0.1 })
      }
    }
    gsap.ticker.add(update)

    // drag / click to scrub
    const snap = (clientX: number) => {
      const r = bar.current!.getBoundingClientRect()
      return Math.round(Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * 65) / 65
    }
    let dragging = false
    const scrollTo = (x: number) => {
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis
      const y = toScroll(x)
      if (lenis) lenis.scrollTo(y, { duration: dragging ? 0.3 : 1.2 })
      else window.scrollTo({ top: y })
    }
    const onDown = (e: PointerEvent) => {
      dragging = true
      bar.current!.setPointerCapture(e.pointerId)
      gsap.to(cursor.current, { scale: 1.25, duration: 0.25 })
      scrollTo(snap(e.clientX))
    }
    const onMove = (e: PointerEvent) => {
      const r = bar.current!.getBoundingClientRect()
      gsap.to(ghost.current, { x: snap(e.clientX) * r.width, duration: 0.15, ease: 'power2.out' })
      if (dragging) scrollTo(snap(e.clientX))
    }
    const onUp = () => {
      dragging = false
      gsap.to(cursor.current, { scale: 1, duration: 0.25 })
    }
    const b = bar.current!
    b.addEventListener('pointerdown', onDown)
    b.addEventListener('pointermove', onMove)
    b.addEventListener('pointerup', onUp)
    b.addEventListener('pointercancel', onUp)
    return () => {
      gsap.ticker.remove(update)
      b.removeEventListener('pointerdown', onDown)
      b.removeEventListener('pointermove', onMove)
      b.removeEventListener('pointerup', onUp)
      b.removeEventListener('pointercancel', onUp)
    }
  }, [chapters])

  return (
    <div className="sub-nav mono">
      {FEATURES.map((f) => (
        <div key={f.id} className="card spec-card" data-card={f.id} style={{ ['--c' as string]: ACCENTS[f.accent] }}>
          <div className="head">
            <span>{f.title.toLowerCase()}</span>
            <span>No.1</span>
          </div>
          <dl>
            {f.spec.map(([k, v]) => (
              <div key={k} className="contents">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <div className="card weight-card" data-card="materials">
        <div className="total">
          <span>Total weight</span>
          <b>
            <span className="weight-count">0</span> g
          </b>
        </div>
        <div className="bars">
          {MATERIALS.items.map((m) => (
            <span
              key={m.name}
              data-w={(m.grams / MATERIALS.total) * 100}
              style={{ ['--c' as string]: ACCENTS[m.accent], width: '0%' }}
            />
          ))}
        </div>
        <ul>
          {MATERIALS.items.map((m) => (
            <li key={m.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.swatch} alt="" />
              {m.name}
              <em>{m.grams} g</em>
            </li>
          ))}
        </ul>
      </div>
      <div ref={card} className="progress-card">
        <div ref={bar} className="scroll-bar" aria-label="Scroll timeline">
          {chapters.map((c, i) => (
            <span key={c} className="marker" style={{ left: `${(i / chapters.length) * 100}%` }} />
          ))}
          <div ref={ghost} className="scroll-cursor ghost" />
          <div ref={cursor} className="scroll-cursor" />
        </div>
      </div>
    </div>
  )
}
