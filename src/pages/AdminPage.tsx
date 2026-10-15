import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { Resumen } from '@/components/admin/Resumen'
import { Pedidos } from '@/components/admin/Pedidos'
import { Productos } from '@/components/admin/Productos'
import { Clientes } from '@/components/admin/Clientes'
import { Resenas } from '@/components/admin/Resenas'
import { Herramientas } from '@/components/admin/Herramientas'
import type { AdminNav, AdminTab } from '@/components/admin/types'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { Toaster } from '@/components/layout/Toaster'
import { useAdminToken } from '@/hooks/useAdminToken'
import { useAdminData } from '@/hooks/useAdminData'
import { MODO_DEMO } from '@/lib/api'
import { alertasDeStock } from '@/lib/adminStats'
import { useResenasLocales } from '@/lib/resenas'
import { cn } from '@/lib/format'

const SECCIONES: { id: AdminTab; label: string; corto: string; icon: IconName }[] = [
  { id: 'resumen', label: 'Resumen', corto: 'Resumen', icon: 'grid' },
  { id: 'pedidos', label: 'Pedidos', corto: 'Pedidos', icon: 'box' },
  { id: 'productos', label: 'Productos y stock', corto: 'Productos', icon: 'tag' },
  { id: 'clientes', label: 'Clientes', corto: 'Clientes', icon: 'users' },
  { id: 'resenas', label: 'Reseñas', corto: 'Reseñas', icon: 'star' },
  { id: 'herramientas', label: 'Herramientas', corto: 'Útiles', icon: 'tools' },
]

interface Destino {
  tab: AdminTab
  filtro?: string
  pedidoId?: number | string
  nonce: number
}

