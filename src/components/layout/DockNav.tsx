import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
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

/** Qué tan lejos del mouse empieza a agrandarse una sección (px). */
const RANGE = 150

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function DockItem({ item, mouseX, animate }: { item: (typeof DOCK_ITEMS)[number]; mouseX: MotionValue<number>; animate: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null)

  // 0 = lejos del mouse, 1 = el mouse encima: cuanto más cerca, más grande (como el dock de macOS).
  const cerca = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect()
    if (!b) return 0
    const d = Math.abs(x - (b.left + b.width / 2))
    return Math.max(0, 1 - d / RANGE)
  })
  const f = useSpring(cerca, { mass: 0.12, stiffness: 190, damping: 15 })
  const height = useTransform(f, [0, 1], [40, 52])
  const px = useTransform(f, [0, 1], [14, 20])
  const fontSize = useTransform(f, [0, 1], [13, 15])
  const iconScale = useTransform(f, [0, 1], [1, 1.25])

  return (
    <NavLink
      ref={ref}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'relative block rounded-full font-semibold transition-colors',
          isActive ? 'text-white' : 'text-index hover:bg-[color-mix(in_srgb,var(--bz-ink)_7%,transparent)] hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <motion.span
          style={animate ? { height, paddingLeft: px, paddingRight: px, fontSize } : undefined}
          className="relative flex h-10 items-center gap-2 px-3.5 text-[13px]"
        >
          {isActive && (
            <motion.span
              layoutId="seccion-activa"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#ea3a45,#c41f2b)] shadow-[0_8px_20px_-8px_rgb(217_44_55/0.9),inset_0_1px_0_rgb(255_255_255/0.25)]"
            />
          )}
          <motion.span style={animate ? { scale: iconScale } : undefined} className="relative hidden xl:block">
            <Icon name={item.icon} size={16} />
          </motion.span>
          <span className="relative whitespace-nowrap">{item.label}</span>
        </motion.span>
      )}
    </NavLink>
  )
}

/**
 * Barra de secciones de la compu: píldora con ícono y nombre de cada sección.
 * Al pasar el mouse, la sección más cercana se agranda; la actual se marca en rojo.
 */
export function DockNav() {
  const mouseX = useMotionValue(Infinity)
  const animate = !reducedMotion()

  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <motion.ul
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex h-[62px] items-center gap-0.5 rounded-full border border-line bg-[color-mix(in_srgb,var(--bz-card)_70%,transparent)] px-1.5 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.8)] backdrop-blur-md"
      >
        {DOCK_ITEMS.map((item) => (
          <li key={item.to}>
            <DockItem item={item} mouseX={mouseX} animate={animate} />
          </li>
        ))}
      </motion.ul>
    </nav>
  )
}
