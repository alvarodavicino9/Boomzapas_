import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field } from './ui'
import { crearPedidoManual } from '@/lib/adminStore'
import { useUI } from '@/context/UIContext'
import { SITE } from '@/config/site'
import { formatARS } from '@/lib/format'
import type { Producto } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  productos: Producto[]
  onCreado: (id: number) => void
}

/** Cargar a mano un pedido que llegó por Instagram, WhatsApp o en el local. */
export function PedidoNuevo({ open, onClose, productos, onCreado }: Props) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [prodId, setProdId] = useState('')
  const [talle, setTalle] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [metodo, setMetodo] = useState('transferencia')
  const [entrega, setEntrega] = useState<'envio' | 'retiro'>('retiro')
  const [direccion, setDireccion] = useState('')
  const [error, setError] = useState('')
  const { toast } = useUI()

  const prod = useMemo(() => productos.find((p) => String(p.id) === prodId), [productos, prodId])
  const precio = prod ? (metodo === 'transferencia' ? Math.max(0, prod.precio - SITE.transferDiscount) : prod.precio) : 0

  const guardar = () => {
    if (!nombre.trim()) return setError('Poné el nombre del cliente.')
    if (!prod) return setError('Elegí un modelo.')
    if (!talle) return setError('Elegí un talle.')
    if (entrega === 'envio' && !direccion.trim()) return setError('Falta la dirección del envío.')
    const id = crearPedidoManual({
      cliente: { nombre: nombre.trim(), telefono: telefono.trim() },
      items: [{ producto_id: prod.id, nombre: prod.nombre, marca: prod.marca, talle, cantidad, precio_unit: precio }],
      metodo_pago: metodo,
      entrega,
      direccion: entrega === 'envio' ? direccion.trim() : undefined,
      notas: entrega === 'envio' ? `Envío: ${direccion.trim()}` : 'Retiro en tienda',
      estado: 'pendiente',
      total: precio * cantidad,
    })
    toast(`Pedido #${id} cargado`)
    setNombre('')
    setTelefono('')
    setProdId('')
    setTalle('')
    setCantidad(1)
    setDireccion('')
    setError('')
    onClose()
    onCreado(id)
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo pedido" size="md">
      <div className="space-y-4 px-5 py-5 sm:px-8">
        <p className="body-text">Para pedidos que llegan por Instagram, WhatsApp o en el local.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cliente">
            <input className="field-line normal-case" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
          </Field>
          <Field label="Teléfono">
            <input className="field-line normal-case" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </Field>
        </div>
        <Field label="Modelo">
          <select
            className="field-line normal-case"
            value={prodId}
            onChange={(e) => {
              setProdId(e.target.value)
              setTalle('')
            }}
          >
            <option value="">Elegí un modelo…</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Talle">
            <select className="field-line normal-case" value={talle} onChange={(e) => setTalle(e.target.value)} disabled={!prod}>
              <option value="">—</option>
              {prod?.stock.map((s) => (
                <option key={s.talle} value={s.talle}>
                  {s.talle} {s.cantidad <= 0 ? '(sin stock)' : `(${s.cantidad})`}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cantidad">
            <input
              className="field-line"
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Pago">
            <select className="field-line normal-case" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              <option value="transferencia">Transferencia / efectivo</option>
              <option value="mercadopago">Mercado Pago</option>
              <option value="whatsapp">A coordinar</option>
            </select>
          </Field>
          <Field label="Entrega">
            <select className="field-line normal-case" value={entrega} onChange={(e) => setEntrega(e.target.value as 'envio' | 'retiro')}>
              <option value="retiro">Retiro en tienda</option>
              <option value="envio">Envío</option>
            </select>
          </Field>
        </div>
        {entrega === 'envio' && (
          <Field label="Dirección">
            <input className="field-line normal-case" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </Field>
        )}
        {error && (
          <p role="alert" className="label text-danger">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
          <p className="text-[13px] text-index">
            Total <span className="ml-2 font-display text-xl font-bold text-ink">{formatARS(precio * cantidad)}</span>
          </p>
          <Button onClick={guardar}>Cargar pedido</Button>
        </div>
      </div>
    </Modal>
  )
}
