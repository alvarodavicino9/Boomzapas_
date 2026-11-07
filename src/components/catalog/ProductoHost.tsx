import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProductDialog } from './ProductDialog'
import { useProductos } from '@/context/ProductsContext'
import { useUI } from '@/context/UIContext'
import { useAbrirProducto, type EstadoFicha } from '@/hooks/useAbrirProducto'
import { rutaProducto, slugify } from '@/lib/slug'
import { hasStock } from '@/lib/filters'
import { aplicarSeo, jsonLdMigas, jsonLdProducto, metaProducto } from '@/lib/seo'

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

  // Título, descripción, dirección canónica y datos de precio para Google con el modelo abierto.
  // Al cerrar la ficha cambia la dirección y SeoRuta vuelve a poner los de la página de fondo.
  useEffect(() => {
    if (!producto) return
    const datos = {
      nombre: producto.nombre,
      marca: producto.marca,
      precio: producto.precio,
      imagenes: producto.imagenes,
      descripcion: producto.descripcion,
      disponible: hasStock(producto),
    }
    const ruta = rutaProducto(producto)
    const m = metaProducto(datos)
    aplicarSeo({
      titulo: m.titulo,
      descripcion: m.descripcion,
      ruta,
      imagen: producto.imagenes[0],
      tipo: 'product',
      jsonld: [
        jsonLdProducto(datos, ruta),
        jsonLdMigas(
          [
            { nombre: 'Inicio', ruta: '/' },
            { nombre: 'Catálogo', ruta: '/catalogo' },
            { nombre: producto.nombre, ruta },
          ],
        ),
      ],
    })
  }, [producto])

  return <ProductDialog producto={producto} onClose={cerrar} onSelect={abrir} />
}
