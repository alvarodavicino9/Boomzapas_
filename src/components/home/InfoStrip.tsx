import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/Icon'

const ITEMS: { icon: IconName; text: string; to: string }[] = [
  { icon: 'truck', text: 'Envío gratis a todo el país', to: '/envios' },
  { icon: 'store', text: 'Retiro en Córdoba', to: '/envios' },
  { icon: 'card', text: 'Mercado Pago, transferencia o efectivo', to: '/pagos' },
  { icon: 'whatsapp', text: 'Te asesoramos por WhatsApp', to: '/contacto' },
]

/**
 * Beneficios en una sola línea, sin tarjetas: en la compu quedan fijos y centrados,
 * en el celular se deslizan solos (si la persona no pidió menos movimiento).
 */
export function InfoStrip() {
  const fila = (oculta?: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={oculta || undefined}>
      {ITEMS.map((i) => (
        <li key={i.text} className="flex items-center">
          <Link
            to={i.to}
            tabIndex={oculta ? -1 : undefined}
            className="flex items-center gap-2 whitespace-nowrap px-4 text-[12.5px] font-medium text-index transition-colors hover:text-ink sm:px-5 sm:text-[13px]"
          >
            <Icon name={i.icon} size={16} className="text-[color:var(--bz-accent-text)]" />
            {i.text}
          </Link>
          <span aria-hidden="true" className="size-1 rounded-full bg-control" />
        </li>
      ))}
    </ul>
  )

  return (
    <section className="pt-5 sm:pt-7" aria-label="Beneficios">
      {/* celular: cinta que se desliza */}
      <div className="overflow-hidden border-y border-line py-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] lg:hidden">
        <div className="bz-marquee flex w-max">
          {fila()}
          {fila(true)}
        </div>
      </div>
      {/* compu: fija */}
      <div className="page-x hidden lg:block">
        <div className="mx-auto flex max-w-[1600px] justify-center border-y border-line py-3.5 [&_li:last-child>span]:hidden">{fila()}</div>
      </div>
    </section>
  )
}
