import { Link } from 'react-router-dom'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { formatARS } from '@/lib/format'
import { srcsetWebp } from '@/lib/imagenes'

/**
 * Banner de ofertas (el diseño de la carpeta BANNERS WEB). Lleva al catálogo con el filtro "En oferta".
 * En la compu se ve entero. En el celular el texto del banner queda chico y cortado, así que se muestra sólo
 * la parte de la derecha (ticket, etiqueta SALE y logo) y la promo va abajo en texto.
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
          {/* en el celular: el marco es un poco más bajo que la foto y la recorta desde abajo, así no asoma la línea de texto de arriba */}
          <div className="overflow-hidden max-sm:flex max-sm:aspect-[1.82/1] max-sm:items-end">
            <img
              src="/fotos/banners/ofertas.jpg"
              srcSet={srcsetWebp('/fotos/banners/ofertas.jpg')}
              sizes="(min-width: 1700px) 1600px, (min-width: 640px) 100vw, 200vw"
              alt={`Ofertas: increíbles descuentos llevando ${minimo} pares o más. Ver ofertas.`}
              width={2000}
              height={750}
              loading="lazy"
              decoding="async"
              className="block aspect-[1.62/1] w-full object-cover object-[85%_50%] transition-transform duration-700 ease-out motion-reduce:transition-none sm:aspect-[2000/750] sm:group-hover:scale-[1.012]"
            />
          </div>
          {/* en el celular, debajo de la foto, la promo en texto */}
          <span className="flex items-end justify-between gap-4 bg-[#140b0c] px-5 pb-5 pt-4 text-white sm:hidden">
            <span>
              <span className="display-section block !text-[28px] !leading-none">
                Ofer<span className="text-accent">tas</span>
              </span>
              <span className="mt-2 block text-[13px] leading-5 text-white/75">
                <b className="font-semibold text-white">{formatARS(descuento)} menos por par</b> llevando {minimo} o más
              </span>
            </span>
            <span className="label shrink-0 rounded-full bg-accent px-4 py-2.5 text-white">Ver ofertas</span>
          </span>
        </Link>
      </Reveal>
    </section>
  )
}
