'use client'

import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Lives inside the Lenis provider, so the instance exists when it subscribes. */
function LenisBridge() {
  const lenis = useLenis(ScrollTrigger.update)
  useEffect(() => {
    // exposed for non-React callers (timeline scrubber, tests)
    ;(window as unknown as { __lenis?: unknown }).__lenis = lenis
  }, [lenis])
  return null
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    // the story always starts at the top: the intro timeline plays from scroll 0
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Lenis is driven by GSAP's ticker, so scroll and animation share one clock
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1 }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  )
}
