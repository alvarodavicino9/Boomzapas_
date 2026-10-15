import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { ProductImage } from './ProductImage'
import { SizeChartDialog } from './SizeChartDialog'
import { useCart } from '@/context/CartContext'
import { useProductos } from '@/context/ProductsContext'
import { useUI } from '@/context/UIContext'
import { SITE } from '@/config/site'
import { detallesDe } from '@/data/detalles'
import { cn, formatARS, transferPrice } from '@/lib/format'
import { getTalles, isSoldOut } from '@/lib/stock'
import { getStatus } from '@/lib/status'
import { waLink } from '@/lib/whatsapp'
import type { Producto } from '@/types'

interface ProductDialogProps {
  producto: Producto | null
  onClose: () => void
  /** Cambia el producto abierto (para los "también te puede gustar"). */
  onSelect?: (p: Producto) => void
}

type Tab = 'descripcion' | 'caracteristicas' | 'envio'

const TABS: { id: Tab; label: string }[] = [
  { id: 'descripcion', label: 'Descripción' },
  { id: 'caracteristicas', label: 'Características' },
  { id: 'envio', label: 'Envío y pago' },
]

const GARANTIAS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'truck', title: 'Envío a todo el país', text: 'Correo Argentino, con seguimiento' },
  { icon: 'store', title: 'Retiro sin costo', text: SITE.address },
  { icon: 'shield', title: 'Fotos reales', text: 'Pedinos las del par exacto' },
]

