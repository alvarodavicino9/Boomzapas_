import { useState } from 'react'
import { PageHero } from '@/components/ui/PageHero'
import { Icon, type IconName } from '@/components/ui/Icon'
import { PhotoStrip } from '@/components/sections/PhotoStrip'
import { FOTOS } from '@/config/fotos'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { waLink, waLinkGeneric } from '@/lib/whatsapp'

const CHANNELS: { icon: IconName; label: string; value: string; href: string; note?: string }[] = [
  { icon: 'whatsapp', label: 'WhatsApp', value: SITE.whatsappDisplay, href: waLinkGeneric(), note: 'Respuesta el mismo día' },
  { icon: 'instagram', label: 'Instagram', value: `@${SITE.instagram}`, href: SITE.instagramUrl, note: 'Novedades y pares nuevos' },
  { icon: 'mail', label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
  {
    icon: 'pin',
    label: 'Local',
    value: SITE.address,
    href: `https://maps.google.com/?q=${encodeURIComponent(SITE.address)}`,
    note: 'Lunes a viernes, 10 a 19 hs',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [touched, setTouched] = useState(false)
  const valid = form.nombre.trim() && form.mensaje.trim()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    const text = [
      `Hola Boom Zapas, soy ${form.nombre.trim()}.`,
      form.asunto.trim() && `Asunto: ${form.asunto.trim()}`,
      form.mensaje.trim(),
      form.email.trim() && `Mi email: ${form.email.trim()}`,
    ]
      .filter(Boolean)
      .join('\n\n')
    window.open(waLink(text), '_blank', 'noopener,noreferrer')
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <>
      <PageHero
        eyebrow="Escribinos"
        title={
          <>
            Hablemos de tus <span className="text-accent">zapatillas</span>
          </>
        }
        subtitle="Consultas, talles, stock o pedidos especiales. Te respondemos rápido, por el canal que prefieras."
        foto={FOTOS.nb740Detalle}
        position="50% 40%"
        actions={
          <Button href={waLinkGeneric()} size="lg">
            <Icon name="whatsapp" size={18} />
            Escribir por WhatsApp
          </Button>
        }
      />

      <section className="page-x grid gap-12 py-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="label mb-4 text-accent">Canales</p>
          <h2 className="display-section mb-8">Elegí cómo contactarnos</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHANNELS.map((c, i) => (
              <li key={c.label}>
                <Reveal delay={i * 0.05} className="h-full">
                  <a
                    href={c.href}
                    target={c.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="surface group flex h-full items-start gap-4 p-5 transition-transform hover:-translate-y-0.5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-on-accent">
                      <Icon name={c.icon} size={22} />
                    </span>
                    <span className="min-w-0">
                      <span className="label block text-index">{c.label}</span>
                      <span className="mt-1.5 block break-words text-[15px] font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">
                        {c.value}
                      </span>
                      {c.note && <span className="mt-1.5 block text-[12.5px] leading-4 text-index">{c.note}</span>}
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <div className="on-bar mt-4 rounded-2xl p-6">
              <p className="label flex items-center gap-2.5 text-accent">
                <Icon name="clock" size={16} />
                Horarios del local
              </p>
              <ul className="mt-4 space-y-2 text-[15px]">
                {SITE.hours.map((h) => (
                  <li key={h.dias} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0 last:pb-0">
                    <span>{h.dias}</span>
                    <span className="font-semibold">{h.horario}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] leading-5 text-index">
                Para retirar un pedido coordinamos el horario por WhatsApp. {SITE.address}.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <form onSubmit={submit} noValidate className="surface space-y-7 p-6 sm:p-9">
            <div>
              <p className="label text-accent">Formulario</p>
              <h2 className="display-section mt-3">Mandanos un mensaje</h2>
              <p className="body-text mt-3">Se abre WhatsApp con tu mensaje listo para enviar.</p>
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
              <label className="block">
                <span className="label block text-index">Nombre</span>
                <input className="field-line mt-2 normal-case" value={form.nombre} onChange={set('nombre')} autoComplete="name" aria-invalid={touched && !form.nombre.trim()} />
              </label>
              <label className="block">
                <span className="label block text-index">Email</span>
                <input className="field-line mt-2 normal-case" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </label>
            </div>
            <label className="block">
              <span className="label block text-index">Asunto</span>
              <input className="field-line mt-2 normal-case" value={form.asunto} onChange={set('asunto')} />
            </label>
            <label className="block">
              <span className="label block text-index">Mensaje</span>
              <textarea className="field-line mt-2 min-h-32" value={form.mensaje} onChange={set('mensaje')} aria-invalid={touched && !form.mensaje.trim()} />
            </label>
            {touched && !valid && (
              <p role="alert" className="label text-danger">
                Completá tu nombre y el mensaje.
              </p>
            )}
            <Button type="submit" size="lg" full>
              <Icon name="whatsapp" size={18} />
              Enviar por WhatsApp
            </Button>
          </form>
        </Reveal>
      </section>

      <section className="page-x pb-14" aria-label="Ubicación">
        <Reveal>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(SITE.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="on-bar group flex flex-wrap items-center justify-between gap-6 rounded-3xl px-6 py-8 sm:px-10"
          >
            <span className="flex items-center gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent">
                <Icon name="pin" size={28} />
              </span>
              <span>
                <span className="label block text-index">Nuestro local</span>
                <span className="display-product mt-1 block">{SITE.address}</span>
              </span>
            </span>
            <span className="label flex items-center gap-2 text-accent group-hover:underline group-hover:underline-offset-4">
              Ver en el mapa <Icon name="arrow" size={16} />
            </span>
          </a>
        </Reveal>
      </section>

      <PhotoStrip
        eyebrow="Fotos reales"
        title="Pasá a conocer los pares"
        fotos={[
          { foto: FOTOS.nb530Detalle, label: 'New Balance 530' },
          { foto: FOTOS.sambaDetalle, label: 'Adidas Samba' },
          { foto: FOTOS.dunkDetalle, label: 'Dunk low crema' },
          { foto: FOTOS.nb740Suela, label: 'New Balance 740' },
        ]}
      />
    </>
  )
}
