import * as THREE from 'three'
import { annulus, faceTicks, gear } from './geometry'
import { partMaterial } from './materials'

/*
  CAYE Smart X professional super-automatic, procedurally modelled after the official film.
  Units: 1 ≈ 330 mm (the machine is 430 mm wide). Front faces +Z, floor at y = -0.95.
  Silhouette: two chamfered die-cast side shells with a dark triangular inset, a wide touchscreen
  tilted back over an open brewing cavity, two black brew units with chrome skirts, a drip tray
  over two drawers, and a black hopper deck on top. Under the deck sit the two CPS grinders:
  flat ceramic burr pairs in a black housing with an external adjustment gear.
  Every distinct part is its own mesh, so the outline pass draws it as a separate line.
*/

export type Caye = {
  root: THREE.Group
  parts: Record<string, THREE.Object3D>
  /** Lower (driven) ceramic burr of each grinder: the viewer turns these around their local Z */
  spinners: THREE.Object3D[]
  /** Upper burr assemblies: they rise off the lower burr when the hoppers lift */
  uppers: THREE.Object3D[]
  /** Espresso cup on the drip tray + the two coffee threads, animated by the viewer */
  cup: { group: THREE.Group; liquid: THREE.Mesh; streams: THREE.Mesh[]; streamTop: number; liquidBase: number }
}

function mesh(geometry: THREE.BufferGeometry, name: string) {
  geometry.computeVertexNormals()
  const result = new THREE.Mesh(geometry, partMaterial())
  result.name = name
  return result
}

function box(w: number, h: number, d: number, name: string, x = 0, y = 0, z = 0) {
  const m = mesh(new THREE.BoxGeometry(w, h, d), name)
  m.position.set(x, y, z)
  return m
}

function cyl(rTop: number, rBottom: number, h: number, name: string, x = 0, y = 0, z = 0, seg = 20) {
  const m = mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), name)
  m.position.set(x, y, z)
  return m
}

/** Extrudes a profile drawn in the side plane (shape x = world z, shape y = world y), `thick` along X, centred on x = 0. */
function sideExtrude(pts: [number, number][], thick: number, bevel = 0, holes: [number, number][][] = []) {
  const shape = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)))
  holes.forEach((h) => shape.holes.push(new THREE.Path(h.map(([z, y]) => new THREE.Vector2(z, y)))))
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thick,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
    curveSegments: 1,
  })
  g.rotateY(-Math.PI / 2) // shape x -> world z, extrusion -> world -x
  g.translate(thick / 2, 0, 0)
  return g
}

// Side shell profile (z, y): chamfered top corners, front edge folding back into a foot,
// and the undercut between front and rear feet seen in the film.
const SIDE: [number, number][] = [
  [-0.74, -0.95],
  [-0.54, -0.95],
  [-0.44, -0.82],
  [0.26, -0.82],
  [0.36, -0.95],
  [0.56, -0.95],
  [0.67, -0.52],
  [0.67, 0.46],
  [0.52, 0.63],
  [-0.62, 0.63],
  [-0.74, 0.5],
]
// The dark triangle: wide along the top, pointing down toward the front foot
const TRI: [number, number][] = [
  [-0.5, 0.44],
  [0.44, 0.44],
  [0.36, -0.56],
]
const TRI_IN: [number, number][] = [
  [-0.36, 0.4],
  [0.4, 0.4],
  [0.34, -0.44],
]

const SHELL_X = 0.585 // centre of each side shell
const SHELL_T = 0.11

