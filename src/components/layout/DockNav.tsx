import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/format'

export const DOCK_ITEMS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/catalogo', label: 'Catálogo', icon: 'grid' },
  { to: '/envios', label: 'Envíos', icon: 'truck' },
  { to: '/pagos', label: 'Pagos', icon: 'card' },
  { to: '/como-comprar', label: 'Cómo comprar', icon: 'receipt' },
  { to: '/contacto', label: 'Contacto', icon: 'chat' },
]

/**
 * Barra de secciones de la compu: píldora con ícono y nombre de cada sección.
 * La sección actual se marca con una píldora roja que se desliza de una a otra.
 */
export function DockNav() {
  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <ul className="flex items-center gap-0.5 rounded-full border border-line bg-[color-mix(in_srgb,var(--bz-card)_70%,transparent)] p-1.5 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.8)] backdrop-blur-md">
        {DOCK_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors xl:px-4',
                  isActive ? 'text-white' : 'text-index hover:bg-[color-mix(in_srgb,var(--bz-ink)_7%,transparent)] hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="seccion-activa"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#ea3a45,#c41f2b)] shadow-[0_8px_20px_-8px_rgb(217_44_55/0.9),inset_0_1px_0_rgb(255_255_255/0.25)]"
                    />
                  )}
                  <Icon name={item.icon} size={16} className="relative hidden xl:block" />
                  <span className="relative whitespace-nowrap">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
