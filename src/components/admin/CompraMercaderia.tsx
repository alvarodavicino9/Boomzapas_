import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Field } from './ui'
import { useUI } from '@/context/UIContext'
import { MEDIOS, registrarCompra, useCostos } from '@/lib/adminStore'
import { MODO_DEMO } from '@/lib/api'
import { DEFAULT_TALLES } from '@/config/site'
import { cn, formatARS } from '@/lib/format'
import type { Producto } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  productos: Producto[]
  /** Modelo ya elegido (al abrirlo desde la ficha del producto). */
  productoId?: number
  setStock: (p: Producto, talle: string, cantidad: number) => Promise<void>
}

const hoyISO = () => new Date().toISOString().slice(0, 10)

/** Ingreso de mercadería: suma pares al stock, guarda el costo y anota el gasto en la caja. */
export function CompraMercaderia({ open, onClose, productos, productoId, setStock }: Props) {
  const costos = useCostos()
  const [prodId, setProdId] = useState('')
  const [talles, setTalles] = useState<Record<string, number>>({})
  const [costo, setCosto] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [medio, setMedio] = useState(MEDIOS[1])
  const [fecha, setFecha] = useState(hoyISO())
  const [error, setError] = useState('')
  const { toast } = useUI()

  const ordenados = useMemo(() => [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre)), [productos])
  const prod = productos.find((p) => String(p.id) === prodId)

  useEffect(() => {
    if (!open) return
    setProdId(productoId ? String(productoId) : '')
    setTalles({})
    setError('')
    setFecha(hoyISO())
  }, [open, productoId])

  useEffect(() => {
    setCosto(prod && costos[prod.id] ? String(costos[prod.id]) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prodId])

  const listaTalles = useMemo(() => {
    const t = new Set([...(prod?.stock.map((s) => s.talle) ?? []), ...DEFAULT_TALLES])
    return [...t].sort((a, b) => Number(a) - Number(b))
  }, [prod])

  const pares = Object.values(talles).reduce((a, n) => a + n, 0)
  const unit = Number(costo) || 0
  const total = pares * unit
  const margen = prod && unit > 0 ? ((prod.precio - unit) / unit) * 100 : null

  const sumar = (t: string, d: number) => setTalles((x) => ({ ...x, [t]: Math.max(0, (x[t] ?? 0) + d) }))

  const guardar = async () => {
    if (!prod) return setError('Elegí el modelo que entró.')
    if (pares === 0) return setError('Cargá cuántos pares entraron de cada talle.')
    if (unit <= 0) return setError('Poné el costo por par.')
    const f = new Date(`${fecha}T12:00:00`)
    registrarCompra(
      { producto_id: prod.id, nombre: prod.nombre, talles, costo_unit: unit, proveedor: proveedor.trim() || undefined, fecha: f.toISOString(), medio },
      productos,
    )
    if (!MODO_DEMO) {
      try {
        for (const [t, n] of Object.entries(talles)) {
          if (n <= 0) continue
          const actual = prod.stock.find((s) => s.talle === t)?.cantidad ?? 0
          await setStock(prod, t, actual + n)
        }
      } catch {
        toast('El gasto quedó anotado, pero no se pudo actualizar el stock en el servidor')
        return onClose()
      }
    }
    toast(`Entraron ${pares} ${pares === 1 ? 'par' : 'pares'} de ${prod.nombre}`)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Cargar mercadería" size="lg">
      <div className="space-y-5 px-5 py-5 sm:px-8">
        <p className="body-text">Suma los pares al stock, guarda el costo del modelo y anota la compra en la caja.</p>

        <Field label="Modelo">
          <select className="field-line normal-case" value={prodId} onChange={(e) => (setProdId(e.target.value), setTalles({}))}>
            <option value="">Elegí un modelo…</option>
            {ordenados.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>

        {prod && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <span className="label text-index">Pares que entraron por talle</span>
              <span className="text-[12.5px] text-index">{pares} en total</span>
            </div>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {listaTalles.map((t) => {
                const n = talles[t] ?? 0
                const hay = prod.stock.find((s) => s.talle === t)?.cantidad ?? 0
                return (
                  <li key={t} className={cn('rounded-xl border px-2 py-2', n > 0 ? 'border-accent bg-accent/10' : 'border-line bg-card')}>
                    <div className="flex items-baseline justify-between px-1">
                      <span className="text-[13px] font-semibold">T{t}</span>
                      <span className="text-[10.5px] text-index">hay {hay}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <button
                        type="button"
                        aria-label={`Restar talle ${t}`}
                        onClick={() => sumar(t, -1)}
                        disabled={n <= 0}
                        className="grid size-7 place-items-center rounded-full border border-line disabled:opacity-40"
                      >
                        <Icon name="minus" size={12} />
                      </button>
                      <span className="text-[15px] font-bold tabular-nums">{n}</span>
                      <button
                        type="button"
                        aria-label={`Sumar talle ${t}`}
                        onClick={() => sumar(t, 1)}
                        className="grid size-7 place-items-center rounded-full border border-line"
                      >
                        <Icon name="plus" size={12} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Costo por par ($)"
            hint={prod && margen !== null ? `Lo vendés a ${formatARS(prod.precio)}: margen ${margen.toFixed(0)}%` : undefined}
          >
            <input className="field-line" type="number" min={0} step={500} inputMode="numeric" value={costo} onChange={(e) => setCosto(e.target.value)} />
          </Field>
          <Field label="Proveedor (opcional)">
            <input className="field-line normal-case" value={proveedor} onChange={(e) => setProveedor(e.target.value)} />
          </Field>
          <Field label="Pagado con">
            <select className="field-line normal-case" value={medio} onChange={(e) => setMedio(e.target.value)}>
              {MEDIOS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Fecha">
            <input className="field-line" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>
        </div>

        {error && (
          <p role="alert" className="label text-danger">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
          <p className="text-[13px] text-index">
            Total de la compra <span className="ml-2 font-display text-xl font-bold text-ink">{formatARS(total)}</span>
          </p>
          <Button onClick={guardar}>Cargar</Button>
        </div>
      </div>
    </Modal>
  )
}
