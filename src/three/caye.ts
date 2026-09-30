import * as THREE from 'three'
import { conicalBurr, gear } from './geometry'
import { partMaterial } from './materials'

/*
  CAYE professional super-automatic espresso machine, procedurally modelled at compact display scale.
  Front faces +Z; angular shells, brewing hardware, tray, drawers, and twin hoppers are separate outlined parts.
*/

export type Caye = {
  root: THREE.Group
  parts: Record<string, THREE.Object3D>
}

function mesh(geometry: THREE.BufferGeometry, name: string) {
  geometry.computeVertexNormals()
  const result = new THREE.Mesh(geometry, partMaterial())
  result.name = name
  return result
}

function box(
  width: number,
  height: number,
  depth: number,
  name: string,
) {
  return mesh(new THREE.BoxGeometry(width, height, depth), name)
}

function sideShellGeometry(width: number) {
  const shape = new THREE.Shape()

  shape.moveTo(-0.38, 0.48)
  shape.lineTo(0.63, 0.73)
  shape.lineTo(0.78, 0.63)
  shape.lineTo(0.78, -0.57)
  shape.lineTo(0.61, -0.73)
  shape.lineTo(0.42, -0.73)
  shape.lineTo(0.32, -0.62)
  shape.lineTo(-0.19, -0.61)
  shape.lineTo(-0.38, -0.43)
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 1,
    steps: 1,
  })

  geometry.translate(0, 0, -width * 0.5)
  geometry.rotateY(Math.PI * 0.5)
  return geometry
}

function frontShapeGeometry(
  width: number,
  height: number,
  depth: number,
) {
  const shape = new THREE.Shape()

  shape.moveTo(-width * 0.44, -height * 0.5)
  shape.lineTo(width * 0.44, -height * 0.5)
  shape.lineTo(width * 0.5, -height * 0.34)
  shape.lineTo(width * 0.47, height * 0.5)
  shape.lineTo(-width * 0.47, height * 0.5)
  shape.lineTo(-width * 0.5, -height * 0.34)
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 1,
    steps: 1,
  })

  geometry.translate(0, 0, -depth * 0.5)
  return geometry
}

function sideTriangleGeometry(inset: number) {
  const frontTop = new THREE.Vector2(-0.27 + inset, 0.32 - inset)
  const rearTop = new THREE.Vector2(0.51 - inset, 0.39 - inset)
  const frontBottom = new THREE.Vector2(-0.22 + inset, -0.39 + inset)

  const shape = new THREE.Shape()
  shape.moveTo(frontTop.x, frontTop.y)
  shape.lineTo(rearTop.x, rearTop.y)
  shape.lineTo(frontBottom.x, frontBottom.y)
  shape.closePath()

  const geometry = new THREE.ShapeGeometry(shape)
  geometry.rotateY(Math.PI * 0.5)
  return geometry
}

function sideTriangleFrameGeometry() {
  const shape = new THREE.Shape()

  shape.moveTo(-0.30, 0.36)
  shape.lineTo(0.56, 0.44)
  shape.lineTo(-0.25, -0.45)
  shape.closePath()

  const hole = new THREE.Path()
  hole.moveTo(-0.24, 0.29)
  hole.lineTo(-0.19, -0.35)
  hole.lineTo(0.45, 0.37)
  hole.closePath()
  shape.holes.push(hole)

  const geometry = new THREE.ShapeGeometry(shape)
  geometry.rotateY(Math.PI * 0.5)
  return geometry
}

function addSidePanel(
  group: THREE.Group,
  side: number,
) {
  const inset = mesh(sideTriangleGeometry(0.025), `side-inset-${side}`)
  inset.position.x = side * 0.8
  group.add(inset)

  const frame = mesh(sideTriangleFrameGeometry(), `side-frame-${side}`)
  frame.position.x = side * 0.806
  group.add(frame)
}

