import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/ui/Icon'
import { ORDENES, type Orden } from '@/lib/filters'
import { cn } from '@/lib/format'

const ICONO: Record<Orden, { icon: IconName; rot?: string }> = {
  novedad: { icon: 'sparkle' },
  menor: { icon: 'arrow', rot: 'rotate-90' },
  mayor: { icon: 'arrow', rot: '-rotate-90' },
  nombre: { icon: 'sort' },
  'nombre-desc': { icon: 'sort', rot: 'rotate-180' },
}

interface Props {
  value: Orden
  onChange: (o: Orden) => void
  className?: string
  /** En la barra del celular: el botón ocupa todo el ancho disponible. */
  ancho?: boolean
}

/** Menú para ordenar el catálogo, con el estilo de la tienda (en vez del desplegable del navegador). */
export function OrdenMenu({ value, onChange, className, ancho }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const raiz = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const listaId = useId()
  const actual = ORDENES.find((o) => o.id === value) ?? ORDENES[0]

  useEffect(() => {
    if (!abierto) return
    setActivo(Math.max(0, ORDENES.findIndex((o) => o.id === value)))
    const fuera = (e: MouseEvent) => !raiz.current?.contains(e.target as Node) && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abierto, value])

  const elegir = (o: Orden) => {
    onChange(o)
    setAbierto(false)
    boton.current?.focus()
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (!abierto && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setAbierto(true)
      return
    }
    if (!abierto) return
    if (e.key === 'ArrowDown') (e.preventDefault(), setActivo((i) => (i + 1) % ORDENES.length))
    else if (e.key === 'ArrowUp') (e.preventDefault(), setActivo((i) => (i - 1 + ORDENES.length) % ORDENES.length))
    else if (e.key === 'Enter' || e.key === ' ') (e.preventDefault(), elegir(ORDENES[activo].id))
    else if (e.key === 'Escape' || e.key === 'Tab') setAbierto(false)
  }

  return (
    <div ref={raiz} className={cn('relative', ancho && 'flex-1', className)}>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((a) => !a)}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={listaId}
        aria-label={`Ordenar por: ${actual.label}`}
        className={cn(
          'flex h-11 items-center gap-2.5 rounded-full border bg-card pl-3 pr-3.5 text-[13px] font-semibold transition-colors',
          ancho && 'w-full',
          abierto ? 'border-accent' : 'border-line hover:border-control',
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/10 text-[color:var(--bz-accent-text)]">
          <Icon name="sort" size={14} />
        </span>
        <span className="min-w-0 flex-1 truncate text-left">
          <span className="text-index max-sm:hidden">Ordenar: </span>
          {actual.label}
        </span>
        <Icon name="chevron" size={15} className={cn('shrink-0 text-index transition-transform duration-200', abierto && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.ul
            id={listaId}
            role="listbox"
            aria-label="Ordenar por"
            aria-activedescendant={`${listaId}-${activo}`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-[240px] origin-top-right overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.55)]"
          >
            {ORDENES.map((o, i) => {
              const sel = o.id === value
              const ic = ICONO[o.id]
              return (
                <li
                  key={o.id}
                  id={`${listaId}-${i}`}
                  role="option"
                  aria-selected={sel}
                  onMouseEnter={() => setActivo(i)}
                  onClick={() => elegir(o.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors',
                    sel ? 'bg-accent/10 font-semibold text-[color:var(--bz-accent-text)]' : activo === i ? 'bg-stage' : '',
                  )}
                >
                  <Icon name={ic.icon} size={15} className={cn('shrink-0', ic.rot, !sel && 'text-index')} />
                  <span className="flex-1">{o.label}</span>
                  {sel && <Icon name="check" size={15} />}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
