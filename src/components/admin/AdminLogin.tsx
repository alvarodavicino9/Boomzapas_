import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

export function AdminLogin({ onEntrar }: { onEntrar: (mail: string, clave: string) => Promise<string | null> }) {
  const [mail, setMail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fallos, setFallos] = useState(0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mail.trim() || !clave) return setError('Completá el mail y la contraseña.')
    setLoading(true)
    setError(null)
    try {
      // cada intento fallido tarda un poco más (frena a quien quiera probar contraseñas)
      if (fallos) await new Promise((r) => setTimeout(r, Math.min(6000, 500 * 2 ** fallos)))
      const err = await onEntrar(mail, clave)
      if (err) {
        setFallos((f) => f + 1)
        setError(err)
      }
    } catch {
      setError('No pudimos conectar. Revisá internet y probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-gallery px-5"
      style={{ backgroundImage: 'radial-gradient(70% 55% at 50% 0%, rgb(var(--bz-glow, 150 12 20) / 0.35), transparent 70%)' }}
    >
      <form onSubmit={submit} className="surface relative w-full max-w-sm space-y-6 border border-line p-8" noValidate>
        <div className="text-center">
          <Logo size={72} className="mx-auto" />
          <h1 className="font-display mt-6 text-[1.6rem] font-bold leading-none">Panel Boom Zapas</h1>
          <p className="body-text mt-3">Pedidos, stock, caja, clientes y reseñas en un solo lugar.</p>
        </div>
        <label className="block">
          <span className="label block text-index">Mail</span>
          <input
            className="field-line normal-case mt-2"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            aria-invalid={!!error}
            autoFocus
          />
        </label>
        <label className="block">
          <span className="label block text-index">Contraseña</span>
          <input
            className="field-line normal-case mt-2"
            type="password"
            autoComplete="current-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            aria-invalid={!!error}
          />
        </label>
        {error && (
          <p role="alert" className="label text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" full disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
        <Link to="/" className="label block text-center text-index hover:text-ink hover:underline hover:underline-offset-[5px]">
          Volver a la tienda
        </Link>
      </form>
    </div>
  )
}
