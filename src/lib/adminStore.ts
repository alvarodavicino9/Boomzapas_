import { useSyncExternalStore } from 'react'
import { normCategoria } from './categorias'
import { MOCK_PRODUCTOS } from '@/data/mock'
import { SITE } from '@/config/site'
import { MODO_DEMO as MODO_LOCAL } from '@/lib/api'
import type { CartItem, EstadoPedido, MetodoPago, Producto, TipoEntrega } from '@/types'

/**
 * Datos del panel en modo local (sin servidor): pedidos de ejemplo y ediciones del catálogo,
 * guardados en este navegador. Con el servidor conectado, el panel usa la API en su lugar.
 */

export const ESTADOS: EstadoPedido[] = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado']
/** Estados que cuentan como venta concretada. */
export const ESTADOS_VENTA: string[] = ['pagado', 'enviado', 'entregado']

export interface ItemPedido {
  producto_id: number
  nombre: string
  marca: string
  talle: string
  cantidad: number
  precio_unit: number
}

export interface PedidoAdmin {
  id: number | string
  fecha: string
  cliente: { nombre: string; telefono: string; email?: string }
  items: ItemPedido[]
  metodo_pago: string
  entrega: TipoEntrega
  direccion?: string
  notas: string
  estado: string
  total: number
  /** Nota interna del local (no la ve el cliente). */
  nota_interna?: string
  /** Código de seguimiento del envío. */
  seguimiento?: string
  /** Descuento aplicado a mano (ya restado del total). */
  descuento?: number
  /** El stock de este pedido ya se descontó (modo local). */
  stock_descontado?: boolean
}

// ── Caja ──────────────────────────────────────────────────────────────────

export type TipoMovimiento = 'gasto' | 'ingreso'

export interface CompraMercaderia {
  producto_id: number
  nombre: string
  talles: Record<string, number>
  costo_unit: number
  proveedor?: string
}

export interface Movimiento {
  id: string
  fecha: string
  tipo: TipoMovimiento
  categoria: string
  concepto: string
  monto: number
  medio: string
  /** Si es una compra de mercadería: qué entró al stock. */
  compra?: CompraMercaderia
}

export const CATEGORIAS_GASTO = [
  'Mercadería',
  'Envíos y embalaje',
  'Publicidad',
  'Alquiler y servicios',
  'Sueldos',
  'Comisiones',
  'Impuestos',
  'Retiro del dueño',
  'Otros gastos',
]
export const CATEGORIAS_INGRESO = ['Aporte de capital', 'Venta por fuera de la web', 'Otros ingresos']
/** Gastos que no cuentan para la ganancia: la mercadería ya se cuenta como costo de lo vendido y el retiro es del dueño. */
export const NO_OPERATIVOS = ['Mercadería', 'Retiro del dueño']
export const MEDIOS = ['Efectivo', 'Transferencia', 'Mercado Pago', 'Tarjeta']

export interface ProdOverride {
  nombre?: string
  marca?: string
  categoria?: string
  precio?: number
  /** Precio tachado de la oferta (0 = sin oferta). */
  precioAntes?: number
  nuevo?: boolean
  oculto?: boolean
  descripcion?: string
  /** Stock por talle (reemplaza al original). */
  stock?: Record<string, number>
}

// ── Almacenamiento persistente con suscripción ────────────────────────────

function persistent<T>(key: string, init: () => T) {
  let cache: T | null = null
  const listeners = new Set<() => void>()

  const read = (): T => {
    if (cache !== null) return cache
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        cache = JSON.parse(raw) as T
        return cache
      }
    } catch {
      /* sin storage o dato roto: se usa el valor inicial */
    }
    cache = init()
    try {
      localStorage.setItem(key, JSON.stringify(cache))
    } catch {
      /* queda en memoria */
    }
    return cache
  }
  const write = (value: T) => {
    cache = value
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* queda en memoria */
    }
    listeners.forEach((l) => l())
  }
  const subscribe = (cb: () => void) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
  }
  const reset = () => {
    cache = null
    try {
      localStorage.removeItem(key)
    } catch {
      /* nada */
    }
    listeners.forEach((l) => l())
  }
  return { read, write, reset, use: () => useSyncExternalStore(subscribe, read, read) }
}

