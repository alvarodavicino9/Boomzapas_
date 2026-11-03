import { useRef, useState } from 'react'
import { ProductImage } from './ProductImage'
import { Icon } from '@/components/ui/Icon'
import { cn, formatARS, transferPrice } from '@/lib/format'
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
 * Las fotos se ven completas (sin recortar la zapatilla) y se pasan deslizando con el dedo;
 * en la compu, al pasar el mouse se desliza a la segunda. Tocar la foto o el texto abre la ficha.
 */
export function ProductCard({ producto, onOpen, eager }: ProductCardProps) {
  const status = getStatus(producto)
  const soldOut = status === 'AGOTADO'
  const fotos = producto.imagenes.filter(Boolean).slice(0, 4)
  const varias = fotos.length > 1 && !soldOut
  // Las otras fotos se bajan recién cuando la persona desliza (celular) o pasa el mouse (compu):
  // así el catálogo carga una sola foto liviana por par.
  const [cargar, setCargar] = useState(false)
  const [idx, setIdx] = useState(0)
  const carril = useRef<HTMLDivElement>(null)
  const talles = getTalles(producto)
    .filter((t) => t.cantidad > 0)
    .map((t) => t.talle)

  const irA = (i: number) => {
    const el = carril.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <article
      className="group surface relative flex flex-col overflow-hidden !rounded-[18px] transition-[box-shadow,transform,border-color] duration-300 [contain-intrinsic-size:auto_380px] [content-visibility:auto] sm:!rounded-[20px] lg:hover:-translate-y-1"
      onPointerEnter={
        varias
          ? (e) => {
              if (e.pointerType !== 'mouse') return
              setCargar(true)
              irA(1)
            }
          : undefined
      }
      onPointerLeave={varias ? (e) => e.pointerType === 'mouse' && irA(0) : undefined}
    >
      {/* fotos: se deslizan con el dedo; tocar abre la ficha */}
      <div className="foto-estudio relative aspect-[3/4] w-full overflow-hidden">
        <div
          ref={carril}
          onTouchStart={varias ? () => setCargar(true) : undefined}
          onScroll={(e) => {
            const el = e.currentTarget
            setIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
          }}
          onClick={() => onOpen(producto)}
          className={cn(
            'flex size-full cursor-pointer [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            varias ? 'snap-x snap-mandatory overflow-x-auto overscroll-x-contain' : 'overflow-hidden',
          )}
        >
          {(varias ? fotos : fotos.slice(0, 1)).map((src, i) => (
            <div key={src.slice(-48) + i} className="relative size-full shrink-0 snap-center">
              {i === 0 || cargar ? (
                <ProductImage
                  src={src}
                  alt={i === 0 ? producto.nombre : ''}
                  eager={i === 0 ? eager : undefined}
                  className={cn('size-full !bg-transparent !object-contain', soldOut && 'opacity-40')}
                />
              ) : null}
            </div>
          ))}
          {fotos.length === 0 && <ProductImage alt={producto.nombre} className="size-full" />}
        </div>

        {status && (
          <span
            className={cn(
              'pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] sm:left-3 sm:top-3 sm:text-[10px]',
              ETIQUETA[status],
            )}
          >
            {status === 'ÚLTIMOS PARES' && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
            {status}
          </span>
        )}

        {varias && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
            {fotos.map((_, i) => (
              <span
                key={i}
                className={cn('h-1.5 rounded-full transition-all duration-300', i === idx ? 'w-4 bg-black/75' : 'w-1.5 bg-black/25')}
              />
            ))}
          </span>
        )}
      </div>

      <button onClick={() => onOpen(producto)} className="flex flex-1 flex-col p-2.5 text-left sm:p-4">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-index sm:text-[11px]">{producto.marca}</span>
        <h3 className="mt-0.5 line-clamp-2 min-h-9 text-[13px] font-medium leading-[18px] sm:mt-1 sm:min-h-10 sm:text-[14.5px] sm:leading-5">
          {producto.nombre}
        </h3>
        <span className="mt-1 truncate text-[11px] leading-4 text-index sm:mt-1.5 sm:text-[12px]">
          {soldOut ? 'Sin stock por ahora' : talles.length ? `Talles ${resumenTalles(talles)}` : 'Consultá talles'}
        </span>
        <span className="mt-auto block pt-2 sm:pt-2.5">
          <span className="flex items-center justify-between gap-2">
            <span className={cn('whitespace-nowrap text-[15px] font-bold leading-5 sm:text-[17px]', soldOut && 'text-index line-through')}>
              {formatARS(producto.precio)}
            </span>
            <span
              aria-hidden="true"
              className="hidden size-8 shrink-0 place-items-center rounded-full border border-control text-ink transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent sm:grid"
            >
              <Icon name="arrow" size={15} />
            </span>
          </span>
          {!soldOut && (
            <span className="mt-0.5 block truncate text-[11.5px] leading-4 text-[color:var(--bz-accent-text)] sm:text-[12.5px]">
              <span className="font-semibold">{formatARS(transferPrice(producto.precio))}</span>{' '}
              <span className="sm:hidden">transf.</span>
              <span className="hidden sm:inline">con transferencia</span>
            </span>
          )}
        </span>
      </button>
    </article>
  )
}
