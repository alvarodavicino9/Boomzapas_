import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { SITE } from '@/config/site'
import { cn, formatARS } from '@/lib/format'
import { srcsetWebp } from '@/lib/imagenes'

interface Slide {
  tag: string
  l1: string
  l2: string
  text: string
  cta: string
  to: string
  /** Foto del banner (se muestra a la derecha, sin marco, fundida con el fondo). */
  src: string
  alt: string
}

const SLIDES: Slide[] = [
  {
    tag: 'Nuevos ingresos',
    l1: 'Nuevos',
    l2: 'Ingresos',
    text: 'Los pares que están entrando ahora.',
    cta: 'Ver nuevos ingresos',
    to: '/catalogo?nuevos=1',
    src: '/fotos/negocio/nb740.jpg',
    alt: 'New Balance 740 blanca, beige y bordó',
  },
  {
    tag: 'Envíos a todo el país',
    l1: 'Envío',
    l2: 'Nacional',
    text: 'Llegamos a todo el país por Correo Argentino, con seguimiento. Retiro sin costo en Córdoba.',
    cta: 'Cómo enviamos',
    to: '/envios',
    src: '/fotos/negocio/samba-verde.jpg',
    alt: 'Adidas Samba blanca con tiras verdes',
  },
  {
    tag: 'Descuento por transferencia',
    l1: formatARS(SITE.transferDiscount),
    l2: 'Off',
    text: 'menos por cada par pagando por transferencia o efectivo.',
    cta: 'Ver medios de pago',
    to: '/pagos',
    src: '/fotos/negocio/dunk.jpg',
    alt: 'Zapatilla estilo Dunk low color crema',
  },
]

const INTERVAL_MS = 7000

/** Grano (ruido SVG) para dar textura de hormigón. */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

const rise = (active: boolean) =>
  cn(
    'transition-[opacity,transform] duration-[800ms] ease-out motion-reduce:transition-none',
    active ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
  )
const dl = (active: boolean, delay: number) => ({ transitionDelay: `${active ? delay : 0}ms` })

/**
 * Portada en formato banner, a todo el ancho: fondo de hormigón claro, titular enorme en negro y color,
 * subtítulo espaciado, botón negro y una foto distinta por slide a la derecha (sin marco, fundida con el fondo).
 * Siempre clara, aunque el sitio sea oscuro.
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
      className="on-light relative isolate overflow-hidden"
      style={{ background: 'linear-gradient(115deg, #f3f3f1 0%, #e3e3e0 55%, #d4d4d0 100%)' }}
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
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      {/* hormigón: sombras diagonales, piso y grano */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-20 -top-24 h-[130%] w-[34%] rotate-[24deg] bg-black/[0.07] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/[0.1] to-transparent" />
        <div className="absolute inset-0 opacity-[0.16] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
      </div>

      <div className="grid">
        {SLIDES.map((s, i) => {
          const active = i === index
          return (
            <div
              key={s.l2}
              aria-hidden={!active}
              {...(!active ? ({ inert: '' } as object) : {})}
              className={cn(
                'relative col-start-1 row-start-1 flex flex-col transition-opacity duration-[900ms] lg:block',
                active ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              {/* texto */}
              <div className="page-x relative z-10 flex items-center pb-6 pt-9 lg:min-h-[clamp(560px,calc(100svh-var(--header-h)),720px)] lg:pb-16 lg:pt-10">
                <div className="max-w-[46rem]">
                  <h1 className="display-hero !text-[clamp(3.2rem,7.4vw,6.8rem)] !leading-[0.86] !tracking-[-0.04em]">
                    <span className={cn('block', rise(active))} style={dl(active, 100)}>{s.l1}</span>
                    <span className={cn('block text-accent', rise(active))} style={dl(active, 250)}>{s.l2}</span>
                  </h1>

                  <span className={cn('mt-7 block h-[3px] w-16 bg-ink', rise(active))} style={dl(active, 400)} aria-hidden="true" />
                  <p
                    className={cn('mt-5 max-w-[22rem] text-[clamp(1.05rem,1.7vw,1.4rem)] font-light leading-snug tracking-[0.04em] text-ink/80', rise(active))}
                    style={dl(active, 470)}
                  >
                    {s.text}
                  </p>

                  <div className={cn('mt-8', rise(active))} style={dl(active, 600)}>
                    <Button to={s.to} size="lg" className="!px-9 !py-5 !text-[14px] tracking-[0.12em]">
                      {s.cta}
                      <Icon name="arrow" size={18} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* foto del banner: a la derecha, sin marco, fundida con el fondo */}
              <div
                className="relative h-[330px] sm:h-[440px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[46%] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_30%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_30%)]"
              >
                <img
                  src={s.src}
                  srcSet={srcsetWebp(s.src)}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  alt={s.alt}
                  width={1100}
                  height={1467}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  {...(i === 0 ? { fetchpriority: 'high' } : {})}
                  decoding="async"
                  className="absolute inset-0 size-full object-cover object-center max-lg:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_20%,#000_82%,transparent_100%)] max-lg:[mask-image:linear-gradient(to_bottom,transparent_0%,#000_20%,#000_82%,transparent_100%)]"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* flechas laterales */}
      <button
        onClick={() => go(-1)}
        aria-label="Diapositiva anterior"
        className="absolute left-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/70 text-ink backdrop-blur hover:bg-black hover:text-white sm:grid"
      >
        <Icon name="arrow" size={20} className="rotate-180" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Diapositiva siguiente"
        className="absolute right-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/70 text-ink backdrop-blur hover:bg-black hover:text-white sm:grid"
      >
        <Icon name="arrow" size={20} />
      </button>

      {/* puntos y pausa */}
      <div className="relative z-20 flex items-center justify-center gap-4 pb-5 pt-1 lg:absolute lg:inset-x-0 lg:bottom-5 lg:p-0">
        <div className="flex items-center gap-0.5" role="group" aria-label="Elegir diapositiva">
          {SLIDES.map((s, i) => (
            <button
              key={s.l2}
              onClick={() => setIndex(i)}
              aria-label={`Diapositiva ${i + 1} de ${SLIDES.length}: ${s.tag}`}
              aria-current={i === index}
              className="group/dot grid h-6 min-w-6 place-items-center"
            >
              <span
                className={cn('block h-2.5 rounded-full transition-all', i === index ? 'w-8 bg-black' : 'w-2.5 bg-black/30 group-hover/dot:bg-black/60')}
              />
            </button>
          ))}
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={!playing}
          className="min-h-6 px-1 text-[10px] font-semibold uppercase tracking-[0.2em] hover:underline hover:underline-offset-4"
        >
          {playing ? 'Pausa' : 'Reanudar'}
        </button>
      </div>
    </section>
  )
}
