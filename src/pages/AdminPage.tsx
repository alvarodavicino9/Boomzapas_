import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { StatsPanel } from '@/components/admin/StatsPanel'
import { OrdersPanel } from '@/components/admin/OrdersPanel'
import { StockPanel } from '@/components/admin/StockPanel'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { Toaster } from '@/components/layout/Toaster'
import { useAdminToken } from '@/hooks/useAdminToken'
import { ApiError, adminPedidos, adminStats } from '@/lib/api'
import { cn } from '@/lib/format'
import type { AdminStats, PedidoRow } from '@/types'

type Tab = 'resumen' | 'pedidos' | 'stock'
const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'stock', label: 'Stock' },
]

export default function AdminPage() {
  const { token, setToken, logout } = useAdminToken()
  const [tab, setTab] = useState<Tab>('resumen')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pedidos, setPedidos] = useState<PedidoRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const [s, p] = await Promise.all([adminStats(token), adminPedidos(token)])
      setStats(s)
      setPedidos(p)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) logout()
      else setError(e instanceof Error ? e.message : 'Error al cargar los datos.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  if (!token) return <AdminLogin onLogin={setToken} />

  return (
    <div className="page-x min-h-dvh pb-16">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5">
        <Link to="/" aria-label="Volver a la tienda">
          <Logo size={36} />
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? 'Actualizando' : 'Actualizar'}
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            Salir
          </Button>
        </div>
      </header>

      <nav className="mb-8 flex gap-8 border-b border-line" role="tablist" aria-label="Secciones">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn('label py-5 hover:underline hover:underline-offset-[5px]', tab === t.id ? 'link-active' : 'text-index')}
          >
            {t.label}
            {t.id === 'pedidos' && pedidos.length > 0 && <span className="ml-2 text-index">{pedidos.length}</span>}
          </button>
        ))}
      </nav>

      {error && (
        <div role="alert" className="label mb-6 border border-danger p-4 text-danger">
          {error}
        </div>
      )}

      {tab === 'resumen' &&
        (stats ? <StatsPanel stats={stats} /> : <p className="label text-index">{loading ? 'Cargando' : 'Sin datos'}</p>)}
      {tab === 'pedidos' && <OrdersPanel token={token} pedidos={pedidos} onChange={setPedidos} onUnauthorized={logout} />}
      {tab === 'stock' && <StockPanel token={token} onUnauthorized={logout} />}
      <Toaster />
    </div>
  )
}
