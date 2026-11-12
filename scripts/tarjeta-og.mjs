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

// ─────────────────────────────────────────────────────────────────────────────
// Tarjeta de cada página (inicio, catálogo, envíos, marcas…): el estilo de la portada 3D,
// con las zapatillas flotando sobre el aro rojo.
// ─────────────────────────────────────────────────────────────────────────────

/** Fondo, logo, título grande en dos renglones (el segundo en rojo), bajada y etiquetas. */
function ladoIzquierdo(f, { linea1, linea2, bajada, chips }) {
  const X = 72
  const MAX = 480
  let size = 74
  while (size > 42 && Math.max(ancho(f.titulo, linea1, size), ancho(f.titulo, linea2, size)) > MAX) size -= 2
  const y1 = 300
  const y2 = y1 + size * 0.98
  let svg = ''
  svg += `<circle cx="${X + 48}" cy="112" r="49" fill="none" stroke="rgba(217,44,55,0.55)" stroke-width="3"/>`
  svg += texto(f.titulo, 'BOOM', X + 118, 106, 40, '#f5f5f4', 1)
  svg += texto(f.titulo, 'ZAPAS', X + 118, 150, 40, '#d92c37', 1)
  svg += texto(f.titulo, linea1, X, y1, size, '#ffffff')
  svg += texto(f.titulo, linea2, X, y2, size, '#e5323d')
  // bajada en uno o dos renglones
  const palabras = bajada.split(' ')
  const renglon = []
  let linea = ''
  for (const p of palabras) {
    const prueba = linea ? `${linea} ${p}` : p
    if (ancho(f.medio, prueba, 25) <= MAX) linea = prueba
    else {
      renglon.push(linea)
      linea = p
    }
  }
  renglon.push(linea)
  renglon.slice(0, 2).forEach((l, i) => {
    svg += texto(f.medio, l, X, y2 + 52 + i * 34, 25, 'rgba(255,255,255,0.74)')
  })
  let cx = X
  for (const chip of chips) {
    const w = ancho(f.medio, chip, 21) + 40
    svg += `<rect x="${cx}" y="530" width="${w}" height="50" rx="25" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>`
    svg += texto(f.medio, chip, cx + 20, 562, 21, '#f5f5f4')
    cx += w + 12
  }
  return svg
}

const fondoBase = (contenido) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="a" cx="0.06" cy="0.04" r="0.5"><stop offset="0" stop-color="#96101a" stop-opacity="0.5"/><stop offset="1" stop-color="#96101a" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="0.75" cy="0.72" r="0.42"><stop offset="0" stop-color="#d92c37" stop-opacity="0.55"/><stop offset="1" stop-color="#96101a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0b0708"/>
  <rect width="${W}" height="${H}" fill="url(#a)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  ${contenido}
