/**
 * Tarjeta para compartir (1200 × 630) de cada zapatilla: la que muestran WhatsApp, Facebook, Instagram y X
 * cuando alguien pega el link de una ficha. La arma vite.config.ts al compilar, para cada modelo.
 *
 * El texto se dibuja como trazos (con las letras de la tienda, Lexend Exa y Lexend), así sale igual
 * en cualquier compu o servidor, aunque no tenga esas tipografías instaladas.
 * No lleva el precio a propósito: WhatsApp guarda la vista previa por mucho tiempo y quedaría desactualizado.
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import opentype from 'opentype.js'
import sharp from 'sharp'

const require = createRequire(import.meta.url)
const W = 1200
const H = 630

let fuentes
async function cargarFuentes() {
  if (fuentes) return fuentes
  const abrir = async (paquete, archivo) => {
    const buf = await readFile(require.resolve(`${paquete}/files/${archivo}`))
    return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
  }
  fuentes = {
    titulo: await abrir('@fontsource/lexend-exa', 'lexend-exa-latin-800-normal.woff'),
    medio: await abrir('@fontsource/lexend', 'lexend-latin-500-normal.woff'),
    fuerte: await abrir('@fontsource/lexend', 'lexend-latin-600-normal.woff'),
  }
  return fuentes
}

const ancho = (f, txt, size, track = 0) => f.getAdvanceWidth(txt, size, { kerning: true }) + track * Math.max(0, txt.length - 1)

/** Texto como trazo SVG. `track`: espacio extra entre letras, en px. */
function texto(f, txt, x, y, size, fill, track = 0) {
  if (!track) return `<path d="${f.getPath(txt, x, y, size, { kerning: true }).toPathData(2)}" fill="${fill}"/>`
  let d = ''
  let cx = x
  for (const ch of txt) {
    const g = f.charToGlyph(ch)
    d += g.getPath(cx, y, size).toPathData(2)
    cx += (g.advanceWidth * size) / f.unitsPerEm + track
  }
  return `<path d="${d}" fill="${fill}"/>`
}

/** Corta el nombre en renglones que entren en `max` px, achicando la letra si hace falta (máx. 3 renglones). */
function renglones(f, txt, max) {
  const palabras = txt.toUpperCase().split(/\s+/)
  for (const size of [60, 54, 48, 43, 38, 34]) {
    const out = []
    let linea = ''
    for (const p of palabras) {
      const prueba = linea ? `${linea} ${p}` : p
      if (ancho(f, prueba, size) <= max) linea = prueba
      else {
        if (linea) out.push(linea)
        linea = p
      }
    }
    if (linea) out.push(linea)
    if (out.length <= 3 && out.every((l) => ancho(f, l, size) <= max)) return { size, lineas: out }
  }
  return { size: 34, lineas: [txt.toUpperCase()] }
}

/**
 * @param {{ nombre: string, marca: string, foto: string, logo: string }} d  rutas de archivo de la foto y del logo
 * @returns {Promise<Buffer>} JPG de 1200 × 630
 */
export async function tarjetaOg({ nombre, marca, foto, logo }) {
  const f = await cargarFuentes()
  const X = 72
  const MAX = 560

  // ── texto de la izquierda ──
  const { size, lineas } = renglones(f.titulo, nombre, MAX)
  const alto = size * 1.02
  const bloque = lineas.length * alto
  const yNombre = 352 - bloque / 2 + size * 0.8
  let svg = ''
  // logo + BOOM / ZAPAS
  svg += texto(f.titulo, 'BOOM', X + 118, 106, 40, '#f5f5f4', 1)
  svg += texto(f.titulo, 'ZAPAS', X + 118, 150, 40, '#d92c37', 1)
  // marca
  const yMarca = yNombre - size - 26
  svg += `<rect x="${X}" y="${yMarca - 9}" width="34" height="3" rx="1.5" fill="#d92c37"/>`
  svg += texto(f.fuerte, marca.toUpperCase(), X + 48, yMarca, 21, '#f0444e', 3)
  // nombre
  lineas.forEach((l, i) => {
    svg += texto(f.titulo, l, X, yNombre + i * alto, size, '#ffffff')
  })
  // etiquetas de abajo
  let cx = X
  for (const chip of ['Fotos reales', 'Envío gratis a todo el país']) {
    const w = ancho(f.medio, chip, 21) + 40
    svg += `<rect x="${cx}" y="500" width="${w}" height="50" rx="25" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`
    svg += texto(f.medio, chip, cx + 20, 532, 21, '#f5f5f4')
    cx += w + 12
  }

  const fondo = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="a" cx="0.08" cy="0.05" r="0.55"><stop offset="0" stop-color="#96101a" stop-opacity="0.55"/><stop offset="1" stop-color="#96101a" stop-opacity="0"/></radialGradient>
      <radialGradient id="b" cx="0.82" cy="0.62" r="0.5"><stop offset="0" stop-color="#d92c37" stop-opacity="0.42"/><stop offset="1" stop-color="#96101a" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#0b0708"/>
    <rect width="${W}" height="${H}" fill="url(#a)"/>
    <rect width="${W}" height="${H}" fill="url(#b)"/>
    <circle cx="${X + 48}" cy="112" r="49" fill="none" stroke="rgba(217,44,55,0.55)" stroke-width="3"/>
    ${svg}
  </svg>`

  // ── foto del par en una tarjeta redondeada, a la derecha ──
  const FW = 420
  const FH = 540
  const radio = 30
  const mascara = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${FW}" height="${FH}"><rect width="${FW}" height="${FH}" rx="${radio}" fill="#fff"/></svg>`)
  const tarjeta = await sharp(foto)
    .resize(FW, FH, { fit: 'cover', position: 'centre' })
    .composite([{ input: mascara, blend: 'dest-in' }])
    .png()
    .toBuffer()
  const FX = 708
  const FY = 45
  // sombra suave debajo de la tarjeta (del tamaño de toda la imagen, para no salirse del borde)
  const sombra = await sharp(
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${FX + 10}" y="${FY + 26}" width="${FW - 20}" height="${FH - 20}" rx="${radio}" fill="rgba(0,0,0,0.8)"/></svg>`),
  )
    .blur(26)
    .png()
    .toBuffer()
  const logoRedondo = await sharp(logo)
    .resize(92, 92)
    .composite([{ input: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92"><circle cx="46" cy="46" r="46" fill="#fff"/></svg>'), blend: 'dest-in' }])
    .png()
    .toBuffer()

  return sharp(Buffer.from(fondo))
    .composite([
      { input: sombra, left: 0, top: 0 },
      { input: tarjeta, left: FX, top: FY },
      { input: logoRedondo, left: X + 2, top: 66 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer()
}
