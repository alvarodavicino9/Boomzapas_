import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { ApiError, adminStats } from '@/lib/api'

export function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = value.trim()
    if (!token) return setError('Ingresá el token de administrador.')
    setLoading(true)
    setError(null)
    try {
      await adminStats(token) // valida el token contra el backend
      onLogin(token)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo validar el token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-8 surface p-8" noValidate>
        <div>
          <Logo size={40} />
          <h1 className="display-product mt-8">Panel admin</h1>
          <p className="body-text mt-2">Ingresá tu token para gestionar pedidos y stock.</p>
        </div>
        <label className="block">
          <span className="label block text-index">Token</span>
          <input
            className="field-line normal-case"
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={!!error}
            autoFocus
          />
        </label>
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
