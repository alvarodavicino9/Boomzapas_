import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ProductImage } from '@/components/catalog/ProductImage'
import { useCart } from '@/context/CartContext'
import { useUI } from '@/context/UIContext'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { aplicaPromo, descuentoPromo, formatARS, PROMO } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'

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

  // Promo: llevando 2 pares o más, $5.000 off por cada par.
  const promo = descuentoPromo(count)
  const total = subtotal - promo
  const conPromo = aplicaPromo(count)

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
          <div className="absolute inset-0 bg-scrim backdrop-blur-[2px]" onClick={closeCart} aria-hidden="true" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col overflow-hidden border-l border-line bg-gallery shadow-lift sm:rounded-l-[28px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="relative flex items-center justify-between gap-4 px-5 pb-4 pt-5 sm:px-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-28"
                style={{ background: 'radial-gradient(80% 100% at 0% 0%, rgb(var(--bz-glow) / 0.35), transparent 70%)' }}
              />
              <div className="relative flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-accent text-on-accent shadow-[0_8px_20px_-8px_rgb(217_44_55/0.9)]">
                  <Icon name="bag" size={18} />
                </span>
                <div>
                  <h2 className="font-display text-[1.15rem] font-bold leading-none">Tu pedido</h2>
                  <p className="mt-1 text-[12.5px] text-index">
                    {count === 0 ? 'Todavía no sumaste pares' : `${count} ${count === 1 ? 'par' : 'pares'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                aria-label="Cerrar pedido"
                className="relative grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-control"
              >
                <Icon name="x" size={18} />
              </button>
            </header>

            <div className="mx-5 flex items-center gap-2.5 rounded-xl border border-[#3fbf7f]/30 bg-[#3fbf7f]/10 px-3.5 py-2.5 text-[12.5px] leading-4 sm:mx-7">
              <Icon name="truck" size={17} className="shrink-0 text-[#3fbf7f]" />
              <span>
                <strong className="font-semibold">Envío gratis</strong> a todo el país, o retiro sin costo en Córdoba.
              </span>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <span className="grid size-20 place-items-center rounded-full border border-line bg-card text-index">
                  <Icon name="bag" size={32} />
                </span>
                <p className="mt-5 font-display text-[1.3rem] font-bold">Tu pedido está vacío</p>
                <p className="body-text mt-2 max-w-[18rem]">Elegí un modelo y tu talle, y sumalo acá.</p>
                <Button to="/catalogo" onClick={closeCart} variant="accent" className="mt-6">
                  Ver catálogo <Icon name="arrow" size={16} />
                </Button>
                <div className="mt-8 w-full">
                  <p className="label mb-3 text-index">Los más buscados</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {BUSCADOS.map((b) => (
                      <Link
                        key={b.q}
                        to={`/catalogo?q=${encodeURIComponent(b.q)}`}
                        onClick={closeCart}
                        className="rounded-full border border-line bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-accent hover:text-[color:var(--bz-accent-text)]"
                      >
                        {b.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <ul className="mt-2 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.li
                        key={i.key}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-3.5 overflow-hidden border-b border-line py-4 last:border-0"
                      >
                        <ProductImage src={i.imagen} alt={i.nombre} sizes="96px" className="size-[88px] shrink-0 rounded-2xl ring-1 ring-line" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-index">{i.marca}</p>
                              <p className="mt-0.5 line-clamp-2 text-[14px] font-medium leading-5">{i.nombre}</p>
                            </div>
                            <button
                              onClick={() => remove(i.key)}
                              aria-label={`Quitar ${i.nombre} del pedido`}
                              className="grid size-8 shrink-0 place-items-center rounded-full text-index transition-colors hover:bg-stage hover:text-ink"
                            >
                              <Icon name="trash" size={15} />
                            </button>
                          </div>
                          <span className="mt-1.5 inline-flex w-max rounded-md bg-stage px-2 py-0.5 text-[11.5px] font-semibold">Talle {i.talle}</span>
                          <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
                            <div className="flex items-center rounded-full border border-line bg-card p-0.5">
                              <button
                                onClick={() => setQty(i.key, i.cantidad - 1)}
                                aria-label={`Quitar una unidad de ${i.nombre}`}
                                className="grid size-7 place-items-center rounded-full transition-colors hover:bg-stage"
                              >
                                <Icon name="minus" size={13} />
                              </button>
                              <span className="w-7 text-center text-[13.5px] font-semibold tabular-nums" aria-live="polite">
                                {i.cantidad}
                              </span>
                              <button
                                onClick={() => setQty(i.key, i.cantidad + 1)}
                                disabled={i.cantidad >= i.max}
                                aria-label={`Sumar una unidad de ${i.nombre}`}
                                className="grid size-7 place-items-center rounded-full transition-colors hover:bg-stage disabled:opacity-35 disabled:hover:bg-transparent"
                              >
                                <Icon name="plus" size={13} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-[15px] font-bold leading-5">{formatARS(i.precio * i.cantidad)}</p>
                              {conPromo && (
                                <p className="text-[11.5px] leading-4 text-[#1f9d55]">
                                  −{formatARS(PROMO.descuento * i.cantidad)} promo
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="border-t border-line bg-card px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 sm:px-7">
                  <dl className="space-y-1.5 text-[13.5px]">
                    <div className="flex items-baseline justify-between">
                      <dt className="text-index">Subtotal</dt>
                      <dd className="font-medium">{formatARS(subtotal)}</dd>
                    </div>
                    {conPromo && (
                      <div className="flex items-baseline justify-between">
                        <dt className="text-index">Promo {PROMO.minimo} pares o más</dt>
                        <dd className="font-semibold text-[#1f9d55]">−{formatARS(promo)}</dd>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between">
                      <dt className="text-index">Envío</dt>
                      <dd className="font-semibold text-[#3fbf7f]">Gratis</dd>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-line pt-2.5">
                      <dt className="font-semibold">Total</dt>
                      <dd className="font-display text-[1.45rem] font-bold leading-none">{formatARS(total)}</dd>
                    </div>
                  </dl>
                  <div
                    className={
                      conPromo
                        ? 'mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#1f9d55]/12 px-3.5 py-2.5 text-[12.5px] leading-4'
                        : 'mt-3 flex items-center justify-between gap-3 rounded-xl bg-accent/10 px-3.5 py-2.5 text-[12.5px] leading-4'
                    }
                  >
                    <span>
                      {conPromo ? (
                        <>
                          Promo aplicada: <strong className="font-semibold">{formatARS(PROMO.descuento)} off</strong> en cada par
                        </>
                      ) : (
                        <>
                          Sumá otro par y ahorrás <strong className="font-semibold">{formatARS(PROMO.descuento * PROMO.minimo)}</strong> ({formatARS(PROMO.descuento)} por par)
                        </>
                      )}
                    </span>
                    <span
                      className={
                        conPromo
                          ? 'shrink-0 rounded-full bg-[#1f9d55] px-2 py-0.5 text-[11px] font-bold text-white'
                          : 'shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-on-accent'
                      }
                    >
                      {conPromo ? `−${formatARS(promo)}` : `${PROMO.minimo}+ pares`}
                    </span>
                  </div>
                  <Button size="lg" variant="accent" full onClick={openCheckout} className="mt-4">
                    Finalizar pedido <Icon name="arrow" size={17} />
                  </Button>
                  <button onClick={closeCart} className="mt-3 w-full text-center text-[13px] font-medium text-index hover:text-ink">
                    Seguir comprando
                  </button>
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

const BUSCADOS = [
  { label: 'Dunk', q: 'dunk' },
  { label: 'Samba', q: 'samba' },
  { label: 'Jordan', q: 'jordan' },
  { label: 'Vans Knu', q: 'knu' },
  { label: 'New Balance', q: 'new balance' },
]
