import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { SITE } from '@/config/site'
import { useProductos } from '@/context/ProductsContext'
import { useAbrirProducto } from '@/hooks/useAbrirProducto'
import { cn, formatARS } from '@/lib/format'
import { slugify } from '@/lib/slug'
import type { Vitrina } from './vitrina3d'

/**
 * Pares de la vitrina 3D. Cada uno necesita su foto recortada (fondo transparente) en /public/fotos/hero3d/<carpeta>.webp.
 * El nombre se usa para buscar el producto real (precio y ficha); si no está en el catálogo, se muestran estos datos.
 */
const PARES = [
  { carpeta: 'nike-sb-dunk-panda', marca: 'Nike', nombre: 'Nike SB Dunk Panda', precio: 63500, precioAntes: 68500 },
  { carpeta: 'nike-air-jordan-1-low-x-travis-scott-grey-cream', marca: 'Jordan', nombre: 'Nike Air Jordan 1 Low x Travis Scott Grey Cream', precio: 67500 },
  { carpeta: 'adidas-samba-negras-clasicas', marca: 'Adidas', nombre: 'Adidas Samba Negras Clásicas', precio: 60900, precioAntes: 65900 },
  { carpeta: 'new-balance-530-cloud-white', marca: 'New Balance', nombre: 'New Balance 530 Cloud White', precio: 61900, precioAntes: 66900 },
  { carpeta: 'nike-sb-dunk-bordeaux', marca: 'Nike', nombre: 'Nike SB Dunk Bordeaux', precio: 66900 },
  { carpeta: 'adidas-forum-84-low-white-and-black', marca: 'Adidas', nombre: 'Adidas Forum 84 Low White and Black', precio: 67900 },
  { carpeta: 'nike-air-force-one', marca: 'Nike', nombre: 'Nike Air Force One', precio: 61900, precioAntes: 66900 },
  { carpeta: 'adidas-adi2000-semi-total-black', marca: 'Adidas', nombre: 'Adidas ADI2000 Semi Total Black', precio: 78900 },
]
const foto = (carpeta: string) => `/fotos/hero3d/${carpeta}.webp`

/** Conexión lenta o "ahorro de datos": se queda la foto fija y no se baja three.js. */
function conexionLenta() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !!c && (c.saveData === true || /(^|-)2g|3g/.test(c.effectiveType ?? ''))
}

/**
 * ¿Hay placa de video de verdad? Si WebGL corre por software (SwiftShader, llvmpipe, aceleración apagada),
 * cada cuadro traba la página: ahí no vale la pena el 3D. Es también lo que pasa en las mediciones de Google
 * (PageSpeed), así que la nota de rendimiento no se ve afectada.
 */
function tienePlacaDeVideo() {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
      c.getContext('webgl', { failIfMajorPerformanceCaveat: true })) as WebGLRenderingContext | null
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const placa = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(placa)
  } catch {
    return false
  }
}

/** Espera a que la página termine de cargar y el navegador esté libre: la escena 3D nunca compite con la primera carga. */
function cuandoEsteLibre(fn: () => void) {
  let cancelado = false
  let idle = 0
  const correr = () => {
    if (cancelado) return
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (w.requestIdleCallback) idle = w.requestIdleCallback(() => !cancelado && fn(), { timeout: 1500 })
    else idle = window.setTimeout(() => !cancelado && fn(), 300)
  }
  if (document.readyState === 'complete') correr()
  else window.addEventListener('load', correr, { once: true })
  return () => {
    cancelado = true
    window.removeEventListener('load', correr)
    const w = window as Window & { cancelIdleCallback?: (id: number) => void }
    if (w.cancelIdleCallback) w.cancelIdleCallback(idle)
    else window.clearTimeout(idle)
  }
}

/**
 * Portada con la vitrina 3D: las zapatillas giran en un anillo, se arrastran con el dedo o el mouse,
 * y la tarjeta muestra el par que queda al frente.
 * Primero se ve la foto del primer par (es lo que mide Google como carga principal) y recién cuando la página
 * está libre se baja three.js y arranca la escena. Sin placa de video, sin WebGL o con conexión lenta, queda la foto
 * y las flechas de la tarjeta pasan de una foto a otra (sin 3D).
 * Para probar el 3D en una compu sin placa de video: agregá ?3d a la dirección.
 */
