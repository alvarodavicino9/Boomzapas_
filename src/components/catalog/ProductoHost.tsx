import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProductDialog } from './ProductDialog'
import { useProductos } from '@/context/ProductsContext'
import { useUI } from '@/context/UIContext'
import { useAbrirProducto, type EstadoFicha } from '@/hooks/useAbrirProducto'
import { slugify } from '@/lib/slug'
import { formatARS } from '@/lib/format'

const RUTA = /^\/zapatilla\/([^/]+)\/?$/

/**
 * Muestra la ficha de la zapatilla que indica la dirección (/zapatilla/<modelo>).
 * Vive fuera de las páginas: así un link compartido abre la ficha sobre el catálogo,
 * y desde cualquier página se abre sin perder lo que había de fondo.
 */
export function ProductoHost() {
  const location = useLocation()
  const navigate = useNavigate()
  const { productos, status } = useProductos()
  const { toast } = useUI()
  const abrir = useAbrirProducto()

  const slug = location.pathname.match(RUTA)?.[1]
  const producto = useMemo(
    () => (slug ? (productos.find((p) => slugify(p.nombre) === decodeURIComponent(slug)) ?? null) : null),
    [slug, productos],
  )
  const fondo = (location.state as EstadoFicha | null)?.fondo

  const cerrar = useCallback(() => {
    // Si se abrió desde una página, "atrás" vuelve a esa página tal cual estaba.
    if (fondo) navigate(-1)
    else navigate('/catalogo')
  }, [fondo, navigate])

  // Link a un modelo que ya no está: al catálogo, avisando.
  useEffect(() => {
    if (slug && status === 'ready' && !producto) {
      toast('Ese modelo ya no está en el catálogo')
      navigate('/catalogo', { replace: true })
    }
  }, [slug, status, producto, toast, navigate])

  // Título de la pestaña y descripción con el modelo abierto (lo usa Google y el historial).
  useEffect(() => {
    if (!producto) return
    const titulo = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const descripcion = meta?.content
    document.title = `${producto.nombre} · ${formatARS(producto.precio)} · Boom Zapas`
    meta?.setAttribute(
      'content',
      `${producto.nombre} a ${formatARS(producto.precio)} en Boom Zapas. Envíos a todo el país y retiro en Córdoba.`,
    )
    return () => {
      document.title = titulo
      if (meta && descripcion) meta.setAttribute('content', descripcion)
    }
  }, [producto])

  return <ProductDialog producto={producto} onClose={cerrar} onSelect={abrir} />
}
