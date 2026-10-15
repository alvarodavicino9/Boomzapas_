import { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/format'

export const DOCK_ITEMS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Inicio', icon: 'store', end: true },
  { to: '/catalogo', label: 'Catálogo', icon: 'bag' },
  { to: '/envios', label: 'Envíos', icon: 'truck' },
  { to: '/pagos', label: 'Pagos', icon: 'card' },
  { to: '/como-comprar', label: 'Cómo comprar', icon: 'check' },
  { to: '/contacto', label: 'Contacto', icon: 'chat' },
]

const BASE = 42
const MAX = 64
const RANGE = 140

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function DockItem({ item, mouseX, animate }: { item: (typeof DOCK_ITEMS)[number]; mouseX: MotionValue<number>; animate: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [tip, setTip] = useState(false)

  // Distancia del mouse al centro de este icono → tamaño (cuanto más cerca, más grande).
  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect()
    return b ? x - (b.left + b.width / 2) : Infinity
  })
  const target = useTransform(distance, [-RANGE, 0, RANGE], [BASE, MAX, BASE])
  const size = useSpring(target, { mass: 0.12, stiffness: 190, damping: 15 })

  return (
    <NavLink
      ref={ref}
      to={item.to}
      end={item.end}
      aria-label={item.label}
      onMouseEnter={() => setTip(true)}
      onMouseLeave={() => setTip(false)}
      onFocus={() => setTip(true)}
      onBlur={() => setTip(false)}
      className="relative flex items-end"
    >
      {({ isActive }) => (
        <>
          <motion.span
            style={animate ? { width: size, height: size } : { width: BASE, height: BASE }}
            className={cn(
              'grid aspect-square place-items-center rounded-full transition-colors',
              isActive ? 'bg-accent text-on-accent' : 'text-ink hover:bg-ink/10',
            )}
          >
            <Icon name={item.icon} size={20} />
          </motion.span>
          <span
            role="presentation"
            className={cn(
              'pointer-events-none absolute left-1/2 top-full z-10 mt-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gallery shadow-lift transition-all duration-150',
              tip ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
            )}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}

/** Barra de iconos redondos al centro: se agrandan según qué tan cerca esté el mouse (como el dock de macOS). */
export function DockNav() {
  const mouseX = useMotionValue(Infinity)
  const animate = !reducedMotion()

  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <motion.ul
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex h-[68px] items-center gap-1.5 rounded-full border border-line bg-ink/[0.05] px-3 backdrop-blur"
      >
        {DOCK_ITEMS.map((item) => (
          <li key={item.to} className="flex items-center">
            <DockItem item={item} mouseX={mouseX} animate={animate} />
          </li>
        ))}
      </motion.ul>
    </nav>
  )
}
