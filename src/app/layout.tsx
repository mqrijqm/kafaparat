import type { Metadata, Viewport } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import SmoothScroll from '@/components/SmoothScroll'
import './globals.css'

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
})

const mono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'MOLA No.1 — Precision hand grinder',
  description:
    'A precision hand coffee grinder machined from steel, brass and walnut. Forty-one parts, one gesture.',
  openGraph: {
    title: 'MOLA No.1 — Precision hand grinder',
    description: 'Forty-one parts. One gesture.',
    images: ['/media/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#1f1510',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
