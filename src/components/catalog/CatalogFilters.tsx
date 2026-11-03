import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { CATEGORIAS, DEFAULT_TALLES } from '@/config/site'
import { PRICE_RANGES, type FilterState } from '@/lib/filters'
import { cn, formatARS } from '@/lib/format'

interface CatalogFiltersProps {
  value: FilterState
  onChange: (patch: Partial<FilterState>) => void
  query: string
  onQuery: (q: string) => void
  counts: Record<string, number>
  marcas: { nombre: string; total: number }[]
  talles: { talle: string; total: number }[]
  rango: { min: number; max: number }
  onReset: () => void
  activeCount: number
}

/**
 * Grupo plegable de filtros: título, contador de elegidos y flecha.
 * Arranca cerrado (así el panel es corto) salvo que ya tenga un filtro elegido.
 */
function Group({
  id,
  title,
  icon,
  badge = 0,
  defaultOpen,
  children,
}: {
  id: string
  title: string
  icon: IconName
  badge?: number
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details className="group border-b border-line py-1 last:border-b-0" open={defaultOpen ?? badge > 0}>
      <summary className="-mx-2 flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent/[0.07] [&::-webkit-details-marker]:hidden">
        <h2 id={id} className="label flex items-center gap-3 text-ink">
          <span className="grid size-8 place-items-center rounded-lg bg-accent/10 text-[color:var(--bz-accent-text)] transition-colors group-open:bg-accent group-open:text-on-accent">
            <Icon name={icon} size={15} />
          </span>
          {title}
          {badge > 0 && (
            <span className="grid min-w-[18px] place-items-center rounded-full bg-accent px-1.5 text-[10px] font-bold leading-[18px] text-on-accent">
              {badge}
            </span>
          )}
        </h2>
        <Icon name="chevron" size={16} className="text-index transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-4 pt-1">{children}</div>
    </details>
  )
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="min-w-0">
        <span className="label block">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] normal-case leading-4 tracking-normal text-index">{hint}</span>}
      </span>
      <span className="relative shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="block h-6 w-11 rounded-full bg-control/60 transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

