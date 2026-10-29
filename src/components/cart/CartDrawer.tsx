import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ProductImage } from '@/components/catalog/ProductImage'
import { useCart } from '@/context/CartContext'
import { useUI } from '@/context/UIContext'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { formatARS } from '@/lib/format'
import { SITE } from '@/config/site'

/** Pedido: panel lateral con las líneas del pedido y el paso a confirmar. */
export function CartDrawer() {
  const { cartOpen, closeCart, openCheckout } = useUI()
  const { items, count, subtotal, setQty, remove } = useCart()
  useLockBodyScroll(cartOpen)

  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [cartOpen, closeCart])

  const transferTotal = Math.max(0, subtotal - SITE.transferDiscount * count)

  return createPortal(
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          className="fixed inset-0 z-[450]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-scrim" onClick={closeCart} aria-hidden="true" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-gallery shadow-lift sm:rounded-l-3xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
              <h2 className="label">Pedido ({count})</h2>
              <button
                onClick={closeCart}
                aria-label="Cerrar pedido"
                className="label hover:underline hover:underline-offset-[5px]"
              >
                Cerrar
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center gap-5 px-5 sm:px-8">
                <p className="display-product">Tu pedido está vacío</p>
                <p className="body-text">Elegí un modelo y un talle y sumalo acá.</p>
                <Button to="/catalogo" onClick={closeCart} variant="outline">
                  Ver catálogo
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.li
                        key={i.key}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4 overflow-hidden border-b border-line py-5"
                      >
                        <ProductImage src={i.imagen} alt={i.nombre} sizes="96px" className="size-24 shrink-0 rounded-xl" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="label text-index">{i.marca}</p>
                          <p className="mt-1 truncate text-[15px]">{i.nombre}</p>
                          <p className="label mt-1 text-index">Talle {i.talle}</p>
                          <div className="mt-auto flex items-end justify-between pt-3">
                            <div className="flex items-center overflow-hidden rounded-full border-[1.5px] border-control">
                              <button
                                onClick={() => setQty(i.key, i.cantidad - 1)}
                                aria-label={`Quitar una unidad de ${i.nombre}`}
                                className="grid size-9 place-items-center hover:bg-ink hover:text-gallery"
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-sm" aria-live="polite">
                                {i.cantidad}
                              </span>
                              <button
                                onClick={() => setQty(i.key, i.cantidad + 1)}
                                disabled={i.cantidad >= i.max}
                                aria-label={`Sumar una unidad de ${i.nombre}`}
                                className="grid size-9 place-items-center hover:bg-ink hover:text-gallery disabled:text-index disabled:hover:bg-transparent disabled:hover:text-index"
                              >
                                +
                              </button>
                            </div>
                            <p className="price-text">{formatARS(i.precio * i.cantidad)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => remove(i.key)}
                          aria-label={`Quitar ${i.nombre} del pedido`}
                          className="label self-start text-index hover:text-ink hover:underline hover:underline-offset-[5px]"
                        >
                          Quitar
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="space-y-4 border-t border-line px-5 py-6 sm:px-8">
                  <div className="flex items-baseline justify-between">
                    <span className="label">Total</span>
                    <span className="price-text">{formatARS(subtotal)}</span>
                  </div>
                  <div className="label flex items-baseline justify-between text-index">
                    <span>Con transferencia o efectivo</span>
                    <span>{formatARS(transferTotal)}</span>
                  </div>
                  <Button size="lg" full onClick={openCheckout}>
                    Continuar pedido
                  </Button>
                  <p className="body-text text-center !text-[13px]">
                    Envío a todo el país o retiro en {SITE.address}.{' '}
                    <Link to="/envios" onClick={closeCart} className="underline underline-offset-[5px] hover:text-ink">
                      Ver envíos
                    </Link>
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
