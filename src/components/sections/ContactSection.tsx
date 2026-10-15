import { Icon, type IconName } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { waLinkGeneric } from '@/lib/whatsapp'

interface Canal {
  icon: IconName
  label: string
  value: string
  href: string
}

const CANALES: Canal[] = [
  { icon: 'whatsapp', label: 'WhatsApp', value: SITE.whatsappDisplay, href: waLinkGeneric() },
  { icon: 'instagram', label: 'Instagram', value: `@${SITE.instagram}`, href: SITE.instagramUrl },
  {
    icon: 'pin',
    label: 'Local',
    value: SITE.address,
    href: `https://maps.google.com/?q=${encodeURIComponent(SITE.address)}`,
  },
  { icon: 'mail', label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
]

/** Bloque de contacto reutilizable (pie de las páginas de ayuda): canales, horarios y botón a WhatsApp. */
export function ContactSection({ title = '¿Te quedó alguna duda?' }: { title?: string }) {
  return (
    <section className="page-x pb-16 pt-4" aria-labelledby="contacto-bloque">
      <Reveal>
        <div className="on-bar overflow-hidden rounded-3xl px-6 py-12 sm:px-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <p className="label text-accent">Contacto</p>
              <h2 id="contacto-bloque" className="display-section mt-4 !text-[clamp(1.6rem,3.6vw,2.5rem)]">
                {title}
              </h2>
              <p className="body-text mt-4 max-w-sm">
                Escribinos y te respondemos. Te asesoramos con talles, stock y formas de pago.
              </p>
              <ul className="mt-6 space-y-1.5 text-[14px]">
                {SITE.hours.map((h) => (
                  <li key={h.dias} className="flex items-center gap-2.5">
                    <Icon name="clock" size={16} className="text-accent" />
                    <span>
                      {h.dias}: <span className="text-index">{h.horario}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={waLinkGeneric()} size="lg">
                  <Icon name="whatsapp" size={18} />
                  Escribir por WhatsApp
                </Button>
                <Button to="/contacto" variant="outline" size="lg">
                  Más formas de contacto
                </Button>
              </div>
            </div>

            <ul className="grid content-start gap-3 sm:grid-cols-2">
              {CANALES.map((c) => (
                <li key={c.label} className={c.icon === 'mail' ? 'sm:col-span-2' : undefined}>
                  <a
                    href={c.href}
                    target={c.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="group flex h-full items-start gap-4 rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-on-accent">
                      <Icon name={c.icon} size={22} />
                    </span>
                    <span className="min-w-0">
                      <span className="label block text-index">{c.label}</span>
                      <span className="mt-1.5 block break-words text-[15px] font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">
                        {c.value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
