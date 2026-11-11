import { useEffect, useState } from 'react'
import { ProductCard } from './ProductCard'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { useProductos } from '@/context/ProductsContext'
import { useAbrirProducto } from '@/hooks/useAbrirProducto'
import { rail as railClases } from '@/components/home/SectionHead'
import { cn } from '@/lib/format'
import type { Producto } from '@/types'

interface ProductGridProps {
  productos: Producto[]
  status: 'loading' | 'ready' | 'error'
  skeletons?: number
  emptyMessage?: string
  onResetFilters?: () => void
  /** Columnas en pantallas grandes. */
  cols?: 3 | 4
  /** En el celular, una fila que se desliza con el dedo (para el inicio). */
  rail?: boolean
  /** Cuántos pares mostrar de entrada; el resto aparece con "Cargar más" (de a la misma cantidad). */
  paginar?: number
}

export function ProductGrid({
  productos,
  status,
  skeletons = 8,
  emptyMessage,
  onResetFilters,
  cols = 4,
  rail = false,
  paginar,
}: ProductGridProps) {
  const abrir = useAbrirProducto()
  const { error, reload } = useProductos()
  const [visibles, setVisibles] = useState(paginar ?? Infinity)
  // al cambiar los filtros o el orden se vuelve a empezar desde los primeros
  useEffect(() => setVisibles(paginar ?? Infinity), [productos, paginar])

  const grid = cn(
    'grid grid-cols-2 gap-3 sm:gap-4 md:gap-5',
    cols === 4 ? 'md:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-3',
  )

  if (status === 'loading') {
    return (
      <div className={grid} aria-busy="true">
        {Array.from({ length: skeletons }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[3/4] rounded-[18px]" />
            <div className="skeleton mt-3 h-3 w-1/3" />
            <div className="skeleton mt-2 h-4 w-2/3" />
            <div className="skeleton mt-3 h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="border-t border-line py-16 text-center">
        <p className="display-product">No pudimos cargar el catálogo</p>
        <p className="body-text mt-3">{error}</p>
        <Button onClick={reload} variant="outline" className="mt-8">
          Reintentar
        </Button>
      </div>
    )
  }

  if (productos.length === 0) {
    return (
      <div className="border-t border-line py-16 text-center">
        <p className="display-product">Sin resultados</p>
        <p className="body-text mt-3">{emptyMessage ?? 'No hay productos para mostrar.'}</p>
        {onResetFilters && (
          <Button variant="outline" onClick={onResetFilters} className="mt-8">
            Limpiar filtros
          </Button>
        )}
      </div>
    )
  }

  if (rail) {
    return (
      <div className={railClases(cols === 4 ? 'sm:grid-cols-3 xl:grid-cols-4' : 'sm:grid-cols-3')}>
        {/* una sola fila: en el celular se desliza; en la compu se muestran los que entran (3 o 4) */}
        {productos.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              'w-[64%] shrink-0 snap-start sm:w-auto',
              i >= 4 && 'sm:hidden',
              i === 3 && (cols === 4 ? 'sm:hidden xl:block' : 'sm:hidden'),
            )}
          >
            <ProductCard producto={p} onOpen={abrir} />
          </div>
        ))}
      </div>
    )
  }

  const mostrados = productos.slice(0, visibles)
  const faltan = productos.length - mostrados.length

  return (
    <>
      <div className={grid}>
        {mostrados.map((p, i) => (
          // la primera fila se pide ya (es lo primero que se ve); el resto, a medida que se scrollea
          <ProductCard key={p.id} producto={p} onOpen={abrir} eager={i < 4} />
        ))}
      </div>
      {paginar && productos.length > paginar && (
        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
          <p className="text-[13px] text-index">
            Viendo <span className="font-semibold text-ink">{mostrados.length}</span> de {productos.length} modelos
          </p>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(mostrados.length / productos.length) * 100}%` }} />
          </div>
          {faltan > 0 && (
            <Button variant="accent" className="mt-2 min-w-[240px]" onClick={() => setVisibles((v) => v + paginar)}>
              Cargar más <Icon name="chevron" size={17} />
            </Button>
          )}
        </div>
      )}
    </>
  )
}
