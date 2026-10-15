import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRANDS } from '@/config/site'

/** Marcas con logo en public/marcas/<slug>.svg. Para sumar uno: copiá el archivo con ese nombre y listo. */
const CON_LOGO = new Set(['nike', 'adidas', 'jordan', 'new-balance', 'puma'])
/** Ancho de cada logo (px) para que todos se vean parejos dentro de la tarjeta. */
const ANCHO: Record<string, number> = { nike: 150, adidas: 104, jordan: 62, 'new-balance': 120, puma: 82 }
const slug = (b: string) => b.toLowerCase().replace(/\s+/g, '-')

function BrandCard({ brand, hidden }: { brand: string; hidden: boolean }) {
  const [sinLogo, setSinLogo] = useState(!CON_LOGO.has(slug(brand)))
  return (
    <Link
      to={`/catalogo?marca=${encodeURIComponent(brand)}`}
      tabIndex={hidden ? -1 : undefined}
      aria-label={hidden ? undefined : brand}
      className="group mx-[15px] grid h-[95px] w-[210px] shrink-0 place-items-center rounded-xl bg-white p-[15px] shadow-[0_4px_12px_rgb(0_0_0/0.3)] transition-transform duration-300 hover:-translate-y-1 max-sm:mx-[8px] max-sm:h-[76px] max-sm:w-[150px] max-sm:p-3"
    >
      {sinLogo ? (
        <span className="font-display text-[1.45rem] font-extrabold uppercase italic tracking-tight text-black max-sm:text-[1.1rem]">
          {brand}
        </span>
      ) : (
        <img
          src={`/marcas/${slug(brand)}.svg`}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setSinLogo(true)}
          className="h-auto max-h-full object-contain grayscale-[0.2] transition-[filter] group-hover:grayscale-0"
          style={{ width: ANCHO[slug(brand)] ?? 110 }}
        />
      )}
    </Link>
  )
}

/**
 * "Nuestras marcas destacadas": banda oscura con tarjetas blancas que pasan solas.
 * Cada tarjeta lleva al catálogo filtrado por marca. Se frena al pasar el mouse y queda quieta si la persona pidió menos movimiento.
 */
export function BrandTicker() {
  // Dos vueltas por tramo para que la cinta cubra pantallas anchas sin huecos.
  const track = (hidden: boolean) => (
    <ul className="ticker-track flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {[0, 1].flatMap((rep) =>
        BRANDS.map((b) => (
          <li key={`${rep}-${b}`} className={rep === 1 ? 'ticker-repeat flex items-center' : 'flex items-center'}>
            <BrandCard brand={b} hidden={hidden || rep === 1} />
          </li>
        )),
      )}
    </ul>
  )

  return (
    <section className="on-bar relative mt-10 overflow-hidden py-9" aria-labelledby="marcas-titulo">
      <h2 id="marcas-titulo" className="display-section mb-6 px-4 text-center text-[1.05rem] tracking-[0.04em] sm:text-[1.3rem]">
        Nuestras marcas destacadas
      </h2>
      <div className="relative">
        <div className="ticker flex w-max [animation-direction:reverse]" style={{ animationDuration: '30s' }}>
          {track(false)}
          {track(true)}
        </div>
        {/* bordes que se desvanecen */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bar to-transparent sm:w-40" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bar to-transparent sm:w-40" />
      </div>
    </section>
  )
}
