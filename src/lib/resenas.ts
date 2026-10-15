import { useEffect, useState, useSyncExternalStore } from 'react'
import { CONECTAR_API, enviarResenaApi } from './api'

export interface Resena {
  id: string
  user: string
  text: string
  model?: string
  /** 1 a 5. Las reseñas históricas no traen puntaje. */
  rating?: number
  /** ISO. */
  fecha?: string
  /** Escrita desde este navegador y todavía sin publicar. */
  pendiente?: boolean
}

export interface ResenaInput {
  user: string
  text: string
  model?: string
  rating: number
}

const KEY = 'bz_resenas'
const listeners = new Set<() => void>()
let cache: Resena[] | null = null

function read(): Resena[] {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as Resena[]) : []
    cache = Array.isArray(parsed) ? parsed : []
  } catch {
    cache = []
  }
  return cache
}

function write(list: Resena[]) {
  cache = list
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* sin almacenamiento: queda sólo en memoria */
  }
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Reseñas guardadas en este navegador (se actualizan solas al enviar una nueva). */
export function useResenasLocales(): Resena[] {
  return useSyncExternalStore(subscribe, read, read)
}

/**
 * Guarda la reseña. Siempre queda en este navegador (pendiente de revisión);
 * si la tienda está conectada al servidor, además se envía a /api/resenas (si el endpoint no existe, no pasa nada).
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
  write([resena, ...read()])
  if (CONECTAR_API) {
    try {
      await enviarResenaApi(resena)
    } catch {
      /* queda guardada igual en este navegador */
    }
  }
  return resena
}

/** El dueño aprueba una reseña pendiente: pasa a mostrarse como publicada. */
export function aprobarResena(id: string) {
  write(read().map((r) => (r.id === id ? { ...r, pendiente: false } : r)))
}

/** El dueño carga una reseña real (por ejemplo, una que le llegó por Instagram): se publica directo. */
export function agregarResenaPublicada(input: ResenaInput): Resena {
  const resena: Resena = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user: input.user.trim(),
    text: input.text.trim(),
    model: input.model?.trim() || undefined,
    rating: input.rating,
    fecha: new Date().toISOString(),
  }
  write([resena, ...read()])
  return resena
}

export function quitarResena(id: string) {
  write(read().filter((r) => r.id !== id))
}

/** Evita parpadeos de hidratación: true recién después del primer render en el navegador. */
export function useMontado() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}
