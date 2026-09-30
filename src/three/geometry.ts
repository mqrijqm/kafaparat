import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// All shapes are built around the Z axis (the grinder's axis) and centered on z = 0.

function extrude(shape: THREE.Shape, depth: number, curveSegments = 72) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments })
  g.translate(0, 0, -depth / 2)
  return g
}

/** Flat ring (or ring sector when `length` < 2π). */
export function annulus(rIn: number, rOut: number, depth: number, start = 0, length = Math.PI * 2) {
  const s = new THREE.Shape()
  const full = length >= Math.PI * 2 - 1e-4
  if (full) {
    s.absarc(0, 0, rOut, 0, Math.PI * 2, false)
    if (rIn > 0) {
      const h = new THREE.Path()
      h.absarc(0, 0, rIn, 0, Math.PI * 2, true)
      s.holes.push(h)
    }
  } else {
    s.absarc(0, 0, rOut, start, start + length, false)
    s.absarc(0, 0, rIn, start + length, start, true)
  }
  return extrude(s, depth)
}

/** Spur gear with square-ish teeth. */
export function gear(rRoot: number, rTip: number, teeth: number, depth: number, rHole = 0) {
  const s = new THREE.Shape()
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const pts: [number, number][] = [
      [rRoot, a],
      [rTip, a + step * 0.2],
      [rTip, a + step * 0.5],
      [rRoot, a + step * 0.7],
    ]
    pts.forEach(([r, t], j) => {
      const x = Math.cos(t) * r
      const y = Math.sin(t) * r
      if (i === 0 && j === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    })
  }
  s.closePath()
  if (rHole > 0) {
    const h = new THREE.Path()
    h.absarc(0, 0, rHole, 0, Math.PI * 2, true)
    s.holes.push(h)
  }
  return extrude(s, depth, 12)
}

/** Ring of small boxes = knurling / teeth. `inward` puts the teeth on the inside. */
export function teethRing(r: number, count: number, depth: number, toothH: number, fill = 0.5, inward = false) {
  const w = ((Math.PI * 2 * r) / count) * fill
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const b = new THREE.BoxGeometry(toothH, w, depth)
    const rr = inward ? r - toothH / 2 : r + toothH / 2
    b.rotateZ(a)
    b.translate(Math.cos(a) * rr, Math.sin(a) * rr, 0)
    parts.push(b)
  }
  return mergeGeometries(parts)!
}

/** Ring of small spheres (bearing balls). */
export function ballRing(r: number, count: number, size: number) {
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const s = new THREE.IcosahedronGeometry(size, 1)
    s.translate(Math.cos(a) * r, Math.sin(a) * r, 0)
    parts.push(s)
  }
  return mergeGeometries(parts)!
}

/** Index tick marks engraved on a face (thin boxes pointing outward). */
export function faceTicks(rIn: number, rOut: number, count: number, depth: number, width = 0.012) {
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const long = i % 5 === 0
    const len = (rOut - rIn) * (long ? 1 : 0.55)
    const b = new THREE.BoxGeometry(len, width, depth)
    const rr = rOut - len / 2
    b.rotateZ(a)
    b.translate(Math.cos(a) * rr, Math.sin(a) * rr, 0)
    parts.push(b)
  }
  return mergeGeometries(parts)!
}

/** Coil spring along Z. */
export function helix(r: number, turns: number, length: number, tube: number) {
  const pts: THREE.Vector3[] = []
  const n = turns * 32
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const a = t * turns * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, (t - 0.5) * length))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns * 48, tube, 8, false)
}

/** Faceted conical burr: a cone with spiral ridges. */
export function conicalBurr(rBase: number, height: number, ridges: number) {
  const cone = new THREE.ConeGeometry(rBase, height, ridges * 2, 4, false)
  cone.rotateX(Math.PI / 2) // tip toward +Z
  const pos = cone.attributes.position as THREE.BufferAttribute
  // twist vertices around Z proportional to height -> spiral facets
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const t = (z / height + 0.5) * 0.9
    const c = Math.cos(t)
    const s = Math.sin(t)
    pos.setXY(i, x * c - y * s, x * s + y * c)
  }
  cone.computeVertexNormals()
  return cone.toNonIndexed()
}

export function cylinder(r: number, depth: number, segments = 48) {
  const c = new THREE.CylinderGeometry(r, r, depth, segments)
  c.rotateX(Math.PI / 2)
  return c
}

export function box(w: number, h: number, d: number) {
  return new THREE.BoxGeometry(w, h, d)
}
