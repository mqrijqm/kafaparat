import * as THREE from 'three'
import type { Grinder, ModuleKey } from './grinder'
import { PALETTE_DARK, paletteState } from './materials'

/*
  Shared, mutable bridge between the R3F scene, the DOM overlays and the GSAP choreography.
  GSAP tweens plain values here; the render loop reads them every frame.
*/

type Stage = {
  ready: boolean
  grinder: Grinder | null
  /** Choreography root: every scroll move rotates/moves THIS group (camera stays still). */
  Z: THREE.Group | null
  /** Group holding the CSS3D lens, lives inside Z */
  lensGroup: THREE.Group | null
  camera: THREE.PerspectiveCamera | null
  light: THREE.Vector3
  palette: ReturnType<typeof paletteState>
  /** Values the lens canvases read every frame */
  lens: {
    burr: number // 0..1 visibility of the hero burr (top view of the grinding head)
    grid: number // 0..1 dotted grid
    bean: number // 0..1 bean dot pattern
    tick: string // tick color
  }
  spin: number // idle spin multiplier (0 when reduced motion)
  /** true while an opaque section (CAYE, footer) covers the whole viewport: skip rendering */
  paused: boolean
  lensEl: HTMLDivElement | null
  cssLayer: HTMLDivElement | null
  onReady: (() => void)[]
  project(key: ModuleKey, side: 1 | -1, out: { x: number; y: number }): { x: number; y: number }
}

const v = new THREE.Vector3()

export const stage: Stage = {
  ready: false,
  grinder: null,
  Z: null,
  lensGroup: null,
  camera: null,
  light: new THREE.Vector3(-200, 135, -80),
  palette: paletteState({ ...PALETTE_DARK, bg: '#000000', world: '#000000', shadow: '#000000', rim: '#000000', outline: '#000000' }),
  lens: { burr: 0, grid: 0, bean: 0, tick: '#c9a36a' },
  spin: 1,
  paused: false,
  lensEl: null,
  cssLayer: null,
  onReady: [],
  project(key, side, out) {
    const g = stage.grinder
    const cam = stage.camera
    if (!g || !cam) return out
    g.anchor(key, side, v)
    v.project(cam)
    out.x = (v.x * 0.5 + 0.5) * window.innerWidth
    out.y = (-v.y * 0.5 + 0.5) * window.innerHeight
    return out
  },
}

export function getLensEl() {
  if (!stage.lensEl && typeof document !== 'undefined') {
    stage.lensEl = document.createElement('div')
  }
  return stage.lensEl
}

export function whenReady(fn: () => void) {
  if (stage.ready) fn()
  else stage.onReady.push(fn)
}

export function markReady() {
  stage.ready = true
  stage.onReady.splice(0).forEach((f) => f())
}
