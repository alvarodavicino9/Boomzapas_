import { Link } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { waPlantilla } from '@/lib/whatsapp'

/** El viaje del pedido, de la confirmación a tu casa. */
const VIAJE: { icon: IconName; title: string; cuando: string; text: string }[] = [
  { icon: 'check', title: 'Pago confirmado', cuando: 'Día 0', text: 'Reservamos tu par y te avisamos por WhatsApp.' },
  { icon: 'box', title: 'Embalado y despachado', cuando: '24 a 48 hs hábiles', text: 'Sale por Correo Argentino y te pasamos el código de seguimiento.' },
  { icon: 'truck', title: 'En camino', cuando: 'Seguilo online', text: 'Con el código ves en qué parte del recorrido está.' },
  { icon: 'home', title: 'Entregado', cuando: '3 a 7 días', text: 'Según tu zona. Te acompañamos hasta que lo tengas.' },
]

const PREGUNTAS = [
  { q: '¿Cuánto cuesta el envío?', a: 'Nada. El envío es gratis a todo el país, compres uno o varios pares.' },
  { q: '¿A qué zonas envían?', a: 'A todas las provincias, por Correo Argentino.' },
  { q: '¿Qué datos necesitan para enviarlo?', a: 'Nombre y DNI de quien recibe, dirección completa con código postal y un WhatsApp de contacto.' },
  { q: '¿Puedo seguir mi pedido?', a: 'Sí. Te pasamos el código de seguimiento apenas lo despachamos.' },
  { q: '¿Puedo ver el par antes de que salga?', a: 'Sí. Pedinos fotos y te mandamos las del par que vas a recibir antes de despacharlo.' },
  { q: '¿Y si no hay nadie cuando llega?', a: 'El correo deja aviso y lo podés retirar en la sucursal. Si tenés dudas, escribinos y te ayudamos.' },
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
        subtitle="Te lo mandamos gratis a cualquier punto del país, con seguimiento. Y si estás en Córdoba, lo retirás sin costo en el showroom."
        lateral={
          <div className="on-bar relative overflow-hidden rounded-3xl p-6 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.6)] sm:p-8">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent/30 blur-3xl" />
            {/* recorrido: Córdoba → tu casa */}
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">Sale de</p>
                <p className="mt-1 text-[1.15rem] font-bold leading-6 text-white">Córdoba</p>
              </div>
              <div aria-hidden="true" className="relative mx-2 h-px flex-1 bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.45)_0_6px,transparent_6px_12px)]">
                <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-white shadow-[0_8px_20px_-6px_rgb(217_44_55/0.9)]">
                  <Icon name="truck" size={17} />
                </span>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">Llega a</p>
                <p className="mt-1 text-[1.15rem] font-bold leading-6 text-white">Tu casa</p>
              </div>
            </div>
            <div className="relative mt-6 grid grid-cols-3 gap-2">
              {[
                ['Gratis', 'Envío'],
                ['24-48 hs', 'Despacho'],
                ['3 a 7 días', 'Entrega'],
              ].map(([v, t]) => (
                <div key={t} className="rounded-2xl bg-white/[0.06] px-1.5 py-4 text-center ring-1 ring-inset ring-white/10 sm:px-3">
                  <p className="whitespace-nowrap font-display text-[clamp(0.85rem,3.6vw,1.35rem)] font-black leading-none text-white">{v}</p>
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">{t}</p>
                </div>
              ))}
            </div>
            <p className="relative mt-5 flex items-center gap-2 text-[13px] text-white/70">
              <Icon name="shield" size={16} className="text-[#4ade80]" />
              Por Correo Argentino, con código de seguimiento.
            </p>
          </div>
        }
        actions={
          <>
            <Button href={waPlantilla('envio')} size="lg">
              <Icon name="whatsapp" size={18} />
              Consultar mi envío
            </Button>
            <Button to="/catalogo" variant="outline" size="lg">
              Ver catálogo
            </Button>
          </>
        }
      />

      {/* el viaje del pedido */}
      <section className="page-x section-y" aria-labelledby="viaje">
        <p className="label mb-3 text-accent">Seguimiento</p>
        <h2 id="viaje" className="display-section mb-12">
          Así viaja tu pedido
        </h2>
        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-5">
          <span aria-hidden="true" className="absolute left-6 top-6 hidden h-[2px] w-[76%] bg-[linear-gradient(90deg,#1f9d55,#00a6e4,var(--bz-accent))] md:block" />
          <span aria-hidden="true" className="absolute bottom-6 left-6 top-6 w-[2px] bg-[linear-gradient(180deg,#1f9d55,#00a6e4,var(--bz-accent))] md:hidden" />
          {VIAJE.map((p, i) => (
            <li key={p.title} className="relative flex gap-5 md:block">
              <Reveal delay={i * 0.07}>
                <span
                  className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full text-white shadow-lg ring-4 ring-gallery"
                  style={{ background: ['#1f9d55', '#0b8bb8', '#3b6fd8', 'var(--bz-accent)'][i] }}
                >
                  <Icon name={p.icon} size={21} />
                </span>
              </Reveal>
              <Reveal delay={i * 0.07 + 0.05} className="min-w-0">
                <div className="md:mt-6">
                  <p className="inline-flex rounded-full bg-ink/[0.06] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-index ring-1 ring-inset ring-line">
                    {p.cuando}
                  </p>
                  <h3 className="mt-2.5 text-[1.2rem] font-bold leading-6">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-index">{p.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* las dos formas de recibirlo */}
      <section className="page-x pb-16" aria-label="Formas de recibir tu pedido">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0b5e8a,#0a3f63)] p-7 text-white sm:p-9">
              <span aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 size-52 rounded-full bg-[#00a6e4]/40 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
                  <Icon name="truck" size={22} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/65">A todo el país</p>
                  <h2 className="text-[1.5rem] font-bold leading-7">Envío gratis</h2>
                </div>
              </div>
              <ul className="relative mt-6 space-y-3 text-[14px] leading-5">
                {[
                  'Sin costo, compres uno o varios pares',
                  'Por Correo Argentino, con código de seguimiento',
                  'Necesitamos el DNI de quien recibe y la dirección con código postal',
                  'Si querés, te mandamos fotos del par antes de despacharlo',
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-[#7dd3fc]" />
                    <span className="text-white/90">{t}</span>
                  </li>
                ))}
              </ul>
              <Button href={waPlantilla('envio')} className="relative mt-7 !border-white !bg-white !text-black hover:!bg-black hover:!text-white">
                Consultar mi envío <Icon name="arrow" size={16} />
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="on-bar relative h-full overflow-hidden rounded-3xl p-7 sm:p-9">
              <span aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 size-52 rounded-full bg-accent/35 blur-3xl" />
              {/* trama de mapa de fondo */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgb(255_255_255)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255)_1px,transparent_1px)] [background-size:28px_28px]"
              />
              <div className="relative flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
                  <Icon name="pin" size={22} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">Sin costo · Córdoba</p>
                  <h2 className="text-[1.5rem] font-bold leading-7 text-white">Retiro en el showroom</h2>
                </div>
              </div>
              <p className="relative mt-6 text-[1.1rem] font-semibold text-white">{SITE.address}</p>
              <ul className="relative mt-4 space-y-2">
                {SITE.hours.map((h) => (
                  <li key={h.dias} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.06] px-4 py-2.5 text-[14px] ring-1 ring-inset ring-white/10">
                    <span className="text-white/70">{h.dias}</span>
                    <span className="font-semibold text-white">{h.horario}</span>
                  </li>
                ))}
              </ul>
              <p className="relative mt-4 text-[13px] leading-5 text-white/65">Te avisamos cuando tu pedido está listo y coordinamos el horario por WhatsApp.</p>
              <div className="relative mt-6 flex flex-wrap gap-3">
                <Button href={waPlantilla('retiro')} variant="accent">
                  Coordinar retiro
                </Button>
                <Button
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${SITE.address}, Argentina`)}`}
                  variant="outline"
                  className="!border-white/40 !text-white hover:!bg-white hover:!text-black"
                >
                  Cómo llegar
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-x section-y border-t border-line" aria-labelledby="faq-envios">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label mb-3 text-accent">Preguntas frecuentes</p>
            <h2 id="faq-envios" className="display-section">
              Sobre los envíos
            </h2>
          </div>
          <Button to="/como-comprar" variant="outline" size="sm">
            Cómo comprar
          </Button>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {PREGUNTAS.map((f) => (
            <details key={f.q} className="surface group p-5 open:ring-1 open:ring-accent/40 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span className="text-[15.5px] font-bold leading-6">{f.q}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/10 text-[color:var(--bz-accent-text)] transition-transform duration-200 group-open:rotate-45">
                  <Icon name="plus" size={16} />
                </span>
              </summary>
              <p className="body-text mt-3 text-[14px]">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-[14px] text-index">
          ¿Otra duda?{' '}
          <Link to="/contacto" className="link-u font-semibold text-ink">
            Escribinos
          </Link>
          .
        </p>
      </section>
    </>
  )
}
