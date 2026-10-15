import { useMemo } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card, Empty, EstadoBadge, ESTADO_COLOR, PageTitle, estadoLabel } from './ui'
import { alertasDeStock, calcularResumen, metodoLabel } from '@/lib/adminStats'
import { cn, formatARS, formatDate } from '@/lib/format'
import type { PedidoAdmin } from '@/lib/adminStore'
import type { Producto } from '@/types'
import type { AdminNav } from './types'

interface ResumenProps {
  pedidos: PedidoAdmin[]
  productos: Producto[]
  resenasPendientes: number
  nav: AdminNav
}

function Kpi({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string
  value: string
  sub?: React.ReactNode
  icon: IconName
  tone?: 'accent'
}) {
  return (
    <div className="surface border border-line p-5">
      <div className="flex items-center justify-between">
        <p className="label text-index">{label}</p>
        <span className={cn('grid h-8 w-8 place-items-center rounded-full', tone === 'accent' ? 'bg-accent text-on-accent' : 'bg-stage')}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="mt-4 whitespace-nowrap font-display text-[1.05rem] font-bold leading-none tracking-tight min-[420px]:text-[1.3rem] sm:text-[1.7rem] lg:text-[1.55rem] xl:text-[2rem]">{value}</p>
      {sub && <p className="mt-2 text-[12.5px] text-index">{sub}</p>}
    </div>
  )
}

