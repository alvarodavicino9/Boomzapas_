/**
 * Fotos livianas: cada foto de /public/fotos tiene versiones WebP de 400, 800 y 1100 px
 * (las genera `npm run fotos`, que también corre antes de cada build).
 * El navegador elige la más chica que alcanza para el tamaño en pantalla.
 */
const LOCAL = /^\/fotos\/.+\.(jpe?g|png)$/i

/** `srcset` WebP para una foto local; undefined si la foto no es de /fotos (ej. viene de la base). */
export function srcsetWebp(src?: string): string | undefined {
  if (!src || !LOCAL.test(src)) return undefined
  const base = src.replace(/\.(jpe?g|png)$/i, '')
  return `${base}-400.webp 400w, ${base}-800.webp 800w, ${base}-1100.webp 1100w`
}

/** Tamaños en pantalla más comunes, para el atributo `sizes`. */
export const SIZES = {
  /** tarjeta del catálogo: 2 columnas en el celular, 3 en tablet, 4 en la compu */
  tarjeta: '(min-width: 1280px) 260px, (min-width: 1024px) 22vw, (min-width: 640px) 31vw, 47vw',
  /** foto grande de la ficha (en la compu se amplía con el mouse: pide la versión grande) */
  ficha: '(min-width: 1024px) 1000px, 100vw',
  /** miniaturas, carrito, sugeridos */
  mini: '120px',
  /** sugeridos dentro de la ficha */
  sugerido: '(min-width: 768px) 200px, 45vw',
} as const

/** Pide al navegador que vaya bajando una foto (por ejemplo, la segunda vista al pasar el mouse). */
export function precargar(src?: string, sizes: string = SIZES.tarjeta) {
  const set = srcsetWebp(src)
  if (!src) return
  const img = new Image()
  img.decoding = 'async'
  if (set) {
    img.sizes = sizes
    img.srcset = set
  }
  img.src = src
}
