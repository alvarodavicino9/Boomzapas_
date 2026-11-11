import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SITE } from '@/config/site'
import { cn } from '@/lib/format'
import type { TipoEntrega } from '@/types'

export interface CustomerForm {
  nombre: string
  dni: string
  telefono: string
  email: string
  entrega: TipoEntrega
  calle: string
  numero: string
  piso: string
  localidad: string
  provincia: string
  cp: string
  referencias: string
  notas: string
  origen: string
}

export type CustomerErrors = Partial<Record<keyof CustomerForm, string>>

export const EMPTY_FORM: CustomerForm = {
  nombre: '',
  dni: '',
  telefono: '',
  email: '',
  entrega: 'envio',
  calle: '',
  numero: '',
  piso: '',
  localidad: '',
  provincia: 'Córdoba',
  cp: '',
  referencias: '',
  notas: '',
  origen: '',
}

export const PROVINCIAS = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

const ORIGENES = ['Instagram', 'TikTok', 'Google', 'Me lo recomendaron', 'Ya compré antes', 'Otro']

/** Dirección de envío en una sola línea, para el pedido y el mensaje. */
export const direccionCompleta = (f: CustomerForm) =>
  [
    `${f.calle.trim()} ${f.numero.trim()}`.trim() + (f.piso.trim() ? `, ${f.piso.trim()}` : ''),
    f.localidad.trim(),
    f.provincia.trim(),
    f.cp.trim() && `CP ${f.cp.trim()}`,
  ]
    .filter(Boolean)
    .join(', ')

export function validateCustomer(f: CustomerForm): CustomerErrors {
  const e: CustomerErrors = {}
  if (f.nombre.trim().split(/\s+/).length < 2) e.nombre = 'Ingresá nombre y apellido'
  if (f.telefono.replace(/\D/g, '').length < 8) e.telefono = 'Ingresá un WhatsApp válido (con característica)'
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Email inválido'
  const dni = f.dni.replace(/\D/g, '')
  if (f.entrega === 'envio' && (dni.length < 7 || dni.length > 8)) e.dni = 'El correo pide el DNI de quien recibe'
  if (f.entrega === 'retiro' && f.dni.trim() && (dni.length < 7 || dni.length > 8)) e.dni = 'DNI inválido'
  if (f.entrega === 'envio') {
    if (f.calle.trim().length < 3) e.calle = 'Ingresá la calle'
    if (!f.numero.trim()) e.numero = 'Ingresá la altura (o "S/N")'
    if (f.localidad.trim().length < 2) e.localidad = 'Ingresá la localidad'
    if (!f.provincia.trim()) e.provincia = 'Elegí la provincia'
    if (!/^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/.test(f.cp.trim().replace(/\s/g, ''))) e.cp = 'Código postal inválido'
  }
  return e
}

interface CustomerStepProps {
  form: CustomerForm
  errors: CustomerErrors
  onChange: (patch: Partial<CustomerForm>) => void
  onNext: () => void
}