/** Panel de filtros completo: búsqueda, categoría, marcas, talle, precio (rangos y mínimo/máximo) y disponibilidad. */
export function CatalogFilters({ value, onChange, query, onQuery, counts, marcas, talles, rango, onReset, activeCount }: CatalogFiltersProps) {
  const tallesList = talles.length ? talles : DEFAULT_TALLES.map((t) => ({ talle: t, total: 0 }))

  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const money = (v: string) => v.replace(/\D/g, '').slice(0, 7)

  return (
    <div className="surface overflow-hidden lg:max-h-[calc(100svh-var(--header-h)-56px)] lg:overflow-y-auto">
      {/* cabecera con los colores de la marca */}
      <div className="on-bar relative flex items-center justify-between gap-3 overflow-hidden px-5 py-4 sm:px-6">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -top-16 size-40 rounded-full bg-[radial-gradient(circle,rgb(var(--bz-glow)/0.7),transparent_70%)]"
        />
        <div className="relative flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[linear-gradient(180deg,#ea3a45,#c41f2b)] text-white shadow-[0_8px_18px_-8px_rgb(217_44_55/0.9)]">
            <Icon name="filter" size={17} />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-5 text-white">Filtros</p>
            <p className="text-[11.5px] leading-4 text-white/65">{activeCount > 0 ? `${activeCount} ${activeCount === 1 ? 'elegido' : 'elegidos'}` : 'Elegí lo que buscás'}</p>
          </div>
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="relative rounded-full border border-white/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white hover:bg-white hover:text-black">
            Limpiar
          </button>
        )}
      </div>

      <div className="px-5 py-2 sm:px-6">
        <Group id="f-buscar" title="Buscar" icon="search" badge={query.trim() ? 1 : 0}>
          <label htmlFor="f-q" className="sr-only">
            Buscar modelo o marca
          </label>
          <div className="relative">
            <input
              id="f-q"
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Modelo o marca"
              autoComplete="off"
              className="field-line !pr-10 normal-case"
            />
            <Icon name="search" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-index" />
          </div>
        </Group>

        <Group id="f-cat" title="Categoría" icon="grid" badge={value.categoria !== 'todos' ? 1 : 0}>
          <ul className="space-y-1" role="radiogroup" aria-labelledby="f-cat">
            {CATEGORIAS.map((c) => {
              const active = value.categoria === c.id
              return (
                <li key={c.id}>
                  <button
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange({ categoria: c.id })}
                    className={cn(
                      'label flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-ink/[0.06]',
                      active && 'bg-accent/15 text-ink',
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn('size-2 rounded-full border border-control', active && 'border-accent bg-accent')} />
                      {c.label}
                    </span>
                    <span className="text-index">{counts[c.id] ?? 0}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Group>

        {marcas.length > 1 && (
          <Group id="f-marca" title="Marca" icon="star" badge={value.marcas.length}>
            <ul className="space-y-1">
              {marcas.map((m) => (
                <li key={m.nombre}>
                  <label className="label flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-ink/[0.06]">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="check"
                        checked={value.marcas.includes(m.nombre)}
                        onChange={() => onChange({ marcas: toggleIn(value.marcas, m.nombre) })}
                      />
                      {m.nombre}
                    </span>
                    <span className="text-index">{m.total}</span>
                  </label>
                </li>
              ))}
            </ul>
          </Group>
        )}

        <Group id="f-talle" title="Talle (AR)" icon="tag" badge={value.talle ? 1 : 0}>
          <div className="grid grid-cols-4 gap-2" role="group" aria-labelledby="f-talle">
            {tallesList.map(({ talle, total }) => (
              <button
                key={talle}
                aria-pressed={value.talle === talle}
                disabled={talles.length > 0 && total === 0}
                onClick={() => onChange({ talle: value.talle === talle ? '' : talle })}
                className="chip !h-11 !min-w-0"
                title={total ? `${total} ${total === 1 ? 'modelo' : 'modelos'} en talle ${talle}` : undefined}
              >
                {talle}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-4 text-index">Mostramos los modelos con stock en ese talle.</p>
        </Group>

        <Group id="f-precio" title="Precio" icon="card" badge={value.precios.length + (value.pmin || value.pmax ? 1 : 0)}>
          <ul className="space-y-1">
            {PRICE_RANGES.map((r) => (
              <li key={r.id}>
                <label className="label flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-ink/[0.06]">
                  <input
                    type="checkbox"
                    className="check"
                    checked={value.precios.includes(r.id)}
                    onChange={() => onChange({ precios: toggleIn(value.precios, r.id) })}
                  />
                  {r.label}
                </label>
              </li>
            ))}
          </ul>
          <p className="label mb-2 mt-5 text-index">Rango personalizado</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="sr-only">Precio mínimo</span>
              <input
                inputMode="numeric"
                placeholder={`Desde ${formatARS(rango.min)}`}
                value={value.pmin}
                onChange={(e) => onChange({ pmin: money(e.target.value) })}
                className="field-line normal-case !px-3"
              />
            </label>
            <label className="block">
              <span className="sr-only">Precio máximo</span>
              <input
                inputMode="numeric"
                placeholder={`Hasta ${formatARS(rango.max)}`}
                value={value.pmax}
                onChange={(e) => onChange({ pmax: money(e.target.value) })}
                className="field-line normal-case !px-3"
              />
            </label>
          </div>
        </Group>

        <Group id="f-disp" title="Disponibilidad" icon="box" badge={(value.stock ? 1 : 0) + (value.nuevos ? 1 : 0)}>
          <div className="space-y-5">
            <Toggle checked={value.stock} onChange={(v) => onChange({ stock: v })} label="Solo con stock" hint="Oculta los modelos agotados." />
            <Toggle checked={value.nuevos} onChange={(v) => onChange({ nuevos: v })} label="Nuevos ingresos" hint="Los últimos pares que llegaron." />
          </div>
        </Group>
      </div>
    </div>
  )
}
