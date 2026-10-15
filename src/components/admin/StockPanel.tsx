import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useProductos } from '@/context/ProductsContext'
import { useUI } from '@/context/UIContext'
import { adminSetStock } from '@/lib/api'
import type { Producto } from '@/types'

interface StockPanelProps {
  token: string
  onUnauthorized: () => void
}

export function StockPanel({ token, onUnauthorized }: StockPanelProps) {
  const { productos, status, reload } = useProductos()
  const [query, setQuery] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const { toast } = useUI()

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? productos.filter((p) => `${p.nombre} ${p.marca}`.toLowerCase().includes(q)) : productos
  }, [productos, query])

  const keyOf = (id: number, talle: string) => `${id}-${talle}`

  const save = async (p: Producto, talle: string, current: number) => {
    const k = keyOf(p.id, talle)
    const next = Number(drafts[k])
    if (!Number.isInteger(next) || next < 0 || next === current) return
    setSaving(k)
    try {
      await adminSetStock(token, p.id, talle, next)
      toast(`${p.nombre} · T${talle}: ${next}`)
      setDrafts((d) => {
        const { [k]: _, ...rest } = d
        return rest
      })
      reload()
    } catch (e) {
      if (e instanceof Error && e.message === 'Token incorrecto.') return onUnauthorized()
      toast('No se pudo guardar el stock')
    } finally {
      setSaving(null)
    }
  }

  if (status === 'loading') return <p className="label text-index">Cargando productos</p>

  return (
    <div className="space-y-8">
      <label className="block max-w-sm">
        <span className="sr-only">Buscar producto</span>
        <input
          className="field-line"
          type="search"
          placeholder="Buscar producto"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <ul className="border-t border-line">
        {list.map((p) => (
          <li key={p.id} className="border-b border-line py-6">
            <p className="mb-4 text-[15px]">
              {p.nombre} <span className="label ml-2 text-index">{p.marca}</span>
            </p>
            {p.stock.length === 0 ? (
              <p className="label text-index">Sin talles cargados</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {p.stock.map((s) => {
                  const k = keyOf(p.id, s.talle)
                  const value = drafts[k] ?? String(s.cantidad)
                  const dirty = drafts[k] !== undefined && Number(drafts[k]) !== s.cantidad
                  return (
                    <div key={k} className="flex items-center gap-2 border border-line p-1.5 pl-3">
                      <span className="label text-index">T{s.talle}</span>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={value}
                        aria-label={`Stock talle ${s.talle} de ${p.nombre}`}
                        onChange={(e) => setDrafts((d) => ({ ...d, [k]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && save(p, s.talle, s.cantidad)}
                        className={`field-line !w-14 !px-1 !py-1.5 text-center ${s.cantidad === 0 ? '!text-danger' : ''}`}
                      />
                      {dirty && (
                        <Button size="sm" onClick={() => save(p, s.talle, s.cantidad)} disabled={saving === k} className="!min-h-8 !px-3">
                          {saving === k ? '…' : 'Guardar'}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
