import { ESTADOS, HttpError, bodyOf, db, param, requireAdmin, route } from '../../_lib.js'

export default route(['PATCH'], async (req, res) => {
  requireAdmin(req)
  const id = Number(param(req, 'id'))
  const estado = String(bodyOf(req).estado ?? '')
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Pedido inválido.')
  if (!(ESTADOS as readonly string[]).includes(estado)) throw new HttpError(400, 'Estado inválido.')

  const supabase = db()
  const { data: actual, error: ge } = await supabase.from('pedidos').select('estado').eq('id', id).single()
  if (ge) throw ge

  const { data, error } = await supabase.from('pedidos').update({ estado }).eq('id', id).select().single()
  if (error) throw error

  // Al cancelar se devuelve el stock; si se des-cancela, se vuelve a reservar.
  if ((estado === 'cancelado') !== (actual.estado === 'cancelado')) {
    const signo = estado === 'cancelado' ? 1 : -1
    const { data: items } = await supabase.from('pedido_items').select('producto_id, talle, cantidad').eq('pedido_id', id)
    for (const it of items ?? []) {
      const { data: fila } = await supabase.from('stock').select('cantidad').eq('producto_id', it.producto_id).eq('talle', it.talle).maybeSingle()
      if (fila) {
        await supabase
          .from('stock')
          .update({ cantidad: Math.max(0, fila.cantidad + signo * it.cantidad) })
          .eq('producto_id', it.producto_id)
          .eq('talle', it.talle)
      }
    }
  }
  res.status(200).json(data)
})
