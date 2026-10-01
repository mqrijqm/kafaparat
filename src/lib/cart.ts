'use client'

import { useSyncExternalStore } from 'react'
import { SHOP, type Lang } from './content'

/*
  Cart = a tiny external store (same pattern as the language toggle): lives in memory,
  mirrored to localStorage so a refresh keeps the cart. Storage may be unavailable (private mode):
  every read/write is guarded and the cart still works for the session.
*/

export type CartLine = {
  /** product id + options, e.g. "caye-smart-x:silver:1" — the same product with other options is another line */
  key: string
  id: string
  qty: number
  finish?: number
  config?: number
}

type State = { lines: CartLine[]; open: boolean; /** bumps on every add, drives the toast */ added: number; lastKey: string | null }

const KEY = 'kafaparat-cart'
const EMPTY: State = { lines: [], open: false, added: 0, lastKey: null }
let state: State | null = null
const listeners = new Set<() => void>()

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const lines = (JSON.parse(raw) as CartLine[]).filter((l) => l && typeof l.qty === 'number' && unitPrice(l) > 0)
      return { ...EMPTY, lines }
    }
  } catch {}
  return EMPTY
}

function set(next: Partial<State>) {
  state = { ...get(), ...next }
  if (next.lines) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next.lines))
    } catch {}
  }
  listeners.forEach((f) => f())
}

const get = () => (state ??= load())
const subscribe = (f: () => void) => {
  listeners.add(f)
  return () => void listeners.delete(f)
}

export function unitPrice(l: Pick<CartLine, 'id' | 'config'>) {
  if (l.id === SHOP.machine.id) return SHOP.machine.price + (SHOP.machine.configs[l.config ?? 0] ?? 0)
  return SHOP.accessories.find((a) => a.id === l.id)?.price ?? 0
}

export const cart = {
  add(line: Omit<CartLine, 'key' | 'qty'>, qty = 1) {
    const key = [line.id, line.finish ?? '', line.config ?? ''].join(':')
    const lines = get().lines.slice()
    const i = lines.findIndex((l) => l.key === key)
    if (i >= 0) lines[i] = { ...lines[i], qty: Math.min(99, lines[i].qty + qty) }
    else lines.push({ ...line, key, qty })
    set({ lines, added: get().added + 1, lastKey: key })
  },
  setQty(key: string, qty: number) {
    const lines = get()
      .lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l))
      .filter((l) => l.qty > 0)
    set({ lines })
  },
  remove(key: string) {
    set({ lines: get().lines.filter((l) => l.key !== key) })
  },
  setOpen(open: boolean) {
    set({ open })
  },
}

export function useCart() {
  const s = useSyncExternalStore(subscribe, get, () => EMPTY)
  const count = s.lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = s.lines.reduce((n, l) => n + l.qty * unitPrice(l), 0)
  return { ...s, count, subtotal }
}

/** €8.950 (bs) / €8,950 (en) — the site writes the euro sign first in both languages. */
export function money(n: number, lang: Lang) {
  return '€' + n.toLocaleString(lang === 'bs' ? 'de-DE' : 'en-US')
}
