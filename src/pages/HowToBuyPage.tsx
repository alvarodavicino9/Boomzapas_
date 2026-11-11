import { Link } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { formatARS, PROMO } from '@/lib/format'
import { waPlantilla } from '@/lib/whatsapp'

/** Los pasos, cada uno con un dato útil que no está en otro lado. */
const PASOS: { icon: IconName; title: string; text: string; tip: string }[] = [
  {
    icon: 'search',
    title: 'Elegí tu par',
    text: 'Entrá al catálogo y filtrá por marca, talle o precio. Cada modelo tiene fotos reales.',
    tip: 'Filtrá por tu talle y ves solo lo que hay.',
  },
  {
    icon: 'bag',
    title: 'Sumalo al pedido',
    text: 'Elegí el talle y agregalo. Podés sumar todos los pares que quieras.',
    tip: `Con ${PROMO.minimo} pares o más, ${formatARS(PROMO.descuento)} off en cada uno.`,
  },
  {
    icon: 'users',
    title: 'Completá tus datos',
    text: 'Envío o retiro, tu dirección y cómo querés pagar.',
    tip: 'Para el envío, tené a mano el DNI de quien recibe.',
  },
  {
    icon: 'whatsapp',
    title: 'Confirmamos y sale',
    text: 'Te llega el pedido por WhatsApp, coordinamos el pago y lo despachamos.',
    tip: 'Te pasamos el código de seguimiento del correo.',
  },
]

const DATOS: { valor: string; texto: string; color: string }[] = [
  { valor: 'Gratis', texto: 'Envío a todo el país', color: '#1f9d55' },
  { valor: '24-48 hs', texto: 'Para despachar', color: '#f2a516' },
  { valor: '3 a 7 días', texto: 'Hasta tu casa', color: '#00a6e4' },
  { valor: '35 al 44', texto: 'Talles de todos los modelos', color: '#ff4d58' },
]

