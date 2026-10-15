import { createHash, timingSafeEqual } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** Tipos mínimos de las funciones de Vercel (evita depender de @vercel/node). */
export interface Req {
  method?: string
  headers: Record<string, string | string[] | undefined>
  query: Record<string, string | string[] | undefined>
  body?: unknown
}
export interface Res {
  status(code: number): Res
  json(body: unknown): void
  setHeader(name: string, value: string): Res
  end(): void
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let client: SupabaseClient | null = null

/** Cliente de Supabase con la clave de servicio (sólo vive en el servidor, nunca llega al navegador). */
export function db(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new HttpError(500, 'Falta configurar SUPABASE_URL y SUPABASE_SERVICE_KEY en Vercel.')
  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

const digest = (v: string) => createHash('sha256').update(v).digest()

/** Compara el token del encabezado x-admin-token con ADMIN_TOKEN (en tiempo constante). */
export function requireAdmin(req: Req) {
  const expected = process.env.ADMIN_TOKEN
  if (!expected) throw new HttpError(500, 'Falta configurar ADMIN_TOKEN en Vercel.')
  const raw = req.headers['x-admin-token']
  const given = Array.isArray(raw) ? raw[0] : raw
  if (!given || !timingSafeEqual(digest(given), digest(expected))) throw new HttpError(401, 'No autorizado')
}

export const param = (req: Req, name: string): string => {
  const v = req.query[name]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

/** El cuerpo llega ya parseado desde Vercel; si vino como texto se intenta leer como JSON. */
export function bodyOf(req: Req): Record<string, unknown> {
  let b = req.body
  if (typeof b === 'string') {
    try {
      b = JSON.parse(b)
    } catch {
      throw new HttpError(400, 'El cuerpo de la solicitud no es JSON válido.')
    }
  }
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw new HttpError(400, 'Falta el cuerpo de la solicitud.')
  return b as Record<string, unknown>
}

type Handler = (req: Req, res: Res) => Promise<void>

/** Arma una función de Vercel: controla los métodos permitidos y convierte los errores en respuestas JSON. */
export function route(methods: string[], fn: Handler) {
  return async (req: Req, res: Res) => {
    res.setHeader('Cache-Control', 'no-store')
    if (!methods.includes(req.method ?? '')) {
      res.setHeader('Allow', methods.join(', '))
      return res.status(405).json({ error: 'Método no permitido' })
    }
    try {
      await fn(req, res)
    } catch (e) {
      if (e instanceof HttpError) return res.status(e.status).json({ error: e.message })
      console.error(e)
      const message = e instanceof Error ? e.message : 'Error del servidor'
      return res.status(500).json({ error: message })
    }
  }
}

/** Valida y limpia un texto. */
export function text(v: unknown, label: string, { min = 1, max = 200 }: { min?: number; max?: number } = {}): string {
  const s = typeof v === 'string' ? v.trim() : ''
  if (s.length < min) throw new HttpError(400, `Falta ${label}.`)
  if (s.length > max) throw new HttpError(400, `${label} es demasiado largo.`)
  return s
}

export const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'] as const
export type Estado = (typeof ESTADOS)[number]
