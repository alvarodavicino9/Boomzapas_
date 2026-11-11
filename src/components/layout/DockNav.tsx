import { useRef, useState } from 'react'
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

/** Qué tan lejos del mouse empieza a agrandarse el ícono de una sección (px). */
const RANGE = 140

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function DockItem({
  item,
  mouseX,
  animate,
  hover,
}: {
  item: (typeof DOCK_ITEMS)[number]
  mouseX: MotionValue<number>
  animate: boolean
  hover: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  // 0 = lejos del mouse, 1 = el mouse encima: el ícono crece y sube un poquito.
  const cerca = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect()
    if (!b) return 0
    const d = Math.abs(x - (b.left + b.width / 2))
    return Math.max(0, 1 - d / RANGE)
  })
  const f = useSpring(cerca, { mass: 0.12, stiffness: 200, damping: 16 })
  const iconScale = useTransform(f, [0, 1], [1, 1.35])
  const iconY = useTransform(f, [0, 1], [0, -2])

  return (
    <NavLink
      ref={ref}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'group relative flex h-[56px] items-center gap-2 px-3.5 outline-none transition-colors duration-200 focus-visible:text-white xl:px-4',
          isActive ? 'text-white' : 'text-white/55 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <motion.span
            style={animate ? { scale: iconScale, y: iconY } : undefined}
            className={cn('relative hidden transition-colors xl:block', isActive ? 'text-[#ff4d58]' : 'text-white/45 group-hover:text-white/90')}
          >
            <Icon name={item.icon} size={16} />
          </motion.span>
          <span className="relative whitespace-nowrap text-[12.5px] font-bold uppercase tracking-[0.11em]">{item.label}</span>

          {/* línea que sigue al mouse */}
          {hover && !isActive && (
            <motion.span
              layoutId="seccion-hover"
              transition={{ type: 'spring', stiffness: 520, damping: 40 }}
              className="absolute inset-x-3.5 bottom-[9px] h-px bg-white/45 xl:inset-x-4"
            />
          )}
          {/* sección actual: línea roja con brillo */}
          {isActive && (
            <motion.span
              layoutId="seccion-activa"
              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              className="absolute inset-x-3.5 bottom-[8px] h-[3px] rounded-full bg-[linear-gradient(90deg,#c41f2b,#ff4d58,#c41f2b)] shadow-[0_0_14px_2px_rgb(255_77_88/0.55)] xl:inset-x-4"
            />
          )}
        </>
      )}
    </NavLink>
  )
}

/**
 * Barra de secciones de la compu: textos en mayúscula con ícono, separados por líneas finas.
 * La sección actual lleva una línea roja con brillo abajo; al pasar el mouse una línea blanca la sigue
 * y el ícono más cercano se agranda.
 */
export function DockNav() {
  const mouseX = useMotionValue(Infinity)
  const animate = !reducedMotion()
  const [hover, setHover] = useState<string | null>(null)

  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <motion.ul
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => {
          mouseX.set(Infinity)
          setHover(null)
        }}
        className="relative flex items-center rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgb(255_255_255/0.045),rgb(255_255_255/0.015))] px-1.5"
      >
        {DOCK_ITEMS.map((item, i) => (
          <li key={item.to} onMouseEnter={() => setHover(item.to)} className="flex items-center">
            {i > 0 && <span aria-hidden="true" className="h-4 w-px bg-white/10" />}
            <DockItem item={item} mouseX={mouseX} animate={animate} hover={hover === item.to} />
          </li>
        ))}
      </motion.ul>
    </nav>
  )
}
