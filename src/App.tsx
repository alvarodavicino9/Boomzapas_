import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
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
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="envios" element={<ShippingPage />} />
        <Route path="pagos" element={<PaymentsPage />} />
        <Route path="como-comprar" element={<HowToBuyPage />} />
        <Route path="guia-de-talles" element={<SizeGuidePage />} />
        <Route path="nosotros" element={<AboutPage />} />
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
  )
}
