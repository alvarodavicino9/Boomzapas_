import { SITE } from '../config/site'

/**
 * SEO en un solo lugar: lo usan el armado de la tienda (vite.config.ts, que genera el HTML de cada
 * página para Google y para las vistas previas al compartir) y el navegador (que actualiza título,
 * descripción y datos estructurados al cambiar de página).
 */

/** Dirección principal de la tienda. La raíz (boomzapas.com.ar) redirige a la versión con www. */
export const SITE_URL = 'https://www.boomzapas.com.ar'

export interface MetaPagina {
  titulo: string
  descripcion: string
  /** Título visible (h1) para quien navega sin JavaScript. */
  h1: string
  noindex?: boolean
}

export const PAGINAS: Record<string, MetaPagina> = {
  '/': {
    titulo: 'Boom Zapas | Zapatillas en Córdoba con envío gratis',
    descripcion:
      'Zapatillas Nike, Adidas, Jordan, New Balance, Puma y Vans en Córdoba. Envío gratis a todo el país, retiro en el showroom y pago con Mercado Pago o transferencia.',
    h1: 'Boom Zapas: zapatillas en Córdoba con envío gratis a todo el país',
  },
  '/catalogo': {
    titulo: 'Catálogo de zapatillas: Nike, Adidas, Jordan | Boom Zapas',
    descripcion: `Mirá todas las zapatillas Nike, Adidas, Jordan, New Balance, Puma y Vans con fotos reales y talles disponibles. Envío gratis y ${'$'}${SITE.promoPares.descuento.toLocaleString('es-AR')} off por par llevando 2 o más.`,
    h1: 'Catálogo de zapatillas',
  },
  '/envios': {
    titulo: 'Envíos gratis a todo el país y retiro en Córdoba | Boom Zapas',
    descripcion:
      'Enviamos tus zapatillas gratis a todo el país por Correo Argentino en 3 a 7 días, con código de seguimiento. También podés retirarlas en Córdoba.',
    h1: 'Envíos y retiro',
  },
  '/pagos': {
    titulo: 'Medios de pago: Mercado Pago, transferencia y tarjetas | Boom Zapas',
    descripcion: `Pagá tus zapatillas con Mercado Pago, tarjeta, QR, transferencia o efectivo. Llevando 2 pares o más tenés ${'$'}${SITE.promoPares.descuento.toLocaleString('es-AR')} de descuento en cada par.`,
    h1: 'Medios de pago',
  },
  '/como-comprar': {
    titulo: 'Cómo comprar zapatillas online, paso a paso | Boom Zapas',
    descripcion:
      'Elegí tu par y tu talle, armá el pedido, pagá como prefieras y recibilo en tu casa. Te acompañamos por WhatsApp en todo el proceso.',
    h1: 'Cómo comprar',
  },
  '/guia-de-talles': {
    titulo: 'Guía de talles de zapatillas: cómo elegir el tuyo | Boom Zapas',
    descripcion:
      'Tabla de talles en centímetros para elegir bien tu zapatilla. Si tenés dudas entre dos talles, te asesoramos por WhatsApp.',
    h1: 'Guía de talles',
  },
  '/nosotros': {
    titulo: 'Quiénes somos: showroom de zapatillas en Córdoba | Boom Zapas',
    descripcion:
      'Somos Boom Zapas, un showroom de zapatillas de Córdoba. Fotos reales de cada par, atención por WhatsApp y envíos a todo el país.',
    h1: 'Quiénes somos',
  },
  '/contacto': {
    titulo: 'Contacto, ubicación y horarios | Boom Zapas Córdoba',
    descripcion: `Escribinos por WhatsApp o Instagram, o visitanos en ${SITE.address}. Lunes a viernes de 10 a 19 y sábados de 10 a 14.`,
    h1: 'Contacto',
  },
}

/** Rutas que no tienen que aparecer en Google. */
export const SIN_INDEXAR: Record<string, MetaPagina> = {
  noEncontrada: {
    titulo: 'Página no encontrada | Boom Zapas',
    descripcion: 'La página que buscás no existe. Volvé al inicio y encontrá tu próximo par.',
    h1: 'Esta página no existe',
    noindex: true,
  },
  panel: { titulo: 'Panel | Boom Zapas', descripcion: 'Panel de administración.', h1: 'Panel', noindex: true },
  pago: { titulo: 'Resultado del pago | Boom Zapas', descripcion: 'Resultado de tu pago.', h1: 'Resultado del pago', noindex: true },
}

export const normalizarRuta = (p: string) => p.replace(/\/+$/, '') || '/'

