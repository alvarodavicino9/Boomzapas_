import { useState } from 'react'
import { ProductCard } from './ProductCard'
import { ProductDialog } from './ProductDialog'
import { Button } from '@/components/ui/Button'
import { useProductos } from '@/context/ProductsContext'
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
}

export function ProductGrid({ productos, status, skeletons = 8, emptyMessage, onResetFilters, cols = 4 }: ProductGridProps) {
  const [selected, setSelected] = useState<Producto | null>(null)
  const { error, reload } = useProductos()

  const grid = cn(
    'grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-5',
    cols === 4 ? 'md:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-3',
  )

  if (status === 'loading') {
    return (
      <div className={grid} aria-busy="true">
        {Array.from({ length: skeletons }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-4 h-4 w-2/3" />
            <div className="skeleton mt-2 h-4 w-1/3" />
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

  return (
    <>
      <div className={grid}>
        {productos.map((p, i) => (
          // la primera fila se pide ya (es lo primero que se ve); el resto, a medida que se scrollea
          <ProductCard key={p.id} producto={p} onOpen={setSelected} eager={i < 4} />
        ))}
      </div>
      <ProductDialog producto={selected} onClose={() => setSelected(null)} onSelect={setSelected} />
    </>
  )
}