export default function AdminPage() {
  const { token, setToken, logout } = useAdminToken()
  const [destino, setDestino] = useState<Destino>({ tab: 'resumen', nonce: 0 })

  // El panel no debe aparecer en buscadores.
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex,nofollow'
    document.head.appendChild(m)
    const prev = document.title
    document.title = 'Panel · Boom Zapas'
    return () => {
      m.remove()
      document.title = prev
    }
  }, [])

  const nav: AdminNav = useCallback(
    (tab, filtro, pedidoId) => {
      setDestino((d) => ({ tab, filtro, pedidoId, nonce: d.nonce + 1 }))
      window.scrollTo({ top: 0 })
    },
    [],
  )

  const data = useAdminData(token, logout)
  const resenas = useResenasLocales()
  const resenasPendientes = resenas.filter((r) => r.pendiente).length
  const alertas = useMemo(() => alertasDeStock(data.productos).length, [data.productos])
  const pendientes = data.pedidos.filter((p) => p.estado === 'pendiente').length

  if (!token) return <AdminLogin onLogin={setToken} />

  const badge = (id: AdminTab) => (id === 'pedidos' ? pendientes : id === 'productos' ? alertas : id === 'resenas' ? resenasPendientes : 0)
  const actual = SECCIONES.find((s) => s.id === destino.tab)!

  return (
    <div className="min-h-dvh bg-gallery lg:grid lg:grid-cols-[264px_1fr]">
      {/* Barra lateral (escritorio) */}
      <aside className="on-bar sticky top-0 hidden h-dvh flex-col overflow-hidden border-r border-line lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
          style={{ background: 'rgb(var(--bz-glow, 150 12 20) / 0.55)' }}
        />
        <div className="relative px-6 pb-6 pt-7">
          <Link to="/" aria-label="Ir a la tienda">
            <Logo size={44} wordmark wordmarkClassName="text-[20px]" />
          </Link>
          <p className="label mt-4 text-[10.5px] text-index">Panel de administración</p>
        </div>
        <nav className="relative flex-1 space-y-1 px-3" aria-label="Secciones del panel">
          {SECCIONES.map((s) => {
            const n = badge(s.id)
            const activo = destino.tab === s.id
            return (
              <button
                key={s.id}
                onClick={() => nav(s.id)}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'relative flex h-11 w-full items-center gap-3 rounded-xl px-4 text-left text-[13.5px] font-medium transition-colors',
                  activo ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
                )}
              >
                {activo && <span className="absolute -left-3 top-2 h-7 w-1 rounded-r-full bg-accent-soft" />}
                <Icon name={s.icon} size={18} className={activo ? 'text-accent-soft' : ''} />
                <span className="flex-1">{s.label}</span>
                {n > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">{n}</span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="relative space-y-1 border-t border-white/10 p-3">
          <p className="mx-4 mb-2 mt-2 flex items-center gap-2 text-[11.5px] text-white/60">
            <span className={cn('h-2 w-2 rounded-full', MODO_DEMO ? 'bg-[#f0a93b]' : 'bg-[#3fbf7f]')} />
            {MODO_DEMO ? 'Modo local · datos en este navegador' : 'Conectado al servidor'}
          </p>
          <Link to="/" className="flex h-10 items-center gap-3 rounded-xl px-4 text-[13px] text-white/70 hover:bg-white/5 hover:text-white">
            <Icon name="store" size={17} /> Ver la tienda
          </Link>
          <button onClick={logout} className="flex h-10 w-full items-center gap-3 rounded-xl px-4 text-left text-[13px] text-white/70 hover:bg-white/5 hover:text-white">
            <Icon name="logout" size={17} /> Salir
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior (celular y tablet) */}
        <header className="on-bar sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:hidden">
          <Link to="/" aria-label="Ir a la tienda" className="flex items-center gap-3">
            <Logo size={34} />
            <span className="leading-tight">
              <span className="block text-[14px] font-semibold">{actual.label}</span>
              <span className="block text-[11px] text-white/60">{MODO_DEMO ? 'Modo local' : 'En vivo'}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {!MODO_DEMO && (
              <button onClick={data.reload} aria-label="Actualizar" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
                <Icon name="refresh" size={18} className={data.loading ? 'animate-spin' : ''} />
              </button>
            )}
            <button onClick={logout} aria-label="Salir" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </header>

        <main
          className="relative px-4 pb-28 pt-6 sm:px-8 lg:px-10 lg:pb-16 lg:pt-9"
          style={{ backgroundImage: 'radial-gradient(60% 320px at 100% 0%, rgb(var(--bz-glow, 150 12 20) / 0.16), transparent 70%)' }}
        >
          <div className="mx-auto max-w-[1180px]">
            {!MODO_DEMO && (
              <div className="mb-5 hidden justify-end lg:flex">
                <button
                  onClick={data.reload}
                  disabled={data.loading}
                  className="label inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-index hover:border-control hover:text-ink"
                >
                  <Icon name="refresh" size={14} className={data.loading ? 'animate-spin' : ''} /> {data.loading ? 'Actualizando' : 'Actualizar'}
                </button>
              </div>
            )}
            {MODO_DEMO && (
              <p className="mb-6 flex items-start gap-2 rounded-xl border border-[#f0a93b]/30 bg-[#f0a93b]/10 px-4 py-2.5 text-[12.5px] leading-5">
                <Icon name="alert" size={15} className="mt-0.5 shrink-0 text-[#f0a93b]" />
                <span>
                  Modo local: los pedidos y cambios de este panel se guardan <strong>sólo en este navegador</strong>. Cuando conectemos el
                  servidor, pasan a la base de datos real.
                </span>
              </p>
            )}
            {data.error && (
              <div role="alert" className="mb-6 rounded-xl border border-danger/50 bg-danger/10 p-4 text-[13px] text-danger">
                {data.error}
              </div>
            )}

            {destino.tab === 'resumen' && (
              <Resumen pedidos={data.pedidos} productos={data.productos} resenasPendientes={resenasPendientes} nav={nav} />
            )}
            {destino.tab === 'pedidos' && (
              <Pedidos
                key={destino.nonce}
                pedidos={data.pedidos}
                productos={data.productos}
                filtroInicial={destino.filtro}
                abrirId={destino.pedidoId}
                onEstado={data.setEstado}
              />
            )}
            {destino.tab === 'productos' && (
              <Productos key={destino.nonce} productos={data.productos} filtroInicial={destino.filtro} setStock={data.setStock} />
            )}
            {destino.tab === 'clientes' && <Clientes pedidos={data.pedidos} />}
            {destino.tab === 'resenas' && <Resenas />}
            {destino.tab === 'herramientas' && <Herramientas pedidos={data.pedidos} productos={data.productos} />}
          </div>
        </main>
      </div>

      {/* Navegación inferior (celular y tablet) */}
      <nav
        className="on-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Secciones del panel"
      >
        {SECCIONES.map((s) => {
          const n = badge(s.id)
          const activo = destino.tab === s.id
          return (
            <button
              key={s.id}
              onClick={() => nav(s.id)}
              aria-current={activo ? 'page' : undefined}
              className={cn('relative flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium', activo ? 'text-white' : 'text-white/60')}
            >
              {activo && <span className="absolute inset-x-4 top-0 h-0.5 rounded-b-full bg-accent-soft" />}
              <span className="relative">
                <Icon name={s.icon} size={20} className={activo ? 'text-accent-soft' : ''} />
                {n > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9.5px] font-semibold text-white">
                    {n}
                  </span>
                )}
              </span>
              {s.corto}
            </button>
          )
        })}
      </nav>
      <Toaster />
    </div>
  )
}
