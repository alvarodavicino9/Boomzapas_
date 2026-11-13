import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useUI } from '@/context/UIContext'
import { SITE } from '@/config/site'
import { descargarBlob } from '@/lib/adminStats'
import { cn, formatARS, PROMO } from '@/lib/format'
import { slugify } from '@/lib/slug'
import type { Producto } from '@/types'
import { Card, Field, Pills } from './ui'

/**
 * Flyer para Instagram y estados: elegís una zapatilla y se arma la imagen lista para publicar
 * (feed, historia o cuadrada), con el logo, el precio, los talles que hay y el contacto.
 * Se dibuja en el navegador, así que no gasta nada del servidor.
 */

const FORMATOS = {
  feed: { w: 1080, h: 1350, label: 'Feed (4:5)' },
  historia: { w: 1080, h: 1920, label: 'Historia (9:16)' },
  cuadrado: { w: 1080, h: 1080, label: 'Cuadrado' },
} as const
type Formato = keyof typeof FORMATOS

const ESTILOS = {
  oscuro: { label: 'Negro y rojo' },
  rojo: { label: 'Rojo' },
  claro: { label: 'Claro' },
} as const
type Estilo = keyof typeof ESTILOS

const ETIQUETAS = {
  ninguna: 'Sin etiqueta',
  nuevo: 'Nuevo ingreso',
  oferta: 'Oferta',
  ultimos: 'Últimos pares',
} as const
type Etiqueta = keyof typeof ETIQUETAS

/** Pares con foto recortada (sin fondo), en /public/fotos/hero3d: en el flyer quedan flotando sobre el aro rojo. */
const RECORTES = new Set([
  'nike-sb-dunk-panda',
  'nike-air-jordan-1-low-x-travis-scott-grey-cream',
  'adidas-samba-negras-clasicas',
  'new-balance-530-cloud-white',
  'nike-sb-dunk-bordeaux',
  'adidas-forum-84-low-white-and-black',
  'nike-air-force-one',
  'adidas-adi2000-semi-total-black',
])
const recorteDe = (p: Producto) => (RECORTES.has(slugify(p.nombre)) ? `/fotos/hero3d/${slugify(p.nombre)}.webp` : null)
const esRecorte = (src: string) => src.startsWith('/fotos/hero3d/')

const DISPLAY = '"Lexend Exa Variable", "Lexend Exa", "Lexend Variable", system-ui, sans-serif'
const TEXTO = '"Lexend Variable", Lexend, system-ui, sans-serif'

const talleNum = (t: string) => parseFloat(t.replace(',', '.')) || 0
export const tallesDisponibles = (p: Producto) =>
  [...new Set(p.stock.filter((s) => s.cantidad > 0).map((s) => s.talle))].sort((a, b) => talleNum(a) - talleNum(b))

function cargar(src: string): Promise<HTMLImageElement | null> {
  return new Promise((ok) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => ok(img)
    img.onerror = () => ok(null)
    img.src = src
  })
}

interface Opciones {
  producto: Producto
  foto: string | null
  formato: Formato
  estilo: Estilo
  etiqueta: Etiqueta
  precio: boolean
  talles: boolean
  promo: boolean
}

/** Renglones que entran en `max` px (como mucho `n`), achicando la letra si hace falta. */
function ajustar(ctx: CanvasRenderingContext2D, texto: string, max: number, inicial: number, minimo: number, n = 2) {
  const palabras = texto.split(/\s+/)
  for (let size = inicial; size >= minimo; size -= 2) {
    ctx.font = `800 ${size}px ${DISPLAY}`
    const lineas: string[] = []
    let linea = ''
    for (const p of palabras) {
      const prueba = linea ? `${linea} ${p}` : p
      if (ctx.measureText(prueba).width <= max) linea = prueba
      else {
        if (linea) lineas.push(linea)
        linea = p
      }
    }
    if (linea) lineas.push(linea)
    if (lineas.length <= n && lineas.every((l) => ctx.measureText(l).width <= max)) return { size, lineas }
  }
  ctx.font = `800 ${minimo}px ${DISPLAY}`
  return { size: minimo, lineas: [texto] }
}

function conEspaciado(ctx: CanvasRenderingContext2D, texto: string, x: number, y: number, espacio: number) {
  let cx = x
  for (const ch of texto) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + espacio
  }
  return cx - espacio
}

