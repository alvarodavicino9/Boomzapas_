import { fotosLocales } from '@/data/fotosCatalogo'
import type { Producto, StockTalle } from '@/types'

type Raw = Record<string, unknown>

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

const toImages = (raw: Raw): string[] => {
  for (const key of ['imagenes', 'fotos', 'images', 'galeria']) {
    const v = raw[key]
    if (Array.isArray(v)) {
      const list = v.map((x) => (typeof x === 'string' ? x : str((x as Raw)?.url))).filter(Boolean) as string[]
      if (list.length) return list
    }
  }
  for (const key of ['imagen', 'foto', 'imagen_url', 'foto_url', 'image', 'img']) {
    const s = str(raw[key])
    if (s) return [s]
  }
  return []
}

const toStock = (raw: Raw, id: number): StockTalle[] => {
  const v = raw.stock
  if (!Array.isArray(v)) return []
  return v
    .map((s) => s as Raw)
    .map((s) => ({
      producto_id: Number(s.producto_id ?? id),
      talle: String(s.talle ?? ''),
      cantidad: Number(s.cantidad ?? 0),
    }))
    .filter((s) => s.talle)
    .sort((a, b) => Number(a.talle) - Number(b.talle))
}

/**
 * Convierte una fila de `productos` (Supabase) al tipo que usa el front.
 * Es tolerante con nombres de columna distintos: si tu tabla usa otros,
 * este es el único archivo que hay que ajustar.
 */
export const normalizeProducto = (raw: Raw): Producto => {
  const id = Number(raw.id)
  const nombre = str(raw.nombre) ?? str(raw.name) ?? 'Zapatilla'
  return {
    id,
    nombre,
    marca: str(raw.marca) ?? nombre.split(' ')[0],
    categoria: (str(raw.categoria) ?? str(raw.tipo) ?? 'urbanas').toLowerCase(),
    precio: Number(raw.precio ?? raw.price ?? 65000),
    // Si la base no trae imágenes, se usan las fotos locales del modelo (por nombre).
    imagenes: (() => {
      const imgs = toImages(raw)
      return imgs.length ? imgs : fotosLocales(nombre)
    })(),
    descripcion: str(raw.descripcion) ?? '',
    stock: toStock(raw, id),
    nuevo: raw.nuevo === true || raw.es_nuevo === true,
    creado: str(raw.created_at) ?? str(raw.creado),
  }
}
