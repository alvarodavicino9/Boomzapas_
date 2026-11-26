import { useCallback, useEffect, useState } from 'react'
import { haySesionGuardada, nube } from '@/lib/nube'
import { vaciarPanel } from '@/lib/adminStore'

export type EstadoSesion = 'cargando' | 'fuera' | 'dentro'

/** ¿Este mail está en la lista de administradores de Supabase? */
async function esAdmin(): Promise<boolean> {
  const sb = await nube()
  const { data, error } = await sb.rpc('es_admin')
  return !error && data === true
}

/**
 * Sesión del panel con Supabase (mail y contraseña).
 * `token` queda con el mail de quien entró (vacío si no hay sesión), para no cambiar el resto del panel.
 */
export function useAdminToken() {
  const [estado, setEstado] = useState<EstadoSesion>(() => (haySesionGuardada() ? 'cargando' : 'fuera'))
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!haySesionGuardada()) return
    let vivo = true
    ;(async () => {
      const sb = await nube()
      const { data } = await sb.auth.getSession()
      if (!vivo) return
      if (data.session && (await esAdmin())) {
        setEmail(data.session.user.email ?? '')
        setEstado('dentro')
      } else {
        if (data.session) await sb.auth.signOut()
        setEstado('fuera')
      }
    })().catch(() => vivo && setEstado('fuera'))
    return () => {
      vivo = false
    }
  }, [])

  /** Devuelve un mensaje de error, o null si entró. */
  const entrar = useCallback(async (mail: string, clave: string): Promise<string | null> => {
    const sb = await nube()
    const { data, error } = await sb.auth.signInWithPassword({ email: mail.trim().toLowerCase(), password: clave })
    if (error || !data.session) {
      if (error && /confirm/i.test(error.message)) return 'Falta confirmar ese mail en Supabase.'
      return 'Mail o contraseña incorrectos.'
    }
    if (!(await esAdmin())) {
      await sb.auth.signOut()
      return 'Ese mail no tiene acceso al panel.'
    }
    setEmail(data.session.user.email ?? mail)
    setEstado('dentro')
    return null
  }, [])

  const logout = useCallback(async () => {
    try {
      const sb = await nube()
      await sb.auth.signOut()
    } catch {
      /* igual se cierra */
    }
    vaciarPanel()
    setEmail('')
    setEstado('fuera')
  }, [])

  return { estado, token: estado === 'dentro' ? email || 'admin' : '', email, entrar, logout }
}
