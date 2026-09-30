import { ACCENTS, ANATOMY, ATELIER, BREWS, FEATURES, MATERIALS } from '@/lib/content'
import { IconArrowRight } from './icons'

function StickyText({ title, lead }: { title: string[]; lead: string }) {
  return (
    <div className="sticky top-0 h-[100lvh]">
      <div className="section-inner">
        <div className="section-text fixed-text">
          <h2>
            {title.map((t, i) => (
              <span key={t}>
                {t}
                {i < title.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p>{lead}</p>
        </div>
      </div>
    </div>
  )
}

export function Anatomy() {
  return (
    <section id="anatomy" data-chapter="anatomy" className="is-light-section relative px-[var(--gutter)]" style={{ height: '400lvh' }}>
      <StickyText title={ANATOMY.title} lead={ANATOMY.lead} />
    </section>
  )
}

export function Features() {
  return (
    <div id="features">
      {FEATURES.map((f) => (
        <section
          key={f.id}
          id={f.id}
          data-chapter={f.id}
          className="section feature-section"
          style={{ ['--c' as string]: ACCENTS[f.accent] }}
        >
          <div className="section-inner">
            <div className="section-text">
              <h2>{f.title}</h2>
              <p>{f.lead}</p>
              <ul className="bullets text-ui">
                {f.bullets.map((b) => (
                  <li key={b}>
                    <IconArrowRight />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

export function Materials() {
  return (
    <section id="materials" data-chapter="materials" className="is-light-section relative px-[var(--gutter)]" style={{ height: '400lvh' }}>
      <StickyText title={MATERIALS.title} lead={MATERIALS.lead} />
    </section>
  )
}

export function Atelier() {
  return (
    <section id="atelier" data-chapter="atelier" className="atelier relative px-[var(--gutter)]" style={{ height: '200lvh' }}>
      <div className="sticky top-0 h-[100lvh]">
        <div className="section-inner">
          <div className="section-text">
            <h2>
              {ATELIER.title[0]}
              <br />
              {ATELIER.title[1]}
            </h2>
            <p>{ATELIER.lead}</p>
          </div>
          <div className="atelier-grid">
            {ATELIER.images.map((im) => (
              <figure key={im.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.caption} loading="lazy" decoding="async" />
                <figcaption className="text-ui">{im.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Start() {
  return (
    <section id="start" data-chapter="start" className="start relative px-[var(--gutter)]" style={{ height: '200lvh' }}>
      <div className="absolute inset-x-0 bottom-0 h-[100lvh] px-[var(--gutter)]">
        <div className="section-inner">
          <h2>Start grinding</h2>
          <p>Find your setting for every brew.</p>
          <ul className="brew-grid text-ui">
            {BREWS.map((b) => (
              <li key={b.label}>
                <a href="#" style={{ ['--c' as string]: ACCENTS[b.accent] }}>
                  <span className="dot" />
                  {b.label}
                  <span className="um mono">{b.microns} µm</span>
                  <IconArrowRight />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const FOOTER = [
  { h: 'Product', links: ['MOLA No.1', 'Travel roll', 'Spare burrs', 'Gift card'] },
  { h: 'Atelier', links: ['About', 'Workshop', 'Journal', 'Stockists'] },
  { h: 'Support', links: ['Care guide', 'Warranty', 'Shipping', 'Contact'] },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-x !px-0">
        <div className="inner">
          <div className="flex gap-16 flex-wrap">
            {FOOTER.map((c) => (
              <div key={c.h}>
                <h6 className="text-ui">{c.h}</h6>
                <ul>
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <h6 className="text-ui">Notes from the atelier</h6>
            <p className="text-fg-3 max-w-[20rem] leading-6">Brewing guides and new batches, four times a year.</p>
            <form className="newsletter text-ui">
              <input type="email" placeholder="Email address" aria-label="Email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="flex justify-between text-fg-4 text-sm pb-2">
          <span>© 2026 MOLA Atelier</span>
          <span className="mono">45.4642° N, 9.1900° E</span>
        </div>
      </div>
    </footer>
  )
}