export function ProductDialog({ producto, onClose, onSelect }: ProductDialogProps) {
  const [talle, setTalle] = useState<string | null>(null)
  const [photo, setPhoto] = useState(0)
  const [showError, setShowError] = useState(false)
  const [tab, setTab] = useState<Tab>('descripcion')
  const [origin, setOrigin] = useState<string | null>(null)
  const [tablaOpen, setTablaOpen] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const { add } = useCart()
  const { productos } = useProductos()
  const { toast, openCart } = useUI()

  // Mantiene el último producto mientras corre la animación de salida.
  const [shown, setShown] = useState<Producto | null>(producto)
  useEffect(() => {
    if (producto) {
      setShown(producto)
      setTalle(null)
      setPhoto(0)
      setShowError(false)
      setTab('descripcion')
    } else {
      setTablaOpen(false)
    }
  }, [producto])

  const p = shown
  const relacionados = useMemo(() => {
    if (!p) return []
    const score = (o: Producto) => (o.marca === p.marca ? 2 : 0) + (o.categoria === p.categoria ? 1 : 0)
    return productos
      .filter((o) => o.id !== p.id && !isSoldOut(o))
      .sort((a, b) => score(b) - score(a) || Math.abs(a.precio - p.precio) - Math.abs(b.precio - p.precio))
      .slice(0, 4)
  }, [productos, p])

  if (!p) return null

  const talles = getTalles(p)
  const soldOut = isSoldOut(p)
  const status = getStatus(p)
  const selected = talles.find((t) => t.talle === talle)
  const info = detallesDe(
    p,
    talles.map((t) => t.talle),
  )
  const disponibles = talles.filter((t) => t.cantidad > 0).length
  const ahorro = p.precio - transferPrice(p.precio)

  const requireTalle = () => {
    if (!selected) {
      setShowError(true)
      return false
    }
    return true
  }

  const handleAdd = () => {
    if (!requireTalle() || !selected) return
    add({
      productoId: p.id,
      nombre: p.nombre,
      marca: p.marca,
      precio: p.precio,
      imagen: p.imagenes[0],
      talle: selected.talle,
      max: selected.cantidad,
    })
    toast(`${p.nombre} · Talle ${selected.talle} sumado al pedido`)
    onClose()
    openCart()
  }

  const handleWhatsApp = () => {
    window.open(
      waLink(
        selected
          ? `Hola Boom Zapas. Quiero consultar por: ${p.nombre} · Talle ${selected.talle} (${formatARS(p.precio)}).`
          : `Hola Boom Zapas. Quiero consultar por: ${p.nombre} (${formatARS(p.precio)}). ¿Qué talles tienen?`,
      ),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const openRelated = (o: Producto) => {
    onSelect?.(o)
    topRef.current?.scrollIntoView({ block: 'start' })
  }

  return (
    <>
    <Modal open={!!producto} onClose={onClose} title={p.nombre} size="xl" hideTitle>
      <div ref={topRef} />
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        {/* Galería */}
        <div className="bg-stage lg:sticky lg:top-0 lg:self-start">
          <div
            className="group relative overflow-hidden"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
            }}
            onMouseLeave={() => setOrigin(null)}
            style={{ '--zo': origin ?? '50% 50%' } as React.CSSProperties}
          >
            <ProductImage
              src={p.imagenes[photo]}
              alt={p.nombre}
              className="aspect-[4/3] size-full transition-transform duration-300 ease-out md:aspect-square lg:aspect-[4/5] [transform-origin:var(--zo)] lg:group-hover:scale-[1.8] motion-reduce:transition-none"
              eager
            />
            {status && (
              <span className="label absolute left-4 top-4 rounded-full bg-accent px-3.5 py-1.5 text-[10px] font-bold text-on-accent">
                {status}
              </span>
            )}
            <span className="label pointer-events-none absolute bottom-4 left-4 hidden rounded-full bg-black/55 px-3 py-1.5 text-[10px] text-white backdrop-blur lg:group-hover:hidden lg:block">
              Pasá el mouse para ampliar
            </span>
          </div>
          {p.imagenes.length > 1 && (
            <ul className="flex gap-px overflow-x-auto bg-line">
              {p.imagenes.map((src, i) => (
                <li key={src.slice(-40) + i} className="shrink-0">
                  <button
                    onClick={() => setPhoto(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    aria-current={i === photo}
                    className={cn('block size-20 bg-stage', i === photo ? 'opacity-100' : 'opacity-50 hover:opacity-100')}
                  >
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detalle */}
        <div className="flex flex-col px-5 pb-8 pt-8 sm:px-8 lg:pt-14">
          <p className="label text-index">
            {p.marca} · <span className="capitalize">{p.categoria}</span>
          </p>
          <h3 className="display-section mt-3 !text-[clamp(1.5rem,3vw,2.2rem)]">{p.nombre}</h3>

          <div className="mt-6 rounded-2xl border border-line bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-[28px] font-bold leading-none">{formatARS(p.precio)}</p>
              <p className="label text-index">Precio lista</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-[14px]">
                <span className="text-[20px] font-bold text-accent">{formatARS(transferPrice(p.precio))}</span>{' '}
                <span className="text-index">con transferencia o efectivo</span>
              </p>
              <span className="label shrink-0 rounded-full bg-accent px-3 py-1 text-[10px] font-bold text-on-accent">
                Ahorrás {formatARS(ahorro)}
              </span>
            </div>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {info.destacados.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-[13.5px] leading-5">
                <Icon name="check" size={16} className="mt-0.5 shrink-0 text-accent" />
                {d}
              </li>
            ))}
          </ul>

          <fieldset className="mt-8" disabled={soldOut}>
            <legend className="mb-3 flex w-full items-center justify-between">
              <span className="label">Talle (AR)</span>
              <span className="flex items-center gap-4">
                {showError && !selected && (
                  <span role="alert" className="label text-danger">
                    Elegí un talle
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setTablaOpen(true)}
                  aria-haspopup="dialog"
                  className="label link-u text-index hover:text-ink"
                >
                  Tabla de talles
                </button>
              </span>
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Talle">
              {talles.map((t) => {
                const out = t.cantidad <= 0
                const active = t.talle === talle
                return (
                  <button
                    key={t.talle}
                    role="radio"
                    aria-checked={active}
                    disabled={out}
                    onClick={() => {
                      setTalle(t.talle)
                      setShowError(false)
                    }}
                    title={out ? 'Sin stock' : undefined}
                    className="chip"
                  >
                    {t.talle}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-[12.5px] leading-4 text-index" aria-live="polite">
              {selected
                ? selected.cantidad <= 2
                  ? `${selected.cantidad === 1 ? 'Queda 1 par' : `Quedan ${selected.cantidad} pares`} en talle ${selected.talle}`
                  : `Talle ${selected.talle} disponible`
                : soldOut
                  ? 'Este modelo está agotado por ahora.'
                  : `${disponibles} ${disponibles === 1 ? 'talle disponible' : 'talles disponibles'}. Los tachados están agotados.`}
            </p>
          </fieldset>

          <div className="grid gap-3 pt-8">
            <Button size="lg" full onClick={handleAdd} disabled={soldOut}>
              {soldOut ? 'Agotado' : 'Sumar al pedido'}
            </Button>
            <Button variant="outline" full onClick={handleWhatsApp}>
              <Icon name="whatsapp" size={18} />
              Consultar por WhatsApp
            </Button>
          </div>

          <ul className="mt-8 divide-y divide-line border-y border-line">
            {GARANTIAS.map((g) => (
              <li key={g.title} className="flex items-center gap-4 py-3.5">
                <Icon name={g.icon} size={22} className="shrink-0 text-accent" />
                <p className="text-[13.5px] leading-5">
                  <span className="font-semibold">{g.title}</span>
                  <span className="text-index"> · {g.text}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Información ampliada */}
      <div className="border-t border-line px-5 py-10 sm:px-8 lg:px-12">
        <div role="tablist" aria-label="Información del producto" className="flex gap-1 overflow-x-auto border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                'label -mb-px shrink-0 border-b-2 px-4 py-3.5 transition-colors',
                tab === t.id ? 'border-accent text-ink' : 'border-transparent text-index hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-8">
          {tab === 'descripcion' && (
            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="max-w-2xl text-[15px] leading-7">{info.descripcion}</p>
                <p className="body-text mt-5 max-w-2xl">
                  ¿Dudas con el talle o querés ver más fotos del par? Escribinos por WhatsApp y te mandamos fotos reales del modelo que vas a recibir.
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                {[
                  ['Marca', p.marca],
                  ['Color', info.caracteristicas[2].value],
                  ['Corte', info.caracteristicas[5].value],
                  ['Estilo', info.caracteristicas[4].value],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-line bg-card p-4">
                    <dt className="label text-index">{k}</dt>
                    <dd className="mt-1 text-[14px] font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {tab === 'caracteristicas' && (
            <dl className="grid gap-x-12 md:grid-cols-2">
              {info.caracteristicas.map((c) => (
                <div key={c.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                  <dt className="label text-index">{c.label}</dt>
                  <dd className="text-right text-[14px] font-medium">{c.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === 'envio' && (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: 'truck' as const,
                  title: 'Envío',
                  text: 'A todo el país por Correo Argentino, con código de seguimiento. Despachamos dentro de las 24 a 48 hs hábiles posteriores al pago y llega en 3 a 7 días.',
                  to: '/envios',
                },
                {
                  icon: 'store' as const,
                  title: 'Retiro en tienda',
                  text: `Sin costo, en ${SITE.address}. Coordinamos el horario por WhatsApp.`,
                  to: '/envios',
                },
                {
                  icon: 'card' as const,
                  title: 'Medios de pago',
                  text: `Mercado Pago, tarjetas, QR y transferencia. Pagando por transferencia o en efectivo tenés ${formatARS(SITE.transferDiscount)} de descuento por par.`,
                  to: '/pagos',
                },
              ].map((b) => (
                <div key={b.title} className="surface p-6">
                  <Icon name={b.icon} size={26} className="text-accent" />
                  <h4 className="display-product mt-4 !text-[1.15rem]">{b.title}</h4>
                  <p className="body-text mt-2">{b.text}</p>
                  <Link to={b.to} onClick={onClose} className="label link-u mt-4 inline-block text-accent">
                    Ver más
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* También te puede gustar */}
      {relacionados.length > 0 && onSelect && (
        <div className="border-t border-line bg-stage/40 px-5 py-10 sm:px-8 lg:px-12">
          <h4 className="display-section mb-6 !text-[1.3rem]">También te puede gustar</h4>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relacionados.map((o) => (
              <li key={o.id}>
                <button onClick={() => openRelated(o)} className="group block w-full text-left">
                  <ProductImage
                    src={o.imagenes[0]}
                    alt={o.nombre}
                    className="aspect-[4/5] w-full rounded-xl transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <p className="label mt-3 text-index">{o.marca}</p>
                  <p className="mt-1 text-[13.5px] font-semibold leading-snug">{o.nombre}</p>
                  <p className="mt-1 text-[13px] text-index">{formatARS(o.precio)}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
    <SizeChartDialog open={tablaOpen} onClose={() => setTablaOpen(false)} />
    </>
  )
}
