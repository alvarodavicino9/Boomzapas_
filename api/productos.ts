import { db, route } from './_lib.js'

export default route(['GET'], async (_req, res) => {
  const { data, error } = await db().from('productos').select('*, stock(*)').eq('activo', true).order('id')
  if (error) throw error
  // Un respiro de caché para que la tienda cargue rápido sin mostrar stock viejo por mucho tiempo.
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=60')
  res.status(200).json(data)
})
