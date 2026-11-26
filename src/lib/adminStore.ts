import { useSyncExternalStore } from 'react'
import { normCategoria } from './categorias'
import { MOCK_PRODUCTOS } from '@/data/mock'
import { MODO_DEMO as MODO_LOCAL } from '@/lib/api'
import { escribir, leerPublico, nube } from '@/lib/nube'
import type { DireccionEnvio } from '@/lib/whatsapp'
import type { EstadoPedido, Producto, TipoEntrega } from '@/types'

/**
 * Datos del panel, guardados en Supabase (se ven igual desde cualquier compu o celu):
 * - pedidos (los de la web y los cargados a mano), caja y costos: sólo con la sesión del panel;
 * - cambios del catálogo (precio, stock, ocultar) y modelos nuevos: los lee también la tienda.
 * Arranca vacío: sin datos de ejemplo, la plata empieza en 0.
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
  /** El stock de este pedido ya se descontó. */
  stock_descontado?: boolean
  /** Datos que manda la web. */
  dni?: string
  cuotas?: number
  envio?: DireccionEnvio
  referencias?: string
  origen?: string
  /** Código por fecha y hora que llevó el mensaje de WhatsApp (si no hubo número). */
  codigo?: string
  /** Cargado a mano desde el panel. */
  manual?: boolean
  /** Lo que paga el cliente si eligió cuotas (incluye el recargo que se queda Mercado Pago). `total` es lo que recibe la tienda. */
  total_cliente?: number
}

/** Número de pedido con 4 cifras: 12 → "0012". */
export const nroPedido = (id: PedidoAdmin['id']) => (typeof id === 'number' || /^\d+$/.test(String(id)) ? String(id).padStart(4, '0') : String(id))

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

// ── Almacenes en memoria con suscripción ──────────────────────────────────

function memoria<T>(init: T, cacheKey?: string) {
  let cache: T | null = null
  const listeners = new Set<() => void>()
  const read = (): T => {
    if (cache !== null) return cache
    if (cacheKey) {
      try {
        const raw = localStorage.getItem(cacheKey)
        if (raw) return (cache = JSON.parse(raw) as T)
      } catch {
        /* sin storage */
      }
    }
    return (cache = init)
  }
  const write = (value: T) => {
    cache = value
    if (cacheKey) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(value))
      } catch {
        /* queda en memoria */
      }
    }
    listeners.forEach((l) => l())
  }
  const subscribe = (cb: () => void) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
  }
  return { read, write, use: () => useSyncExternalStore(subscribe, read, read) }
}

// Datos privados del panel: sólo en memoria (no quedan guardados en el navegador).
const pedidosStore = memoria<PedidoAdmin[]>([])
const cajaStore = memoria<Movimiento[]>([])
const costosStore = memoria<Record<number, number>>({})
// Catálogo: público, se guarda una copia para que la tienda abra con los precios y el stock al día.
const overridesStore = memoria<Record<number, ProdOverride>>({}, 'bz_catalogo_ajustes')
const customStore = memoria<Producto[]>([], 'bz_catalogo_propios')

export const usePedidosLocales = pedidosStore.use
export const getPedidos = pedidosStore.read
export const useOverrides = overridesStore.use
export const useProductosPropios = customStore.use
export const useCaja = cajaStore.use
export const useCostos = costosStore.use

// Limpieza: los datos de ejemplo del panel anterior (guardados en el navegador) ya no se usan.
try {
  for (const k of ['bz_admin_pedidos', 'bz_admin_caja', 'bz_admin_costos', 'bz_admin_prod', 'bz_admin_custom']) localStorage.removeItem(k)
} catch {
  /* nada */
}

// ── Carga desde Supabase ──────────────────────────────────────────────────

interface FilaPedido {
  numero: number
  creado_en: string
  codigo: string | null
  cliente: string | null
  telefono: string | null
  total: number | null
  metodo: string | null
  cuotas: number | null
  entrega: string | null
  estado: string | null
  nota_interna: string | null
  seguimiento: string | null
  descuento: number | null
  stock_descontado: boolean | null
  datos: Record<string, unknown> | null
}

const MARCA_DE = new Map(MOCK_PRODUCTOS.map((p) => [p.id, p.marca]))

