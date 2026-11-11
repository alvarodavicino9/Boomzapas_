import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fotosDeModelo, MODELOS_DRIVE, OTROS_MODELOS } from './src/data/modelosDrive'
import { rutaProducto } from './src/lib/slug'
import { SITE as SITE_INFO } from './src/config/site'
import { jsonLdMigas, jsonLdProducto, metaProducto, PAGINAS, SITE_URL } from './src/lib/seo'

/**
 * Dirección pública de la tienda, para los links y las fotos de la vista previa al compartir.
 * Por defecto es el dominio propio; SITE_URL en Vercel la reemplaza si hace falta.
 */
const SITE = (process.env.SITE_URL || SITE_URL).replace(/\/$/, '')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const pesos = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

/** Reemplaza el valor de una etiqueta del <head> (el texto nuevo se usa tal cual). */
const poner = (html: string, inicio: string, valor: string) =>
  html.replace(new RegExp(`(${inicio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[^"]*`), (_, a: string) => a + valor)

interface PaginaEstatica {
  ruta: string
  titulo: string
  descripcion: string
  h1: string
  tipo?: 'website' | 'product'
  imagen?: string
  imagenAncho?: string
  imagenAlto?: string
  imagenAlt?: string
  /** Datos estructurados propios de la página. */
  jsonld?: object[]
  /** Contenido para quien no ejecuta JavaScript (y para el primer vistazo de Google). */
  extra?: string
}

const MENU: [string, string][] = [
  ['/', 'Inicio'],
  ['/catalogo', 'Catálogo'],
  ['/envios', 'Envíos'],
  ['/pagos', 'Medios de pago'],
  ['/como-comprar', 'Cómo comprar'],
  ['/guia-de-talles', 'Guía de talles'],
  ['/nosotros', 'Quiénes somos'],
  ['/contacto', 'Contacto'],
]

/** Arma el HTML de una página a partir del de la tienda: su propio <head> y su contenido básico. */
function armarPagina(base: string, d: PaginaEstatica): string {
  const url = `${SITE}${d.ruta === '/' ? '/' : d.ruta}`
  const titulo = esc(d.titulo)
  const desc = esc(d.descripcion)
  const foto = d.imagen ? `${SITE}${d.imagen}` : `${SITE}/og.jpg`
  let html = base.replace(/<title>[^<]*<\/title>/, () => `<title>${titulo}</title>`)
  html = poner(html, '<meta name="description" content="', desc)
  html = poner(html, '<link rel="canonical" href="', url)
  html = poner(html, '<meta property="og:type" content="', d.tipo ?? 'website')
  html = poner(html, '<meta property="og:url" content="', url)
  html = poner(html, '<meta property="og:title" content="', titulo)
  html = poner(html, '<meta property="og:description" content="', desc)
  html = poner(html, '<meta property="og:image" content="', foto)
  if (d.imagen) {
    html = poner(html, '<meta property="og:image:width" content="', d.imagenAncho ?? '1100')
    html = poner(html, '<meta property="og:image:height" content="', d.imagenAlto ?? '1467')
    html = poner(html, '<meta property="og:image:alt" content="', esc(d.imagenAlt ?? d.h1))
  }
  html = poner(html, '<meta name="twitter:title" content="', titulo)
  html = poner(html, '<meta name="twitter:description" content="', desc)
  html = poner(html, '<meta name="twitter:image" content="', foto)

  if (d.jsonld?.length) {
    const ld = `<script type="application/ld+json" id="ld-pagina">${JSON.stringify(d.jsonld.length === 1 ? d.jsonld[0] : d.jsonld).replace(/</g, '\\u003c')}</script>\n  </head>`
    html = html.replace('</head>', () => ld)
  }

  const menu = MENU.map(([r, t]) => `<li><a href="${r}">${t}</a></li>`).join('')
  const sinJs = `<noscript><header><h1>${esc(d.h1)}</h1><p>${desc}</p></header><nav aria-label="Principal"><ul>${menu}</ul></nav>${d.extra ?? ''}<p>Boom Zapas · ${esc(SITE_INFO.address)} · WhatsApp ${esc(SITE_INFO.whatsappDisplay)}</p></noscript>`
  return html.replace('<div id="root">', () => `${sinJs}\n    <div id="root">`)
}

