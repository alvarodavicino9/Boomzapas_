import { formatARS, type PlanCuotas } from '@/lib/format'
import type { CartItem } from '@/types'

interface OrderSummaryProps {
  items: CartItem[]
  /** Precio unitario a mostrar (por defecto el del producto). */
  unitPrice?: (i: CartItem) => number
  total: number
  discountLabel?: string
  /** Si paga con Mercado Pago en cuotas: el total pasa a ser el de las cuotas. */
  enCuotas?: PlanCuotas
}

export function OrderSummary({ items, unitPrice = (i) => i.precio, total, discountLabel, enCuotas }: OrderSummaryProps) {
  return (
    <div className="border-t border-line pt-6">
      <ul className="space-y-3 text-[14px]">
        {items.map((i) => (
          <li key={i.key} className="flex justify-between gap-4">
            <span className="min-w-0 truncate">
              {i.cantidad} × {i.nombre} <span className="text-index">· Talle {i.talle}</span>
            </span>
            <span className="shrink-0">{formatARS(unitPrice(i) * i.cantidad)}</span>
          </li>
        ))}
      </ul>
      {discountLabel && <p className="label mt-4 text-index">{discountLabel}</p>}
      {enCuotas && (
        <div className="mt-5 space-y-1.5 border-t border-line pt-5 text-[14px]">
          <p className="flex justify-between gap-4 text-index">
            <span>Precio en 1 pago</span>
            <span className="tabular-nums">{formatARS(total)}</span>
          </p>
          <p className="flex justify-between gap-4 text-index">
            <span>Recargo Mercado Pago ({enCuotas.cuotas} cuotas)</span>
            <span className="tabular-nums">+ {formatARS(enCuotas.total - total)}</span>
          </p>
        </div>
      )}
      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-5">
        <span className="label">{enCuotas ? `Total en ${enCuotas.cuotas} cuotas` : 'Total'}</span>
        <span className="text-right">
          <span className="font-display block text-[2rem] leading-none">{formatARS(enCuotas ? enCuotas.total : total)}</span>
          {enCuotas && (
            <span className="mt-1.5 block text-[13px] text-index">
              {enCuotas.cuotas} cuotas de <span className="font-semibold text-ink">{formatARS(enCuotas.cuota)}</span>
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
