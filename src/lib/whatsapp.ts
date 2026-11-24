import { SITE } from '@/config/site'
import type { CartItem, MetodoPago, TipoEntrega } from '@/types'
import { aplicaPromo, descuentoPromo, formatARS, formatPorcentaje, planCuotas, PROMO, precioPromo, precioUnitario } from './format'
import { SITE_URL } from './seo'
import { rutaProducto } from './slug'

/** Celular o tablet: ahí el link abre la app de WhatsApp directo. */
const esCelular = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent)

/**
 * Link para abrir WhatsApp con el mensaje escrito.
 * - Celular: api.whatsapp.com abre la app.
 * - Compu: directo a WhatsApp Web. La página intermedia de WhatsApp (wa.me / api.whatsapp.com)
 *   muestra los íconos rotos ("�") en la compu, así que se la saltea.
 */
export const waLink = (message: string, telefono: string = SITE.whatsapp) =>
  `${esCelular() ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send'}?phone=${telefono}&text=${encodeURIComponent(message)}`

/** Compartir un texto eligiendo el contacto. */
export const waCompartir = (message: string) =>
  `${esCelular() ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send'}?text=${encodeURIComponent(message)}`

const DOMINIO = SITE_URL.replace(/^https?:\/\//, '')
// la web va fuera de las cursivas: si no, WhatsApp toma el "_" como parte del link
const PIE = `_Enviado desde la web_ · ${DOMINIO}`

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

/** Dirección de envío por partes (para que el pedido llegue completo y fácil de copiar en el correo). */
export interface DireccionEnvio {
  calle: string
  numero: string
  piso?: string
  localidad: string
  provincia: string
  cp: string
}

export interface DatosCliente {
  nombre: string
  telefono: string
  dni?: string
  email?: string
  /** Dirección en una línea. */
  direccion?: string
  envio?: DireccionEnvio
  referencias?: string
  notas?: string
  origen?: string
}

interface OrderMessageInput {
  codigo: string
  fecha: Date
  items: CartItem[]
  metodo: MetodoPago
  /** Cuotas con Mercado Pago (1 = un pago). */
  cuotas?: number
  entrega: TipoEntrega
  cliente: DatosCliente
  pedidoId?: number | string
  comprobante?: boolean
}

const LINEA = '━━━━━━━━━━━━━━━━'

/** "juan PEREZ" → "Juan Perez" */
const nombrePropio = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase())

