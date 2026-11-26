import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Avatar, Card, Empty, Etiqueta, PageTitle, SearchBox } from './ui'
import { agruparClientes, descargarCSV } from '@/lib/adminStats'
import type { PedidoAdmin } from '@/lib/adminStore'
import { formatARS, formatDate } from '@/lib/format'
import { waCliente } from '@/lib/whatsapp'
import { useUI } from '@/context/UIContext'

export function Clientes({ pedidos }: { pedidos: PedidoAdmin[] }) {
  const [q, setQ] = useState('')
  const { toast } = useUI()
  const todos = useMemo(() => agruparClientes(pedidos), [pedidos])
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? todos.filter((c) => `${c.nombre} ${c.telefono}`.toLowerCase().includes(t)) : todos
  }, [todos, q])
  const recurrentes = todos.filter((c) => c.pedidos >= 2).length

  const exportar = () => {
    descargarCSV('clientes-boomzapas.csv', [
      ['Cliente', 'Teléfono', 'Email', 'Pedidos', 'Pares', 'Gastado', 'Último pedido'],
      ...lista.map((c) => [c.nombre, c.telefono, c.email ?? '', c.pedidos, c.pares, c.gastado, formatDate(c.ultimo)]),
    ])
    toast(`${lista.length} clientes exportados`)
  }

  return (
    <div>
      <PageTitle
        title="Clientes"
        subtitle="Armado a partir de los pedidos (sin contar los cancelados)."
        action={
          <Button variant="outline" size="sm" onClick={exportar} disabled={lista.length === 0}>
            <Icon name="download" size={15} className="mr-2" /> CSV
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { l: 'Clientes', v: String(todos.length), s: todos.length ? 'que ya compraron' : 'Todavía ninguno', c: '#4aa3ff' },
          {
            l: 'Recurrentes',
            v: String(recurrentes),
            s: todos.length ? `${Math.round((recurrentes / todos.length) * 100)}% volvió a comprar` : '—',
            c: '#3fbf7f',
          },
          { l: 'Mejor cliente', v: todos[0] ? todos[0].nombre.split(' ')[0] : '—', s: todos[0] ? formatARS(todos[0].gastado) : '—', c: '#f0a93b' },
        ].map((k) => (
          <div key={k.l} className="surface relative overflow-hidden border border-line p-4 sm:p-5">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${k.c}, transparent)` }} />
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-index">{k.l}</p>
            <p className="mt-2.5 truncate font-display text-xl font-bold leading-none sm:text-2xl">{k.v}</p>
            <p className="mt-1.5 truncate text-[12px] text-index">{k.s}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} placeholder="Buscar cliente o teléfono" />
      </div>

      {lista.length === 0 ? (
        <Empty>{todos.length === 0 ? 'Todavía no hay clientes.' : 'No encontramos a nadie con esa búsqueda.'}</Empty>
      ) : (
        <Card pad={false} className="overflow-hidden">
          <div className="cabecera-tabla hidden grid-cols-[minmax(0,2fr)_90px_80px_150px_130px_48px] items-center gap-4 border-b border-line px-5 py-3 md:grid">
            <span>Cliente</span>
            <span className="text-right">Pedidos</span>
            <span className="text-right">Pares</span>
            <span>Último pedido</span>
            <span className="text-right">Gastado</span>
            <span />
          </div>
          <ul className="divide-y divide-line">
            {lista.map((c) => (
              <li
                key={c.clave}
                className="fila-panel grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 px-4 py-3.5 sm:px-5 md:grid-cols-[minmax(0,2fr)_90px_80px_150px_130px_48px] md:gap-4"
              >
                <span className="flex min-w-0 items-center gap-3.5 md:col-span-1">
                  <Avatar nombre={c.nombre} size={42} />
                  <span className="hidden min-w-0 md:block">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-semibold">{c.nombre}</span>
                      {c.pedidos >= 2 && <Etiqueta color="#3fbf7f">Recurrente</Etiqueta>}
                    </span>
                    <span className="block truncate text-[12.5px] text-index">{c.telefono || 'Sin teléfono'}</span>
                  </span>
                </span>
                {/* celular: todo en un bloque */}
                <span className="min-w-0 md:hidden">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-semibold">{c.nombre}</span>
                    {c.pedidos >= 2 && <Etiqueta color="#3fbf7f">Recurrente</Etiqueta>}
                  </span>
                  <span className="block truncate text-[12px] text-index">
                    {c.pedidos} {c.pedidos === 1 ? 'pedido' : 'pedidos'} · {c.pares} {c.pares === 1 ? 'par' : 'pares'} · último {formatDate(c.ultimo)}
                  </span>
                </span>
                <span className="hidden text-right text-[13.5px] tabular-nums md:block">{c.pedidos}</span>
                <span className="hidden text-right text-[13.5px] tabular-nums md:block">{c.pares}</span>
                <span className="hidden text-[12.5px] text-index md:block">{formatDate(c.ultimo)}</span>
                <span className="text-right text-[14px] font-semibold tabular-nums md:order-none">{formatARS(c.gastado)}</span>
                <span className="col-start-3 row-start-2 flex justify-end md:col-start-auto md:row-start-auto">
                  {c.telefono && (
                    <a
                      href={waCliente(c.telefono, `Hola ${c.nombre.split(' ')[0]}! Te escribimos de Boom Zapas.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Escribirle a ${c.nombre} por WhatsApp`}
                      className="grid size-9 place-items-center rounded-xl bg-[#25d366]/12 text-[#3ddc84] ring-1 ring-inset ring-[#25d366]/30 transition-colors hover:bg-[#25d366] hover:text-white"
                    >
                      <Icon name="whatsapp" size={16} />
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
