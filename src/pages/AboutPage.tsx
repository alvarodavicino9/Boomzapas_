import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { useProductos } from '@/context/ProductsContext'
import { srcsetWebp } from '@/lib/imagenes'
import { waLink } from '@/lib/whatsapp'

const BANNER = '/fotos/banners/envios.jpg'
const MAPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`
const MAYORISTA = waLink('¡Hola Boom Zapas! 👋 Quiero consultar por la venta mayorista.')
const VISITA = waLink('¡Hola Boom Zapas! 👋 Quiero pasar por el showroom.')

const stat = (label: string) => SITE.stats.find((s) => s.label === label)?.value ?? ''

/** Lo mismo que dice el banner, en texto: en el celular el banner se recorta y así se lee bien (y lo entiende Google). */
const DATOS: { icon: IconName; valor: string; texto: string; href?: string }[] = [
  { icon: 'bag', valor: stat('Ventas'), texto: 'Ventas' },
  { icon: 'users', valor: stat('Clientes'), texto: 'Clientes' },
  { icon: 'box', valor: 'Mayorista', texto: 'Escribinos por WhatsApp', href: MAYORISTA },
  { icon: 'truck', valor: 'Envío gratis', texto: 'A todo el país' },
]

const COMO: { icon: IconName; titulo: string; texto: string }[] = [
  { icon: 'image', titulo: 'Fotos reales de cada par', texto: 'Las sacamos en el showroom: lo que ves es exactamente lo que te llega.' },
  { icon: 'shield', titulo: 'Control de calidad', texto: 'Revisamos cada par y te mandamos fotos antes de despacharlo. Nada de sorpresas.' },
  { icon: 'whatsapp', titulo: 'Te acompañamos por WhatsApp', texto: 'Desde elegir el talle hasta que tenés las zapatillas en tu casa.' },
]

/**
 * Quiénes somos: el banner "No son solo zapatillas", la historia, cómo trabajamos y el showroom.
 * En el celular el banner muestra las cajas y los datos van abajo en tarjetas, para que se lean grandes.
 */
export default function AboutPage() {
  const { productos, status } = useProductos()

  return (
    <>
      <PageHeader eyebrow="Nuestra historia" title="Quiénes somos" />

      {/* ── No son solo zapatillas ── */}
      <section className="page-x pt-6 max-sm:!px-2.5 sm:pt-10" aria-labelledby="no-solo">
        <Reveal>
          <div className="mx-auto max-w-[1600px] overflow-hidden rounded-[20px] shadow-[0_30px_70px_-40px_rgb(0_0_0/0.9)] ring-1 ring-black/10 sm:rounded-[28px]">
            <img
              src={BANNER}
              srcSet={srcsetWebp(BANNER)}
              sizes="(min-width: 1700px) 1600px, (min-width: 1024px) 100vw, 200vw"
              alt="No son solo zapatillas: más de 500 ventas y 450 clientes, venta mayorista por WhatsApp y envíos gratis a todo el país."
              width={2000}
              height={750}
              decoding="async"
              className="block aspect-[4/3] w-full origin-bottom-right scale-[1.09] bg-[#e9e9e7] object-cover object-right sm:aspect-[16/9] lg:aspect-[2000/750] lg:scale-100 lg:object-center"
            />
            {/* celular y tablet: los datos del banner, en grande */}
            <div className="on-bar relative px-5 pb-5 pt-6 sm:px-8 sm:pb-8 lg:hidden">
              <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-accent/35 blur-3xl" />
              <p className="label relative text-white/60">Sneakers · Urban style · Quality</p>
              <h2 id="no-solo" className="display-section relative mt-2 !text-[clamp(1.9rem,8.6vw,2.6rem)] !leading-[0.95]">
                No son solo <span className="text-accent">zapatillas</span>
              </h2>
              <ul className="relative mt-5 grid grid-cols-2 gap-2.5">
                {DATOS.map((d) => {
                  const contenido = (
                    <>
                      <span className="grid size-10 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_20px_-8px_rgb(217_44_55/0.8)]">
                        <Icon name={d.icon} size={19} />
                      </span>
                      <span className="mt-3 block font-display text-[19px] font-extrabold leading-6 text-white">{d.valor}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-[18px] text-white/65">{d.texto}</span>
                    </>
                  )
                  return (
                    <li key={d.texto}>
                      {d.href ? (
                        <a href={d.href} target="_blank" rel="noopener noreferrer" className="block h-full rounded-2xl border border-white/12 bg-white/[0.06] p-4 transition-colors active:bg-white/10">
                          {contenido}
                        </a>
                      ) : (
                        <div className="h-full rounded-2xl border border-white/12 bg-white/[0.06] p-4">{contenido}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Historia y cómo trabajamos ── */}
      <section className="page-x grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20" aria-labelledby="historia">
        <Reveal>
          <p className="label flex items-center gap-3 text-accent">
            <span aria-hidden="true" className="h-[2px] w-8 bg-accent" />
            Desde {SITE.since} · Córdoba
          </p>
          <h2 id="historia" className="display-section mt-4 !text-[clamp(1.6rem,4vw,2.5rem)]">
            Una tienda de Córdoba, atendida por personas
          </h2>
          <div className="mt-6 space-y-4 text-[16px] leading-7 sm:text-[18px] sm:leading-8">
            <p>
              Boom Zapas nació en {SITE.since} como un emprendimiento 100% digital, con un showroom en Córdoba que podés visitar cuando
              quieras.
            </p>
            <p className="text-index">
              Elegimos cada modelo, controlamos la calidad de cada par y respondemos rápido: la idea es que comprar zapatillas por
              internet sea tan fácil y seguro como comprarlas en persona.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Button to="/catalogo" size="lg" className="max-sm:!px-4">
              Ver catálogo
            </Button>
            <Button href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="lg" className="max-sm:!px-4">
              <Icon name="instagram" size={17} />
              Instagram
            </Button>
          </div>
        </Reveal>

        <ol className="grid gap-3" aria-label="Cómo trabajamos">
          {COMO.map((c, i) => (
            <li key={c.titulo}>
              <Reveal delay={i * 0.06}>
                <div className="surface flex gap-4 border border-line p-5 sm:p-6">
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-stage text-accent">
                    <Icon name={c.icon} size={22} />
                    <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-accent font-display text-[10px] font-extrabold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <span>
                    <span className="block text-[15.5px] font-semibold leading-5">{c.titulo}</span>
                    <span className="body-text mt-1.5 block">{c.texto}</span>
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Showroom ── */}
      <section className="page-x pb-6" aria-labelledby="showroom">
        <Reveal>
          <div className="on-bar relative overflow-hidden rounded-3xl">
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative grid gap-8 px-5 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="label text-white/60">Showroom</p>
                <h2 id="showroom" className="display-section mt-2 !text-[clamp(1.4rem,3.4vw,2rem)]">
                  Vení a probártelas
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-8">
                  <li className="flex gap-3">
                    <Icon name="pin" size={20} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <span className="block font-semibold">{SITE.address}</span>
                      {status === 'ready' && productos.length > 0 && (
                        <span className="text-[13px] text-white/65">{productos.length} modelos para ver y probar</span>
                      )}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Icon name="clock" size={20} className="mt-0.5 shrink-0 text-accent" />
                    <span className="grid gap-1 text-[14px]">
                      {SITE.hours.map((h) => (
                        <span key={h.dias}>
                          <span className="text-white/65">{h.dias}: </span>
                          <span className="font-semibold">{h.horario}</span>
                        </span>
                      ))}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-col">
                <Button href={MAPA} target="_blank" rel="noopener noreferrer" variant="accent" size="lg">
                  <Icon name="pin" size={17} />
                  Cómo llegar
                </Button>
                <Button href={VISITA} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
                  <Icon name="whatsapp" size={17} />
                  Avisar visita
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
