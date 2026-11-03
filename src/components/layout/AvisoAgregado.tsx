import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProductImage } from '@/components/catalog/ProductImage'
import { Icon } from '@/components/ui/Icon'
import { useCart } from '@/context/CartContext'
import { useUI } from '@/context/UIContext'
import { formatARS } from '@/lib/format'

const DURACION = 5000

/**
 * Aviso "Agregado al pedido": baja debajo del encabezado con la foto, el talle y el precio del par,
 * y dos botones (ver el pedido o seguir mirando). Se va solo a los pocos segundos.
 */
export function AvisoAgregado() {
  const { agregado, cerrarAgregado, openCart } = useUI()
  const { count, subtotal } = useCart()
  const [pausa, setPausa] = useState(false)

  useEffect(() => {
    if (!agregado || pausa) return
    const t = window.setTimeout(cerrarAgregado, DURACION)
    return () => window.clearTimeout(t)
  }, [agregado, pausa, cerrarAgregado])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[calc(var(--header-h)+10px)] z-[440] flex justify-center px-3 sm:justify-end sm:px-6">
      <AnimatePresence>
        {agregado && (
          <motion.div
            key={agregado.id}
            role="status"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setPausa(true)}
            onMouseLeave={() => setPausa(false)}
            className="pointer-events-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-line bg-gallery shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]"
          >
            <div className="flex items-center gap-2 bg-[linear-gradient(90deg,#c41f2b,#ea3a45)] px-4 py-2 text-[12.5px] font-bold text-white">
              <span className="grid size-5 place-items-center rounded-full bg-white text-[#c41f2b]">
                <Icon name="check" size={13} />
              </span>
              ¡Agregado a tu pedido!
              <button onClick={cerrarAgregado} aria-label="Cerrar aviso" className="ml-auto grid size-7 place-items-center rounded-full hover:bg-white/20">
                <Icon name="x" size={15} />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3">
              <ProductImage src={agregado.imagen} alt="" sizes="64px" className="foto-estudio size-16 shrink-0 rounded-xl !object-contain" />
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-index">{agregado.marca}</p>
                <p className="truncate text-[14px] font-semibold leading-5">{agregado.nombre}</p>
                <p className="text-[12.5px] text-index">
                  Talle {agregado.talle} · <span className="font-semibold text-ink">{formatARS(agregado.precio)}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 pb-3">
              <button
                onClick={cerrarAgregado}
                className="h-11 rounded-full border border-line text-[12.5px] font-bold uppercase tracking-[0.06em] transition-colors hover:border-control"
              >
                Seguir mirando
              </button>
              <button
                onClick={openCart}
                className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#ea3a45,#c41f2b)] text-[12.5px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_10px_24px_-12px_rgb(217_44_55/0.9)]"
              >
                Ver pedido ({count})
              </button>
            </div>
            <p className="border-t border-line px-4 py-2 text-center text-[11.5px] text-index">
              Total del pedido {formatARS(subtotal)} · envío gratis
            </p>
            {/* barrita que muestra cuánto falta para que se cierre */}
            {!pausa && (
              <motion.span
                aria-hidden="true"
                className="block h-0.5 origin-left bg-accent"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: DURACION / 1000, ease: 'linear' }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
