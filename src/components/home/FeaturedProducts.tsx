import { useMemo } from 'react'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { Button } from '@/components/ui/Button'
import { useProductos } from '@/context/ProductsContext'
import { sortProductos } from '@/lib/filters'

export function FeaturedProducts() {
  const { productos, status } = useProductos()
  const featured = useMemo(() => sortProductos(productos, 'novedad').slice(0, 8), [productos])

  return (
    <section className="page-x section-y" aria-labelledby="nuevos">
      <h2 id="nuevos" className="display-section title-center mb-10">
        Nuevos ingresos
      </h2>
      <ProductGrid productos={featured} status={status} skeletons={4} />
      <div className="mt-12 flex justify-center">
        <Button to="/catalogo" variant="outline" size="lg">
          Ver todos los modelos
        </Button>
      </div>
    </section>
  )
}
