import { Link } from 'react-router-dom'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { formatARS } from '@/lib/format'
import { srcsetWebp } from '@/lib/imagenes'

/**
 * Banner de ofertas (el diseño de la carpeta BANNERS WEB). Lleva al catálogo con el filtro "En oferta".
 * En la compu se ve entero; en el celular se recorta desde la izquierda para que "OFERTAS" y el botón se lean grandes.
 */
export function BannerOfertas() {
  const { minimo, descuento } = SITE.promoPares
  return (
    <section className="page-x pt-10 max-sm:!px-2.5 sm:pt-14" aria-label="Ofertas">
      <Reveal>
        <Link
          to="/catalogo?ofertas=1"
          className="group relative mx-auto block max-w-[1600px] overflow-hidden rounded-[18px] bg-[#e9e9e7] shadow-[0_30px_70px_-40px_rgb(0_0_0/0.9)] ring-1 ring-black/10 sm:rounded-[28px]"
        >
          <img
            src="/fotos/banners/ofertas.jpg"
            srcSet={srcsetWebp('/fotos/banners/ofertas.jpg')}
            sizes="(min-width: 1700px) 1600px, (min-width: 640px) 100vw, 200vw"
            alt={`Ofertas: increíbles descuentos llevando ${minimo} pares o más. Ver ofertas.`}
            width={2000}
            height={750}
            loading="lazy"
            decoding="async"
            className="block aspect-[1.32/1] w-full object-cover object-left transition-transform duration-700 ease-out group-hover:scale-[1.012] motion-reduce:transition-none sm:aspect-[2000/750]"
          />
          {/* en el celular, debajo del banner, la promo en texto (en el banner queda chica) */}
          <span className="flex items-center justify-between gap-3 bg-[#140b0c] px-4 py-3.5 text-white sm:hidden">
            <span className="text-[13px] leading-5">
              <b className="font-semibold">{formatARS(descuento)} menos por par</b>
              <span className="block text-white/70">llevando {minimo} o más</span>
            </span>
            <span className="label shrink-0 rounded-full bg-accent px-3.5 py-2 text-white">Ver ofertas</span>
          </span>
        </Link>
      </Reveal>
    </section>
  )
}
