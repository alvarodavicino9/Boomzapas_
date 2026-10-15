import type { Producto } from '@/types'

export interface PriceRange {
  id: string
  label: string
  test: (precio: number) => boolean
}

export const PRICE_RANGES: PriceRange[] = [
  { id: 'hasta-60', label: 'Hasta $ 60.000', test: (p) => p <= 60000 },
  { id: '60-80', label: '$ 60.000 a $ 80.000', test: (p) => p > 60000 && p <= 80000 },
  { id: 'mas-80', label: 'Más de $ 80.000', test: (p) => p > 80000 },
]

export type Orden = 'novedad' | 'menor' | 'mayor' | 'nombre' | 'nombre-desc'

export const ORDENES: { id: Orden; label: string }[] = [
  { id: 'novedad', label: 'Novedades' },
  { id: 'menor', label: 'Menor precio' },
  { id: 'mayor', label: 'Mayor precio' },
  { id: 'nombre', label: 'Nombre (A a Z)' },
  { id: 'nombre-desc', label: 'Nombre (Z a A)' },
]

export const isOrden = (v: string | null): v is Orden => ORDENES.some((o) => o.id === v)

export const normText = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** ¿Hay stock en ese talle? Si el producto no trae stock cargado se asume que sí. */
export const hasTalle = (p: Producto, talle: string) =>
  p.stock.length === 0 || p.stock.some((s) => s.talle === talle && s.cantidad > 0)

export const sortProductos = (list: Producto[], orden: Orden): Producto[] => {
  const copy = [...list]
  switch (orden) {
    case 'menor':
      return copy.sort((a, b) => a.precio - b.precio)
    case 'mayor':
      return copy.sort((a, b) => b.precio - a.precio)
    case 'nombre':
      return copy.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    case 'nombre-desc':
      return copy.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'))
    default:
      return copy.sort((a, b) => b.id - a.id)
  }
}

/** ¿Tiene al menos un talle con stock? (sin stock cargado se asume que sí). */
export const hasStock = (p: Producto) => p.stock.length === 0 || p.stock.some((s) => s.cantidad > 0)

/** Cantidad de ingresos más recientes que se consideran "nuevos" cuando el producto no trae la marca `nuevo`. */
export const NUEVOS_RECIENTES = 8

export interface FilterState {
  categoria: string
  marcas: string[]
  talle: string
  precios: string[]
  pmin: string
  pmax: string
  stock: boolean
  nuevos: boolean
}
