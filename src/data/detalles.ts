import { normText } from '@/lib/filters'
import type { Producto } from '@/types'

/**
 * Ficha de cada modelo: descripción, puntos destacados y características.
 * Se arma a partir de la familia del modelo (Dunk, Samba, Forum…) y del color que dice el nombre.
 * Si el producto trae `descripcion` desde la base de datos, esa tiene prioridad.
 * Para ajustar un modelo puntual (materiales, medidas, etc.) alcanza con editar FAMILIAS o MODELOS.
 */
export interface Detalles {
  descripcion: string
  destacados: string[]
  caracteristicas: { label: string; value: string }[]
}

interface Familia {
  /** Fragmentos (sin tildes ni mayúsculas) que identifican la familia en el nombre. */
  match: string[]
  estilo: string
  corte: string
  cierre: string
  suela: string
  uso: string
  descripcion: string
  destacados: string[]
}

const FAMILIAS: Familia[] = [
  {
    match: ['dunk', 'travis'],
    estilo: 'Skate / básquet retro',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma con vulcanizado',
    uso: 'Urbano, todos los días',
    descripcion:
      'Silueta de básquet de los 80 convertida en clásico de la calle. Corte bajo, paneles combinados y una línea limpia que va con casi todo.',
    destacados: ['Corte bajo, fácil de combinar', 'Paneles bicolor característicos', 'Cómoda para todo el día'],
  },
  {
    match: ['samba'],
    estilo: 'Indoor clásico',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma color caramelo',
    uso: 'Urbano, todos los días',
    descripcion:
      'Un clásico de las canchas de fútbol sala que se volvió básico del calzado urbano. Perfil bajo, tres tiras laterales y suela de goma plana.',
    destacados: ['Perfil bajo y liviano', 'Tres tiras laterales', 'Suela plana de goma'],
  },
  {
    match: ['forum high'],
    estilo: 'Básquet retro',
    corte: 'Alto',
    cierre: 'Cordones y tira al tobillo',
    suela: 'Plataforma de goma',
    uso: 'Urbano, todos los días',
    descripcion:
      'Zapatilla de básquet de los 80 con corte alto y tira al tobillo. Presencia fuerte, estructura firme y mucho estilo.',
    destacados: ['Corte alto con tira al tobillo', 'Plataforma de suela marcada', 'Presencia retro'],
  },
  {
    match: ['forum low'],
    estilo: 'Básquet retro',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Plataforma de goma',
    uso: 'Urbano, todos los días',
    descripcion:
      'La versión baja de la Forum: misma silueta de básquet retro con paneles marcados y suela de plataforma, más fresca para el día a día.',
    destacados: ['Corte bajo', 'Suela de plataforma', 'Paneles marcados'],
  },
  {
    match: ['superstar'],
    estilo: 'Clásico de básquet',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma, patrón en espiga',
    uso: 'Urbano, todos los días',
    descripcion:
      'Reconocible por su puntera de goma y las tres tiras. Una zapatilla que no pasa de moda y combina con todo.',
    destacados: ['Puntera de goma inconfundible', 'Tres tiras laterales', 'Combina con todo'],
  },
  {
    match: ['campus'],
    estilo: 'Skate retro',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma gruesa',
    uso: 'Urbano, todos los días',
    descripcion:
      'Estilo skate de los 2000 con suela gruesa y paneles de aspecto gamuzado. Cómoda, resistente y con mucha onda.',
    destacados: ['Suela gruesa', 'Estética skate retro', 'Cómoda y resistente'],
  },
  {
    match: ['air force'],
    estilo: 'Básquet clásico',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Plataforma gruesa de goma',
    uso: 'Urbano, todos los días',
    descripcion:
      'Una de las zapatillas más reconocidas del mundo. Suela alta, líneas limpias y un look blanco o negro que sirve para todo.',
    destacados: ['Suela alta y robusta', 'Líneas limpias', 'Look atemporal'],
  },
  {
    match: ['jordan 1'],
    estilo: 'Básquet clásico',
    corte: 'Alto',
    cierre: 'Cordones',
    suela: 'Goma con cámara de aire visible',
    uso: 'Lifestyle',
    descripcion:
      'La silueta que empezó todo. Corte alto, paneles combinados y estética de básquet clásica que se nota donde vayas.',
    destacados: ['Corte alto', 'Paneles combinados', 'Silueta icónica'],
  },
  {
    match: ['jordan 4'],
    estilo: 'Básquet clásico',
    corte: 'Medio',
    cierre: 'Cordones',
    suela: 'Goma con cámara de aire visible',
    uso: 'Lifestyle',
    descripcion:
      'Modelo emblemático con paneles de malla laterales y construcción marcada. Presencia fuerte y mucho carácter.',
    destacados: ['Paneles de malla laterales', 'Silueta marcada', 'Mucho carácter'],
  },
  {
    match: ['jordan low'],
    estilo: 'Básquet clásico',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma con cámara de aire visible',
    uso: 'Lifestyle',
    descripcion: 'La silueta de las Jordan en versión baja: más liviana y fácil de usar todos los días.',
    destacados: ['Corte bajo', 'Silueta clásica', 'Liviana'],
  },
  {
    match: ['duramo'],
    estilo: 'Running',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma liviana con amortiguación',
    uso: 'Running y entrenamiento liviano',
    descripcion: 'Zapatilla de running liviana, pensada para salir a correr o para el día a día con comodidad.',
    destacados: ['Liviana', 'Amortiguación para el paso', 'Parte superior de malla'],
  },
  {
    match: ['9060', 'new balance'],
    estilo: 'Running retro / chunky',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Plataforma gruesa amortiguada',
    uso: 'Urbano y lifestyle',
    descripcion:
      'Estética de running de los 2000 con suela voluminosa y paneles superpuestos. Muy cómoda y con mucha presencia.',
    destacados: ['Suela voluminosa amortiguada', 'Paneles superpuestos', 'Muy cómoda'],
  },
  {
    match: ['salomon'],
    estilo: 'Trail / outdoor',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma con taco marcado',
    uso: 'Urbano y outdoor',
    descripcion: 'Look técnico de montaña llevado a la calle. Suela con agarre y estética deportiva que está en tendencia.',
    destacados: ['Estética trail', 'Suela con taco marcado', 'En tendencia'],
  },
  {
    match: ['vans', 'knu'],
    estilo: 'Skate',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma vulcanizada',
    uso: 'Urbano / skate',
    descripcion: 'Zapatilla skate de silueta voluminosa, lengüeta acolchada y suela vulcanizada. Look de los 90.',
    destacados: ['Lengüeta acolchada', 'Silueta voluminosa', 'Look skate de los 90'],
  },
  {
    match: ['zoom'],
    estilo: 'Running',
    corte: 'Bajo',
    cierre: 'Cordones',
    suela: 'Goma con amortiguación',
    uso: 'Running y urbano',
    descripcion: 'Zapatilla de running con línea deportiva y suela amortiguada. Ideal para entrenar o para usar todos los días.',
    destacados: ['Línea deportiva', 'Suela amortiguada', 'Para entrenar o para el día a día'],
  },
]

