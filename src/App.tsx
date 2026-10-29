import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProductoHost } from '@/components/catalog/ProductoHost'
import type { EstadoFicha } from '@/hooks/useAbrirProducto'
import HomePage from '@/pages/HomePage'

// El resto de las páginas se descargan sólo cuando se visitan.
const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const ShippingPage = lazy(() => import('@/pages/ShippingPage'))
const PaymentsPage = lazy(() => import('@/pages/PaymentsPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const HowToBuyPage = lazy(() => import('@/pages/HowToBuyPage'))
const SizeGuidePage = lazy(() => import('@/pages/SizeGuidePage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const PaymentResultPage = lazy(() => import('@/pages/PaymentResultPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  const location = useLocation()
  // Con una ficha abierta, la página de fondo sigue siendo la que estabas viendo.
  const fondo = (location.state as EstadoFicha | null)?.fondo

  return (
    <>
      <Routes location={fondo ?? location}>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          {/* link directo a una zapatilla: el catálogo de fondo y la ficha abierta encima */}
          <Route path="zapatilla/:slug" element={<CatalogPage />} />
          <Route path="envios" element={<ShippingPage />} />
          <Route path="pagos" element={<PaymentsPage />} />
          <Route path="como-comprar" element={<HowToBuyPage />} />
          <Route path="guia-de-talles" element={<SizeGuidePage />} />
          <Route path="nosotros" element={<AboutPage />} />
          <Route path="pago/:resultado" element={<PaymentResultPage />} />
          <Route path="contacto" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route
          path="admin"
          element={
            <Suspense fallback={null}>
              <AdminPage />
            </Suspense>
          }
        />
      </Routes>
      <ProductoHost />
    </>
  )
}
