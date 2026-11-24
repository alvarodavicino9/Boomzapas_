/**
 * Clave del panel (/admin) mientras la tienda funciona sin servidor (modo local).
 * Se guarda sólo el "hash" (PBKDF2-SHA256, 310.000 vueltas): la clave real no está en el código.
 * Para cambiarla: generá un hash nuevo (salt + hash en base64) con la misma receta y reemplazá estos dos valores.
 * Ojo: en modo local los datos del panel viven en el navegador de quien lo usa; la protección fuerte llega
 * cuando el panel se conecte al servidor (ADMIN_TOKEN en Vercel).
 */
const SAL = '3jGXJJjon6BlRT8FNIGY9A=='
const HASH = '8m8hl4M099k+VcC3bqQMTa7DNkodqnLLhf8dc+CYZX0='
const VUELTAS = 310000

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
const aB64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)))

/** Marca de sesión válida: no es la clave, es el hash (así no queda la clave guardada en el navegador). */
export const SESION_ADMIN = `local:${HASH}`

export async function claveCorrecta(clave: string): Promise<boolean> {
  try {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave.trim().toLowerCase()), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: b64(SAL), iterations: VUELTAS }, base, 256)
    const calc = aB64(bits)
    // comparación sin cortar antes (no da pistas por el tiempo)
    let dif = calc.length ^ HASH.length
    for (let i = 0; i < Math.max(calc.length, HASH.length); i++) dif |= (calc.charCodeAt(i) || 0) ^ (HASH.charCodeAt(i) || 0)
    return dif === 0
  } catch {
    return false
  }
}
