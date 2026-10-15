/**
 * ⚠️ Reseñas de clientes reales de la página anterior.
 * Los textos de acá son un resumen de lo que decían: reemplazalos por el texto
 * exacto de cada reseña antes de publicar.
 */
export interface Testimonial {
  user: string
  text: string
  model?: string
  /** 1 a 5. Dejalo vacío si la reseña original no tenía puntaje. */
  rating?: number
}

export const TESTIMONIALS: Testimonial[] = [
  { user: '@sofi.romero92', model: 'Jordan Low', text: 'Las zapatillas llegaron idénticas a las fotos. Muy conforme con la compra.' },
  { user: '@juanma_skate', model: 'Adidas Samba', text: 'El envío fue rapidísimo y siempre me respondieron al instante.' },
  { user: '@belu.streetwear', text: 'Comunicación clara en todo el proceso. Ya es mi tercera compra acá.' },
  { user: '@tomas.cba', text: 'Atención de primera y las zapatillas impecables. Totalmente recomendable.' },
]
