import { Hero } from '@/components/home/Hero'
import { BrandTicker } from '@/components/home/BrandTicker'
import { ComprarPorMarca } from '@/components/home/ComprarPorMarca'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ShopByStyle } from '@/components/home/ShopByStyle'
import { Testimonials } from '@/components/home/Testimonials'
import { BrandStory } from '@/components/home/BrandStory'

/**
 * Inicio: banners, últimos ingresos, banda de marcas, accesos por marca, estilos, reseñas e historia.
 * El llamado final a WhatsApp vive en el pie de página (está en todas las páginas).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <BrandTicker />
      <ComprarPorMarca />
      <ShopByStyle />
      <Testimonials />
      <BrandStory />
    </>
  )
}
