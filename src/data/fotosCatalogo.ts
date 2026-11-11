/**
 * Catálogo de la página anterior (boomzapas.netlify.app): 31 modelos con su foto.
 * Las fotos viven en /public/fotos/catalogo y se nombran con el "slug" del producto.
 *
 * Sirve para dos cosas:
 *  1. Catálogo local, mientras la tienda esté sin conexión al servidor.
 *  2. Respaldo: si un producto de la base de datos viene SIN imagen, se busca
 *     acá una foto por nombre (ver normalize.ts). Así el catálogo real nunca queda
 *     con la silueta gris sólo porque la columna de imágenes está vacía.
 */
import { fotosDeModelo, MODELOS_DRIVE } from '@/data/modelosDrive'
import { slugify } from '@/lib/slug'

export interface ModeloOriginal {
  nombre: string
  marca: string
  categoria: 'urbanas' | 'deportivas'
  precio: number
}

export { slugify }

export const MODELOS_ORIGINALES: ModeloOriginal[] = [
  { nombre: 'Nike SB Dunk Panda', marca: 'Nike', categoria: 'urbanas', precio: 60800 },
  { nombre: 'Salomon Negro/Blanco', marca: 'Salomon', categoria: 'deportivas', precio: 66800 },
  { nombre: 'Adidas Samba Clasica', marca: 'Adidas', categoria: 'urbanas', precio: 57700 },
  { nombre: 'Adidas Forum High B&W', marca: 'Adidas', categoria: 'urbanas', precio: 65000 },
  { nombre: 'Vans Knu Azul', marca: 'Vans', categoria: 'urbanas', precio: 59000 },
  { nombre: 'Jordan 4 Grey Silver', marca: 'Jordan', categoria: 'urbanas', precio: 63000 },
  { nombre: 'Adidas Duramo Amarillo', marca: 'Adidas', categoria: 'deportivas', precio: 62900 },
  { nombre: 'New Balance 9060 Black', marca: 'New Balance', categoria: 'deportivas', precio: 63000 },
  { nombre: 'Adidas Campus 00s', marca: 'Adidas', categoria: 'urbanas', precio: 59900 },
  { nombre: 'Adidas Campus Negro', marca: 'Adidas', categoria: 'urbanas', precio: 59900 },
  { nombre: 'Adidas Samba White', marca: 'Adidas', categoria: 'urbanas', precio: 57700 },
  { nombre: 'Adidas Samba XLG', marca: 'Adidas', categoria: 'urbanas', precio: 58200 },
  { nombre: 'Adidas Superstar Gris', marca: 'Adidas', categoria: 'urbanas', precio: 56700 },
  { nombre: 'Adidas Superstar Negro', marca: 'Adidas', categoria: 'urbanas', precio: 56700 },
  { nombre: 'Adidas Superstar Beige', marca: 'Adidas', categoria: 'urbanas', precio: 56700 },
  { nombre: 'Adidas Forum High White', marca: 'Adidas', categoria: 'urbanas', precio: 65000 },
  { nombre: 'Adidas Forum Low B&W', marca: 'Adidas', categoria: 'urbanas', precio: 60400 },
  { nombre: 'Adidas Forum Low White', marca: 'Adidas', categoria: 'urbanas', precio: 60400 },
  { nombre: 'Adidas Forum Low Gris', marca: 'Adidas', categoria: 'urbanas', precio: 60400 },
  { nombre: 'Adidas Duramo Blanco', marca: 'Adidas', categoria: 'deportivas', precio: 62900 },
  { nombre: 'Nike Air Force 1 White', marca: 'Nike', categoria: 'urbanas', precio: 57500 },
  { nombre: 'Nike Air Force 1 Black', marca: 'Nike', categoria: 'urbanas', precio: 57500 },
  { nombre: 'Nike SB Dunk Grey', marca: 'Nike', categoria: 'urbanas', precio: 59700 },
  { nombre: 'Nike SB Dunk Total Black', marca: 'Nike', categoria: 'urbanas', precio: 60800 },
  { nombre: 'Nike SB Dunk Chocolate', marca: 'Nike', categoria: 'urbanas', precio: 60800 },
  { nombre: 'Nike Travis Scott', marca: 'Nike', categoria: 'urbanas', precio: 63000 },
  { nombre: 'Jordan Low Rojas', marca: 'Jordan', categoria: 'urbanas', precio: 56500 },
  { nombre: 'Jordan Low Blanca', marca: 'Jordan', categoria: 'urbanas', precio: 63000 },
  { nombre: 'Jordan 4 Total Black', marca: 'Jordan', categoria: 'urbanas', precio: 63000 },
  { nombre: 'Jordan 1 High Panda', marca: 'Jordan', categoria: 'urbanas', precio: 63000 },
  { nombre: 'Zoom X', marca: 'Nike', categoria: 'deportivas', precio: 63000 },
]

const RUTA = '/fotos/catalogo'
const SLUGS = new Set(MODELOS_ORIGINALES.map((m) => slugify(m.nombre)))

export const fotoDeModelo = (nombre: string): string => `${RUTA}/${slugify(nombre)}.jpg`

/**
 * Busca fotos locales para un nombre de producto (respaldo cuando la base no trae imágenes).
 * Primero en los modelos con fotos de estudio (todas sus vistas) y después en la página anterior.
 * 1) coincidencia exacta del nombre; 2) uno contiene al otro ("Nike Zoom X" ↔ "Zoom X").
 */
export function fotosLocales(nombre: string): string[] {
  const s = slugify(nombre)
  if (!s) return []
  const estudio = buscar(s, MODELOS_DRIVE, (m) => slugify(m.nombre))
  if (estudio) return fotosDeModelo(estudio)
  const anterior = buscar(s, [...SLUGS], (k) => k)
  return anterior ? [`${RUTA}/${anterior}.jpg`] : []
}

/** Sólo la foto principal (compatibilidad). */
export const fotoLocal = (nombre: string): string | undefined => fotosLocales(nombre)[0]

function buscar<T>(s: string, lista: T[], key: (x: T) => string): T | undefined {
  let best: T | undefined
  let bestLen = 0
  for (const x of lista) {
    const k = key(x)
    if (k === s) return x
    if (k.length >= 6 && (s.includes(k) || k.includes(s)) && k.length > bestLen) {
      best = x
      bestLen = k.length
    }
  }
  return best
}
