'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { buildGrinder } from './grinder'
import { applyPalette, createOutlineMaterial, lightUniforms } from './materials'
import { getLensEl, markReady, stage } from './stage'

const DESKTOP = '(min-width: 900px)'

function Scene() {
  const { gl, scene, camera, size } = useThree()
  const cam = camera as THREE.PerspectiveCamera

  const { Z, grinder, rt, outline, quad, quadCam, css } = useMemo(() => {
    const Z = new THREE.Group()
    Z.name = 'Z'
    const grinder = buildGrinder()
    grinder.root.scale.setScalar(9)
    grinder.root.position.z = -5
    Z.add(grinder.root)

    // CSS3D lens: 400px element * 0.5 * 0.1 = 20 world units, sitting just in front of the bezel
    const lensGroup = new THREE.Group()
    lensGroup.scale.setScalar(0.1)
    lensGroup.position.z = 25
    const lensObj = new CSS3DObject(getLensEl()!)
    lensObj.scale.setScalar(0.5)
    lensGroup.add(lensObj)
    Z.add(lensGroup)
    stage.lensGroup = lensGroup

    const rt = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true, type: THREE.UnsignedByteType })
    const outline = createOutlineMaterial()
    outline.uniforms.tDiffuse.value = rt.texture
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), outline)
    quad.frustumCulled = false
    const quadScene = new THREE.Scene()
    quadScene.add(quad)
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const css = new CSS3DRenderer()
    return { Z, grinder, rt, outline, quad: quadScene, quadCam, css }
  }, [])

  // mount scene graph + CSS layer
  useEffect(() => {
    scene.add(Z)
    stage.Z = Z
    stage.grinder = grinder
    stage.camera = cam
    const layer = stage.cssLayer
    if (layer) layer.appendChild(css.domElement)
    markReady()
    return () => {
      scene.remove(Z)
      css.domElement.remove()
    }
  }, [scene, Z, grinder, cam, css])

  // camera + buffers follow the viewport
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP).matches
    cam.fov = (40 * Math.max(size.height, 1000)) / 1000
    cam.position.set(0, 0, desktop ? 120 : 180)
    cam.near = 1
    cam.far = 1000
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
    stage.light.set(-200, 135, desktop ? -80 : -110)

    const buf = gl.getDrawingBufferSize(new THREE.Vector2())
    rt.setSize(buf.x, buf.y)
    outline.uniforms.uRes.value.set(buf.x, buf.y)
    css.setSize(size.width, size.height)
  }, [size, gl, cam, rt, outline, css])

  const lightWorld = useRef(new THREE.Vector3())
  const white = useMemo(() => new THREE.Color(0xffffff), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const s = stage.spin

    // idle mechanics (time based, like the reference's always-running loops)
    const sp = grinder.spinners
    sp.innerBurr.rotation.z -= delta * 0.35 * s
    sp.carrierGear.rotation.z += delta * 0.2 * s
    sp.bearingA.rotation.z -= delta * 0.5 * s
    sp.bearingB.rotation.z += delta * 0.5 * s
    grinder.modules.spring.scale.z = 1 + Math.sin(t * 2.2) * 0.12 * s
    grinder.modules.crank.rotation.z = -t * 0.18 * s

    // light lives inside Z (rotates with the model), aimed at the world origin
    Z.updateMatrixWorld()
    lightWorld.current.copy(stage.light).applyMatrix4(Z.matrixWorld).normalize()
    lightUniforms.uLightDir.value.copy(lightWorld.current).transformDirection(cam.matrixWorldInverse)

    applyPalette(outline, stage.palette)

    // pass 1: ID/tone buffer on white; pass 2: outline + flat tones to screen
    gl.setRenderTarget(rt)
    gl.setClearColor(white, 1)
    gl.clear()
    gl.render(scene, cam)
    gl.setRenderTarget(null)
    gl.render(quad, quadCam)
    css.render(scene, cam)
  }, 1)

  return null
}

export default function Engine() {
  const cssRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    stage.cssLayer = cssRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    stage.spin = reduced ? 0 : 1
  }, [])

  // Supersample like the reference (crisp 1px lines without AA), but cap it for weaker machines.
  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1.5
    const lowTier = (navigator.hardwareConcurrency ?? 8) <= 4 || !window.matchMedia(DESKTOP).matches
    return lowTier ? Math.min(1.5, window.devicePixelRatio * 1.25) : 2
  }, [])

  return (
    <div className="engine" aria-hidden>
      <Canvas
        dpr={dpr}
        flat
        linear
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
        camera={{ fov: 40, near: 1, far: 1000, position: [0, 0, 120] }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene />
      </Canvas>
      <div ref={cssRef} className="css-layer" />
    </div>
  )
}
