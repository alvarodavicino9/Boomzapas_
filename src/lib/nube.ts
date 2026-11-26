import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_URL } from './supabase'

/**
 * Conexión con Supabase.
 * - La tienda pública sólo lee (catálogo al día y reseñas aprobadas) con fetch simple: no carga la librería.
 * - El panel usa la librería de Supabase (login y escritura), que se descarga recién al entrar al panel.
 */

let cliente: Promise<SupabaseClient> | null = null

/** Cliente de Supabase con la sesión del panel (se carga sólo cuando hace falta). */
export function nube(): Promise<SupabaseClient> {
  cliente ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'bz_panel_sesion' },
    }),
  )
  return cliente
}

/** Hay una sesión del panel guardada en este navegador (sin cargar la librería). */
export function haySesionGuardada(): boolean {
  try {
    return !!localStorage.getItem('bz_panel_sesion')
  } catch {
    return false
  }
}

/** Lectura pública (sin sesión) de una tabla: `tabla?select=...`. */
export async function leerPublico<T>(consulta: string, ms = 6000): Promise<T[]> {
  const ctrl = new AbortController()
  const t = window.setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${consulta}`, { headers: { apikey: SUPABASE_KEY }, signal: ctrl.signal })
    if (!res.ok) throw new Error(`Supabase ${res.status}`)
    return (await res.json()) as T[]
  } finally {
    window.clearTimeout(t)
  }
}

/** Llama a una función pública de la base (por ejemplo, enviar una reseña). */
export async function llamarPublico<T>(funcion: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcion}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error((body as { message?: string } | null)?.message ?? `Error ${res.status}`)
  return body as T
}

// ── Avisos de error del panel (los muestra el panel como mensaje) ──

type Oyente = (mensaje: string) => void
const oyentes = new Set<Oyente>()

export function alFallarNube(cb: Oyente) {
  oyentes.add(cb)
  return () => {
    oyentes.delete(cb)
  }
}

export function avisarFalla(mensaje: string) {
  oyentes.forEach((cb) => cb(mensaje))
}

/** Corre una escritura en Supabase; si falla, avisa y devuelve null (el panel vuelve a cargar los datos). */
export async function escribir<T>(accion: string, op: (sb: SupabaseClient) => PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T | null> {
  try {
    const sb = await nube()
    const { data, error } = await op(sb)
    if (error) throw new Error(error.message)
    return data
  } catch (e) {
    console.error(accion, e)
    avisarFalla(`No se pudo guardar (${accion}). Revisá la conexión y probá de nuevo.`)
    return null
  }
}
