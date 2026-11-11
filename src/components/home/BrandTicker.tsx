import { Link } from 'react-router-dom'
import { BRANDS } from '@/config/site'
import { formatARS, PROMO } from '@/lib/format'
import { LogoMarca } from './LogoMarca'

/** Alto de cada logo dentro de la banda (los anchos salen solos de su proporción). */
const ALTO: Record<string, string> = {
  Nike: 'h-6 sm:h-8',
  Adidas: 'h-8 sm:h-10',
  Puma: 'h-9 sm:h-11',
  'New Balance': 'h-7 sm:h-9',
}

/**
 * Banda de marcas: fondo con los rojos de la tienda y los logos en blanco pasando solos,
 * cada uno en un recuadro de vidrio. Debajo, una cinta oscura con
 * los beneficios que corre al revés. Se frena al pasar el mouse y queda quieta si la persona pidió menos movimiento.
 */
export function BrandTicker() {
  const marcas = (oculto: boolean) => (
    <ul className="ticker-track flex shrink-0 items-center" aria-hidden={oculto || undefined}>
      {[0, 1, 2].flatMap((rep) =>
        BRANDS.map((b) => {
          const escondido = oculto || rep > 0
          return (
            <li key={`${rep}-${b}`} className={rep > 0 ? 'ticker-repeat' : undefined} aria-hidden={rep > 0 || undefined}>
              <Link
                to={`/catalogo?marca=${encodeURIComponent(b)}`}
                tabIndex={escondido ? -1 : undefined}
                aria-label={escondido ? undefined : `Ver ${b}`}
                className="group mx-2 flex h-[72px] w-[150px] items-center justify-center rounded-2xl bg-white/[0.08] ring-1 ring-inset ring-white/20 backdrop-blur-sm transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:bg-white/[0.16] hover:shadow-[0_16px_34px_-16px_rgb(0_0_0/0.65)] sm:mx-2.5 sm:h-[92px] sm:w-[210px]"
              >
                <LogoMarca marca={b} blanco className={ALTO[b] ?? 'h-7 sm:h-9'} texto="text-[22px] sm:text-[30px]" />
              </Link>
            </li>
          )
        }),
      )}
    </ul>
  )

  const BENEFICIOS = [
    'Envío gratis a todo el país',
    `${PROMO.minimo} pares o más: ${formatARS(PROMO.descuento)} off c/u`,
    'Fotos reales de cada par',
    'Talles del 35 al 44',
    'Showroom en Córdoba',
  ]
  const cinta = (oculto: boolean) => (
    <ul className="ticker-track flex shrink-0 items-center" aria-hidden={oculto || undefined}>
      {[0, 1].flatMap((rep) =>
        BENEFICIOS.map((t) => (
          <li key={`${rep}-${t}`} className={rep > 0 ? 'ticker-repeat flex items-center' : 'flex items-center'} aria-hidden={rep > 0 || undefined}>
            <span className="whitespace-nowrap px-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85 sm:px-7 sm:text-[12px]">{t}</span>
            <span aria-hidden="true" className="size-1.5 shrink-0 rotate-45 bg-[#ff6b73]" />
          </li>
        )),
      )}
    </ul>
  )

  return (
    <section className="marcas-banda relative mt-12 overflow-hidden sm:mt-16" aria-labelledby="marcas-titulo">
      <span aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 -z-10 size-72 rounded-full bg-white/15 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-[-8%] -z-10 size-96 rounded-full bg-black/30 blur-3xl" />

      <div className="page-x flex items-end justify-between gap-4 pt-6 sm:pt-9">
        <div>
          <p className="flex items-center gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75 sm:text-[11px]">
            <span aria-hidden="true" className="h-[2px] w-6 bg-white/70" />
            Nuestras marcas
          </p>
          <h2 id="marcas-titulo" className="mt-2 font-display text-[1.3rem] font-extrabold uppercase leading-none tracking-tight text-white sm:text-[1.9rem]">
            Las que buscás, en un solo lugar
          </h2>
        </div>
        <Link
          to="/catalogo"
          className="hidden h-10 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-[12px] font-bold uppercase tracking-[0.08em] text-black shadow-[0_10px_24px_-12px_rgb(0_0_0/0.6)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
        >
          Ver catálogo <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* marcas pasando, con los costados que se desvanecen */}
      <div className="py-5 [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] sm:py-7">
        <div className="ticker flex w-max" style={{ animationDuration: '40s' }}>
          {marcas(false)}
          {marcas(true)}
        </div>
      </div>

      {/* cinta de beneficios que corre al revés */}
      <div className="relative border-t border-white/15 bg-black/30 py-3 backdrop-blur-sm">
        <div className="ticker flex w-max [animation-direction:reverse]" style={{ animationDuration: '32s' }}>
          {cinta(false)}
          {cinta(true)}
        </div>
      </div>
    </section>
  )
}
