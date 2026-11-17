import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { cn } from '@/lib/format'
import { srcsetWebp } from '@/lib/imagenes'

interface Banner {
  /** Nombre corto para los puntos del carrusel. */
  tag: string
  /** Banner diseñado (2000 × 750). En la compu se ve entero, con su texto y su botón. */
  src: string
  alt: string
  to: string
}

const { minimo } = SITE.promoPares

/** Banners de la carpeta BANNERS WEB. Para cambiarlos: reemplazá el .jpg en /public/fotos/banners y corré `npm run fotos`. */
const BANNERS: Banner[] = [
  {
    tag: 'Nuevos modelos',
    src: '/fotos/banners/zapatillas.jpg',
    alt: 'Tus próximas zapatillas están acá. Ver todos los modelos.',
    to: '/catalogo',
  },
  {
    tag: 'Envíos',
    src: '/fotos/banners/envios.jpg',
    alt: 'No son solo zapatillas: más de 500 ventas y 450 clientes, venta mayorista por WhatsApp y envíos gratis a todo el país.',
    to: '/envios',
  },
  {
    tag: 'Ofertas',
    src: '/fotos/banners/ofertas.jpg',
    alt: `Ofertas: increíbles descuentos llevando ${minimo} pares o más. Ver ofertas.`,
    to: '/catalogo?ofertas=1',
  },
]

const INTERVALO_MS = 6000

/**
 * Carrusel de los 3 banners (zapatillas, envíos y ofertas), debajo de los nuevos ingresos.
 * Pasa solo cada 6 segundos (se frena con el mouse encima), con los puntos, deslizando el dedo o con el botón de pausa.
 * Todo el banner es un link.
 */
export function Banners() {
  const reducido = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [actual, setActual] = useState(0)
  const [andando, setAndando] = useState(!reducido)
  const [encima, setEncima] = useState(false)
  const toqueX = useRef<number | null>(null)

  useEffect(() => {
    if (!andando || encima) return
    const id = window.setTimeout(() => setActual((i) => (i + 1) % BANNERS.length), INTERVALO_MS)
    return () => window.clearTimeout(id)
  }, [andando, encima, actual])

  const ir = (d: number) => setActual((i) => (i + d + BANNERS.length) % BANNERS.length)

  return (
    <section
      className="page-x pt-10 max-sm:!px-2.5 sm:pt-14"
      aria-roledescription="carrusel"
      aria-label="Promociones"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onTouchStart={(e) => {
        toqueX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (toqueX.current === null) return
        const dx = e.changedTouches[0].clientX - toqueX.current
        toqueX.current = null
        if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1)
      }}
    >
      <Reveal>
        <div className="mx-auto max-w-[1600px]">
          <div className="relative overflow-hidden rounded-[18px] bg-[#e9e9e7] shadow-[0_30px_70px_-40px_rgb(0_0_0/0.9)] ring-1 ring-black/10 sm:rounded-[28px]">
            <div className="grid">
              {BANNERS.map((b, i) => {
                const activo = i === actual
                return (
                  <Link
                    key={b.src}
                    to={b.to}
                    aria-hidden={!activo}
                    tabIndex={activo ? undefined : -1}
                    aria-roledescription="diapositiva"
                    aria-label={`${i + 1} de ${BANNERS.length}: ${b.tag}`}
                    className={cn(
                      'group col-start-1 row-start-1 block transition-opacity duration-700 ease-out motion-reduce:transition-none',
                      activo ? 'opacity-100' : 'pointer-events-none opacity-0',
                    )}
                  >
                    <img
                      src={b.src}
                      srcSet={srcsetWebp(b.src)}
                      sizes="(min-width: 1700px) 1600px, 100vw"
                      alt={b.alt}
                      width={2000}
                      height={750}
                      loading="lazy"
                      decoding="async"
                      className="block aspect-[2000/750] w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none sm:group-hover:scale-[1.012]"
                    />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* puntos y pausa debajo del banner, así no tapan el diseño */}
          <div className="mt-3 flex items-center justify-center gap-2 sm:mt-4">
            <div className="flex items-center" role="group" aria-label="Elegir banner">
              {BANNERS.map((b, i) => (
                <button
                  key={b.src}
                  type="button"
                  onClick={() => setActual(i)}
                  aria-label={`Banner ${i + 1} de ${BANNERS.length}: ${b.tag}`}
                  aria-current={i === actual}
                  className="group/dot grid h-8 min-w-6 place-items-center px-1"
                >
                  <span
                    className={cn(
                      'block h-1.5 rounded-full transition-all duration-300',
                      i === actual ? 'w-7 bg-accent' : 'w-1.5 bg-control group-hover/dot:bg-index',
                    )}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAndando((v) => !v)}
              aria-label={andando ? 'Pausar el carrusel' : 'Reanudar el carrusel'}
              className="grid size-8 place-items-center rounded-full text-index transition-colors hover:text-ink"
            >
              <Icon name={andando ? 'pause' : 'play'} size={12} />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
