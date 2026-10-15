import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'truck', title: 'Envíos a todo el país', text: 'Por Correo Argentino, con código de seguimiento.' },
  { icon: 'store', title: 'Retiro en tienda', text: SITE.address },
  { icon: 'card', title: 'Múltiples pagos', text: 'Transferencia, tarjetas, QR y Mercado Pago.' },
  { icon: 'chat', title: 'Respuesta inmediata', text: 'WhatsApp 24 hs. Atención real, sin bots.' },
]

export function FeatureStrip() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <li key={f.title}>
            <Reveal delay={i * 0.07} className="h-full">
              <div className="card group h-full p-6 transition duration-300 hover:-translate-y-1 hover:border-sky/50">
                <span className="mb-4 grid size-12 place-items-center rounded-xl bg-electric/15 text-sky transition group-hover:bg-electric group-hover:text-white">
                  <Icon name={f.icon} size={24} />
                </span>
                <h3 className="mb-1.5 text-lg font-bold">{f.title}</h3>
                <p className="text-sm text-mute">{f.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
