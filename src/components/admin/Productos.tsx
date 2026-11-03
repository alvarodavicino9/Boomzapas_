import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Empty, PageTitle, Pills, SearchBox } from './ui'
import { ProductoEditor } from './ProductoEditor'
import { CompraMercaderia } from './CompraMercaderia'
import { Modal } from '@/components/ui/Modal'
import { useUI } from '@/context/UIContext'
import { setCostos, useCostos } from '@/lib/adminStore'
import { estadoStock, totalStock } from '@/lib/adminStats'
import { MODO_DEMO } from '@/lib/api'
import { cn, formatARS, transferPrice } from '@/lib/format'
import type { Producto } from '@/types'

type Filtro = 'todos' | 'bajo' | 'agotados' | 'ocultos' | 'nuevos' | 'sincosto'

interface ProductosProps {
  productos: Producto[]
  filtroInicial?: string
  setStock: (p: Producto, talle: string, cantidad: number) => Promise<void>
}

export function Productos({ productos, filtroInicial, setStock }: ProductosProps) {
  const [filtro, setFiltro] = useState<Filtro>((filtroInicial as Filtro) || 'todos')
  const [marca, setMarca] = useState('todas')
  const [orden, setOrden] = useState<'nombre' | 'precio' | 'stock' | 'margen'>('nombre')
  const [q, setQ] = useState('')
  const [selId, setSelId] = useState<number | null>(null)
  const [crear, setCrear] = useState(false)
  const [compra, setCompra] = useState<{ id?: number } | null>(null)
  const [costosMasivos, setCostosMasivos] = useState(false)
  const costos = useCostos()

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
      sincosto: productos.filter((p) => !p.oculto && !costos[p.id]).length,
    }),
    [productos, costos],
  )

  const ganancia = (p: Producto) => (costos[p.id] ? transferPrice(p.precio) - costos[p.id] : -Infinity)

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    const out = productos.filter((p) => {
      if (marca !== 'todas' && p.marca !== marca) return false
      if (filtro === 'bajo' && !['bajo', 'agotado'].includes(estadoStock(p).id)) return false
      if (filtro === 'agotados' && estadoStock(p).id !== 'agotado') return false
      if (filtro === 'ocultos' && !p.oculto) return false
      if (filtro === 'nuevos' && !p.nuevo) return false
      if (filtro === 'sincosto' && (costos[p.id] || p.oculto)) return false
      return !t || `${p.nombre} ${p.marca} ${p.categoria}`.toLowerCase().includes(t)
    })
    return out.sort((a, b) =>
      orden === 'precio'
        ? b.precio - a.precio
        : orden === 'stock'
          ? totalStock(a) - totalStock(b)
          : orden === 'margen'
            ? ganancia(b) - ganancia(a)
            : a.nombre.localeCompare(b.nombre),
    )
  }, [productos, filtro, marca, orden, q, costos])

  const unidades = productos.reduce((a, p) => a + totalStock(p), 0)
  const valor = productos.reduce((a, p) => a + totalStock(p) * p.precio, 0)
  const valorCosto = productos.reduce((a, p) => a + totalStock(p) * (costos[p.id] ?? 0), 0)
  const conCosto = productos.filter((p) => costos[p.id]).length
  const actual = productos.find((p) => p.id === selId) ?? null

  return (
    <div>
      <PageTitle
        title="Productos y stock"
        subtitle={`${productos.length} modelos · ${unidades} pares en stock`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompra({})}>
              <Icon name="box" size={15} className="mr-2" /> Entró mercadería
            </Button>
            {MODO_DEMO && (
              <Button size="sm" onClick={() => setCrear(true)}>
                <Icon name="plus" size={15} className="mr-2" /> Nuevo modelo
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato label="Pares en stock" valor={String(unidades)} />
        <Dato label="Stock a precio de venta" valor={formatARS(valor)} />
        <Dato
          label="Stock a costo"
          valor={conCosto ? formatARS(valorCosto) : '—'}
          sub={conCosto < productos.length ? `${conCosto} de ${productos.length} con costo` : 'Todos con costo'}
        />
        <button
          onClick={() => setCostosMasivos(true)}
          className="surface flex flex-col justify-between border border-dashed border-control p-4 text-left hover:border-accent"
        >
          <span className="label text-index">Costos</span>
          <span className="mt-2 text-[13.5px] font-semibold leading-5">
            {cuenta.sincosto ? `Completar ${cuenta.sincosto} sin costo` : 'Ajustar costos'}
          </span>
          <span className="mt-1 text-[12px] text-index">Para ver la ganancia real</span>
        </button>
      </div>

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
                { id: 'sincosto', label: 'Sin costo', count: cuenta.sincosto },
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
            <option value="margen">Ordenar: más ganancia</option>
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
                      {p.marca} · {formatARS(p.precio)}
                      {costos[p.id] ? (
                        <span className="text-[#3fbf7f]"> · gana {formatARS(transferPrice(p.precio) - costos[p.id])}</span>
                      ) : (
                        <span> · sin costo</span>
                      )}
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

      <ProductoEditor
        producto={actual}
        open={!!actual}
        onClose={() => setSelId(null)}
        setStock={setStock}
        onCompra={(id) => {
          setSelId(null)
          setCompra({ id })
        }}
      />
      <ProductoEditor producto={null} open={crear} crear onClose={() => setCrear(false)} setStock={setStock} onCreado={(id) => setSelId(id)} />
      <CompraMercaderia open={!!compra} onClose={() => setCompra(null)} productos={productos} productoId={compra?.id} setStock={setStock} />
      <CostosMasivos open={costosMasivos} onClose={() => setCostosMasivos(false)} productos={productos} costos={costos} />
    </div>
  )
}

function Dato({ label, valor, sub }: { label: string; valor: string; sub?: string }) {
  return (
    <div className="surface border border-line p-4">
      <p className="label text-index">{label}</p>
      <p className="mt-2 whitespace-nowrap font-display text-[1.1rem] font-bold leading-none sm:text-[1.35rem]">{valor}</p>
      {sub && <p className="mt-1.5 text-[12px] text-index">{sub}</p>}
    </div>
  )
}

/** Carga rápida de costos: un porcentaje del precio para los modelos que no tienen, o costo por marca. */
function CostosMasivos({
  open,
  onClose,
  productos,
  costos,
}: {
  open: boolean
  onClose: () => void
  productos: Producto[]
  costos: Record<number, number>
}) {
  const [pct, setPct] = useState('55')
  const [todos, setTodos] = useState(false)
  const { toast } = useUI()
  const k = Math.min(100, Math.max(1, Number(pct) || 0)) / 100
  const objetivo = productos.filter((p) => !p.oculto && (todos || !costos[p.id]))
  const ejemplo = objetivo[0]

  const aplicar = () => {
    setCostos(Object.fromEntries(objetivo.map((p) => [p.id, Math.round((p.precio * k) / 100) * 100])))
    toast(`Costo cargado en ${objetivo.length} modelos`)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Cargar costos rápido" size="md">
      <div className="space-y-4 px-5 py-5 sm:px-8">
        <p className="body-text">
          Si no tenés el costo exacto de cada modelo, poné qué porcentaje del precio te cuesta en promedio. Después podés corregir
          cada uno en su ficha.
        </p>
        <label className="block">
          <span className="label mb-1.5 block text-index">El costo es el % del precio de lista</span>
          <input className="field-line" type="number" min={1} max={100} inputMode="numeric" value={pct} onChange={(e) => setPct(e.target.value)} />
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-[13px]">
          <input type="checkbox" className="check" checked={todos} onChange={(e) => setTodos(e.target.checked)} />
          Pisar también los que ya tienen costo
        </label>
        {ejemplo && (
          <p className="rounded-xl border border-line bg-stage px-4 py-3 text-[12.5px] leading-5 text-index">
            Ejemplo: {ejemplo.nombre} sale {formatARS(ejemplo.precio)} → costo {formatARS(Math.round((ejemplo.precio * k) / 100) * 100)}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-[13px] text-index">{objetivo.length} modelos</span>
          <Button onClick={aplicar} disabled={objetivo.length === 0}>
            Aplicar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
