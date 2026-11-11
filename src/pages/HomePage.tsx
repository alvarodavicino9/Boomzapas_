import { Hero } from '@/components/home/Hero'
import { BrandTicker } from '@/components/home/BrandTicker'
import { ComprarPorMarca } from '@/components/home/ComprarPorMarca'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ShopByStyle } from '@/components/home/ShopByStyle'
import { Testimonials } from '@/components/home/Testimonials'
import { BrandStory } from '@/components/home/BrandStory'

/**
 * Inicio: banners, últimos ingresos, accesos por marca, banda de marcas, estilos, reseñas e historia.
 * El llamado final a WhatsApp vive en el pie de página (está en todas las páginas).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <ComprarPorMarca />
      <BrandTicker />
      <ShopByStyle />
      <Testimonials />
      <BrandStory />
    </>
  )
}
