import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Empty, PageTitle, Pills, SearchBox } from './ui'
import { ProductoEditor } from './ProductoEditor'
import { estadoStock, totalStock } from '@/lib/adminStats'
import { MODO_DEMO } from '@/lib/api'
import { cn, formatARS } from '@/lib/format'
import type { Producto } from '@/types'

type Filtro = 'todos' | 'bajo' | 'agotados' | 'ocultos' | 'nuevos'

interface ProductosProps {
  productos: Producto[]
  filtroInicial?: string
  setStock: (p: Producto, talle: string, cantidad: number) => Promise<void>
}

export function Productos({ productos, filtroInicial, setStock }: ProductosProps) {
  const [filtro, setFiltro] = useState<Filtro>((filtroInicial as Filtro) || 'todos')
  const [marca, setMarca] = useState('todas')
  const [orden, setOrden] = useState<'nombre' | 'precio' | 'stock'>('nombre')
  const [q, setQ] = useState('')
  const [selId, setSelId] = useState<number | null>(null)
  const [crear, setCrear] = useState(false)

  useEffect(() => {
    if (filtroInicial) setFiltro(filtroInicial as Filtro)
  }, [filtroInicial])

  const marcas = useMemo(() => [...new Set(productos.map((p) => p.marca))].sort(), [productos])

  const cuenta = useMemo(
    () => ({
      todos: productos.length,
      bajo: productos.filter((p) => ['bajo', 'agotado'].includes(estadoStock(p).id)).length,
      agotados: productos.filter((p) => estadoStock(p).id === 'agotado').length,
      ocultos: productos.filter((p) => p.oculto).length,
      nuevos: productos.filter((p) => p.nuevo).length,
    }),
    [productos],
  )

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    const out = productos.filter((p) => {
      if (marca !== 'todas' && p.marca !== marca) return false
      if (filtro === 'bajo' && !['bajo', 'agotado'].includes(estadoStock(p).id)) return false
      if (filtro === 'agotados' && estadoStock(p).id !== 'agotado') return false
      if (filtro === 'ocultos' && !p.oculto) return false
      if (filtro === 'nuevos' && !p.nuevo) return false
      return !t || `${p.nombre} ${p.marca} ${p.categoria}`.toLowerCase().includes(t)
    })
    return out.sort((a, b) =>
      orden === 'precio' ? b.precio - a.precio : orden === 'stock' ? totalStock(a) - totalStock(b) : a.nombre.localeCompare(b.nombre),
    )
  }, [productos, filtro, marca, orden, q])

  const unidades = productos.reduce((a, p) => a + totalStock(p), 0)
  const valor = productos.reduce((a, p) => a + totalStock(p) * p.precio, 0)
  const actual = productos.find((p) => p.id === selId) ?? null

  return (
    <div>
      <PageTitle
        title="Productos y stock"
        subtitle={`${productos.length} modelos · ${unidades} pares · inventario ${formatARS(valor)}`}
        action={
          MODO_DEMO ? (
            <Button size="sm" onClick={() => setCrear(true)}>
              <Icon name="plus" size={15} className="mr-2" /> Nuevo modelo
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 flex flex-col gap-3">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="w-max sm:w-auto">
            <Pills
              value={filtro}
              onChange={setFiltro}
              options={[
                { id: 'todos', label: 'Todos', count: cuenta.todos },
                { id: 'bajo', label: 'Para reponer', count: cuenta.bajo },
                { id: 'agotados', label: 'Agotados', count: cuenta.agotados },
                { id: 'nuevos', label: 'Nuevos', count: cuenta.nuevos },
                ...(MODO_DEMO ? [{ id: 'ocultos' as const, label: 'Ocultos', count: cuenta.ocultos }] : []),
              ]}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar modelo o marca" />
          <select
            aria-label="Marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className="field-line normal-case !h-10 !rounded-full !py-0 sm:!w-44"
          >
            <option value="todas">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            aria-label="Ordenar"
            value={orden}
            onChange={(e) => setOrden(e.target.value as typeof orden)}
            className="field-line normal-case !h-10 !rounded-full !py-0 sm:!w-44"
          >
            <option value="nombre">Ordenar: nombre</option>
            <option value="precio">Ordenar: precio</option>
            <option value="stock">Ordenar: menos stock</option>
          </select>
        </div>
      </div>

      {lista.length === 0 ? (
        <Empty>No hay productos con ese filtro.</Empty>
      ) : (
        <ul className="surface divide-y divide-line border border-line">
          {lista.map((p) => {
            const e = estadoStock(p)
            return (
              <li key={p.id}>
                <button
                  onClick={() => setSelId(p.id)}
                  className={cn(
                    'grid w-full grid-cols-[56px_1fr_auto] items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-stage sm:px-5',
                    p.oculto && 'opacity-55',
                  )}
                >
                  <img
                    src={p.imagenes[0]}
                    alt=""
                    loading="lazy"
                    className="h-14 w-14 rounded-xl bg-stage object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{p.nombre}</span>
                    <span className="block truncate text-[12px] text-index">
                      {p.marca} · <span className="capitalize">{p.categoria}</span> · {formatARS(p.precio)}
                      {p.nuevo && <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-[10.5px] font-semibold text-accent-soft">NUEVO</span>}
                      {p.oculto && <span className="ml-2 rounded-full bg-stage px-2 py-0.5 text-[10.5px] font-semibold">OCULTO</span>}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="font-display text-lg font-bold leading-none">{totalStock(p)}</span>
                    <span className="text-[11.5px] font-medium" style={{ color: e.color }}>
                      {e.label}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <ProductoEditor producto={actual} open={!!actual} onClose={() => setSelId(null)} setStock={setStock} />
      <ProductoEditor producto={null} open={crear} crear onClose={() => setCrear(false)} setStock={setStock} onCreado={(id) => setSelId(id)} />
    </div>
  )
}
