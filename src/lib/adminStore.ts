import { useSyncExternalStore } from 'react'
import { MOCK_PRODUCTOS } from '@/data/mock'
import { SITE } from '@/config/site'
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
}

export interface ProdOverride {
  nombre?: string
  marca?: string
  categoria?: string
  precio?: number
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
      const p = MOCK_PRODUCTOS[Math.floor(rnd() * MOCK_PRODUCTOS.length)]
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
      notas: entrega === 'envio' ? 'Envío por Correo Argentino' : 'Retiro en tienda',
      estado,
      total: items.reduce((a, it) => a + it.precio_unit * it.cantidad, 0),
    })
  }
  return lista.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

const pedidosStore = persistent<PedidoAdmin[]>('bz_admin_pedidos', semilla)
const overridesStore = persistent<Record<number, ProdOverride>>('bz_admin_prod', () => ({}))
const customStore = persistent<Producto[]>('bz_admin_custom', () => [])

export const usePedidosLocales = pedidosStore.use
export const useOverrides = overridesStore.use
export const useProductosPropios = customStore.use

// ── Pedidos ───────────────────────────────────────────────────────────────

export function actualizarPedido(id: PedidoAdmin['id'], patch: Partial<PedidoAdmin>) {
  pedidosStore.write(pedidosStore.read().map((p) => (p.id === id ? { ...p, ...patch } : p)))
}

export function eliminarPedido(id: PedidoAdmin['id']) {
  pedidosStore.write(pedidosStore.read().filter((p) => p.id !== id))
}

export function crearPedidoManual(p: Omit<PedidoAdmin, 'id' | 'fecha'>) {
  const lista = pedidosStore.read()
  const id = lista.reduce((m, x) => Math.max(m, Number(x.id) || 0), 1000) + 1
  pedidosStore.write([{ ...p, id, fecha: new Date().toISOString() }, ...lista])
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
    notas: input.entrega === 'envio' ? `Envío: ${input.direccion ?? ''}` : 'Retiro en tienda',
    estado: 'pendiente',
    total: input.total,
  })
}

// ── Catálogo ──────────────────────────────────────────────────────────────

/** Une el catálogo base con los productos propios y las ediciones del panel. */
export function aplicarCatalogo(base: Producto[], propios: Producto[], ov: Record<number, ProdOverride>): Producto[] {
  return [...propios, ...base].map((p) => {
    const o = ov[p.id]
    if (!o) return p
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
      categoria: o.categoria ?? p.categoria,
      precio: o.precio ?? p.precio,
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
    },
    null,
    2,
  )
}

export function importarRespaldo(texto: string): boolean {
  try {
    const d = JSON.parse(texto) as { pedidos?: PedidoAdmin[]; overrides?: Record<number, ProdOverride>; productos?: Producto[] }
    if (!Array.isArray(d.pedidos) || typeof d.overrides !== 'object' || !Array.isArray(d.productos)) return false
    pedidosStore.write(d.pedidos)
    overridesStore.write(d.overrides ?? {})
    customStore.write(d.productos)
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
