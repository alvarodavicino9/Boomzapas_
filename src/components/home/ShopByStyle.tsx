import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { useProductos } from '@/context/ProductsContext'
import { SectionHead, rail } from './SectionHead'

const ESTILOS = [
  { cat: 'urbanas', label: 'Urbanas', texto: 'Dunk, Samba, Forum, Vans', foto: '/fotos/modelos/nike-sb-dunk-low-graphite-gum/1.jpg' },
  { cat: 'running', label: 'Running', texto: 'Duramo, Adizero, NB 530', foto: '/fotos/modelos/adidas-duramo-speed-2-clasica/1.jpg' },
  { cat: 'lifestyle', label: 'Lifestyle', texto: 'Jordan x Travis, Blazer', foto: '/fotos/modelos/nike-air-jordan-1-mocca-x-travis/1.jpg' },
]

/** Tres puertas de entrada al catálogo, por estilo. En el celular se deslizan de costado. */
export function ShopByStyle() {
  const { productos } = useProductos()
  const total = (cat: string) => productos.filter((p) => p.categoria === cat).length

  return (
    <section className="page-x pt-12 sm:pt-16" aria-labelledby="estilo">
      <SectionHead id="estilo" eyebrow="Elegí tu onda" title="Comprá por estilo" />
      <ul className={rail('sm:grid-cols-3')}>
        {ESTILOS.map((e) => (
          <li key={e.cat} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <Link to={`/catalogo?cat=${e.cat}`} className="group relative block overflow-hidden rounded-2xl bg-stage ring-1 ring-line">
              <ProductImage
                src={e.foto}
                alt=""
                sizes="(min-width: 640px) 31vw, 78vw"
                className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.04] lg:aspect-[5/6]"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-5">
                <span>
                  <span className="block font-display text-[1.5rem] font-extrabold uppercase leading-none tracking-tight sm:text-[1.7rem]">
                    {e.label}
                  </span>
                  <span className="mt-1.5 block text-[12.5px] text-white/80">{e.texto}</span>
                </span>
                <span className="grid h-10 shrink-0 place-items-center rounded-full bg-white px-3.5 text-[12px] font-bold text-black transition-colors group-hover:bg-accent group-hover:text-white">
                  {total(e.cat) ? `Ver ${total(e.cat)}` : 'Ver'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
