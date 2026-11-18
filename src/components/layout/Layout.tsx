import { lazy, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { Toaster } from './Toaster'
import { AvisoAgregado } from './AvisoAgregado'
import { WhatsAppButton } from './WhatsAppButton'
import { useUI } from '@/context/UIContext'
import { useCuandoEsteLibre } from '@/hooks/useCuandoEsteLibre'

// El carrito y el checkout se bajan aparte: no hacen falta para ver la página.
// Se cargan cuando el navegador queda libre (o antes, si alguien abre el carrito).
const CartDrawer = lazy(() => import('@/components/cart/CartDrawer').then((m) => ({ default: m.CartDrawer })))
const CheckoutModal = lazy(() => import('@/components/checkout/CheckoutModal').then((m) => ({ default: m.CheckoutModal })))

export function Layout() {
  const { cartOpen, checkoutOpen } = useUI()
  const libre = useCuandoEsteLibre()
  const cargarPedido = libre || cartOpen || checkoutOpen
  return (
    <>
      <a
        href="#contenido"
        className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[700] focus:rounded-full focus:bg-ink focus:px-4 focus:py-3 focus:text-gallery"
      >
        Saltar al contenido
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="contenido" className="min-h-[100dvh] pt-[var(--header-h)]">
        <Suspense fallback={<div className="label grid min-h-[60vh] place-items-center text-index">Cargando</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {/* lugar para la barra de abajo del celular */}
      {cargarPedido && (
        <Suspense fallback={null}>
          <CartDrawer />
          <CheckoutModal />
        </Suspense>
      )}
      <WhatsAppButton />
      <Toaster />
      <AvisoAgregado />
    </>
  )
}
