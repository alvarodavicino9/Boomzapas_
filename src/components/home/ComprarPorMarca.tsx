import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { useProductos } from '@/context/ProductsContext'
import { Icon } from '@/components/ui/Icon'
import { SectionHead, rail } from './SectionHead'
import { LogoMarca } from './LogoMarca'

/** Las cinco marcas de la tienda, cada una con un par de muestra. Llevan al catálogo filtrado por marca. */
const MARCAS = [
  { marca: 'Nike', foto: '/fotos/modelos/nike-sb-dunk-panda/portada.jpg', color: '#f26a21' },
  { marca: 'Adidas', foto: '/fotos/modelos/adidas-samba-clasicas/portada.jpg', color: '#2d6cdf' },
  { marca: 'Puma', foto: '/fotos/modelos/puma-180-total-black/portada.jpg', color: '#d92c37' },
  { marca: 'Vans', foto: '/fotos/modelos/vans-knu-gum-blue/portada.jpg', color: '#c8102e' },
  { marca: 'New Balance', foto: '/fotos/modelos/new-balance-530-cloud-grey/portada.jpg', color: '#8a8f98' },
]

export function ComprarPorMarca() {
  const { productos } = useProductos()
  const cantidad = useMemo(() => {
    const c: Record<string, number> = {}
    for (const p of productos) c[p.marca.toLowerCase()] = (c[p.marca.toLowerCase()] ?? 0) + 1
    return c
  }, [productos])

  return (
    <section className="page-x pt-12 sm:pt-16" aria-labelledby="por-marca">
      <SectionHead id="por-marca" eyebrow="Elegí tu marca" title="Comprá por marca" action={{ label: 'Ver todo', to: '/catalogo' }} />
      <ul className={rail('sm:grid-cols-3 lg:grid-cols-5')}>
        {MARCAS.map((m) => {
          const n = cantidad[m.marca.toLowerCase()] ?? 0
          return (
            <li key={m.marca} className="w-[44%] shrink-0 snap-start sm:w-auto">
              <Link
                to={`/catalogo?marca=${encodeURIComponent(m.marca)}`}
                className="group relative block overflow-hidden rounded-2xl ring-1 ring-line transition-shadow duration-300 hover:shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]"
              >
                <span className="foto-estudio relative block">
                  <ProductImage
                    src={m.foto}
                    alt=""
                    sizes="(min-width: 1024px) 230px, (min-width: 640px) 31vw, 44vw"
                    className="aspect-[4/5] w-full !bg-transparent !object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  {/* franja de color de la marca */}
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: m.color }} />
                  <span className="absolute left-2.5 top-3 grid h-9 place-items-center rounded-full bg-white px-3.5 shadow-[0_4px_12px_rgb(0_0_0/0.15)] sm:left-3 sm:top-4 sm:h-10 sm:px-4">
                    <LogoMarca marca={m.marca} className="h-4 sm:h-[18px]" texto="text-[16px] sm:text-[18px]" />
                  </span>
                </span>
                <span className="flex items-center justify-between gap-2 bg-card px-3 py-3 sm:px-4">
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold leading-5 sm:text-[15px]">{m.marca}</span>
                    <span className="block text-[12px] leading-4 text-index">{n > 0 ? `${n} ${n === 1 ? 'modelo' : 'modelos'}` : 'Ver modelos'}</span>
                  </span>
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-full text-white transition-transform duration-300 group-hover:translate-x-0.5"
                    style={{ background: m.color }}
                  >
                    <Icon name="arrow" size={14} />
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
