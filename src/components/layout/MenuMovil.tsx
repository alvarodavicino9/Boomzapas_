import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { Icon, type IconName } from '@/components/ui/Icon'
import { ModeSwitch } from '@/components/ui/ModeToggle'
import { Buscador } from './Buscador'
import { InstalarApp } from './InstalarApp'
import { useUI } from '@/context/UIContext'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { SITE } from '@/config/site'
import { cn } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'

const GRUPOS: { titulo: string; links: { to: string; label: string; icon: IconName; end?: boolean }[] }[] = [
  {
    titulo: 'Tienda',
    links: [
      { to: '/', label: 'Inicio', icon: 'home', end: true },
      { to: '/catalogo', label: 'Catálogo', icon: 'grid', end: true },
      { to: '/catalogo?nuevos=1', label: 'Nuevos ingresos', icon: 'sparkle' },
    ],
  },
  {
    titulo: 'Ayuda',
    links: [
      { to: '/como-comprar', label: 'Cómo comprar', icon: 'receipt' },
      { to: '/envios', label: 'Envíos y retiro', icon: 'truck' },
      { to: '/pagos', label: 'Medios de pago', icon: 'card' },
      { to: '/guia-de-talles', label: 'Tabla de talles', icon: 'tag' },
    ],
  },
  {
    titulo: 'Boom Zapas',
    links: [
      { to: '/nosotros', label: 'Quiénes somos', icon: 'users' },
      { to: '/contacto', label: 'Contacto', icon: 'chat' },
    ],
  },
]

/**
 * Menú del celular: panel que entra desde la derecha (se cierra tocando afuera, con la X,
 * deslizándolo hacia la derecha o con Escape). Buscador arriba, secciones agrupadas y contacto abajo.
 */
export function MenuMovil() {
  const { menuOpen, setMenuOpen } = useUI()
  const cerrar = () => setMenuOpen(false)
  const { pathname, search } = useLocation()
  // "Catálogo" y "Nuevos ingresos" son la misma página: se distinguen por ?nuevos=1
  const activo = (to: string, end?: boolean) => {
    const [ruta, query] = to.split('?')
    if (query) return pathname === ruta && search.includes(query)
    if (ruta === '/catalogo' && search.includes('nuevos=1')) return false
    return end ? pathname === ruta : pathname.startsWith(ruta)
  }
  useLockBodyScroll(menuOpen)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen, setMenuOpen])

  return createPortal(
    <AnimatePresence>
      {menuOpen && (
        <motion.div className="fixed inset-0 z-[480] lg:hidden" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            onClick={cerrar}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.7 }}
            onDragEnd={(_, info) => (info.offset.x > 90 || info.velocity.x > 500) && cerrar()}
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-[390px] flex-col overflow-hidden rounded-l-[28px] bg-gallery shadow-[-30px_0_60px_-20px_rgb(0_0_0/0.7)]"
          >
            {/* cabecera con la marca */}
            <div className="on-bar relative flex items-center justify-between gap-3 px-5 pb-4 pt-[calc(16px+env(safe-area-inset-top))]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgb(var(--bz-glow)/0.8),transparent_70%)]"
              />
              <Link to="/" onClick={cerrar} className="relative">
                <Logo size={46} wordmark wordmarkClassName="text-[19px]" className="gap-2.5" />
                <span className="sr-only">: ir al inicio</span>
              </Link>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar menú"
                className="relative grid size-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
              >
                <Icon name="x" size={19} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4">
              <Buscador id="menu-search" variante="menu" onElegir={cerrar} />

              {GRUPOS.map((g, gi) => (
                <nav key={g.titulo} aria-label={g.titulo} className="mt-6">
                  <p className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-index">{g.titulo}</p>
                  <ul>
                    {g.links.map((l, i) => (
                      <motion.li
                        key={l.to}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + (gi * 3 + i) * 0.025, duration: 0.25 }}
                      >
                        {(() => {
                          const isActive = activo(l.to, l.end)
                          return (
                        <Link
                          to={l.to}
                          onClick={cerrar}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            'group relative flex h-[52px] items-center gap-3.5 rounded-2xl px-3 text-[15px] font-semibold transition-colors',
                            isActive ? 'bg-accent/10 text-[color:var(--bz-accent-text)]' : 'text-ink active:bg-stage',
                          )}
                        >
                              {isActive && <span aria-hidden="true" className="absolute left-0 top-3 h-7 w-1 rounded-r-full bg-accent" />}
                              <span
                                className={cn(
                                  'grid size-9 shrink-0 place-items-center rounded-xl transition-colors',
                                  isActive ? 'bg-accent text-on-accent' : 'bg-accent/10 text-[color:var(--bz-accent-text)]',
                                )}
                              >
                                <Icon name={l.icon} size={17} />
                              </span>
                              <span className="flex-1">{l.label}</span>
                              <Icon name="chevron" size={16} className="-rotate-90 text-index" />
                        </Link>
                          )
                        })()}
                      </motion.li>
                    ))}
                  </ul>
                </nav>
              ))}

              <InstalarApp className="mt-6 !border-line" />
            </div>

            {/* contacto y modo, siempre a mano */}
            <div className="border-t border-line bg-card px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <a
                  href={waLink('Hola Boom Zapas. Quiero hacer una consulta.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent !min-h-12 !px-4"
                >
                  <Icon name="whatsapp" size={18} /> Escribinos
                </a>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid size-12 place-items-center rounded-full border border-line transition-colors hover:border-control"
                >
                  <Icon name="instagram" size={19} />
                </a>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-index">Modo</span>
                <ModeSwitch className="scale-90 origin-right" />
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
