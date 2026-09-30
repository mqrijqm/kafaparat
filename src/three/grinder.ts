import * as THREE from 'three'
import {
  annulus,
  ballRing,
  box,
  conicalBurr,
  cylinder,
  faceTicks,
  gear,
  helix,
  teethRing,
} from './geometry'
import { partMaterial } from './materials'

/*
  MOLA No.1, procedurally modelled. Axis = local Z, radius ≈ 1, root scaled ×10 (same units as the reference).
  Front (+Z) is the bezel you look into; the crank sits at the back.
*/

export type ModuleKey =
  | 'bezel'
  | 'cupRing'
  | 'cup'
  | 'outerBurr'
  | 'innerBurr'
  | 'carrier'
  | 'spring'
  | 'dial'
  | 'bearingA'
  | 'body'
  | 'bearingB'
  | 'lid'
  | 'hub'
  | 'crank'
  | 'shaft'

export type Grinder = {
  root: THREE.Group
  modules: Record<ModuleKey, THREE.Group>
  baseZ: Record<ModuleKey, number>
  shells: { front: THREE.Mesh[]; mid: THREE.Mesh[]; back: THREE.Mesh[] }
  shellGroups: { front: THREE.Group; mid: THREE.Group; back: THREE.Group }
  slats: THREE.Mesh[]
  spinners: { innerBurr: THREE.Object3D; carrierGear: THREE.Object3D; bearingA: THREE.Object3D; bearingB: THREE.Object3D }
  /** Local anchor points for labels (x = ±1 on the module surface) */
  anchor(key: ModuleKey, side: 1 | -1, out: THREE.Vector3): THREE.Vector3
}

function mesh(geo: THREE.BufferGeometry, z = 0) {
  const m = new THREE.Mesh(geo, partMaterial())
  m.position.z = z
  return m
}

const LAYOUT: Record<ModuleKey, number> = {
  bezel: 2.62,
  cupRing: 2.3,
  cup: 1.95,
  outerBurr: 1.45,
  innerBurr: 1.12,
  carrier: 0.82,
  spring: 0.6,
  dial: 0.3,
  bearingA: -0.1,
  body: -0.75,
  bearingB: -1.4,
  lid: -1.7,
  hub: -1.95,
  crank: -2.18,
  shaft: 0,
}

