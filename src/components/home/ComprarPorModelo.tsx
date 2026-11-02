import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { useProductos } from '@/context/ProductsContext'
import { normText } from '@/lib/filters'
import { SectionHead, rail } from './SectionHead'

/** Accesos por familia de modelo, con una foto de estudio de cada una. Busca por texto en el catálogo. */
const MODELOS = [
  { label: 'Dunk', q: 'dunk', foto: '/fotos/modelos/nike-sb-dunk-panda/1.jpg' },
  { label: 'Samba', q: 'samba', foto: '/fotos/modelos/adidas-samba-white-green/1.jpg' },
  { label: 'Jordan x Travis', q: 'jordan', foto: '/fotos/modelos/nike-air-jordan-1-mocca-x-travis/1.jpg' },
  { label: 'Vans Knu', q: 'knu', foto: '/fotos/modelos/vans-knu-gum-blue/1.jpg' },
  { label: 'New Balance 530', q: '530', foto: '/fotos/modelos/new-balance-530-platino/1.jpg' },
  { label: 'Blazer', q: 'blazer', foto: '/fotos/modelos/nike-blazer-mid-77-vintage/1.jpg' },
]

export function ComprarPorModelo() {
  const { productos } = useProductos()
  const cantidad = useMemo(() => {
    const c: Record<string, number> = {}
    for (const m of MODELOS) c[m.q] = productos.filter((p) => normText(p.nombre).includes(m.q)).length
    return c
  }, [productos])

  return (
    <section className="page-x pt-10 sm:pt-14" aria-labelledby="por-modelo">
      <SectionHead id="por-modelo" eyebrow="Fotos reales" title="Comprá por modelo" action={{ label: 'Ver todo', to: '/catalogo' }} />
      <ul className={rail('sm:grid-cols-3 lg:grid-cols-6')}>
        {MODELOS.map((m) => (
          <li key={m.q} className="w-[42%] shrink-0 snap-start sm:w-auto">
            <Link to={`/catalogo?q=${encodeURIComponent(m.q)}`} className="group block">
              <span className="block overflow-hidden rounded-2xl bg-stage ring-1 ring-line">
                <ProductImage
                  src={m.foto}
                  alt=""
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 31vw, 42vw"
                  className="aspect-square w-full transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </span>
              <span className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-semibold leading-5">{m.label}</span>
                {cantidad[m.q] > 0 && <span className="shrink-0 text-[12px] text-index">{cantidad[m.q]}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
