import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { OrdenMenu } from '@/components/catalog/OrdenMenu'
import { useProductos } from '@/context/ProductsContext'
import { CATEGORIAS, SITE } from '@/config/site'
import {
  NUEVOS_RECIENTES,
  PRICE_RANGES,
  hasStock,
  hasTalle,
  isOrden,
  coincideBusqueda,
  sortProductos,
  type FilterState,
  type Orden,
} from '@/lib/filters'
import { formatARS } from '@/lib/format'
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
    const q = query.trim()
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
        coincideBusqueda(p, q),
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
  const reset = () => setParams(orden !== 'novedad' ? { orden } : {}, { replace: true })

  // Panel de filtros del celular: Escape lo cierra y no deja scrollear el fondo
  useLockBodyScroll(filtersOpen)
  useEffect(() => {
    if (!filtersOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFiltersOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtersOpen])

  const filtros = (
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
  )

  const ordenSelect = (ancho?: boolean) => (
    <OrdenMenu value={orden} onChange={(o) => setMany({ orden: o })} ancho={ancho} />
  )

  return (
    <>
      <header className="page-x border-b border-line bg-card pb-5 pt-7 sm:pb-7 sm:pt-10">
        <p className="label mb-2 text-accent">Nuestros productos</p>
        <h1 className="display-section !text-[clamp(1.6rem,4vw,2.5rem)]">
          {query ? <>Resultados para “{query}”</> : 'Catálogo'}
        </h1>
        <p className="body-text mt-2 max-w-2xl text-[13.5px] leading-6 sm:text-[15px]">
          Fotos reales de cada par · envío gratis a todo el país · {formatARS(SITE.transferDiscount)} menos por par con transferencia.
        </p>
        {/* categorías rápidas: se deslizan en el celular */}
      </header>

      {/* barra fija del celular: filtros y orden siempre a mano */}
      <div className="page-x sticky top-[var(--header-h)] z-30 flex items-center gap-2 border-b border-line bg-gallery/90 py-2.5 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-haspopup="dialog"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-card text-[13px] font-semibold"
        >
          <Icon name="filter" size={17} />
          Filtros
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-on-accent">{activeCount}</span>
          )}
        </button>
        {ordenSelect(true)}
      </div>

      <div className="page-x grid gap-8 pb-10 pt-5 sm:pt-8 lg:grid-cols-[290px_1fr] lg:gap-12 lg:pt-10">
        {/* Filtros: columna fija en la compu */}
        <aside aria-label="Filtros" className="hidden lg:sticky lg:top-[calc(var(--header-h)+28px)] lg:block lg:self-start">
          {filtros}
        </aside>

        <section aria-labelledby="titulo-resultados" className="min-w-0">
          <h2 id="titulo-resultados" className="sr-only">Modelos</h2>
          {/* barra de resultados: cantidad y orden */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:mb-5">
            <p className="label text-index" aria-live="polite">
              {status === 'ready' && (
                <>
                  <span className="text-ink">{filtered.length}</span> {filtered.length === 1 ? 'modelo' : 'modelos'}
                  {filtered.length !== productos.length && ` de ${productos.length}`}
                </>
              )}
            </p>
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">{ordenSelect()}</div>
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
            emptyMessage={
              productos.length === 0
                ? 'El servidor no devolvió productos. Revisá que estén activos (activo = true) en la base de datos.'
                : 'Probá con otra búsqueda o quitá algunos filtros.'
            }
            onResetFilters={reset}
          />
        </section>
      </div>

      {/* Panel de filtros del celular: sube desde abajo */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            className="fixed inset-0 z-[450] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute inset-0 bg-scrim" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
              className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-gallery shadow-lift"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <span aria-hidden="true" className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-control" />
                <p className="display-product !text-[1.1rem]">Filtrar</p>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Cerrar filtros"
                  className="grid size-11 place-items-center rounded-full hover:bg-stage"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain p-4">{filtros}</div>
              <div className="flex gap-3 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button type="button" onClick={reset} className="btn btn-outline flex-1 !px-4" disabled={activeCount === 0}>
                  Limpiar
                </button>
                <button type="button" onClick={() => setFiltersOpen(false)} className="btn btn-accent flex-[2] !px-4">
                  Ver {filtered.length} {filtered.length === 1 ? 'modelo' : 'modelos'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
