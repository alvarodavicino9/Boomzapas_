/**
 * Datos del negocio en un solo lugar. Si algo cambia (teléfono, alias, horarios),
 * se edita acá y se actualiza en toda la página.
 */
export const SITE = {
  name: 'Boom Zapas',
  tagline: 'Tu próximo par. Está acá.',
  since: 2024,
  city: 'Córdoba, Argentina',

  whatsapp: '5493491461899',
  whatsappDisplay: '+54 9 3491 46-1899',
  instagram: 'boom.zapass',
  instagramUrl: 'https://www.instagram.com/boom.zapass',
  email: 'valesambrini2002@hotmail.com',

  address: 'Duarte Quirós 477, Córdoba',
  hours: [
    { dias: 'Lunes a viernes', horario: '10:00 a 19:00' },
    { dias: 'Sábados', horario: '10:00 a 14:00' },
  ],

  bank: {
    holder: 'Valentin Sambrini',
    alias: 'valesambrini.lemon',
    cbu: '0000003100088109534086',
    bank: 'Mercado Pago',
  },

  /** Promo: llevando 2 pares o más, $5.000 de descuento por cada par (con cualquier medio de pago). */
  promoPares: { minimo: 2, descuento: 5000 },

  stats: [
    { value: '+500', label: 'Ventas' },
    { value: '+450', label: 'Clientes' },
    { value: '24h', label: 'Respuesta rápida' },
    { value: '4.9★', label: 'Calificación' },
  ],
} as const

export const BRANDS = ['Nike', 'Adidas', 'Puma', 'Vans', 'New Balance'] as const

export const CATEGORIAS = [
  { id: 'todos', label: 'Todos' },
  { id: 'deportivas', label: 'Deportivas' },
  { id: 'urbanas', label: 'Urbanas' },
] as const

/** Todas las zapatillas vienen del 35 al 44. */
export const DEFAULT_TALLES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