</svg>`

/** Una zapatilla recortada, girada y (si va atrás) más oscura. Devuelve la imagen y su tamaño. */
async function zapa(archivo, anchoPx, grados, brillo = 1) {
  let img = sharp(archivo).resize({ width: anchoPx })
  if (brillo !== 1) img = img.modulate({ brightness: brillo })
  const buf = await img.rotate(grados, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  const { width, height } = await sharp(buf).metadata()
  return { buf, width, height }
}

const dentro = (v, min, max) => Math.round(Math.min(max, Math.max(min, v)))

/**
 * @param {{ linea1: string, linea2: string, bajada: string, chips?: string[], zapas?: string[], fotos?: string[], logo: string }} d
 *   zapas: fotos recortadas (fondo transparente) — la primera va adelante, grande.
 *   fotos: si no hay recortes (por ejemplo, una marca sin ellos), fotos comunes en tarjetas abiertas en abanico.
 */
export async function tarjetaPagina({ linea1, linea2, bajada, chips = ['Fotos reales', 'Envío gratis a todo el país'], zapas = [], fotos = [], logo }) {
  const f = await cargarFuentes()
  const CX = 915 // centro de la escena
  const PISO = 470
  const capas = []

  if (zapas.length) {
    // aro de neón (con brillo difuso) y luz del piso, como en la portada
    const aro = (ancho, opac) =>
      `<ellipse cx="${CX}" cy="${PISO}" rx="250" ry="60" fill="none" stroke="#ff3b46" stroke-width="${ancho}" stroke-opacity="${opac}"/>`
    const brillo = await sharp(Buffer.from(fondoBase('').replace(/<rect[^>]*>/g, '').replace('</svg>', `${aro(16, 0.9)}</svg>`)))
      .blur(12)
      .png()
      .toBuffer()
    capas.push({ input: brillo, left: 0, top: 0 })
    capas.push({
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${aro(4, 1)}<ellipse cx="${CX}" cy="${PISO}" rx="178" ry="42" fill="none" stroke="rgba(255,90,100,0.5)" stroke-width="2" stroke-dasharray="6 14"/></svg>`,
      ),
      left: 0,
      top: 0,
    })
    // las de atrás, más chicas y oscuras
    const atras = [
      { x: CX - 190, grados: -8 },
      { x: CX + 190, grados: 8 },
    ]
    for (let i = 1; i < Math.min(3, zapas.length); i++) {
      const z = await zapa(zapas[i], 205, atras[i - 1].grados, 0.42)
      // apoyadas sobre el fondo del aro
      capas.push({ input: z.buf, left: dentro(atras[i - 1].x - z.width / 2, 0, W - z.width), top: dentro(PISO - 40 - z.height, 0, H - z.height) })
    }
    // sombra y la del frente, grande
    const sombra = await sharp(
      Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><ellipse cx="${CX}" cy="${PISO + 8}" rx="170" ry="26" fill="rgba(0,0,0,0.85)"/></svg>`),
    )
      .blur(14)
      .png()
      .toBuffer()
    capas.push({ input: sombra, left: 0, top: 0 })
    const z = await zapa(zapas[0], 340, -7)
    // flotando sobre el centro del aro
    capas.push({ input: z.buf, left: dentro(CX - z.width / 2, 0, W - z.width), top: dentro(PISO + 4 - z.height, 0, H - z.height) })
  } else if (fotos.length) {
    // tarjetas con foto, abiertas en abanico
    const FW = 270
    const FH = 360
    const mascara = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${FW}" height="${FH}"><rect width="${FW}" height="${FH}" rx="26" fill="#fff"/></svg>`)
    const pos = [
      { x: CX - 125, y: 300, grados: -9 },
      { x: CX + 130, y: 290, grados: 8 },
      { x: CX, y: 335, grados: -2 },
    ]
    const orden = fotos.length >= 3 ? [1, 2, 0] : fotos.length === 2 ? [1, 0] : [0]
    for (let k = 0; k < orden.length; k++) {
      const i = orden[k]
      const p = fotos.length === 1 ? pos[2] : fotos.length === 2 ? [pos[0], pos[2]][k] : pos[k]
      const tarjeta = await sharp(fotos[i])
        .resize(FW, FH, { fit: 'cover' })
        .composite([{ input: mascara, blend: 'dest-in' }])
        .png()
        .toBuffer()
      const girada = await sharp(tarjeta).rotate(p.grados, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
      const { width, height } = await sharp(girada).metadata()
      const sombra = await sharp(
        Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${p.x - FW / 2 + 8}" y="${p.y - FH / 2 + 24}" width="${FW - 16}" height="${FH - 16}" rx="26" fill="rgba(0,0,0,0.75)"/></svg>`),
      )
        .blur(22)
        .png()
        .toBuffer()
      capas.push({ input: sombra, left: 0, top: 0 })
      capas.push({ input: girada, left: dentro(p.x - width / 2, 0, W - width), top: dentro(p.y - height / 2, 0, H - height) })
    }
  }

  const logoRedondo = await sharp(logo)
    .resize(92, 92)
    .composite([{ input: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92"><circle cx="46" cy="46" r="46" fill="#fff"/></svg>'), blend: 'dest-in' }])
    .png()
    .toBuffer()
  capas.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${ladoIzquierdo(f, { linea1, linea2, bajada, chips })}</svg>`), left: 0, top: 0 })
  capas.push({ input: logoRedondo, left: 74, top: 66 })

  return sharp(Buffer.from(fondoBase(''))).composite(capas).jpeg({ quality: 84, mozjpeg: true }).toBuffer()
}
