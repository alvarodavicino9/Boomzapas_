import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BRANDS } from '@/config/site'
import { useProductos } from '@/context/ProductsContext'
import { Icon } from '@/components/ui/Icon'
import { LogoMarca } from './LogoMarca'

/** Alto de cada logo dentro de su recuadro (los anchos salen solos de su proporción). */
const ALTO: Record<string, string> = {
  Nike: 'h-6 sm:h-8',
  Adidas: 'h-8 sm:h-11',
  Puma: 'h-9 sm:h-12',
  'New Balance': 'h-7 sm:h-9',
}

/**
 * Banda de marcas del inicio: bloque con los rojos de la tienda, un título a la izquierda
 * y las cinco marcas en recuadros de vidrio, cada una con la cantidad de modelos y link a su catálogo.
 */
export function BrandTicker() {
  const { productos } = useProductos()
  const cantidad = useMemo(() => {
    const c: Record<string, number> = {}
    for (const p of productos) c[p.marca.toLowerCase()] = (c[p.marca.toLowerCase()] ?? 0) + 1
    return c
  }, [productos])
  const total = productos.length

  return (
    <section className="page-x pt-12 sm:pt-16" aria-labelledby="marcas-titulo">
      <div className="marcas-banda relative isolate overflow-hidden rounded-[22px] px-5 py-8 shadow-[0_40px_80px_-40px_rgb(122_12_21/0.8)] sm:rounded-[30px] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        {/* brillos de fondo */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 -z-10 size-72 rounded-full bg-white/15 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-[-10%] -z-10 size-96 rounded-full bg-black/30 blur-3xl" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-1/2 -z-10 hidden -translate-y-1/2 select-none font-display text-[13rem] font-black uppercase italic leading-none tracking-tighter text-white/[0.06] lg:block"
        >
          Boom
        </span>

        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
              <span aria-hidden="true" className="h-[2px] w-8 bg-white/70" />
              Nuestras marcas
            </p>
            <h2 id="marcas-titulo" className="mt-4 font-display text-[1.55rem] font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-[2.4rem] lg:text-[2.9rem]">
              Las marcas que buscás, <br className="hidden sm:block" />
              en un solo lugar
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-6 text-white/80 sm:text-[15px]">
              {total > 0 ? `${total} modelos` : 'Modelos'} de Nike, Adidas, Puma, Vans y New Balance, con fotos reales de cada par y envío gratis a todo el país.
            </p>
            <Link
              to="/catalogo"
              className="mt-6 inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-[13px] font-bold uppercase tracking-[0.08em] text-black shadow-[0_12px_30px_-12px_rgb(0_0_0/0.6)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Ver todo el catálogo
              <Icon name="arrow" size={16} />
            </Link>
          </div>

          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {BRANDS.map((b, i) => {
              const n = cantidad[b.toLowerCase()] ?? 0
              return (
                <li key={b} className={i === BRANDS.length - 1 && BRANDS.length % 2 === 1 ? 'col-span-2 sm:col-span-1' : undefined}>
                  <Link
                    to={`/catalogo?marca=${encodeURIComponent(b)}`}
                    aria-label={`Ver ${b}${n ? ` (${n} modelos)` : ''}`}
                    className="group relative flex h-[104px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-white/[0.09] ring-1 ring-inset ring-white/20 backdrop-blur-sm transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:bg-white/[0.16] hover:shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)] sm:h-[132px]"
                  >
                    <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    <span className="grid h-12 place-items-center sm:h-14">
                      <LogoMarca marca={b} blanco className={ALTO[b] ?? 'h-7 sm:h-9'} texto="text-[24px] sm:text-[30px]" />
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75 transition-colors group-hover:text-white">
                      {n > 0 ? `${n} ${n === 1 ? 'modelo' : 'modelos'}` : 'Ver modelos'}
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                    </span>
                  </Link>
                </li>
              )
            })}
            <li className="hidden sm:block">
              <Link
                to="/catalogo?nuevos=1"
                className="group flex h-[132px] flex-col items-start justify-between rounded-2xl bg-black/25 p-5 ring-1 ring-inset ring-white/10 transition-colors duration-300 hover:bg-black/35"
              >
                <Icon name="sparkle" size={20} className="text-white" />
                <span>
                  <span className="block text-[15px] font-bold leading-5 text-white">Nuevos ingresos</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70 group-hover:text-white">
                    Ver lo último <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
