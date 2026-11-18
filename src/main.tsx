import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion } from 'framer-motion'
import App from './App'
import { CartProvider } from '@/context/CartContext'
import { UIProvider } from '@/context/UIContext'
import { ProductsProvider } from '@/context/ProductsContext'
import '@fontsource-variable/lexend-exa'
import '@fontsource-variable/lexend'
import './index.css'

// Las animaciones se bajan en un archivo aparte, después de lo necesario para mostrar la página.
const animaciones = () => import('@/lib/animaciones').then((m) => m.default)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={animaciones} strict>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UIProvider>
        <ProductsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductsProvider>
      </UIProvider>
    </BrowserRouter>
    </LazyMotion>
  </StrictMode>,
)

// App instalable: el service worker sólo en la versión publicada (en desarrollo molestaría con caché vieja)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* sin service worker la página funciona igual */
    })
  })
}
