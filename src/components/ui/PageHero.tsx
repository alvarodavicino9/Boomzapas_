import type { ReactNode } from 'react'
import type { Foto } from '@/config/fotos'

interface PageHeroProps {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  foto: Foto
  /** Botones debajo del subtítulo. */
  actions?: ReactNode
  /** Posición vertical del recorte de la foto. */
  position?: string
}

/** Encabezado de las páginas internas: texto a la izquierda y foto real del negocio a la derecha. */
export function PageHero({ eyebrow, title, subtitle, foto, actions, position = '50% 55%' }: PageHeroProps) {
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

        <div className="on-light relative overflow-hidden rounded-3xl shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55)] ring-1 ring-black/10">
          <img
            src={foto.src}
            alt={foto.alt}
            decoding="async"
            className="aspect-[5/4] w-full object-cover sm:aspect-[16/11]"
            style={{ objectPosition: position }}
          />
        </div>
      </div>
    </header>
  )
}
