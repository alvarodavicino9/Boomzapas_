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
    cbu: '0000168300000000314790',
    bank: 'Lemon',
  },

  /** Promo: llevando 2 pares o más, $5.000 de descuento por cada par (con cualquier medio de pago). */
  promoPares: { minimo: 2, descuento: 5000 },

  /**
   * Cuotas con tarjeta por Mercado Pago (link de pago): cuánto paga de más el cliente en cada plan
   * para que la tienda reciba el precio completo (ya incluye el costo de las cuotas, la comisión de Mercado Pago y el IVA).
   * Sale del simulador de Mercado Pago (link de pago, acreditación a 10 días), para recibir $ 65.900:
   *   2 cuotas (7,79 %)  → el cliente paga $ 77.398,20 → +17,448 %
   *   3 cuotas (10,49 %) → el cliente paga $ 80.486,49 → +22,1343 %
   *   6 cuotas (18,69 %) → el cliente paga $ 91.584,89 → +38,9756 %
   * Si Mercado Pago cambia sus tasas: simulá de nuevo y poné acá (lo que paga el cliente ÷ lo que recibís − 1) × 100.
   */
  cuotasMercadoPago: [
    { cuotas: 2, recargo: 17.448 },
    { cuotas: 3, recargo: 22.1343 },
    { cuotas: 6, recargo: 38.9756 },
  ],

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