// ── Pedidos de ejemplo ────────────────────────────────────────────────────

/** Los pedidos de ejemplo sólo usan modelos que se ven en la tienda. */
const VISIBLES = MOCK_PRODUCTOS.filter((p) => !p.oculto)

const NOMBRES = [
  ['Martina Gómez', '3516 21-4410'],
  ['Lucas Ferreyra', '3513 88-1203'],
  ['Sofía Aguirre', '3512 04-7788'],
  ['Joaquín Peralta', '3517 33-9051'],
  ['Camila Rojas', '3516 70-2216'],
  ['Tomás Villarreal', '3513 12-6643'],
  ['Valentina Cabrera', '3512 55-0187'],
  ['Nicolás Bustos', '3517 98-3320'],
  ['Agustina Luna', '3516 41-7702'],
  ['Franco Medina', '3513 60-5519'],
  ['Julieta Sosa', '3512 29-8834'],
  ['Mateo Herrera', '3517 14-2260'],
]

function semilla(): PedidoAdmin[] {
  let r = 7
  const rnd = () => {
    r = (r * 1103515245 + 12345) & 0x7fffffff
    return r / 0x7fffffff
  }
  const ahora = Date.now()
  const lista: PedidoAdmin[] = []
  const N = 22
  for (let i = 0; i < N; i++) {
    const dias = (N - 1 - i) * (14 / N) + rnd() * 0.5
    const fecha = new Date(ahora - dias * 86400000 - rnd() * 3600000 * 5)
    fecha.setHours(10 + Math.floor(rnd() * 9), Math.floor(rnd() * 60))
    if (fecha.getTime() > ahora) fecha.setTime(ahora - 3600000)
    const [nombre, telefono] = NOMBRES[Math.floor(rnd() * NOMBRES.length)]
    const metodo = (['mercadopago', 'transferencia', 'whatsapp'] as MetodoPago[])[Math.floor(rnd() * 3)]
    const entrega: TipoEntrega = rnd() > 0.45 ? 'envio' : 'retiro'
    const nItems = rnd() > 0.8 ? 2 : 1
    const items: ItemPedido[] = []
    for (let k = 0; k < nItems; k++) {
      const p = VISIBLES[Math.floor(rnd() * VISIBLES.length)]
      const talle = p.stock[Math.floor(rnd() * p.stock.length)]?.talle ?? '41'
      items.push({
        producto_id: p.id,
        nombre: p.nombre,
        marca: p.marca,
        talle,
        cantidad: 1,
        precio_unit: metodo === 'transferencia' ? Math.max(0, p.precio - SITE.transferDiscount) : p.precio,
      })
    }
    const edad = dias
    const estado: EstadoPedido =
      edad > 6
        ? rnd() > 0.1
          ? 'entregado'
          : 'cancelado'
        : edad > 3
          ? rnd() > 0.5
            ? 'enviado'
            : 'entregado'
          : edad > 1
            ? rnd() > 0.5
              ? 'pagado'
              : 'enviado'
            : rnd() > 0.5
              ? 'pendiente'
              : 'pagado'
    lista.push({
      id: 1001 + i,
      fecha: fecha.toISOString(),
      cliente: { nombre, telefono },
      items,
      metodo_pago: metodo,
      entrega,
      direccion: entrega === 'envio' ? 'Av. Colón 1250, Córdoba' : undefined,
      notas: entrega === 'envio' ? 'Envío por Correo Argentino' : 'Retiro en el showroom',
      estado,
      total: items.reduce((a, it) => a + it.precio_unit * it.cantidad, 0),
    })
  }
  return lista.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

function semillaCaja(): Movimiento[] {
  const hace = (d: number, h = 12) => {
    const f = new Date(Date.now() - d * 86400000)
    f.setHours(h, 0, 0, 0)
    return f.toISOString()
  }
  const lista: Omit<Movimiento, 'id'>[] = [
    { fecha: hace(12, 11), tipo: 'gasto', categoria: 'Mercadería', concepto: 'Compra a proveedor (ejemplo)', monto: 380000, medio: 'Transferencia' },
    { fecha: hace(10, 16), tipo: 'gasto', categoria: 'Publicidad', concepto: 'Promoción en Instagram', monto: 25000, medio: 'Tarjeta' },
    { fecha: hace(7, 10), tipo: 'gasto', categoria: 'Envíos y embalaje', concepto: 'Cajas y bolsas', monto: 18000, medio: 'Efectivo' },
    { fecha: hace(5, 18), tipo: 'gasto', categoria: 'Alquiler y servicios', concepto: 'Internet del local', monto: 22000, medio: 'Transferencia' },
    { fecha: hace(2, 13), tipo: 'gasto', categoria: 'Comisiones', concepto: 'Comisiones Mercado Pago', monto: 9500, medio: 'Mercado Pago' },
  ]
  return lista.map((m, i) => ({ ...m, id: `ej${i}` }))
}

const pedidosStore = persistent<PedidoAdmin[]>('bz_admin_pedidos', semilla)
const cajaStore = persistent<Movimiento[]>('bz_admin_caja', semillaCaja)
/** Costo por modelo (id → $). Sirve en los dos modos: se guarda en este navegador. */
const costosStore = persistent<Record<number, number>>('bz_admin_costos', () => ({}))
const overridesStore = persistent<Record<number, ProdOverride>>('bz_admin_prod', () => ({}))
const customStore = persistent<Producto[]>('bz_admin_custom', () => [])

export const usePedidosLocales = pedidosStore.use
export const useOverrides = overridesStore.use
export const useProductosPropios = customStore.use
export const useCaja = cajaStore.use
export const useCostos = costosStore.use

// ── Caja y costos ─────────────────────────────────────────────────────────

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function agregarMovimiento(m: Omit<Movimiento, 'id'>) {
  cajaStore.write([{ ...m, id: nuevoId() }, ...cajaStore.read()].sort((a, b) => b.fecha.localeCompare(a.fecha)))
}

export function eliminarMovimiento(id: string) {
  cajaStore.write(cajaStore.read().filter((m) => m.id !== id))
}

export function setCosto(id: number, costo: number | null) {
  const c = { ...costosStore.read() }
  if (costo === null || !(costo > 0)) delete c[id]
  else c[id] = Math.round(costo)
  costosStore.write(c)
}

export function setCostos(lista: Record<number, number>) {
  costosStore.write({ ...costosStore.read(), ...lista })
}

/** Stock actual de un talle, leyendo el catálogo ya combinado. */
const stockDe = (productos: Producto[], id: number, talle: string) =>
  productos.find((p) => p.id === id)?.stock.find((s) => s.talle === talle)?.cantidad ?? 0

/**
 * Compra de mercadería (modo local): suma los pares al stock, guarda el costo del modelo
 * y deja el gasto anotado en la caja.
 */
export function registrarCompra(c: CompraMercaderia & { fecha: string; medio: string }, productos: Producto[]) {
  const stock: Record<string, number> = {}
  for (const [t, n] of Object.entries(c.talles)) if (n > 0) stock[t] = stockDe(productos, c.producto_id, t) + n
  if (MODO_LOCAL) editarProducto(c.producto_id, { stock })
  if (c.costo_unit > 0) setCosto(c.producto_id, c.costo_unit)
  const pares = Object.values(c.talles).reduce((a, n) => a + n, 0)
  agregarMovimiento({
    fecha: c.fecha,
    tipo: 'gasto',
    categoria: 'Mercadería',
    concepto: `${c.nombre} · ${pares} ${pares === 1 ? 'par' : 'pares'}${c.proveedor ? ` · ${c.proveedor}` : ''}`,
    monto: pares * c.costo_unit,
    medio: c.medio,
    compra: { producto_id: c.producto_id, nombre: c.nombre, talles: c.talles, costo_unit: c.costo_unit, proveedor: c.proveedor },
  })
  return pares
}

/**
 * Al pasar un pedido a pagado/enviado/entregado se descuentan sus pares del stock;
 * si se cancela o vuelve a pendiente, se devuelven (sólo en modo local).
 */
export function cambiarEstadoLocal(p: PedidoAdmin, estado: string, productos: Producto[]) {
  const esVenta = ESTADOS_VENTA.includes(estado)
  let descontado = !!p.stock_descontado
  if (esVenta !== descontado) {
    const signo = esVenta ? -1 : 1
    const porProducto = new Map<number, Record<string, number>>()
    for (const it of p.items) {
      const m = porProducto.get(it.producto_id) ?? {}
      const base = m[it.talle] ?? stockDe(productos, it.producto_id, it.talle)
      m[it.talle] = Math.max(0, base + signo * it.cantidad)
      porProducto.set(it.producto_id, m)
    }
    for (const [id, stock] of porProducto) editarProducto(id, { stock })
    descontado = esVenta
  }
  actualizarPedido(p.id, { estado, stock_descontado: descontado })
}

// ── Pedidos ───────────────────────────────────────────────────────────────

export function actualizarPedido(id: PedidoAdmin['id'], patch: Partial<PedidoAdmin>) {
  pedidosStore.write(pedidosStore.read().map((p) => (p.id === id ? { ...p, ...patch } : p)))
}

export function eliminarPedido(id: PedidoAdmin['id']) {
  pedidosStore.write(pedidosStore.read().filter((p) => p.id !== id))
}

export function crearPedidoManual(p: Omit<PedidoAdmin, 'id' | 'fecha'>, productos?: Producto[]) {
  const lista = pedidosStore.read()
  const id = lista.reduce((m, x) => Math.max(m, Number(x.id) || 0), 1000) + 1
  const nuevo: PedidoAdmin = { ...p, id, fecha: new Date().toISOString(), stock_descontado: false }
  pedidosStore.write([nuevo, ...lista])
  // Una venta que ya entra cobrada descuenta el stock en el momento.
  if (productos && ESTADOS_VENTA.includes(p.estado)) cambiarEstadoLocal({ ...nuevo, estado: 'pendiente' }, p.estado, productos)
  return id
}

/** Guarda en este navegador el pedido hecho desde la tienda (sirve para probar el flujo completo). */
export function registrarPedidoDeTienda(input: {
  items: CartItem[]
  total: number
  metodo: MetodoPago
  entrega: TipoEntrega
  nombre: string
  telefono: string
  email?: string
  direccion?: string
}) {
  const esTransf = input.metodo === 'transferencia'
  return crearPedidoManual({
    cliente: { nombre: input.nombre, telefono: input.telefono, email: input.email },
    items: input.items.map((i) => ({
      producto_id: i.productoId,
      nombre: i.nombre,
      marca: i.marca,
      talle: i.talle,
      cantidad: i.cantidad,
      precio_unit: esTransf ? Math.max(0, i.precio - SITE.transferDiscount) : i.precio,
    })),
    metodo_pago: input.metodo,
    entrega: input.entrega,
    direccion: input.direccion,
    notas: input.entrega === 'envio' ? `Envío: ${input.direccion ?? ''}` : 'Retiro en el showroom',
    estado: 'pendiente',
    total: input.total,
  })
}

// ── Catálogo ──────────────────────────────────────────────────────────────

/** Une el catálogo base con los productos propios y las ediciones del panel. */
export function aplicarCatalogo(base: Producto[], propios: Producto[], ov: Record<number, ProdOverride>): Producto[] {
  return [...propios, ...base].map((p) => {
    const o = ov[p.id]
    if (!o) return { ...p, categoria: normCategoria(p.categoria) }
    let stock = p.stock
    if (o.stock) {
      const mapa = new Map(p.stock.map((s) => [s.talle, s.cantidad]))
      for (const [t, c] of Object.entries(o.stock)) mapa.set(t, c)
      stock = [...mapa.entries()]
        .map(([talle, cantidad]) => ({ producto_id: p.id, talle, cantidad }))
        .sort((a, b) => Number(a.talle) - Number(b.talle))
    }
    return {
      ...p,
      nombre: o.nombre ?? p.nombre,
      marca: o.marca ?? p.marca,
      categoria: normCategoria(o.categoria ?? p.categoria),
      precio: o.precio ?? p.precio,
      precioAntes: o.precioAntes !== undefined ? o.precioAntes || undefined : p.precioAntes,
      nuevo: o.nuevo ?? p.nuevo,
      oculto: o.oculto ?? p.oculto,
      descripcion: o.descripcion ?? p.descripcion,
      stock,
    }
  })
}

export function editarProducto(id: number, patch: ProdOverride) {
  const ov = overridesStore.read()
  const prev = ov[id] ?? {}
  const next: ProdOverride = { ...prev, ...patch }
  if (patch.stock) next.stock = { ...(prev.stock ?? {}), ...patch.stock }
  overridesStore.write({ ...ov, [id]: next })
}

export function crearProducto(p: Omit<Producto, 'id'>) {
  const lista = customStore.read()
  const id = lista.reduce((m, x) => Math.max(m, x.id), 1000) + 1
  customStore.write([{ ...p, id, stock: p.stock.map((s) => ({ ...s, producto_id: id })) }, ...lista])
  return id
}

export function eliminarProductoPropio(id: number) {
  customStore.write(customStore.read().filter((p) => p.id !== id))
}

export const esProductoPropio = (id: number) => id > 1000

// ── Mantenimiento ─────────────────────────────────────────────────────────

export function restablecerDatosLocales() {
  cajaStore.reset()
  costosStore.reset()
  pedidosStore.reset()
  overridesStore.reset()
  customStore.reset()
}

export function exportarRespaldo(): string {
  return JSON.stringify(
    {
      version: 1,
      fecha: new Date().toISOString(),
      pedidos: pedidosStore.read(),
      overrides: overridesStore.read(),
      productos: customStore.read(),
      caja: cajaStore.read(),
      costos: costosStore.read(),
    },
    null,
    2,
  )
}

export function importarRespaldo(texto: string): boolean {
  try {
    const d = JSON.parse(texto) as {
      pedidos?: PedidoAdmin[]
      overrides?: Record<number, ProdOverride>
      productos?: Producto[]
      caja?: Movimiento[]
      costos?: Record<number, number>
    }
    if (!Array.isArray(d.pedidos) || typeof d.overrides !== 'object' || !Array.isArray(d.productos)) return false
    pedidosStore.write(d.pedidos)
    overridesStore.write(d.overrides ?? {})
    customStore.write(d.productos)
    if (Array.isArray(d.caja)) cajaStore.write(d.caja)
    if (d.costos && typeof d.costos === 'object') costosStore.write(d.costos)
    return true
  } catch {
    return false
  }
}

// ── Filas del servidor → PedidoAdmin ──────────────────────────────────────

const txt = (row: Record<string, unknown>, keys: string[]): string => {
  for (const k of keys) {
    const v = row[k]
    if (v !== null && v !== undefined && v !== '') return String(v)
  }
  return ''
}

/** Lee una fila de la API sin asumir nombres de columnas exactos. */
export function normalizarPedido(row: Record<string, unknown> & { id: number | string }): PedidoAdmin {
  const rawItems = (row.items ?? row.pedido_items) as unknown
  const items: ItemPedido[] = Array.isArray(rawItems)
    ? (rawItems as Record<string, unknown>[]).map((it) => ({
        producto_id: Number(it.producto_id) || 0,
        nombre: txt(it, ['nombre', 'producto', 'producto_nombre']) || `Producto #${it.producto_id ?? ''}`,
        marca: txt(it, ['marca']),
        talle: txt(it, ['talle']),
        cantidad: Number(it.cantidad) || 1,
        precio_unit: Number(it.precio_unit ?? it.precio) || 0,
      }))
    : []
  const notas = txt(row, ['notas'])
  return {
    id: row.id,
    fecha: txt(row, ['created_at', 'fecha']),
    cliente: {
      nombre: txt(row, ['cliente_nombre', 'nombre', 'cliente']) || 'Sin nombre',
      telefono: txt(row, ['telefono', 'cliente_telefono']),
      email: txt(row, ['email', 'cliente_email']) || undefined,
    },
    items,
    metodo_pago: txt(row, ['metodo_pago']) || '—',
    entrega: /retiro/i.test(notas) ? 'retiro' : 'envio',
    direccion: /env[ií]o:/i.test(notas) ? notas.replace(/.*env[ií]o:\s*/i, '').split('|')[0].trim() : undefined,
    notas,
    estado: txt(row, ['estado']) || 'pendiente',
    total: Number(row.total) || items.reduce((a, i) => a + i.cantidad * i.precio_unit, 0),
  }
}
