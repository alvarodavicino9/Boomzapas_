import { useSyncExternalStore } from 'react'

/**
 * Modo de la tienda: oscuro (por defecto) o claro.
 * Sólo cambia el fondo, las tarjetas y el texto; el rojo de la marca y los bloques
 * oscuros (franja de marcas, pie, contacto) quedan iguales en los dos modos.
 * Se guarda en este navegador. También se puede forzar con ?modo=claro | oscuro.
 */
export type Modo = 'oscuro' | 'claro'

/** Color de la barra del navegador en el celular para cada modo. */
export const COLOR_BARRA: Record<Modo, string> = { oscuro: '#070506', claro: '#f7f4f3' }

const EVENTO = 'bz-modo'

export const getModo = (): Modo =>
  document.documentElement.getAttribute('data-theme') === 'claro' ? 'claro' : 'oscuro'

export function setModo(modo: Modo) {
  const html = document.documentElement
  // transición suave de colores sólo durante el cambio (no en cada hover)
  html.classList.add('cambiando-modo')
  html.setAttribute('data-theme', modo)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[modo])
  window.setTimeout(() => html.classList.remove('cambiando-modo'), 350)
  try {
    localStorage.setItem('bz_modo', modo)
  } catch {
    /* sin almacenamiento: el cambio vale sólo para esta visita */
  }
  window.dispatchEvent(new Event(EVENTO))
}

const suscribir = (cb: () => void) => {
  window.addEventListener(EVENTO, cb)
  return () => window.removeEventListener(EVENTO, cb)
}

/** Modo actual, sincronizado entre todos los botones que lo cambian. */
export function useModo(): [Modo, (m: Modo) => void] {
  const modo = useSyncExternalStore(suscribir, getModo, () => 'oscuro' as Modo)
  return [modo, setModo]
}
