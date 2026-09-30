import { NAV } from '@/lib/content'
import { IconBag, IconGrid, IconInstagram, IconLayers, IconPlay } from './icons'

const ICONS = { grid: IconGrid, layers: IconLayers, play: IconPlay }

export default function Header() {
  return (
    <header className="site-header">
      <a href="#intro" className="logo" aria-label="MOLA home">
        mola<i />
        <small>No.1</small>
      </a>
      <nav className="nav text-ui" aria-label="Main">
        {NAV.map((n) => {
          const Icon = ICONS[n.icon]
          return (
            <a key={n.href} href={n.href}>
              <Icon />
              {n.label}
            </a>
          )
        })}
        <a href="#" aria-label="Instagram">
          <IconInstagram />
        </a>
        <a href="#start" className="btn-reserve">
          <IconBag />
          Reserve
        </a>
      </nav>
      <button className="burger" aria-label="Open menu">
        <span />
        <span />
      </button>
    </header>
  )
}
