import { useState } from 'react'
import { ProductImage } from './ProductImage'
import { Icon } from '@/components/ui/Icon'
import { cn, formatARS, transferPrice } from '@/lib/format'
import { SIZES, srcsetWebp } from '@/lib/imagenes'
import { getStatus } from '@/lib/status'
import { getTalles } from '@/lib/stock'
import type { Producto } from '@/types'

interface ProductCardProps {
  producto: Producto
  onOpen: (p: Producto) => void
  /** Cargar la foto ya (primera fila). */
  eager?: boolean
}

/** "38 · 39 · 40" si son pocos, "38 al 44" si son muchos. */
function resumenTalles(t: string[]): string {
  if (t.length === 0) return ''
  const orden = [...t].sort((a, b) => Number(a) - Number(b))
  return orden.length <= 4 ? orden.join(' · ') : `${orden[0]} al ${orden[orden.length - 1]}`
}

const ETIQUETA: Record<string, string> = {
  NUEVO: 'bg-accent text-on-accent',
  'ÚLTIMOS PARES': 'bg-black/85 text-white',
  AGOTADO: 'bg-white/90 text-black',
}

/**
 * Tarjeta de producto: foto, marca, modelo, precio y precio con transferencia.
 * En la compu, al pasar el mouse muestra la segunda foto y los talles disponibles.
 * Toda la tarjeta es un botón que abre la ficha.
 */
export function ProductCard({ producto, onOpen, eager }: ProductCardProps) {
  const status = getStatus(producto)
  const soldOut = status === 'AGOTADO'
  const [first, second] = producto.imagenes
  // La segunda vista se baja recién cuando el mouse se acerca a la tarjeta (no en el celular):
  // así el catálogo carga una sola foto liviana por par.
  const [verSegunda, setVerSegunda] = useState(false)
  const conSegunda = Boolean(second) && !soldOut
  const talles = getTalles(producto)
    .filter((t) => t.cantidad > 0)
    .map((t) => t.talle)

  return (
    <article
      className="group surface overflow-hidden !rounded-[20px] transition-[box-shadow,transform,border-color] duration-300 [contain-intrinsic-size:auto_380px] [content-visibility:auto] hover:-translate-y-1"
      onPointerEnter={conSegunda ? (e) => e.pointerType === 'mouse' && setVerSegunda(true) : undefined}
    >
      <button onClick={() => onOpen(producto)} className="flex h-full w-full flex-col text-left">
        <div className="relative aspect-square w-full overflow-hidden bg-stage sm:aspect-[4/5]">
          <ProductImage
            src={first}
            alt={producto.nombre}
            eager={eager}
            className={cn('size-full transition-transform duration-500 group-hover:scale-[1.04]', soldOut && 'opacity-40')}
          />
          {conSegunda && verSegunda && (
            <img
              src={second}
              srcSet={srcsetWebp(second)}
              sizes={SIZES.tarjeta}
              alt=""
              decoding="async"
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}

          {status && (
            <span
              className={cn(
                'absolute left-2 top-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] sm:left-3 sm:top-3 sm:text-[10px]',
                ETIQUETA[status],
              )}
            >
              {status === 'ÚLTIMOS PARES' && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
              {status}
            </span>
          )}

        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-index sm:text-[11px]">{producto.marca}</p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-[13.5px] font-medium leading-5 sm:text-[14.5px]">{producto.nombre}</h3>
          <p className="mt-1.5 truncate text-[11.5px] leading-4 text-index sm:text-[12px]">
            {soldOut ? 'Sin stock por ahora' : talles.length ? `Talles ${resumenTalles(talles)}` : 'Consultá talles'}
          </p>
          <div className="mt-auto pt-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className={cn('whitespace-nowrap text-[15px] font-bold leading-5 sm:text-[17px]', soldOut && 'text-index line-through')}>
                {formatARS(producto.precio)}
              </p>
              <span
                aria-hidden="true"
                className="hidden size-8 shrink-0 place-items-center rounded-full border border-control text-ink transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent sm:grid"
              >
                <Icon name="arrow" size={15} />
              </span>
            </div>
            {!soldOut && (
              <p className="mt-0.5 truncate text-[11.5px] leading-4 text-[color:var(--bz-accent-text)] sm:text-[12.5px]">
                <span className="font-semibold">{formatARS(transferPrice(producto.precio))}</span>{' '}
                <span className="sm:hidden">transf.</span>
                <span className="hidden sm:inline">con transferencia</span>
              </p>
            )}
          </div>
        </div>
      </button>
    </article>
  )
}
