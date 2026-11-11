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

/** Qué tan lejos del mouse empieza a agrandarse una sección (px). */
const RANGE = 150

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
          'group relative block rounded-full font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/60',
          isActive ? 'text-white' : 'text-white/65 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <motion.span
          style={animate ? { height, paddingLeft: px, paddingRight: px, fontSize } : undefined}
          className="relative flex h-10 items-center gap-2 px-3.5 text-[13px]"
        >
          {/* pastilla suave que sigue al mouse */}
          {hover && !isActive && (
            <motion.span
              layoutId="seccion-hover"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              className="absolute inset-0 rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/10"
            />
          )}
          {/* sección actual: rojo con brillo */}
          {isActive && (
            <motion.span
              layoutId="seccion-activa"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#f0454f,#c41f2b)] shadow-[0_10px_26px_-8px_rgb(217_44_55/0.95),inset_0_1px_0_rgb(255_255_255/0.3)]"
            >
              <span aria-hidden="true" className="absolute inset-x-4 -bottom-[7px] mx-auto h-[3px] w-6 rounded-full bg-[#ff6b73] blur-[1px]" />
            </motion.span>
          )}
          <motion.span
            style={animate ? { scale: iconScale } : undefined}
            className={cn(
              'relative hidden size-7 place-items-center rounded-full transition-[background-color,transform] duration-300 xl:grid',
              isActive ? 'bg-white/20' : 'bg-white/[0.06] group-hover:-rotate-6 group-hover:bg-white/[0.12]',
            )}
          >
            <Icon name={item.icon} size={15} />
          </motion.span>
          <span className="relative whitespace-nowrap">{item.label}</span>
        </motion.span>
      )}
    </NavLink>
  )
}

/**
 * Barra de secciones de la compu: píldora oscura con borde de brillo rojo, ícono y nombre de cada sección.
 * Al pasar el mouse la sección más cercana se agranda y una pastilla suave la sigue; la actual va en rojo.
 */
export function DockNav() {
  const mouseX = useMotionValue(Infinity)
  const animate = !reducedMotion()
  const [hover, setHover] = useState<string | null>(null)

  return (
    <nav aria-label="Principal" className="hidden lg:block">
      {/* borde con brillo rojo en los costados */}
      <div className="dock-borde relative rounded-full p-px shadow-[0_14px_40px_-20px_rgb(0_0_0/0.9)]">
        <motion.ul
          onMouseMove={(e) => mouseX.set(e.clientX)}
          onMouseLeave={() => {
            mouseX.set(Infinity)
            setHover(null)
          }}
          className="relative flex h-[62px] items-center gap-0.5 overflow-hidden rounded-full bg-[linear-gradient(180deg,rgb(38_22_24/0.92),rgb(20_11_12/0.94))] px-1.5"
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          {DOCK_ITEMS.map((item) => (
            <li key={item.to} onMouseEnter={() => setHover(item.to)}>
              <DockItem item={item} mouseX={mouseX} animate={animate} hover={hover === item.to} />
            </li>
          ))}
        </motion.ul>
      </div>
    </nav>
  )
}
