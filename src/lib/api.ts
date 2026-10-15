import type {
  AdminStats,
  EstadoPedido,
  PedidoCreado,
  PedidoPayload,
  PedidoRow,
  Producto,
} from '@/types'
import { MOCK_PRODUCTOS } from '@/data/mock'
import { normalizeProducto } from './normalize'

const API_URL = (import.meta.env.VITE_API_URL ?? 'https://boomzapas-server-production.up.railway.app').replace(/\/$/, '')
/**
 * Por ahora la tienda NO se conecta al servidor ni a Supabase: usa el catálogo local
 * (src/data/fotosCatalogo.ts) y los pedidos se confirman por WhatsApp.
 * Para volver a conectar todo: VITE_CONECTAR_API=true en el archivo .env.
 */
export const CONECTAR_API = import.meta.env.VITE_CONECTAR_API === 'true'
export const MODO_DEMO = !CONECTAR_API

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (MODO_DEMO) throw new ApiError('La tienda está sin conexión al servidor por ahora (modo local).', 0)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['x-admin-token'] = token

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...headers, ...init.headers } })
  } catch {
    const host = API_URL.replace(/^https?:\/\//, '')
    throw new ApiError(`No pudimos conectarnos con el servidor (${host}). Revisá tu conexión o que el servidor esté activo.`, 0)
  }

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (body as { error?: string } | null)?.error ?? `Error ${res.status}`
    throw new ApiError(res.status === 401 ? 'Token incorrecto.' : msg, res.status)
  }
  return body as T
}

// ── Tienda ────────────────────────────────────────────────────────────────

export async function getProductos(): Promise<Producto[]> {
  if (MODO_DEMO) return MOCK_PRODUCTOS
  const body = await request<unknown>('/api/productos')
  // Acepta tanto un array directo como { productos: [...] } o { data: [...] }.
  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { productos?: unknown })?.productos)
      ? (body as { productos: unknown[] }).productos
      : Array.isArray((body as { data?: unknown })?.data)
        ? (body as { data: unknown[] }).data
        : null
  if (!list) throw new ApiError('El servidor respondió con un formato inesperado en /api/productos.', 502)
  return (list as Record<string, unknown>[])
    .filter((r) => r && typeof r === 'object' && Number.isFinite(Number(r.id)))
    .map(normalizeProducto)
}

export const crearPedido = (payload: PedidoPayload) =>
  request<PedidoCreado>('/api/pedido', { method: 'POST', body: JSON.stringify(payload) })

// ── Admin ─────────────────────────────────────────────────────────────────

export const adminStats = (token: string) => request<AdminStats>('/api/admin/stats', {}, token)

export const adminPedidos = (token: string) => request<PedidoRow[]>('/api/admin/pedidos', {}, token)

export const adminSetEstado = (token: string, id: number | string, estado: EstadoPedido) =>
  request<PedidoRow>(`/api/admin/pedido/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) }, token)

export const adminSetStock = (token: string, producto_id: number, talle: string, cantidad: number) =>
  request<unknown>(
    '/api/admin/stock',
    { method: 'PATCH', body: JSON.stringify({ producto_id, talle, cantidad }) },
    token,
  )

// ── Reseñas ───────────────────────────────────────────────────────────────

/** Envía una reseña al servidor (requiere el endpoint POST /api/resenas; ver README). */
export async function enviarResenaApi(r: { user: string; text: string; model?: string; rating?: number }): Promise<void> {
  await request<unknown>('/api/resenas', {
    method: 'POST',
    body: JSON.stringify({ nombre: r.user, texto: r.text, modelo: r.model ?? null, puntaje: r.rating ?? null }),
  })
}
