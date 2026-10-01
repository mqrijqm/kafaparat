import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { annulus, ballRing, box, cylinder, faceTicks, gear, teethRing } from './geometry'
import { partMaterial } from './materials'

/*
  The CAYE CPS grinding module, procedurally modelled after the official film.
  Axis = local Z, radius ≈ 1, root scaled ×9. Front (+Z) is the bean inlet you look down into;
  the motor and its mounting plate sit at the back. Grinding is done by two FLAT ceramic burrs:
  the upper one is held by the housing, the lower one turns on a three-claw rotor.
*/

export type ModuleKey =
  | 'inlet'
  | 'adjustRing'
  | 'housing'
  | 'gasket'
  | 'upperBurr'
  | 'lowerBurr'
  | 'carrier'
  | 'chute'
  | 'bearing'
  | 'driveGear'
  | 'motor'
  | 'base'
  | 'shaft'

export type Grinder = {
  root: THREE.Group
  modules: Record<ModuleKey, THREE.Group>
  baseZ: Record<ModuleKey, number>
  shells: { front: THREE.Mesh[]; mid: THREE.Mesh[]; back: THREE.Mesh[] }
  shellGroups: { front: THREE.Group; mid: THREE.Group; back: THREE.Group }
  /** Motor cooling fins (they spin away when the module explodes) */
  slats: THREE.Mesh[]
  spinners: {
    lowerBurr: THREE.Object3D
    carrier: THREE.Object3D
    driveGear: THREE.Object3D
    bearing: THREE.Object3D
    adjustRing: THREE.Object3D
    pinion: THREE.Object3D
  }
  /** Local anchor points for labels (x = ±1 on the module surface) */
  anchor(key: ModuleKey, side: 1 | -1, out: THREE.Vector3): THREE.Vector3
}

function mesh(geo: THREE.BufferGeometry, z = 0) {
  const m = new THREE.Mesh(geo, partMaterial())
  m.position.z = z
  return m
}

/**
 * Cutting face of a flat burr: angled radial ridges (the CPS teeth) plus a few chunky
 * pre-breaker teeth at the inner edge. `face` = +1 teeth point to +Z, -1 to -Z.
 */
function burrTeeth(rIn: number, rOut: number, count: number, h: number, face: 1 | -1) {
  const parts: THREE.BufferGeometry[] = []
  const len = rOut - rIn - 0.1
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const b = new THREE.BoxGeometry(len, 0.018, h)
    b.translate(rIn + 0.06 + len / 2, 0, face * h * 0.5)
    b.rotateZ(a + 0.18) // CPS teeth are swept, not purely radial
    parts.push(b)
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const b = new THREE.BoxGeometry(0.16, 0.07, h * 1.6)
    b.translate(rIn + 0.08, 0, face * h * 0.8)
    b.rotateZ(a)
    parts.push(b)
  }
  return mergeGeometries(parts)!
}

/** Ivory ceramic ring with its cutting face; feed grooves cut into the inner edge. */
function flatBurr(face: 1 | -1) {
  const g = new THREE.Group()
  const T = 0.16
  g.add(mesh(annulus(0.4, 0.8, T)))
  g.add(mesh(burrTeeth(0.4, 0.8, 54, 0.035, face), (face * T) / 2))
  // three mounting notches on the outer rim (they key the burr into its holder)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6
    g.add(mesh(annulus(0.8, 0.84, T * 0.6, a - 0.12, 0.24)))
  }
  return g
}

