import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import type { Req } from './_lib.js'

export const mpConfigurado = () => !!process.env.MP_ACCESS_TOKEN

export function mpClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('Falta configurar MP_ACCESS_TOKEN en Vercel.')
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } })
}

/** Dirección pública de la tienda (para los links de vuelta y el webhook). */
export function siteUrl(req: Req): string {
  const fija = process.env.SITE_URL?.replace(/\/$/, '')
  if (fija) return fija
  const host = req.headers['x-forwarded-host'] ?? req.headers.host
  return `https://${Array.isArray(host) ? host[0] : host}`
}

export interface ItemMP {
  title: string
  quantity: number
  unit_price: number
}

/** Crea la preferencia de Checkout Pro y devuelve el link de pago. */
export async function crearPreferencia(opts: {
  req: Req
  pedidoId: number
  items: ItemMP[]
  payer?: { name?: string; email?: string }
}): Promise<{ id: string; init_point: string }> {
  const base = siteUrl(opts.req)
  const r = await new Preference(mpClient()).create({
    body: {
      items: opts.items.map((i, n) => ({ id: String(n + 1), currency_id: 'ARS', ...i })),
      external_reference: String(opts.pedidoId),
      statement_descriptor: 'BOOM ZAPAS',
      payer: opts.payer?.email ? { name: opts.payer.name, email: opts.payer.email } : undefined,
      back_urls: {
        success: `${base}/pago/exito`,
        pending: `${base}/pago/pendiente`,
        failure: `${base}/pago/error`,
      },
      auto_return: 'approved',
      notification_url: `${base}/api/mp/webhook`,
    },
  })
  if (!r.id || !r.init_point) throw new Error('Mercado Pago no devolvió el link de pago.')
  return { id: r.id, init_point: r.init_point }
}

export const leerPago = (id: string) => new Payment(mpClient()).get({ id })
