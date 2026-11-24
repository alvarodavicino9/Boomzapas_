import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { OrderSummary } from './OrderSummary'
import { aplicaPromo, cn, formatARS, planCuotas, planesCuotas, PROMO, precioUnitario } from '@/lib/format'
import type { CartItem, MetodoPago } from '@/types'

const METHODS: { id: MetodoPago; title: string; text: string }[] = [
  {
    id: 'mercadopago',
    title: 'Mercado Pago',
    text: 'Tarjeta, dinero en cuenta o cuotas. Te enviamos el link de pago por WhatsApp.',
  },
  {
    id: 'transferencia',
    title: 'Transferencia',
    text: 'CBU o alias. Confirmás enviando el comprobante.',
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
  /** Cuotas elegidas para Mercado Pago (1 = un pago). */
  cuotas: number
  onCuotas: (n: number) => void
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
  cuotas,
  onCuotas,
  total,
  submitting,
  error,
  onBack,
  onConfirm,
  onFallback,
}: PaymentStepProps) {
  const pares = items.reduce((n, i) => n + i.cantidad, 0)
  const conPromo = aplicaPromo(pares)
  const planes = planesCuotas(total)
  const plan = planCuotas(total, cuotas)
  const enCuotas = metodo === 'mercadopago' && plan.cuotas > 1
  // las cuotas se ven al tocar "Ver cuotas" (así la tarjeta queda limpia)
  const [verCuotas, setVerCuotas] = useState(false)
  const maxCuotas = planes[planes.length - 1].cuotas

  return (
    <div className="space-y-7 px-5 pb-8 pt-7 sm:px-8">
      <div role="radiogroup" aria-label="Medio de pago" className="space-y-3">
        {METHODS.map((m) => {
          const active = metodo === m.id
          return (
            <div
              key={m.id}
              className={cn(
                'rounded-2xl border-[1.5px] transition-colors',
                active ? 'border-ink bg-ink text-gallery' : 'border-control hover:border-ink',
              )}
            >
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onMetodo(m.id)}
                className="flex w-full items-start gap-4 p-4 text-left"
              >
                <Punto activo={active} claro={active} />
                <span className="min-w-0 flex-1">
                  <span className="label block">{m.title}</span>
                  <span className={cn('mt-1.5 block text-[13px] leading-5', active ? 'text-gallery' : 'text-index')}>{m.text}</span>
                </span>
              </button>

              {/* Mercado Pago: se abre para ver el precio en cuotas (con el recargo de Mercado Pago) */}
              {m.id === 'mercadopago' && (
                <div className={cn('mx-4 mb-4 border-t pt-3', active ? 'border-gallery/20' : 'border-line')}>
                  <button
                    type="button"
                    aria-expanded={verCuotas && active}
                    aria-controls="cuotas-mp"
                    onClick={() => {
                      onMetodo('mercadopago')
                      setVerCuotas((v) => !v)
                    }}
                    className="flex w-full items-center justify-between gap-3 text-left text-[13px] leading-5"
                  >
                    <span className="min-w-0">
                      {enCuotas ? (
                        <>
                          <span className="font-semibold">{plan.cuotas} cuotas</span> de{' '}
                          <span className="font-semibold tabular-nums">{formatARS(plan.cuota)}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">1 pago</span> o hasta <span className="font-semibold">{maxCuotas} cuotas</span>
                        </>
                      )}
                    </span>
                    <span className={cn('label flex shrink-0 items-center gap-1.5 text-[10.5px]', active ? 'text-gallery/80' : 'text-index')}>
                      {verCuotas && active ? 'Ocultar' : enCuotas ? 'Cambiar' : 'Ver cuotas'}
                      <Icon name="chevron" size={14} className={cn('transition-transform duration-200', verCuotas && active && 'rotate-180')} />
                    </span>
                  </button>

                  {verCuotas && active && (
                    <div id="cuotas-mp" className="mt-2.5">
                      <div role="radiogroup" aria-label="Cuotas con Mercado Pago" className="space-y-1">
                        {planes.map((p) => {
                          const elegido = active && p.cuotas === plan.cuotas
                          return (
                            <button
                              key={p.cuotas}
                              type="button"
                              role="radio"
                              aria-checked={elegido}
                              onClick={() => {
                                onMetodo('mercadopago')
                                onCuotas(p.cuotas)
                              }}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[13px] leading-5 transition-colors',
                                elegido ? 'bg-gallery/10' : 'hover:bg-gallery/5',
                              )}
                            >
                              <Punto activo={elegido} claro chico />
                              <span className="min-w-0 flex-1">
                                <span className="font-semibold">{p.cuotas === 1 ? '1 pago' : `${p.cuotas} cuotas`}</span>
                                {p.cuotas > 1 && (
                                  <>
                                    {' '}
                                    de <span className="font-semibold tabular-nums">{formatARS(p.cuota)}</span>
                                  </>
                                )}
                              </span>
                              <span className="shrink-0 text-right tabular-nums text-gallery/75">
                                {p.cuotas === 1 ? <span className="font-semibold text-gallery">{formatARS(p.total)}</span> : <>Total {formatARS(p.total)}</>}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <p className="mt-2 px-2.5 text-[11.5px] leading-4 text-gallery/65">
                        Las cuotas incluyen el recargo de Mercado Pago.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <OrderSummary
        items={items}
        unitPrice={conPromo ? (i) => precioUnitario(i.precio, pares) : undefined}
        total={total}
        discountLabel={conPromo ? `Promo ${PROMO.minimo} pares o más aplicada: ${formatARS(PROMO.descuento)} off en cada par.` : undefined}
        enCuotas={enCuotas ? plan : undefined}
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
        <Button size="lg" variant="accent" className="flex-1" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Enviando' : 'Confirmar pedido'}
        </Button>
      </div>
    </div>
  )
}

function Punto({ activo, claro, chico }: { activo: boolean; claro?: boolean; chico?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full border',
        chico ? 'size-3.5' : 'mt-0.5 size-4',
        claro ? 'border-gallery' : 'border-control',
        !activo && claro && 'border-gallery/50',
      )}
    >
      {activo && <span className={cn('rounded-full bg-gallery', chico ? 'size-1.5' : 'size-2')} />}
    </span>
  )
}
