import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import SmoothScroll from '@/components/SmoothScroll'
import { LangProvider } from '@/lib/i18n'
import { COPY } from '@/lib/content'
import './globals.css'

// Display + reading face: a light high-contrast serif
const zolina = localFont({
  src: './fonts/ZolinaLight.woff2',
  variable: '--font-zolina',
  weight: '300',
  display: 'swap',
})

const mono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin', 'latin-ext'],
})

const { meta } = COPY.bs

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    locale: 'bs_BA',
    alternateLocale: ['en_US'],
    images: ['/media/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#1f1510',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" className={`${zolina.variable} ${mono.variable}`}>
      <body>
        <LangProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </LangProvider>
      </body>
    </html>
  )
}
