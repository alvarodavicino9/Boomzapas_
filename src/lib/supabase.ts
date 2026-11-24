/**
 * Supabase (proyecto Boom Zapas): por ahora sólo para numerar y guardar los pedidos.
 * La clave publicable es pública a propósito (va en la web); la tabla `pedidos` está cerrada con RLS
 * y la web sólo puede llamar a la función `registrar_pedido`, que guarda el pedido y devuelve su número.
 */
export const SUPABASE_URL = 'https://ykimbmisgnciqdlbdntj.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_ivymCyAXsGH3rFvndq05pA__LqJ_hyF'

/** Número de pedido con 4 cifras: 1 → "0001". */
export const numeroPedido = (n: number) => String(n).padStart(4, '0')

/**
 * Guarda el pedido y devuelve su número correlativo (1, 2, 3…).
 * Si Supabase no responde en unos segundos devuelve null y el pedido sigue igual por WhatsApp.
 */
export async function registrarPedido(datos: Record<string, unknown>): Promise<number | null> {
  const ctrl = new AbortController()
  const t = window.setTimeout(() => ctrl.abort(), 5000)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/registrar_pedido`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p: datos }),
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    const n: unknown = await res.json()
    return typeof n === 'number' && n > 0 ? n : null
  } catch {
    return null
  } finally {
    window.clearTimeout(t)
  }
}
