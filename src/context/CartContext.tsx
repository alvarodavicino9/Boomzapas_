import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { CartItem } from '@/types'

const STORAGE_KEY = 'bz_cart_v2'

type NewItem = Omit<CartItem, 'cantidad' | 'key'>

type Action =
  | { type: 'add'; item: NewItem }
  | { type: 'setQty'; key: string; cantidad: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }

const keyOf = (productoId: number, talle: string) => `${productoId}-${talle}`

function reducer(items: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'add': {
      const key = keyOf(action.item.productoId, action.item.talle)
      const found = items.find((i) => i.key === key)
      if (found) {
        return items.map((i) => (i.key === key ? { ...i, cantidad: Math.min(i.cantidad + 1, i.max) } : i))
      }
      return [...items, { ...action.item, key, cantidad: 1 }]
    }
    case 'setQty':
      return items
        .map((i) => (i.key === action.key ? { ...i, cantidad: Math.min(action.cantidad, i.max) } : i))
        .filter((i) => i.cantidad > 0)
    case 'remove':
      return items.filter((i) => i.key !== action.key)
    case 'clear':
      return []
  }
}

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is CartItem =>
        !!i && typeof i.key === 'string' && typeof i.precio === 'number' && typeof i.cantidad === 'number',
    )
  } catch {
    return []
  }
}

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  add: (item: NewItem) => void
  setQty: (key: string, cantidad: number) => void
  remove: (key: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage no disponible: el carrito sigue funcionando en memoria */
    }
  }, [items])

  const add = useCallback((item: NewItem) => dispatch({ type: 'add', item }), [])
  const setQty = useCallback((key: string, cantidad: number) => dispatch({ type: 'setQty', key, cantidad }), [])
  const remove = useCallback((key: string) => dispatch({ type: 'remove', key }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.cantidad, 0),
      subtotal: items.reduce((s, i) => s + i.precio * i.cantidad, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
