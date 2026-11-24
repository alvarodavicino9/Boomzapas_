import { useCallback, useState } from 'react'
import { MODO_DEMO } from '@/lib/api'
import { SESION_ADMIN } from '@/lib/claveAdmin'

const KEY = 'bz_admin_token'

const read = () => {
  try {
    const v = sessionStorage.getItem(KEY) ?? ''
    // en modo local sólo vale la marca que deja la clave correcta
    if (MODO_DEMO && v !== SESION_ADMIN) return ''
    return v
  } catch {
    return ''
  }
}

/** El token vive sólo en la sesión del navegador (se borra al cerrar la pestaña). */
export function useAdminToken() {
  const [token, setTokenState] = useState(read)

  const setToken = useCallback((value: string) => {
    try {
      if (value) sessionStorage.setItem(KEY, value)
      else sessionStorage.removeItem(KEY)
    } catch {
      /* sin storage: el token queda sólo en memoria */
    }
    setTokenState(value)
  }, [])

  return { token, setToken, logout: () => setToken('') }
}
