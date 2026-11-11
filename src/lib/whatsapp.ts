import { SITE } from '@/config/site'
import type { CartItem, MetodoPago, TipoEntrega } from '@/types'
import { aplicaPromo, descuentoPromo, formatARS, PROMO, precioPromo, precioUnitario } from './format'
import { SITE_URL } from './seo'
import { rutaProducto } from './slug'

export const waLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`

const DOMINIO = SITE_URL.replace(/^https?:\/\//, '')
const PIE = `_Enviado desde ${DOMINIO}_`

/**
 * Mensajes listos para cada botón de WhatsApp: saludo, qué se consulta y los datos que
 * la tienda necesita para responder rápido (la persona completa lo que falta antes de enviar).
 */
const PLANTILLAS = {
  general: ['¡Hola Boom Zapas! 👋 Quiero hacer una consulta.', '', '• Nombre:', '• Modelo que me interesa:', '• Talle:', '• Consulta:'],
  comprar: [
    '¡Hola Boom Zapas! 👋 Quiero comprar por WhatsApp.',
    '',
    '• Nombre y apellido:',
    '• Modelo:',
    '• Talle:',
    '• Cantidad de pares:',
    '• Envío o retiro en el showroom:',
    '• Localidad y provincia:',
    '• Medio de pago:',
  ],
  talle: [
    '¡Hola Boom Zapas! 👋 Necesito ayuda para elegir mi talle.',
    '',
    '• Modelo que me gusta:',
    '• Talle que uso normalmente (y de qué marca):',
    '• Largo de mi pie en cm (opcional):',
  ],
  envio: [
    '¡Hola Boom Zapas! 👋 Quiero consultar por un envío.',
    '',
    '• Localidad y provincia:',
    '• Código postal:',
    '• Modelo y talle:',
  ],
  retiro: [
    '¡Hola Boom Zapas! 👋 Quiero coordinar el retiro de mi pedido en el showroom.',
    '',
    '• Número de pedido:',
    '• Nombre y apellido:',
    '• Día y horario en que paso:',
  ],
  pagos: ['¡Hola Boom Zapas! 👋 Quiero consultar por los medios de pago.', '', '• Modelo y talle:', '• Medio de pago que prefiero:', '• Consulta:'],
  promo: [
    `¡Hola Boom Zapas! 👋 Quiero aprovechar la promo de ${PROMO.minimo} pares o más (${formatARS(PROMO.descuento)} off en cada par).`,
    '',
    '• Par 1 (modelo y talle):',
    '• Par 2 (modelo y talle):',
    '• Envío o retiro en el showroom:',
  ],
  comprobante: [
    '¡Hola Boom Zapas! 👋 Te envío el comprobante de mi transferencia.',
    '',
    '• Número de pedido:',
    '• Nombre y apellido:',
    '• Monto transferido:',
    '',
    '(adjunto el comprobante)',
  ],
} as const

export type Plantilla = keyof typeof PLANTILLAS

export const mensajePlantilla = (p: Plantilla, extra: string[] = []) => [...PLANTILLAS[p], ...extra, '', PIE].join('\n')
export const waPlantilla = (p: Plantilla, extra?: string[]) => waLink(mensajePlantilla(p, extra))
export const waLinkGeneric = () => waPlantilla('general')
/** Mensaje armado a mano (líneas) con el pie de la tienda. */
export const waConsulta = (lineas: (string | false | null | undefined)[]) =>
  waLink([...lineas.filter((l): l is string => typeof l === 'string'), '', PIE].join('\n'))

/** Consulta por un par puntual, con precio, talle y link a la ficha. */
export function mensajeProducto(p: { nombre: string; marca: string; precio: number; precioAntes?: number }, talle?: string) {
  const oferta = p.precioAntes && p.precioAntes > p.precio
  return [
    '¡Hola Boom Zapas! 👋 Quiero consultar por este par:',
    '',
    `👟 *${p.nombre}*`,
    `• Marca: ${p.marca}`,
    `• Talle: ${talle ?? 'todavía no lo elegí (¿qué talles hay?)'}`,
    `• Precio: ${formatARS(p.precio)}${oferta ? ` (antes ${formatARS(p.precioAntes!)})` : ''}`,
    `• Llevando ${PROMO.minimo} o más: ${formatARS(precioPromo(p.precio))} c/u`,
    `🔗 ${SITE_URL}${rutaProducto(p)}`,
    '',
    talle ? '¿Está disponible en mi talle?' : '¿Qué talles tienen disponibles?',
    '',
    PIE,
  ].join('\n')
}

const metodoLabel: Record<MetodoPago, string> = {
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia bancaria',
  whatsapp: 'A coordinar por WhatsApp',
}

export interface DatosCliente {
  nombre: string
  telefono: string
  dni?: string
  email?: string
  direccion?: string
  referencias?: string
  notas?: string
  origen?: string
}

interface OrderMessageInput {
  codigo: string
  fecha: Date
  items: CartItem[]
  metodo: MetodoPago
  entrega: TipoEntrega
  cliente: DatosCliente
  pedidoId?: number | string
  comprobante?: boolean
}

/** Pedido completo y ordenado, para que la tienda tenga el registro en el chat. */
export const buildOrderMessage = ({ codigo, fecha, items, metodo, entrega, cliente, pedidoId, comprobante }: OrderMessageInput) => {
  const pares = items.reduce((n, i) => n + i.cantidad, 0)
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const promo = descuentoPromo(pares)
  const total = subtotal - promo
  const ref = pedidoId ? `#${pedidoId} · ${codigo}` : codigo
  const cuando = fecha.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).replace(',', ' ·') + ' hs'

  const productos = items.flatMap((i, n) => {
    const unit = precioUnitario(i.precio, pares)
    return [
      `${n + 1}. *${i.nombre}*`,
      `   Talle ${i.talle} · ${i.cantidad} ${i.cantidad === 1 ? 'par' : 'pares'} · ${formatARS(unit)} c/u${unit !== i.precio ? ` (antes ${formatARS(i.precio)})` : ''}`,
      `   ${SITE_URL}${rutaProducto(i)}`,
    ]
  })

  return [
    `🛍️ *NUEVO PEDIDO · BOOM ZAPAS*`,
    `Pedido ${ref} · ${cuando}`,
    comprobante ? '🧾 Pago por transferencia: adjunto el comprobante.' : null,
    '',
    '👤 *CLIENTE*',
    `• Nombre: ${cliente.nombre}`,
    cliente.dni ? `• DNI: ${cliente.dni}` : null,
    `• WhatsApp: ${cliente.telefono}`,
    cliente.email ? `• Email: ${cliente.email}` : null,
    '',
    `👟 *PRODUCTOS* (${pares} ${pares === 1 ? 'par' : 'pares'})`,
    ...productos,
    '',
    '💰 *RESUMEN*',
    `• Subtotal: ${formatARS(subtotal)}`,
    aplicaPromo(pares) ? `• Promo ${PROMO.minimo} pares o más: −${formatARS(promo)}` : null,
    `• Envío: ${entrega === 'envio' ? 'Gratis' : 'Retiro sin costo'}`,
    `• *TOTAL: ${formatARS(total)}*`,
    '',
    `💳 *PAGO:* ${metodoLabel[metodo]}`,
    entrega === 'envio' ? '🚚 *ENTREGA:* Envío gratis por Correo Argentino' : `📍 *ENTREGA:* Retiro en el showroom (${SITE.address})`,
    entrega === 'envio' && cliente.direccion ? `• Dirección: ${cliente.direccion}` : null,
    entrega === 'envio' && cliente.referencias ? `• Referencias: ${cliente.referencias}` : null,
    cliente.notas ? '' : null,
    cliente.notas ? `📝 *NOTAS:* ${cliente.notas}` : null,
    cliente.origen ? `📣 Nos conoció por: ${cliente.origen}` : null,
    '',
    'Quedo atento/a a la confirmación. ¡Gracias!',
    PIE,
  ]
    .filter((l): l is string => l !== null)
    .join('\n')
}

/** Código corto del pedido para buscarlo en el chat: BZ-1111-4F7K. */
export function codigoPedido(fecha = new Date()) {
  const dd = String(fecha.getDate()).padStart(2, '0')
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const azar = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BZ-${dd}${mm}-${azar}`
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
