/** Fotos reales del negocio (1100×1467, par flotando sobre fondo claro). */
export interface Foto {
  src: string
  alt: string
}

const f = (name: string, alt: string): Foto => ({ src: `/fotos/negocio/${name}.jpg`, alt })

export const FOTOS = {
  nb530: f('nb530', 'New Balance 530 blanca y plateada'),
  nb530Detalle: f('nb530-detalle', 'Detalle de la New Balance 530: malla blanca y paneles plateados'),
  nb530Suela: f('nb530-suela', 'Suela y amortiguación de la New Balance 530'),
  nb740: f('nb740', 'New Balance 740 blanca, beige y bordó'),
  nb740Detalle: f('nb740-detalle', 'Detalle de la New Balance 740 en bordó y cobre'),
  nb740Suela: f('nb740-suela', 'Talón y suela de la New Balance 740'),
  dunk: f('dunk', 'Zapatilla estilo Dunk low color crema'),
  dunkDetalle: f('dunk-detalle', 'Detalle de la Dunk low crema: cuero y cordones blancos'),
  dunkTalon: f('dunk-talon', 'Talón y suela de la Dunk low crema'),
  samba: f('samba-verde', 'Adidas Samba blanca con tres tiras verdes'),
  sambaLateral: f('samba-lateral', 'Adidas Samba vista lateral con suela de goma'),
  sambaDetalle: f('samba-detalle', 'Detalle de las tres tiras verdes de la Adidas Samba'),
} as const
