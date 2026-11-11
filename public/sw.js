/*
 * Service worker de Boom Zapas: hace que la página se pueda instalar como app y que abra rápido.
 * - Páginas: siempre se piden a internet primero (así cada cambio publicado se ve al instante);
 *   si no hay conexión, se muestra la última versión guardada.
 * - Fotos, logos y archivos de la página (que nunca cambian de nombre): se guardan y se sirven desde el celular.
 * Para forzar que todos bajen todo de nuevo, cambiá VERSION.
 */
const VERSION = 'bz-v2'
const PAGINAS = `${VERSION}-paginas`
const ARCHIVOS = `${VERSION}-archivos`
const MAX_ARCHIVOS = 250

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== PAGINAS && k !== ARCHIVOS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

const recortar = async () => {
  const c = await caches.open(ARCHIVOS)
  const ks = await c.keys()
  for (let i = 0; i < ks.length - MAX_ARCHIVOS; i++) await c.delete(ks[i])
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone()
          caches.open(PAGINAS).then((c) => c.put('/', copia))
          return res
        })
        .catch(() => caches.match('/').then((r) => r || Response.error())),
    )
    return
  }

  if (/^\/(assets|fotos|marcas)\//.test(url.pathname) || /\.(webp|png|jpg|jpeg|svg|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copia = res.clone()
              caches.open(ARCHIVOS).then((c) => c.put(req, copia).then(recortar))
            }
            return res
          }),
      ),
    )
  }
})
