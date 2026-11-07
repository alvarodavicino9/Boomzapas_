import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { aplicarSeo, jsonLdMigas, metaDeRuta, normalizarRuta } from '@/lib/seo'

/**
 * Pone el título, la descripción y la dirección canónica de cada página al navegar.
 * Las fichas de zapatilla (/zapatilla/<modelo>) las maneja ProductoHost, que conoce el precio.
 */
export function SeoRuta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const ruta = normalizarRuta(pathname)
    if (ruta.startsWith('/zapatilla/')) return
    const m = metaDeRuta(ruta)
    aplicarSeo({
      titulo: m.titulo,
      descripcion: m.descripcion,
      ruta,
      noindex: m.noindex,
      jsonld:
        !m.noindex && ruta !== '/'
          ? [
              jsonLdMigas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: m.h1, ruta },
              ]),
            ]
          : undefined,
    })
  }, [pathname])

  return null
}
