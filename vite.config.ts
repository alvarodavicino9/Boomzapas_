import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fotosDeModelo, MODELOS_DRIVE, OTROS_MODELOS } from './src/data/modelosDrive'
import { rutaProducto } from './src/lib/slug'

/**
 * Dirección pública de la tienda, para los links y las fotos de la vista previa al compartir.
 * Cuando tengas dominio propio, cargá SITE_URL en Vercel (ej. https://boomzapas.com.ar).
 */
const SITE = (process.env.SITE_URL || 'https://boomzapass.vercel.app').replace(/\/$/, '')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Vista previa al compartir (WhatsApp, Instagram, Facebook): esas apps no ejecutan la página,
 * leen el HTML tal cual. Por eso, al compilar, cada zapatilla tiene su propio HTML
 * (/zapatilla/<modelo>.html) con su nombre y su foto. Al abrirlo, la tienda arranca normal
 * y muestra la ficha de ese par. Un modelo sin página propia (por ejemplo, uno cargado
 * después en la base) funciona igual, sólo que con la vista previa general de la tienda.
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
        ...MODELOS_DRIVE.map((m) => ({ nombre: m.nombre, foto: fotosDeModelo(m)[0] })),
        ...OTROS_MODELOS.map((m) => ({ nombre: m.nombre, foto: m.imagenes[0] })),
      ]
      for (const m of modelos) {
        const ruta = rutaProducto(m)
        const url = `${SITE}${ruta}`
        const titulo = esc(`${m.nombre} · Boom Zapas`)
        const desc = esc(
          `${m.nombre} en Boom Zapas. Fotos reales, envíos a todo el país y retiro en Córdoba. Consultá talles por WhatsApp.`,
        )
        // reemplaza el valor de una etiqueta del <head> (el texto nuevo se usa tal cual)
        const poner = (html: string, inicio: string, valor: string) =>
          html.replace(new RegExp(`(${inicio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[^"]*`), (_, a: string) => a + valor)
        let html = base.replace(/<title>[^<]*<\/title>/, () => `<title>${titulo}</title>`)
        html = poner(html, '<meta name="description" content="', desc)
        html = poner(html, '<link rel="canonical" href="', url)
        html = poner(html, '<meta property="og:type" content="', 'product')
        html = poner(html, '<meta property="og:url" content="', url)
        html = poner(html, '<meta property="og:title" content="', titulo)
        html = poner(html, '<meta property="og:description" content="', desc)
        html = poner(html, '<meta property="og:image" content="', `${SITE}${m.foto}`)
        html = poner(html, '<meta property="og:image:width" content="', '1100')
        html = poner(html, '<meta property="og:image:height" content="', '1467')
        html = poner(html, '<meta property="og:image:alt" content="', esc(m.nombre))
        // Dos copias: /zapatilla/<modelo>.html (Vercel la sirve sin el .html gracias a "cleanUrls")
        // y /zapatilla/<modelo>/index.html (por si se abre con barra al final).
        const dir = join(outDir, ruta)
        await mkdir(dir, { recursive: true })
        await writeFile(join(dir, 'index.html'), html)
        await writeFile(`${dir}.html`, html)
      }

      // Mapa del sitio para Google (páginas + cada zapatilla) y robots.txt con la dirección correcta.
      const paginas = ['/', '/catalogo', '/envios', '/pagos', '/como-comprar', '/guia-de-talles', '/nosotros', '/contacto']
      const urls = [...paginas, ...modelos.map(rutaProducto)]
      await writeFile(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
          .join('\n')}\n</urlset>\n`,
      )
      await writeFile(
        join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /pago/\n\nSitemap: ${SITE}/sitemap.xml\n`,
      )
      console.log(`  ${modelos.length} páginas de zapatilla para compartir + sitemap.xml`)
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
