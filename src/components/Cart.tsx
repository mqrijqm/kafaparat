'use client'

import { useEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import { machineGallery, SHOP } from '@/lib/content'
import { cart, money, unitPrice, useCart, type CartLine } from '@/lib/cart'
import { useCopy, useLang } from '@/lib/i18n'
import { IconArrowRight, IconBag, IconClose, IconMinus, IconPlus } from './icons'

/** Bag + count. The badge re-mounts on every add, so its CSS "bump" animation replays. */
export function CartButton({ className = '' }: { className?: string }) {
  const t = useCopy().cart
  const { count, added } = useCart()
  return (
    <button className={`cart-button ${className}`} onClick={() => cart.setOpen(true)} aria-label={`${t.open} (${count})`}>
      <IconBag />
      <span className="text-ui hide-sm">{t.title}</span>
      <span key={added} className={`cart-count mono ${count ? 'has-items' : ''}`}>
        {count}
      </span>
    </button>
  )
}

/** The header scrolls away with the page; this bag stays reachable once it has. */
export function CartFab() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const onScroll = () => setOn(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className={`cart-fab ${on ? 'is-on' : ''}`} inert={!on}>
      <CartButton />
    </div>
  )
}

function lineInfo(l: CartLine, t: ReturnType<typeof useCopy>) {
  if (l.id === SHOP.machine.id) {
    return {
      name: t.shop.name,
      meta: `${t.shop.finishes[l.finish ?? 0]} · ${t.shop.configs[l.config ?? 0][0]}`,
      image: machineGallery(l.finish ?? 0, l.config ?? 0)[0],
    }
  }
  const a = SHOP.accessories.find((x) => x.id === l.id)!
  const [name, meta] = t.shop.accessories[l.id]
  return { name, meta, image: a.image }
}

export function Qty({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="qty mono" role="group" aria-label={label}>
      <button onClick={() => onChange(value - 1)} aria-label="−" disabled={value <= 0}>
        <IconMinus />
      </button>
      <output aria-live="polite">{value}</output>
      <button onClick={() => onChange(value + 1)} aria-label="+" disabled={value >= 99}>
        <IconPlus />
      </button>
    </div>
  )
}

export function CartDrawer() {
  const t = useCopy()
  const { lang } = useLang()
  const { lines, open, subtotal, count } = useCart()
  const lenis = useLenis()
  const closeRef = useRef<HTMLButtonElement>(null)

  // freeze the page under the drawer, close on Escape, move focus into the panel
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cart.setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

  const left = Math.max(0, SHOP.freeShipping - subtotal)
  const progress = Math.min(1, subtotal / SHOP.freeShipping)

  return (
    <div className={`cart ${open ? 'is-open' : ''}`} inert={!open}>
      <div className="cart-scrim" onClick={() => cart.setOpen(false)} />
      <aside className="cart-panel" role="dialog" aria-modal="true" aria-label={t.cart.title} data-lenis-prevent>
        <header className="cart-head">
          <h2>
            {t.cart.title} <span className="mono">({count})</span>
          </h2>
          <button ref={closeRef} className="icon-btn" onClick={() => cart.setOpen(false)} aria-label={t.cart.close}>
            <IconClose />
          </button>
        </header>

        {lines.length > 0 && (
          <div className="ship-meter text-ui">
            <span>{left > 0 ? t.cart.freeLeft.replace('{n}', String(left)) : t.cart.freeDone}</span>
            <i style={{ ['--p' as string]: progress }} />
          </div>
        )}

        {lines.length === 0 ? (
          <div className="cart-empty">
            <IconBag />
            <p>{t.cart.empty}</p>
            <a href="#shop" className="ui-button text-ui" onClick={() => cart.setOpen(false)}>
              {t.cart.browse}
              <IconArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <ul className="cart-lines">
            {lines.map((l) => {
              const info = lineInfo(l, t)
              return (
                <li key={l.key}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={info.image} alt="" />
                  <div className="cart-line-body">
                    <div className="cart-line-top">
                      <h3>{info.name}</h3>
                      <span className="mono">{money(unitPrice(l) * l.qty, lang)}</span>
                    </div>
                    <p className="text-ui">{info.meta}</p>
                    <div className="cart-line-actions">
                      <Qty value={l.qty} onChange={(n) => cart.setQty(l.key, n)} label={t.shop.qty} />
                      <button className="link text-ui" onClick={() => cart.remove(l.key)}>
                        {t.cart.remove}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {lines.length > 0 && (
          <footer className="cart-foot">
            <dl className="mono">
              <div>
                <dt>{t.cart.subtotal}</dt>
                <dd>{money(subtotal, lang)}</dd>
              </div>
              <div>
                <dt>{t.cart.shipping}</dt>
                <dd>{left > 0 ? t.cart.shippingFee : t.cart.free}</dd>
              </div>
            </dl>
            <button className="btn-solid text-ui">
              {t.cart.checkout}
              <span className="mono">{money(subtotal, lang)}</span>
            </button>
            <p className="cart-note">{t.cart.note}</p>
          </footer>
        )}
      </aside>
    </div>
  )
}

/** "Added to cart" — slides in for a few seconds after every add, links to the drawer. */
export function CartToast() {
  const t = useCopy()
  const { added, lastKey, lines, open } = useCart()
  // the toast is visible while the latest add hasn't timed out yet
  const [expired, setExpired] = useState(0)
  useEffect(() => {
    if (!added) return
    const id = setTimeout(() => setExpired(added), 3200)
    return () => clearTimeout(id)
  }, [added])
  const line = lines.find((l) => l.key === lastKey)
  const on = added > expired && !open && !!line
  return (
    <div className={`cart-toast ${on ? 'is-on' : ''}`} role="status" aria-live="polite">
      {line && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lineInfo(line, t).image} alt="" />
          <div>
            <span className="text-ui">{t.cart.toast}</span>
            <p>{lineInfo(line, t).name}</p>
          </div>
          <button className="link text-ui" onClick={() => cart.setOpen(true)} tabIndex={on ? 0 : -1}>
            {t.cart.view}
          </button>
        </>
      )}
    </div>
  )
}
