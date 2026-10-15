import { useCallback, useState } from 'react'

const KEY = 'bz_admin_token'

const read = () => {
  try {
    return sessionStorage.getItem(KEY) ?? ''
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
