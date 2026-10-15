import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/Icon'
import { SITE } from '@/config/site'

const ITEMS: { icon: IconName; title: string; text: string; to: string }[] = [
  { icon: 'truck', title: 'Envíos a todo el país', text: 'Por Correo Argentino, con seguimiento.', to: '/envios' },
  { icon: 'store', title: 'Retiro en tienda', text: SITE.address, to: '/envios' },
  { icon: 'card', title: 'Medios de pago', text: 'Mercado Pago, transferencia y efectivo.', to: '/pagos' },
  { icon: 'chat', title: 'Atención por WhatsApp', text: 'Respondemos todos los días.', to: '/contacto' },
]

/** Cuatro datos de servicio en tarjetas oscuras. */
export function InfoStrip() {
  return (
    <section className="page-x pt-8" aria-label="Cómo comprar">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((i) => (
          <li key={i.title}>
            <Link to={i.to} className="on-bar flex h-full items-center gap-4 rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10">
                <Icon name={i.icon} size={22} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-bold uppercase leading-4 tracking-wide">{i.title}</span>
                <span className="mt-1 block text-[12px] leading-4 text-index">{i.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
