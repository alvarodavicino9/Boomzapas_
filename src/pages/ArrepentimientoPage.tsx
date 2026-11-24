import { useState } from 'react'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SITE } from '@/config/site'
import { waConsulta } from '@/lib/whatsapp'
import { RECLAMOS_CONSUMIDOR } from '@/lib/legal'


interface Datos {
  nombre: string
  telefono: string
  pedido: string
  motivo: string
}

const VACIO: Datos = { nombre: '', telefono: '', pedido: '', motivo: '' }

/**
 * Botón de arrepentimiento (Ley 24.240 art. 34, Código Civil y Comercial art. 1110).
 * Sin registro ni trámites: el cliente completa lo mínimo y la solicitud nos llega por WhatsApp o por mail.
 */
export default function ArrepentimientoPage() {
  const [d, setD] = useState<Datos>(VACIO)
  const [error, setError] = useState<string | null>(null)

  const lineas = () => [
    '¡Hola Boom Zapas! Quiero usar el *botón de arrepentimiento* y cancelar mi compra.',
    '',
    `• Nombre y apellido: ${d.nombre.trim()}`,
    `• WhatsApp: ${d.telefono.trim()}`,
    `• Número de pedido: ${d.pedido.trim() || 'no lo tengo a mano'}`,
    d.motivo.trim() ? `• Motivo (opcional): ${d.motivo.trim()}` : null,
    '',
    'Quedo atento/a al código de la solicitud.',
  ]

  const validar = () => {
    if (d.nombre.trim().length < 3) return 'Escribí tu nombre y apellido.'
    if (d.telefono.replace(/\D/g, '').length < 6) return 'Escribí un teléfono o WhatsApp de contacto.'
    return null
  }

  const enviarWhatsApp = () => {
    const e = validar()
    setError(e)
    if (!e) window.open(waConsulta(lineas()), '_blank', 'noopener,noreferrer')
  }

  const mail = () => {
    const cuerpo = lineas()
      .filter((l): l is string => typeof l === 'string')
      .join('\n')
      .replace(/\*/g, '')
    return `mailto:${SITE.email}?subject=${encodeURIComponent('Botón de arrepentimiento')}&body=${encodeURIComponent(cuerpo)}`
  }

  const campo = (k: keyof Datos, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="label mb-1 block text-index">{label}</span>
      <input
        className="field-line normal-case"
        value={d[k]}
        onChange={(e) => setD((v) => ({ ...v, [k]: e.target.value }))}
        maxLength={120}
        {...extra}
      />
    </label>
  )

  return (
    <>
      <PageHero
        eyebrow="Tus derechos"
        title={<span style={{ fontSize: "min(1em, 7.4vw)" }}>Botón de arrepentimiento</span>}
        subtitle="Si compraste por la web o por WhatsApp, tenés 10 días corridos (desde que recibís el par) para arrepentirte, sin dar explicaciones, sin costo y sin registrarte."
      />

      <section className="page-x pb-6 pt-10 sm:pt-14">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1.1fr_1fr]">
          <form
            className="surface space-y-6 p-6 sm:p-8"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              enviarWhatsApp()
            }}
          >
            <div>
              <h2 className="display-product">Solicitar la cancelación</h2>
              <p className="body-text mt-2">Completá tus datos y envianos la solicitud. Es todo lo que necesitamos.</p>
            </div>
            {campo('nombre', 'Nombre y apellido', { autoComplete: 'name', placeholder: 'Ej.: Juan Pérez' })}
            {campo('telefono', 'WhatsApp o teléfono', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: 'Ej.: 351 555 1234' })}
            {campo('pedido', 'Número de pedido (si lo tenés)', { placeholder: 'Ej.: 0012' })}
            {campo('motivo', 'Motivo (opcional)', { placeholder: 'No hace falta que nos digas por qué' })}
            {error && (
              <p role="alert" className="label text-danger">
                {error}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit" size="lg" variant="accent" full>
                <Icon name="whatsapp" size={18} /> Enviar por WhatsApp
              </Button>
              <Button
                variant="outline"
                size="lg"
                full
                href={mail()}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  const err = validar()
                  setError(err)
                  if (err) e.preventDefault()
                }}
              >
                <Icon name="mail" size={18} /> Enviar por mail
              </Button>
            </div>
          </form>

          <div className="space-y-6 text-[15px] leading-6">
            <div>
              <h2 className="label mb-3 text-index">Cómo sigue</h2>
              <ol className="space-y-3">
                {[
                  'Te respondemos dentro de las 24 hs con el código de tu solicitud.',
                  'Coordinamos la devolución del par, sin costo para vos.',
                  'Cuando lo recibimos, te devolvemos el dinero por el mismo medio con el que pagaste.',
                ].map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-[12px] font-bold text-index">{i + 1}</span>
                    <span className="pt-0.5">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-index">
              El par tiene que volver sin uso y en las mismas condiciones en que lo recibiste. Derecho previsto en el artículo 34 de la
              Ley 24.240 de Defensa del Consumidor y el artículo 1110 del Código Civil y Comercial.
            </p>
            <a
              href={RECLAMOS_CONSUMIDOR}
              target="_blank"
              rel="noopener noreferrer"
              className="surface flex items-start gap-3 p-4 transition-colors hover:border-accent"
            >
              <Icon name="shield" size={18} className="mt-0.5 shrink-0 text-accent-soft" />
              <span>
                <span className="block font-semibold">Defensa de las y los consumidores</span>
                <span className="block text-[13px] text-index">Para reclamos ingresá acá (sitio oficial del Gobierno)</span>
              </span>
              <Icon name="external" size={14} className="ml-auto mt-1 shrink-0 text-index" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
