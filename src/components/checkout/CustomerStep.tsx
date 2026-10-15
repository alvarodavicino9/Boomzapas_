import { Button } from '@/components/ui/Button'
import { SITE } from '@/config/site'
import { cn } from '@/lib/format'
import type { TipoEntrega } from '@/types'

export interface CustomerForm {
  nombre: string
  telefono: string
  email: string
  entrega: TipoEntrega
  direccion: string
}

export type CustomerErrors = Partial<Record<keyof CustomerForm, string>>

export const EMPTY_FORM: CustomerForm = { nombre: '', telefono: '', email: '', entrega: 'envio', direccion: '' }

export function validateCustomer(f: CustomerForm): CustomerErrors {
  const e: CustomerErrors = {}
  if (f.nombre.trim().length < 2) e.nombre = 'Ingresá tu nombre'
  if (f.telefono.replace(/\D/g, '').length < 8) e.telefono = 'Ingresá un WhatsApp válido'
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Email inválido'
  if (f.entrega === 'envio' && f.direccion.trim().length < 6) e.direccion = 'Ingresá dirección, localidad y código postal'
  return e
}

interface CustomerStepProps {
  form: CustomerForm
  errors: CustomerErrors
  onChange: (patch: Partial<CustomerForm>) => void
  onNext: () => void
}

export function CustomerStep({ form, errors, onChange, onNext }: CustomerStepProps) {
  return (
    <form
      className="space-y-7 px-5 pb-8 pt-7 sm:px-8"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
    >
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de entrega">
        {(
          [
            { id: 'envio', title: 'Envío', sub: 'Correo Argentino' },
            { id: 'retiro', title: 'Retiro', sub: 'En Córdoba · sin costo' },
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
              <span className={cn('mt-1 block text-[13px]', active ? 'text-gallery' : 'text-index')}>{o.sub}</span>
            </button>
          )
        })}
      </div>

      <Field label="Nombre y apellido" error={errors.nombre}>
        <input
          className="field-line normal-case"
          autoComplete="name"
          value={form.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          aria-invalid={!!errors.nombre}
          placeholder="Juan Pérez"
        />
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="WhatsApp" error={errors.telefono}>
          <input
            className="field-line normal-case"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.telefono}
            onChange={(e) => onChange({ telefono: e.target.value })}
            aria-invalid={!!errors.telefono}
            placeholder="351 555 1234"
          />
        </Field>
        <Field label="Email (opcional)" error={errors.email}>
          <input
            className="field-line normal-case"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
            aria-invalid={!!errors.email}
            placeholder="vos@email.com"
          />
        </Field>
      </div>

      {form.entrega === 'envio' ? (
        <Field label="Dirección de envío" error={errors.direccion}>
          <textarea
            className="field-line min-h-20"
            autoComplete="street-address"
            value={form.direccion}
            onChange={(e) => onChange({ direccion: e.target.value })}
            aria-invalid={!!errors.direccion}
            placeholder="Calle, número, localidad, provincia y código postal"
          />
        </Field>
      ) : (
        <p className="body-text border-t border-line pt-5">
          Retirás en <span className="text-ink">{SITE.address}</span>. Te avisamos por WhatsApp cuando esté listo.
        </p>
      )}

      <Button type="submit" size="lg" full>
        Continuar
      </Button>
    </form>
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
