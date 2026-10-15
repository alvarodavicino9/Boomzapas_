import { SITE } from '@/config/site'
import type { CartItem, MetodoPago, TipoEntrega } from '@/types'
import { formatARS } from './format'

export const waLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`

export const waLinkGeneric = () => waLink('Hola Boom Zapas. Quiero hacer una consulta.')

const metodoLabel: Record<MetodoPago, string> = {
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia',
  whatsapp: 'A coordinar por WhatsApp',
}

interface OrderMessageInput {
  items: CartItem[]
  total: number
  metodo: MetodoPago
  entrega: TipoEntrega
  nombre: string
  pedidoId?: number | string
  comprobante?: boolean
}

export const buildOrderMessage = ({
  items,
  total,
  metodo,
  entrega,
  nombre,
  pedidoId,
  comprobante,
}: OrderMessageInput) => {
  const lines = items.map((i) => `• ${i.nombre} · Talle ${i.talle} · x${i.cantidad}`)
  return [
    comprobante
      ? `Hola. Te envío el comprobante de mi pedido${pedidoId ? ` #${pedidoId}` : ''}.`
      : `Hola Boom Zapas. Quiero confirmar mi pedido${pedidoId ? ` #${pedidoId}` : ''}.`,
    '',
    ...lines,
    '',
    `Total: ${formatARS(total)}`,
    `Pago: ${metodoLabel[metodo]}`,
    `Entrega: ${entrega === 'envio' ? 'Envío por Correo Argentino' : 'Retiro en tienda'}`,
    `Nombre: ${nombre}`,
  ].join('\n')
}

/** Número de un cliente argentino → formato internacional para wa.me (celulares: 549 + área + número). */
export function numeroWhatsApp(telefono: string): string {
  let d = telefono.replace(/\D/g, '')
  if (d.startsWith('54')) return d.startsWith('549') ? d : `549${d.slice(2)}`
  d = d.replace(/^0/, '')
  return `549${d}`
}

export const waCliente = (telefono: string, message: string) =>
  `https://wa.me/${numeroWhatsApp(telefono)}?text=${encodeURIComponent(message)}`
