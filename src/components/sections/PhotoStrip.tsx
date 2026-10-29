import { Link } from 'react-router-dom'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { Foto } from '@/config/fotos'
import { srcsetWebp } from '@/lib/imagenes'

interface PhotoStripProps {
  eyebrow: string
  title: string
  text?: string
  fotos: { foto: Foto; label: string; to?: string }[]
  /** Botón a la derecha del título. */
  cta?: { label: string; to: string }
  /** Sin línea superior (para usarla justo debajo de otro bloque). */
  flush?: boolean
}

/** Tira de fotos reales del negocio, con zoom suave al pasar el mouse. */
export function PhotoStrip({ eyebrow, title, text, fotos, cta, flush }: PhotoStripProps) {
  return (
    <section className={`page-x section-y ${flush ? '' : 'border-t border-line'}`} aria-label={title}>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4 text-accent">{eyebrow}</p>
          <h2 className="display-section">{title}</h2>
        </div>
        {cta ? (
          <Button to={cta.to} variant="outline">
            {cta.label}
            <Icon name="arrow" size={16} />
          </Button>
        ) : (
          text && <p className="body-text max-w-sm">{text}</p>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {fotos.map(({ foto, label, to }, i) => {
          const fig = (
              <figure className="on-light group relative overflow-hidden rounded-2xl ring-1 ring-black/10">
                <img
                  src={foto.src}
                  srcSet={srcsetWebp(foto.src)}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  alt={foto.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3.5 pt-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                  {label}
                </figcaption>
              </figure>
          )
          return (
          <li key={foto.src}>
            <Reveal delay={i * 0.06}>{to ? <Link to={to} aria-label={`${label}: ver en el catálogo`} className="block">{fig}</Link> : fig}</Reveal>
          </li>
          )
        })}
      </ul>
    </section>
  )
}