function filaAPedido(f: FilaPedido): PedidoAdmin {
  const d = (f.datos ?? {}) as Record<string, unknown>
  const envio = (d.envio ?? undefined) as DireccionEnvio | undefined
  const items = Array.isArray(d.items)
    ? (d.items as Record<string, unknown>[]).map((it) => ({
        producto_id: Number(it.producto_id) || 0,
        nombre: String(it.nombre ?? 'Producto'),
        marca: String(it.marca ?? MARCA_DE.get(Number(it.producto_id)) ?? ''),
        talle: String(it.talle ?? ''),
        cantidad: Number(it.cantidad) || 1,
        precio_unit: Number(it.precio_unit) || 0,
      }))
    : []
  const entrega: TipoEntrega = f.entrega === 'retiro' ? 'retiro' : 'envio'
  const direccion = envio
    ? `${envio.calle} ${envio.numero}${envio.piso ? `, ${envio.piso}` : ''} · ${envio.localidad}, ${envio.provincia} · CP ${envio.cp}`
    : typeof d.direccion === 'string'
      ? d.direccion
      : undefined
  return {
    id: f.numero,
    fecha: f.creado_en,
    cliente: { nombre: f.cliente || 'Sin nombre', telefono: f.telefono || '', email: (d.email as string) || undefined },
    items,
    metodo_pago: f.metodo || '—',
    entrega,
    direccion,
    notas: [d.notas, d.referencias ? `Referencias: ${d.referencias}` : null].filter(Boolean).join(' · ') || (entrega === 'retiro' ? 'Retiro en el showroom' : ''),
    estado: f.estado || 'pendiente',
    // lo que recibe la tienda: el precio de contado (en cuotas, el recargo se lo queda Mercado Pago)
    total: Number(d.precio_contado) || Number(f.total) || items.reduce((a, i) => a + i.precio_unit * i.cantidad, 0),
    total_cliente: Number(d.precio_contado) && Number(f.total) > Number(d.precio_contado) ? Number(f.total) : undefined,
    nota_interna: f.nota_interna ?? undefined,
    seguimiento: f.seguimiento ?? undefined,
    descuento: f.descuento ?? undefined,
    stock_descontado: !!f.stock_descontado,
    dni: (d.dni as string) || undefined,
    cuotas: f.cuotas ?? undefined,
    envio,
    referencias: (d.referencias as string) || undefined,
    origen: (d.origen as string) || undefined,
    codigo: f.codigo ?? undefined,
    manual: !!d.manual,
  }
}

/** Catálogo al día (lo usa la tienda y el panel). */
export async function cargarCatalogoNube() {
  const [ajustes, propios] = await Promise.all([
    leerPublico<{ producto_id: number; datos: ProdOverride }>('catalogo_ajustes?select=producto_id,datos'),
    leerPublico<{ id: number; datos: Producto }>('productos_propios?select=id,datos&order=id.desc'),
  ])
  overridesStore.write(Object.fromEntries(ajustes.map((a) => [a.producto_id, a.datos ?? {}])))
  customStore.write(propios.map((p) => ({ ...p.datos, id: p.id, stock: (p.datos.stock ?? []).map((s) => ({ ...s, producto_id: p.id })) })))
}

/** Pedidos, caja y costos (requiere la sesión del panel). */
export async function cargarPanelNube() {
  const sb = await nube()
  const [ped, caja, cos] = await Promise.all([
    sb.from('pedidos').select('numero,creado_en,codigo,cliente,telefono,total,metodo,cuotas,entrega,estado,nota_interna,seguimiento,descuento,stock_descontado,datos').order('numero', { ascending: false }).limit(2000),
    sb.from('caja').select('id,fecha,tipo,categoria,concepto,monto,medio,compra').order('fecha', { ascending: false }).limit(5000),
    sb.from('costos').select('producto_id,costo'),
  ])
  const error = ped.error ?? caja.error ?? cos.error
  if (error) throw new Error(error.message)
  pedidosStore.write((ped.data as FilaPedido[]).map(filaAPedido))
  cajaStore.write((caja.data as Movimiento[]).map((m) => ({ ...m, compra: m.compra ?? undefined })))
  costosStore.write(Object.fromEntries((cos.data as { producto_id: number; costo: number }[]).map((c) => [c.producto_id, c.costo])))
}

/** Al salir del panel se borran de la memoria los datos privados. */
export function vaciarPanel() {
  pedidosStore.write([])
  cajaStore.write([])
  costosStore.write({})
}

// ── Caja y costos ─────────────────────────────────────────────────────────

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function agregarMovimiento(m: Omit<Movimiento, 'id'>) {
  const mov: Movimiento = { ...m, id: nuevoId(), monto: Math.max(0, Math.round(m.monto)) }
  cajaStore.write([mov, ...cajaStore.read()].sort((a, b) => b.fecha.localeCompare(a.fecha)))
  void escribir('caja', (sb) => sb.from('caja').insert({ ...mov, compra: mov.compra ?? null }))
}

export function eliminarMovimiento(id: string) {
  cajaStore.write(cajaStore.read().filter((m) => m.id !== id))
  void escribir('caja', (sb) => sb.from('caja').delete().eq('id', id))
}

export function setCosto(id: number, costo: number | null) {
  const c = { ...costosStore.read() }
  if (costo === null || !(costo > 0)) {
    delete c[id]
    void escribir('costo', (sb) => sb.from('costos').delete().eq('producto_id', id))
  } else {
    c[id] = Math.round(costo)
    void escribir('costo', (sb) => sb.from('costos').upsert({ producto_id: id, costo: c[id] }))
  }
  costosStore.write(c)
}

