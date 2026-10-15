import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MODO_DEMO, getProductos } from '@/lib/api'
import { aplicarCatalogo, useOverrides, useProductosPropios } from '@/lib/adminStore'
import type { Producto } from '@/types'

type Status = 'loading' | 'ready' | 'error'

interface ProductsContextValue {
  /** Lo que ve el cliente en la tienda (sin los productos ocultos). */
  productos: Producto[]
  /** Todo el catálogo, incluidos los ocultos (para el panel). */
  todos: Producto[]
  status: Status
  error: string | null
  reload: () => void
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

/** Carga el catálogo una sola vez y lo comparte con home, catálogo y admin. */
export function ProductsProvider({ children }: { children: ReactNode }) {
  const [base, setBase] = useState<Producto[]>([])
  const overrides = useOverrides()
  const propios = useProductosPropios()
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getProductos()
      .then((data) => {
        if (cancelled) return
        setBase(data)
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
  // En modo local, las ediciones del panel (precios, stock, productos nuevos) se aplican al catálogo.
  const todos = useMemo(() => (MODO_DEMO ? aplicarCatalogo(base, propios, overrides) : base), [base, propios, overrides])
  const productos = useMemo(() => todos.filter((p) => !p.oculto), [todos])
  const value = useMemo(() => ({ productos, todos, status, error, reload }), [productos, todos, status, error, reload])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductos() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProductos debe usarse dentro de <ProductsProvider>')
  return ctx
}
