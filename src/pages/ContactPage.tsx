import { useEffect, useState } from 'react'
import { PageHero } from '@/components/ui/PageHero'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { cn } from '@/lib/format'
import { waConsulta, waLinkGeneric } from '@/lib/whatsapp'

/** Cada canal con su color y para qué conviene usarlo. */
const CANALES: { icon: IconName; label: string; value: string; href: string; para: string; fondo: string }[] = [
  {
    icon: 'whatsapp',
    label: 'WhatsApp',
    value: SITE.whatsappDisplay,
    href: waLinkGeneric(),
    para: 'Pedidos, talles, stock y pagos. Te respondemos el mismo día.',
    fondo: 'linear-gradient(135deg,#25d366,#128c7e)',
  },
  {
    icon: 'instagram',
    label: 'Instagram',
    value: `@${SITE.instagram}`,
    href: SITE.instagramUrl,
    para: 'Nuevos ingresos, fotos de los pares y novedades.',
    fondo: 'linear-gradient(135deg,#f9a03f,#e1306c 50%,#833ab4)',
  },
  {
    icon: 'mail',
    label: 'Email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    para: 'Consultas que no son urgentes o propuestas comerciales.',
    fondo: 'linear-gradient(135deg,#5b6472,#2d333d)',
  },
]

const ASUNTOS = ['Talle', 'Stock de un modelo', 'Mi pedido', 'Envío', 'Pagos', 'Otro']

const MAPA = `https://maps.google.com/?q=${encodeURIComponent(`${SITE.address}, Argentina`)}`

/** Si el showroom está abierto ahora (hora de Córdoba): lunes a viernes 10 a 19 y sábados 10 a 14. */
function useAbierto() {
  const calcular = () => {
    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Cordoba' }))
    const d = ahora.getDay()
    const h = ahora.getHours() + ahora.getMinutes() / 60
    if (d >= 1 && d <= 5) return h >= 10 && h < 19
    if (d === 6) return h >= 10 && h < 14
    return false
  }
  const [abierto, setAbierto] = useState(calcular)
  useEffect(() => {
    const t = setInterval(() => setAbierto(calcular()), 60_000)
    return () => clearInterval(t)
  }, [])
  return abierto
}