export function setCostos(lista: Record<number, number>) {
  const limpio = Object.fromEntries(Object.entries(lista).filter(([, v]) => v > 0).map(([k, v]) => [Number(k), Math.round(v)]))
  costosStore.write({ ...costosStore.read(), ...limpio })
  const filas = Object.entries(limpio).map(([producto_id, costo]) => ({ producto_id: Number(producto_id), costo }))
  if (filas.length) void escribir('costos', (sb) => sb.from('costos').upsert(filas))
}

/** Stock actual de un talle, leyendo el catálogo ya combinado. */
const stockDe = (productos: Producto[], id: number, talle: string) =>
  productos.find((p) => p.id === id)?.stock.find((s) => s.talle === talle)?.cantidad ?? 0

/**
 * Compra de mercadería: suma los pares al stock, guarda el costo del modelo
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
 * si se cancela o vuelve a pendiente, se devuelven.
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

const COLUMNAS: (keyof PedidoAdmin)[] = ['estado', 'nota_interna', 'seguimiento', 'descuento', 'stock_descontado']

export function actualizarPedido(id: PedidoAdmin['id'], patch: Partial<PedidoAdmin>) {
  pedidosStore.write(pedidosStore.read().map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const fila: Record<string, unknown> = { actualizado_en: new Date().toISOString() }
  for (const k of COLUMNAS) if (k in patch) fila[k] = patch[k] ?? null
  void escribir('pedido', (sb) => sb.from('pedidos').update(fila).eq('numero', Number(id)))
}

export function eliminarPedido(id: PedidoAdmin['id']) {
  pedidosStore.write(pedidosStore.read().filter((p) => p.id !== id))
  void escribir('pedido', (sb) => sb.from('pedidos').delete().eq('numero', Number(id)))
}

/** Venta o pedido cargado a mano (showroom, Instagram…). Toma el número siguiente. */
export async function crearPedidoManual(p: Omit<PedidoAdmin, 'id' | 'fecha'>, productos?: Producto[]): Promise<number | null> {
  const fila = await escribir<{ numero: number; creado_en: string }>('venta', (sb) =>
    sb
      .from('pedidos')
      .insert({
        codigo: 'manual',
        cliente: p.cliente.nombre,
        telefono: p.cliente.telefono,
        total: Math.round(p.total),
        metodo: p.metodo_pago,
        cuotas: 1,
        entrega: p.entrega,
        estado: 'pendiente',
        descuento: p.descuento ?? null,
        stock_descontado: false,
        datos: { manual: true, items: p.items, email: p.cliente.email, direccion: p.direccion, notas: p.notas },
      })
      .select('numero,creado_en')
      .single(),
  )
  if (!fila) return null
  const nuevo: PedidoAdmin = { ...p, id: fila.numero, fecha: fila.creado_en, estado: 'pendiente', stock_descontado: false, manual: true }
  pedidosStore.write([nuevo, ...pedidosStore.read()])
  // Una venta que ya entra cobrada descuenta el stock en el momento.
  if (ESTADOS_VENTA.includes(p.estado)) {
    if (productos) cambiarEstadoLocal(nuevo, p.estado, productos)
    else actualizarPedido(nuevo.id, { estado: p.estado })
  }
  return fila.numero
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
  // Los modelos cargados desde el panel se guardan enteros; los del catálogo, como ajuste.
  if (esProductoPropio(id)) {
    const lista = customStore.read()
    const actual = lista.find((p) => p.id === id)
    if (actual) {
      const [actualizado] = aplicarCatalogo([], [actual], { [id]: next })
      customStore.write(lista.map((p) => (p.id === id ? actualizado : p)))
      void escribir('modelo', (sb) => sb.from('productos_propios').upsert({ id, datos: actualizado }))
      return
    }
  }
  overridesStore.write({ ...ov, [id]: next })
  void escribir('catálogo', (sb) => sb.from('catalogo_ajustes').upsert({ producto_id: id, datos: next, actualizado_en: new Date().toISOString() }))
}

export function crearProducto(p: Omit<Producto, 'id'>) {
  const lista = customStore.read()
  const id = Math.max(1000, ...lista.map((x) => x.id)) + 1 + Math.floor(Math.random() * 3)
  const nuevo: Producto = { ...p, id, stock: p.stock.map((s) => ({ ...s, producto_id: id })) }
  customStore.write([nuevo, ...lista])
  void escribir('modelo', (sb) => sb.from('productos_propios').insert({ id, datos: nuevo }))
  return id
}

export function eliminarProductoPropio(id: number) {
  customStore.write(customStore.read().filter((p) => p.id !== id))
  void escribir('modelo', (sb) => sb.from('productos_propios').delete().eq('id', id))
}

export const esProductoPropio = (id: number) => id > 1000

// ── Respaldo ──────────────────────────────────────────────────────────────

/** Copia de todo lo del panel en un archivo (por las dudas, además de lo que guarda Supabase). */
export function exportarRespaldo(): string {
  return JSON.stringify(
    {
      version: 2,
      fecha: new Date().toISOString(),
      pedidos: pedidosStore.read(),
      caja: cajaStore.read(),
      costos: costosStore.read(),
      catalogo: overridesStore.read(),
      productos: customStore.read(),
    },
    null,
    2,
  )
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
