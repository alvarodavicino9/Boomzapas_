import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Drawer, Empty, EstadoBadge, PageTitle, Pills, SearchBox, estadoLabel } from './ui'
import { PedidoNuevo } from './PedidoNuevo'
import { useUI } from '@/context/UIContext'
import { ESTADOS, actualizarPedido, eliminarPedido, type PedidoAdmin } from '@/lib/adminStore'
import { descargarCSV, metodoLabel } from '@/lib/adminStats'
import { MODO_DEMO } from '@/lib/api'
import { SITE } from '@/config/site'
import { cn, formatARS, formatDate } from '@/lib/format'
import { waCliente } from '@/lib/whatsapp'
import type { Producto } from '@/types'

interface PedidosProps {
  pedidos: PedidoAdmin[]
  productos: Producto[]
  filtroInicial?: string
  abrirId?: number | string
  onEstado: (p: PedidoAdmin, estado: string) => Promise<void>
}

/** Siguiente paso natural de cada pedido. */
const SIGUIENTE: Record<string, { estado: string; label: string } | undefined> = {
  pendiente: { estado: 'pagado', label: 'Marcar como pagado' },
  pagado: { estado: 'enviado', label: 'Marcar como enviado' },
  enviado: { estado: 'entregado', label: 'Marcar como entregado' },
}

const resumenItems = (p: PedidoAdmin) =>
  p.items.length ? p.items.map((i) => `${i.nombre} (T${i.talle}${i.cantidad > 1 ? ` x${i.cantidad}` : ''})`).join(', ') : '—'

function mensajeParaCliente(p: PedidoAdmin): string {
  const nombre = p.cliente.nombre.split(' ')[0]
  const prod = p.items.map((i) => `${i.nombre} T${i.talle}`).join(' + ')
  const ref = `pedido #${p.id}${prod ? ` (${prod})` : ''}`
  switch (p.estado) {
    case 'pagado':
      return `Hola ${nombre}! Recibimos tu pago ✅ Ya estamos preparando tu ${ref}. Te avisamos cuando salga.`
    case 'enviado':
      return `Hola ${nombre}! Tu ${ref} ya fue despachado por Correo Argentino 📦. Te paso el código de seguimiento: `
    case 'entregado':
      return `Hola ${nombre}! ¿Cómo te fueron las zapatillas? Si te gustaron, nos ayudaría mucho una reseña en la web 🙌`
    case 'cancelado':
      return `Hola ${nombre}! Te escribimos de Boom Zapas: tuvimos que cancelar tu ${ref}. Cualquier duda, escribinos.`
    default:
      return `Hola ${nombre}! Te escribimos de Boom Zapas por tu ${ref}. Total: ${formatARS(p.total)}. Para abonar: alias ${SITE.bank.alias} (${SITE.bank.holder}). Cuando transfieras, mandanos el comprobante 🙏`
  }
}