/** Dibuja el flyer en un canvas aparte y lo devuelve (así, si cambiás de opción a mitad de camino, no se mezclan dos dibujos). */
async function dibujar(o: Opciones): Promise<HTMLCanvasElement> {
  const { w: W, h: H } = FORMATOS[o.formato]
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  try {
    await Promise.all([
      document.fonts.load(`800 80px "Lexend Exa Variable"`),
      document.fonts.load(`600 30px "Lexend Variable"`),
      document.fonts.load(`500 30px "Lexend Variable"`),
    ])
  } catch {
    /* sigue con la letra del sistema */
  }

  const c =
    o.estilo === 'oscuro'
      ? { fondo1: '#1a0d0f', fondo2: '#070506', tinta: '#ffffff', suave: 'rgba(255,255,255,0.72)', acento: '#ff3b46', marca: '#ff5a63', linea: 'rgba(255,255,255,0.16)', chip: 'rgba(255,255,255,0.08)', borde: 'rgba(255,255,255,0.2)', brillo: 'rgba(217,44,55,0.5)', aro: '#ff3b46', etiqueta: '#d92c37', etiquetaTinta: '#ffffff', zapas: '#d92c37' }
      : o.estilo === 'rojo'
        ? { fondo1: '#e0313c', fondo2: '#8c111a', tinta: '#ffffff', suave: 'rgba(255,255,255,0.85)', acento: '#ffffff', marca: '#ffd9db', linea: 'rgba(255,255,255,0.3)', chip: 'rgba(0,0,0,0.18)', borde: 'rgba(255,255,255,0.35)', brillo: 'rgba(255,255,255,0.22)', aro: '#ffffff', etiqueta: '#140b0c', etiquetaTinta: '#ffffff', zapas: '#140b0c' }
        : { fondo1: '#faf7f6', fondo2: '#ebe3e1', tinta: '#140d0e', suave: 'rgba(20,13,14,0.68)', acento: '#d92c37', marca: '#c41f2b', linea: 'rgba(20,13,14,0.14)', chip: 'rgba(20,13,14,0.05)', borde: 'rgba(20,13,14,0.18)', brillo: 'rgba(217,44,55,0.16)', aro: '#d92c37', etiqueta: '#d92c37', etiquetaTinta: '#ffffff', zapas: '#d92c37' }

  const historia = o.formato === 'historia'
  const cuadrado = o.formato === 'cuadrado'
  // tamaños de letra según el formato: en el cuadrado hay menos alto, todo un poco más chico
  const t = historia
    ? { nombre: 84, precio: 132, saltoPrecio: 160, promo: 31, chip: 58, contacto: 30 }
    : cuadrado
      ? { nombre: 54, precio: 92, saltoPrecio: 112, promo: 27, chip: 48, contacto: 26 }
      : { nombre: 66, precio: 108, saltoPrecio: 132, promo: 29, chip: 52, contacto: 28 }
  const pad = cuadrado ? 60 : 72
  // en las historias, Instagram tapa arriba (nombre de la cuenta) y abajo (responder): ahí no va nada importante
  const arriba = historia ? 200 : pad
  const abajo = historia ? 230 : pad

  // ── fondo ──
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, c.fondo1)
  g.addColorStop(1, c.fondo2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  const esquina = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.7)
  esquina.addColorStop(0, o.estilo === 'claro' ? 'rgba(217,44,55,0.08)' : 'rgba(150,12,20,0.45)')
  esquina.addColorStop(1, 'rgba(150,12,20,0)')
  ctx.fillStyle = esquina
  ctx.fillRect(0, 0, W, H)

  const p = o.producto
  const enOferta = !!p.precioAntes && p.precioAntes > p.precio
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // ── de abajo hacia arriba, así el texto nunca pisa la foto ──
  let y = H - abajo
  ctx.font = `600 ${t.contacto}px ${TEXTO}`
  ctx.fillStyle = c.suave
  ctx.fillText(`WhatsApp ${SITE.whatsappDisplay}`, pad, y)
  ctx.textAlign = 'right'
  ctx.fillText(`@${SITE.instagram}`, W - pad, y)
  ctx.textAlign = 'left'
  y -= t.contacto + 18
  ctx.fillStyle = c.linea
  ctx.fillRect(pad, y, W - pad * 2, 2)
  y -= cuadrado ? 36 : 42

  if (o.promo) {
    ctx.font = `600 ${t.promo}px ${TEXTO}`
    ctx.fillStyle = c.tinta
    const pre = `Llevando ${PROMO.minimo} pares o más: `
    ctx.fillText(pre, pad, y)
    const x2 = pad + ctx.measureText(pre).width
    ctx.fillStyle = o.estilo === 'rojo' ? '#ffffff' : c.acento
    ctx.fillText(`${formatARS(PROMO.descuento)} menos c/u`, x2, y)
    y -= t.promo + (cuadrado ? 30 : 36)
  }

  if (o.precio && p.precio > 0) {
    ctx.font = `800 ${t.precio}px ${DISPLAY}`
    ctx.fillStyle = c.acento
    const txt = formatARS(p.precio)
    ctx.fillText(txt, pad - 4, y)
    if (enOferta) {
      const x2 = pad + ctx.measureText(txt).width + 28
      ctx.font = `600 44px ${TEXTO}`
      ctx.fillStyle = c.suave
      const antes = formatARS(p.precioAntes!)
      ctx.fillText(antes, x2, y - 8)
      ctx.fillRect(x2 - 2, y - 24, ctx.measureText(antes).width + 4, 4)
    }
    y -= t.saltoPrecio
  } else {
    ctx.font = `800 58px ${DISPLAY}`
    ctx.fillStyle = c.acento
    ctx.fillText('¡CONSULTANOS!', pad, y)
    y -= 96
  }

  const talles = tallesDisponibles(p)
  if (o.talles && talles.length) {
    ctx.font = `600 ${t.contacto - 2}px ${TEXTO}`
    ctx.fillStyle = c.suave
    ctx.fillText('Talles', pad, y - 8)
    let cx = pad + ctx.measureText('Talles').width + 22
    const alto = t.chip
    const quedan = talles.length > 9 ? [`${talles[0]} al ${talles[talles.length - 1]}`] : talles
    ctx.font = `700 28px ${TEXTO}`
    for (const talle of quedan) {
      const w = Math.max(alto, ctx.measureText(talle).width + 34)
      if (cx + w > W - pad) break
      ctx.fillStyle = c.chip
      ctx.strokeStyle = c.borde
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(cx, y - alto + 12, w, alto, alto / 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = c.tinta
      ctx.textAlign = 'center'
      ctx.fillText(talle, cx + w / 2, y - 6)
      ctx.textAlign = 'left'
      cx += w + 10
    }
    y -= t.chip + (cuadrado ? 30 : 38)
  }

  // nombre (hasta 2 renglones) y marca
  const { size, lineas } = ajustar(ctx, p.nombre.toUpperCase(), W - pad * 2, t.nombre, 40)
  ctx.font = `800 ${size}px ${DISPLAY}`
  ctx.fillStyle = c.tinta
  for (let i = lineas.length - 1; i >= 0; i--) {
    ctx.fillText(lineas[i], pad - 2, y)
    y -= size * 1.04
  }
  y -= 8
  ctx.fillStyle = c.marca
  ctx.fillRect(pad, y - 11, 40, 4)
  ctx.font = `700 28px ${TEXTO}`
  conEspaciado(ctx, p.marca.toUpperCase(), pad + 56, y, 4)
  const fotoAbajo = y - (cuadrado ? 30 : 40)

  // ── arriba: logo, BOOM ZAPAS y etiqueta ──
  const logo = await cargar('/logo-320.webp')
  const L = cuadrado ? 88 : 104
  if (logo) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(pad + L / 2, arriba + L / 2, L / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(logo, pad, arriba, L, L)
    ctx.restore()
    ctx.strokeStyle = o.estilo === 'rojo' ? 'rgba(255,255,255,0.6)' : 'rgba(217,44,55,0.6)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(pad + L / 2, arriba + L / 2, L / 2 + 4, 0, Math.PI * 2)
    ctx.stroke()
  }
  const wm = cuadrado ? 34 : 40
  ctx.font = `800 ${wm}px ${DISPLAY}`
  ctx.fillStyle = c.tinta
  ctx.fillText('BOOM', pad + L + 22, arriba + L / 2 - 4)
  ctx.fillStyle = c.zapas
  ctx.fillText('ZAPAS', pad + L + 22, arriba + L / 2 + wm + 2)
  if (o.etiqueta !== 'ninguna') {
    const et = ETIQUETAS[o.etiqueta].toUpperCase()
    ctx.font = `800 26px ${DISPLAY}`
    const w = ctx.measureText(et).width + 48
    ctx.fillStyle = c.etiqueta
    ctx.beginPath()
    ctx.roundRect(W - pad - w, arriba + L / 2 - 30, w, 60, 30)
    ctx.fill()
    ctx.fillStyle = c.etiquetaTinta
    ctx.textAlign = 'center'
    ctx.fillText(et, W - pad - w / 2, arriba + L / 2 + 10)
    ctx.textAlign = 'left'
  }

  // ── la foto ──
  const cajaY = arriba + L + (cuadrado ? 16 : 28)
  const caja = { x: pad, y: cajaY, w: W - pad * 2, h: Math.max(220, fotoAbajo - cajaY) }
  const cx = W / 2
  const cy = caja.y + caja.h / 2
  const brillo = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(caja.w, caja.h) * 0.62)
  brillo.addColorStop(0, c.brillo)
  brillo.addColorStop(1, c.brillo.replace(/[\d.]+\)$/, '0)'))
  ctx.fillStyle = brillo
  ctx.fillRect(0, 0, W, H)

  const img = o.foto ? await cargar(o.foto) : null
  if (img && o.foto && esRecorte(o.foto)) {
    // zapatilla recortada flotando sobre un aro, como en la portada de la página
    const s = Math.min((caja.w * 0.92) / img.width, (caja.h * 0.86) / img.height)
    const dw = img.width * s
    const dh = img.height * s
    const pisoY = caja.y + caja.h - caja.h * 0.07
    const rx = Math.min(caja.w * 0.42, dw * 0.62)
    const ry = rx * 0.22
    ctx.save()
    ctx.strokeStyle = c.aro
    ctx.lineWidth = 5
    ctx.shadowColor = c.aro
    ctx.shadowBlur = 36
    ctx.beginPath()
    ctx.ellipse(cx, pisoY, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.filter = 'blur(18px)'
    ctx.beginPath()
    ctx.ellipse(cx, pisoY + 4, rx * 0.7, ry * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.save()
    ctx.translate(cx, pisoY - ry * 0.6 - dh / 2)
    ctx.rotate((-7 * Math.PI) / 180)
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 50
    ctx.shadowOffsetY = 30
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
    ctx.restore()
  } else if (img) {
    // foto de estudio en una tarjeta redondeada; se recorta arriba y abajo (el par está en el medio) para aprovechar el lugar
    const asp = img.width / img.height
    const cajaAsp = caja.w / caja.h
    const tarjetaAsp = Math.min(1.35, Math.max(asp, cajaAsp))
    let tw = caja.w
    let th = tw / tarjetaAsp
    if (th > caja.h) {
      th = caja.h
      tw = th * tarjetaAsp
    }
    const tx = cx - tw / 2
    const ty = caja.y + (caja.h - th) / 2
    const r = 44
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.45)'
    ctx.shadowBlur = 60
    ctx.shadowOffsetY = 28
    ctx.fillStyle = '#ecebe9'
    ctx.beginPath()
    ctx.roundRect(tx, ty, tw, th, r)
    ctx.fill()
    ctx.restore()
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(tx, ty, tw, th, r)
    ctx.clip()
    const s = Math.max(tw / img.width, th / img.height)
    ctx.drawImage(img, cx - (img.width * s) / 2, ty + th / 2 - (img.height * s) / 2, img.width * s, img.height * s)
    ctx.restore()
  } else {
    ctx.font = `800 44px ${DISPLAY}`
    ctx.fillStyle = c.suave
    ctx.textAlign = 'center'
    ctx.fillText(p.nombre.toUpperCase(), cx, cy)
    ctx.textAlign = 'left'
  }
  return canvas
}

