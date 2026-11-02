import { useMemo } from 'react'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { useProductos } from '@/context/ProductsContext'
import { sortProductos } from '@/lib/filters'
import { SectionHead } from './SectionHead'

/** Últimos ingresos: en el celular se deslizan de costado, en la compu son una grilla. */
export function FeaturedProducts() {
  const { productos, status } = useProductos()
  const featured = useMemo(() => sortProductos(productos, 'novedad').slice(0, 8), [productos])

  return (
    <section className="page-x pt-12 sm:pt-16" aria-labelledby="nuevos">
      <SectionHead id="nuevos" eyebrow="Recién llegados" title="Nuevos ingresos" action={{ label: 'Ver todos', to: '/catalogo?nuevos=1' }} />
      <ProductGrid productos={featured} status={status} skeletons={4} rail />
    </section>
  )
}
