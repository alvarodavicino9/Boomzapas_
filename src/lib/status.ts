import type { Producto } from '@/types'
import { isSoldOut } from './stock'

export type ProductStatus = 'NUEVO' | 'ÚLTIMOS PARES' | 'AGOTADO'

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
const LOW_STOCK_UNITS = 3

/**
 * Único estado que se muestra sobre un producto (texto plano, sin colores).
 * Prioridad: agotado > últimos pares > nuevo.
 */
export function getStatus(p: Producto): ProductStatus | null {
  if (isSoldOut(p)) return 'AGOTADO'
  if (p.stock.length > 0) {
    const units = p.stock.reduce((s, t) => s + Math.max(0, t.cantidad), 0)
    if (units > 0 && units <= LOW_STOCK_UNITS) return 'ÚLTIMOS PARES'
  }
  if (p.nuevo) return 'NUEVO'
  if (p.creado) {
    const t = new Date(p.creado).getTime()
    if (!Number.isNaN(t) && Date.now() - t < NEW_WINDOW_MS) return 'NUEVO'
  }
  return null
}
