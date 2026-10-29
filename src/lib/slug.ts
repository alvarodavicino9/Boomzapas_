/** Convierte un nombre en un texto apto para direcciones: "Adidas Samba Clásicas" → "adidas-samba-clasicas". */
export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Dirección propia de cada zapatilla: /zapatilla/nike-sb-dunk-panda */
export const rutaProducto = (p: { nombre: string }) => `/zapatilla/${slugify(p.nombre)}`
