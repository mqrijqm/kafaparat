'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { GOLDEN_STANDARD, machineGallery, PARTNER_EMAIL, SHOP } from '@/lib/content'
import { cart, money, unitPrice } from '@/lib/cart'
import { useCopy, useLang } from '@/lib/i18n'
import { Qty } from './Cart'
import { IconArrowUpRight, IconCheck, IconPlus } from './icons'

const M = SHOP.machine

/**
 * Main product photo that cross-fades when the variant changes: the old photo stays underneath
 * while the new one fades in on top (layers are derived during render, no effect needed).
 */
function Crossfade({ src, alt }: { src: string; alt: string }) {
  const [layers, setLayers] = useState([src])
  const top = layers[layers.length - 1]
  if (top !== src) setLayers([top, src])
  return layers.map((l) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={l} src={l} alt={l === src ? alt : ''} className={l === src ? 'is-top' : ''} decoding="async" />
  ))
}

/** Main product: gallery left, buy box right (sticky on desktop). */
function BuyBox({ onAddVisible }: { onAddVisible: (v: boolean) => void }) {
  const t = useCopy().shop
  const { lang } = useLang()
  const [img, setImg] = useState(0)
  const [finish, setFinish] = useState(0)
  const [config, setConfig] = useState(0) // single hopper is the primary version
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState(0)
  const [justAdded, setJustAdded] = useState(false)
  const addRef = useRef<HTMLButtonElement>(null)
  const price = unitPrice({ id: M.id, config })
  const gallery = machineGallery(finish, config)
  const root = useRef<HTMLDivElement>(null)

  // warm the cache with every variant once the buy box is near, so switching options is instant
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        M.finishes.forEach((_, f) => M.configs.forEach((_, c) => machineGallery(f, c).forEach((src) => (new Image().src = src))))
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(root.current!)
    return () => io.disconnect()
  }, [])

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
    <div ref={root} className="buy">
      <div className="buy-gallery">
        <div className="buy-main caye-photo">
          <Crossfade src={gallery[img]} alt={`${t.name}, ${t.finishes[finish]}, ${t.configs[config][0]}`} />
          <span className="buy-index mono">
            {String(img + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
          </span>
          <span className="buy-variant text-ui">
            {t.variant}: {t.finishes[finish]} · {t.configs[config][0]}
          </span>
        </div>
        <div className="buy-thumbs" role="tablist">
          {gallery.map((src, i) => (
            <button key={i} role="tab" aria-selected={i === img} onClick={() => setImg(i)} aria-label={`${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>

      <div className="buy-box">
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
            {t.tabs[tab].rows.map(([k, v], i) => (
              <div key={k}>
                <dt>{k}</dt>
                {/* the grinder count follows the chosen hopper configuration */}
                <dd>{tab === 0 && i === 0 ? v.replace(/^\d ×/, `${config + 1} ×`) : v}</dd>
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
  const [cat, setCat] = useState<(typeof SHOP.categories)[number]>('all')
  const items = SHOP.accessories.filter((a) => cat === 'all' || a.cat === cat)
  return (
    <div className="acc">
      <div className="acc-head" data-reveal>
        <div>
          <a href={GOLDEN_STANDARD.url[lang]} target="_blank" rel="noopener" className="acc-brand text-ui">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GOLDEN_STANDARD.mark} alt="" />
            {t.brand}
          </a>
          <h3 className="caye-title">{t.more}</h3>
        </div>
        <p>{t.moreLead}</p>
      </div>
      <div className="acc-filter text-ui" role="tablist">
        {SHOP.categories.map((c) => (
          <button key={c} role="tab" aria-selected={c === cat} onClick={() => setCat(c)}>
            {t.cats[c]}
            <span className="mono">{c === 'all' ? SHOP.accessories.length : SHOP.accessories.filter((a) => a.cat === c).length}</span>
          </button>
        ))}
      </div>
      <ul className="acc-grid">
        {items.map((a) => {
          const [name, sub] = t.accessories[a.id]
          const badge = t.badge[a.id]
          return (
            <li key={a.id} className="product-card">
              <div className="product-media">
                {a.link ? (
                  <a href={a.link} target="_blank" rel="noopener" className="product-img-link" aria-label={`${t.brand} ${name} — ${t.details}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt={`${t.brand} ${name}`} loading="lazy" decoding="async" />
                  </a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image} alt={`${t.brand} ${name}`} loading="lazy" decoding="async" />
                )}
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
                  <span className="product-brand text-ui">{t.brand}</span>
                  <h4>
                    {a.link ? (
                      <a href={a.link} target="_blank" rel="noopener">
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                  </h4>
                  <p className="text-ui">{sub}</p>
                  {a.link && (
                    <a href={a.link} target="_blank" rel="noopener" className="product-ext text-ui">
                      {t.details}
                      <IconArrowUpRight />
                    </a>
                  )}
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
      <img src={machineGallery(0, 0)[0]} alt="" />
      <div className="sticky-buy-name">
        <b>{t.name}</b>
        <span className="text-ui">
          <i />
          {t.stock.split('·')[0]}
        </span>
      </div>
      <span className="mono sticky-buy-price">{money(M.price, lang)}</span>
      <button className="btn-solid text-ui" onClick={() => cart.add({ id: M.id, finish: 0, config: 0 })}>
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
