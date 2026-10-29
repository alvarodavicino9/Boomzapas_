import type { Producto, StockTalle } from '@/types'
import { fotoDeModelo, MODELOS_ORIGINALES } from '@/data/fotosCatalogo'
import { fotosDeModelo, MODELOS_DRIVE } from '@/data/modelosDrive'

const TALLES = ['38', '39', '40', '41', '42', '43', '44']

/** Stock de ejemplo, repartido de forma estable según el id. */
const stockDe = (id: number): StockTalle[] =>
  TALLES.map((talle, i) => ({
    producto_id: id,
    talle,
    // algunos talles agotados y algunos modelos casi sin stock para probar los estados
    cantidad: id % 11 === 0 ? (i === 3 ? 1 : 0) : (id * 7 + i * 3) % 5 === 0 ? 0 : 1 + ((id + i) % 4),
  }))

/**
 * Modelos de Drive que reemplazan a uno que ya existía (mismo par, foto nueva).
 * Conservan el id anterior para no romper pedidos ni ediciones hechas en el panel.
 */
const MISMO_ID: Record<string, number> = {
  'Nike SB Dunk Panda': 1,
  'Adidas Samba Clásicas': 3,
  'Nike Air Force One': 21,
  'Nike SB Dunk Grises': 23,
  'Nike SB Dunk Total Black': 24,
  'Nike SB Dunk Chocolate': 25,
  // Los tres primeros con fotos reales (antes "530 Silver", "Dunk Low Crema" y "Samba Verde")
  'New Balance 530 Platino': 32,
  'Nike SB Dunk Total White': 33,
  'Adidas Samba Verdes': 34,
}
const REEMPLAZADOS = new Set(Object.values(MISMO_ID))
const NUEVOS = new Set([32, 33, 34, 35])

let siguienteId = 36
const conFotosDeEstudio: Producto[] = MODELOS_DRIVE.map((m) => {
  const id = MISMO_ID[m.nombre] ?? siguienteId++
  return {
    id,
    nombre: m.nombre,
    marca: m.marca,
    categoria: m.categoria,
    precio: m.precio,
    imagenes: fotosDeModelo(m),
    descripcion: '',
    stock: stockDe(id),
    nuevo: NUEVOS.has(id) || undefined,
  }
})

/**
 * Catálogo mientras la tienda esté sin conexión al servidor (modo local).
 *
 * 1. Los modelos con fotos de estudio (Drive) + el New Balance 740 de las primeras fotos del negocio.
 * 2. Los modelos de la página anterior que todavía no tienen fotos de estudio: quedan OCULTOS para que
 *    la tienda se vea pareja. Siguen en el panel (Productos → Ocultos) y se pueden volver a mostrar.
 * Los precios son de referencia.
 */
export const MOCK_PRODUCTOS: Producto[] = [
  ...conFotosDeEstudio,
  {
    id: 35,
    nombre: 'New Balance 740 Bordó',
    marca: 'New Balance',
    categoria: 'running',
    precio: 66900,
    imagenes: ['nb740', 'nb740-detalle', 'nb740-suela'].map((f) => `/fotos/negocio/${f}.jpg`),
    descripcion: '',
    stock: stockDe(35),
    nuevo: true,
  },
  ...MODELOS_ORIGINALES.map<Producto>((m, i) => ({
    id: i + 1,
    nombre: m.nombre,
    marca: m.marca,
    categoria: m.categoria,
    precio: m.precio,
    imagenes: [fotoDeModelo(m.nombre)],
    descripcion: '',
    stock: stockDe(i + 1),
    oculto: true,
  })).filter((p) => !REEMPLAZADOS.has(p.id)),
]
