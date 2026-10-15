import { db, requireAdmin, route } from '../_lib.js'

type Rel<T> = T | T[] | null

const uno = <T>(v: Rel<T>): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

interface Fila {
  id: number
  created_at?: string
  total: number
  estado: string
  metodo_pago: string
  notas: string | null
  clientes: Rel<{ nombre: string | null; telefono: string | null; email: string | null }>
  pedido_items: {
    producto_id: number
    talle: string
    cantidad: number
    precio_unit: number
    productos: Rel<{ nombre: string; marca: string | null }>
  }[]
}

export default route(['GET'], async (req, res) => {
  requireAdmin(req)
  const supabase = db()

  // Pedidos con cliente y productos. Si la base no tiene esas relaciones, se usa la vista de siempre.
  const rico = await supabase
    .from('pedidos')
    .select(
      'id, created_at, total, estado, metodo_pago, notas, clientes(nombre, telefono, email), pedido_items(producto_id, talle, cantidad, precio_unit, productos(nombre, marca))',
    )
    .order('id', { ascending: false })
    .limit(300)

  if (!rico.error && rico.data) {
    const filas = (rico.data as unknown as Fila[]).map((p) => {
      const c = uno(p.clientes)
      return {
        id: p.id,
        created_at: p.created_at,
        total: p.total,
        estado: p.estado,
        metodo_pago: p.metodo_pago,
        notas: p.notas,
        cliente_nombre: c?.nombre ?? null,
        telefono: c?.telefono ?? null,
        email: c?.email ?? null,
        items: (p.pedido_items ?? []).map((i) => {
          const pr = uno(i.productos)
          return { producto_id: i.producto_id, nombre: pr?.nombre, marca: pr?.marca, talle: i.talle, cantidad: i.cantidad, precio_unit: i.precio_unit }
        }),
      }
    })
    return res.status(200).json(filas)
  }

  const { data, error } = await supabase.from('vista_pedidos').select('*').limit(300)
  if (error) throw error
  res.status(200).json(data)
})