/** 25896521 → 25.896.521 */
const conPuntos = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/** Pedido completo y ordenado, para que la tienda tenga el registro en el chat. */
export const buildOrderMessage = ({ codigo, fecha, items, metodo, cuotas = 1, entrega, cliente, pedidoId, comprobante }: OrderMessageInput) => {
  const pares = items.reduce((n, i) => n + i.cantidad, 0)
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const promo = descuentoPromo(pares)
  const total = subtotal - promo
  const plan = planCuotas(total, metodo === 'mercadopago' ? cuotas : 1)
  const enCuotas = plan.cuotas > 1
  const dd = (n: number) => String(n).padStart(2, '0')
  const dia = `${dd(fecha.getDate())}/${dd(fecha.getMonth() + 1)}/${fecha.getFullYear()}`
  const hora = `${dd(fecha.getHours())}:${dd(fecha.getMinutes())} hs`
  const nombre = nombrePropio(cliente.nombre)
  const dni = cliente.dni ? conPuntos(cliente.dni) : undefined
  const e = cliente.envio

  const productos = items.flatMap((i, n) => {
    const unit = precioUnitario(i.precio, pares)
    return [
      `*${n + 1}. ${i.nombre}*`,
      `     📏 Talle ${i.talle} · ${i.cantidad} ${i.cantidad === 1 ? 'par' : 'pares'}`,
      `     🏷️ ${formatARS(unit)} c/u${unit !== i.precio ? ` (antes ${formatARS(i.precio)})` : ''}${i.cantidad > 1 ? ` · ${formatARS(unit * i.cantidad)}` : ''}`,
      `     🔗 ${SITE_URL}${rutaProducto(i)}`,
    ]
  })

  return [
    '🛍️ *NUEVO PEDIDO · BOOM ZAPAS*',
    LINEA,
    `🧾 *Pedido N° ${codigo}*${pedidoId ? ` (#${pedidoId})` : ''}`,
    `📅 ${dia} · ${hora}`,
    comprobante ? '✅ Pagué por transferencia: te adjunto el comprobante.' : null,
    '',
    '👤 *CLIENTE*',
    `• Nombre: ${nombre}`,
    dni ? `• DNI: ${dni}` : null,
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
    enCuotas ? `• Recargo Mercado Pago (${plan.cuotas} cuotas, ${formatPorcentaje(plan.recargo)}): +${formatARS(plan.total - total)}` : null,
    enCuotas ? `✅ *TOTAL: ${formatARS(plan.total)}* (${plan.cuotas} cuotas de ${formatARS(plan.cuota)})` : `✅ *TOTAL: ${formatARS(total)}*`,
    '',
    '💳 *PAGO*',
    metodo === 'mercadopago'
      ? enCuotas
        ? `• Mercado Pago en *${plan.cuotas} cuotas de ${formatARS(plan.cuota)}*`
        : '• Mercado Pago en *1 pago*'
      : `• ${metodoLabel[metodo]}`,
    metodo === 'mercadopago' ? `• Link de pago por: *${formatARS(plan.total)}*` : null,
    metodo === 'transferencia' ? `• Importe a transferir: *${formatARS(total)}*` : null,
    '',
    ...(entrega === 'envio'
      ? [
          '🚚 *ENVÍO A DOMICILIO*',
          '• Correo Argentino · gratis · 3 a 7 días hábiles',
          `• Recibe: ${nombre}${dni ? ` · DNI ${dni}` : ''}`,
          e
            ? `• Dirección: ${`${e.calle} ${e.numero}`.trim()}${e.piso ? `, ${e.piso}` : ''}`
            : cliente.direccion
              ? `• Dirección: ${cliente.direccion}`
              : null,
          e ? `• Localidad: ${e.localidad}, ${e.provincia}` : null,
          e ? `• Código postal: ${e.cp}` : null,
          cliente.referencias ? `• Referencias: ${cliente.referencias}` : null,
        ]
      : [
          '📍 *RETIRO EN EL SHOWROOM*',
          `• ${SITE.address}`,
          ...SITE.hours.map((h) => `• ${h.dias}: ${h.horario} hs`),
        ]),
    cliente.notas ? '' : null,
    cliente.notas ? `📝 *NOTAS:* ${cliente.notas}` : null,
    cliente.origen ? '' : null,
    cliente.origen ? `📣 Nos conoció por: ${cliente.origen}` : null,
    LINEA,
    'Quedo atento/a a la confirmación. ¡Gracias! 🙌',
    PIE,
  ]
    .filter((l): l is string => l !== null)
    .join('\n')
}

/**
 * Número de pedido ordenado por fecha y hora, para contarlos y archivarlos en orden:
 * BZ-261124-1733-K7 = 2026/11/24 a las 17:33 (+ 2 letras para que no se repita si entran dos en el mismo minuto).
 * Ordenados alfabéticamente quedan en orden cronológico.
 */
export function codigoPedido(fecha = new Date()) {
  const dd = (n: number) => String(n).padStart(2, '0')
  const dia = `${String(fecha.getFullYear()).slice(2)}${dd(fecha.getMonth() + 1)}${dd(fecha.getDate())}`
  const hora = `${dd(fecha.getHours())}${dd(fecha.getMinutes())}`
  // sin letras que se confunden (0/O, 1/I/L)
  const letras = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const azar = Array.from({ length: 2 }, () => letras[Math.floor(Math.random() * letras.length)]).join('')
  return `BZ-${dia}-${hora}-${azar}`
}

/** Número de un cliente argentino → formato internacional para wa.me (celulares: 549 + área + número). */
export function numeroWhatsApp(telefono: string): string {
  let d = telefono.replace(/\D/g, '')
  if (d.startsWith('54')) return d.startsWith('549') ? d : `549${d.slice(2)}`
  d = d.replace(/^0/, '')
  return `549${d}`
}

export const waCliente = (telefono: string, message: string) => waLink(message, numeroWhatsApp(telefono))