export function Pedidos({ pedidos, productos, filtroInicial, abrirId, onEstado }: PedidosProps) {
  const [filtro, setFiltro] = useState<string>(filtroInicial ?? 'todos')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<PedidoAdmin['id'] | null>(abrirId ?? null)
  const [nuevo, setNuevo] = useState(false)
  const { toast } = useUI()

  useEffect(() => {
    if (filtroInicial) setFiltro(filtroInicial)
  }, [filtroInicial])
  useEffect(() => {
    if (abrirId !== undefined) setSel(abrirId)
  }, [abrirId])

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return pedidos.filter((p) => {
      if (filtro !== 'todos' && p.estado !== filtro) return false
      if (!t) return true
      return `${p.id} ${p.cliente.nombre} ${p.cliente.telefono} ${resumenItems(p)}`.toLowerCase().includes(t)
    })
  }, [pedidos, filtro, q])

  const conteo = (e: string) => pedidos.filter((p) => p.estado === e).length
  const actual = pedidos.find((p) => p.id === sel) ?? null

  const cambiar = async (p: PedidoAdmin, estado: string) => {
    try {
      await onEstado(p, estado)
      toast(`Pedido #${p.id} · ${estadoLabel(estado)}`)
    } catch {
      toast('No se pudo actualizar el pedido')
    }
  }

  const exportar = () => {
    descargarCSV(`pedidos-boomzapas-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Productos', 'Pago', 'Entrega', 'Total', 'Estado'],
      ...lista.map((p) => [
        p.id,
        formatDate(p.fecha),
        p.cliente.nombre,
        p.cliente.telefono,
        resumenItems(p),
        metodoLabel(p.metodo_pago),
        p.entrega === 'envio' ? 'Envío' : 'Retiro',
        p.total,
        estadoLabel(p.estado),
      ]),
    ])
    toast(`${lista.length} pedidos exportados`)
  }

  return (
    <div>
      <PageTitle
        title="Pedidos"
        subtitle={`${pedidos.length} en total · ${conteo('pendiente')} esperando pago`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportar} disabled={lista.length === 0}>
              <Icon name="download" size={15} className="mr-2" /> CSV
            </Button>
            {MODO_DEMO && (
              <Button size="sm" onClick={() => setNuevo(true)}>
                <Icon name="plus" size={15} className="mr-2" /> Nuevo pedido
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-5 flex flex-col gap-3">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="w-max sm:w-auto">
            <Pills
              value={filtro}
              onChange={setFiltro}
              options={[
                { id: 'todos', label: 'Todos', count: pedidos.length },
                ...ESTADOS.map((e) => ({ id: e, label: estadoLabel(e), count: conteo(e) })),
              ]}
            />
          </div>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Buscar cliente, teléfono, # o modelo" />
      </div>

      {lista.length === 0 ? (
        <Empty>{pedidos.length === 0 ? 'Todavía no hay pedidos.' : 'No hay pedidos con ese filtro.'}</Empty>
      ) : (
        <div className="surface border border-line">
          <div className="label hidden grid-cols-[70px_110px_1.1fr_1.6fr_120px_110px_150px] gap-4 border-b border-line px-5 py-3 text-index lg:grid">
            <span>#</span>
            <span>Fecha</span>
            <span>Cliente</span>
            <span>Productos</span>
            <span>Pago</span>
            <span className="text-right">Total</span>
            <span className="text-right">Estado</span>
          </div>
          <ul className="divide-y divide-line">
            {lista.map((p) => (
              <li key={String(p.id)}>
                <button
                  onClick={() => setSel(p.id)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-5 py-4 text-left transition-colors hover:bg-stage lg:grid-cols-[70px_110px_1.1fr_1.6fr_120px_110px_150px]"
                >
                  <span className="font-display text-lg lg:text-base">#{String(p.id)}</span>
                  <span className="col-start-2 row-start-1 text-right text-[13.5px] font-semibold lg:hidden">{formatARS(p.total)}</span>
                  <span className="hidden text-[12.5px] text-index lg:block">{formatDate(p.fecha)}</span>
                  <span className="col-span-2 min-w-0 lg:col-span-1">
                    <span className="block truncate text-[13.5px] font-medium">{p.cliente.nombre}</span>
                    <span className="block truncate text-[12px] text-index lg:hidden">{resumenItems(p)}</span>
                    <span className="hidden text-[12px] text-index lg:block">{p.cliente.telefono}</span>
                  </span>
                  <span className="hidden truncate text-[12.5px] text-index lg:block" title={resumenItems(p)}>
                    {resumenItems(p)}
                  </span>
                  <span className="hidden text-[12.5px] lg:block">{metodoLabel(p.metodo_pago)}</span>
                  <span className="hidden text-right text-[13.5px] font-semibold lg:block">{formatARS(p.total)}</span>
                  <span className="col-span-2 flex items-center justify-between gap-3 lg:col-span-1 lg:justify-end">
                    <span className="text-[12px] text-index lg:hidden">{formatDate(p.fecha)}</span>
                    <EstadoBadge estado={p.estado} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Drawer
        open={!!actual}
        onClose={() => setSel(null)}
        title={actual ? `Pedido #${actual.id}` : ''}
        subtitle={actual ? formatDate(actual.fecha) : undefined}
        footer={
          actual && (
            <div className="flex flex-wrap gap-2">
              {SIGUIENTE[actual.estado] && (
                <Button className="flex-1" onClick={() => cambiar(actual, SIGUIENTE[actual.estado]!.estado)}>
                  {SIGUIENTE[actual.estado]!.label}
                </Button>
              )}
              {actual.cliente.telefono && (
                <Button
                  variant="outline"
                  className="flex-1"
                  href={waCliente(actual.cliente.telefono, mensajeParaCliente(actual))}
                >
                  <Icon name="whatsapp" size={16} className="mr-2" /> Escribirle
                </Button>
              )}
            </div>
          )
        }
      >
        {actual && <DetallePedido p={actual} onEstado={cambiar} onCerrar={() => setSel(null)} />}
      </Drawer>

      <PedidoNuevo open={nuevo} onClose={() => setNuevo(false)} productos={productos} onCreado={(id) => setSel(id)} />
    </div>
  )
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line pb-5 last:border-0">
      <h3 className="label mb-3 text-index">{titulo}</h3>
      {children}
    </section>
  )
}

