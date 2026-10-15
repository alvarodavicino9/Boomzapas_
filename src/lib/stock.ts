import { DEFAULT_TALLES } from '@/config/site'
import type { Producto } from '@/types'

export interface TalleInfo {
  talle: string
  cantidad: number
}

/** Talles disponibles del producto. Si la API no trae stock, se asume que hay de todos. */
export function getTalles(p: Producto): TalleInfo[] {
  if (p.stock.length === 0) return DEFAULT_TALLES.map((talle) => ({ talle, cantidad: 99 }))
  return p.stock.map(({ talle, cantidad }) => ({ talle, cantidad }))
}

export const isSoldOut = (p: Producto) => p.stock.length > 0 && p.stock.every((s) => s.cantidad <= 0)
