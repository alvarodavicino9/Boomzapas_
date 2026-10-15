import { formatARS } from '@/lib/format'
import type { CartItem } from '@/types'

interface OrderSummaryProps {
  items: CartItem[]
  /** Precio unitario a mostrar (por defecto el del producto). */
  unitPrice?: (i: CartItem) => number
  total: number
  discountLabel?: string
}

export function OrderSummary({ items, unitPrice = (i) => i.precio, total, discountLabel }: OrderSummaryProps) {
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
      <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
        <span className="label">Total</span>
        <span className="font-display text-[2rem] leading-none">{formatARS(total)}</span>
      </div>
    </div>
  )
}
