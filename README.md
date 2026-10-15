# Boom Zapas · Web

Tienda online de Boom Zapas. **React 18 + Vite + TypeScript + Tailwind CSS 4 + Framer Motion.**
Diseño: tienda clara con tarjetas redondeadas, Lexend Exa + Lexend y color de acento (ver "Diseño actual" abajo).
El servidor son **funciones de Vercel** (`/api`) que hablan con **Supabase** y **Mercado Pago**. Ya no se usa Railway.

## Empezar

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

| Comando             | Qué hace                                  |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                    |
| `npm run build`     | Chequea tipos y genera `dist/`            |
| `npm run typecheck` | Sólo chequeo de TypeScript                |
| `npm run preview`   | Sirve el build localmente                 |

**Variables de entorno:** mirá `.env.example`. Resumen:

- `VITE_CONECTAR_API`: `false` (por defecto) = la tienda funciona **sin servidor ni base de datos** (catálogo local, pedidos por WhatsApp y panel con datos en el navegador). `true` = usa la API de Vercel.
- Del lado servidor (se cargan en Vercel, nunca en el código): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_TOKEN`, `MP_ACCESS_TOKEN` y, opcionalmente, `MP_WEBHOOK_SECRET` y `SITE_URL`.

## Deploy en Vercel

- Framework: Vite. Build command `npm run build`, output `dist` (Vercel lo detecta solo).
- La carpeta `api/` se despliega sola como funciones; `vercel.json` hace que las rutas de la tienda (`/catalogo`, `/admin`…) funcionen al recargar sin pisar `/api`.
- Para probar las funciones en tu PC: `npx vercel dev` (necesita las variables de entorno; `npm run dev` sólo levanta la tienda).

### Conectar todo (paso a paso)

1. **Supabase:** en el *SQL Editor* ejecutá `supabase/resenas.sql` (crea la tabla de reseñas). Las tablas `productos`, `stock`, `clientes`, `pedidos` y `pedido_items` ya existen.
2. **Vercel → Settings → Environment Variables:** cargá `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_TOKEN` y `MP_ACCESS_TOKEN`. Por último `VITE_CONECTAR_API=true`.
3. **Redeploy** (Deployments → ⋯ → Redeploy) para que tome las variables.
4. **Mercado Pago → Tus integraciones → Webhooks:** URL `https://TU-SITIO.vercel.app/api/mp/webhook`, evento *Pagos*. Si te da una clave secreta, cargala como `MP_WEBHOOK_SECRET`.
5. Probá una compra con una cuenta de prueba de Mercado Pago antes de usar credenciales reales.

### Qué hace la API (`api/`)

| Ruta | Qué hace |
| ---- | -------- |
| `GET /api/productos` | Catálogo activo con stock |
| `POST /api/pedido` | Crea el pedido. Lee **precios y stock de la base** (no del navegador), reserva el stock y, si el pago es con Mercado Pago, devuelve el link de Checkout Pro |
| `POST /api/mp/webhook` | Mercado Pago avisa el pago; se consulta su estado real y el pedido pasa a `pagado` |
| `POST /api/resenas` | Guarda una reseña pendiente de aprobación |
| `/api/admin/*` | Panel: stats, pedidos, cambio de estado (al cancelar devuelve el stock), stock por talle y reseñas. Requieren el encabezado `x-admin-token` |

## Estructura

```
src/
├── config/site.ts          ← datos del negocio (WhatsApp, alias, horarios, descuento…)
├── types/                  ← tipos compartidos
├── lib/
│   ├── api.ts              ← cliente de la API (tienda + admin)
│   ├── normalize.ts        ← adapta filas de Supabase al tipo Producto
│   ├── whatsapp.ts         ← links y mensajes de WhatsApp
│   ├── stock.ts, format.ts
├── context/                ← Cart (carrito persistente), UI (drawers/toasts), Products (catálogo)
├── components/
│   ├── layout/             ← Navbar, Footer, WhatsAppFab, Toaster…
│   ├── home/               ← Hero (slideshow), InfoStrip, FeaturedProducts, Testimonials
│   ├── catalog/            ← ProductCard, ProductDialog, ProductGrid, CatalogFilters
│   ├── cart/               ← CartDrawer
│   ├── checkout/           ← CheckoutModal (datos → pago → listo)
│   ├── admin/              ← Panel: Resumen, Pedidos, Productos y stock, Clientes, Reseñas, Herramientas
│   └── ui/                 ← Button, Modal, Icon, Logo, Reveal…
└── pages/                  ← Home, Catálogo, Envíos, Pagos, Nosotros, Contacto, Admin, Resultado de pago
api/                        ← funciones de Vercel (Supabase + Mercado Pago)
supabase/                   ← SQL para ejecutar en Supabase
```

