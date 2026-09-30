'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'
import { createPipeline, type Pipeline } from './pipeline'
import { stage } from './stage'

const DESKTOP = '(min-width: 900px)'

function Scene() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const [pipeline] = useState<Pipeline>(createPipeline)

  useEffect(() => pipeline.mount(scene, camera), [pipeline, scene, camera])
  useEffect(() => pipeline.resize(gl, camera, size.width, size.height), [pipeline, gl, camera, size])

  // priority 1 = we take over rendering from R3F
  useFrame((state, delta) => pipeline.frame(state.gl, state.scene, state.camera as THREE.PerspectiveCamera, state.clock.elapsedTime, delta), 1)

  return null
}

export default function Engine() {
  const cssRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    stage.cssLayer = cssRef.current
    stage.spin = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1
  }, [])

  // Supersample like the reference (crisp 1px lines without AA), but cap it for weaker machines.
  const [dpr] = useState(() => {
    const lowTier = (navigator.hardwareConcurrency ?? 8) <= 4 || !window.matchMedia(DESKTOP).matches
    return lowTier ? Math.min(1.5, window.devicePixelRatio * 1.25) : 2
  })

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
      {/* CSS3D lens layer must sit above the WebGL canvas */}
      <div ref={cssRef} className="css-layer" />
    </div>
  )
}
