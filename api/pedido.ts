import { HttpError, bodyOf, db, route, text } from './_lib.js'
import { crearPreferencia, mpConfigurado } from './_mp.js'

const METODOS = ['mercadopago', 'transferencia', 'whatsapp']
/** Descuento por unidad al pagar por transferencia / efectivo (igual que en la tienda). */
const DESCUENTO_TRANSFERENCIA = 5000

interface ItemIn {
  producto_id: number
  talle: string
  cantidad: number
}

function leerItems(raw: unknown): ItemIn[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 20) throw new HttpError(400, 'El pedido no tiene productos.')
  return raw.map((it) => {
    const o = (it ?? {}) as Record<string, unknown>
    const producto_id = Number(o.producto_id)
    const cantidad = Number(o.cantidad)
    const talle = String(o.talle ?? '').trim()
    if (!Number.isInteger(producto_id) || producto_id <= 0 || !talle || talle.length > 6) throw new HttpError(400, 'Hay un producto inválido en el pedido.')
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10) throw new HttpError(400, 'Cantidad inválida.')
    return { producto_id, talle, cantidad }
  })
}

export default route(['POST'], async (req, res) => {
  const body = bodyOf(req)
  const c = (body.cliente ?? {}) as Record<string, unknown>
  const nombre = text(c.nombre, 'el nombre', { max: 120 })
  const telefono = text(c.telefono, 'el teléfono', { min: 6, max: 30 })
  const email = typeof c.email === 'string' && c.email.trim() ? text(c.email, 'el email', { max: 160 }) : undefined
  const metodo_pago = String(body.metodo_pago ?? '')
  if (!METODOS.includes(metodo_pago)) throw new HttpError(400, 'Medio de pago inválido.')
  const notas = typeof body.notas === 'string' ? body.notas.trim().slice(0, 500) : ''
  const items = leerItems(body.items)

  const supabase = db()

  // Los precios y el stock se leen de la base: no se confía en lo que manda el navegador.
  const ids = [...new Set(items.map((i) => i.producto_id))]
  const { data: prods, error: pe } = await supabase.from('productos').select('id, nombre, precio, activo, stock(talle, cantidad)').in('id', ids)
  if (pe) throw pe
  const porId = new Map((prods ?? []).map((p) => [Number(p.id), p as { id: number; nombre: string; precio: number; activo: boolean; stock: { talle: string; cantidad: number }[] }]))

  const pedidos = new Map<string, number>()
  for (const it of items) {
    const k = `${it.producto_id}|${it.talle}`
    pedidos.set(k, (pedidos.get(k) ?? 0) + it.cantidad)
  }
  const lineas = items.map((it) => {
    const p = porId.get(it.producto_id)
    if (!p || p.activo === false) throw new HttpError(409, 'Uno de los productos ya no está disponible.')
    const fila = p.stock.find((s) => String(s.talle) === it.talle)
    if (!fila || fila.cantidad < (pedidos.get(`${it.producto_id}|${it.talle}`) ?? 0)) {
      throw new HttpError(409, `No hay stock suficiente del talle ${it.talle}. Actualizá la página e intentá de nuevo.`)
    }
    const precio_unit = Math.max(0, Number(p.precio) - (metodo_pago === 'transferencia' ? DESCUENTO_TRANSFERENCIA : 0))
    return { ...it, precio_unit, nombre: p.nombre }
  })
  const total = lineas.reduce((s, i) => s + i.precio_unit * i.cantidad, 0)

  // Cliente: se reutiliza si ya compró con el mismo teléfono.
  let cliente_id: number | null = null
  const { data: existente } = await supabase.from('clientes').select('id').eq('telefono', telefono).limit(1).maybeSingle()
  if (existente?.id) {
    cliente_id = existente.id
  } else {
    const { data: nuevo } = await supabase.from('clientes').insert({ nombre, telefono, ...(email ? { email } : {}) }).select('id').single()
    cliente_id = nuevo?.id ?? null
  }

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert({ cliente_id, total, estado: 'pendiente', metodo_pago, notas })
    .select('id')
    .single()
  if (error) throw error

  const { error: ie } = await supabase.from('pedido_items').insert(lineas.map(({ nombre: _nombre, ...l }) => ({ ...l, pedido_id: pedido.id })))
  if (ie) {
    await supabase.from('pedidos').delete().eq('id', pedido.id)
    throw ie
  }

  // Reserva el stock. Si alguien compró el mismo par justo antes, se deshace el pedido.
  for (const [k, cant] of pedidos) {
    const [pid, talle] = k.split('|')
    const actual = porId.get(Number(pid))!.stock.find((s) => String(s.talle) === talle)!.cantidad
    const { data: upd } = await supabase
      .from('stock')
      .update({ cantidad: actual - cant })
      .eq('producto_id', Number(pid))
      .eq('talle', talle)
      .eq('cantidad', actual)
      .select('cantidad')
    if (!upd || upd.length === 0) {
      await supabase.from('pedido_items').delete().eq('pedido_id', pedido.id)
      await supabase.from('pedidos').delete().eq('id', pedido.id)
      throw new HttpError(409, 'Alguien se llevó ese par justo antes. Actualizá la página e intentá de nuevo.')
    }
  }

  // Mercado Pago: se crea el link de pago de Checkout Pro. Si falla, el pedido igual queda registrado
  // y la tienda ofrece cerrarlo por WhatsApp.
  let init_point: string | undefined
  if (metodo_pago === 'mercadopago' && mpConfigurado()) {
    try {
      const pref = await crearPreferencia({
        req,
        pedidoId: pedido.id,
        items: lineas.map((l) => ({ title: `${l.nombre} · Talle ${l.talle}`, quantity: l.cantidad, unit_price: l.precio_unit })),
        payer: { name: nombre, email },
      })
      init_point = pref.init_point
    } catch (e) {
      console.error('Mercado Pago:', e)
    }
  }

  res.status(200).json({ ok: true, pedido_id: pedido.id, total, ...(init_point ? { init_point } : {}) })
})
