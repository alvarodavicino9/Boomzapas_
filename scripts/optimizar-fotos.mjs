/**
 * Genera versiones livianas (WebP) de las fotos de la tienda para que la página cargue rápido.
 *
 *   npm run fotos
 *
 * Por cada foto .jpg/.png dentro de public/fotos crea, al lado:
 *   nombre-400.webp  → tarjetas del catálogo y miniaturas
 *   nombre-800.webp  → ficha del producto en el celular y tarjetas en pantallas nítidas
 *   nombre-1100.webp → ficha del producto en la compu (y el zoom)
 * La página las usa sola (ver src/lib/imagenes.ts). Si una foto ya tiene sus versiones
 * y no cambió, la saltea; así que se puede correr cada vez que se suman fotos.
 * También corre antes de cada build (en Vercel), así que si te olvidás de correrlo,
 * las versiones que falten se generan igual al publicar.
 * Si reemplazaste una foto por otra con el mismo nombre: npm run fotos -- --forzar
 */
import { readdir, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const RAIZ = fileURLToPath(new URL('../public/fotos/', import.meta.url))
const ANCHOS = [400, 800, 1100]
const CALIDAD = 72

async function* fotos(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name)
    if (e.isDirectory()) yield* fotos(ruta)
    else if (/\.(jpe?g|png)$/i.test(e.name)) yield ruta
  }
}

const FORZAR = process.argv.includes('--forzar')
// En Vercel los archivos llegan todos con la misma fecha: alcanza con que la versión exista.
const EN_SERVIDOR = Boolean(process.env.VERCEL || process.env.CI)

/** ¿La versión ya existe y está al día con la foto original? */
const alDia = async (destino, foto) => {
  if (FORZAR) return false
  try {
    const d = await stat(destino)
    return EN_SERVIDOR || d.mtimeMs >= (await stat(foto)).mtimeMs
  } catch {
    return false
  }
}

let creadas = 0
let salteadas = 0
for await (const foto of fotos(RAIZ)) {
  const base = foto.slice(0, -extname(foto).length)
  for (const ancho of ANCHOS) {
    const destino = `${base}-${ancho}.webp`
    if (await alDia(destino, foto)) {
      salteadas++
      continue
    }
    await sharp(foto)
      .rotate()
      .resize({ width: ancho, withoutEnlargement: true })
      .webp({ quality: CALIDAD, effort: 5 })
      .toFile(destino)
    creadas++
  }
}
console.log(`Listo: ${creadas} versiones nuevas, ${salteadas} ya estaban al día.`)
