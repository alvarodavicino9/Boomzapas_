import { createHmac, timingSafeEqual } from 'node:crypto'
import { HttpError, db, param, route, type Req } from '../_lib.js'
import { leerPago, mpConfigurado } from '../_mp.js'

/** Si hay MP_WEBHOOK_SECRET, comprueba que el aviso lo mandó Mercado Pago (firma x-signature). */
function firmaValida(req: Req, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // sin clave configurada: igual se confirma el pago consultándolo a Mercado Pago
  const h = (n: string) => {
    const v = req.headers[n]
    return Array.isArray(v) ? v[0] : v
  }
  const firma = h('x-signature') ?? ''
  const ts = /ts=([^,]+)/.exec(firma)?.[1]
  const v1 = /v1=([^,]+)/.exec(firma)?.[1]
  if (!ts || !v1) return false
  const manifest = `id:${dataId.toLowerCase()};request-id:${h('x-request-id') ?? ''};ts:${ts};`
  const esperado = createHmac('sha256', secret).update(manifest).digest('hex')
  const a = Buffer.from(esperado)
  const b = Buffer.from(v1)
  return a.length === b.length && timingSafeEqual(a, b)
}

export default route(['POST', 'GET'], async (req, res) => {
  if (!mpConfigurado()) throw new HttpError(500, 'Mercado Pago no está configurado.')

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as { type?: string; data?: { id?: string | number } }
  const tipo = param(req, 'type') || param(req, 'topic') || body.type || ''
  const dataId = String(param(req, 'data.id') || param(req, 'id') || body.data?.id || '')

  // Mercado Pago avisa de muchas cosas; sólo nos importan los pagos.
  if (tipo !== 'payment' || !dataId) return res.status(200).json({ ok: true, ignorado: true })
  if (!firmaValida(req, dataId)) throw new HttpError(401, 'Firma inválida.')

  // El estado real se consulta a Mercado Pago con nuestra clave: lo que llega en el aviso no se da por cierto.
  const pago = await leerPago(dataId)
  const pedidoId = Number(pago.external_reference)
  if (!Number.isInteger(pedidoId) || pedidoId <= 0) return res.status(200).json({ ok: true, ignorado: true })

  if (pago.status === 'approved') {
    const supabase = db()
    const { data: pedido } = await supabase.from('pedidos').select('estado, total').eq('id', pedidoId).maybeSingle()
    if (pedido && pedido.estado === 'pendiente' && Number(pago.transaction_amount) >= Number(pedido.total)) {
      await supabase.from('pedidos').update({ estado: 'pagado' }).eq('id', pedidoId)
    }
  }
  res.status(200).json({ ok: true })
})
