import { useCallback } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { rutaProducto } from '@/lib/slug'
import type { Producto } from '@/types'

/** Estado que viaja con la dirección de una zapatilla: la página que queda de fondo. */
export interface EstadoFicha {
  fondo?: Location
}

/**
 * Abre la ficha de una zapatilla cambiando la dirección a /zapatilla/<modelo>.
 * La página donde estabas (inicio, catálogo con sus filtros) queda de fondo, y al cerrar
 * o tocar "atrás" volvés exactamente ahí.
 */
export function useAbrirProducto() {
  const navigate = useNavigate()
  const location = useLocation()
  return useCallback(
    (p: Producto) => {
      const fondo = (location.state as EstadoFicha | null)?.fondo
      const enFicha = Boolean(fondo) || location.pathname.startsWith('/zapatilla/')
      // Desde una ficha abierta (los "también te puede gustar") se reemplaza, para no apilar historial.
      navigate(rutaProducto(p), {
        state: enFicha ? (fondo ? { fondo } : null) : { fondo: location },
        replace: enFicha,
      })
    },
    [navigate, location],
  )
}
