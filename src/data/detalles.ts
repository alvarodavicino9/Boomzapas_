import { normText } from '@/lib/filters'
import type { Producto } from '@/types'

/**
 * Ficha de cada modelo: puntos destacados y características.
 * Se arma a partir de la familia del modelo (Dunk, Samba, Forum…) y del color que dice el nombre.
 * La descripción sólo aparece si el producto trae una propia desde la base de datos (o en MODELOS).
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
  corte: string
  uso: string
  destacados: string[]
}

const FAMILIAS: Familia[] = [
  {
    match: ['jordan 1 low', 'jordan 1 mocca'],
    corte: 'Bajo',
    uso: 'Urbano',
    destacados: ['Swoosh invertido', 'Corte bajo', 'Paneles combinados'],
  },
  {
    match: ['blazer'],
    corte: 'Medio',
    uso: 'Urbano, todos los días',
    destacados: ['Caña media', 'Swoosh grande lateral', 'Estética vintage'],
  },
  {
    match: ['forum 84', 'forum clasicas', 'forum total white'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Corte bajo', 'Suela de plataforma', 'Paneles marcados'],
  },
  {
    match: ['gazelle'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Perfil bajo', 'Tres tiras laterales', 'Liviana'],
  },
  {
    match: ['adi2000'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Suela gruesa', 'Paneles superpuestos', 'Estética 2000'],
  },
  {
    match: ['adizero'],
    corte: 'Bajo',
    uso: 'Running y entrenamiento',
    destacados: ['Muy liviana', 'Amortiguación para el paso', 'Parte superior de malla'],
  },
  {
    match: ['530'],
    corte: 'Bajo',
    uso: 'Urbano',
    destacados: ['Malla respirable', 'Refuerzos metalizados', 'Muy cómoda'],
  },
  {
    match: ['puma 180'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Silueta voluminosa', 'Lengüeta acolchada', 'Suela gruesa'],
  },
  {
    match: ['hylane', 'hyline'],
    corte: 'Bajo',
    uso: 'Urbano / skate',
    destacados: ['Cordones anchos', 'Paneles combinados', 'Cómoda para todo el día'],
  },
  {
    match: ['upland'],
    corte: 'Bajo',
    uso: 'Urbano / skate',
    destacados: ['Lengüeta acolchada', 'Logo grande', 'Suela gruesa'],
  },
  {
    match: ['dunk', 'travis'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Corte bajo, fácil de combinar', 'Cómoda para todo el día'],
  },
  {
    match: ['samba'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Perfil bajo y liviano', 'Tres tiras laterales', 'Suela plana de goma'],
  },
  {
    match: ['forum high'],
    corte: 'Alto',
    uso: 'Urbano, todos los días',
    destacados: ['Corte alto con tira al tobillo', 'Plataforma de suela marcada', 'Presencia retro'],
  },
  {
    match: ['forum low'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Corte bajo', 'Suela de plataforma', 'Paneles marcados'],
  },
  {
    match: ['superstar'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Puntera de goma inconfundible', 'Tres tiras laterales', 'Combina con todo'],
  },
  {
    match: ['campus'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Suela gruesa', 'Estética skate retro', 'Cómoda y resistente'],
  },
  {
    match: ['air force'],
    corte: 'Bajo',
    uso: 'Urbano, todos los días',
    destacados: ['Suela alta y robusta', 'Líneas limpias', 'Look atemporal'],
  },
  {
    match: ['jordan 1'],
    corte: 'Alto',
    uso: 'Urbano',
    destacados: ['Corte alto', 'Paneles combinados', 'Silueta icónica'],
  },
  {
    match: ['jordan 4'],
    corte: 'Medio',
    uso: 'Urbano',
    destacados: ['Paneles de malla laterales', 'Silueta marcada', 'Mucho carácter'],
  },
  {
    match: ['jordan low'],
    corte: 'Bajo',
    uso: 'Urbano',
    destacados: ['Corte bajo', 'Silueta clásica', 'Liviana'],
  },
  {
    match: ['duramo'],
    corte: 'Bajo',
    uso: 'Running y entrenamiento liviano',
    destacados: ['Liviana', 'Amortiguación para el paso', 'Parte superior de malla'],
  },
  {
    match: ['9060', 'new balance'],
    corte: 'Bajo',
    uso: 'Urbano',
    destacados: ['Suela voluminosa amortiguada', 'Paneles superpuestos', 'Muy cómoda'],
  },
  {
    match: ['salomon'],
    corte: 'Bajo',
    uso: 'Urbano y outdoor',
    destacados: ['Estética trail', 'Suela con taco marcado', 'En tendencia'],
  },
  {
    match: ['vans', 'knu'],
    corte: 'Bajo',
    uso: 'Urbano / skate',
    destacados: ['Lengüeta acolchada', 'Silueta voluminosa', 'Look skate de los 90'],
  },
  {
    match: ['zoom'],
    corte: 'Bajo',
    uso: 'Running y urbano',
    destacados: ['Línea deportiva', 'Suela amortiguada', 'Para entrenar o para el día a día'],
  },
]

const GENERICA: Familia = {
  match: [],
  corte: 'Bajo',
  uso: 'Urbano, todos los días',
  destacados: ['Cómoda para todo el día', 'Fácil de combinar'],
}

/** Ajustes de un modelo puntual (por nombre exacto). Pisa lo de la familia. */
const MODELOS: Record<string, Partial<Pick<Detalles, 'descripcion'>> & { color?: string }> = {}

