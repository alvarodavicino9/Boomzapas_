import { SITE } from '@/config/site'

/** Precios en pesos con el formato de la tienda: `$ 89.900`. */
export const formatARS = (n: number) => `$ ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

/** Precio final pagando por transferencia / efectivo. */
export const transferPrice = (precio: number) => Math.max(0, precio - SITE.transferDiscount)

export const formatDate = (iso: unknown) => {
  if (typeof iso !== 'string') return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')
