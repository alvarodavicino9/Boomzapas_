import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'

interface SectionHeadProps {
  id: string
  eyebrow: string
  title: string
  /** Link a la derecha ("Ver todo →"). */
  action?: { label: string; to: string }
}

/** Encabezado de las secciones del inicio: chiquito arriba, título y un link a la derecha. */
export function SectionHead({ id, eyebrow, title, action }: SectionHeadProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        <p className="label mb-2 text-accent sm:mb-3">{eyebrow}</p>
        <h2 id={id} className="display-section !text-[clamp(1.3rem,3.2vw,2.1rem)]">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="label flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b border-transparent pb-0.5 text-ink hover:border-ink"
        >
          {action.label}
          <Icon name="arrow" size={14} />
        </Link>
      )}
    </div>
  )
}

/** Clases de una fila que en el celular se desliza con el dedo y en la compu es una grilla. */
export const rail = (cols: string) =>
  `-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 ${cols}`
