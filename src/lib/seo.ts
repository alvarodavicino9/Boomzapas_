import { SITE } from '../config/site'
import { slugify } from './slug'

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

const OFF = `${'$'}${SITE.promoPares.descuento.toLocaleString('es-AR')}`

/**
 * Lo que se ve al compartir el link de cada página (WhatsApp, Instagram, Facebook): un título y un texto
 * pensados para la gente (los de Google, arriba, están pensados para el buscador), y la imagen que se arma
 * al compilar: título grande en dos renglones, bajada, etiquetas y las zapatillas recortadas de la portada
 * (/public/fotos/hero3d), la primera adelante. Para cambiar algo de lo que se ve al compartir, es acá.
 */
export interface Compartir {
  titulo: string
  descripcion: string
  linea1: string
  linea2: string
  bajada: string
  chips?: string[]
  /** Nombres de las fotos recortadas de /public/fotos/hero3d (sin .webp). */
  zapas: string[]
}

export const COMPARTIR: Record<string, Compartir> = {
  '/': {
    titulo: 'Boom Zapas · Tu próximo par está acá',
    descripcion: `Zapatillas Nike, Adidas, Jordan, New Balance y Vans con fotos reales de cada par. Envío gratis a todo el país y ${OFF} off por par llevando 2 o más. Showroom en Córdoba.`,
    linea1: 'TU PRÓXIMO PAR',
    linea2: 'ESTÁ ACÁ',
    bajada: 'Sneakers con fotos reales de cada par, desde Córdoba',
    zapas: ['nike-sb-dunk-panda', 'adidas-samba-negras-clasicas', 'nike-air-jordan-1-low-x-travis-scott-grey-cream'],
  },
  '/catalogo': {
    titulo: 'Catálogo Boom Zapas · Elegí tu próximo par',
    descripcion: `Nike, Adidas, Jordan, New Balance, Puma y Vans con fotos reales y talles disponibles. Envío gratis a todo el país y ${OFF} off por par llevando 2 o más.`,
    linea1: 'EL CATÁLOGO',
    linea2: 'COMPLETO',
    bajada: 'Nike, Adidas, Jordan, New Balance, Puma y Vans',
    zapas: ['nike-air-jordan-1-low-x-travis-scott-grey-cream', 'nike-air-force-one', 'new-balance-530-cloud-white'],
  },
  '/envios': {
    titulo: 'Envío gratis a todo el país · Boom Zapas',
    descripcion: 'Te mandamos tus zapatillas gratis a todo el país por Correo Argentino, con código de seguimiento. O retiralas en nuestro showroom de Córdoba.',
    linea1: 'ENVÍO GRATIS',
    linea2: 'A TODO EL PAÍS',
    bajada: 'Con seguimiento, o retiralas en el showroom de Córdoba',
    chips: ['Correo Argentino', 'Retiro en Córdoba'],
    zapas: ['new-balance-530-cloud-white', 'adidas-forum-84-low-white-and-black', 'nike-sb-dunk-bordeaux'],
  },
  '/pagos': {
    titulo: 'Pagá como quieras · Boom Zapas',
    descripcion: `Mercado Pago, tarjeta, QR, transferencia o efectivo. Y llevando 2 pares o más, ${OFF} menos en cada uno.`,
    linea1: 'PAGÁ COMO',
    linea2: 'QUIERAS',
    bajada: 'Mercado Pago, tarjeta, QR, transferencia o efectivo',
    chips: ['Mercado Pago', `2 pares: ${OFF} off c/u`],
    zapas: ['adidas-samba-negras-clasicas', 'nike-sb-dunk-panda', 'adidas-adi2000-semi-total-black'],
  },
  '/como-comprar': {
    titulo: 'Cómo comprar en Boom Zapas, paso a paso',
    descripcion: 'Elegí tu par y tu talle, pagá como prefieras y recibilo en tu casa. Te acompañamos por WhatsApp en todo el proceso.',
    linea1: 'COMPRAR ES',
    linea2: 'MUY FÁCIL',
    bajada: 'Elegís tu par, pagás y te llega a tu casa',
    chips: ['Ayuda por WhatsApp', 'Envío gratis'],
    zapas: ['nike-sb-dunk-bordeaux', 'adidas-samba-negras-clasicas', 'new-balance-530-cloud-white'],
  },
  '/guia-de-talles': {
    titulo: 'Guía de talles · Boom Zapas',
    descripcion: 'Medí tu pie y encontrá tu talle en la tabla en centímetros. Si dudás entre dos, te asesoramos por WhatsApp.',
    linea1: 'ENCONTRÁ',
    linea2: 'TU TALLE',
    bajada: 'Tabla en centímetros y ayuda por WhatsApp',
    chips: ['Tabla en cm', 'Te asesoramos'],
    zapas: ['nike-air-force-one', 'adidas-adi2000-semi-total-black', 'nike-sb-dunk-panda'],
  },
  '/nosotros': {
    titulo: 'Boom Zapas · No son solo zapatillas',
    descripcion: `Showroom de zapatillas en Córdoba desde ${SITE.since}: +500 ventas, +450 clientes, fotos reales de cada par y atención por WhatsApp.`,
    linea1: 'NO SON SOLO',
    linea2: 'ZAPATILLAS',
    bajada: `Showroom en Córdoba desde ${SITE.since}`,
    chips: ['+500 ventas', '+450 clientes'],
    zapas: ['adidas-forum-84-low-white-and-black', 'nike-air-jordan-1-low-x-travis-scott-grey-cream', 'nike-sb-dunk-bordeaux'],
  },
  '/contacto': {
    titulo: 'Vení al showroom · Boom Zapas Córdoba',
    descripcion: `Escribinos por WhatsApp o Instagram, o vení a ${SITE.address}. Lunes a viernes de 10 a 19 y sábados de 10 a 14.`,
    linea1: 'VENÍ AL',
    linea2: 'SHOWROOM',
    bajada: SITE.address,
    chips: ['WhatsApp', 'Instagram'],
    zapas: ['adidas-adi2000-semi-total-black', 'nike-sb-dunk-panda', 'adidas-samba-negras-clasicas'],
  },
}

