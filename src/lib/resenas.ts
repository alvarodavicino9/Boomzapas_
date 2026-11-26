import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { CONECTAR_API, enviarResenaApi } from './api'
import { escribir, leerPublico, llamarPublico, nube } from './nube'

export interface Resena {
  id: string
  user: string
  text: string
  model?: string
  /** 1 a 5. Las reseñas históricas no traen puntaje. */
  rating?: number
  /** ISO. */
  fecha?: string
  /** Todavía sin publicar (en revisión). */
  pendiente?: boolean
}

export interface ResenaInput {
  user: string
  text: string
  model?: string
  rating: number
}

const KEY = 'bz_resenas'

// ── Almacenes con suscripción ─────────────────────────────────────────────

function almacen<T>(init: T, cacheKey?: string) {
  const listeners = new Set<() => void>()
  let cache: T | null = null
  const read = (): T => {
    if (cache !== null) return cache
    if (cacheKey) {
      try {
        const raw = localStorage.getItem(cacheKey)
        const v = raw ? (JSON.parse(raw) as T) : null
        if (v) return (cache = v)
      } catch {
        /* sin storage */
      }
    }
    return (cache = init)
  }
  const write = (v: T) => {
    cache = v
    if (cacheKey) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(v))
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

/** Las que escribió este cliente (se le muestran "en revisión" hasta que se aprueban). */
const propias = almacen<Resena[]>([], KEY)
/** Las aprobadas (Supabase), para todos. */
const publicas = almacen<Resena[]>([], 'bz_resenas_publicas')
/** Todas, para el panel (Supabase, con sesión). */
const delPanel = almacen<Resena[]>([])

interface FilaResena {
  id: string
  creado_en: string
  usuario: string
  texto: string
  modelo: string | null
  puntaje: number | null
  aprobada: boolean
}

const aResena = (f: FilaResena): Resena => ({
  id: f.id,
  user: f.usuario,
  text: f.texto,
  model: f.modelo ?? undefined,
  rating: f.puntaje ?? undefined,
  fecha: f.creado_en,
  pendiente: !f.aprobada,
})

let pedidas = false
/** Trae las reseñas aprobadas (una vez por visita). */
export function cargarResenasPublicas() {
  if (pedidas) return
  pedidas = true
  leerPublico<FilaResena>('resenas_web?select=id,creado_en,usuario,texto,modelo,puntaje,aprobada&aprobada=eq.true&order=creado_en.desc&limit=60')
    .then((filas) => {
      const lista = filas.map(aResena)
      publicas.write(lista)
      // las propias que ya se aprobaron dejan de mostrarse como "en revisión"
      const firmas = new Set(lista.map((r) => `${r.user}|${r.text}`))
      propias.write(propias.read().filter((r) => !firmas.has(`${r.user}|${r.text}`)))
    })
    .catch(() => {
      pedidas = false
    })
}

/** Reseñas para la tienda: las propias en revisión + las aprobadas. */
export function useResenasLocales(): Resena[] {
  const mias = propias.use()
  const aprobadas = publicas.use()
  useEffect(() => {
    cargarResenasPublicas()
  }, [])
  return useMemo(() => [...mias.filter((r) => r.pendiente), ...aprobadas], [mias, aprobadas])
}

/**
 * Envía la reseña a revisión (Supabase). Queda también en este navegador para mostrarle al cliente
 * que se recibió; si Supabase no responde, igual se le muestra como enviada.
 */
export async function enviarResena(input: ResenaInput): Promise<Resena> {
  const resena: Resena = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user: input.user.trim(),
    text: input.text.trim(),
    model: input.model?.trim() || undefined,
    rating: input.rating,
    fecha: new Date().toISOString(),
    pendiente: true,
  }
  propias.write([resena, ...propias.read()])
  try {
    await llamarPublico('enviar_resena', { r: { usuario: resena.user, texto: resena.text, modelo: resena.model ?? '', puntaje: String(resena.rating) } })
  } catch {
    /* queda en este navegador */
  }
  if (CONECTAR_API) {
    try {
      await enviarResenaApi(resena)
    } catch {
      /* nada */
    }
  }
  return resena
}

/** El cliente saca su reseña en revisión (sólo de su navegador). */
export function quitarResena(id: string) {
  propias.write(propias.read().filter((r) => r.id !== id))
}

// ── Panel ─────────────────────────────────────────────────────────────────

export const useResenasPanel = delPanel.use

export async function cargarResenasPanel() {
  const sb = await nube()
  const { data, error } = await sb.from('resenas_web').select('id,creado_en,usuario,texto,modelo,puntaje,aprobada').order('creado_en', { ascending: false }).limit(500)
  if (error) throw new Error(error.message)
  delPanel.write((data as FilaResena[]).map(aResena))
}

/** El dueño aprueba una reseña pendiente: pasa a mostrarse en la tienda. */
export function aprobarResena(id: string) {
  delPanel.write(delPanel.read().map((r) => (r.id === id ? { ...r, pendiente: false } : r)))
  void escribir('reseña', (sb) => sb.from('resenas_web').update({ aprobada: true }).eq('id', id))
}

/** El dueño carga una reseña real (por ejemplo, una que le llegó por Instagram): se publica directo. */
export async function agregarResenaPublicada(input: ResenaInput): Promise<boolean> {
  const fila = await escribir<FilaResena>('reseña', (sb) =>
    sb
      .from('resenas_web')
      .insert({ usuario: input.user.trim(), texto: input.text.trim(), modelo: input.model?.trim() || null, puntaje: input.rating, aprobada: true })
      .select('id,creado_en,usuario,texto,modelo,puntaje,aprobada')
      .single(),
  )
  if (fila) delPanel.write([aResena(fila), ...delPanel.read()])
  return !!fila
}

export function eliminarResena(id: string) {
  delPanel.write(delPanel.read().filter((r) => r.id !== id))
  void escribir('reseña', (sb) => sb.from('resenas_web').delete().eq('id', id))
}

/** Evita parpadeos de hidratación: true recién después del primer render en el navegador. */
export function useMontado() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}
