import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, MODO_DEMO, adminPedidos, adminSetEstado, adminSetStock, adminStats } from '@/lib/api'
import {
  getPedidos,
  nroPedido,
  cargarCatalogoNube,
  cargarPanelNube,
  cambiarEstadoLocal,
  editarProducto,
  useCaja,
  useCostos,
  normalizarPedido,
  usePedidosLocales,
  type PedidoAdmin,
} from '@/lib/adminStore'
import { useProductos } from '@/context/ProductsContext'
import type { Producto } from '@/types'

/**
 * Fuente de datos única del panel: con Supabase (pedidos, caja, costos y catálogo en la nube);
 * con el servidor conectado usa la API (pedidos, estados y stock por talle).
 */
export function useAdminData(token: string, onUnauthorized: () => void, onNuevo?: (mensaje: string) => void) {
  const local = usePedidosLocales()
  const caja = useCaja()
  const costos = useCostos()
  const { todos, status, reload: recargarCatalogo } = useProductos()
  const [remotos, setRemotos] = useState<PedidoAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cargado = useRef(false)
  /** Número del último pedido visto, para avisar cuando entra uno nuevo. */
  const ultimo = useRef<number | null>(null)
  const avisarNuevos = (antes: number | null) => {
    const lista = getPedidos()
    const max = lista.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0)
    if (antes !== null && max > antes) {
      const nuevos = lista.filter((p) => (Number(p.id) || 0) > antes && !p.manual)
      if (nuevos.length) onNuevo?.(nuevos.length === 1 ? `Entró el pedido N° ${nroPedido(nuevos[0].id)} · ${nuevos[0].cliente.nombre}` : `Entraron ${nuevos.length} pedidos nuevos`)
    }
    ultimo.current = max
  }

  const pedidos = MODO_DEMO ? local : remotos

  const reload = useCallback(async () => {
    if (!token) return
    if (MODO_DEMO) {
      // Panel conectado a Supabase: pedidos, caja, costos y catálogo al día.
      // (las actualizaciones automáticas no muestran "cargando")
      if (!cargado.current) setLoading(true)
      setError(null)
      try {
        const antes = ultimo.current
        await Promise.all([cargarPanelNube(), cargarCatalogoNube()])
        cargado.current = true
        avisarNuevos(antes)
      } catch (e) {
        setError(e instanceof Error && /JWT|auth|401|permission/i.test(e.message) ? 'La sesión venció. Volvé a entrar.' : 'No se pudieron cargar los datos. Revisá la conexión.')
        if (e instanceof Error && /JWT|401/i.test(e.message)) onUnauthorized()
      } finally {
        setLoading(false)
      }
      return
    }
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

  // Pedidos nuevos: se actualiza solo cada 30 segundos y al volver a la pestaña.
  useEffect(() => {
    if (!MODO_DEMO || !token) return
    const t = window.setInterval(() => document.visibilityState === 'visible' && reload(), 30000)
    const alVolver = () => document.visibilityState === 'visible' && reload()
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      window.clearInterval(t)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [reload, token])

  const setEstado = useCallback(
    async (p: PedidoAdmin, estado: string) => {
      if (MODO_DEMO) return cambiarEstadoLocal(p, estado, todos)
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
    [remotos, token, onUnauthorized, todos],
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
    () => ({ pedidos, productos: todos, caja, costos, catalogoListo: status !== 'loading', loading, error, reload, setEstado, setStock }),
    [pedidos, todos, caja, costos, status, loading, error, reload, setEstado, setStock],
  )
}
