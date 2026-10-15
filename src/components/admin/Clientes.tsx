import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, Empty, PageTitle, SearchBox } from './ui'
import { agruparClientes, descargarCSV } from '@/lib/adminStats'
import type { PedidoAdmin } from '@/lib/adminStore'
import { formatARS, formatDate } from '@/lib/format'
import { waCliente } from '@/lib/whatsapp'
import { useUI } from '@/context/UIContext'

const iniciales = (n: string) =>
  n
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

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
          { l: 'Clientes', v: String(todos.length) },
          { l: 'Recurrentes', v: String(recurrentes), s: todos.length ? `${Math.round((recurrentes / todos.length) * 100)}%` : '' },
          { l: 'Mejor cliente', v: todos[0] ? todos[0].nombre.split(' ')[0] : '—', s: todos[0] ? formatARS(todos[0].gastado) : '' },
        ].map((k) => (
          <div key={k.l} className="surface border border-line p-4">
            <p className="label text-index">{k.l}</p>
            <p className="mt-2 truncate font-display text-xl font-bold leading-none sm:text-2xl">{k.v}</p>
            {k.s && <p className="mt-1 text-[12px] text-index">{k.s}</p>}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} placeholder="Buscar cliente o teléfono" />
      </div>

      {lista.length === 0 ? (
        <Empty>{todos.length === 0 ? 'Todavía no hay clientes.' : 'No encontramos a nadie con esa búsqueda.'}</Empty>
      ) : (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {lista.map((c) => (
              <li key={c.clave} className="grid grid-cols-[44px_1fr_auto] items-center gap-4 px-4 py-3.5 sm:px-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/20 text-[13px] font-bold text-accent-soft">
                  {iniciales(c.nombre)}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-medium">{c.nombre}</span>
                    {c.pedidos >= 2 && (
                      <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10.5px] font-semibold text-accent-soft">
                        RECURRENTE
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-[12px] text-index">
                    {c.telefono || 'Sin teléfono'} · {c.pedidos} {c.pedidos === 1 ? 'pedido' : 'pedidos'} · {c.pares} {c.pares === 1 ? 'par' : 'pares'}
                  </span>
                  <span className="block text-[12px] text-index">Último: {formatDate(c.ultimo)}</span>
                </span>
                <span className="flex flex-col items-end gap-1.5">
                  <span className="text-[14px] font-semibold">{formatARS(c.gastado)}</span>
                  {c.telefono && (
                    <a
                      href={waCliente(c.telefono, `Hola ${c.nombre.split(' ')[0]}! Te escribimos de Boom Zapas 👟`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Escribirle a ${c.nombre} por WhatsApp`}
                      className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-accent hover:text-accent-soft"
                    >
                      <Icon name="whatsapp" size={15} />
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
