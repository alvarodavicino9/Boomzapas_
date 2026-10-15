import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Icon } from '@/components/ui/Icon'
import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { useProductos } from '@/context/ProductsContext'
import { CATEGORIAS } from '@/config/site'
import {
  NUEVOS_RECIENTES,
  ORDENES,
  PRICE_RANGES,
  hasStock,
  hasTalle,
  isOrden,
  normText,
  sortProductos,
  type FilterState,
  type Orden,
} from '@/lib/filters'
import { cn, formatARS } from '@/lib/format'
import type { FiltroCategoria } from '@/types'

const isCategoria = (v: string | null): v is FiltroCategoria => CATEGORIAS.some((c) => c.id === v)
const list = (v: string | null) => (v ?? '').split(',').filter(Boolean)
const digits = (v: string | null) => (v ?? '').replace(/\D/g, '')

export default function CatalogPage() {
  const { productos, status } = useProductos()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Los filtros viven en la URL: se pueden compartir y funcionan con el botón "atrás".
  const catParam = params.get('cat')
  const query = params.get('q') ?? ''
  const ordenParam = params.get('orden')
  const orden: Orden = isOrden(ordenParam) ? ordenParam : 'novedad'
  const cols: 3 | 4 = params.get('cols') === '3' ? 3 : 4
  const state: FilterState = {
    categoria: isCategoria(catParam) ? catParam : 'todos',
    marcas: list(params.get('marca')),
    talle: params.get('talle') ?? '',
    precios: list(params.get('precio')).filter((id) => PRICE_RANGES.some((r) => r.id === id)),
    pmin: digits(params.get('pmin')),
    pmax: digits(params.get('pmax')),
    stock: params.get('stock') === '1',
    nuevos: params.get('nuevos') === '1',
  }

  const setMany = (entries: Record<string, string>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(entries)) {
          if (v && v !== 'todos' && !(k === 'orden' && v === 'novedad')) next.set(k, v)
          else next.delete(k)
        }
        return next
      },
      { replace: true },
    )

  const patch = (p: Partial<FilterState>) => {
    const e: Record<string, string> = {}
    if (p.categoria !== undefined) e.cat = p.categoria
    if (p.marcas !== undefined) e.marca = p.marcas.join(',')
    if (p.talle !== undefined) e.talle = p.talle
    if (p.precios !== undefined) e.precio = p.precios.join(',')
    if (p.pmin !== undefined) e.pmin = p.pmin
    if (p.pmax !== undefined) e.pmax = p.pmax
    if (p.stock !== undefined) e.stock = p.stock ? '1' : ''
    if (p.nuevos !== undefined) e.nuevos = p.nuevos ? '1' : ''
    setMany(e)
  }

  const marcas = useMemo(() => {
    const c = new Map<string, number>()
    for (const p of productos) c.set(p.marca, (c.get(p.marca) ?? 0) + 1)
    return [...c].map(([nombre, total]) => ({ nombre, total })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [productos])

  const talles = useMemo(() => {
    const c = new Map<string, number>()
    for (const p of productos) {
      for (const t of new Set(p.stock.filter((s) => s.cantidad > 0).map((s) => s.talle))) c.set(t, (c.get(t) ?? 0) + 1)
    }
    return [...c].map(([talle, total]) => ({ talle, total })).sort((a, b) => Number(a.talle) - Number(b.talle))
  }, [productos])

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: productos.length }
    for (const p of productos) c[p.categoria] = (c[p.categoria] ?? 0) + 1
    return c
  }, [productos])

  const rango = useMemo(() => {
    const precios = productos.map((p) => p.precio)
    return { min: precios.length ? Math.min(...precios) : 0, max: precios.length ? Math.max(...precios) : 0 }
  }, [productos])

  // "Nuevo": lo marca el servidor o está entre los últimos ingresos
  const nuevoDesde = useMemo(() => {
    const ids = productos.map((p) => p.id).sort((a, b) => b - a)
    return ids[Math.min(NUEVOS_RECIENTES, ids.length) - 1] ?? 0
  }, [productos])

  const filtered = useMemo(() => {
    const q = normText(query.trim())
    const ranges = PRICE_RANGES.filter((r) => state.precios.includes(r.id))
    const min = state.pmin ? Number(state.pmin) : null
    const max = state.pmax ? Number(state.pmax) : null
    const out = productos.filter(
      (p) =>
        (state.categoria === 'todos' || p.categoria === state.categoria) &&
        (state.marcas.length === 0 || state.marcas.includes(p.marca)) &&
        (!state.talle || hasTalle(p, state.talle)) &&
        (ranges.length === 0 || ranges.some((r) => r.test(p.precio))) &&
        (min === null || p.precio >= min) &&
        (max === null || p.precio <= max) &&
        (!state.stock || hasStock(p)) &&
        (!state.nuevos || p.nuevo || p.id >= nuevoDesde) &&
        (!q || normText(`${p.nombre} ${p.marca}`).includes(q)),
    )
    return sortProductos(out, orden)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productos, params.toString(), nuevoDesde])

  // Filtros activos como etiquetas que se pueden quitar de a una
  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(query ? [{ key: 'q', label: `“${query}”`, remove: () => setMany({ q: '' }) }] : []),
    ...(state.categoria !== 'todos'
      ? [{ key: 'cat', label: CATEGORIAS.find((c) => c.id === state.categoria)?.label ?? state.categoria, remove: () => patch({ categoria: 'todos' }) }]
      : []),
    ...state.marcas.map((m) => ({ key: `m-${m}`, label: m, remove: () => patch({ marcas: state.marcas.filter((x) => x !== m) }) })),
    ...(state.talle ? [{ key: 't', label: `Talle ${state.talle}`, remove: () => patch({ talle: '' }) }] : []),
    ...state.precios.map((id) => ({
      key: `p-${id}`,
      label: PRICE_RANGES.find((r) => r.id === id)?.label ?? id,
      remove: () => patch({ precios: state.precios.filter((x) => x !== id) }),
    })),
    ...(state.pmin || state.pmax
      ? [
          {
            key: 'rango',
            label: `${state.pmin ? formatARS(Number(state.pmin)) : 'Sin mínimo'} – ${state.pmax ? formatARS(Number(state.pmax)) : 'Sin máximo'}`,
            remove: () => patch({ pmin: '', pmax: '' }),
          },
        ]
      : []),
    ...(state.stock ? [{ key: 's', label: 'Con stock', remove: () => patch({ stock: false }) }] : []),
    ...(state.nuevos ? [{ key: 'n', label: 'Nuevos ingresos', remove: () => patch({ nuevos: false }) }] : []),
  ]
  const activeCount = chips.length
  const reset = () => setParams(orden !== 'novedad' || cols !== 4 ? { ...(orden !== 'novedad' && { orden }), ...(cols !== 4 && { cols: String(cols) }) } : {}, { replace: true })

  return (
    <>
      <PageHeader
        eyebrow="Nuestros productos"
        title="Catálogo"
        subtitle={query ? `Resultados para “${query}”.` : 'Filtrá por marca, talle, precio o disponibilidad y tocá un modelo para ver los detalles.'}
      />

      <div className="page-x grid gap-8 py-10 lg:grid-cols-[290px_1fr] lg:gap-12">
        {/* Filtros: columna fija en escritorio, panel desplegable en celular */}
        <aside aria-label="Filtros" className="lg:sticky lg:top-[calc(var(--header-h)+28px)] lg:self-start">
          <button
            className="surface label flex w-full items-center justify-between px-5 py-4 lg:hidden"
            aria-expanded={filtersOpen}
            aria-controls="panel-filtros"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <span>Filtros{activeCount > 0 && ` (${activeCount})`}</span>
            <span className="text-accent">{filtersOpen ? 'Cerrar' : 'Abrir'}</span>
          </button>
          <div id="panel-filtros" className={filtersOpen ? 'block pt-4 lg:pt-0' : 'hidden lg:block'}>
            <CatalogFilters
              value={state}
              onChange={patch}
              query={query}
              onQuery={(q) => setMany({ q })}
              counts={counts}
              marcas={marcas}
              talles={talles}
              rango={rango}
              onReset={reset}
              activeCount={activeCount}
            />
          </div>
        </aside>

        <section aria-label="Productos" className="min-w-0">
          {/* barra de resultados: cantidad, orden y columnas */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <p className="label text-index" aria-live="polite">
              {status === 'ready' && (
                <>
                  <span className="text-ink">{filtered.length}</span> {filtered.length === 1 ? 'modelo' : 'modelos'}
                  {filtered.length !== productos.length && ` de ${productos.length}`}
                </>
              )}
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3">
                <span className="label hidden text-index sm:block">Ordenar</span>
                <select
                  value={orden}
                  onChange={(e) => setMany({ orden: e.target.value })}
                  className="field-line !w-auto !py-2.5 !text-[12px]"
                  aria-label="Ordenar por"
                >
                  {ORDENES.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hidden items-center gap-1 rounded-xl border border-line p-1 xl:flex" role="group" aria-label="Columnas">
                {([3, 4] as const).map((n) => (
                  <button
                    key={n}
                    aria-pressed={cols === n}
                    aria-label={`${n} columnas`}
                    onClick={() => setMany({ cols: n === 4 ? '' : String(n) })}
                    className={cn('grid size-8 place-items-center rounded-lg text-[12px] font-bold', cols === n ? 'bg-accent text-on-accent' : 'text-index hover:text-ink')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mb-6 flex flex-wrap items-center gap-2" aria-label="Filtros activos">
              {chips.map((c) => (
                <li key={c.key}>
                  <button
                    onClick={c.remove}
                    aria-label={`Quitar filtro ${c.label}`}
                    className="label flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 py-1.5 pl-3.5 pr-2.5 hover:bg-accent/20"
                  >
                    {c.label}
                    <Icon name="x" size={13} />
                  </button>
                </li>
              ))}
              <li>
                <button onClick={reset} className="label link-u ml-1 text-index hover:text-ink">
                  Limpiar todo
                </button>
              </li>
            </ul>
          )}

          <ProductGrid
            productos={filtered}
            status={status}
            cols={cols}
            emptyMessage={
              productos.length === 0
                ? 'El servidor no devolvió productos. Revisá que estén activos (activo = true) en la base de datos.'
                : 'Probá con otra búsqueda o quitá algunos filtros.'
            }
            onResetFilters={reset}
          />
        </section>
      </div>
    </>
  )
}
