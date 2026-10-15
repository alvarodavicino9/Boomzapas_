import { ProductImage } from './ProductImage'
import { cn, formatARS } from '@/lib/format'
import { getStatus } from '@/lib/status'
import type { Producto } from '@/types'

interface ProductCardProps {
  producto: Producto
  onOpen: (p: Producto) => void
}

export function ProductCard({ producto, onOpen }: ProductCardProps) {
  const status = getStatus(producto)
  const soldOut = status === 'AGOTADO'
  const [first, second] = producto.imagenes

  return (
    <article className="group surface overflow-hidden transition-shadow duration-200 hover:shadow-lift">
      <button
        onClick={() => onOpen(producto)}
        className="flex h-full w-full flex-col text-left"
        aria-label={`${producto.nombre}, ${formatARS(producto.precio)}${status ? `, ${status.toLowerCase()}` : ''}. Ver talles y detalles`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stage">
          <ProductImage
            src={first}
            alt={producto.nombre}
            className={cn('size-full transition-transform duration-500 group-hover:scale-[1.03]', soldOut && 'opacity-40')}
          />
          {second && !soldOut && (
            <img
              src={second}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
          {status && <span className={cn('ribbon', soldOut && 'ribbon-muted')}>{status}</span>}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="label text-index">{producto.marca}</p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-[14px] font-medium leading-5">{producto.nombre}</h3>
          <div className="mt-3 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="price-text whitespace-nowrap">{formatARS(producto.precio)}</p>
            <span className="label w-full whitespace-nowrap rounded-full border-[1.5px] border-control px-3 py-1.5 text-center sm:w-auto transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-gallery">
              Ver talles
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}
