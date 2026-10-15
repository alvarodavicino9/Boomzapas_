import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
}

/** Encabezado común de las páginas internas (Envíos, Pagos, Nosotros…). */
export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <header className="page-x border-b border-line bg-card pb-10 pt-10 text-center sm:pb-12 sm:pt-14">
      <p className="label mb-4 text-accent">{eyebrow}</p>
      <h1 className="display-section title-center !text-[clamp(1.75rem,4.4vw,2.75rem)]">{title}</h1>
      {subtitle && <p className="body-text mx-auto mt-6 max-w-xl text-[15px] leading-7">{subtitle}</p>}
    </header>
  )
}