export function Resumen({ pedidos, productos, resenasPendientes, nav }: ResumenProps) {
  const r = useMemo(() => calcularResumen(pedidos), [pedidos])
  const alertas = useMemo(() => alertasDeStock(productos), [productos])
  const agotados = alertas.filter((a) => a.total <= 0).length
  const max = Math.max(1, ...r.serie.map((d) => d.total))
  const total14 = r.serie.reduce((a, d) => a + d.total, 0)
  const recientes = pedidos.slice(0, 5)

  const avisos: { icon: IconName; text: string; cta: string; go: () => void }[] = []
  if (r.pendientes > 0)
    avisos.push({
      icon: 'clock',
      text: `${r.pendientes} ${r.pendientes === 1 ? 'pedido espera' : 'pedidos esperan'} el pago (${formatARS(r.porCobrar)})`,
      cta: 'Ver',
      go: () => nav('pedidos', 'pendiente'),
    })
  if (r.porEnviar > 0)
    avisos.push({
      icon: 'truck',
      text: `${r.porEnviar} ${r.porEnviar === 1 ? 'pedido pago' : 'pedidos pagos'} para preparar y enviar`,
      cta: 'Ver',
      go: () => nav('pedidos', 'pagado'),
    })
  if (alertas.length > 0)
    avisos.push({
      icon: 'alert',
      text: `${alertas.length} ${alertas.length === 1 ? 'modelo' : 'modelos'} para reponer${agotados ? ` (${agotados} agotados)` : ''}`,
      cta: 'Revisar',
      go: () => nav('productos', 'bajo'),
    })
  if (resenasPendientes > 0)
    avisos.push({
      icon: 'star',
      text: `${resenasPendientes} ${resenasPendientes === 1 ? 'reseña' : 'reseñas'} para revisar`,
      cta: 'Ver',
      go: () => nav('resenas'),
    })

  return (
    <div>
      <PageTitle title="Resumen" subtitle="Cómo viene el negocio, de un vistazo." />

      {avisos.length > 0 && (
        <ul className="mb-6 grid gap-2 lg:grid-cols-2">
          {avisos.map((a) => (
            <li key={a.text} className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
              <Icon name={a.icon} size={18} className="shrink-0 text-accent-soft" />
              <span className="min-w-0 flex-1 text-[13px] leading-5">{a.text}</span>
              <button onClick={a.go} className="label shrink-0 text-accent-soft hover:underline hover:underline-offset-4">
                {a.cta}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi
          label="Ingresos"
          icon="trend"
          tone="accent"
          value={formatARS(r.ingresos)}
          sub={
            r.delta === null ? (
              'Pagados, enviados y entregados'
            ) : (
              <span className={r.delta >= 0 ? 'text-[#3fbf7f]' : 'text-danger'}>
                {r.delta >= 0 ? '▲' : '▼'} {Math.abs(r.delta).toFixed(0)}% <span className="text-index">vs semana anterior</span>
              </span>
            )
          }
        />
        <Kpi label="Ventas" icon="bag" value={String(r.ventas)} sub={`${pedidos.length} pedidos en total`} />
        <Kpi label="Ticket promedio" icon="receipt" value={formatARS(r.ticket)} sub="Por pedido concretado" />
        <Kpi label="Por cobrar" icon="clock" value={formatARS(r.porCobrar)} sub={`${r.pendientes} pedidos pendientes`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card title="Ventas de los últimos 14 días" hint={`${formatARS(total14)} · últimos 7 días: ${formatARS(r.ingresos7)}`}>
          <div className="flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label="Gráfico de ventas por día">
            {r.serie.map((d, i) => {
              const h = d.total > 0 ? Math.max(6, (d.total / max) * 100) : 2
              const ultimo = i === r.serie.length - 1
              return (
                <div key={d.inicio} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-colors',
                      d.total === 0 ? 'bg-line' : ultimo ? 'bg-accent-soft' : 'bg-accent/70 group-hover:bg-accent',
                    )}
                    style={{ height: `${h}%` }}
                  />
                  <span className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-bar px-3 py-1.5 text-[11.5px] text-white shadow-lift group-hover:block">
                    {d.label} · {formatARS(d.total)} · {d.pedidos} {d.pedidos === 1 ? 'venta' : 'ventas'}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex gap-1.5 sm:gap-2">
            {r.serie.map((d, i) => (
              <span key={d.inicio} className="flex-1 text-center text-[10px] leading-3 text-index">
                <span className={cn(i % 2 === (r.serie.length - 1) % 2 ? '' : 'hidden sm:inline')}>{d.label.split(' ')[0]}</span>
              </span>
            ))}
          </div>
        </Card>

        <Card title="Pedidos por estado">
          {pedidos.length === 0 ? (
            <Empty>Todavía no hay pedidos.</Empty>
          ) : (
            <>
              <div className="flex h-3 overflow-hidden rounded-full bg-stage">
                {r.porEstado
                  .filter((e) => e.cantidad > 0)
                  .map((e) => (
                    <span
                      key={e.estado}
                      title={`${estadoLabel(e.estado)}: ${e.cantidad}`}
                      style={{ width: `${(e.cantidad / pedidos.length) * 100}%`, background: ESTADO_COLOR[e.estado] ?? '#8a7d80' }}
                    />
                  ))}
              </div>
              <ul className="mt-4 space-y-1">
                {r.porEstado.map((e) => (
                  <li key={e.estado}>
                    <button
                      onClick={() => nav('pedidos', e.estado)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-[13px] hover:bg-stage"
                    >
                      <EstadoBadge estado={e.estado} />
                      <span className="font-display text-lg">{e.cantidad}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Modelos más vendidos">
          {r.topProductos.length === 0 ? (
            <Empty>Sin ventas todavía.</Empty>
          ) : (
            <ol className="space-y-3">
              {r.topProductos.map((p, i) => (
                <li key={p.nombre} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-stage text-[12px] font-semibold">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{p.nombre}</p>
                    <p className="text-[12px] text-index">{p.marca}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold">{p.unidades} u.</p>
                    <p className="text-[12px] text-index">{formatARS(p.ingresos)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Marcas y medios de pago">
          {r.topMarcas.length === 0 ? (
            <Empty>Sin ventas todavía.</Empty>
          ) : (
            <div className="space-y-5">
              <ul className="space-y-3">
                {r.topMarcas.map((m) => (
                  <li key={m.marca}>
                    <div className="mb-1 flex justify-between text-[12.5px]">
                      <span>{m.marca}</span>
                      <span className="text-index">{formatARS(m.ingresos)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-stage">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(m.ingresos / r.topMarcas[0].ingresos) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2 border-t border-line pt-4">
                {r.porMetodo.map((m) => (
                  <li key={m.metodo} className="flex justify-between text-[12.5px]">
                    <span>{metodoLabel(m.metodo)}</span>
                    <span className="text-index">
                      {m.cantidad} · {formatARS(m.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card
          title="Para reponer"
          action={
            alertas.length > 0 ? (
              <button onClick={() => nav('productos', 'bajo')} className="label text-accent-soft hover:underline hover:underline-offset-4">
                Ver todo
              </button>
            ) : undefined
          }
        >
          {alertas.length === 0 ? (
            <Empty>Todo el stock está en orden.</Empty>
          ) : (
            <ul className="space-y-3">
              {alertas.slice(0, 6).map((a) => (
                <li key={a.producto.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{a.producto.nombre}</span>
                    <span className="block truncate text-[12px] text-index">
                      {a.agotados.length > 0 ? `Sin stock en T${a.agotados.slice(0, 4).join(', T')}${a.agotados.length > 4 ? '…' : ''}` : 'Quedan pocos pares'}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold',
                      a.total <= 0 ? 'bg-danger/15 text-danger' : 'bg-[#f0a93b]/15 text-[#f0a93b]',
                    )}
                  >
                    {a.total <= 0 ? 'Agotado' : `${a.total} ${a.total === 1 ? 'par' : 'pares'}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        className="mt-4"
        title="Últimos pedidos"
        pad={false}
        action={
          <Button variant="outline" size="sm" onClick={() => nav('pedidos')}>
            Ver todos
          </Button>
        }
      >
        {recientes.length === 0 ? (
          <div className="p-5">
            <Empty>Todavía no hay pedidos.</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-line px-2 pb-2 pt-2 sm:px-3">
            {recientes.map((p) => (
              <li key={String(p.id)}>
                <button
                  onClick={() => nav('pedidos', undefined, p.id)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-xl px-3 py-3 text-left hover:bg-stage sm:grid-cols-[70px_1.2fr_1.4fr_auto_auto]"
                >
                  <span className="font-display text-lg">#{String(p.id)}</span>
                  <span className="col-start-1 truncate text-[13.5px] font-medium sm:col-start-auto">{p.cliente.nombre}</span>
                  <span className="hidden truncate text-[12.5px] text-index sm:block">
                    {p.items.map((i) => i.nombre).join(', ') || formatDate(p.fecha)}
                  </span>
                  <span className="col-start-2 row-start-1 text-right text-[13.5px] font-semibold sm:col-start-auto sm:row-start-auto">
                    {formatARS(p.total)}
                  </span>
                  <EstadoBadge estado={p.estado} className="col-start-2 row-start-2 justify-self-end sm:col-start-auto sm:row-start-auto" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
