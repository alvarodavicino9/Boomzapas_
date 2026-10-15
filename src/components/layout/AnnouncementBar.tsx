import { SITE } from '@/config/site'
import { formatARS } from '@/lib/format'

const ITEMS = [
  'Envíos a todo el país por Correo Argentino',
  `${formatARS(SITE.transferDiscount)} menos por par pagando con transferencia o efectivo`,
  'Retiro sin costo en Córdoba',
  'Pagá con Mercado Pago',
]

/** Cinta de avisos arriba de todo. Se frena sola si la persona pidió menos movimiento. */
export function AnnouncementBar() {
  const track = (hidden: boolean) => (
    <ul className="ticker-track flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap text-[12px] font-semibold tracking-wide">
          <span className="px-6">{t}</span>
          <span aria-hidden="true" className="size-1 rounded-full bg-on-accent/60" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="flex h-9 items-center overflow-hidden bg-accent text-on-accent" role="region" aria-label="Avisos">
      <div className="ticker flex w-max">
        {track(false)}
        {track(true)}
      </div>
    </div>
  )
}
