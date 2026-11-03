import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { DockNav } from './DockNav'
import { Buscador } from './Buscador'
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
  const [buscar, setBuscar] = useState(false)
  const { count } = useCart()
  const { openCart, menuOpen, setMenuOpen } = useUI()
  const { pathname } = useLocation()
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    setMenuOpen(false)
    setBuscar(false)
  }, [pathname, setMenuOpen])

  return (
    <header className="on-bar fixed inset-x-0 top-0 z-[300] border-b border-white/10 !shadow-[0_10px_30px_-18px_rgb(0_0_0/0.8)]">
      {/* encabezado con los colores del logo (negro y granate) en los dos modos */}
      {/* filo rojo abajo del encabezado, como las líneas del logo */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-[linear-gradient(90deg,transparent,rgb(217_44_55/0.7)_30%,rgb(217_44_55/0.7)_70%,transparent)]" />
      <div className="page-x grid h-[84px] grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* logo al costado: se agranda al acercar el mouse */}
        <div className="flex items-center">
          <motion.div whileHover={reduced ? undefined : { scale: 1.18 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ originX: 0 }}>
            <Link to="/" className="block">
              <Logo size={64} wordmark wordmarkClassName="text-[24px] sm:text-[28px]" className="gap-2.5 sm:gap-3.5" />
              <span className="sr-only">: ir al inicio</span>
            </Link>
          </motion.div>
        </div>

        <DockNav />

        <div className="col-start-3 flex items-center justify-end gap-3">
          <Buscador id="nav-search" variante="barra" className="hidden w-56 xl:block 2xl:w-64" />
          {/* en pantallas medianas el buscador se abre desde una lupa */}
          <button
            type="button"
            onClick={() => setBuscar((b) => !b)}
            aria-expanded={buscar}
            aria-label={buscar ? 'Cerrar buscador' : 'Buscar'}
            className="hidden size-10 place-items-center rounded-full border border-line text-ink transition-colors hover:border-control lg:grid xl:hidden"
          >
            <Icon name={buscar ? 'x' : 'search'} size={18} />
          </button>
          <ModeIconButton className="max-sm:hidden" />
          <button
            onClick={openCart}
            aria-label={`Abrir pedido, ${count} ${count === 1 ? 'producto' : 'productos'}`}
            className="relative grid size-10 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
          >
            <Icon name="bag" size={19} />
            {count > 0 && (
              <motion.span
                key={count}
                initial={reduced ? false : { scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                aria-hidden="true"
                className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10.5px] font-bold text-on-accent ring-2 ring-[color:var(--bz-card)]"
              >
                {count}
              </motion.span>
            )}
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

      {buscar && (
        <div className="page-x absolute inset-x-0 top-full hidden justify-end pt-3 lg:flex xl:hidden">
          <Buscador id="nav-search-md" variante="barra" className="w-[420px]" autoFocus onElegir={() => setBuscar(false)} />
        </div>
      )}

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
              <Buscador id="menu-search" variante="menu" onElegir={() => setMenuOpen(false)} />
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
