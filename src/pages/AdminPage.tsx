import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { Resumen } from '@/components/admin/Resumen'
import { Pedidos } from '@/components/admin/Pedidos'
import { Productos } from '@/components/admin/Productos'
import { Clientes } from '@/components/admin/Clientes'
import { Resenas } from '@/components/admin/Resenas'
import { Herramientas } from '@/components/admin/Herramientas'
import { Caja } from '@/components/admin/Caja'
import type { AdminNav, AdminTab } from '@/components/admin/types'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { Toaster } from '@/components/layout/Toaster'
import { useAdminToken } from '@/hooks/useAdminToken'
import { useAdminData } from '@/hooks/useAdminData'
import { alertasDeStock } from '@/lib/adminStats'
import { cargarResenasPanel, useResenasPanel } from '@/lib/resenas'
import { cn } from '@/lib/format'
import { alFallarNube } from '@/lib/nube'
import { useUI } from '@/context/UIContext'

const SECCIONES: { id: AdminTab; label: string; corto: string; icon: IconName; grupo: string }[] = [
  { id: 'resumen', label: 'Resumen', corto: 'Resumen', icon: 'panel', grupo: 'Día a día' },
  { id: 'pedidos', label: 'Pedidos', corto: 'Pedidos', icon: 'lista', grupo: 'Día a día' },
  { id: 'clientes', label: 'Clientes', corto: 'Clientes', icon: 'users', grupo: 'Día a día' },
  { id: 'productos', label: 'Productos y stock', corto: 'Productos', icon: 'zapa', grupo: 'Tienda' },
  { id: 'resenas', label: 'Reseñas', corto: 'Reseñas', icon: 'resena', grupo: 'Tienda' },
  { id: 'caja', label: 'Caja y ganancias', corto: 'Caja', icon: 'billetera', grupo: 'Negocio' },
  { id: 'herramientas', label: 'Herramientas', corto: 'Útiles', icon: 'varita', grupo: 'Negocio' },
]
const GRUPOS = [...new Set(SECCIONES.map((s) => s.grupo))]

const PRINCIPALES = ['resumen', 'pedidos', 'productos', 'caja'].map((id) => SECCIONES.find((s) => s.id === id)!)
const OTRAS = SECCIONES.filter((s) => !PRINCIPALES.includes(s))

interface Destino {
  tab: AdminTab
  filtro?: string
  pedidoId?: number | string
  nonce: number
}

