import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getProductos } from '@/lib/api'
import type { Producto } from '@/types'

type Status = 'loading' | 'ready' | 'error'

interface ProductsContextValue {
  productos: Producto[]
  status: Status
  error: string | null
  reload: () => void
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

/** Carga el catálogo una sola vez y lo comparte con home, catálogo y admin. */
export function ProductsProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getProductos()
      .then((data) => {
        if (cancelled) return
        setProductos(data)
        setError(null)
        setStatus('ready')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'No pudimos cargar el catálogo.')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  const value = useMemo(() => ({ productos, status, error, reload }), [productos, status, error, reload])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductos() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProductos debe usarse dentro de <ProductsProvider>')
  return ctx
}
