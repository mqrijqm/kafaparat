import * as THREE from 'three'
import { buildCaye } from './caye'
import { applyPalette, createOutlineMaterial, PALETTE_DARK, type Palette } from './materials'

/*
  Small standalone renderer for the CAYE machine: same two-pass outline look as the grinder,
  but line-only (every tone = page colour) with brass strokes. Plain three.js, no R3F:
  it owns one canvas and draws only when scroll changes the pose (no idle loop).
  Camera = a "dolly": it always looks at `focus` (a point on the model) from `dist` away,
  so the scroll timeline zooms in on a part by tweening focus + dist, and out again.
*/

const LINE_ART: Palette = {
  ...PALETTE_DARK,
  world: PALETTE_DARK.bg,
  shadow: PALETTE_DARK.bg,
  rim: PALETTE_DARK.bg,
  outline: '#c9a36a',
  outlineBlend: 0,
  contourBlend: 0,
  sheen: 0,
}

export function createCayeViewer(canvas: HTMLCanvasElement, lowTier: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, powerPreference: 'low-power' })
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  const dpr = Math.min(window.devicePixelRatio, lowTier ? 1.5 : 2)
  renderer.setPixelRatio(dpr)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)

  // pivot = rotation centre (the model is already centred on its bounding box)
  const pivot = new THREE.Group()
  const caye = buildCaye()
  pivot.add(caye.root)
  scene.add(pivot)

  // Focus points (model space, before rotation): centre of each part the notes talk about
  const centreOf = (o: THREE.Object3D) => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3())
  scene.updateMatrixWorld(true)
  const focus = {
    overview: new THREE.Vector3(0, 0, 0),
    hoppers: centreOf(caye.parts.hoppers),
    screen: centreOf(caye.parts.screen),
    burrs: centreOf(caye.parts.burrs),
    spout: centreOf(caye.parts.spout),
    cup: centreOf(caye.cup.group),
  }
  // every machine part remembers its resting height so `away` can lift them all off the cup
  const baseY = new Map(Object.values(caye.parts).map((o) => [o, o.position.y]))
  const { cup } = caye
  const cupY = cup.group.position.y

  const rt = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true, type: THREE.UnsignedByteType })
  const outline = createOutlineMaterial()
  outline.uniforms.tDiffuse.value = rt.texture
  applyPalette(outline, LINE_ART)
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), outline)
  quad.frustumCulled = false
  const quadScene = new THREE.Scene()
  quadScene.add(quad)
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const white = new THREE.Color(0xffffff)
  const buf = new THREE.Vector2()

  /** Pose driven by the section's ScrollTrigger (GSAP tweens these plain numbers) */
  const state = {
    yaw: -0.75, pitch: 0.12, dist: 7, fx: 0, fy: 0, fz: 0,
    lift: 0, spin: 0,
    /** finale: cup 0..1 appears, pour 0..1 thread reaches the cup, fill 0..1 coffee level,
        stop 0..1 thread lets go from the top, away 0..1 machine rises out, leaving the cup */
    cup: 0, pour: 0, fill: 0, stop: 0, away: 0,
  }
  const EPS = 0.0001
  let fit = 1 // extra distance on narrow canvases so the full machine still fits
  const target = new THREE.Vector3()

  function render() {
    pivot.rotation.set(state.pitch, state.yaw, 0)
    const up = state.away * state.away * 4
    baseY.forEach((y, o) => (o.position.y = y + up))
    // hoppers slide up and back like a drawer, uncovering the burrs
    caye.parts.hoppers.position.y += state.lift * 0.3
    caye.parts.hoppers.position.z = -state.lift * 1.1
    // only the driven lower burr turns; the upper burr assembly rises off it (exploded view)
    caye.spinners.forEach((b, i) => (b.rotation.z = (i ? -1 : 1) * state.spin))
    caye.uppers.forEach((u) => (u.position.z = u.userData.baseZ + state.lift * 0.15))

    // cup drops onto the grid, coffee rises, the two threads fall then let go
    cup.group.scale.setScalar(Math.max(state.cup, EPS))
    cup.group.position.y = cupY + (1 - state.cup) * 0.12
    const level = state.fill * 0.075
    cup.liquid.scale.y = Math.max(level, EPS)
    const surface = cup.liquidBase + level
    const top = caye.cup.streamTop - state.stop * (caye.cup.streamTop - surface)
    const len = state.pour * (top - surface)
    cup.streams.forEach((m) => {
      m.position.y = top
      m.scale.y = Math.max(len, EPS)
      m.visible = state.pour > 0 && state.stop < 1
    })

    // focus point follows the model's rotation; camera sits straight in front of it
    target.set(state.fx, state.fy, state.fz).applyEuler(pivot.rotation)
    camera.position.set(target.x, target.y + 0.1 * state.dist, target.z + state.dist * fit)
    camera.lookAt(target)
    renderer.setRenderTarget(rt)
    renderer.setClearColor(white, 1)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(quadScene, quadCam)
  }

  return {
    state,
    focus,
    resize(width: number, height: number) {
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      fit = camera.aspect < 0.8 ? 0.8 / camera.aspect : 1
      camera.updateProjectionMatrix()
      renderer.getDrawingBufferSize(buf)
      rt.setSize(buf.x, buf.y)
      outline.uniforms.uRes.value.set(buf.x, buf.y)
      render()
    },
    render,
    dispose() {
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          ;(o.material as THREE.Material).dispose()
        }
      })
      quad.geometry.dispose()
      outline.dispose()
      rt.dispose()
      renderer.dispose()
    },
  }
}

export type CayeViewer = ReturnType<typeof createCayeViewer>
