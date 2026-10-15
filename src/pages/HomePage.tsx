import { Hero } from '@/components/home/Hero'
import { BrandTicker } from '@/components/home/BrandTicker'
import { InfoStrip } from '@/components/home/InfoStrip'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ShopByStyle } from '@/components/home/ShopByStyle'
import { Testimonials } from '@/components/home/Testimonials'
import { BrandStory } from '@/components/home/BrandStory'
import { PhotoStrip } from '@/components/sections/PhotoStrip'
import { FOTOS } from '@/config/fotos'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { waLink } from '@/lib/whatsapp'

export default function HomePage() {
  return (
    <>
      <Hero />
      <InfoStrip />

      <BrandTicker />

      <PhotoStrip
        flush
        eyebrow="Fotos reales"
        title="Pasá a conocer los pares"
        cta={{ label: 'Ver catálogo completo', to: '/catalogo' }}
        fotos={[
          { foto: FOTOS.nb530Detalle, label: 'New Balance 530', to: '/catalogo?q=530' },
          { foto: FOTOS.sambaDetalle, label: 'Adidas Samba', to: '/catalogo?q=samba' },
          { foto: FOTOS.dunkDetalle, label: 'Dunk low crema', to: '/catalogo?q=dunk' },
          { foto: FOTOS.nb740Suela, label: 'New Balance 740', to: '/catalogo?q=740' },
        ]}
      />

      <FeaturedProducts />
      <ShopByStyle />
      <Testimonials />
      <BrandStory />

      <section className="page-x pb-4 pt-6">
        <Reveal>
          <div className="on-bar grid items-center gap-8 rounded-3xl px-6 py-12 sm:px-12 lg:grid-cols-[1.3fr_1fr]">
            <h2 className="display-section !text-[clamp(1.5rem,3.4vw,2.4rem)]">¿No encontrás tu talle o modelo?</h2>
            <div>
              <p className="body-text max-w-md">
                Escribinos. Conseguimos el par que buscás y te respondemos el mismo día.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={waLink('Hola Boom Zapas. Busco un modelo que no encuentro en la web.')} size="lg">
                  Hablar por WhatsApp
                </Button>
                <Button to="/catalogo" variant="outline" size="lg">
                  Ver catálogo
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
