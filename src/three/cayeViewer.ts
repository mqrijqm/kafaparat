import * as THREE from 'three'
import { buildCaye } from './caye'
import { applyPalette, createOutlineMaterial, PALETTE_DARK, type Palette } from './materials'

/*
  Small standalone renderer for the CAYE machine: same two-pass outline look as the grinder,
  but line-only (every tone = page colour) with brass strokes. Plain three.js, no R3F:
  it owns one canvas and draws only when scroll changes the pose (no idle loop).
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
  camera.position.set(0, 0.35, 6.2)
  camera.lookAt(0, 0, 0)

  // pivot = rotation centre (the model is already centred on its bounding box)
  const pivot = new THREE.Group()
  const caye = buildCaye()
  pivot.add(caye.root)
  scene.add(pivot)

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

  /** Pose driven by the section's ScrollTrigger: turn 0..1 = one full turn, lift 0..1 = hoppers rise */
  const state = { turn: 0, lift: 0 }

  function render() {
    pivot.rotation.set(0.12, -0.75 + state.turn * Math.PI * 2, 0)
    caye.parts.hoppers.position.y = state.lift * 0.18
    renderer.setRenderTarget(rt)
    renderer.setClearColor(white, 1)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(quadScene, quadCam)
  }

  return {
    state,
    resize(width: number, height: number) {
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      // keep the whole machine in frame on narrow canvases
      camera.position.z = camera.aspect < 0.8 ? 6.2 / camera.aspect * 0.8 : 6.2
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
