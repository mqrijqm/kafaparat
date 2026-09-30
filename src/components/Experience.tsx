'use client'

import { useEffect } from 'react'
import Engine from '@/three/Engine'
import { buildChoreography } from '@/three/choreography'
import { whenReady } from '@/three/stage'
import { CHAPTERS } from '@/lib/content'
import Lens from './Lens'
import { Callouts, PartTags, SubNav } from './Overlays'

/** Client-only layer: WebGL engine, CSS3D lens, projected overlays and the scroll choreography. */
export default function Experience() {
  useEffect(() => {
    document.querySelector('.page')?.classList.add('is-ready')
    let cleanup: (() => void) | undefined
    let cancelled = false
    whenReady(() => {
      // wait one frame so the lens DOM is portaled and sections have their final size
      requestAnimationFrame(() => {
        if (!cancelled) cleanup = buildChoreography()
      })
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <>
      <Engine />
      <Lens />
      <Callouts />
      <PartTags />
      <SubNav chapters={CHAPTERS} />
    </>
  )
}
