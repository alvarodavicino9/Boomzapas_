import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { SITE } from '@/config/site'

const PUNTOS: { icon: IconName; text: string }[] = [
  { icon: 'truck', text: 'Envíos a todo el país' },
  { icon: 'store', text: 'Retiro en Córdoba' },
  { icon: 'card', text: 'Pagá como quieras' },
]

/** Sello de la marca: el logo grande sobre granate y una presentación corta del local. */
export function BrandStory() {
  return (
    <section className="page-x pb-2 pt-6" aria-labelledby="marca">
      <Reveal>
        <div className="on-bar relative overflow-hidden rounded-3xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 size-[480px] rounded-full bg-[radial-gradient(circle,rgb(var(--bz-glow)/0.55),transparent_68%)]"
          />
          <div className="relative grid items-center gap-10 px-6 py-12 sm:px-12 lg:grid-cols-[auto_1fr] lg:gap-16 lg:py-14">
            <img
              src="/logo.png"
              alt="Boom Zapas Shoes Shop, since 2024"
              width={260}
              height={260}
              loading="lazy"
              decoding="async"
              className="mx-auto size-[200px] rounded-full shadow-[0_30px_70px_-20px_rgb(0_0_0/0.9)] ring-2 ring-[#d92c37]/45 ring-offset-4 ring-offset-[#130b0c] sm:size-[260px]"
            />
            <div>
              <p className="label text-accent">Desde {SITE.since} · Córdoba</p>
              <h2 id="marca" className="display-section mt-4 !text-[clamp(1.7rem,3.8vw,2.8rem)]">
                Zapatillas con onda, <br className="hidden sm:block" />
                atendidas por personas
              </h2>
              <p className="body-text mt-5 max-w-xl text-[15px] leading-7">
                Boom Zapas nació en Córdoba. Fotografiamos cada par en el local para que veas exactamente lo que vas a recibir, y te acompañamos por WhatsApp desde la elección del talle hasta que llega a tu casa.
              </p>
              <ul className="mt-7 flex flex-wrap gap-3">
                {PUNTOS.map((p) => (
                  <li key={p.text} className="flex items-center gap-2.5 rounded-full border border-line px-4 py-2.5 text-[13px] font-medium">
                    <Icon name={p.icon} size={18} className="text-accent" />
                    {p.text}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/nosotros" size="lg">
                  Conocé la tienda
                </Button>
                <Button to="/contacto" variant="outline" size="lg">
                  Contacto
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