export function Hero3D() {
  const { productos } = useProductos()
  const abrir = useAbrirProducto()
  const navigate = useNavigate()
  const escenaRef = useRef<HTMLDivElement>(null)
  const progresoRef = useRef<HTMLSpanElement>(null)
  const vitrinaRef = useRef<Vitrina | null>(null)
  const [frente, setFrente] = useState(0)
  const [listo, setListo] = useState(false)
  const [cambiando, setCambiando] = useState(false)

  // datos reales de cada par (precio actualizado y su ficha)
  const pares = useMemo(
    () =>
      PARES.map((p) => {
        const real = productos.find((x) => slugify(x.nombre) === slugify(p.nombre))
        return { ...p, ...(real ? { precio: real.precio, precioAntes: real.precioAntes, nombre: real.nombre } : {}), real }
      }),
    [productos],
  )
  const paresRef = useRef(pares)
  paresRef.current = pares

  useEffect(() => {
    const contenedor = escenaRef.current
    if (!contenedor || conexionLenta()) return
    let vivo = true
    const cancelar = cuandoEsteLibre(() => {
      if (!new URLSearchParams(location.search).has('3d') && !tienePlacaDeVideo()) return
      import('./vitrina3d')
        .then(({ crearVitrina }) =>
          crearVitrina(contenedor, {
            imagenes: PARES.map((p) => foto(p.carpeta)),
            onFrente: (i) => {
              setCambiando(true)
              window.setTimeout(() => {
                setFrente(i)
                setCambiando(false)
              }, 180)
            },
            onElegir: (i) => {
              const p = paresRef.current[i]
              if (p.real) abrir(p.real)
              else navigate('/catalogo')
            },
            onProgreso: (v) => {
              if (progresoRef.current) progresoRef.current.style.transform = `scaleX(${v})`
            },
            onListo: () => setListo(true),
          }),
        )
        .then((v) => {
          if (vivo) vitrinaRef.current = v
          else v.destruir()
        })
        .catch(() => {
          /* sin WebGL: queda la foto fija */
        })
    })
    return () => {
      vivo = false
      cancelar()
      vitrinaRef.current?.destruir()
      vitrinaRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const par = pares[frente]
  // con la escena 3D gira el anillo; sin ella, cambia la foto fija
  const ir = (delta: number) => {
    if (vitrinaRef.current) vitrinaRef.current.ir(delta)
    else setFrente((f) => (f + delta + PARES.length) % PARES.length)
  }
  const ver = () => (par.real ? abrir(par.real) : navigate('/catalogo'))

  return (
    <section className="page-x pt-3 max-sm:!px-2.5 sm:pt-6" aria-label="Portada">
      <div className="relative mx-auto max-w-[1600px]">
        {/* luz granate detrás del bloque, como el brillo del logo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -bottom-10 top-10 -z-10 rounded-[40px] opacity-70"
          style={{ background: 'radial-gradient(60% 70% at 60% 60%, rgb(var(--bz-glow) / 0.55), transparent 75%)' }}
        />
        <div
          className="relative isolate overflow-hidden rounded-[18px] text-white shadow-[0_30px_70px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/10 sm:rounded-[28px] lg:min-h-[clamp(560px,calc(100dvh-var(--header-h)-60px),760px)]"
          style={{
            background:
              'radial-gradient(48% 62% at 70% 62%, rgb(150 12 20 / 0.5), transparent 70%), radial-gradient(30% 40% at 8% 20%, rgb(150 12 20 / 0.2), transparent 70%), #0b0708',
          }}
        >
          {/* escena 3D: arriba en el celular, de fondo en la compu */}
          <div ref={escenaRef} className="relative h-[330px] sm:h-[400px] lg:absolute lg:inset-0 lg:h-auto">
            {/* el canvas lo agrega la escena 3D cuando arranca */}
            <img
              src={foto(PARES[listo ? 0 : frente].carpeta)}
              alt=""
              aria-hidden="true"
              width={615}
              height={640}
              fetchPriority="high"
              decoding="async"
              className={cn(
                'pointer-events-none absolute left-1/2 top-[44%] w-[62%] max-w-[420px] -translate-x-1/2 -translate-y-1/2 -rotate-6 drop-shadow-[0_30px_30px_rgb(0_0_0/0.6)] transition-opacity duration-700 lg:left-[68%] lg:w-[34%]',
                listo ? 'opacity-0' : 'opacity-100',
              )}
            />
            {/* que la escena se funda con el texto en el celular */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#0b0708] lg:hidden" />
          </div>

          <div className="pointer-events-none relative z-10 px-5 pb-5 sm:px-8 sm:pb-8 lg:flex lg:min-h-[inherit] lg:items-center lg:px-14 lg:py-14">
            <div className="pointer-events-auto max-w-[560px] lg:w-[46%]">
              <p className="label flex items-center gap-2.5 text-white/60">
                <span className="h-0.5 w-7 bg-accent" />
                Sneakers · Córdoba
              </p>
              <h1 className="display-hero mt-3 !text-[clamp(2.1rem,4.1vw,4.1rem)] sm:mt-5">
                {/* para Google y lectores de pantalla: de qué es la tienda y dónde */}
                <span className="sr-only">Boom Zapas, zapatillas en Córdoba: </span>
                Tu próximo par <span className="text-accent">está acá</span>
              </h1>
              <p className="mt-5 hidden max-w-[440px] text-pretty text-[15.5px] leading-[26px] text-white/65 sm:block">
                Nike, Adidas, Jordan, New Balance y Vans, con envío gratis a todo el país.
                <span className="mt-1 block font-medium text-white">
                  Llevando {SITE.promoPares.minimo} pares o más, {formatARS(SITE.promoPares.descuento)} menos en cada uno.
                </span>
              </p>
              <div className="mt-6 hidden flex-wrap gap-2.5 sm:flex">
                <Link to="/catalogo" className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[13.5px] font-semibold text-white shadow-[0_12px_30px_-12px_rgb(217_44_55/0.8)] transition-transform hover:-translate-y-px">
                  Ver catálogo <Icon name="arrow" size={15} />
                </Link>
              </div>
              <dl className="mt-9 hidden gap-7 lg:flex">
                {SITE.stats.filter((s) => s.label === 'Ventas' || s.label === 'Clientes').map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-display text-[20px] font-extrabold">{s.value}</dd>
                    <dd className="text-[11.5px] text-white/55">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* tarjeta del par que está al frente */}
          <div
            className="relative z-10 mx-3 mb-3 rounded-[20px] border border-white/10 bg-[#120c0d]/80 p-4 backdrop-blur-md sm:mx-8 sm:mb-8 lg:absolute lg:bottom-7 lg:right-8 lg:m-0 lg:w-[290px]"
            onMouseEnter={() => vitrinaRef.current?.pausar(true)}
            onMouseLeave={() => vitrinaRef.current?.pausar(false)}
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <span className={cn('label text-white/55 transition-opacity duration-200', cambiando && 'opacity-0')}>{par.marca}</span>
              <span className="label text-white/45">
                <b className="font-display text-white">{String(frente + 1).padStart(2, '0')}</b> / {String(PARES.length).padStart(2, '0')}
              </span>
            </div>
            <div className={cn('transition-all duration-200', cambiando && 'translate-y-1 opacity-0')}>
              <p className="mt-2 font-display text-[16px] font-extrabold uppercase leading-5 lg:min-h-[38px] lg:text-[14.5px] lg:leading-[19px]">{par.nombre}</p>
              <p className="mt-2 flex items-baseline gap-2.5">
                <strong className="text-[21px] font-semibold lg:text-[19px]">{formatARS(par.precio)}</strong>
                {par.precioAntes && par.precioAntes > par.precio && <s className="text-[13px] text-white/45">{formatARS(par.precioAntes)}</s>}
              </p>
            </div>
            {/* avance del giro automático */}
            <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/10">
              <span ref={progresoRef} className="block h-full origin-left scale-x-0 bg-accent" />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => ir(-1)} aria-label="Par anterior" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-white/10">
                <Icon name="chevron" size={16} className="rotate-90" />
              </button>
              <button type="button" onClick={ver} className="h-11 flex-1 rounded-full bg-accent text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-px">
                Ver modelo
              </button>
              <button type="button" onClick={() => ir(1)} aria-label="Par siguiente" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-white/10">
                <Icon name="chevron" size={16} className="-rotate-90" />
              </button>
            </div>
          </div>

          {/* ayuda chiquita (sólo compu) */}
          <p className="label pointer-events-none absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 text-white/30 xl:block">
            Arrastrá para girar · tocá un par
          </p>
        </div>
      </div>
    </section>
  )
}
