import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/Icon'
import { useCart } from '@/context/CartContext'
import { useUI } from '@/context/UIContext'
import { cn } from '@/lib/format'

/**
 * Barra de navegación fija abajo, sólo en el celular (como en una app):
 * Inicio, Catálogo, Pedido y Menú, siempre al alcance del pulgar.
 */
export function BottomNav() {
  const { count } = useCart()
  const { openCart, menuOpen, setMenuOpen } = useUI()

  const item = 'relative flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold'

  const link = (to: string, label: string, icon: IconName, end?: boolean) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => setMenuOpen(false)}
      className={({ isActive }) => cn(item, isActive && !menuOpen ? 'text-[color:var(--bz-accent-text)]' : 'text-index')}
    >
      <Icon name={icon} size={21} />
      {label}
    </NavLink>
  )

  return (
    <nav
      aria-label="Navegación rápida"
      className="fixed inset-x-0 bottom-0 z-[320] flex h-[calc(64px+env(safe-area-inset-bottom))] border-t border-line bg-gallery/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {link('/', 'Inicio', 'home', true)}
      {link('/catalogo', 'Catálogo', 'grid')}
      <button type="button" onClick={openCart} className={cn(item, 'text-index')} aria-label={`Pedido, ${count} ${count === 1 ? 'producto' : 'productos'}`}>
        <span className="relative">
          <Icon name="bag" size={21} />
          {count > 0 && (
            <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9.5px] font-bold text-on-accent">
              {count}
            </span>
          )}
        </span>
        Pedido
      </button>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-controls="menu-movil"
        className={cn(item, menuOpen ? 'text-[color:var(--bz-accent-text)]' : 'text-index')}
      >
        <Icon name={menuOpen ? 'x' : 'search'} size={21} />
        {menuOpen ? 'Cerrar' : 'Buscar'}
      </button>
    </nav>
  )
}