function addWand(
  group: THREE.Group,
  x: number,
  name: string,
) {
  const collar = mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.09, 20),
    `${name}-collar`,
  )
  collar.position.set(x, 0.23, 0.83)
  group.add(collar)

  const shaft = mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 0.54, 16),
    `${name}-shaft`,
  )
  shaft.position.set(x, -0.04, 0.84)
  group.add(shaft)

  const tip = mesh(
    new THREE.CylinderGeometry(0.038, 0.028, 0.09, 16),
    `${name}-tip`,
  )
  tip.position.set(x, -0.34, 0.84)
  group.add(tip)
}

export function buildCaye(): Caye {
  const root = new THREE.Group()
  root.name = 'caye'

  const body = new THREE.Group()
  const sidePanels = new THREE.Group()
  const head = new THREE.Group()
  const screen = new THREE.Group()
  const spout = new THREE.Group()
  const wands = new THREE.Group()
  const tray = new THREE.Group()
  const drawers = new THREE.Group()
  const hoppers = new THREE.Group()

  body.name = 'body'
  sidePanels.name = 'sidePanels'
  head.name = 'head'
  screen.name = 'screen'
  spout.name = 'spout'
  wands.name = 'wands'
  tray.name = 'tray'
  drawers.name = 'drawers'
  hoppers.name = 'hoppers'

  root.add(
    body,
    sidePanels,
    head,
    screen,
    spout,
    wands,
    tray,
    drawers,
    hoppers,
  )

  const bodyCore = box(1.25, 1.31, 1.12, 'body-core')
  bodyCore.position.set(0, -0.01, -0.13)
  body.add(bodyCore)

  const recessedFront = box(1.13, 0.86, 0.055, 'front-recess')
  recessedFront.position.set(0, -0.08, 0.455)
  body.add(recessedFront)

  const recessedBase = box(1.12, 0.16, 1.19, 'recessed-base')
  recessedBase.position.set(0, -0.73, -0.11)
  body.add(recessedBase)

  const leftShell = mesh(sideShellGeometry(0.14), 'left-shell')
  leftShell.position.x = -0.69
  body.add(leftShell)

  const rightShell = mesh(sideShellGeometry(0.14), 'right-shell')
  rightShell.position.x = 0.69
  body.add(rightShell)

  addSidePanel(sidePanels, -1)
  addSidePanel(sidePanels, 1)

  const headBar = mesh(
    frontShapeGeometry(1.55, 0.43, 0.36),
    'upper-head-bar',
  )
  headBar.position.set(0, 0.46, 0.57)
  head.add(headBar)

  const headLower = mesh(
    frontShapeGeometry(1.39, 0.12, 0.08),
    'head-lower-fascia',
  )
  headLower.position.set(0, 0.245, 0.775)
  head.add(headLower)

  const logoStrip = box(0.49, 0.075, 0.025, 'logo-strip')
  logoStrip.position.set(0, 0.245, 0.825)
  head.add(logoStrip)

  const display = box(0.72, 0.225, 0.028, 'touchscreen')
  display.position.set(0, 0.49, 0.775)
  screen.add(display)

  const spoutColumn = mesh(
    new THREE.CylinderGeometry(0.13, 0.18, 0.42, 4),
    'spout-column',
  )
  spoutColumn.rotation.y = Math.PI * 0.25
  spoutColumn.scale.z = 0.72
  spoutColumn.position.set(0, 0.02, 0.69)
  spout.add(spoutColumn)

  const brewDisc = mesh(
    new THREE.CylinderGeometry(0.185, 0.185, 0.075, 24),
    'brew-disc',
  )
  brewDisc.position.set(0, -0.22, 0.7)
  spout.add(brewDisc)

  const brewRing = mesh(
    new THREE.TorusGeometry(0.155, 0.025, 8, 24),
    'brew-ring',
  )
  brewRing.rotation.x = Math.PI * 0.5
  brewRing.position.set(0, -0.265, 0.7)
  spout.add(brewRing)

  const leftNozzle = mesh(
    new THREE.CylinderGeometry(0.018, 0.012, 0.11, 12),
    'left-nozzle',
  )
  leftNozzle.rotation.z = -0.15
  leftNozzle.position.set(-0.055, -0.335, 0.72)
  spout.add(leftNozzle)

  const rightNozzle = mesh(
    new THREE.CylinderGeometry(0.018, 0.012, 0.11, 12),
    'right-nozzle',
  )
  rightNozzle.rotation.z = 0.15
  rightNozzle.position.set(0.055, -0.335, 0.72)
  spout.add(rightNozzle)

  addWand(wands, -0.48, 'left-wand')
  addWand(wands, 0.48, 'right-wand')

  const trayBody = box(1.28, 0.15, 0.59, 'drip-tray')
  trayBody.position.set(0, -0.54, 0.66)
  tray.add(trayBody)

  const trayPlate = box(1.16, 0.025, 0.48, 'drip-grid-plate')
  trayPlate.position.set(0, -0.452, 0.66)
  tray.add(trayPlate)

  for (let index = 0; index < 6; index += 1) {
    const slot = box(0.045, 0.012, 0.38, `tray-slot-${index + 1}`)
    slot.position.set(-0.375 + index * 0.15, -0.433, 0.66)
    tray.add(slot)
  }

  const leftDrawer = box(0.61, 0.23, 0.48, 'left-drawer')
  leftDrawer.position.set(-0.32, -0.735, 0.59)
  drawers.add(leftDrawer)

  const rightDrawer = box(0.61, 0.23, 0.48, 'right-drawer')
  rightDrawer.position.set(0.32, -0.735, 0.59)
  drawers.add(rightDrawer)

  const topTray = box(1.19, 0.09, 0.81, 'top-lid-tray')
  topTray.position.set(0, 0.72, -0.18)
  hoppers.add(topTray)

  const leftHopper = mesh(
    new THREE.CylinderGeometry(0.48, 0.42, 0.35, 4),
    'left-hopper',
  )
  leftHopper.rotation.y = Math.PI * 0.25
  leftHopper.scale.set(0.72, 1, 0.82)
  leftHopper.position.set(-0.34, 0.91, -0.22)
  hoppers.add(leftHopper)

  const rightHopper = mesh(
    new THREE.CylinderGeometry(0.48, 0.42, 0.35, 4),
    'right-hopper',
  )
  rightHopper.rotation.y = Math.PI * 0.25
  rightHopper.scale.set(0.72, 1, 0.82)
  rightHopper.position.set(0.34, 0.91, -0.22)
  hoppers.add(rightHopper)

  const leftLid = box(0.61, 0.07, 0.67, 'left-hopper-lid')
  leftLid.position.set(-0.34, 1.115, -0.22)
  hoppers.add(leftLid)

  const rightLid = box(0.61, 0.07, 0.67, 'right-hopper-lid')
  rightLid.position.set(0.34, 1.115, -0.22)
  hoppers.add(rightLid)

  // Twin grinders under the hoppers: hidden by the lid tray, revealed when the hoppers lift
  const burrs = new THREE.Group()
  burrs.name = 'burrs'
  root.add(burrs)
  for (const x of [-0.34, 0.34]) {
    const set = new THREE.Group()
    set.position.set(x, 0.655, -0.22)
    const ring = mesh(gear(0.17, 0.2, 24, 0.03, 0.12), `${x < 0 ? 'left' : 'right'}-outer-burr`)
    ring.rotation.x = -Math.PI / 2
    const cone = mesh(conicalBurr(0.11, 0.12, 7), `${x < 0 ? 'left' : 'right'}-inner-burr`)
    cone.rotation.x = -Math.PI / 2 // tip up
    cone.position.y = 0.05
    set.add(ring, cone)
    burrs.add(set)
  }

  root.updateMatrixWorld(true)

  const bounds = new THREE.Box3().setFromObject(root)
  const centre = bounds.getCenter(new THREE.Vector3())
  root.position.sub(centre)
  root.updateMatrixWorld(true)

  const parts: Record<string, THREE.Object3D> = {
    body,
    sidePanels,
    head,
    screen,
    spout,
    wands,
    tray,
    drawers,
    hoppers,
    burrs,
  }

  return { root, parts }
}