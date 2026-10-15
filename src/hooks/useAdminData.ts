import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, MODO_DEMO, adminPedidos, adminSetEstado, adminSetStock, adminStats } from '@/lib/api'
import {
  actualizarPedido,
  editarProducto,
  normalizarPedido,
  usePedidosLocales,
  type PedidoAdmin,
} from '@/lib/adminStore'
import { useProductos } from '@/context/ProductsContext'
import type { Producto } from '@/types'

/**
 * Fuente de datos única del panel: en modo local lee y guarda en este navegador;
 * con el servidor conectado usa la API (pedidos, estados y stock por talle).
 */
export function useAdminData(token: string, onUnauthorized: () => void) {
  const local = usePedidosLocales()
  const { todos, status, reload: recargarCatalogo } = useProductos()
  const [remotos, setRemotos] = useState<PedidoAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pedidos = MODO_DEMO ? local : remotos

  const reload = useCallback(async () => {
    if (MODO_DEMO || !token) return
    setLoading(true)
    setError(null)
    try {
      const [, rows] = await Promise.all([adminStats(token), adminPedidos(token)])
      setRemotos(rows.map((r) => normalizarPedido(r)))
      recargarCatalogo()
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) onUnauthorized()
      else setError(e instanceof Error ? e.message : 'Error al cargar los datos.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    reload()
  }, [reload])

  const setEstado = useCallback(
    async (p: PedidoAdmin, estado: string) => {
      if (MODO_DEMO) return actualizarPedido(p.id, { estado })
      const prev = remotos
      setRemotos((list) => list.map((x) => (x.id === p.id ? { ...x, estado } : x)))
      try {
        await adminSetEstado(token, p.id, estado as never)
      } catch (e) {
        setRemotos(prev)
        if (e instanceof ApiError && e.status === 401) onUnauthorized()
        throw e
      }
    },
    [remotos, token, onUnauthorized],
  )

  const setStock = useCallback(
    async (p: Producto, talle: string, cantidad: number) => {
      if (MODO_DEMO) return editarProducto(p.id, { stock: { [talle]: cantidad } })
      try {
        await adminSetStock(token, p.id, talle, cantidad)
        recargarCatalogo()
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) onUnauthorized()
        throw e
      }
    },
    [token, onUnauthorized, recargarCatalogo],
  )

  return useMemo(
    () => ({ pedidos, productos: todos, catalogoListo: status !== 'loading', loading, error, reload, setEstado, setStock }),
    [pedidos, todos, status, loading, error, reload, setEstado, setStock],
  )
}
