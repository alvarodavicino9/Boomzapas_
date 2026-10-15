import type { Producto, StockTalle } from '@/types'
import { fotoDeModelo, MODELOS_ORIGINALES } from '@/data/fotosCatalogo'

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
 * Productos de prueba. Mientras la tienda esté sin conexión al servidor (modo local), este es el catálogo.
 * Son los 31 modelos de la página anterior, con sus fotos y precios.
 */
export const MOCK_PRODUCTOS: Producto[] = [
  ...MODELOS_ORIGINALES.map<Producto>((m, i) => ({
    id: i + 1,
    nombre: m.nombre,
    marca: m.marca,
    categoria: m.categoria,
    precio: m.precio,
    imagenes: [fotoDeModelo(m.nombre)],
    descripcion: '',
    stock: stockDe(i + 1),
  })),

  // Con las fotos reales del negocio (3 vistas por modelo). Los precios son de ejemplo.
  ...(
    [
      { nombre: 'New Balance 530 Silver', marca: 'New Balance', categoria: 'running', precio: 64900, fotos: ['nb530', 'nb530-detalle', 'nb530-suela'] },
      { nombre: 'Nike Dunk Low Crema', marca: 'Nike', categoria: 'urbanas', precio: 61900, fotos: ['dunk', 'dunk-detalle', 'dunk-talon'] },
      { nombre: 'Adidas Samba Verde', marca: 'Adidas', categoria: 'urbanas', precio: 58900, fotos: ['samba-verde', 'samba-lateral', 'samba-detalle'] },
      { nombre: 'New Balance 740 Bordó', marca: 'New Balance', categoria: 'running', precio: 66900, fotos: ['nb740', 'nb740-detalle', 'nb740-suela'] },
    ] as const
  ).map<Producto>((m, i) => ({
    id: MODELOS_ORIGINALES.length + i + 1,
    nombre: m.nombre,
    marca: m.marca,
    categoria: m.categoria,
    precio: m.precio,
    imagenes: m.fotos.map((f) => `/fotos/negocio/${f}.jpg`),
    descripcion: '',
    stock: stockDe(MODELOS_ORIGINALES.length + i + 1),
    nuevo: true,
  })),
]