/**
 * Páginas para Google y vista previa al compartir (WhatsApp, Instagram, Facebook): esas apps y el primer
 * paso de Google leen el HTML tal cual, sin ejecutar la página. Por eso, al compilar, cada página y cada
 * zapatilla tiene su propio HTML con su título, descripción, dirección canónica, foto y datos de precio.
 * Al abrirlo, la tienda arranca normal (y muestra la ficha de ese par). Un modelo sin página propia
 * (por ejemplo, uno cargado después en la base) funciona igual, sólo que con los datos generales.
 */
function paginasDeProducto(): Plugin {
  let outDir = 'dist'
  return {
    name: 'boomzapas-paginas-de-producto',
    configResolved(c) {
      outDir = c.build.outDir
    },
    transformIndexHtml: (html) => html.replaceAll('__SITE__', SITE),
    async closeBundle() {
      const base = await readFile(join(outDir, 'index.html'), 'utf8')
      const modelos = [
        ...MODELOS_DRIVE.map((m) => ({ ...m, imagenes: fotosDeModelo(m) })),
        ...OTROS_MODELOS.map((m) => ({ ...m })),
      ].map((m) => ({ nombre: m.nombre, marca: m.marca, precio: m.precio, categoria: m.categoria, imagenes: m.imagenes }))

      const listaModelos = `<h2>Zapatillas</h2><ul>${modelos
        .map((m) => `<li><a href="${rutaProducto(m)}">${esc(m.nombre)}</a> · ${pesos(m.precio)}</li>`)
        .join('')}</ul>`

      // Páginas del sitio (el inicio reemplaza al index.html de la tienda)
      for (const [ruta, m] of Object.entries(PAGINAS)) {
        const html = armarPagina(base, {
          ruta,
          titulo: m.titulo,
          descripcion: m.descripcion,
          h1: m.h1,
          jsonld:
            ruta === '/'
              ? undefined
              : [jsonLdMigas([{ nombre: 'Inicio', ruta: '/' }, { nombre: m.h1, ruta }], SITE)],
          extra: ruta === '/' || ruta === '/catalogo' ? listaModelos : undefined,
        })
        if (ruta === '/') {
          await writeFile(join(outDir, 'index.html'), html)
        } else {
          // Vercel la sirve sin el .html gracias a "cleanUrls"
          await writeFile(join(outDir, `${ruta.slice(1)}.html`), html)
        }
      }

      for (const m of modelos) {
        const ruta = rutaProducto(m)
        const meta = metaProducto(m)
        const html = armarPagina(base, {
          ruta,
          titulo: meta.titulo,
          descripcion: meta.descripcion,
          h1: m.nombre,
          tipo: 'product',
          imagen: m.imagenes[0],
          imagenAlt: m.nombre,
          jsonld: [
            jsonLdProducto(m, ruta, SITE),
            jsonLdMigas([{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Catálogo', ruta: '/catalogo' }, { nombre: m.nombre, ruta }], SITE),
          ],
          extra: `<p>${esc(m.marca)} · ${pesos(m.precio)} (${pesos(m.precio - SITE_INFO.promoPares.descuento)} c/u llevando 2 pares o más). Envío gratis a todo el país y retiro en Córdoba.</p><p><a href="/catalogo">Ver todo el catálogo</a></p>`,
        })
        // Dos copias: /zapatilla/<modelo>.html (Vercel la sirve sin el .html gracias a "cleanUrls")
        // y /zapatilla/<modelo>/index.html (por si se abre con barra al final).
        const dir = join(outDir, ruta)
        await mkdir(dir, { recursive: true })
        await writeFile(join(dir, 'index.html'), html)
        await writeFile(`${dir}.html`, html)
      }

      // Mapa del sitio para Google (páginas + cada zapatilla con sus fotos) y robots.txt.
      const hoy = new Date().toISOString().slice(0, 10)
      const url = (loc: string, extra = '') => `  <url><loc>${SITE}${loc === '/' ? '/' : loc}</loc><lastmod>${hoy}</lastmod>${extra}</url>`
      const paginas = Object.keys(PAGINAS).map((r) => url(r))
      const fichas = modelos.map((m) =>
        url(
          rutaProducto(m),
          m.imagenes
            .slice(0, 5)
            .map((f) => `<image:image><image:loc>${SITE}${esc(f)}</image:loc><image:title>${esc(m.nombre)}</image:title></image:image>`)
            .join(''),
        ),
      )
      await writeFile(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${[...paginas, ...fichas].join('\n')}\n</urlset>\n`,
      )
      await writeFile(
        join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /pago/\n\nSitemap: ${SITE}/sitemap.xml\n`,
      )
      console.log(`  ${modelos.length} páginas de zapatilla + ${paginas.length} páginas del sitio + sitemap.xml`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), paginasDeProducto()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
