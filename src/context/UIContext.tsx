import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export interface Toast {
  id: number
  message: string
}

interface UIContextValue {
  cartOpen: boolean
  checkoutOpen: boolean
  toasts: Toast[]
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  toast: (message: string) => void
  dismissToast: (id: number) => void
}

const UIContext = createContext<UIContextValue | null>(null)

let toastId = 0

export function UIProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

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
      cartOpen,
      checkoutOpen,
      toasts,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      openCheckout: () => {
        setCartOpen(false)
        setCheckoutOpen(true)
      },
      closeCheckout: () => setCheckoutOpen(false),
      toast,
      dismissToast,
    }),
    [cartOpen, checkoutOpen, toasts, toast, dismissToast],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>')
  return ctx
}
