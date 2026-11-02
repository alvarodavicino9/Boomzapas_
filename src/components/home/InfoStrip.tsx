import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/Icon'
import { SITE } from '@/config/site'

const ITEMS: { icon: IconName; title: string; text: string; to: string }[] = [
  { icon: 'truck', title: 'Envío gratis a todo el país', text: 'Por Correo Argentino, con seguimiento.', to: '/envios' },
  { icon: 'store', title: 'Retiro en tienda', text: SITE.address, to: '/envios' },
  { icon: 'card', title: 'Medios de pago', text: 'Mercado Pago, transferencia y efectivo.', to: '/pagos' },
  { icon: 'chat', title: 'Atención por WhatsApp', text: 'Respondemos todos los días.', to: '/contacto' },
]

/** Cuatro datos de servicio en tarjetas oscuras. */
export function InfoStrip() {
  return (
    <section className="page-x pt-6 sm:pt-8" aria-label="Cómo comprar">
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {ITEMS.map((i) => (
          <li key={i.title}>
            <Link to={i.to} className="on-bar flex h-full flex-col items-start gap-2.5 rounded-2xl p-3.5 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 sm:size-11">
                <Icon name={i.icon} size={22} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11.5px] font-bold uppercase leading-4 tracking-wide sm:text-[12px]">{i.title}</span>
                <span className="mt-1 block text-[11.5px] leading-4 text-index sm:text-[12px]">{i.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
