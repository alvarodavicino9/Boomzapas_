import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/format'
import { srcsetWebp } from '@/lib/imagenes'

interface Slide {
  /** Nombre corto para los puntos del carrusel. */
  tag: string
  /** Banner diseñado (2048 × 768). El texto y el botón ya vienen en la imagen. */
  src: string
  /** Lo que dice el banner, para lectores de pantalla y Google. */
  alt: string
  to: string
  /** En el celular el banner se recorta: qué parte mostrar (el texto está a la izquierda). */
  focoCelular: string
}

/** Banners de la portada (carpeta BANNERS WEB de Drive). Para cambiarlos: reemplazá el .jpg y corré `npm run fotos`. */
const SLIDES: Slide[] = [
  {
    tag: 'Nuevos modelos',
    src: '/fotos/banners/zapatillas.jpg',
    alt: 'Tus próximas zapatillas están acá. Ver todos los modelos.',
    to: '/catalogo',
    focoCelular: '0% 50%',
  },
  {
    tag: 'Envíos',
    src: '/fotos/banners/envios.jpg',
    alt: 'No son solo zapatillas: más de 500 ventas y 450 clientes, venta mayorista por WhatsApp y envíos gratis a todo el país.',
    to: '/envios',
    focoCelular: '0% 50%',
  },
  {
    tag: 'Ofertas',
    src: '/fotos/banners/ofertas.jpg',
    alt: 'Ofertas: increíbles descuentos llevando 2 pares o más. Ver ofertas.',
    to: '/catalogo',
    focoCelular: '0% 50%',
  },
]

const INTERVAL_MS = 6000

/**
 * Portada: carrusel de banners a todo el ancho del contenido.
 * En la compu se ve el banner entero (proporción 2048 × 768); en el celular se muestra más alto,
 * recortado desde la izquierda para que el texto del banner se lea grande.
 * Todo el banner es un link. Se puede pasar con las flechas, los puntos o deslizando el dedo.
 */
export function Hero() {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(!reduced)
  const [hover, setHover] = useState(false)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    if (!playing || hover) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS)
    return () => window.clearTimeout(id)
  }, [playing, hover, index])

  const go = (delta: number) => setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length)

  return (
    <section
      className="page-x pt-4 sm:pt-6"
      aria-roledescription="carrusel"
      aria-label="Portada"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
      }}
    >
      <h1 className="sr-only">Boom Zapas: zapatillas en Córdoba con envío gratis a todo el país</h1>
      <div className="relative mx-auto max-w-[1600px]">
        {/* luz granate detrás del banner, como el brillo del logo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -bottom-10 top-10 -z-10 rounded-[40px] opacity-70"
          style={{ background: 'radial-gradient(60% 70% at 50% 60%, rgb(var(--bz-glow) / 0.55), transparent 75%)' }}
        />
        <div className="relative overflow-hidden rounded-[22px] bg-[#e9e9e7] shadow-[0_30px_70px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/10 sm:rounded-[28px]">
          <div className="grid">
            {SLIDES.map((s, i) => {
              const active = i === index
              return (
                <Link
                  key={s.src}
                  to={s.to}
                  aria-hidden={!active}
                  tabIndex={active ? undefined : -1}
                  className={cn(
                    'col-start-1 row-start-1 block transition-opacity duration-700 ease-out motion-reduce:transition-none',
                    active ? 'opacity-100' : 'pointer-events-none opacity-0',
                  )}
                >
                  <img
                    src={s.src}
                    srcSet={srcsetWebp(s.src)}
                    sizes="(min-width: 1700px) 1600px, 100vw"
                    alt={s.alt}
                    width={2048}
                    height={768}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    {...(i === 0 ? { fetchpriority: 'high' } : {})}
                    decoding="async"
                    className="block aspect-[16/10] w-full object-cover sm:aspect-[2048/768]"
                    style={{ objectPosition: s.focoCelular }}
                  />
                </Link>
              )
            })}
          </div>
          {/* filo interior para que el banner claro no se corte en seco contra el fondo oscuro */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10" />
        </div>

        {/* puntos debajo del banner: así no tapan el diseño */}
        <div className="mt-3 flex items-center justify-center gap-2 sm:mt-4">
          <div className="flex items-center" role="group" aria-label="Elegir banner">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Banner ${i + 1} de ${SLIDES.length}: ${s.tag}`}
                aria-current={i === index}
                className="group/dot grid h-8 min-w-6 place-items-center px-1"
              >
                <span
                  className={cn(
                    'block h-1.5 rounded-full transition-all duration-300',
                    i === index ? 'w-7 bg-accent' : 'w-1.5 bg-control group-hover/dot:bg-index',
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pausar el carrusel' : 'Reanudar el carrusel'}
            className="grid size-8 place-items-center rounded-full text-index transition-colors hover:text-ink"
          >
            <Icon name={playing ? 'pause' : 'play'} size={12} />
          </button>
        </div>
      </div>
    </section>
  )
}
