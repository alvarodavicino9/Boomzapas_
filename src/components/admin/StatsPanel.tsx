import { formatARS } from '@/lib/format'
import type { AdminStats } from '@/types'

export function StatsPanel({ stats }: { stats: AdminStats }) {
  const cards = [
    { label: 'Pedidos totales', value: String(stats.total_pedidos) },
    { label: 'Pedidos pagados', value: String(stats.pedidos_pagados) },
    { label: 'Ingresos', value: formatARS(stats.ingresos_total) },
  ]
  return (
    <div className="space-y-14">
      <div className="grid border-l border-t border-line sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="border-b border-r border-line p-6 sm:p-8">
            <p className="label text-index">{c.label}</p>
            <p className="mt-4 font-display text-[3rem] leading-none">{c.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="display-product mb-6">Stock bajo (menos de 3)</h2>
        {stats.stock_bajo.length === 0 ? (
          <p className="body-text border-t border-line pt-5">Todo el stock está en orden.</p>
        ) : (
          <ul className="border-t border-line">
            {stats.stock_bajo.map((s) => (
              <li
                key={`${s.producto_id}-${s.talle}`}
                className="flex items-center justify-between gap-4 border-b border-line py-4 text-[14px]"
              >
                <span className="min-w-0 truncate">
                  {s.productos?.nombre ?? `Producto #${s.producto_id}`}{' '}
                  <span className="text-index">· Talle {s.talle}</span>
                </span>
                <span className={`font-display text-2xl ${s.cantidad === 0 ? 'text-danger' : ''}`}>{s.cantidad}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
