import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from '@/context/CartContext'
import { UIProvider } from '@/context/UIContext'
import { ProductsProvider } from '@/context/ProductsContext'
import '@fontsource-variable/lexend-exa'
import '@fontsource-variable/lexend'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UIProvider>
        <ProductsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductsProvider>
      </UIProvider>
    </BrowserRouter>
  </StrictMode>,
)
