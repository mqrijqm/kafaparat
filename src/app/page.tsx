import { Caye, PartnerBand } from '@/components/Caye'
import { CartDrawer, CartFab, CartToast } from '@/components/Cart'
import ClientExperience from '@/components/ClientExperience'
import Header from '@/components/Header'
import { HeadingLinks, Hero } from '@/components/Hero'
import { Anatomy, Atelier, Features, Footer, Materials, Start } from '@/components/Sections'
import { Shop } from '@/components/Shop'

export default function Home() {
  return (
    <>
      <ClientExperience />
      <div className="page">
        <Header />
        <main>
          <section id="intro" data-chapter="intro" style={{ height: 'calc(292lvh - var(--header-h))' }}>
            <Hero />
          </section>
          <Anatomy />
          <Features />
          <div aria-hidden style={{ height: '100lvh' }} />
          <Materials />
          <Atelier />
          <Start />
          {/* after the grinder story: opaque layer above the fixed WebGL engine */}
          <div className="after-story">
            <PartnerBand />
            <Caye />
            <Shop />
          </div>
        </main>
        <Footer />
      </div>
      <HeadingLinks />
      <CartFab />
      <CartToast />
      <CartDrawer />
    </>
  )
}