function buildSides(group: THREE.Group) {
  for (const s of [-1, 1]) {
    const shell = mesh(sideExtrude(SIDE, SHELL_T, 0.02), `side-shell-${s}`)
    shell.position.x = s * SHELL_X
    group.add(shell)
    const face = s * (SHELL_X + SHELL_T / 2 + 0.02)
    // raised chamfered rim around the triangle, then the dark glass inset inside it
    const rim = mesh(sideExtrude(TRI, 0.014, 0, [TRI_IN]), `side-rim-${s}`)
    rim.position.x = face + s * 0.007
    const inset = mesh(sideExtrude(TRI_IN, 0.006), `side-inset-${s}`)
    inset.position.x = face + s * 0.002
    group.add(rim, inset)
    // facet creases from the triangle out to the shell corners (die-cast chamfer lines)
    const crease = (a: [number, number], b: [number, number], name: string) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1])
      const m = box(0.006, len, 0.012, name)
      m.rotation.x = Math.atan2(b[0] - a[0], b[1] - a[1])
      m.position.set(face + s * 0.003, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2)
      group.add(m)
    }
    crease(TRI[1], [0.62, 0.52], `crease-a-${s}`)
    crease(TRI[2], [0.58, -0.6], `crease-b-${s}`)
    crease(TRI[0], [-0.66, 0.56], `crease-c-${s}`)
  }
}

/** One CPS grinder: two flat ceramic burr rings, the upper one in a black housing with the adjustment gear. Axis = local Z. */
function buildGrinder(name: string) {
  const set = new THREE.Group()
  set.name = name
  set.rotation.x = -Math.PI / 2 // local Z = world up

  const shaft = mesh(annulus(0, 0.022, 0.09), `${name}-shaft`)
  shaft.position.z = -0.02
  const carrier = mesh(annulus(0.03, 0.135, 0.014), `${name}-carrier`)
  carrier.position.z = 0.0

  // lower burr: driven by the motor, teeth face up
  const lower = new THREE.Group()
  lower.name = `${name}-lower`
  lower.position.z = 0.019
  lower.add(mesh(annulus(0.055, 0.13, 0.022), `${name}-lower-burr`))
  const lowerTeeth = mesh(faceTicks(0.065, 0.125, 18, 0.006, 0.016), `${name}-lower-teeth`)
  lowerTeeth.position.z = 0.013
  lower.add(lowerTeeth)

  // upper burr assembly: stationary burr (teeth down) inside the housing + gear ring
  const upper = new THREE.Group()
  upper.name = `${name}-upper`
  upper.userData.baseZ = 0.05
  upper.position.z = 0.05
  const upperTeeth = mesh(faceTicks(0.065, 0.125, 18, 0.006, 0.016), `${name}-upper-teeth`)
  upperTeeth.position.z = -0.013
  upperTeeth.rotation.z = Math.PI / 18
  const housing = mesh(annulus(0.138, 0.158, 0.06), `${name}-housing`)
  housing.position.z = 0.01
  const ring = mesh(gear(0.158, 0.176, 44, 0.022, 0.15), `${name}-gear`)
  ring.position.z = 0.022
  const throat = mesh(annulus(0.05, 0.075, 0.03), `${name}-throat`)
  throat.position.z = 0.04
  upper.add(mesh(annulus(0.055, 0.13, 0.022), `${name}-upper-burr`), upperTeeth, housing, ring, throat)

  set.add(shaft, carrier, lower, upper)
  return { set, lower, upper }
}

/** Espresso cup + saucer (lathe profiles), handle and a liquid disc that fills it. */
function buildCup() {
  const group = new THREE.Group()
  group.name = 'cup'
  const lathe = (pts: [number, number][], name: string) =>
    mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 32), name)
  const saucer = lathe([[0, 0], [0.13, 0.004], [0.142, 0.018], [0.133, 0.02], [0.06, 0.011], [0, 0.011]], 'saucer')
  const cup = lathe([[0, 0.011], [0.052, 0.011], [0.06, 0.027], [0.077, 0.09], [0.084, 0.12], [0.077, 0.12], [0.071, 0.09], [0.055, 0.032], [0, 0.03]], 'cup')
  const handle = mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 16, Math.PI * 1.2), 'cup-handle')
  handle.rotation.z = -Math.PI * 0.6
  handle.position.set(0.09, 0.076, 0)
  const liquidGeo = new THREE.CylinderGeometry(0.074, 0.057, 1, 32)
  liquidGeo.translate(0, 0.5, 0)
  const liquid = mesh(liquidGeo, 'espresso')
  liquid.position.y = 0.032
  liquid.scale.y = 0.0001
  group.add(saucer, cup, handle, liquid)
  return { group, liquid }
}