/** Lo que se ve al compartir la página de una marca. */
export const compartirMarca = (marca: string, cantidad: number): Omit<Compartir, 'zapas'> => ({
  titulo: `Zapatillas ${marca} · Boom Zapas`,
  descripcion: `${cantidad} ${cantidad === 1 ? 'modelo' : 'modelos'} ${marca} con fotos reales de cada par. Envío gratis a todo el país y ${OFF} off por par llevando 2 o más.`,
  linea1: 'ZAPATILLAS',
  linea2: marca.toUpperCase(),
  bajada: `${cantidad} ${cantidad === 1 ? 'modelo' : 'modelos'} con fotos reales`,
})

/** Lo que se ve al compartir la ficha de una zapatilla: el precio va en el título, que es lo primero que se lee. */
export const compartirProducto = (p: { nombre: string; precio: number }) => ({
  titulo: `${p.nombre} · ${'$'}${Math.round(p.precio).toLocaleString('es-AR')}`,
  descripcion: `Fotos reales de este par, envío gratis a todo el país${p.precio > SITE.promoPares.descuento ? ` y ${'$'}${Math.round(p.precio - SITE.promoPares.descuento).toLocaleString('es-AR')} c/u llevando 2 o más` : ''}. Boom Zapas, Córdoba.`,
})

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

/** Marcas con nombre "lindo" (para armar el título de /catalogo/<marca> a partir de la dirección). */
const MARCAS_CONOCIDAS = ['Nike', 'Adidas', 'Jordan', 'New Balance', 'Puma', 'Vans', 'Salomon', 'Converse', 'Reebok', 'Asics']

/** Página de cada marca: /catalogo/nike, /catalogo/new-balance… */
export const rutaMarca = (marca: string) => `/catalogo/${slugify(marca)}`

export const RUTA_MARCA = /^\/catalogo\/([^/]+)$/

/** Nombre de la marca a partir de la dirección ("new-balance" → "New Balance"). */
export function marcaDeSlug(slug: string): string {
  const s = decodeURIComponent(slug)
  return MARCAS_CONOCIDAS.find((m) => slugify(m) === s) ?? s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** Título y descripción de la página de una marca (lo que busca la gente: "zapatillas nike córdoba"). */
export function metaMarca(marca: string, cantidad?: number): MetaPagina {
  const modelos = cantidad ? `${cantidad} ${cantidad === 1 ? 'modelo' : 'modelos'} con fotos reales de cada par` : 'fotos reales de cada par'
  return {
    titulo: `Zapatillas ${marca} en Córdoba | Boom Zapas`,
    descripcion: `Comprá zapatillas ${marca} en Córdoba: ${modelos}. Envío gratis a todo el país, retiro en el showroom y ${'$'}${SITE.promoPares.descuento.toLocaleString('es-AR')} off por par llevando 2 o más.`,
    h1: `Zapatillas ${marca}`,
  }
}

/** Qué decir de una ruta cualquiera (para el navegador). */
export function metaDeRuta(pathname: string): MetaPagina {
  const p = normalizarRuta(pathname)
  if (PAGINAS[p]) return PAGINAS[p]
  const marca = p.match(RUTA_MARCA)?.[1]
  if (marca) return metaMarca(marcaDeSlug(marca))
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

/** Lista de zapatillas de una página (catálogo o marca), con el link a la ficha de cada una. */
export function jsonLdLista(items: { nombre: string; ruta: string }[], sitio = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${sitio}${it.ruta}`,
      name: it.nombre,
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
