import { Hero3D } from '@/components/home/Hero3D'
import { Banners } from '@/components/home/Banners'
import { BrandTicker } from '@/components/home/BrandTicker'
import { ComprarPorMarca } from '@/components/home/ComprarPorMarca'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ShopByStyle } from '@/components/home/ShopByStyle'
import { Testimonials } from '@/components/home/Testimonials'
import { BrandStory } from '@/components/home/BrandStory'

/**
 * Inicio: portada 3D, últimos ingresos, banners (zapatillas, envíos y ofertas), banda de marcas, accesos por marca, estilos, reseñas e historia.
 * El llamado final a WhatsApp vive en el pie de página (está en todas las páginas).
 */
export default function HomePage() {
  return (
    <>
      <Hero3D />
      <FeaturedProducts />
      <Banners />
      <BrandTicker />
      <ComprarPorMarca />
      <ShopByStyle />
      <Testimonials />
      <BrandStory />
    </>
  )
}
