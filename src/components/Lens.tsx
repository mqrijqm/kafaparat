'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ACCENTS, FEATURES, RING } from '@/lib/content'
import { getLensEl, stage } from '@/three/stage'

/*
  The 400×400 "lens" that sits inside the 3D scene (CSS3D), exactly over the bezel:
  segmented ring, 193 tick marks, feature photos, and 2D canvases (hero burr, dotted grid, bean).
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
  const burrRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const burr = burrRef.current!
    const burrImg = burr.querySelector('img')!
    const grid = gridRef.current!.getContext('2d')!
    const W = 400
    const S = 2 // backing store scale
    grid.setTransform(S, 0, 0, S, 0, 0)
    let rot = 0
    let last = performance.now()

    const draw = () => {
      const L = stage.lens
      // hero: the grinding head seen from above. The photo turns, the sheen on top stays put.
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      burr.style.visibility = L.burr > 0.001 ? 'visible' : 'hidden'
      if (L.burr > 0.001) {
        rot += dt * 4 * stage.spin * L.burr // degrees per second
        burr.style.opacity = String(L.burr)
        burr.style.transform = `scale(${0.9 + 0.1 * L.burr})`
        burrImg.style.transform = `rotate(${rot - (1 - L.burr) * 40}deg)`
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
    return () => gsap.ticker.remove(draw)
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
      <div ref={burrRef} className="burr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/hero-burr.webp" alt="" decoding="async" />
      </div>
    </div>
  )
}

export default function Lens() {
  const el = getLensEl()
  if (!el) return null
  return createPortal(<LensInner />, el)
}
