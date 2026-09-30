'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ACCENTS, FEATURES, RING } from '@/lib/content'
import { getLensEl, stage } from '@/three/stage'

/*
  The 400×400 "lens" that sits inside the 3D scene (CSS3D), exactly over the bezel:
  segmented ring, 193 tick marks, feature photos, and 2D canvases (easing lines, dotted grid, bean).
*/

const TICKS = 193
const R = 291 // ring radius in the 614 viewBox
const GAP = 1.6 // degrees between segments

function arc(i: number) {
  const seg = 360 / RING.length
  const a0 = ((i * seg + GAP / 2 - 90) * Math.PI) / 180
  const a1 = (((i + 1) * seg - GAP / 2 - 90) * Math.PI) / 180
  const p = (a: number) => `${307 + Math.cos(a) * R} ${307 + Math.sin(a) * R}`
  return `M ${p(a0)} A ${R} ${R} 0 0 1 ${p(a1)}`
}

function Ring({ className }: { className: string }) {
  return (
    <svg className={`lens-ring ${className}`} viewBox="0 0 614 614">
      {RING.map((c, i) => (
        <path key={c} d={arc(i)} stroke={ACCENTS[c]} data-i={i} />
      ))}
    </svg>
  )
}

// Easing curves the hero cycles through (the silhouette of the stripe stack draws the curve)
const EASES = [
  'none',
  'power2.inOut',
  'sine.inOut',
  'expo.inOut',
  'power4.out',
  'circ.inOut',
  'back.inOut(2)',
  'power1.in',
  'elastic.out(1,0.5)',
  'bounce.out',
  'steps(6)',
  'power3.inOut',
].map((e) => gsap.parseEase(e))

// 13×13 bean silhouette (1 = dot, 0 = none) for the closing chapter
const BEAN = [
  '0000111110000',
  '0011111111100',
  '0111111111110',
  '0111110011111',
  '1111100011111',
  '1111100111111',
  '1111101111111',
  '1111111011111',
  '1111110011111',
  '1111100011110',
  '0111110111110',
  '0011111111100',
  '0000111110000',
]

function LensInner() {
  const linesRef = useRef<HTMLCanvasElement>(null)
  const gridRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const lines = linesRef.current!.getContext('2d')!
    const grid = gridRef.current!.getContext('2d')!
    const W = 400
    const S = 2 // backing store scale
    lines.setTransform(S, 0, 0, S, 0, 0)
    grid.setTransform(S, 0, 0, S, 0, 0)

    const N_LINES = 73
    const N_DOTS = 37
    // morph state: values per index, tweened from one easing to the next
    const cur = { lines: new Float32Array(N_LINES), dots: new Float32Array(N_DOTS) }
    const from = { lines: new Float32Array(N_LINES), dots: new Float32Array(N_DOTS) }
    const to = { lines: new Float32Array(N_LINES), dots: new Float32Array(N_DOTS) }
    const morph = { p: 1 }

    const target = (ease: (t: number) => number) => {
      for (let i = 0; i < N_LINES; i++) {
        const d = Math.abs(i - (N_LINES - 1) / 2) / ((N_LINES - 1) / 2)
        to.lines[i] = 0.01 + (0.75 - 0.01) * ease(1 - d)
      }
      for (let i = 0; i < N_DOTS; i++) {
        const t = (N_DOTS - 1 - i) / (N_DOTS - 1)
        to.dots[i] = -78 + 156 * ease(t)
      }
    }
    target(EASES[0])
    cur.lines.set(to.lines)
    cur.dots.set(to.dots)

    let k = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cycle = reduced
      ? null
      : gsap.delayedCall(0.75, function next() {
          if (stage.lens.easing > 0.01) {
            k = (k + 1) % EASES.length
            from.lines.set(cur.lines)
            from.dots.set(cur.dots)
            target(EASES[k])
            gsap.fromTo(morph, { p: 0 }, { p: 1, duration: 0.5, ease: 'power3.inOut' })
          }
          cycle?.restart(true)
        })

    const draw = () => {
      const L = stage.lens
      // hero easing lines + dots
      lines.clearRect(0, 0, W, W)
      if (L.easing > 0.001) {
        if (morph.p < 1) {
          for (let i = 0; i < N_LINES; i++) cur.lines[i] = from.lines[i] + (to.lines[i] - from.lines[i]) * morph.p
          for (let i = 0; i < N_DOTS; i++) cur.dots[i] = from.dots[i] + (to.dots[i] - from.dots[i]) * morph.p
        } else {
          cur.lines.set(to.lines)
          cur.dots.set(to.dots)
        }
        lines.fillStyle = ACCENTS.brass
        for (let i = 0; i < N_LINES; i++) {
          const y = 82 + (i / (N_LINES - 1)) * 236
          const d = Math.abs(i - (N_LINES - 1) / 2) / ((N_LINES - 1) / 2)
          lines.globalAlpha = (0.75 - 0.65 * d) * L.easing
          const w = 340 * cur.lines[i] * L.easing
          lines.fillRect(200 - w / 2, y - 1, w, 2)
        }
        lines.fillStyle = ACCENTS.champagne
        for (let i = 0; i < N_DOTS; i++) {
          const x = 80 + (i / (N_DOTS - 1)) * 240
          lines.globalAlpha = L.easing
          lines.beginPath()
          lines.arc(x, 200 + cur.dots[i], 3 * L.easing, 0, Math.PI * 2)
          lines.fill()
        }
        lines.globalAlpha = 1
      }

      // dotted grid (13×13) and bean pattern share one canvas
      grid.clearRect(0, 0, W, W)
      if (L.grid > 0.001 || L.bean > 0.001) {
        const t = performance.now() / 1000
        for (let y = 0; y < 13; y++) {
          for (let x = 0; x < 13; x++) {
            const cx = 100 + x * (200 / 12)
            const cy = 100 + y * (200 / 12)
            const dist = Math.hypot(x - 6, y - 6) / 8.5
            const g = Math.max(0, Math.min(1, L.grid * 1.6 - dist * 0.6))
            const bean = BEAN[y][x] === '1' ? 1 : 0.15
            const pulse = 1 + Math.sin(t * 2.4 - dist * 5) * 0.35 * L.bean
            const r = (1 + L.bean * (2.2 * bean) * pulse) * Math.max(g, L.bean)
            grid.globalAlpha = Math.max(g * 0.6, L.bean * bean)
            grid.fillStyle = L.tick
            grid.beginPath()
            grid.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2)
            grid.fill()
          }
        }
        grid.globalAlpha = 1
      }
    }
    gsap.ticker.add(draw)
    return () => {
      gsap.ticker.remove(draw)
      cycle?.kill()
    }
  }, [])

  return (
    <div className="lens">
      <Ring className="ring-bg" />
      <Ring className="ring-fg" />
      <div className="clock">
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            className="tick"
            style={{ transform: `rotate(${(i * 360) / (TICKS - 1)}deg) translate(-50%, -178px)` }}
          />
        ))}
      </div>
      <div className="photo">
        {FEATURES.map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={f.id} src={f.image} alt="" data-feature={f.id} loading="lazy" decoding="async" />
        ))}
      </div>
      <canvas ref={gridRef} className="grid-canvas" width={800} height={800} />
      <canvas ref={linesRef} className="lines-canvas" width={800} height={800} />
    </div>
  )
}

export default function Lens() {
  const el = getLensEl()
  if (!el) return null
  return createPortal(<LensInner />, el)
}
