import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { DockNav } from './DockNav'
import { Icon, type IconName } from '@/components/ui/Icon'
import { ModeIconButton, ModeSwitch } from '@/components/ui/ModeToggle'
import { useCart } from '@/context/CartContext'
import { useUI } from '@/context/UIContext'
import { cn } from '@/lib/format'

const MOBILE_LINKS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/catalogo', label: 'Catálogo', icon: 'grid' },
  { to: '/envios', label: 'Envíos', icon: 'truck' },
  { to: '/pagos', label: 'Pagos', icon: 'card' },
  { to: '/como-comprar', label: 'Cómo comprar', icon: 'receipt' },
  { to: '/guia-de-talles', label: 'Tabla de talles', icon: 'tag' },
  { to: '/nosotros', label: 'Quiénes somos', icon: 'users' },
  { to: '/contacto', label: 'Contacto', icon: 'chat' },
]

export function Navbar() {
  const [q, setQ] = useState('')
  const { count } = useCart()
  const { openCart, menuOpen, setMenuOpen } = useUI()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen])

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
            <Link to="/" className="block">
              <Logo size={64} wordmark wordmarkClassName="text-[24px] sm:text-[28px]" className="gap-2.5 sm:gap-3.5" />
            </Link>
          </motion.div>
        </div>

        <DockNav />

        <div className="col-start-3 flex items-center justify-end gap-3">
          {searchField('nav-search', 'hidden w-44 xl:block xl:w-56')}
          <ModeIconButton className="max-sm:hidden" />
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
          {/* botón del menú del celular: píldora con las rayitas que se convierten en una cruz */}
          <button
            className={cn(
              'flex h-10 items-center gap-2 rounded-full border pl-3 pr-3.5 text-[13px] font-semibold transition-colors lg:hidden',
              menuOpen ? 'border-accent bg-accent text-on-accent' : 'border-control text-ink hover:border-ink',
            )}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span className={cn('absolute left-0 top-0 h-[2px] w-4 rounded-full bg-current transition-transform duration-200', menuOpen && 'translate-y-[5px] rotate-45')} />
              <span className={cn('absolute left-0 top-[5px] h-[2px] w-2.5 rounded-full bg-current transition-opacity duration-150', menuOpen && 'opacity-0')} />
              <span className={cn('absolute left-0 top-[10px] h-[2px] w-4 rounded-full bg-current transition-transform duration-200', menuOpen && '-translate-y-[5px] -rotate-45')} />
            </span>
            <span aria-hidden="true" className="max-[359px]:hidden">{menuOpen ? 'Cerrar' : 'Menú'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu-movil"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-gallery lg:hidden"
          >
            <div className="page-x pb-10 pt-6">
              {searchField('menu-search')}
              <ul className="mt-5 grid grid-cols-2 gap-2.5">
                {MOBILE_LINKS.map((l, i) => (
                  <motion.li
                    key={l.to}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.2 }}
                  >
                    <NavLink
                      to={l.to}
                      end={l.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex h-full flex-col gap-3 rounded-2xl border p-4 text-[15px] font-semibold transition-colors',
                          isActive ? 'border-accent bg-accent/10 text-[color:var(--bz-accent-text)]' : 'border-line bg-card hover:border-control',
                        )
                      }
                    >
                      <span className="grid size-9 place-items-center rounded-xl bg-stage text-ink">
                        <Icon name={l.icon} size={19} />
                      </span>
                      {l.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex items-center justify-between gap-4">
                <span className="label text-index">Modo</span>
                <ModeSwitch />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
