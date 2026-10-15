import { bodyOf, db, route, text } from './_lib.js'

export default route(['GET', 'POST'], async (req, res) => {
  if (req.method === 'GET') {
    const { data, error } = await db()
      .from('resenas')
      .select('id, nombre, texto, modelo, puntaje, created_at')
      .eq('aprobada', true)
      .order('created_at', { ascending: false })
      .limit(60)
    if (error) throw error
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(data)
  }

  const b = bodyOf(req)
  const puntaje = Number(b.puntaje)
  const fila = {
    nombre: text(b.nombre, 'el nombre', { max: 60 }),
    texto: text(b.texto, 'el comentario', { min: 8, max: 600 }),
    modelo: typeof b.modelo === 'string' && b.modelo.trim() ? b.modelo.trim().slice(0, 80) : null,
    puntaje: Number.isInteger(puntaje) && puntaje >= 1 && puntaje <= 5 ? puntaje : null,
    aprobada: false, // se publica recién cuando el dueño la aprueba desde el panel
  }
  const { error } = await db().from('resenas').insert(fila)
  if (error) throw error
  res.status(200).json({ ok: true })
})
