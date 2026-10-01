'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PARTNER_EMAIL, SHOP } from '@/lib/content'
import { cart, money, unitPrice } from '@/lib/cart'
import { useCopy, useLang } from '@/lib/i18n'
import { Qty } from './Cart'
import { IconArrowUpRight, IconCheck, IconPlus, IconStar } from './icons'

const M = SHOP.machine

/** Main product: gallery left, buy box right (sticky on desktop). */
function BuyBox({ onAddVisible }: { onAddVisible: (v: boolean) => void }) {
  const t = useCopy().shop
  const { lang } = useLang()
  const [img, setImg] = useState(0)
  const [finish, setFinish] = useState(0)
  const [config, setConfig] = useState(1)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState(0)
  const [justAdded, setJustAdded] = useState(false)
  const addRef = useRef<HTMLButtonElement>(null)
  const price = unitPrice({ id: M.id, config })

  useEffect(() => {
    // "gone" only once the button has scrolled up past the top, not while it is still below the fold
    const io = new IntersectionObserver(([e]) => onAddVisible(e.isIntersecting || e.boundingClientRect.top > 0))
    io.observe(addRef.current!)
    return () => io.disconnect()
  }, [onAddVisible])

  const add = () => {
    cart.add({ id: M.id, finish, config }, Math.max(1, qty))
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <div className="buy">
      <div className="buy-gallery">
        <div className="buy-main caye-photo">
          {M.gallery.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={i === 0 ? t.name : ''} className={i === img ? 'is-on' : ''} loading="lazy" decoding="async" />
          ))}
          <span className="buy-index mono">
            {String(img + 1).padStart(2, '0')} / {String(M.gallery.length).padStart(2, '0')}
          </span>
        </div>
        <div className="buy-thumbs" role="tablist">
          {M.gallery.map((src, i) => (
            <button key={src} role="tab" aria-selected={i === img} onClick={() => setImg(i)} aria-label={`${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>

      <div className="buy-box">
        <div className="buy-rating text-ui">
          <span className="stars" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <IconStar key={i} />
            ))}
          </span>
          {t.rating} · {t.reviews}
        </div>
        <h3>{t.name}</h3>
        <p className="buy-tagline">{t.tagline}</p>
        <div className="buy-price">
          <b className="mono">{money(price, lang)}</b>
          <span>{t.lease.replace('{n}', String(Math.round((M.lease * price) / M.price)))}</span>
        </div>

        <fieldset className="opt">
          <legend className="text-ui">
            {t.finish} <em>{t.finishes[finish]}</em>
          </legend>
          <div className="swatches">
            {M.finishes.map((f, i) => (
              <button
                key={f.id}
                aria-pressed={i === finish}
                aria-label={t.finishes[i]}
                style={{ ['--sw' as string]: f.swatch }}
                onClick={() => setFinish(i)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="opt">
          <legend className="text-ui">{t.config}</legend>
          <div className="configs">
            {t.configs.map(([name, sub], i) => (
              <button key={name} aria-pressed={i === config} onClick={() => setConfig(i)}>
                <span>{name}</span>
                <small className="mono">
                  {sub}
                  {M.configs[i] > 0 && <> · +{money(M.configs[i], lang)}</>}
                </small>
              </button>
            ))}
          </div>
        </fieldset>

        <p className="stock text-ui">
          <i />
          {t.stock}
        </p>

        <div className="buy-actions">
          <Qty value={qty} onChange={(n) => setQty(Math.max(1, n))} label={t.qty} />
          <button ref={addRef} className={`btn-solid text-ui ${justAdded ? 'is-done' : ''}`} onClick={add}>
            {justAdded ? <IconCheck /> : <IconPlus />}
            {justAdded ? t.added : t.add}
          </button>
        </div>
        <a href={`mailto:${PARTNER_EMAIL}?subject=CAYE Smart X`} className="btn-ghost text-ui">
          {t.quote}
          <IconArrowUpRight />
        </a>

        <ul className="perks">
          {t.perks.map((p) => (
            <li key={p}>
              <IconCheck />
              {p}
            </li>
          ))}
        </ul>

        <div className="tabs">
          <div role="tablist" className="tab-list text-ui">
            {t.tabs.map((tb, i) => (
              <button key={tb.h} role="tab" aria-selected={i === tab} onClick={() => setTab(i)}>
                {tb.h}
              </button>
            ))}
          </div>
          <dl className="tab-panel mono" role="tabpanel">
            {t.tabs[tab].rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

function Accessories() {
  const t = useCopy().shop
  const { lang } = useLang()
  const [done, setDone] = useState<string | null>(null)
  return (
    <div className="acc">
      <div className="acc-head" data-reveal>
        <h3 className="caye-title">{t.more}</h3>
        <p>{t.moreLead}</p>
      </div>
      <ul className="acc-grid">
        {SHOP.accessories.map((a) => {
          const [name, sub] = t.accessories[a.id]
          const badge = t.badge[a.id]
          return (
            <li key={a.id} className="product-card">
              <div className="product-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt={name} loading="lazy" decoding="async" />
                {badge && <span className="badge text-ui">{badge}</span>}
                <button
                  className="quick-add text-ui"
                  onClick={() => {
                    cart.add({ id: a.id })
                    setDone(a.id)
                    setTimeout(() => setDone((d) => (d === a.id ? null : d)), 1400)
                  }}
                >
                  {done === a.id ? <IconCheck /> : <IconPlus />}
                  {done === a.id ? t.added : t.quickAdd}
                </button>
              </div>
              <div className="product-meta">
                <div>
                  <h4>{name}</h4>
                  <p className="text-ui">{sub}</p>
                </div>
                <span className="mono">{money(a.price, lang)}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Appears at the bottom while the shop is on screen but the main "add" button is not. */
function StickyBuy({ show }: { show: boolean }) {
  const t = useCopy().shop
  const { lang } = useLang()
  return (
    <div className={`sticky-buy ${show ? 'is-on' : ''}`} inert={!show}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={M.gallery[0]} alt="" />
      <div className="sticky-buy-name">
        <b>{t.name}</b>
        <span className="text-ui">
          <i />
          {t.stock.split('·')[0]}
        </span>
      </div>
      <span className="mono sticky-buy-price">{money(M.price, lang)}</span>
      <button className="btn-solid text-ui" onClick={() => cart.add({ id: M.id, finish: 0, config: 1 })}>
        <IconPlus />
        {t.add}
      </button>
    </div>
  )
}

export function Shop() {
  const t = useCopy().shop
  const root = useRef<HTMLElement>(null)
  const [inShop, setInShop] = useState(false)
  const [addVisible, setAddVisible] = useState(true)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInShop(e.isIntersecting), { rootMargin: '-30% 0px -10% 0px' })
    io.observe(root.current!)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => io.disconnect()
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((block) => {
        gsap.from(block.children, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: block, start: 'top 80%', toggleActions: 'play none none reverse' },
        })
      })
      gsap.from('.product-card', {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.07,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.acc-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    }, root)
    return () => {
      io.disconnect()
      ctx.revert()
    }
  }, [])

  return (
    <section ref={root} id="shop" className="shop">
      <header className="shop-intro" data-reveal>
        <span className="text-ui eyebrow-c">{t.eyebrow}</span>
        <h2 className="caye-title">
          <span>{t.title[0]}</span>
          <span>{t.title[1]}</span>
        </h2>
      </header>
      <BuyBox onAddVisible={setAddVisible} />
      <Accessories />
      <StickyBuy show={inShop && !addVisible} />
    </section>
  )
}
