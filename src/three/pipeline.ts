import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { buildGrinder } from './grinder'
import { applyPalette, createOutlineMaterial, lightUniforms } from './materials'
import { getLensEl, markReady, stage } from './stage'

const DESKTOP = '(min-width: 900px)'

/** Everything imperative about the scene lives here; the React component only wires it to R3F. */
export function createPipeline() {
  const Z = new THREE.Group()
  Z.name = 'Z'
  const grinder = buildGrinder()
  grinder.root.scale.setScalar(9)
  grinder.root.position.z = -5
  Z.add(grinder.root)

  // CSS3D lens: 400px element * 0.5 * 0.1 = 20 world units, just in front of the bezel
  const lensGroup = new THREE.Group()
  lensGroup.scale.setScalar(0.1)
  lensGroup.position.z = 25
  const lensObj = new CSS3DObject(getLensEl()!)
  lensObj.scale.setScalar(0.5)
  lensGroup.add(lensObj)
  Z.add(lensGroup)

  const rt = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true, type: THREE.UnsignedByteType })
  const outline = createOutlineMaterial()
  outline.uniforms.tDiffuse.value = rt.texture
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), outline)
  quad.frustumCulled = false
  const quadScene = new THREE.Scene()
  quadScene.add(quad)
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const css = new CSS3DRenderer()
  const white = new THREE.Color(0xffffff)
  const lightWorld = new THREE.Vector3()
  const buf = new THREE.Vector2()

  return {
    mount(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
      scene.add(Z)
      Object.assign(stage, { Z, grinder, camera: cam, lensGroup })
      stage.cssLayer?.appendChild(css.domElement)
      markReady()
      return () => {
        scene.remove(Z)
        css.domElement.remove()
      }
    },

    resize(gl: THREE.WebGLRenderer, cam: THREE.PerspectiveCamera, width: number, height: number) {
      const desktop = window.matchMedia(DESKTOP).matches
      // FOV grows on tall screens so the model never gets huge (same rule as the reference)
      cam.fov = (40 * Math.max(height, 1000)) / 1000
      cam.position.set(0, 0, desktop ? 120 : 180)
      cam.near = 1
      cam.far = 1000
      cam.lookAt(0, 0, 0)
      cam.updateProjectionMatrix()
      stage.light.set(-200, 135, desktop ? -80 : -110)
      gl.getDrawingBufferSize(buf)
      rt.setSize(buf.x, buf.y)
      outline.uniforms.uRes.value.set(buf.x, buf.y)
      css.setSize(width, height)
    },

    frame(gl: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.PerspectiveCamera, t: number, delta: number) {
      if (stage.paused) return
      const s = stage.spin
      // idle mechanics, always running (like the reference's time-based loops)
      const sp = grinder.spinners
      sp.innerBurr.rotation.z -= delta * 0.35 * s
      sp.carrierGear.rotation.z += delta * 0.2 * s
      sp.bearingA.rotation.z -= delta * 0.5 * s
      sp.bearingB.rotation.z += delta * 0.5 * s
      grinder.modules.spring.scale.z = 1 + Math.sin(t * 2.2) * 0.12 * s
      grinder.modules.crank.rotation.z = -t * 0.18 * s

      // light lives inside Z (rotates with the model), aimed at the world origin
      Z.updateMatrixWorld()
      lightWorld.copy(stage.light).applyMatrix4(Z.matrixWorld).normalize()
      lightUniforms.uLightDir.value.copy(lightWorld).transformDirection(cam.matrixWorldInverse)
      applyPalette(outline, stage.palette)

      // pass 1: ID/tone buffer on white; pass 2: outline + flat tones to screen; then CSS3D lens
      gl.setRenderTarget(rt)
      gl.setClearColor(white, 1)
      gl.clear()
      gl.render(scene, cam)
      gl.setRenderTarget(null)
      gl.render(quadScene, quadCam)
      css.render(scene, cam)
    },
  }
}

export type Pipeline = ReturnType<typeof createPipeline>