function DetallePedido({
  p,
  onEstado,
  onCerrar,
}: {
  p: PedidoAdmin
  onEstado: (p: PedidoAdmin, e: string) => void
  onCerrar: () => void
}) {
  const [nota, setNota] = useState(p.nota_interna ?? '')
  const [borrar, setBorrar] = useState(false)
  const { toast } = useUI()
  useEffect(() => {
    setNota(p.nota_interna ?? '')
    setBorrar(false)
  }, [p.id, p.nota_interna])

  const pasos = ESTADOS.filter((e) => e !== 'cancelado')
  const idx = pasos.indexOf(p.estado as (typeof pasos)[number])

  return (
    <div className="space-y-5">
      <div>
        <ol className="flex items-center" aria-label="Avance del pedido">
          {pasos.map((e, i) => (
            <li key={e} className="flex flex-1 items-center last:flex-none">
              <span
                title={estadoLabel(e)}
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px]',
                  p.estado === 'cancelado'
                    ? 'border-line text-index'
                    : i <= idx
                      ? 'border-accent bg-accent text-on-accent'
                      : 'border-line text-index',
                )}
              >
                {i <= idx && p.estado !== 'cancelado' ? <Icon name="check" size={13} /> : i + 1}
              </span>
              {i < pasos.length - 1 && <span className={cn('mx-1 h-px flex-1', i < idx ? 'bg-accent' : 'bg-line')} />}
            </li>
          ))}
        </ol>
        <div className="mt-2 flex items-center justify-between">
          <EstadoBadge estado={p.estado} />
          <select
            value={p.estado}
            onChange={(e) => onEstado(p, e.target.value)}
            aria-label="Cambiar estado"
            className="field-line normal-case !h-9 !w-auto !py-0 !text-[12.5px]"
          >
            {!ESTADOS.includes(p.estado as never) && <option value={p.estado}>{estadoLabel(p.estado)}</option>}
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {estadoLabel(e)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Bloque titulo="Cliente">
        <p className="text-[14.5px] font-semibold">{p.cliente.nombre}</p>
        <p className="mt-1 text-[13px] text-index">{p.cliente.telefono || 'Sin teléfono'}</p>
        {p.cliente.email && <p className="text-[13px] text-index">{p.cliente.email}</p>}
      </Bloque>

      <Bloque titulo="Productos">
        {p.items.length === 0 ? (
          <p className="text-[13px] text-index">El servidor no envió el detalle de productos de este pedido.</p>
        ) : (
          <ul className="space-y-3">
            {p.items.map((i, k) => (
              <li key={k} className="flex items-start justify-between gap-4 text-[13.5px]">
                <span>
                  {i.nombre}
                  <span className="block text-[12px] text-index">
                    {i.marca && `${i.marca} · `}Talle {i.talle} · x{i.cantidad}
                  </span>
                </span>
                <span className="shrink-0 font-medium">{formatARS(i.precio_unit * i.cantidad)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="label text-index">Total</span>
          <span className="font-display text-xl font-bold">{formatARS(p.total)}</span>
        </div>
      </Bloque>

      <Bloque titulo="Pago y entrega">
        <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-[13.5px]">
          <dt className="text-index">Pago</dt>
          <dd>{metodoLabel(p.metodo_pago)}</dd>
          <dt className="text-index">Entrega</dt>
          <dd>{p.entrega === 'envio' ? 'Envío por Correo Argentino' : `Retiro en ${SITE.address}`}</dd>
          {p.direccion && (
            <>
              <dt className="text-index">Dirección</dt>
              <dd>{p.direccion}</dd>
            </>
          )}
          {p.notas && (
            <>
              <dt className="text-index">Notas</dt>
              <dd>{p.notas}</dd>
            </>
          )}
        </dl>
      </Bloque>

      {MODO_DEMO && (
        <Bloque titulo="Nota interna">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onBlur={() => nota !== (p.nota_interna ?? '') && (actualizarPedido(p.id, { nota_interna: nota }), toast('Nota guardada'))}
            rows={3}
            placeholder="Ej: pidió cambio de talle, código de seguimiento…"
            className="field-line normal-case"
          />
        </Bloque>
      )}

      {MODO_DEMO && (
        <div>
          {borrar ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  eliminarPedido(p.id)
                  onCerrar()
                  toast(`Pedido #${p.id} eliminado`)
                }}
                className="!border-danger !text-danger"
              >
                Sí, eliminar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBorrar(false)}>
                No
              </Button>
            </div>
          ) : (
            <button onClick={() => setBorrar(true)} className="label inline-flex items-center gap-2 text-index hover:text-danger">
              <Icon name="trash" size={15} /> Eliminar pedido
            </button>
          )}
        </div>
      )}
    </div>
  )
}
