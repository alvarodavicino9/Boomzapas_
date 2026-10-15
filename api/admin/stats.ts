import { db, requireAdmin, route } from '../_lib.js'

export default route(['GET'], async (req, res) => {
  requireAdmin(req)
  const [pedidos, stockBajo] = await Promise.all([
    db().from('pedidos').select('estado, total'),
    db().from('stock').select('*, productos(nombre)').lt('cantidad', 3),
  ])
  if (pedidos.error) throw pedidos.error
  const filas = pedidos.data ?? []
  const ventas = filas.filter((p) => ['pagado', 'enviado', 'entregado'].includes(p.estado))
  res.status(200).json({
    total_pedidos: filas.length,
    pedidos_pagados: ventas.length,
    ingresos_total: ventas.reduce((s, p) => s + Number(p.total), 0),
    stock_bajo: stockBajo.data ?? [],
  })
})
