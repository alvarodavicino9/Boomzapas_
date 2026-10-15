import { HttpError, bodyOf, db, requireAdmin, route } from '../_lib.js'

export default route(['PATCH'], async (req, res) => {
  requireAdmin(req)
  const b = bodyOf(req)
  const producto_id = Number(b.producto_id)
  const cantidad = Number(b.cantidad)
  const talle = String(b.talle ?? '').trim()
  if (!Number.isInteger(producto_id) || producto_id <= 0 || !talle) throw new HttpError(400, 'Producto o talle inválido.')
  if (!Number.isInteger(cantidad) || cantidad < 0 || cantidad > 999) throw new HttpError(400, 'Cantidad inválida.')

  // Se actualiza la fila existente (no upsert: evita el error de clave única que ya tuvimos).
  const { data, error } = await db().from('stock').update({ cantidad }).eq('producto_id', producto_id).eq('talle', talle).select().single()
  if (error) throw error
  res.status(200).json(data)
})
