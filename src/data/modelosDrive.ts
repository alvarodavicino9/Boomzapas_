/**
 * Modelos con fotos de estudio (carpeta "BOOM ZAPAS - Fotos página web" de Drive).
 * Cada modelo tiene su carpeta en /public/fotos/modelos/<carpeta>/ con las fotos numeradas 1.jpg, 2.jpg…
 * La 1 es la foto principal (zapatilla entera de costado); el resto son detalles.
 * Todas están en 1100 × 1467 (3:4), igual que las primeras fotos reales del negocio.
 *
 * Para sumar un modelo: copiá sus fotos a una carpeta nueva con ese formato y agregá una línea acá.
 * Los precios son de referencia; se ajustan desde el panel (Productos).
 */
export interface ModeloDrive {
  nombre: string
  marca: string
  categoria: 'urbanas' | 'running' | 'lifestyle'
  precio: number
  carpeta: string
  /** Cantidad de fotos en la carpeta. */
  fotos: number
}

export const MODELOS_DRIVE: ModeloDrive[] = [
  // Ordenados de más viejo a más nuevo según la fecha de las carpetas en Drive:
  // el catálogo muestra primero los últimos ingresos (los de id más alto).
  // Vans
  { nombre: 'Vans Hyline Clásicas', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-hyline-clasicas', fotos: 5 },
  { nombre: 'Vans Hyline Grafito', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-hyline-grafito', fotos: 4 },
  { nombre: 'Vans Hyline Semi Total Black', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-hyline-semi-total-black', fotos: 4 },
  { nombre: 'Vans Hyline White', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-hyline-white', fotos: 3 },
  { nombre: 'Vans Knu Black and White', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-knu-black-and-white', fotos: 3 },
  { nombre: 'Vans Knu Clásicas', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-knu-clasicas', fotos: 4 },
  { nombre: 'Vans Knu Gum Blue', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-knu-gum-blue', fotos: 5 },
  { nombre: 'Vans Knu Semi Total Black', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-knu-semi-total-black', fotos: 4 },
  { nombre: 'Vans Knu Total Black', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-knu-total-black', fotos: 4 },
  { nombre: 'Vans Knu Total White', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-knu-total-white', fotos: 4 },
  { nombre: 'Vans Upland Clásica', marca: 'Vans', categoria: 'urbanas', precio: 59000, carpeta: 'vans-upland-clasica', fotos: 5 },
  // Puma
  { nombre: 'Puma 180 Total Black', marca: 'Puma', categoria: 'urbanas', precio: 59900, carpeta: 'puma-180-total-black', fotos: 2 },
  // Jordan (en Drive están dentro de NIKE; acá van como Jordan para que funcione el filtro y el logo de la marca)
  { nombre: 'Nike Air Jordan 1 Low Phantom x Travis Scott', marca: 'Jordan', categoria: 'lifestyle', precio: 63000, carpeta: 'nike-air-jordan-1-low-phantom-x-travis-scott', fotos: 4 },
  { nombre: 'Nike Air Jordan 1 Low x Travis Scott Grey Cream', marca: 'Jordan', categoria: 'lifestyle', precio: 63000, carpeta: 'nike-air-jordan-1-low-x-travis-scott-grey-cream', fotos: 4 },
  { nombre: 'Nike Air Jordan 1 Mocca x Travis', marca: 'Jordan', categoria: 'lifestyle', precio: 63000, carpeta: 'nike-air-jordan-1-mocca-x-travis', fotos: 4 },
  // Nike
  { nombre: 'Nike Air Force One', marca: 'Nike', categoria: 'urbanas', precio: 57500, carpeta: 'nike-air-force-one', fotos: 4 },
  { nombre: 'Nike Blazer Mid 77 Classic Black', marca: 'Nike', categoria: 'lifestyle', precio: 61900, carpeta: 'nike-blazer-mid-77-classic-black', fotos: 4 },
  { nombre: 'Nike Blazer Mid 77 Rosa', marca: 'Nike', categoria: 'lifestyle', precio: 61900, carpeta: 'nike-blazer-mid-77-rosa', fotos: 3 },
  { nombre: 'Nike Blazer Mid 77 Total Black', marca: 'Nike', categoria: 'lifestyle', precio: 61900, carpeta: 'nike-blazer-mid-77-total-black', fotos: 4 },
  { nombre: 'Nike Blazer Mid 77 Vintage', marca: 'Nike', categoria: 'lifestyle', precio: 61900, carpeta: 'nike-blazer-mid-77-vintage', fotos: 4 },
  { nombre: 'Nike Dunk Paisley Rosa', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-dunk-paisley-rosa', fotos: 3 },
  { nombre: 'Nike Dunk SB Teddy Bear Rosa', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-dunk-sb-teddy-bear-rosa', fotos: 4 },
  { nombre: 'Nike SB Dunk Bordeaux', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-bordeaux', fotos: 3 },
  { nombre: 'Nike SB Dunk Chocolate', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-chocolate', fotos: 4 },
  { nombre: 'Nike SB Dunk Cream Pink', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-cream-pink', fotos: 4 },
  { nombre: 'Nike SB Dunk Grises', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-grises', fotos: 5 },
  { nombre: 'Nike SB Dunk LA', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-la', fotos: 4 },
  { nombre: 'Nike SB Dunk Low Grey Panda', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-low-grey-panda', fotos: 4 },
  { nombre: 'Nike SB Dunk Panda', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-panda', fotos: 5 },
  { nombre: 'Nike SB Dunk Purple', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-purple', fotos: 4 },
  { nombre: 'Nike SB Dunk Semi Total Black', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-semi-total-black', fotos: 4 },
  { nombre: 'Nike SB Dunk Teddy Bear Black', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-teddy-bear-black', fotos: 4 },
  { nombre: 'Nike SB Dunk Total Black', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-total-black', fotos: 5 },
  { nombre: 'Nike SB Dunk Total White', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-total-white', fotos: 3 },
  { nombre: 'Nike SB Dunk White Navy Pro', marca: 'Nike', categoria: 'urbanas', precio: 60800, carpeta: 'nike-sb-dunk-white-navy-pro', fotos: 5 },
  // New Balance
  { nombre: 'New Balance 530 Cloud Grey', marca: 'New Balance', categoria: 'running', precio: 64900, carpeta: 'new-balance-530-cloud-grey', fotos: 3 },
  { nombre: 'New Balance 530 Cloud White', marca: 'New Balance', categoria: 'running', precio: 64900, carpeta: 'new-balance-530-cloud-white', fotos: 5 },
  { nombre: 'New Balance 530 Platino', marca: 'New Balance', categoria: 'running', precio: 64900, carpeta: 'new-balance-530-platino', fotos: 4 },
  // Adidas
  { nombre: 'Adidas ADI2000 Total Black', marca: 'Adidas', categoria: 'urbanas', precio: 59900, carpeta: 'adidas-adi2000-total-black', fotos: 1 },
  { nombre: 'Adidas ADI2000 Total White', marca: 'Adidas', categoria: 'urbanas', precio: 59900, carpeta: 'adidas-adi2000-total-white', fotos: 1 },
  { nombre: 'Adidas Adizero Evo SL Pink', marca: 'Adidas', categoria: 'running', precio: 62900, carpeta: 'adidas-adizero-evo-sl-pink', fotos: 1 },
  { nombre: 'Adidas Adizero Evo SL Semi Total Black', marca: 'Adidas', categoria: 'running', precio: 62900, carpeta: 'adidas-adizero-evo-sl-semi-total-black', fotos: 1 },
  { nombre: 'Adidas Forum 84 Low Silver Grey', marca: 'Adidas', categoria: 'urbanas', precio: 60400, carpeta: 'adidas-forum-84-low-silver-grey', fotos: 1 },
  { nombre: 'Adidas Forum 84 Low White and Grey', marca: 'Adidas', categoria: 'urbanas', precio: 60400, carpeta: 'adidas-forum-84-low-white-and-grey', fotos: 1 },
  { nombre: 'Adidas Forum Clásicas', marca: 'Adidas', categoria: 'urbanas', precio: 60400, carpeta: 'adidas-forum-clasicas', fotos: 1 },
  { nombre: 'Adidas Forum Total White', marca: 'Adidas', categoria: 'urbanas', precio: 60400, carpeta: 'adidas-forum-total-white', fotos: 1 },
  { nombre: 'Adidas Gazelle Total White', marca: 'Adidas', categoria: 'urbanas', precio: 57700, carpeta: 'adidas-gazzelle-total-white', fotos: 1 },
  { nombre: 'Adidas Samba Chocolate', marca: 'Adidas', categoria: 'urbanas', precio: 57700, carpeta: 'adidas-samba-chocolate', fotos: 1 },
  { nombre: 'Adidas Samba Clásicas', marca: 'Adidas', categoria: 'urbanas', precio: 57700, carpeta: 'adidas-samba-clasicas', fotos: 1 },
  { nombre: 'Adidas Samba Ice', marca: 'Adidas', categoria: 'urbanas', precio: 57700, carpeta: 'adidas-samba-ice', fotos: 1 },
  { nombre: 'Adidas Samba Ice Pink', marca: 'Adidas', categoria: 'urbanas', precio: 57700, carpeta: 'adidas-samba-ice-pink', fotos: 1 },
  { nombre: 'Adidas Samba Semi Total Black', marca: 'Adidas', categoria: 'urbanas', precio: 57700, carpeta: 'adidas-samba-semi-total-black', fotos: 1 },
  { nombre: 'Adidas Samba Verdes', marca: 'Adidas', categoria: 'urbanas', precio: 57700, carpeta: 'adidas-samba-verdes', fotos: 3 },
  { nombre: 'Adidas Adizero Duramo Black', marca: 'Adidas', categoria: 'running', precio: 62900, carpeta: 'adidas-adizero-duramo-black', fotos: 1 },
  { nombre: 'Adidas Adizero Duramo Pink', marca: 'Adidas', categoria: 'running', precio: 62900, carpeta: 'adidas-adizero-duramo-pink', fotos: 1 },
]

export const fotosDeModelo = (m: ModeloDrive): string[] =>
  Array.from({ length: m.fotos }, (_, i) => `/fotos/modelos/${m.carpeta}/${i + 1}.jpg`)

/** Modelos con fotos de estudio que no están en la carpeta de Drive (primeras fotos del negocio). */
export const OTROS_MODELOS = [
  {
    nombre: 'New Balance 740 Bordó',
    marca: 'New Balance',
    categoria: 'running' as const,
    precio: 66900,
    imagenes: ['nb740', 'nb740-detalle', 'nb740-suela'].map((f) => `/fotos/negocio/${f}.jpg`),
  },
]
