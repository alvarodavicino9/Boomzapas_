import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Field } from './ui'
import { crearPedidoManual, type ItemPedido } from '@/lib/adminStore'
import { useUI } from '@/context/UIContext'
import { SITE } from '@/config/site'
import { cn, formatARS } from '@/lib/format'
import type { Producto } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  productos: Producto[]
  onCreado: (id: number) => void
}

const METODOS = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'mercadopago', label: 'Mercado Pago' },
  { id: 'tarjeta', label: 'Tarjeta' },
  { id: 'whatsapp', label: 'A coordinar' },
]

const ESTADOS_INICIALES = [
  { id: 'entregado', label: 'Vendido en el local', hint: 'Ya cobrado y entregado' },
  { id: 'pagado', label: 'Cobrado, falta entregar', hint: 'Queda para preparar' },
  { id: 'pendiente', label: 'Falta cobrar', hint: 'Queda esperando el pago' },
]

/** Precio con el descuento que corresponde al medio de pago. */
const precioPara = (p: Producto, metodo: string) =>
  metodo === 'transferencia' || metodo === 'efectivo' ? Math.max(0, p.precio - SITE.transferDiscount) : p.precio

/** Cargar una venta del local o un pedido que llegó por Instagram o WhatsApp, con uno o varios pares. */
export function PedidoNuevo({ open, onClose, productos, onCreado }: Props) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [items, setItems] = useState<ItemPedido[]>([])
  const [prodId, setProdId] = useState('')
  const [talle, setTalle] = useState('')
  const [metodo, setMetodo] = useState('efectivo')
  const [estado, setEstado] = useState('entregado')
  const [entrega, setEntrega] = useState<'envio' | 'retiro'>('retiro')
  const [direccion, setDireccion] = useState('')
  const [descuento, setDescuento] = useState('')
  const [error, setError] = useState('')
  const { toast } = useUI()

  const ordenados = useMemo(() => [...productos].filter((p) => !p.oculto).sort((a, b) => a.nombre.localeCompare(b.nombre)), [productos])
  const prod = productos.find((p) => String(p.id) === prodId)
  const subtotal = items.reduce((a, i) => a + i.precio_unit * i.cantidad, 0)
  const desc = Math.min(subtotal, Math.max(0, Number(descuento) || 0))
  const total = subtotal - desc

  const cambiarMetodo = (m: string) => {
    setMetodo(m)
    setItems((list) =>
      list.map((i) => {
        const p = productos.find((x) => x.id === i.producto_id)
        return p ? { ...i, precio_unit: precioPara(p, m) } : i
      }),
    )
  }

  const agregar = () => {
    if (!prod) return setError('Elegí un modelo.')
    if (!talle) return setError('Elegí el talle.')
    setError('')
    setItems((list) => {
      const k = list.findIndex((i) => i.producto_id === prod.id && i.talle === talle)
      if (k >= 0) return list.map((i, n) => (n === k ? { ...i, cantidad: i.cantidad + 1 } : i))
      return [...list, { producto_id: prod.id, nombre: prod.nombre, marca: prod.marca, talle, cantidad: 1, precio_unit: precioPara(prod, metodo) }]
    })
    setTalle('')
  }

  const limpiar = () => {
    setNombre('')
    setTelefono('')
    setEmail('')
    setItems([])
    setProdId('')
    setTalle('')
    setDireccion('')
    setDescuento('')
    setError('')
  }

  const guardar = () => {
    if (items.length === 0) return setError('Agregá al menos un par.')
    if (entrega === 'envio' && !direccion.trim()) return setError('Falta la dirección del envío.')
    const id = crearPedidoManual(
      {
        cliente: { nombre: nombre.trim() || 'Cliente del local', telefono: telefono.trim(), email: email.trim() || undefined },
        items,
        metodo_pago: metodo,
        entrega,
        direccion: entrega === 'envio' ? direccion.trim() : undefined,
        notas: entrega === 'envio' ? `Envío: ${direccion.trim()}` : 'Retiro en tienda',
        estado,
        total,
        descuento: desc || undefined,
      },
      productos,
    )
    toast(estado === 'pendiente' ? `Pedido #${id} cargado` : `Venta #${id} cargada · stock descontado`)
    limpiar()
    onClose()
    onCreado(id)
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva venta" size="lg">
      <div className="space-y-5 px-5 py-5 sm:px-8">
        <p className="body-text">Para ventas en el local o pedidos que llegan por Instagram o WhatsApp.</p>

        <section className="space-y-3">
          <h3 className="label text-index">Pares</h3>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
            <select
              aria-label="Modelo"
              className="field-line normal-case"
              value={prodId}
              onChange={(e) => {
                setProdId(e.target.value)
                setTalle('')
              }}
            >
              <option value="">Elegí un modelo…</option>
              {ordenados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <select aria-label="Talle" className="field-line normal-case" value={talle} onChange={(e) => setTalle(e.target.value)} disabled={!prod}>
              <option value="">Talle</option>
              {prod?.stock.map((s) => (
                <option key={s.talle} value={s.talle} disabled={s.cantidad <= 0}>
                  {s.talle} {s.cantidad <= 0 ? '(sin stock)' : `(${s.cantidad})`}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={agregar}>
              <Icon name="plus" size={15} className="mr-2" /> Agregar
            </Button>
          </div>
          {items.length > 0 && (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {items.map((i, n) => (
                <li key={`${i.producto_id}-${i.talle}`} className="flex items-center gap-3 px-4 py-3 text-[13.5px]">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{i.nombre}</span>
                    <span className="text-[12px] text-index">
                      Talle {i.talle} · {formatARS(i.precio_unit)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <button
                      aria-label="Restar"
                      onClick={() =>
                        setItems((l) => l.flatMap((x, k) => (k !== n ? [x] : x.cantidad > 1 ? [{ ...x, cantidad: x.cantidad - 1 }] : [])))
                      }
                      className="grid size-7 place-items-center rounded-full border border-line"
                    >
                      <Icon name={i.cantidad > 1 ? 'minus' : 'trash'} size={12} />
                    </button>
                    <span className="w-6 text-center font-semibold">{i.cantidad}</span>
                    <button
                      aria-label="Sumar"
                      onClick={() => setItems((l) => l.map((x, k) => (k === n ? { ...x, cantidad: x.cantidad + 1 } : x)))}
                      className="grid size-7 place-items-center rounded-full border border-line"
                    >
                      <Icon name="plus" size={12} />
                    </button>
                  </span>
                  <span className="w-24 shrink-0 text-right font-semibold">{formatARS(i.precio_unit * i.cantidad)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="label text-index">Estado</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {ESTADOS_INICIALES.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEstado(e.id)}
                aria-pressed={estado === e.id}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left',
                  estado === e.id ? 'border-accent bg-accent/10' : 'border-line bg-card hover:border-control',
                )}
              >
                <span className="block text-[13.5px] font-semibold">{e.label}</span>
                <span className="block text-[12px] text-index">{e.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Pago">
            <select className="field-line normal-case" value={metodo} onChange={(e) => cambiarMetodo(e.target.value)}>
              {METODOS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Entrega">
            <select className="field-line normal-case" value={entrega} onChange={(e) => setEntrega(e.target.value as 'envio' | 'retiro')}>
              <option value="retiro">En el local</option>
              <option value="envio">Envío</option>
            </select>
          </Field>
          <Field label="Descuento extra ($)">
            <input className="field-line" type="number" min={0} inputMode="numeric" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
          </Field>
        </div>
        {entrega === 'envio' && (
          <Field label="Dirección">
            <input className="field-line normal-case" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </Field>
        )}

        <details className="rounded-xl border border-line px-4 py-3" open={entrega === 'envio' || undefined}>
          <summary className="cursor-pointer text-[13px] font-medium">Datos del cliente (opcional)</summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Field label="Nombre">
              <input className="field-line normal-case" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Field>
            <Field label="Teléfono">
              <input className="field-line normal-case" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </Field>
            <Field label="Email">
              <input className="field-line normal-case" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </div>
        </details>

        {error && (
          <p role="alert" className="label text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <div className="text-[13px] text-index">
            {desc > 0 && (
              <span className="block">
                Subtotal {formatARS(subtotal)} · descuento −{formatARS(desc)}
              </span>
            )}
            Total <span className="ml-2 font-display text-xl font-bold text-ink">{formatARS(total)}</span>
          </div>
          <Button onClick={guardar}>{estado === 'pendiente' ? 'Cargar pedido' : 'Registrar venta'}</Button>
        </div>
      </div>
    </Modal>
  )
}
