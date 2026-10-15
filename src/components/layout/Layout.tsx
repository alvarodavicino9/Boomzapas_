import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { Toaster } from './Toaster'
import { WhatsAppButton } from './WhatsAppButton'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'

export function Layout() {
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
      <main id="contenido" className="min-h-[70vh] pt-[var(--header-h)]">
        <Suspense fallback={<div className="label grid min-h-[60vh] place-items-center text-index">Cargando</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <WhatsAppButton />
      <Toaster />
    </>
  )
}
