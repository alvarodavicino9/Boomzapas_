import { Link } from 'react-router-dom'
import { BRANDS } from '@/config/site'
import { LogoMarca } from './LogoMarca'

/** Alto de cada logo dentro de la banda (los anchos salen solos de su proporción). */
const ALTO: Record<string, string> = {
  Nike: 'h-6 sm:h-9',
  Adidas: 'h-8 sm:h-12',
  Puma: 'h-9 sm:h-[52px]',
  'New Balance': 'h-7 sm:h-10',
}

/**
 * Banda de marcas: fondo con los colores de la tienda y los logos en blanco, pasando solos.
 * Cada logo lleva al catálogo de esa marca. Se frena al pasar el mouse y queda quieta si la persona pidió menos movimiento.
 */
export function BrandTicker() {
  const track = (oculto: boolean) => (
    <ul className="ticker-track flex shrink-0 items-center" aria-hidden={oculto || undefined}>
      {[0, 1, 2].flatMap((rep) =>
        BRANDS.map((b) => (
          <li key={`${rep}-${b}`} className={rep > 0 ? 'ticker-repeat flex items-center' : 'flex items-center'} aria-hidden={rep > 0 || undefined}>
            <Link
              to={`/catalogo?marca=${encodeURIComponent(b)}`}
              tabIndex={oculto || rep > 0 ? -1 : undefined}
              aria-label={`Ver ${b}`}
              className="flex h-16 items-center px-7 opacity-90 transition-[opacity,transform] duration-300 hover:scale-105 hover:opacity-100 sm:h-24 sm:px-12"
            >
              <LogoMarca marca={b} blanco className={ALTO[b] ?? 'h-7 sm:h-10'} texto="text-[26px] sm:text-[38px]" />
            </Link>
            <span aria-hidden="true" className="size-1.5 shrink-0 rotate-45 bg-white/45 sm:size-2" />
          </li>
        )),
      )}
    </ul>
  )

  return (
    <section className="marcas-banda relative mt-12 overflow-hidden sm:mt-16" aria-labelledby="marcas-titulo">
      <div className="page-x flex items-center justify-between gap-4 pt-5 sm:pt-7">
        <h2 id="marcas-titulo" className="font-display text-[13px] font-extrabold uppercase tracking-[0.18em] text-white sm:text-[15px]">
          Nuestras marcas
        </h2>
        <Link to="/catalogo" className="label flex items-center gap-1.5 text-white/85 hover:text-white">
          Ver catálogo <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="relative pb-3 sm:pb-5">
        <div className="ticker flex w-max" style={{ animationDuration: '34s' }}>
          {track(false)}
          {track(true)}
        </div>
      </div>
    </section>
  )
}
