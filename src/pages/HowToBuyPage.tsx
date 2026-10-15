import { Link } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { PhotoStrip } from '@/components/sections/PhotoStrip'
import { ContactSection } from '@/components/sections/ContactSection'
import { FOTOS } from '@/config/fotos'
import { SITE } from '@/config/site'
import { formatARS } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'

const PASOS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'search', title: 'Elegí tu par', text: 'Entrá al catálogo, filtrá por marca, talle o precio y abrí el modelo que te guste.' },
  { icon: 'bag', title: 'Sumalo al pedido', text: 'Elegí el talle disponible y agregalo. Podés sumar todos los pares que quieras.' },
  { icon: 'card', title: 'Completá tus datos', text: 'Indicá si lo retirás o lo recibís en tu casa y elegí cómo querés pagar.' },
  { icon: 'whatsapp', title: 'Confirmamos por WhatsApp', text: 'Te escribimos para coordinar el pago y el envío o el retiro. Así de simple.' },
]

const VENTAJAS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'shield', title: 'Pares reales', text: 'Fotos reales de lo que vas a recibir.' },
  { icon: 'truck', title: 'Envío a todo el país', text: 'Correo Argentino, con seguimiento.' },
  { icon: 'store', title: 'Retiro sin costo', text: `En ${SITE.address}.` },
  { icon: 'chat', title: 'Atención personal', text: 'Te asesoramos con el talle por WhatsApp.' },
]

const FAQ = [
  {
    q: '¿Cuánto tarda el envío?',
    a: 'Despachamos dentro de las 24 a 48 hs hábiles posteriores al pago y llega en 3 a 7 días, por Correo Argentino, con código de seguimiento.',
  },
  {
    q: '¿Puedo retirar en Córdoba?',
    a: `Sí, sin costo. Estamos en ${SITE.address}. Coordinamos el horario por WhatsApp.`,
  },
  {
    q: '¿Qué medios de pago tienen?',
    a: `Mercado Pago, tarjetas, QR y transferencia. Pagando con transferencia o efectivo tenés ${formatARS(SITE.transferDiscount)} de descuento por par.`,
  },
  {
    q: '¿Cómo sé qué talle pedir?',
    a: 'Mirá la tabla de talles o escribinos por WhatsApp y te asesoramos según el modelo.',
  },
  {
    q: '¿Puedo ver fotos reales del par?',
    a: 'Sí. Pedinos fotos por WhatsApp y te mandamos las del par que vas a recibir.',
  },
]

export default function HowToBuyPage() {
  return (
    <>
      <PageHero
        eyebrow="Ayuda"
        title={
          <>
            Cómo <span className="text-accent">comprar</span>
          </>
        }
        subtitle="Cuatro pasos, sin vueltas. Y si preferís, podés comprar directo por WhatsApp."
        foto={FOTOS.dunk}
        position="50% 50%"
        actions={
          <>
            <Button to="/catalogo" size="lg">
              Ir al catálogo
              <Icon name="arrow" size={18} />
            </Button>
            <Button href={waLink('Hola Boom Zapas. Quiero comprar por WhatsApp.')} variant="outline" size="lg">
              <Icon name="whatsapp" size={18} />
              Comprar por WhatsApp
            </Button>
          </>
        }
      />

      <section className="page-x section-y" aria-labelledby="pasos">
        <p className="label mb-4 text-accent">Paso a paso</p>
        <h2 id="pasos" className="display-section mb-12">
          Comprar es fácil
        </h2>
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 0.07} className="h-full">
                <div className="surface relative h-full overflow-hidden p-6 pt-7">
                  <span aria-hidden="true" className="display-hero absolute -right-1 -top-3 select-none !text-[5.5rem] text-ink/[0.06]">
                    {i + 1}
                  </span>
                  <span className="grid size-12 place-items-center rounded-xl bg-accent text-on-accent">
                    <Icon name={p.icon} size={24} />
                  </span>
                  <h3 className="display-product mt-6 !text-[1.3rem]">{p.title}</h3>
                  <p className="body-text mt-3">{p.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-x pb-14" aria-label="Por qué comprar en Boom Zapas">
        <ul className="on-bar grid gap-px overflow-hidden rounded-3xl sm:grid-cols-2 lg:grid-cols-4">
          {VENTAJAS.map((v) => (
            <li key={v.title} className="flex items-start gap-4 p-6 sm:p-7">
              <Icon name={v.icon} size={26} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <p className="text-[15px] font-bold">{v.title}</p>
                <p className="mt-1 text-[13px] leading-5 text-index">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <PhotoStrip
        eyebrow="Fotos reales"
        title="Así son nuestros pares"
        text="Sacamos las fotos en el local, de cada modelo, para que sepas exactamente qué vas a recibir."
        fotos={[
          { foto: FOTOS.samba, label: 'Adidas Samba' },
          { foto: FOTOS.nb530Suela, label: 'New Balance 530' },
          { foto: FOTOS.dunkTalon, label: 'Dunk low crema' },
          { foto: FOTOS.nb740, label: 'New Balance 740' },
        ]}
      />

      <section className="page-x section-y border-t border-line" aria-labelledby="faq">
        <p className="label mb-4 text-accent">Preguntas frecuentes</p>
        <h2 id="faq" className="display-section mb-10">
          Antes de comprar
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {FAQ.map((f) => (
            <details key={f.q} className="surface group p-6 open:ring-1 open:ring-accent/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span className="display-product !text-[1.15rem]">{f.q}</span>
                <Icon name="plus" size={20} className="shrink-0 text-accent transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="body-text mt-4">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button to="/guia-de-talles" variant="outline" size="lg">
            Tabla de talles
          </Button>
        </div>
        <p className="body-text mt-8">
          Más datos en <Link to="/envios" className="link-u text-ink">Envíos y retiro</Link> y{' '}
          <Link to="/pagos" className="link-u text-ink">Medios de pago</Link>.
        </p>
      </section>

      <ContactSection title="¿Preferís que te ayudemos?" />
    </>
  )
}