export function CustomerStep({ form, errors, onChange, onNext }: CustomerStepProps) {
  const input = (k: keyof CustomerForm, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input
      className="field-line normal-case text-[15px] sm:text-[14px]"
      value={form[k]}
      onChange={(e) => onChange({ [k]: e.target.value })}
      aria-invalid={!!errors[k]}
      {...props}
    />
  )

  return (
    <form
      className="space-y-7 px-5 pb-8 pt-7 sm:px-8"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
    >
      <Bloque icon="users" titulo="Tus datos">
        <Field label="Nombre y apellido" error={errors.nombre}>
          {input('nombre', { autoComplete: 'name', placeholder: 'Ej.: Juan Pérez' })}
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="WhatsApp" error={errors.telefono}>
            {input('telefono', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: 'Ej.: 351 555 1234' })}
          </Field>
          <Field label={form.entrega === 'envio' ? 'DNI de quien recibe' : 'DNI (opcional)'} error={errors.dni}>
            {input('dni', { inputMode: 'numeric', placeholder: 'Sin puntos' })}
          </Field>
        </div>
        <Field label="Email (opcional)" error={errors.email}>
          {input('email', { type: 'email', inputMode: 'email', autoComplete: 'email', placeholder: 'Ej.: vos@email.com' })}
        </Field>
      </Bloque>

      <Bloque icon="truck" titulo="Entrega">
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de entrega">
          {(
            [
              { id: 'envio', title: 'Envío gratis', sub: 'Correo Argentino · 3 a 7 días' },
              { id: 'retiro', title: 'Retiro', sub: 'Showroom en Córdoba · sin costo' },
            ] as const
          ).map((o) => {
            const active = form.entrega === o.id
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ entrega: o.id })}
                className={cn(
                  'rounded-2xl border-[1.5px] p-4 text-left transition-colors',
                  active ? 'border-ink bg-ink text-gallery' : 'border-control hover:border-ink',
                )}
              >
                <span className="label block">{o.title}</span>
                <span className={cn('mt-1 block text-[12.5px] leading-4', active ? 'text-gallery' : 'text-index')}>{o.sub}</span>
              </button>
            )
          })}
        </div>

        {form.entrega === 'envio' ? (
          <>
            <div className="grid grid-cols-[1fr_96px] gap-4 sm:gap-6">
              <Field label="Calle" error={errors.calle}>
                {input('calle', { autoComplete: 'address-line1', placeholder: 'Ej.: Av. Colón' })}
              </Field>
              <Field label="Altura" error={errors.numero}>
                {input('numero', { inputMode: 'numeric', placeholder: 'Ej.: 1234' })}
              </Field>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Piso / depto (opcional)">{input('piso', { autoComplete: 'address-line2', placeholder: 'Ej.: 3° B' })}</Field>
              <Field label="Código postal" error={errors.cp}>
                {input('cp', { autoComplete: 'postal-code', inputMode: 'numeric', placeholder: 'Ej.: 5000' })}
              </Field>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Localidad / ciudad" error={errors.localidad}>
                {input('localidad', { autoComplete: 'address-level2', placeholder: 'Ej.: Villa Carlos Paz' })}
              </Field>
              <Field label="Provincia" error={errors.provincia}>
                <select
                  className="field-line normal-case text-[15px] sm:text-[14px]"
                  value={form.provincia}
                  onChange={(e) => onChange({ provincia: e.target.value })}
                  autoComplete="address-level1"
                >
                  {PROVINCIAS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Entre calles o referencias (opcional)">
              {input('referencias', { placeholder: 'Ej.: casa con portón negro, timbre 2' })}
            </Field>
          </>
        ) : (
          <p className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4 text-[13.5px] leading-5 text-index">
            <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-accent" />
            <span>
              Retirás en <span className="font-semibold text-ink">{SITE.address}</span>. Te avisamos por WhatsApp cuando esté listo y
              coordinamos el horario.
            </span>
          </p>
        )}
      </Bloque>

      <Bloque icon="chat" titulo="Algo más (opcional)">
        <Field label="Notas para tu pedido">
          <textarea
            className="field-line min-h-[72px] text-[15px] sm:text-[14px]"
            value={form.notas}
            onChange={(e) => onChange({ notas: e.target.value })}
            placeholder="Ej.: es para regalo, horario en que hay alguien, otro talle si no está…"
          />
        </Field>
        <Field label="¿Cómo nos conociste?">
          <select className="field-line normal-case text-[15px] sm:text-[14px]" value={form.origen} onChange={(e) => onChange({ origen: e.target.value })}>
            <option value="">Elegí una opción</option>
            {ORIGENES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </Bloque>

      <Button type="submit" size="lg" variant="accent" full>
        Continuar al pago <Icon name="arrow" size={17} />
      </Button>
    </form>
  )
}

function Bloque({ icon, titulo, children }: { icon: 'users' | 'truck' | 'chat'; titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-6">
      <legend className="mb-5 flex items-center gap-2.5 text-[14px] font-bold">
        <span className="grid size-8 place-items-center rounded-full bg-accent/12 text-[color:var(--bz-accent-text)]">
          <Icon name={icon} size={15} />
        </span>
        {titulo}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label mb-1 block text-index">{label}</span>
      {children}
      {error && (
        <span role="alert" className="label mt-2 block text-danger">
          {error}
        </span>
      )}
    </label>
  )
}
