import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { Icon } from '@/components/ui/Icon'
import { useProductos } from '@/context/ProductsContext'
import { useAbrirProducto } from '@/hooks/useAbrirProducto'
import { coincideBusqueda, hasStock } from '@/lib/filters'
import { cn, formatARS, precioPromo } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
import type { Producto } from '@/types'

const MAX = 6
const SUGERENCIAS = ['Dunk', 'Samba', 'Jordan', 'Vans Knu', 'New Balance', 'Forum']

interface Props {
  id: string
  /** "barra": en el encabezado, los resultados flotan debajo. "menu": en el menú del celular, la lista va debajo del campo. */
  variante: 'barra' | 'menu'
  className?: string
  /** Se llama al elegir algo (para cerrar el menú del celular). */
  onElegir?: () => void
  autoFocus?: boolean
}

/** Buscador con resultados en vivo: a medida que escribís aparecen las zapatillas con foto y precio. */
export function Buscador({ id, variante, className, onElegir, autoFocus }: Props) {
  const [q, setQ] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1)
  const { productos } = useProductos()
  const abrir = useAbrirProducto()
  const navigate = useNavigate()
  const raiz = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const listaId = useId()

  const termino = q.trim()
  const todos = useMemo(() => {
    if (!termino) return []
    // primero los que tienen stock, después los que empiezan con lo buscado
    return productos
      .filter((p) => coincideBusqueda(p, termino))
      .sort((a, b) => Number(hasStock(b)) - Number(hasStock(a)))
  }, [productos, termino])
  const resultados = todos.slice(0, MAX)
  const mostrar = abierto && termino.length > 0

  useEffect(() => setActivo(-1), [termino])

  useEffect(() => {
    if (!mostrar || variante === 'menu') return
    const fuera = (e: MouseEvent) => !raiz.current?.contains(e.target as Node) && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [mostrar, variante])

  const terminar = () => {
    setQ('')
    setAbierto(false)
    input.current?.blur()
    onElegir?.()
  }

  const elegir = (p: Producto) => {
    abrir(p)
    terminar()
  }

  const verTodo = (t = termino) => {
    navigate(t ? `/catalogo?q=${encodeURIComponent(t)}` : '/catalogo')
    terminar()
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAbierto(true)
      setActivo((i) => Math.min(resultados.length, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((i) => Math.max(-1, i - 1))
    } else if (e.key === 'Escape') {
      if (q) setQ('')
      else input.current?.blur()
      setAbierto(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activo >= 0 && activo < resultados.length) elegir(resultados[activo])
    else verTodo()
  }

  const opcionId = (i: number) => `${listaId}-op-${i}`

  const panel = (
    <div
      className={cn(
        'overflow-hidden',
        variante === 'barra'
          ? 'absolute right-0 top-[calc(100%+10px)] z-50 w-[min(420px,calc(100vw-32px))] rounded-2xl border border-line bg-gallery shadow-[0_30px_60px_-20px_rgb(0_0_0/0.75)]'
          : 'mt-3 rounded-2xl border border-line bg-card',
      )}
    >
      {resultados.length > 0 ? (
        <>
          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-index">
            {todos.length} {todos.length === 1 ? 'modelo' : 'modelos'}
          </p>
          <ul id={listaId} role="listbox" aria-label="Resultados" className="max-h-[min(420px,60dvh)] overflow-y-auto overscroll-contain p-1.5">
            {resultados.map((p, i) => {
              const sinStock = !hasStock(p)
              return (
                <li key={p.id} id={opcionId(i)} role="option" aria-selected={activo === i}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => elegir(p)}
                    onMouseEnter={() => setActivo(i)}
                    className={cn('flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors', activo === i ? 'bg-stage' : 'hover:bg-stage')}
                  >
                    <ProductImage src={p.imagenes[0]} alt="" sizes="56px" className="size-14 shrink-0 rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-index">{p.marca}</span>
                      <span className="block truncate text-[14px] font-medium leading-5">{p.nombre}</span>
                      <span className="mt-0.5 block text-[12px] leading-4">
                        {sinStock ? (
                          <span className="text-index">Sin stock por ahora</span>
                        ) : (
                          <>
                            <span className="font-semibold">{formatARS(p.precio)}</span>
                            <span className="text-[color:var(--bz-accent-text)]"> · {formatARS(precioPromo(p.precio))} llevando 2</span>
                          </>
                        )}
                      </span>
                    </span>
                    <Icon name="arrow" size={15} className="shrink-0 text-index" />
                  </button>
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => verTodo()}
            id={opcionId(resultados.length)}
            className={cn(
              'flex w-full items-center justify-between gap-3 border-t border-line px-4 py-3 text-[13px] font-semibold transition-colors',
              activo === resultados.length ? 'bg-stage' : 'hover:bg-stage',
            )}
          >
            {todos.length > MAX ? `Ver los ${todos.length} resultados` : 'Ver en el catálogo'}
            <Icon name="arrow" size={15} className="text-[color:var(--bz-accent-text)]" />
          </button>
        </>
      ) : (
        <div className="px-4 py-4">
          <p className="text-[14px] font-medium">
            No encontramos “{termino}”
          </p>
          <p className="mt-1 text-[12.5px] leading-4 text-index">Probá con otro modelo o marca:</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setQ(s)}
                className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:border-accent"
              >
                {s}
              </button>
            ))}
          </div>
          <a
            href={waLink(`Hola Boom Zapas. ¿Tienen ${termino}?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-[color:var(--bz-accent-text)] hover:underline hover:underline-offset-4"
          >
            <Icon name="whatsapp" size={16} /> Consultanos por WhatsApp si lo buscás
          </a>
        </div>
      )}
    </div>
  )

  return (
    <div ref={raiz} className={cn('relative', className)}>
      <form onSubmit={onSubmit} role="search" className="relative">
        <label htmlFor={id} className="sr-only">
          Buscar modelo o marca
        </label>
        <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-index" />
        <input
          ref={input}
          id={id}
          type="search"
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-activedescendant={mostrar && activo >= 0 ? opcionId(activo) : undefined}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={onKey}
          placeholder="Buscar modelo o marca"
          autoComplete="off"
          autoFocus={autoFocus}
          className="field-line !rounded-full !py-2.5 !pl-10 !pr-10 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('')
              input.current?.focus()
            }}
            aria-label="Borrar búsqueda"
            className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-index hover:bg-stage hover:text-ink"
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </form>
      {mostrar && panel}
      {variante === 'menu' && !termino && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGERENCIAS.map((s) => (
            <Link
              key={s}
              to={`/catalogo?q=${encodeURIComponent(s)}`}
              onClick={() => onElegir?.()}
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:border-accent"
            >
              {s}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
