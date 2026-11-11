import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { useProductos } from '@/context/ProductsContext'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/format'
import type { Producto } from '@/types'
import { SectionHead } from './SectionHead'

const ESTILOS: { cat: string; label: string; texto: string; icon: IconName; fondo: string; anillo: string }[] = [
  {
    cat: 'deportivas',
    label: 'Deportivas',
    texto: 'Livianas y cómodas, para entrenar o para el día a día.',
    icon: 'bolt',
    fondo: 'marcas-banda',
    anillo: 'ring-white/25',
  },
  {
    cat: 'urbanas',
    label: 'Urbanas',
    texto: 'Dunk, Samba, Forum, Jordan, Blazer y Vans para todos los días.',
    icon: 'sparkle',
    fondo: 'banda-marcas',
    anillo: 'ring-white/15',
  },
]

/** Hasta 4 pares de la categoría, de marcas y modelos distintos si se puede, para la vista previa. */
function muestra(productos: Producto[], cat: string) {
  const lista = productos.filter((p) => p.categoria === cat && p.imagenes[0])
  // primero un par de cada familia de modelo (Dunk, Samba, Duramo…) y de marcas distintas
  const familia = (p: Producto) => p.nombre.split(' ').slice(0, 3).join(' ').toLowerCase()
  const elegidos: Producto[] = []
  const vistas = new Set<string>()
  const marcas = new Set<string>()
  for (const p of lista)
    if (elegidos.length < 4 && !marcas.has(p.marca) && !vistas.has(familia(p))) (elegidos.push(p), marcas.add(p.marca), vistas.add(familia(p)))
  for (const p of lista) if (elegidos.length < 4 && !vistas.has(familia(p))) (elegidos.push(p), vistas.add(familia(p)))
  for (const p of lista) if (elegidos.length < 4 && !elegidos.includes(p)) elegidos.push(p)
  return { total: lista.length, pares: elegidos, marcas: [...new Set(lista.map((p) => p.marca))] }
}

/** Dos puertas de entrada al catálogo: deportivas y urbanas, cada una con una vista previa de sus pares. */
export function ShopByStyle() {
  const { productos } = useProductos()
  const datos = useMemo(() => Object.fromEntries(ESTILOS.map((e) => [e.cat, muestra(productos, e.cat)])), [productos])

  return (
    <section className="page-x pt-12 sm:pt-16" aria-labelledby="estilo">
      <SectionHead id="estilo" eyebrow="Elegí tu onda" title="Comprá por estilo" />
      <ul className="grid gap-4 lg:grid-cols-2">
        {ESTILOS.map((e) => {
          const d = datos[e.cat]
          return (
            <li key={e.cat}>
              <Link
                to={`/catalogo?cat=${e.cat}`}
                className={cn(
                  e.fondo,
                  'group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl p-4 text-white transition-shadow duration-300 hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)] sm:flex-row sm:items-stretch sm:p-5',
                )}
              >
                {/* texto */}
                <span className="flex flex-col justify-between gap-5 p-2 sm:w-[44%] sm:p-3">
                  <span>
                    <span className={cn('grid size-11 place-items-center rounded-2xl bg-white/12 ring-1 ring-inset', e.anillo)}>
                      <Icon name={e.icon} size={20} />
                    </span>
                    <span className="mt-4 block font-display text-[1.7rem] font-extrabold uppercase leading-none tracking-tight sm:text-[2rem]">
                      {e.label}
                    </span>
                    <span className="mt-2.5 block text-[13.5px] leading-5 text-white/80">{e.texto}</span>
                    {d.marcas.length > 0 && (
                      <span className="mt-4 flex flex-wrap gap-1.5">
                        {d.marcas.map((m) => (
                          <span key={m} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ring-white/15">
                            {m}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="inline-flex h-11 w-fit items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 text-[13px] font-bold text-black transition-colors group-hover:bg-black group-hover:text-white">
                    Ver {d.total > 0 ? `${d.total} modelos` : 'modelos'}
                    <Icon name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>

                {/* vista previa de pares */}
                <span className="grid flex-1 grid-cols-2 gap-2.5">
                  {d.pares.map((p, i) => (
                    <span
                      key={p.id}
                      className="foto-estudio relative block overflow-hidden rounded-2xl ring-1 ring-black/10 transition-transform duration-500"
                      style={{ transitionDelay: `${i * 40}ms` }}
                    >
                      <ProductImage
                        src={p.imagenes[0]}
                        alt=""
                        sizes="(min-width: 1024px) 160px, 45vw"
                        className="aspect-square w-full !bg-transparent !object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                      <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-lg bg-black/55 px-2 py-1 text-[10.5px] font-semibold text-white backdrop-blur-sm">
                        {p.nombre}
                      </span>
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
