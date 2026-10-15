import { Icon } from '@/components/ui/Icon'
import { CATEGORIAS } from '@/config/site'
import { cn } from '@/lib/format'
import type { FiltroCategoria } from '@/types'

interface CatalogToolbarProps {
  categoria: FiltroCategoria
  onCategoria: (c: FiltroCategoria) => void
  counts: Record<string, number>
  query: string
  onQuery: (q: string) => void
  marca: string
  onMarca: (m: string) => void
  marcas: string[]
}

export function CatalogToolbar({
  categoria,
  onCategoria,
  counts,
  query,
  onQuery,
  marca,
  onMarca,
  marcas,
}: CatalogToolbarProps) {
  return (
    <div className="sticky top-[68px] z-20 -mx-5 mb-8 border-y border-electric/15 bg-navy/90 px-5 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0" role="tablist" aria-label="Categorías">
          {CATEGORIAS.map((c) => {
            const active = categoria === c.id
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => onCategoria(c.id)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition',
                  active
                    ? 'border-electric bg-electric text-white'
                    : 'border-ink/20 text-mute hover:border-sky hover:text-ink',
                )}
              >
                {c.label} <span className={cn('ml-1', active ? 'text-white/70' : 'text-mute/70')}>{counts[c.id] ?? 0}</span>
              </button>
            )
          })}
        </div>

        <div className="flex gap-2.5">
          <select
            value={marca}
            onChange={(e) => onMarca(e.target.value)}
            aria-label="Filtrar por marca"
            className="field w-auto py-2.5 text-sm"
          >
            <option value="">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <label className="relative flex-1 lg:w-72">
            <span className="sr-only">Buscar zapatillas</span>
            <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar modelo…"
              className="field py-2.5 pl-10 text-sm"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
