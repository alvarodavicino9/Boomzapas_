import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { ApiError, MODO_DEMO, adminStats } from '@/lib/api'

export function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = value.trim()
    if (!token) return setError(MODO_DEMO ? 'Escribí una clave para entrar.' : 'Ingresá el token de administrador.')
    setLoading(true)
    setError(null)
    try {
      if (!MODO_DEMO) await adminStats(token) // valida el token contra el backend
      onLogin(token)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo validar el token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-gallery px-5"
      style={{ backgroundImage: 'radial-gradient(70% 55% at 50% 0%, rgb(var(--bz-glow, 150 12 20) / 0.35), transparent 70%)' }}
    >
      <form onSubmit={submit} className="surface relative w-full max-w-sm space-y-7 border border-line p-8" noValidate>
        <div className="text-center">
          <Logo size={72} className="mx-auto" />
          <h1 className="font-display mt-6 text-[1.6rem] font-bold leading-none">Panel Boom Zapas</h1>
          <p className="body-text mt-3">Pedidos, stock, clientes y reseñas en un solo lugar.</p>
        </div>
        <label className="block">
          <span className="label block text-index">{MODO_DEMO ? 'Clave' : 'Token de administrador'}</span>
          <input
            className="field-line normal-case mt-2"
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={!!error}
            autoFocus
          />
        </label>
        {MODO_DEMO && (
          <p className="flex items-start gap-2 rounded-xl bg-stage px-3 py-2.5 text-[12px] leading-4 text-index">
            <Icon name="alert" size={14} className="mt-px shrink-0 text-[#f0a93b]" />
            Modo local: entrá con cualquier clave. Los datos se guardan sólo en este navegador.
          </p>
        )}
        {error && (
          <p role="alert" className="label text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" full disabled={loading}>
          {loading ? 'Verificando' : 'Entrar'}
        </Button>
        <Link to="/" className="label block text-center text-index hover:text-ink hover:underline hover:underline-offset-[5px]">
          Volver a la tienda
        </Link>
      </form>
    </div>
  )
}
