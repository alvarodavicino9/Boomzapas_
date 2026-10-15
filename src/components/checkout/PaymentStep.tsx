import { Button } from '@/components/ui/Button'
import { OrderSummary } from './OrderSummary'
import { SITE } from '@/config/site'
import { cn, formatARS, transferPrice } from '@/lib/format'
import type { CartItem, MetodoPago } from '@/types'

const METHODS: { id: MetodoPago; title: string; text: string; note?: string }[] = [
  {
    id: 'mercadopago',
    title: 'Mercado Pago',
    text: 'Tarjeta, dinero en cuenta o cuotas. Te enviamos el link de pago.',
  },
  {
    id: 'transferencia',
    title: 'Transferencia',
    text: 'CBU o alias. Confirmás enviando el comprobante.',
    note: `${formatARS(SITE.transferDiscount)} menos por par`,
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    text: 'Coordinamos el pago y el envío por mensaje.',
  },
]

interface PaymentStepProps {
  items: CartItem[]
  metodo: MetodoPago
  onMetodo: (m: MetodoPago) => void
  total: number
  submitting: boolean
  error: string | null
  onBack: () => void
  onConfirm: () => void
  onFallback: () => void
}

export function PaymentStep({
  items,
  metodo,
  onMetodo,
  total,
  submitting,
  error,
  onBack,
  onConfirm,
  onFallback,
}: PaymentStepProps) {
  const isTransfer = metodo === 'transferencia'
  return (
    <div className="space-y-7 px-5 pb-8 pt-7 sm:px-8">
      <div role="radiogroup" aria-label="Medio de pago" className="space-y-3">
        {METHODS.map((m) => {
          const active = metodo === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onMetodo(m.id)}
              className={cn(
                'flex w-full items-start gap-4 rounded-2xl border-[1.5px] p-4 text-left transition-colors',
                active ? 'border-ink bg-ink text-gallery' : 'border-control hover:border-ink',
              )}
            >
              <span
                className={cn('mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border', active ? 'border-gallery' : 'border-control')}
                aria-hidden="true"
              >
                {active && <span className="size-2 rounded-full bg-gallery" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="label flex flex-wrap items-center justify-between gap-x-3">
                  {m.title}
                  {m.note && <span className={active ? 'text-gallery' : 'text-index'}>{m.note}</span>}
                </span>
                <span className={cn('mt-1.5 block text-[13px] leading-5', active ? 'text-gallery' : 'text-index')}>{m.text}</span>
              </span>
            </button>
          )
        })}
      </div>

      <OrderSummary
        items={items}
        unitPrice={isTransfer ? (i) => transferPrice(i.precio) : undefined}
        total={total}
        discountLabel={isTransfer ? 'Precio con descuento por transferencia aplicado.' : undefined}
      />

      {error && (
        <div role="alert" className="border border-danger p-4">
          <p className="text-[14px] text-danger">{error}</p>
          <button onClick={onFallback} className="label link-u mt-3">
            Enviar el pedido por WhatsApp igual
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          Volver
        </Button>
        <Button size="lg" className="flex-1" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Enviando' : 'Confirmar pedido'}
        </Button>
      </div>
    </div>
  )
}