## Qué cambió respecto a la versión anterior

- Todo el sitio (antes un único `index.html` de ~4 MB) pasó a **componentes tipados** y carga por rutas.
- Las fotos de productos ya no van en base64 dentro del código: vienen de la API (`imagenes` / `fotos` / `imagen`).
  Subí las fotos a Supabase Storage (o a `public/`) y guardá las URLs en la tabla `productos`.
- Filtros y búsqueda viven en la URL (`/catalogo?cat=running&q=nike`): se pueden compartir.
- Carrito persistente, con límite por stock de cada talle.
- Admin en React en `/admin` (token en `sessionStorage`; ya no hay un `admin.html` suelto).
- Tipografías Lexend y Lexend Exa incluidas en el proyecto (sin depender de Google Fonts), accesibilidad (foco, teclado, `aria`) y `prefers-reduced-motion`.
- **Se eliminó el formulario de tarjeta** (número y CVV): no se deben pedir datos de tarjeta en la web propia. Los medios son Mercado Pago, transferencia y WhatsApp.

## Pendientes / ajustes

1. **Logo:** el sello vive en `public/logo.png`; se muestra desde `src/components/ui/Logo.tsx`.
2. **Reseñas:** `src/data/testimonials.ts` tiene un resumen de las reseñas reales; reemplazá por el texto exacto.
3. **Columnas de Supabase:** si `productos` usa nombres distintos (`marca`, `categoria`, `imagenes`…), ajustá `src/lib/normalize.ts`.
4. **Estados de pedido** en el panel: pendiente, pagado, enviado, entregado, cancelado.
5. **Reseñas en el panel y en la tienda con la base conectada:** la API ya las guarda y modera (`/api/resenas`, `/api/admin/resenas`); falta mostrar las aprobadas en la tienda y moderarlas desde el panel cuando `VITE_CONECTAR_API=true`.

## Estados y fotos

- Cada producto muestra un único estado en texto: NUEVO (campo `nuevo` o alta de menos de 30 días), ÚLTIMOS PARES (3 pares o menos en total) o AGOTADO.
- Las fotos de portada y de los modelos de prueba están en `public/fotos/`. Los productos reales toman sus fotos de la columna `imagenes` de Supabase (subilas a Supabase Storage y guardá las URLs).
- Sin foto, o si la imagen falla, se muestra una silueta gris de zapatilla. La portada (`Hero.tsx`) muestra tres fotos del catálogo por diapositiva.
- Filtros del catálogo (talle, precio, categoría, marca, orden) viven en la URL.

## Mercado Pago

Ya integrado con **Checkout Pro**: al elegir "Mercado Pago" en el checkout, `POST /api/pedido` crea el pedido y la preferencia de pago,
y la tienda lleva al cliente a Mercado Pago. Al volver cae en `/pago/exito`, `/pago/pendiente` o `/pago/error`; el pedido pasa a
`pagado` por el **webhook** (`/api/mp/webhook`), que verifica el pago consultándolo a Mercado Pago y comprueba el monto.
Si Mercado Pago no está configurado, la tienda ofrece cerrar el pedido por WhatsApp como hasta ahora.

## Diseño actual

Estilo de tienda claro (inspirado en bunkkerzapas.com): fondo hueso, tarjetas blancas redondeadas, títulos en **Lexend Exa**
y texto en **Lexend** (autoalojadas con `@fontsource-variable`), barra de avisos arriba, portada con titular y tres fotos,
tarjetas de servicio, marcas, "Nuevos ingresos", "Comprá por estilo" y pie en color de acento.

- **Color**: tema `claro` (acento azul del logo) por defecto. Probá `?tema=claro | verde | oscuro` en la URL (se recuerda en
  el navegador) o el selector "Color" del pie. Las paletas están en `src/index.css` (bloques `:root[data-theme=…]`); el
  tema por defecto se define en `:root` y en el script de `index.html`.
- **Logo**: `public/logo.png` (sello circular recortado del logo original).
- **Fotos de la página anterior**: `public/fotos/catalogo/*.jpg` (31 modelos). `src/data/fotosCatalogo.ts` las asocia por
  nombre; si un producto de la base viene sin imagen, `normalize.ts` busca ahí su foto. A futuro, lo ideal es subirlas a
  Supabase Storage y guardar la URL en `productos.imagenes`.
- **Páginas**: `/como-comprar` (pasos y preguntas frecuentes) y `/guia-de-talles`.
