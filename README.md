# Boom Zapas · Web

Tienda online de Boom Zapas. **React 18 + Vite + TypeScript + Tailwind CSS 4 + Framer Motion.**
Diseño: tienda clara con tarjetas redondeadas, Lexend Exa + Lexend y color de acento (ver "Diseño actual" abajo).
Se conecta al backend `boomzapas-server` (Express + Supabase) en Railway.

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

**Variables de entorno** (`.env`):

- `VITE_API_URL`: URL del backend. Por defecto usa la de Railway.
- `VITE_CONECTAR_API`: por defecto `false`: la tienda funciona **sin servidor ni Supabase** (catálogo local y pedidos por WhatsApp). Poné `true` para volver a conectar el backend.

## Deploy en Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- `public/_redirects` ya está configurado para que las rutas (`/catalogo`, `/admin`, …) funcionen al recargar.
- Agregá `VITE_API_URL` en *Site settings → Environment variables* si cambia el backend.

## Estructura

```
src/
├── config/site.ts          ← datos del negocio (WhatsApp, alias, horarios, descuento…)
├── types/                  ← tipos compartidos
├── lib/
│   ├── api.ts              ← cliente del backend (tienda + admin)
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
│   ├── admin/              ← Login, Stats, Orders, Stock
│   └── ui/                 ← Button, Modal, Icon, Logo, Reveal…
└── pages/                  ← Home, Catálogo, Envíos, Pagos, Nosotros, Contacto, Admin
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
   Para `/admin` → Pedidos, `vista_pedidos` debería exponer `cliente_nombre`, `telefono`, `metodo_pago`, `total`, `estado`, `created_at`
   (si usa otros nombres, se ajusta en `OrdersPanel.tsx`).
4. **Estados de pedido** disponibles en admin: pendiente, pagado, enviado, entregado, cancelado.

## Estados y fotos

- Cada producto muestra un único estado en texto: NUEVO (campo `nuevo` o alta de menos de 30 días), ÚLTIMOS PARES (3 pares o menos en total) o AGOTADO.
- Las fotos de portada y de los modelos de prueba están en `public/fotos/`. Los productos reales toman sus fotos de la columna `imagenes` de Supabase (subilas a Supabase Storage y guardá las URLs).
- Sin foto, o si la imagen falla, se muestra una silueta gris de zapatilla. La portada (`Hero.tsx`) muestra tres fotos del catálogo por diapositiva.
- Filtros del catálogo (talle, precio, categoría, marca, orden) viven en la URL.

## Para la integración de Mercado Pago (siguiente paso)

El punto de enganche está marcado con `TODO(Mercado Pago)` en `src/components/checkout/CheckoutModal.tsx`.
Antes de integrarlo, en `boomzapas-server/server.js` conviene:

- **No confiar en los precios que manda el navegador.** Hoy `POST /api/pedido` calcula el total con `precio_unit` del cliente;
  hay que leer el precio desde `productos` en el servidor (y aplicar el descuento por transferencia ahí).
- Validar stock antes de crear el pedido y descontarlo al confirmarse el pago.
- Crear la preferencia de Checkout Pro en el backend (`mercadopago` ya está en las dependencias), devolver su `init_point`
  y redirigir desde el front; confirmar el pago por **webhook** y marcar el pedido como `pagado`.
- Restringir CORS al dominio de Netlify y mover `ADMIN_TOKEN` a una variable de entorno larga (no usar un valor simple).

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
