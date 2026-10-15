import { useState } from 'react'
import { adminSetEstado } from '@/lib/api'
import { formatARS, formatDate } from '@/lib/format'
import { useUI } from '@/context/UIContext'
import type { EstadoPedido, PedidoRow } from '@/types'

const ESTADOS: EstadoPedido[] = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado']

/** Lee la primera columna que exista (la vista puede nombrar distinto los campos). */
const pick = (row: PedidoRow, keys: string[]): string => {
  for (const k of keys) {
    const v = row[k]
    if (v !== null && v !== undefined && v !== '') return String(v)
  }
  return '—'
}

interface OrdersPanelProps {
  token: string
  pedidos: PedidoRow[]
  onChange: (rows: PedidoRow[]) => void
  onUnauthorized: () => void
}

export function OrdersPanel({ token, pedidos, onChange, onUnauthorized }: OrdersPanelProps) {
  const [busy, setBusy] = useState<string | number | null>(null)
  const { toast } = useUI()

  const setEstado = async (row: PedidoRow, estado: EstadoPedido) => {
    const prev = pedidos
    onChange(pedidos.map((p) => (p.id === row.id ? { ...p, estado } : p)))
    setBusy(row.id)
    try {
      await adminSetEstado(token, row.id, estado)
      toast(`Pedido #${row.id} → ${estado}`)
    } catch (e) {
      onChange(prev)
      if (e instanceof Error && e.message === 'Token incorrecto.') return onUnauthorized()
      toast('No se pudo actualizar el pedido')
    } finally {
      setBusy(null)
    }
  }

  if (pedidos.length === 0) return <p className="body-text border-t border-line pt-5">Todavía no hay pedidos.</p>

  return (
    <div className="overflow-x-auto border-t border-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="label border-b border-line text-index">
          <tr>
            {['#', 'Fecha', 'Cliente', 'Pago', 'Total', 'Estado'].map((h) => (
              <th key={h} className="px-4 py-3 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => {
            const estado = pick(p, ['estado'])
            return (
              <tr key={String(p.id)} className="border-b border-line">
                <td className="px-4 py-4 font-display text-xl">{String(p.id)}</td>
                <td className="px-4 py-4 text-index">{formatDate(p.created_at ?? p.fecha)}</td>
                <td className="px-4 py-4">
                  <span className="block">{pick(p, ['cliente_nombre', 'nombre', 'cliente'])}</span>
                  <span className="text-[13px] text-index">{pick(p, ['telefono', 'cliente_telefono', 'email'])}</span>
                </td>
                <td className="px-4 py-4 capitalize">{pick(p, ['metodo_pago'])}</td>
                <td className="px-4 py-4">{formatARS(Number(p.total) || 0)}</td>
                <td className="px-4 py-4">
                  <select
                    value={estado}
                    disabled={busy === p.id}
                    onChange={(e) => setEstado(p, e.target.value as EstadoPedido)}
                    aria-label={`Estado del pedido ${p.id}`}
                    className="field-line !w-auto !py-1.5 capitalize"
                  >
                    {!ESTADOS.includes(estado as EstadoPedido) && <option value={estado}>{estado}</option>}
                    {ESTADOS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
