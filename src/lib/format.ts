import { SITE } from '@/config/site'

/** Precios en pesos con el formato de la tienda: `$ 89.900`. */
export const formatARS = (n: number) => `$ ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

/** Promo de la tienda: llevando 2 pares o más, $5.000 off por cada par. */
export const PROMO = SITE.promoPares
/** Precio de un par con la promo aplicada. */
export const precioPromo = (precio: number) => Math.max(0, precio - PROMO.descuento)
/** ¿Con esta cantidad de pares en el pedido corre la promo? */
export const aplicaPromo = (pares: number) => pares >= PROMO.minimo
/** Lo que se descuenta en un pedido con esa cantidad de pares. */
export const descuentoPromo = (pares: number) => (aplicaPromo(pares) ? PROMO.descuento * pares : 0)
/** Precio de cada par según cuántos pares lleva el pedido. */
export const precioUnitario = (precio: number, pares: number) => (aplicaPromo(pares) ? precioPromo(precio) : precio)

/** Cuánto se descuenta en la oferta del par (0 si no está en oferta). */
export const descuentoOferta = (p: { precio: number; precioAntes?: number }) =>
  p.precioAntes && p.precioAntes > p.precio ? p.precioAntes - p.precio : 0

export const formatDate = (iso: unknown) => {
  if (typeof iso !== 'string') return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')
