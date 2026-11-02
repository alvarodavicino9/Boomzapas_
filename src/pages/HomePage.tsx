import { Hero } from '@/components/home/Hero'
import { BrandTicker } from '@/components/home/BrandTicker'
import { InfoStrip } from '@/components/home/InfoStrip'
import { ComprarPorModelo } from '@/components/home/ComprarPorModelo'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ShopByStyle } from '@/components/home/ShopByStyle'
import { Testimonials } from '@/components/home/Testimonials'
import { BrandStory } from '@/components/home/BrandStory'

/**
 * Inicio: banners, servicios, accesos por modelo, últimos ingresos, marcas, estilos, reseñas e historia.
 * El llamado final a WhatsApp vive en el pie de página (está en todas las páginas).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <InfoStrip />
      <ComprarPorModelo />
      <FeaturedProducts />
      <BrandTicker />
      <ShopByStyle />
      <Testimonials />
      <BrandStory />
    </>
  )
}
