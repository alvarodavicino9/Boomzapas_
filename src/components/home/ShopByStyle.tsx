import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { useProductos } from '@/context/ProductsContext'
import { SectionHead } from './SectionHead'

const ESTILOS = [
  { cat: 'deportivas', label: 'Deportivas', texto: 'Duramo, Adizero, New Balance 530', foto: '/fotos/modelos/adidas-adizero-evo-sl-pink/1.jpg', fondo: 'marcas-banda' },
  { cat: 'urbanas', label: 'Urbanas', texto: 'Dunk, Samba, Forum, Jordan, Blazer, Vans', foto: '/fotos/modelos/nike-air-jordan-1-mocca-x-travis/1.jpg', fondo: 'on-bar bg-bar' },
]

/** Dos puertas de entrada al catálogo: deportivas y urbanas. */
export function ShopByStyle() {
  const { productos } = useProductos()
  const total = (cat: string) => productos.filter((p) => p.categoria === cat).length

  return (
    <section className="page-x pt-12 sm:pt-16" aria-labelledby="estilo">
      <SectionHead id="estilo" eyebrow="Elegí tu onda" title="Comprá por estilo" />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4">
        {ESTILOS.map((e) => (
          <li key={e.cat}>
            <Link
              to={`/catalogo?cat=${e.cat}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl ring-1 ring-line transition-shadow duration-300 hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.5)] sm:flex-row"
            >
              <span className="foto-estudio block overflow-hidden sm:w-[46%] sm:shrink-0">
                <ProductImage
                  src={e.foto}
                  alt=""
                  sizes="(min-width: 640px) 24vw, 50vw"
                  className="aspect-[4/5] size-full !bg-transparent object-cover transition-transform duration-500 group-hover:scale-[1.05] sm:aspect-[3/4]"
                />
              </span>
              <span className={`${e.fondo} relative flex flex-1 flex-col justify-between gap-4 overflow-hidden p-3.5 text-white sm:p-7 lg:p-9`}>
                <span className="relative">
                  <span className="label block text-[10px] text-white/70 sm:text-[11px]">Zapatillas</span>
                  <span className="mt-1.5 block font-display text-[1.02rem] font-extrabold uppercase leading-none tracking-tight sm:mt-2 sm:text-[1.5rem] lg:text-[2rem] xl:text-[2.3rem]">
                    {e.label}
                  </span>
                  <span className="mt-2 line-clamp-3 block text-[11.5px] leading-4 text-white/80 sm:mt-3 sm:text-[14px] sm:leading-5">{e.texto}</span>
                </span>
                <span className="relative inline-flex h-9 w-fit items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-[12px] font-bold text-black transition-colors group-hover:bg-black group-hover:text-white sm:h-11 sm:px-5 sm:text-[13px]">
                  {total(e.cat) ? (
                    <>
                      Ver {total(e.cat)}
                      <span className="hidden sm:inline"> modelos</span>
                    </>
                  ) : (
                    'Ver modelos'
                  )}
                  <span aria-hidden="true">→</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