// Key heights
const HEAD_BOTTOM = 0.12
const TRAY_TOP = -0.375
const PAD_TOP = TRAY_TOP + 0.02
const SPOUT_X = 0.17
const SPOUT_Z = 0.4
const NOZZLE_TIP = HEAD_BOTTOM - 0.29

export function buildCaye(): Caye {
  const root = new THREE.Group()
  root.name = 'caye'

  const names = ['body', 'sidePanels', 'head', 'screen', 'spout', 'wands', 'tray', 'drawers', 'hoppers', 'burrs'] as const
  const parts = Object.fromEntries(
    names.map((n) => {
      const g = new THREE.Group()
      g.name = n
      root.add(g)
      return [n, g]
    }),
  ) as Record<(typeof names)[number], THREE.Group>

  // ── body: rear block (cavity back wall = its front face) + recessed plinth
  const inner = (SHELL_X - SHELL_T / 2) * 2
  parts.body.add(
    box(inner, 1.43, 0.76, 'body-core', 0, -0.095, -0.36),
    box(inner - 0.06, 0.13, 1.0, 'plinth', 0, -0.885, -0.12),
    // dark back panel of the brewing cavity
    box(inner - 0.08, HEAD_BOTTOM - TRAY_TOP - 0.02, 0.02, 'cavity-panel', 0, (HEAD_BOTTOM + TRAY_TOP) / 2, 0.03),
  )

  buildSides(parts.sidePanels)

  // ── head over the cavity
  parts.head.add(
    box(inner, 0.5, 0.58, 'head-block', 0, (HEAD_BOTTOM + 0.62) / 2, 0.29),
    box(inner - 0.04, 0.03, 0.56, 'head-underside', 0, HEAD_BOTTOM - 0.015, 0.3),
  )
  const logo = box(0.16, 0.022, 0.01, 'logo-plate', 0, HEAD_BOTTOM + 0.035, 0.665)
  logo.rotation.x = -0.18
  parts.head.add(logo)

  // ── touchscreen: silver bezel, black glass, a grid of drink icons; tilted back like the film
  const screenTilt = new THREE.Group()
  screenTilt.position.set(0, HEAD_BOTTOM + 0.04, 0.62)
  screenTilt.rotation.x = -0.18
  parts.screen.add(screenTilt)
  const SH = 0.44
  screenTilt.add(box(1.1, SH, 0.05, 'screen-bezel', 0, SH / 2 + 0.02, 0))
  screenTilt.add(box(1.0, SH - 0.07, 0.016, 'screen-glass', 0, SH / 2 + 0.02, 0.031))
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 6; c++) screenTilt.add(box(0.042, 0.042, 0.005, `icon-${r}-${c}`, -0.3 + c * 0.12, 0.14 + r * 0.095, 0.041))
  screenTilt.add(box(0.86, 0.006, 0.004, 'screen-status-bar', 0, SH - 0.035, 0.041))

  // ── two brew units: chrome column, black head, chrome skirt, twin nozzles
  for (const s of [-1, 1]) {
    const x = s * SPOUT_X
    const id = s < 0 ? 'left' : 'right'
    const y0 = HEAD_BOTTOM
    parts.spout.add(
      cyl(0.072, 0.072, 0.03, `${id}-mount`, x, y0 - 0.015, SPOUT_Z),
      cyl(0.048, 0.048, 0.15, `${id}-column`, x, y0 - 0.105, SPOUT_Z),
      cyl(0.055, 0.082, 0.07, `${id}-brew-head`, x, y0 - 0.215, SPOUT_Z),
      cyl(0.094, 0.094, 0.018, `${id}-skirt`, x, y0 - 0.259, SPOUT_Z, 24),
    )
    for (const n of [-1, 1]) {
      const nz = cyl(0.013, 0.009, 0.04, `${id}-nozzle-${n}`, x + n * 0.032, y0 - 0.27, SPOUT_Z)
      parts.spout.add(nz)
    }
    // cup pad on the drip grid under each unit
    parts.tray.add(box(0.26, 0.02, 0.24, `${id}-cup-pad`, x, TRAY_TOP + 0.01, SPOUT_Z))
  }

  // ── hot water / milk wands at the cavity edges
  for (const s of [-1, 1]) {
    const x = s * 0.44
    parts.wands.add(
      cyl(0.03, 0.03, 0.04, `wand-collar-${s}`, x, HEAD_BOTTOM - 0.02, 0.5, 14),
      cyl(0.013, 0.013, 0.36, `wand-${s}`, x, HEAD_BOTTOM - 0.2, 0.5, 10),
      cyl(0.02, 0.016, 0.05, `wand-tip-${s}`, x, HEAD_BOTTOM - 0.4, 0.5, 12),
    )
  }

  // ── drip tray with a grille, over two drawers
  parts.tray.add(box(inner + 0.02, 0.1, 0.68, 'drip-tray', 0, TRAY_TOP - 0.05, 0.39))
  for (let i = 0; i < 9; i++) parts.tray.add(box(inner - 0.1, 0.006, 0.016, `grille-${i}`, 0, TRAY_TOP + 0.003, 0.12 + i * 0.065))
  for (const s of [-1, 1]) {
    parts.drawers.add(box(inner / 2 - 0.02, 0.3, 0.5, `drawer-${s}`, (s * inner) / 4, -0.62, 0.36))
    parts.drawers.add(box(0.18, 0.012, 0.012, `drawer-grip-${s}`, (s * inner) / 4, -0.53, 0.615))
  }

  // ── hopper deck: black lid tray + two trapezoid bean hoppers with lids (lift off to show the grinders)
  const DECK_Z = -0.3
  parts.hoppers.add(box(inner + 0.06, 0.14, 0.86, 'hopper-deck', 0, 0.7, DECK_Z))
  for (const s of [-1, 1]) {
    const x = s * 0.255
    // boxy black hopper, slightly tapered toward the deck, lid flush with its top
    const hop = mesh(new THREE.CylinderGeometry(0.33, 0.29, 0.2, 4, 1), `hopper-${s}`)
    hop.rotation.y = Math.PI / 4
    hop.scale.set(1, 1, 1.45)
    hop.position.set(x, 0.87, DECK_Z)
    const lid = box(0.47, 0.04, 0.68, `hopper-lid-${s}`, x, 0.99, DECK_Z)
    const tab = box(0.14, 0.025, 0.035, `hopper-tab-${s}`, x, 0.985, DECK_Z + 0.355)
    parts.hoppers.add(hop, lid, tab)
  }

  // ── twin CPS grinders, hidden inside the deck until the hoppers lift
  const spinners: THREE.Object3D[] = []
  const uppers: THREE.Object3D[] = []
  for (const s of [-1, 1]) {
    const g = buildGrinder(s < 0 ? 'left-grinder' : 'right-grinder')
    g.set.position.set(s * 0.255, 0.645, DECK_Z)
    parts.burrs.add(g.set)
    spinners.push(g.lower)
    uppers.push(g.upper)
  }

  // ── espresso cup under the left brew unit (hidden until the viewer brings it in)
  const cupParts = buildCup()
  cupParts.group.position.set(-SPOUT_X, PAD_TOP, SPOUT_Z)
  root.add(cupParts.group)
  const streams = [-0.028, 0.028].map((dx, i) => {
    const g = new THREE.CylinderGeometry(0.0055, 0.0055, 1, 8)
    g.translate(0, -0.5, 0)
    const m = mesh(g, `stream-${i}`)
    m.position.set(-SPOUT_X + dx, NOZZLE_TIP, SPOUT_Z)
    m.scale.y = 0.0001
    root.add(m)
    return m
  })

  // centre the whole machine on its bounding box (cup and streams are tiny at this point)
  root.updateMatrixWorld(true)
  const centre = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3())
  root.position.sub(centre)
  root.updateMatrixWorld(true)

  return {
    root,
    parts,
    spinners,
    uppers,
    cup: { group: cupParts.group, liquid: cupParts.liquid, streams, streamTop: NOZZLE_TIP, liquidBase: PAD_TOP + 0.032 },
  }
}