export default function AdminPage() {
  const { estado, token, email, entrar, logout } = useAdminToken()
  const { toast } = useUI()
  const [destino, setDestino] = useState<Destino>({ tab: 'resumen', nonce: 0 })
  const [mas, setMas] = useState(false)

  // El panel no debe aparecer en buscadores.
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex,nofollow'
    document.head.appendChild(m)
    const prev = document.title
    document.title = 'Panel · Boom Zapas'
    // estilo propio del panel (botones y controles más compactos), también en ventanas y paneles que se abren encima
    document.body.classList.add('modo-panel')
    return () => {
      document.body.classList.remove('modo-panel')
      m.remove()
      document.title = prev
    }
  }, [])

  const nav: AdminNav = useCallback(
    (tab, filtro, pedidoId) => {
      setDestino((d) => ({ tab, filtro, pedidoId, nonce: d.nonce + 1 }))
      setMas(false)
      window.scrollTo({ top: 0 })
    },
    [],
  )

  const data = useAdminData(token, logout, (msg) => {
    toast(msg)
    try {
      navigator.vibrate?.(120)
    } catch {
      /* nada */
    }
  })

  // Si una escritura en Supabase falla, se avisa y se vuelven a traer los datos.
  useEffect(
    () =>
      alFallarNube((msg) => {
        toast(msg)
        data.reload()
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast, data.reload],
  )
  const resenas = useResenasPanel()
  useEffect(() => {
    if (token) cargarResenasPanel().catch(() => {})
  }, [token, data.pedidos.length])
  const resenasPendientes = resenas.filter((r) => r.pendiente).length
  const alertas = useMemo(() => alertasDeStock(data.productos).length, [data.productos])
  const pendientes = data.pedidos.filter((p) => p.estado === 'pendiente').length

  if (estado === 'cargando')
    return (
      <div className="grid min-h-dvh place-items-center bg-gallery">
        <p className="label animate-pulse text-index">Abriendo el panel…</p>
      </div>
    )
  if (!token) return <AdminLogin onEntrar={entrar} />

  const badge = (id: AdminTab) => (id === 'pedidos' ? pendientes : id === 'productos' ? alertas : id === 'resenas' ? resenasPendientes : 0)
  const actual = SECCIONES.find((s) => s.id === destino.tab)!

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      {/* Barra lateral (escritorio) */}
      <aside className="on-bar sticky top-0 hidden h-dvh flex-col overflow-hidden border-r border-white/[0.07] !bg-[linear-gradient(180deg,#1b0e11_0%,#0f0a0b_55%,#0b0809_100%)] lg:flex">
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
        <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Secciones del panel">
          {GRUPOS.map((g) => (
            <div key={g}>
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">{g}</p>
              <ul className="space-y-1">
                {SECCIONES.filter((s) => s.grupo === g).map((s) => {
                  const n = badge(s.id)
                  const activo = destino.tab === s.id
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => nav(s.id)}
                        aria-current={activo ? 'page' : undefined}
                        className={cn(
                          'group flex h-12 w-full items-center gap-3 rounded-2xl px-2.5 text-left text-[13.5px] transition-colors',
                          activo
                            ? 'bg-[linear-gradient(90deg,rgb(217_44_55/0.28),rgb(217_44_55/0.06))] font-semibold text-white ring-1 ring-inset ring-[rgb(217_44_55/0.35)]'
                            : 'font-medium text-white/70 hover:bg-white/[0.06] hover:text-white',
                        )}
                      >
                        <span
                          className={cn(
                            'grid size-8 shrink-0 place-items-center rounded-xl transition-colors',
                            activo ? 'bg-accent text-white shadow-[0_6px_16px_-6px_rgb(217_44_55/0.9)]' : 'bg-white/[0.07] text-white/75 group-hover:bg-white/[0.12] group-hover:text-white',
                          )}
                        >
                          <Icon name={s.icon} size={17} />
                        </span>
                        <span className="flex-1 truncate">{s.label}</span>
                        {n > 0 && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">{n}</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="relative space-y-1 border-t border-white/10 p-3">
          <div className="mx-4 mb-2 mt-2 text-[11.5px] text-white/60">
            <p className="flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', data.error ? 'bg-[#f0a93b]' : 'bg-[#3fbf7f]')} />
              {data.error ? 'Sin conexión con Supabase' : 'En vivo · guardado en Supabase'}
            </p>
            {email && <p className="mt-1 truncate pl-4 text-white/45">{email}</p>}
          </div>
          <button onClick={data.reload} className="flex h-10 w-full items-center gap-3 rounded-xl px-4 text-left text-[13px] text-white/70 hover:bg-white/5 hover:text-white">
            <Icon name="refresh" size={17} className={data.loading ? 'animate-spin' : ''} /> Actualizar
          </button>
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
        <header className="on-bar sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/[0.07] !bg-[#0d0809]/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link to="/" aria-label="Ir a la tienda" className="flex items-center gap-3">
            <Logo size={34} />
            <span className="leading-tight">
              <span className="block text-[14px] font-semibold">{actual.label}</span>
              <span className="block text-[11px] text-white/60">{data.error ? 'Sin conexión' : 'En vivo'}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={data.reload} aria-label="Actualizar" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
              <Icon name="refresh" size={18} className={data.loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={logout} aria-label="Salir" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </header>

        <main
          className="relative px-4 pb-28 pt-6 sm:px-8 lg:px-10 lg:pb-16 lg:pt-9"
        >
          <div className="mx-auto max-w-[1180px]">
            {data.error && (
              <div role="alert" className="mb-6 rounded-xl border border-danger/50 bg-danger/10 p-4 text-[13px] text-danger">
                {data.error}
              </div>
            )}

            {destino.tab === 'resumen' && (
              <Resumen
                pedidos={data.pedidos}
                productos={data.productos}
                caja={data.caja}
                costos={data.costos}
                resenasPendientes={resenasPendientes}
                nav={nav}
              />
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
            {destino.tab === 'caja' && (
              <Caja pedidos={data.pedidos} productos={data.productos} caja={data.caja} costos={data.costos} setStock={data.setStock} />
            )}
            {destino.tab === 'clientes' && <Clientes pedidos={data.pedidos} />}
            {destino.tab === 'resenas' && <Resenas />}
            {destino.tab === 'herramientas' && <Herramientas pedidos={data.pedidos} productos={data.productos} />}
          </div>
        </main>
      </div>

      {/* Navegación inferior (celular y tablet): las 4 secciones de todos los días y "Más" */}
      <nav
        className="on-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/[0.07] !bg-[#0d0809]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Secciones del panel"
      >
        {PRINCIPALES.map((s) => {
          const n = badge(s.id)
          const activo = destino.tab === s.id && !mas
          return (
            <button
              key={s.id}
              onClick={() => nav(s.id)}
              aria-current={activo ? 'page' : undefined}
              className={cn('relative flex h-[68px] flex-col items-center justify-center gap-1 text-[11px]', activo ? 'font-semibold text-white' : 'font-medium text-white/60')}
            >
              <span className={cn('relative grid h-8 w-14 place-items-center rounded-full transition-colors', activo && 'bg-accent text-white shadow-[0_6px_16px_-6px_rgb(217_44_55/0.9)]')}>
                <Icon name={s.icon} size={19} />
                {n > 0 && (
                  <span className="absolute -top-1 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[9.5px] font-bold text-accent ring-2 ring-[#0d0809]">
                    {n}
                  </span>
                )}
              </span>
              {s.corto}
            </button>
          )
        })}
        {(() => {
          const activo = mas || OTRAS.some((s) => s.id === destino.tab)
          const n = OTRAS.reduce((a, s) => a + badge(s.id), 0)
          return (
            <button
              onClick={() => setMas((m) => !m)}
              aria-expanded={mas}
              className={cn('relative flex h-[68px] flex-col items-center justify-center gap-1 text-[11px]', activo ? 'font-semibold text-white' : 'font-medium text-white/60')}
            >
              <span className={cn('relative grid h-8 w-14 place-items-center rounded-full transition-colors', activo && 'bg-white/15 text-white')}>
                <Icon name={mas ? 'x' : 'menu'} size={19} />
                {n > 0 && !mas && (
                  <span className="absolute -top-1 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[9.5px] font-bold text-accent ring-2 ring-[#0d0809]">
                    {n}
                  </span>
                )}
              </span>
              Más
            </button>
          )
        })()}
      </nav>

      {/* Hoja "Más" (celular) */}
      {mas && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setMas(false)}>
          <div className="absolute inset-0 bg-scrim" aria-hidden="true" />
          <div
            className="on-bar absolute inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] rounded-t-3xl border-t border-line p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="grid grid-cols-3 gap-2">
              {OTRAS.map((s) => {
                const n = badge(s.id)
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => nav(s.id)}
                      className={cn(
                        'relative flex h-20 w-full flex-col items-center justify-center gap-2 rounded-2xl border text-[12px] font-medium',
                        destino.tab === s.id ? 'border-accent-soft bg-white/10 text-white' : 'border-white/10 text-white/80',
                      )}
                    >
                      <span className={cn('grid size-9 place-items-center rounded-xl', destino.tab === s.id ? 'bg-accent text-white' : 'bg-white/[0.08]')}>
                        <Icon name={s.icon} size={18} />
                      </span>
                      {s.corto}
                      {n > 0 && (
                        <span className="absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10.5px] font-semibold text-white">
                          {n}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-[13px] text-white/80">
                <Icon name="store" size={16} /> Ver la tienda
              </Link>
              <button onClick={logout} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-[13px] text-white/80">
                <Icon name="logout" size={16} /> Salir
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  )
}
