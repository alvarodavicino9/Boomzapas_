import { useEffect, useState } from 'react'

/** true cuando la página terminó de cargar y el navegador quedó libre: para bajar lo que no hace falta al principio. */
export function useCuandoEsteLibre() {
  const [listo, setListo] = useState(false)
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }
    let id = 0
    const correr = () => {
      id = w.requestIdleCallback ? w.requestIdleCallback(() => setListo(true), { timeout: 3000 }) : window.setTimeout(() => setListo(true), 1500)
    }
    if (document.readyState === 'complete') correr()
    else window.addEventListener('load', correr, { once: true })
    return () => {
      window.removeEventListener('load', correr)
      if (w.cancelIdleCallback) w.cancelIdleCallback(id)
      else window.clearTimeout(id)
    }
  }, [])
  return listo
}