export default function ContactPage() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [touched, setTouched] = useState(false)
  const valid = form.nombre.trim() && form.mensaje.trim()
  const abierto = useAbierto()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    window.open(
      waConsulta([
        `¡Hola Boom Zapas! 👋 Soy ${form.nombre.trim()}.`,
        '',
        form.asunto ? `*Asunto:* ${form.asunto}` : null,
        `💬 ${form.mensaje.trim()}`,
        form.email.trim() ? '' : null,
        form.email.trim() ? `📧 Mi email: ${form.email.trim()}` : null,
      ]),
      '_blank',
      'noopener,noreferrer',
    )
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
        subtitle="Consultas, talles, stock o pedidos especiales. Escribinos por donde te quede más cómodo o vení a probártelas al showroom."
        lateral={
          <div className="on-bar relative overflow-hidden rounded-3xl p-7 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.6)] sm:p-9">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <p className="label text-white/60">Showroom</p>
              <span
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ring-1 ring-inset',
                  abierto ? 'bg-[#1f9d55]/20 text-[#4ade80] ring-[#1f9d55]/50' : 'bg-white/10 text-white/70 ring-white/15',
                )}
              >
                <span className={cn('size-2 rounded-full', abierto ? 'animate-pulse bg-[#4ade80]' : 'bg-white/50')} />
                {abierto ? 'Abierto ahora' : 'Cerrado ahora'}
              </span>
            </div>
            <p className="relative mt-4 text-[1.5rem] font-bold leading-7 text-white">{SITE.address}</p>
            <ul className="relative mt-6 space-y-2.5">
              {SITE.hours.map((h) => (
                <li key={h.dias} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.06] px-4 py-3 text-[14px] ring-1 ring-inset ring-white/10">
                  <span className="text-white/75">{h.dias}</span>
                  <span className="font-semibold text-white">{h.horario}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 px-4 text-[13px] text-white/50">
                <span>Domingos</span>
                <span>Cerrado</span>
              </li>
            </ul>
            <Button href={MAPA} full className="relative mt-6 !border-white !bg-white !text-black hover:!bg-accent hover:!text-white">
              <Icon name="pin" size={17} /> Cómo llegar
            </Button>
          </div>
        }
        actions={
          <>
            <Button href={waLinkGeneric()} size="lg">
              <Icon name="whatsapp" size={18} />
              Escribir por WhatsApp
            </Button>
            <Button href={SITE.instagramUrl} variant="outline" size="lg">
              <Icon name="instagram" size={18} />
              Instagram
            </Button>
          </>
        }
      />

      <section className="page-x grid grid-cols-[minmax(0,1fr)] gap-10 py-14 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div>
          <p className="label mb-3 text-accent">Canales</p>
          <h2 className="display-section mb-8">Qué usar para cada cosa</h2>
          <ul className="space-y-3">
            {CANALES.map((c, i) => (
              <li key={c.label}>
                <Reveal delay={i * 0.05}>
                  <a
                    href={c.href}
                    target={c.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="surface group flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5 sm:p-5"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg" style={{ background: c.fondo }}>
                      <Icon name={c.icon} size={23} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15.5px] font-bold leading-5">{c.label}</span>
                      <span className="mt-0.5 block truncate text-[13px] font-medium text-ink/80">{c.value}</span>
                      <span className="mt-1 block text-[13px] leading-5 text-index">{c.para}</span>
                    </span>
                    <Icon name="arrow" size={17} className="shrink-0 text-index transition-transform group-hover:translate-x-1 group-hover:text-ink" />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <form onSubmit={submit} noValidate className="surface relative space-y-6 overflow-hidden p-6 sm:p-9">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#25d366,#128c7e)]" />
            <div>
              <p className="label text-[#1f9d55]">Mensaje rápido</p>
              <h2 className="mt-2 text-[1.5rem] font-bold leading-7">Escribinos desde acá</h2>
              <p className="body-text mt-2 text-[14px]">Se abre WhatsApp con tu mensaje listo para enviar.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="label block text-index">Nombre</span>
                <input
                  className="field-line mt-2 normal-case"
                  value={form.nombre}
                  onChange={set('nombre')}
                  autoComplete="name"
                  placeholder="Ej.: Juan Pérez"
                  aria-invalid={touched && !form.nombre.trim()}
                />
              </label>
              <label className="block">
                <span className="label block text-index">Email (opcional)</span>
                <input className="field-line mt-2 normal-case" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="Ej.: vos@email.com" />
              </label>
            </div>
            <fieldset>
              <legend className="label mb-2.5 block text-index">¿Sobre qué es?</legend>
              <div className="flex flex-wrap gap-2">
                {ASUNTOS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={form.asunto === a}
                    onClick={() => setForm((f) => ({ ...f, asunto: f.asunto === a ? '' : a }))}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                      form.asunto === a ? 'border-[#1f9d55] bg-[#1f9d55] text-white' : 'border-line hover:border-[#1f9d55]',
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="label block text-index">Mensaje</span>
              <textarea
                className="field-line mt-2 min-h-28"
                value={form.mensaje}
                onChange={set('mensaje')}
                placeholder="Contanos qué modelo te interesa, tu talle o lo que necesites."
                aria-invalid={touched && !form.mensaje.trim()}
              />
            </label>
            {touched && !valid && (
              <p role="alert" className="label text-danger">
                Completá tu nombre y el mensaje.
              </p>
            )}
            <Button type="submit" size="lg" full className="!border-[#1f9d55] !bg-[#1f9d55] !text-white hover:!bg-[#178246]">
              <Icon name="whatsapp" size={18} />
              Enviar por WhatsApp
            </Button>
          </form>
        </Reveal>
      </section>
    </>
  )
}