const LAYOUT: Record<ModuleKey, number> = {
  inlet: 2.55,
  adjustRing: 2.15,
  housing: 1.75,
  gasket: 1.42,
  upperBurr: 1.2,
  lowerBurr: 0.92,
  carrier: 0.66,
  chute: 1.06,
  bearing: 0.2,
  driveGear: -0.22,
  motor: -1.0,
  base: -1.9,
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

  // Bean inlet: hopper throat + flange with four screw bosses
  const inlet = mod(
    'inlet',
    mesh(annulus(0.36, 0.46, 0.5)),
    mesh(annulus(0.46, 0.58, 0.07), 0.22),
    mesh(annulus(0.36, 0.96, 0.08), -0.2),
    mesh(faceTicks(0.66, 0.92, 90, 0.02, 0.01), -0.15),
  )
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const boss = mesh(cylinder(0.06, 0.1, 16), -0.12)
    boss.position.x = Math.cos(a) * 0.8
    boss.position.y = Math.sin(a) * 0.8
    inlet.add(boss)
  }

  // Grind adjustment: fine gear ring around the housing, turned by a small stepper motor
  const ring = new THREE.Group()
  ring.add(mesh(gear(0.9, 0.97, 120, 0.14, 0.78)), mesh(annulus(0.78, 0.9, 0.22)), mesh(faceTicks(0.8, 0.88, 60, 0.02, 0.008), 0.11))
  const pinion = mesh(gear(0.09, 0.13, 12, 0.14, 0.03))
  pinion.position.set(0, 1.08, 0)
  const stepper = mesh(cylinder(0.17, 0.42, 24), -0.3)
  stepper.position.set(0, 1.08, -0.3)
  const stepperCap = mesh(box(0.38, 0.38, 0.06), -0.54)
  stepperCap.position.set(0, 1.08, -0.54)
  mod('adjustRing', ring, pinion, stepper, stepperCap)

  // Housing: black upper-burr holder, grooved like the film's part
  const housing = mod(
    'housing',
    mesh(annulus(0.82, 0.95, 0.5)),
    mesh(annulus(0.44, 0.82, 0.06), 0.22),
  )
  for (let i = 0; i < 4; i++) housing.add(mesh(annulus(0.95, 0.99, 0.03), -0.18 + i * 0.09))

  mod('gasket', mesh(new THREE.TorusGeometry(0.88, 0.025, 8, 96)))

  mod('upperBurr', flatBurr(-1))
  const lowerBurr = flatBurr(1)
  mod('lowerBurr', lowerBurr)

  // Rotor: steel plate with three claws that hold the lower burr, central hub with screws
  const carrier = new THREE.Group()
  carrier.add(mesh(annulus(0.14, 0.86, 0.08)), mesh(annulus(0.14, 0.3, 0.2), 0.04))
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6
    const claw = mesh(box(0.1, 0.22, 0.42), 0.17)
    claw.position.x = Math.cos(a) * 0.88
    claw.position.y = Math.sin(a) * 0.88
    claw.rotation.z = a
    const screw = mesh(cylinder(0.035, 0.05, 12), 0.06)
    screw.position.x = Math.cos(a + Math.PI / 3) * 0.22
    screw.position.y = Math.sin(a + Math.PI / 3) * 0.22
    carrier.add(claw, screw)
  }
  mod('carrier', carrier)

  // Ground-coffee outlet: a square chute leaving the burr chamber sideways, angled down
  const chute = new THREE.Group()
  const tube = mesh(box(0.34, 0.6, 0.24))
  tube.position.set(0, -1.12, 0)
  const lip = mesh(box(0.42, 0.06, 0.32))
  lip.position.set(0, -1.44, 0)
  chute.add(tube, lip)
  chute.rotation.x = -0.18
  mod('chute', chute)

  const bearing = new THREE.Group()
  bearing.add(mesh(annulus(0.36, 0.5, 0.12)), mesh(annulus(0.16, 0.28, 0.12)), mesh(ballRing(0.32, 14, 0.05)))
  mod('bearing', bearing)

  // Drive: large spur gear on the burr shaft (reduction from the motor)
  const driveGear = new THREE.Group()
  driveGear.add(mesh(gear(0.85, 0.94, 72, 0.16, 0.7)), mesh(annulus(0.24, 0.7, 0.06)), mesh(annulus(0.08, 0.24, 0.22)))
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const hole = mesh(annulus(0.07, 0.1, 0.07))
    hole.position.set(Math.cos(a) * 0.47, Math.sin(a) * 0.47, 0)
    driveGear.add(hole)
  }
  mod('driveGear', driveGear)

  // Motor: can + end caps; the cooling fins spin away when exploding
  const slats: THREE.Mesh[] = []
  const motor = mod('motor', mesh(annulus(0.5, 0.68, 0.95)), mesh(annulus(0.1, 0.7, 0.06), 0.48), mesh(annulus(0.1, 0.7, 0.06), -0.48))
  for (let i = 0; i < 16; i++) {
    const s = mesh(annulus(0.69, 0.92, 0.03, Math.PI * 0.62, Math.PI * 1.76))
    s.position.z = -0.44 + i * 0.058
    motor.add(s)
    slats.push(s)
  }

  // Mounting plate (chamfered square) with four bolts into the machine chassis
  const plate = new THREE.Shape()
  const P = 0.98
  const C = 0.3
  plate.moveTo(-P + C, -P)
  plate.lineTo(P - C, -P)
  plate.lineTo(P, -P + C)
  plate.lineTo(P, P - C)
  plate.lineTo(P - C, P)
  plate.lineTo(-P + C, P)
  plate.lineTo(-P, P - C)
  plate.lineTo(-P, -P + C)
  plate.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, 0.3, 0, Math.PI * 2, true)
  plate.holes.push(hole)
  const plateGeo = new THREE.ExtrudeGeometry(plate, { depth: 0.1, bevelEnabled: false, curveSegments: 32 })
  plateGeo.translate(0, 0, -0.05)
  const base = mod('base', mesh(plateGeo), mesh(teethRing(0.3, 40, 0.1, 0.02, 0.5, true)))
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const bolt = mesh(cylinder(0.07, 0.16, 6), 0.06)
    bolt.position.set(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0.06)
    base.add(bolt)
  }

  mod('shaft', mesh(cylinder(0.07, 4.2, 12), -0.2))

  // Shell panels: 4 quadrants per case, centered on their own centroid so they can fly out & scale
  const shellGroups = {
    front: new THREE.Group(),
    mid: new THREE.Group(),
    back: new THREE.Group(),
  }
  const shells = { front: [] as THREE.Mesh[], mid: [] as THREE.Mesh[], back: [] as THREE.Mesh[] }
  const shellDef = { front: { z: 1.6, depth: 0.7 }, mid: { z: -0.02, depth: 0.5 }, back: { z: -1.4, depth: 0.5 } }
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
    spinners: { lowerBurr, carrier, driveGear, bearing, adjustRing: ring, pinion },
    anchor,
  }
}
