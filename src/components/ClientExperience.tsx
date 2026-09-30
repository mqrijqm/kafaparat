'use client'

import dynamic from 'next/dynamic'

// WebGL + CSS3D only exist in the browser: skip server rendering for this layer.
const Experience = dynamic(() => import('./Experience'), { ssr: false })

export default function ClientExperience() {
  return <Experience />
}
