import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { DockNav } from './DockNav'
import { Icon } from '@/components/ui/Icon'
import { useCart } from '@/context/CartContext'
import { useUI } from '@/context/UIContext'
import { cn } from '@/lib/format'

const MOBILE_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/envios', label: 'Envíos' },
  { to: '/pagos', label: 'Pagos' },
  { to: '/como-comprar', label: 'Cómo comprar' },
  { to: '/guia-de-talles', label: 'Tabla de talles' },
  { to: '/nosotros', label: 'Quiénes somos' },
  { to: '/contacto', label: 'Contacto' },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const { count } = useCart()
  const { openCart } = useUI()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => setMenuOpen(false), [pathname])

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : '/catalogo')
    setQ('')
    setMenuOpen(false)
  }

  const searchField = (id: string, className?: string) => (
    <form onSubmit={search} role="search" className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        Buscar modelo o marca
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar modelo o marca"
        autoComplete="off"
        className="field-line !rounded-full !py-2.5 !pl-4 !pr-10"
      />
      <button type="submit" aria-label="Buscar" className="absolute right-3 top-1/2 -translate-y-1/2 text-index hover:text-ink">
        <Icon name="search" size={16} />
      </button>
    </form>
  )

  return (
    <header className="fixed inset-x-0 top-0 z-[300] border-b border-line bg-card">
      <div className="page-x grid h-[84px] grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* logo al costado: se agranda al acercar el mouse */}
        <div className="flex items-center">
          <motion.div whileHover={reduced ? undefined : { scale: 1.18 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ originX: 0 }}>
            <Link to="/" aria-label="Boom Zapas, inicio" className="block">
              <Logo size={64} wordmark wordmarkClassName="text-[24px] sm:text-[28px]" className="gap-2.5 sm:gap-3.5" />
            </Link>
          </motion.div>
        </div>

        <DockNav />

        <div className="col-start-3 flex items-center justify-end gap-3">
          {searchField('nav-search', 'hidden w-44 xl:block xl:w-56')}
          <button
            onClick={openCart}
            aria-label={`Abrir pedido, ${count} ${count === 1 ? 'producto' : 'productos'}`}
            className="relative grid size-10 place-items-center hover:text-accent"
          >
            <Icon name="bag" size={22} />
            <span
              aria-hidden="true"
              className="absolute right-0 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-[18px] text-on-accent"
            >
              {count}
            </span>
          </button>
          <button
            className="-mr-2 grid size-10 place-items-center lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu-movil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-gallery lg:hidden"
          >
            <div className="page-x py-6">
              {searchField('menu-search')}
              <ul className="mt-6">
                {MOBILE_LINKS.map((l) => (
                  <li key={l.to} className="border-b border-line">
                    <NavLink
                      to={l.to}
                      end={l.to === '/'}
                      className={({ isActive }) => cn('block py-4 text-[17px] font-medium', isActive && 'text-accent')}
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
