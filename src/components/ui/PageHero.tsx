import type { ReactNode } from 'react'
import type { Foto } from '@/config/fotos'
import { srcsetWebp } from '@/lib/imagenes'
import { Icon, type IconName } from './Icon'

export interface DatoHero {
  icon: IconName
  title: string
  text: string
}

interface PageHeroProps {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  /** Foto a la derecha. Si no hay, se muestra el panel de datos (o nada). */
  foto?: Foto
  /** Panel de color con datos clave, en lugar de la foto. */
  datos?: DatoHero[]
  /** Contenido propio a la derecha (en lugar de foto o datos). */
  lateral?: ReactNode
  /** Botones debajo del subtítulo. */
  actions?: ReactNode
  /** Posición vertical del recorte de la foto. */
  position?: string
}

/** Encabezado de las páginas internas: texto a la izquierda y, a la derecha, una foto o un panel con los datos clave. */
export function PageHero({ eyebrow, title, subtitle, foto, datos, lateral, actions, position = '50% 55%' }: PageHeroProps) {
  return (
    <header className="page-x border-b border-line bg-card pb-12 pt-10 sm:pt-14 lg:pb-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="label mb-5 flex items-center gap-3 text-accent">
            <span aria-hidden="true" className="h-[2px] w-8 bg-accent" />
            {eyebrow}
          </p>
          <h1 className="display-hero !text-[clamp(2.4rem,5.6vw,4.6rem)] !leading-[0.92]">{title}</h1>
          {subtitle && <p className="body-text mt-6 max-w-lg text-[15px] leading-7">{subtitle}</p>}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </div>

        {foto ? (
          <div className="on-light relative overflow-hidden rounded-3xl shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55)] ring-1 ring-black/10">
            <img
              src={foto.src}
              srcSet={srcsetWebp(foto.src)}
              sizes="(min-width: 1024px) 40vw, 100vw"
              alt={foto.alt}
              decoding="async"
              className="aspect-[5/4] w-full object-cover sm:aspect-[16/11]"
              style={{ objectPosition: position }}
            />
          </div>
        ) : datos?.length ? (
          <div className="on-bar relative overflow-hidden rounded-3xl shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55)] ring-1 ring-black/10">
            <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-accent/40 blur-3xl" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-accent/20 blur-3xl" />
            <ul className="relative grid gap-px bg-white/10 sm:grid-cols-2">
            {datos.map((d) => (
              <li key={d.title} className="flex gap-4 bg-bar/85 p-5 sm:flex-col sm:gap-5 sm:p-7">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent shadow-[0_8px_20px_-8px_rgb(217_44_55/0.8)]">
                  <Icon name={d.icon} size={20} />
                </span>
                <span>
                  <span className="block text-[15.5px] font-semibold leading-5 text-white">{d.title}</span>
                  <span className="mt-1 block text-[13px] leading-5 text-white/70">{d.text}</span>
                </span>
              </li>
            ))}
            </ul>
          </div>
        ) : (
          (lateral ?? null)
        )}
      </div>
    </header>
  )
}
