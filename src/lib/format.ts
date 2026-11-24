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

export interface PlanCuotas {
  cuotas: number
  /** % de recargo de Mercado Pago (0 en 1 pago). */
  recargo: number
  /** Valor de cada cuota (redondeado hacia arriba al peso). */
  cuota: number
  /** Lo que paga el cliente en total. */
  total: number
}

/** Planes de pago con Mercado Pago: 1 pago sin recargo + las cuotas de SITE.cuotasMercadoPago con su recargo. */
export function planesCuotas(total: number): PlanCuotas[] {
  return [
    { cuotas: 1, recargo: 0, cuota: total, total },
    ...SITE.cuotasMercadoPago.map(({ cuotas, recargo }) => {
      const cuota = Math.ceil((total * (1 + recargo / 100)) / cuotas)
      return { cuotas, recargo, cuota, total: cuota * cuotas }
    }),
  ]
}

/** El plan elegido (si la cantidad de cuotas no existe, 1 pago). */
export const planCuotas = (total: number, cuotas: number) => planesCuotas(total).find((p) => p.cuotas === cuotas) ?? planesCuotas(total)[0]

/** "10,49 %" */
export const formatPorcentaje = (n: number) => `${n.toLocaleString('es-AR', { maximumFractionDigits: 2 })} %`
