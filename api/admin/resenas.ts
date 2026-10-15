import { HttpError, bodyOf, db, param, requireAdmin, route } from '../_lib.js'

export default route(['GET', 'PATCH', 'DELETE'], async (req, res) => {
  requireAdmin(req)
  const supabase = db()

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('resenas').select('*').order('created_at', { ascending: false }).limit(200)
    if (error) throw error
    return res.status(200).json(data)
  }

  const id = Number(param(req, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Reseña inválida.')

  if (req.method === 'PATCH') {
    const { data, error } = await supabase.from('resenas').update({ aprobada: bodyOf(req).aprobada === true }).eq('id', id).select().single()
    if (error) throw error
    return res.status(200).json(data)
  }

  const { error } = await supabase.from('resenas').delete().eq('id', id)
  if (error) throw error
  res.status(200).json({ ok: true })
})
