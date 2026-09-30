'use client'

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'
import { COPY, LANGS, type Lang } from './content'

const KEY = 'kafaparat-lang'

// Tiny external store: the choice lives in memory, mirrored to localStorage (which may be unavailable).
let current: Lang | null = null
const listeners = new Set<() => void>()

function read(): Lang {
  try {
    const saved = localStorage.getItem(KEY) as Lang | null
    if (saved && LANGS.includes(saved)) return saved
  } catch {}
  return 'bs'
}

function setLang(l: Lang) {
  current = l
  try {
    localStorage.setItem(KEY, l)
  } catch {}
  listeners.forEach((f) => f())
}

const subscribe = (f: () => void) => {
  listeners.add(f)
  return () => void listeners.delete(f)
}
const getSnapshot = () => (current ??= read())
const getServerSnapshot = (): Lang => 'bs'

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'bs', setLang })

/** Bosnian by default; the visitor's choice is remembered per browser. */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = COPY[lang].meta.title
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
export const useCopy = () => COPY[useContext(LangContext).lang]