/** Texto para acompañar la foto en el posteo o el estado. */
function textoPosteo(p: Producto, o: { precio: boolean; talles: boolean; promo: boolean }) {
  const talles = tallesDisponibles(p)
  const enOferta = !!p.precioAntes && p.precioAntes > p.precio
  const l = [`👟 ${p.nombre}`]
  if (o.precio) l.push(`💸 ${formatARS(p.precio)}${enOferta ? ` (antes ${formatARS(p.precioAntes!)})` : ''}`)
  if (o.talles && talles.length) l.push(`📏 Talles: ${talles.length > 9 ? `${talles[0]} al ${talles[talles.length - 1]}` : talles.join(' · ')}`)
  l.push('🚚 Envío gratis a todo el país')
  if (o.promo) l.push(`🔥 Llevando ${PROMO.minimo} pares o más, ${formatARS(PROMO.descuento)} menos c/u`)
  l.push(`📲 Escribinos al WhatsApp ${SITE.whatsappDisplay}`)
  l.push('')
  l.push(`#boomzapas #zapatillas #sneakers #córdoba #${slugify(p.marca).replace(/-/g, '')}`)
  return l.join('\n')
}

export function Flyer({ productos }: { productos: Producto[] }) {
  const { toast } = useUI()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lista = useMemo(
    () => productos.filter((p) => !p.oculto).sort((a, b) => a.marca.localeCompare(b.marca, 'es') || a.nombre.localeCompare(b.nombre, 'es')),
    [productos],
  )
  const marcas = useMemo(() => [...new Set(lista.map((p) => p.marca))], [lista])
  const [id, setId] = useState<number | null>(null)
  const producto = lista.find((p) => p.id === id) ?? lista.find((p) => recorteDe(p)) ?? lista[0]
  const fotos = useMemo(() => (producto ? [...(recorteDe(producto) ? [recorteDe(producto)!] : []), ...producto.imagenes] : []), [producto])
  const [fotoIdx, setFotoIdx] = useState(0)
  const [formato, setFormato] = useState<Formato>('feed')
  const [estilo, setEstilo] = useState<Estilo>('oscuro')
  const etiquetaSugerida: Etiqueta = producto?.precioAntes && producto.precioAntes > producto.precio ? 'oferta' : producto?.nuevo ? 'nuevo' : 'ninguna'
  const [etiqueta, setEtiqueta] = useState<Etiqueta | null>(null)
  const [precio, setPrecio] = useState(true)
  const [talles, setTalles] = useState(true)
  const [promo, setPromo] = useState(true)
  const [puedeCompartir, setPuedeCompartir] = useState(false)
  const foto = fotos[fotoIdx] ?? fotos[0] ?? null
  const etiquetaFinal = etiqueta ?? etiquetaSugerida

  useEffect(() => {
    try {
      setPuedeCompartir(!!navigator.canShare?.({ files: [new File([''], 'a.png', { type: 'image/png' })] }))
    } catch {
      setPuedeCompartir(false)
    }
  }, [])

  useEffect(() => {
    if (!producto || !canvasRef.current) return
    let vivo = true
    dibujar({ producto, foto, formato, estilo, etiqueta: etiquetaFinal, precio, talles, promo })
      .then((listo) => {
        const visible = canvasRef.current
        if (!vivo || !visible) return
        visible.width = listo.width
        visible.height = listo.height
        visible.getContext('2d')?.drawImage(listo, 0, 0)
      })
      .catch(() => vivo && toast('No se pudo armar la imagen.'))
    return () => {
      vivo = false
    }
    // toast es estable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto, foto, formato, estilo, etiquetaFinal, precio, talles, promo])

  if (!producto) return null

  const elegir = (nuevo: number) => {
    setId(nuevo)
    setFotoIdx(0)
    setEtiqueta(null)
  }
  const nombreArchivo = `boom-zapas-${slugify(producto.nombre)}-${formato}.png`
  const aBlob = () => new Promise<Blob | null>((ok) => canvasRef.current?.toBlob((b) => ok(b), 'image/png'))
  const descargar = async () => {
    try {
      const b = await aBlob()
      if (!b) throw new Error('vacío')
      descargarBlob(nombreArchivo, b)
    } catch {
      toast('No se pudo descargar (esa foto no permite copiarse). Probá con otra.')
    }
  }
  const compartir = async () => {
    try {
      const b = await aBlob()
      if (!b) throw new Error('vacío')
      await navigator.share({ files: [new File([b], nombreArchivo, { type: 'image/png' })], title: producto.nombre })
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) toast('No se pudo compartir la imagen.')
    }
  }
  const posteo = textoPosteo(producto, { precio, talles, promo })
  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(posteo)
      toast('Texto copiado')
    } catch {
      toast('No se pudo copiar el texto.')
    }
  }
  const Check = ({ v, set, children }: { v: boolean; set: (b: boolean) => void; children: string }) => (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
      <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} className="size-4 accent-[#d92c37]" />
      {children}
    </label>
  )

  return (
    <Card
      className="lg:col-span-2"
      title="Flyer para Instagram y estados"
      hint="Elegí una zapatilla y se arma la imagen lista para publicar, con el logo, el precio, los talles y el contacto."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-8">
        <div className="grid content-start gap-5">
          <Field label="Zapatilla">
            <select className="field-line" value={producto.id} onChange={(e) => elegir(Number(e.target.value))}>
              {marcas.map((m) => (
                <optgroup key={m} label={m}>
                  {lista
                    .filter((p) => p.marca === m)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} · {formatARS(p.precio)}
                        {tallesDisponibles(p).length === 0 ? ' (sin stock)' : ''}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </Field>

          {fotos.length > 1 && (
            <div>
              <p className="label mb-1.5 text-index">Foto</p>
              <div className="flex flex-wrap gap-2">
                {fotos.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setFotoIdx(i)}
                    aria-pressed={fotoIdx === i}
                    aria-label={esRecorte(src) ? 'Usar la foto recortada (sin fondo)' : `Usar la foto ${i + 1}`}
                    className={cn(
                      'relative size-[68px] overflow-hidden rounded-xl border-2 transition-colors',
                      fotoIdx === i ? 'border-accent' : 'border-line hover:border-control',
                      esRecorte(src) ? 'bg-[#1a0d0f] p-1.5' : 'bg-[#ecebe9]',
                    )}
                  >
                    <img src={src} alt="" className={cn('size-full', esRecorte(src) ? 'object-contain' : 'object-cover')} />
                    {esRecorte(src) && (
                      <span className="absolute inset-x-0 bottom-0 bg-accent py-px text-center text-[9px] font-semibold uppercase tracking-wide text-white">
                        Sin fondo
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="label mb-1.5 text-index">Formato</p>
            <Pills value={formato} onChange={setFormato} options={(Object.keys(FORMATOS) as Formato[]).map((f) => ({ id: f, label: FORMATOS[f].label }))} />
          </div>
          <div>
            <p className="label mb-1.5 text-index">Estilo</p>
            <Pills value={estilo} onChange={setEstilo} options={(Object.keys(ESTILOS) as Estilo[]).map((e) => ({ id: e, label: ESTILOS[e].label }))} />
          </div>
          <div>
            <p className="label mb-1.5 text-index">Etiqueta</p>
            <Pills value={etiquetaFinal} onChange={setEtiqueta} options={(Object.keys(ETIQUETAS) as Etiqueta[]).map((e) => ({ id: e, label: ETIQUETAS[e] }))} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Check v={precio} set={setPrecio}>Mostrar el precio</Check>
            <Check v={talles} set={setTalles}>Talles disponibles</Check>
            <Check v={promo} set={setPromo}>{`Promo ${PROMO.minimo} pares`}</Check>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="label text-index">Texto para el posteo</p>
              <button type="button" onClick={copiarTexto} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-soft">
                <Icon name="copy" size={14} /> Copiar
              </button>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border border-line bg-stage/60 p-4 font-sans text-[13px] leading-5">{posteo}</pre>
          </div>
        </div>

        {/* vista previa: en el celular va arriba (así se ve cada cambio), en la compu queda fija a la derecha */}
        <div className="order-first lg:order-none lg:sticky lg:top-6 lg:self-start">
          <canvas
            ref={canvasRef}
            aria-label={`Vista previa del flyer de ${producto.nombre}`}
            className={cn(
              'mx-auto block w-full rounded-2xl shadow-[0_20px_50px_-24px_rgb(0_0_0/0.7)] ring-1 ring-line',
              formato === 'historia' ? 'max-w-[210px] sm:max-w-[300px]' : 'max-w-[280px] sm:max-w-[420px]',
            )}
          />
          <p className="mt-2 text-center text-[12px] text-index">
            {FORMATOS[formato].w} × {FORMATOS[formato].h} px · lista para Instagram
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2.5">
            <button type="button" onClick={descargar} className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-[13.5px] font-semibold text-white">
              <Icon name="download" size={16} /> Descargar imagen
            </button>
            {puedeCompartir && (
              <button type="button" onClick={compartir} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[13.5px] font-semibold hover:border-control">
                <Icon name="share" size={16} /> Compartir
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
