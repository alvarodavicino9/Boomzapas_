import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Vuelve arriba al cambiar de página (pero no al cambiar sólo los filtros del catálogo). */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}
