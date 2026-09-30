import ClientExperience from '@/components/ClientExperience'
import Header from '@/components/Header'
import { HeadingLinks, Hero } from '@/components/Hero'
import { Anatomy, Atelier, Features, Footer, Materials, Start } from '@/components/Sections'

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
        </main>
        <Footer />
      </div>
      <HeadingLinks />
    </>
  )
}