/** Qué decir de una ruta cualquiera (para el navegador). */
export function metaDeRuta(pathname: string): MetaPagina {
  const p = normalizarRuta(pathname)
  if (PAGINAS[p]) return PAGINAS[p]
  if (p.startsWith('/admin')) return SIN_INDEXAR.panel
  if (p.startsWith('/pago/')) return SIN_INDEXAR.pago
  return SIN_INDEXAR.noEncontrada
}

const pesos = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

export interface DatosProducto {
  nombre: string
  marca?: string
  precio?: number
  imagenes?: string[]
  descripcion?: string
  /** Si hay al menos un talle con stock. Si no se sabe, se asume que sí. */
  disponible?: boolean
}

/** Título y descripción de la ficha de una zapatilla. */
export function metaProducto(p: DatosProducto): MetaPagina {
  const precio =
    p.precio && p.precio > 0
      ? ` a ${pesos(p.precio)}${p.precio > SITE.promoPares.descuento ? ` (${pesos(p.precio - SITE.promoPares.descuento)} c/u llevando 2 o más)` : ''}`
      : ''
  return {
    titulo: `${p.nombre} | Boom Zapas Córdoba`,
    descripcion: `Comprá las ${p.nombre}${precio} en Boom Zapas. Fotos reales, envío gratis a todo el país y retiro en Córdoba.`,
    h1: p.nombre,
  }
}

const absoluta = (src: string, sitio: string) => (/^https?:/.test(src) ? src : `${sitio}${src.startsWith('/') ? '' : '/'}${src}`)

/** Migas de pan: Inicio › Catálogo › Modelo. */
export function jsonLdMigas(items: { nombre: string; ruta: string }[], sitio = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.nombre,
      item: `${sitio}${it.ruta === '/' ? '/' : it.ruta}`,
    })),
  }
}

/** Datos para que Google muestre el precio y la disponibilidad de cada zapatilla. */
export function jsonLdProducto(p: DatosProducto, ruta: string, sitio = SITE_URL) {
  const imagenes = (p.imagenes ?? []).filter(Boolean).map((s) => absoluta(s, sitio))
  const url = `${sitio}${ruta}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#producto`,
    name: p.nombre,
    description: p.descripcion?.trim() || metaProducto(p).descripcion,
    ...(imagenes.length ? { image: imagenes } : {}),
    ...(p.marca ? { brand: { '@type': 'Brand', name: p.marca } } : {}),
    category: 'Zapatillas',
    url,
    ...(p.precio && p.precio > 0
      ? {
          offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'ARS',
            price: Math.round(p.precio),
            itemCondition: 'https://schema.org/NewCondition',
            availability: p.disponible === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: SITE.name },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'ARS' },
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'AR' },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
                transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
              },
            },
          },
        }
      : {}),
  }
}

// ---------------------------------------------------------------------------------------------
// Sólo en el navegador
// ---------------------------------------------------------------------------------------------

interface AplicarSeo {
  titulo: string
  descripcion: string
  ruta: string
  imagen?: string
  tipo?: 'website' | 'product'
  noindex?: boolean
  /** Datos estructurados de la página (reemplazan a los anteriores). */
  jsonld?: object[]
}

function etiqueta(selector: string, crear: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = crear()
    document.head.appendChild(el)
  }
  return el
}

const meta = (atributo: 'name' | 'property', clave: string, valor: string) => {
  etiqueta(`meta[${atributo}="${clave}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute(atributo, clave)
    return m
  }).setAttribute('content', valor)
}

/** Actualiza título, descripción, dirección canónica, vista previa y datos estructurados. */
export function aplicarSeo({ titulo, descripcion, ruta, imagen, tipo = 'website', noindex, jsonld }: AplicarSeo) {
  if (typeof document === 'undefined') return
  const url = `${SITE_URL}${ruta === '/' ? '/' : ruta}`
  const foto = imagen ? absoluta(imagen, SITE_URL) : `${SITE_URL}/og.jpg`
  document.title = titulo
  meta('name', 'description', descripcion)
  meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1')
  etiqueta('link[rel="canonical"]', () => {
    const l = document.createElement('link')
    l.rel = 'canonical'
    return l
  }).setAttribute('href', url)
  meta('property', 'og:type', tipo)
  meta('property', 'og:url', url)
  meta('property', 'og:title', titulo)
  meta('property', 'og:description', descripcion)
  meta('property', 'og:image', foto)
  meta('name', 'twitter:title', titulo)
  meta('name', 'twitter:description', descripcion)
  meta('name', 'twitter:image', foto)

  const previo = document.getElementById('ld-pagina')
  if (!jsonld || jsonld.length === 0) {
    previo?.remove()
    return
  }
  const s = previo ?? document.createElement('script')
  s.id = 'ld-pagina'
  s.setAttribute('type', 'application/ld+json')
  s.textContent = JSON.stringify(jsonld.length === 1 ? jsonld[0] : jsonld)
  if (!previo) document.head.appendChild(s)
}
