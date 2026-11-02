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
      <h1 className="sr-only">Boom Zapas: zapatillas en Córdoba con envíos a todo el país</h1>
      <div className="relative mx-auto max-w-[1600px] overflow-hidden rounded-[22px] bg-[#e9e9e7] shadow-[0_30px_70px_-40px_rgb(0_0_0/0.8)] ring-1 ring-black/10 sm:rounded-[28px]">
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

        {/* flechas */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Banner anterior"
          className="absolute left-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-black shadow-card backdrop-blur transition-colors hover:bg-black hover:text-white sm:grid"
        >
          <Icon name="arrow" size={20} className="rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Banner siguiente"
          className="absolute right-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-black shadow-card backdrop-blur transition-colors hover:bg-black hover:text-white sm:grid"
        >
          <Icon name="arrow" size={20} />
        </button>
      </div>

      {/* puntos y pausa, debajo del banner para no tapar el diseño */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="flex items-center gap-0.5" role="group" aria-label="Elegir banner">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Banner ${i + 1} de ${SLIDES.length}: ${s.tag}`}
              aria-current={i === index}
              className="group/dot grid h-7 min-w-7 place-items-center"
            >
              <span
                className={cn(
                  'block h-2 rounded-full transition-all',
                  i === index ? 'w-8 bg-accent' : 'w-2 bg-control group-hover/dot:bg-index',
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={!playing}
          className="label min-h-7 px-1 text-[10px] text-index hover:text-ink"
        >
          {playing ? 'Pausa' : 'Reanudar'}
        </button>
      </div>
    </section>
  )
}
