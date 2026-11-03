import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export interface Toast {
  id: number
  message: string
}

/** Lo que se acaba de sumar al pedido (para el aviso "Agregado al pedido"). */
export interface Agregado {
  id: number
  nombre: string
  marca: string
  imagen?: string
  talle: string
  precio: number
}

interface UIContextValue {
  /** Menú del celular (lo abren el botón del encabezado y la barra de abajo). */
  menuOpen: boolean
  setMenuOpen: (open: boolean | ((o: boolean) => boolean)) => void
  cartOpen: boolean
  checkoutOpen: boolean
  toasts: Toast[]
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  toast: (message: string) => void
  dismissToast: (id: number) => void
  agregado: Agregado | null
  avisarAgregado: (a: Omit<Agregado, 'id'>) => void
  cerrarAgregado: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

let toastId = 0

export function UIProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [agregado, setAgregado] = useState<Agregado | null>(null)
  const avisarAgregado = useCallback((a: Omit<Agregado, 'id'>) => setAgregado({ ...a, id: ++toastId }), [])
  const cerrarAgregado = useCallback(() => setAgregado(null), [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    (message: string) => {
      const id = ++toastId
      setToasts((t) => [...t.slice(-2), { id, message }])
      window.setTimeout(() => dismissToast(id), 3200)
    },
    [dismissToast],
  )

  const value = useMemo<UIContextValue>(
    () => ({
      menuOpen,
      setMenuOpen,
      cartOpen,
      checkoutOpen,
      toasts,
      openCart: () => {
        setMenuOpen(false)
        setAgregado(null)
        setCartOpen(true)
      },
      closeCart: () => setCartOpen(false),
      openCheckout: () => {
        setCartOpen(false)
        setCheckoutOpen(true)
      },
      closeCheckout: () => setCheckoutOpen(false),
      toast,
      dismissToast,
      agregado,
      avisarAgregado,
      cerrarAgregado,
    }),
    [menuOpen, cartOpen, checkoutOpen, toasts, toast, dismissToast, agregado, avisarAgregado, cerrarAgregado],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>')
  return ctx
}
