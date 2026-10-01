'use client'

import { ACCENTS, ATELIER_IMAGES, BREWS, FEATURES } from '@/lib/content'
import { useCopy } from '@/lib/i18n'
import { IconArrowRight } from './icons'

/** Wraps units (µm, g, mm, s) so uppercase UI text leaves them alone. */
export function Units({ text }: { text: string }) {
  return text.split(/(µm|µm|(?:mm|g|s))/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="unit">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

function StickyText({ title, lead, align = 'left' }: { title: string[]; lead: string; align?: 'left' | 'right' }) {
  return (
    <div className="sticky top-0 h-[100lvh]">
      <div className="section-inner">
        <div className={`section-text fixed-text align-${align}`}>
          <h2>
            {title.map((t, i) => (
              <span key={i}>
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
  const t = useCopy()
  return (
    <section id="anatomy" data-chapter="anatomy" className="is-light-section relative px-[var(--gutter)]" style={{ height: '400lvh' }}>
      <StickyText title={t.anatomy.title} lead={t.anatomy.lead} />
    </section>
  )
}

export function Features() {
  const t = useCopy()
  return (
    <div id="features">
      {FEATURES.map((f, n) => {
        const c = t.features[f.id]
        return (
          <section
            key={f.id}
            id={f.id}
            data-chapter={f.id}
            // alternate sides: even chapters bottom-left, odd chapters top-right (spec card stays bottom-right)
            className={`section feature-section ${n % 2 ? 'is-right' : ''}`}
            style={{ ['--c' as string]: ACCENTS[f.accent] }}
          >
            <div className="section-inner">
              <div className="section-text">
                <span className="eyebrow text-ui">
                  {String(n + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
                </span>
                <h2>{c.title}</h2>
                <p>{c.lead}</p>
                <ul className="bullets text-ui">
                  {c.bullets.map((b, i) => (
                    <li key={i}>
                      <IconArrowRight />
                      {/* one wrapper so right-aligned (row-reverse) chapters keep the text order */}
                      <span>
                        <Units text={b} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function Materials() {
  const t = useCopy()
  return (
    <section id="materials" data-chapter="materials" className="is-light-section relative px-[var(--gutter)]" style={{ height: '400lvh' }}>
      <StickyText title={t.materials.title} lead={t.materials.lead} align="right" />
    </section>
  )
}

export function Atelier() {
  const t = useCopy()
  return (
    <section id="atelier" data-chapter="atelier" className="atelier relative px-[var(--gutter)]" style={{ height: '200lvh' }}>
      <div className="sticky top-0 h-[100lvh]">
        <div className="section-inner">
          <div className="section-text align-right">
            <h2>
              {t.atelier.title[0]}
              <br />
              {t.atelier.title[1]}
            </h2>
            <p>{t.atelier.lead}</p>
          </div>
          <div className="atelier-grid">
            {ATELIER_IMAGES.map((src, i) => (
              <figure key={src}>
                <div className="frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={t.atelier.captions[i]} loading="lazy" decoding="async" />
                </div>
                <figcaption className="text-ui">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {t.atelier.captions[i]}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Start() {
  const t = useCopy()
  return (
    <section id="start" data-chapter="start" className="start relative px-[var(--gutter)]" style={{ height: '200lvh' }}>
      <div className="absolute inset-x-0 bottom-0 h-[100lvh] px-[var(--gutter)]">
        <div className="section-inner">
          <h2>{t.start.title}</h2>
          <p>{t.start.lead}</p>
          <ul className="brew-grid text-ui">
            {BREWS.map((b, i) => (
              <li key={i}>
                <a href="#" style={{ ['--c' as string]: ACCENTS[b.accent] }}>
                  <span className="dot" />
                  {t.start.brews[i]}
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

export function Footer() {
  const t = useCopy()
  const f = t.footer
  return (
    <footer className="site-footer">
      <div className="container-x !px-0">
        <div className="inner">
          <div className="footer-cols">
            {f.cols.map((c) => (
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
            <h6 className="text-ui">{f.news.h}</h6>
            <p className="footer-lead">{f.news.lead}</p>
            <form className="newsletter text-ui">
              <input type="email" placeholder={f.news.placeholder} aria-label={f.news.placeholder} />
              <button type="submit">{f.news.submit}</button>
            </form>
          </div>
        </div>
        <ul className="trust-strip text-ui">
          {f.trust.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <div className="footer-base text-ui">
          <span>{f.rights}</span>
          <span className="mono">45.4642° N, 9.1900° E</span>
        </div>
      </div>
    </footer>
  )
}