const COLORES: [string[], string][] = [
  [['grey panda'], 'Gris, blanco y negro'],
  [['samba caramel'], 'Blanco y marrón'],
  [['cream black gum'], 'Crema y negro'],
  [['graphite gum'], 'Blanco y marrón oscuro'],
  [['grafito brown'], 'Marrón y gris grafito'],
  [['celeste y rosa'], 'Celeste y rosa'],
  [['negras clasicas', 'white and black', 'speed 2 clasica'], 'Negro y blanco'],
  [['white green'], 'Blanco y verde'],
  [['semi total black'], 'Negro'],
  [['air force one'], 'Blanco'],
  [['total white'], 'Blanco total'],
  [['cloud grey', 'white and grey'], 'Blanco y gris'],
  [['cloud white'], 'Blanco y gris claro'],
  [['platino'], 'Blanco y plata'],
  [['silver grey'], 'Gris plata'],
  [['phantom'], 'Negro'],
  [['grey cream'], 'Gris y crema'],
  [['mocca'], 'Marrón y crema'],
  [['teddy bear rosa'], 'Rosa'],
  [['teddy bear black'], 'Negro y crema'],
  [['paisley rosa'], 'Crema y rosa'],
  [['cream pink'], 'Crema y rosa'],
  [['ice pink'], 'Blanco y rosa'],
  [['samba ice'], 'Blanco hielo'],
  [['purple'], 'Blanco y violeta'],
  [['bordeaux'], 'Blanco y bordó'],
  [['navy', 'dunk la'], 'Blanco y azul marino'],
  [['vintage'], 'Blanco vintage y negro'],
  [['classic black', 'black and white'], 'Negro y blanco'],
  [['grafito'], 'Gris grafito'],
  [['gum blue'], 'Crema y celeste'],
  [['knu clasicas', 'hyline clasicas'], 'Negro y blanco'],
  [['clasica'], 'Blanco y negro'],
  [['rosa', 'pink'], 'Rosa'],
  [['grises'], 'Gris y blanco'],
  [['samba verde'], 'Blanco y verde'],
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

const CATEGORIA_LABEL: Record<string, string> = { urbanas: 'Urbanas', deportivas: 'Deportivas' }

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
    { label: 'Corte', value: fam.corte },
    { label: 'Ideal para', value: fam.uso },
    { label: 'Talles (AR)', value: rango },
  ]

  return {
    descripcion: p.descripcion?.trim() || MODELOS[p.nombre]?.descripcion || '',
    destacados: [...fam.destacados, `Color: ${color}`],
    caracteristicas,
  }
}