const FAQ = [
  {
    q: '¿Cuánto tarda el envío?',
    a: 'Despachamos dentro de las 24 a 48 hs hábiles después del pago y llega en 3 a 7 días por Correo Argentino, con código de seguimiento.',
  },
  {
    q: '¿Puedo retirar en Córdoba?',
    a: `Sí, sin costo, en nuestro showroom de ${SITE.address}. Coordinamos el horario por WhatsApp.`,
  },
  {
    q: '¿Cómo sé qué talle pedir?',
    a: 'Mirá la tabla de talles o escribinos por WhatsApp con el talle que usás y te asesoramos según el modelo.',
  },
  {
    q: '¿Puedo ver fotos reales del par?',
    a: 'Sí. Todas las fotos son nuestras, y si querés te mandamos más del par que vas a recibir.',
  },
  {
    q: '¿Cómo funciona la promo de 2 pares?',
    a: `Llevando ${PROMO.minimo} pares o más tenés ${formatARS(PROMO.descuento)} de descuento en cada par, con cualquier medio de pago. Se aplica sola en el carrito.`,
  },
  {
    q: '¿Qué pasa si el par no tiene mi talle?',
    a: 'Escribinos por WhatsApp: te avisamos cuándo entra o te recomendamos un modelo parecido.',
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
        subtitle="En la web o por WhatsApp, como te quede más cómodo. Acá tenés todo lo que necesitás saber antes de pedir."
        lateral={
          <ul className="grid grid-cols-2 gap-3">
            {DATOS.map((d) => (
              <li key={d.texto} className="on-bar relative overflow-hidden rounded-2xl p-5 sm:p-6">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: d.color }} />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-25 blur-2xl"
                  style={{ background: d.color }}
                />
                <p className="relative font-display text-[clamp(1.15rem,3vw,2rem)] font-black leading-none text-white whitespace-nowrap">{d.valor}</p>
                <p className="relative mt-2 text-[13px] leading-4 text-white/70">{d.texto}</p>
              </li>
            ))}
          </ul>
        }
        actions={
          <>
            <Button to="/catalogo" size="lg">
              Ir al catálogo
              <Icon name="arrow" size={18} />
            </Button>
            <Button href={waPlantilla('comprar')} variant="outline" size="lg">
              <Icon name="whatsapp" size={18} />
              Comprar por WhatsApp
            </Button>
          </>
        }
      />

      {/* pasos en línea de tiempo */}
      <section className="page-x section-y" aria-labelledby="pasos">
        <p className="label mb-3 text-accent">En la web</p>
        <h2 id="pasos" className="display-section mb-12">
          Cuatro pasos
        </h2>
        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-5">
          {/* línea que une los pasos */}
          <span aria-hidden="true" className="absolute left-6 top-6 hidden h-[2px] w-[76%] bg-[linear-gradient(90deg,var(--bz-accent),rgb(217_44_55/0.15))] md:block" />
          <span aria-hidden="true" className="absolute bottom-6 left-6 top-6 w-[2px] bg-[linear-gradient(180deg,var(--bz-accent),rgb(217_44_55/0.15))] md:hidden" />
          {PASOS.map((p, i) => (
            <li key={p.title} className="relative flex gap-5 md:block">
              <Reveal delay={i * 0.07}>
                <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-[0_10px_24px_-8px_rgb(217_44_55/0.8)] ring-4 ring-gallery">
                  <Icon name={p.icon} size={21} />
                </span>
              </Reveal>
              <Reveal delay={i * 0.07 + 0.05} className="min-w-0">
                <div className="md:mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--bz-accent-text)]">Paso {i + 1}</p>
                  <h3 className="mt-1.5 text-[1.2rem] font-bold leading-6">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-index">{p.text}</p>
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-accent/[0.08] px-3 py-2.5 text-[12.5px] font-medium leading-5 ring-1 ring-inset ring-accent/20">
                    <Icon name="sparkle" size={14} className="mt-0.5 shrink-0 text-[color:var(--bz-accent-text)]" />
                    {p.tip}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* las dos formas de comprar */}
      <section className="page-x pb-14" aria-label="Formas de comprar">
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="marcas-banda relative h-full overflow-hidden rounded-3xl p-7 sm:p-9">
              <Icon name="bag" size={26} />
              <h3 className="mt-5 text-[1.5rem] font-bold leading-7">Comprá en la web</h3>
              <p className="mt-2 text-[14px] leading-6 text-white/85">
                Armá el pedido con los talles que hay, ves el total con la promo aplicada y te llega todo ordenado por WhatsApp.
              </p>
              <Button to="/catalogo" className="mt-6 !border-white !bg-white !text-black hover:!bg-black hover:!text-white">
                Ver catálogo <Icon name="arrow" size={16} />
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="relative h-full overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#128c7e,#0b5e55)] p-7 text-white sm:p-9">
              <Icon name="whatsapp" size={26} />
              <h3 className="mt-5 text-[1.5rem] font-bold leading-7">Comprá por WhatsApp</h3>
              <p className="mt-2 text-[14px] leading-6 text-white/85">
                ¿Dudas con el talle o buscás algo puntual? Escribinos y armamos el pedido con vos.
              </p>
              <Button href={waPlantilla('comprar')} className="mt-6 !border-white !bg-white !text-black hover:!bg-black hover:!text-white">
                Escribir ahora <Icon name="arrow" size={16} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-x section-y border-t border-line" aria-labelledby="faq">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label mb-3 text-accent">Preguntas frecuentes</p>
            <h2 id="faq" className="display-section">
              Antes de comprar
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button to="/guia-de-talles" variant="outline" size="sm">
              Tabla de talles
            </Button>
            <Button to="/envios" variant="outline" size="sm">
              Envíos y retiro
            </Button>
            <Button to="/pagos" variant="outline" size="sm">
              Medios de pago
            </Button>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {FAQ.map((f) => (
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
          ¿No encontrás tu respuesta?{' '}
          <Link to="/contacto" className="link-u font-semibold text-ink">
            Escribinos
          </Link>
          .
        </p>
      </section>
    </>
  )
}