export function buildGrinder(): Grinder {
  const root = new THREE.Group()
  root.name = 'grinder'
  const modules = {} as Record<ModuleKey, THREE.Group>

  const mod = (key: ModuleKey, ...children: THREE.Object3D[]) => {
    const g = new THREE.Group()
    g.name = key
    g.position.z = LAYOUT[key]
    children.forEach((c) => g.add(c))
    root.add(g)
    modules[key] = g
    return g
  }

  // Front bezel: thick knurled ring + recessed face, like a lens housing
  mod(
    'bezel',
    mesh(annulus(0.8, 0.98, 0.34)),
    mesh(teethRing(0.98, 110, 0.2, 0.045, 0.45), -0.03),
    mesh(annulus(0.72, 0.8, 0.26), -0.04),
    mesh(annulus(0, 0.72, 0.04), -0.16),
    mesh(faceTicks(0.84, 0.95, 60, 0.02), 0.17),
  )

  // Magnet ring of the catch cup
  const pucks = new THREE.Group()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    const p = mesh(cylinder(0.07, 0.08, 20))
    p.position.set(Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0.1)
    pucks.add(p)
  }
  mod('cupRing', mesh(annulus(0.78, 0.97, 0.14)), pucks)

  // Catch cup wall with a window cut
  mod(
    'cup',
    mesh(annulus(0.9, 0.97, 0.52, 0.35, Math.PI * 2 - 0.7)),
    mesh(annulus(0.9, 0.97, 0.1, -0.35, 0.7), 0.21),
    mesh(annulus(0.9, 0.97, 0.1, -0.35, 0.7), -0.21),
    mesh(annulus(0.6, 0.9, 0.05), -0.25),
  )

  // Outer burr: ring with inward cutting teeth
  mod(
    'outerBurr',
    mesh(annulus(0.62, 0.82, 0.26)),
    mesh(teethRing(0.62, 36, 0.22, 0.07, 0.4, true)),
    mesh(annulus(0.82, 0.9, 0.12), -0.07),
  )

  // Inner conical burr on a gear base
  const cone = mesh(conicalBurr(0.5, 0.62, 7), 0.12)
  const burrGear = mesh(gear(0.5, 0.57, 42, 0.1, 0.1), -0.22)
  const burr = new THREE.Group()
  burr.add(cone, burrGear)
  mod('innerBurr', burr)

  // Burr carrier / stabiliser
  const carrierGear = mesh(gear(0.62, 0.7, 48, 0.1, 0.32))
  mod('carrier', carrierGear, mesh(annulus(0.16, 0.34, 0.16)), mesh(ballRing(0.25, 10, 0.045), 0.02))

  mod('spring', mesh(helix(0.26, 5, 0.26, 0.018)))

  // Brass adjustment dial
  mod(
    'dial',
    mesh(annulus(0.7, 0.95, 0.24)),
    mesh(teethRing(0.95, 140, 0.18, 0.04, 0.5)),
    mesh(faceTicks(0.74, 0.88, 120, 0.02, 0.008), 0.125),
    mesh(annulus(0.2, 0.7, 0.06), -0.06),
  )

  // Upper bearing (races + balls)
  const bearingA = new THREE.Group()
  bearingA.add(mesh(annulus(0.36, 0.5, 0.12)), mesh(annulus(0.16, 0.28, 0.12)), mesh(ballRing(0.32, 14, 0.05)))
  mod('bearingA', bearingA)

  // Body: inner sleeve + grip slats (the slats spin away when exploding)
  const slats: THREE.Mesh[] = []
  const body = mod('body', mesh(annulus(0.84, 0.92, 1.1)), mesh(annulus(0.92, 0.99, 0.08), 0.52), mesh(annulus(0.92, 0.99, 0.08), -0.52))
  for (let i = 0; i < 16; i++) {
    const s = mesh(annulus(0.93, 1.02, 0.03, Math.PI * 0.62, Math.PI * 1.76))
    s.position.z = -0.44 + i * 0.058
    body.add(s)
    slats.push(s)
  }

  const bearingB = new THREE.Group()
  bearingB.add(mesh(annulus(0.36, 0.5, 0.12)), mesh(annulus(0.16, 0.28, 0.12)), mesh(ballRing(0.32, 14, 0.05)))
  mod('bearingB', bearingB)

  // Lid with bean inlet slots
  const lidBase = mesh(annulus(0.2, 0.97, 0.12))
  const lid = mod('lid', lidBase, mesh(teethRing(0.97, 90, 0.1, 0.03, 0.5)))
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const slot = mesh(annulus(0.35, 0.8, 0.04, a + 0.25, 1.4), -0.08)
    lid.add(slot)
  }

  mod('hub', mesh(cylinder(0.22, 0.18, 6)), mesh(cylinder(0.3, 0.06, 32), 0.1))

  // Crank: arm + walnut knob
  const arm = mesh(box(1.55, 0.16, 0.08))
  arm.position.x = 0.62
  const knobStem = mesh(cylinder(0.05, 0.2, 16))
  knobStem.position.set(1.32, 0, -0.14)
  const knob = mesh(cylinder(0.14, 0.34, 24))
  knob.position.set(1.32, 0, -0.4)
  const knobCap = mesh(cylinder(0.1, 0.05, 24))
  knobCap.position.set(1.32, 0, -0.59)
  mod('crank', arm, knobStem, knob, knobCap, mesh(cylinder(0.16, 0.12, 6), 0.02))

  mod('shaft', mesh(cylinder(0.07, 4.2, 12), -0.2))

  // Shell panels: 4 quadrants per case, centered on their own centroid so they can fly out & scale
  const shellGroups = {
    front: new THREE.Group(),
    mid: new THREE.Group(),
    back: new THREE.Group(),
  }
  const shells = { front: [] as THREE.Mesh[], mid: [] as THREE.Mesh[], back: [] as THREE.Mesh[] }
  const shellDef = { front: { z: 1.7, depth: 0.6 }, mid: { z: -0.02, depth: 0.5 }, back: { z: -1.58, depth: 0.3 } }
  ;(Object.keys(shellDef) as (keyof typeof shellDef)[]).forEach((k) => {
    const { z, depth } = shellDef[k]
    const g = shellGroups[k]
    g.position.z = z
    for (let i = 0; i < 4; i++) {
      const center = Math.PI / 4 + (i * Math.PI) / 2
      const len = Math.PI / 2 - 0.07
      const geo = annulus(1.0, 1.08, depth, center - len / 2, len)
      const cx = Math.cos(center) * 1.04
      const cy = Math.sin(center) * 1.04
      geo.translate(-cx, -cy, 0)
      const m = mesh(geo)
      m.position.set(cx, cy, 0)
      m.userData.home = { x: cx, y: cy }
      g.add(m)
      shells[k].push(m)
    }
    root.add(g)
  })

  const baseZ = { ...LAYOUT }

  const anchor = (key: ModuleKey, side: 1 | -1, out: THREE.Vector3) => {
    out.set(side * 1.0, 0, 0)
    return modules[key].localToWorld(out)
  }

  return {
    root,
    modules,
    baseZ,
    shells,
    shellGroups,
    slats,
    spinners: { innerBurr: burr, carrierGear, bearingA, bearingB },
    anchor,
  }
}
