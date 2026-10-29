import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { PhotoStrip } from '@/components/sections/PhotoStrip'
import { ContactSection } from '@/components/sections/ContactSection'
import { FOTOS } from '@/config/fotos'
import { SITE } from '@/config/site'
import { waLink } from '@/lib/whatsapp'
import { srcsetWebp } from '@/lib/imagenes'

const DATOS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'truck', title: 'Todo el país', text: 'Por Correo Argentino' },
  { icon: 'clock', title: '3 a 7 días', text: 'De entrega estimada' },
  { icon: 'box', title: '24 a 48 hs', text: 'Hábiles para despachar' },
  { icon: 'shield', title: 'Con seguimiento', text: 'Código para seguir tu pedido' },
]

const PASOS = [
  { title: 'Confirmamos tu pago', text: 'Cuando recibimos el pago, reservamos tu par y te avisamos por WhatsApp.' },
  { title: 'Lo embalamos con cuidado', text: 'Cada par sale bien protegido. Si querés, te mandamos fotos antes del despacho.' },
  { title: 'Despachamos por Correo Argentino', text: 'Dentro de las 24 a 48 hs hábiles te pasamos el código de seguimiento.' },
  { title: 'Lo recibís en tu casa', text: 'Llega en 3 a 7 días, según tu zona. Te acompañamos hasta que lo tengas en la mano.' },
]

const PREGUNTAS = [
  { q: '¿A qué zonas envían?', a: 'A todo el país, por Correo Argentino.' },
  { q: '¿Puedo seguir mi pedido?', a: 'Sí. Te pasamos el código de seguimiento apenas despachamos.' },
  { q: '¿Y si estoy en Córdoba?', a: `Podés retirar sin costo en ${SITE.address}. Coordinamos el horario por WhatsApp.` },
  { q: '¿Puedo ver el par antes de que salga?', a: 'Sí. Pedinos fotos reales y te mandamos las del par que vas a recibir.' },
]

export default function ShippingPage() {
  return (
    <>
      <PageHero
        eyebrow="Logística"
        title={
          <>
            Envíos y <span className="text-accent">retiro</span>
          </>
        }
        subtitle="Llegamos a todo el país por Correo Argentino, con seguimiento. Y si estás en Córdoba, podés pasar a retirar sin costo."
        foto={FOTOS.sambaLateral}
        position="50% 60%"
        actions={
          <>
            <Button href={waLink('Hola Boom Zapas. Quiero consultar por un envío.')} size="lg">
              <Icon name="whatsapp" size={18} />
              Consultar mi envío
            </Button>
            <Button to="/catalogo" variant="outline" size="lg">
              Ver catálogo
            </Button>
          </>
        }
      />

      {/* datos rápidos */}
      <section className="page-x py-10" aria-label="Datos de envío">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DATOS.map((d, i) => (
            <li key={d.title}>
              <Reveal delay={i * 0.05} className="h-full">
                <div className="on-bar flex h-full items-center gap-4 rounded-2xl p-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-on-accent">
                    <Icon name={d.icon} size={24} />
                  </span>
                  <span>
                    <span className="block text-[18px] font-bold leading-6">{d.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-4 text-index">{d.text}</span>
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* recorrido del pedido */}
      <section className="page-x section-y border-t border-line" aria-labelledby="recorrido">
        <p className="label mb-4 text-accent">Paso a paso</p>
        <h2 id="recorrido" className="display-section mb-12">
          Así viaja tu pedido
        </h2>
        <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 0.07} className="h-full">
                <div className="surface relative h-full p-6 pt-8">
                  <span className="absolute -top-5 left-6 grid size-10 place-items-center rounded-full bg-accent text-[15px] font-bold text-on-accent shadow-lg">
                    {i + 1}
                  </span>
                  <h3 className="display-product !text-[1.25rem]">{p.title}</h3>
                  <p className="body-text mt-3">{p.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* retiro en tienda */}
      <section className="page-x pb-16" aria-labelledby="retiro">
        <Reveal>
          <div className="surface grid overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
            <div className="on-light relative min-h-[320px]">
              <img
                src={FOTOS.nb740Suela.src}
                srcSet={srcsetWebp(FOTOS.nb740Suela.src)}
                sizes="(min-width: 1024px) 40vw, 100vw"
                alt={FOTOS.nb740Suela.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover object-[50%_60%]"
              />
            </div>
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="label text-accent">Sin costo</p>
              <h2 id="retiro" className="display-section mt-3">
                Retiro en tienda
              </h2>
              <p className="body-text mt-4 max-w-md">
                Pasá a buscar tu pedido por nuestro local en Córdoba. Te avisamos cuando esté listo y coordinamos el horario por WhatsApp.
              </p>
              <address className="mt-8 grid gap-5 border-t border-line pt-6 not-italic sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Icon name="pin" size={20} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="label text-index">Dirección</p>
                    <p className="mt-1 text-[15px] font-semibold">{SITE.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="clock" size={20} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="label text-index">Horarios</p>
                    {SITE.hours.map((h) => (
                      <p key={h.dias} className="mt-1 text-[14px]">
                        {h.dias}: <span className="font-semibold">{h.horario}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </address>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={waLink('Hola Boom Zapas. Quiero coordinar el retiro de mi pedido.')} size="lg">
                  Coordinar retiro
                </Button>
                <Button href={`https://maps.google.com/?q=${encodeURIComponent(SITE.address)}`} variant="outline" size="lg">
                  Cómo llegar
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <PhotoStrip
        eyebrow="Fotos reales"
        title="Lo que vas a recibir"
        text="Fotografiamos cada par en el local. Lo que ves es lo que te llega."
        fotos={[
          { foto: FOTOS.nb530, label: 'New Balance 530' },
          { foto: FOTOS.samba, label: 'Adidas Samba' },
          { foto: FOTOS.dunk, label: 'Dunk low crema' },
          { foto: FOTOS.nb740, label: 'New Balance 740' },
        ]}
      />

      <section className="page-x section-y border-t border-line" aria-labelledby="faq-envios">
        <p className="label mb-4 text-accent">Preguntas frecuentes</p>
        <h2 id="faq-envios" className="display-section mb-10">
          Sobre los envíos
        </h2>
        <dl className="grid gap-4 md:grid-cols-2">
          {PREGUNTAS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <div className="surface h-full p-6">
                <dt className="display-product !text-[1.2rem]">{f.q}</dt>
                <dd className="body-text mt-3">{f.a}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      <ContactSection title="¿Dudas con tu envío?" />
    </>
  )
}