const GENERICA: Familia = {
  match: [],
  estilo: 'Urbana',
  corte: 'Bajo',
  cierre: 'Cordones',
  suela: 'Goma',
  uso: 'Urbano, todos los días',
  descripcion: 'Zapatilla cómoda y fácil de combinar para el día a día.',
  destacados: ['Cómoda para todo el día', 'Fácil de combinar'],
}

/** Ajustes de un modelo puntual (por nombre exacto). Pisa lo de la familia. */
const MODELOS: Record<string, Partial<Pick<Detalles, 'descripcion'>> & { color?: string }> = {}

const COLORES: [string[], string][] = [
  [['b&w', 'panda'], 'Blanco y negro'],
  [['total black'], 'Negro total'],
  [['negro/blanco'], 'Negro y blanco'],
  [['530 silver'], 'Blanco y plata'],
  [['740 bordo'], 'Blanco, beige y bordó'],
  [['dunk low crema'], 'Crema'],
  [['samba verde'], 'Blanco y verde'],
  [['grey silver'], 'Gris y plata'],
  [['chocolate'], 'Marrón chocolate'],
  [['travis'], 'Marrón y crema'],
  [['amarillo'], 'Amarillo'],
  [['beige'], 'Beige'],
  [['azul'], 'Azul'],
  [['rojas'], 'Rojo'],
  [['black', 'negro'], 'Negro'],
  [['white', 'blanca', 'blanco'], 'Blanco'],
  [['grey', 'gris'], 'Gris'],
]

export const colorDe = (nombre: string): string => {
  const n = normText(nombre)
  if (MODELOS[nombre]?.color) return MODELOS[nombre].color as string
  for (const [keys, color] of COLORES) if (keys.some((k) => n.includes(k))) return color
  return 'Según foto'
}

const CATEGORIA_LABEL: Record<string, string> = { urbanas: 'Urbanas', running: 'Running', lifestyle: 'Lifestyle' }

export function detallesDe(p: Producto, talles: string[]): Detalles {
  const n = normText(p.nombre)
  const fam = FAMILIAS.find((f) => f.match.some((m) => n.includes(m))) ?? GENERICA
  const color = colorDe(p.nombre)
  const orden = [...talles].sort((a, b) => Number(a) - Number(b))
  const rango = orden.length ? (orden.length > 1 ? `${orden[0]} al ${orden[orden.length - 1]}` : orden[0]) : '—'

  const caracteristicas = [
    { label: 'Marca', value: p.marca },
    { label: 'Modelo', value: p.nombre },
    { label: 'Color', value: color },
    { label: 'Categoría', value: CATEGORIA_LABEL[p.categoria] ?? p.categoria },
    { label: 'Estilo', value: fam.estilo },
    { label: 'Corte', value: fam.corte },
    { label: 'Cierre', value: fam.cierre },
    { label: 'Suela', value: fam.suela },
    { label: 'Ideal para', value: fam.uso },
    { label: 'Talles (AR)', value: rango },
    { label: 'Fotos', value: 'Reales, a pedido del par exacto' },
  ]

  return {
    descripcion: p.descripcion?.trim() || MODELOS[p.nombre]?.descripcion || fam.descripcion,
    destacados: [...fam.destacados, `Color: ${color}`],
    caracteristicas,
  }
}
