export type Categoria = 'urbanas' | 'running' | 'lifestyle'
export type FiltroCategoria = 'todos' | Categoria

export interface StockTalle {
  producto_id: number
  talle: string
  cantidad: number
}

export interface Producto {
  id: number
  nombre: string
  marca: string
  categoria: string
  precio: number
  imagenes: string[]
  descripcion: string
  stock: StockTalle[]
  /** Marcado como nuevo desde el backend (opcional). */
  nuevo?: boolean
  /** Fecha de alta (ISO), si la tabla la trae. */
  creado?: string
  /** Oculto en la tienda desde el panel (modo local). */
  oculto?: boolean
}

export interface CartItem {
  /** `${productoId}-${talle}` */
  key: string
  productoId: number
  nombre: string
  marca: string
  precio: number
  imagen?: string
  talle: string
  cantidad: number
  /** Stock disponible para ese talle al momento de agregarlo (para limitar la cantidad). */
  max: number
}

export type MetodoPago = 'mercadopago' | 'transferencia' | 'whatsapp'
export type TipoEntrega = 'envio' | 'retiro'

export interface PedidoPayload {
  cliente: { nombre: string; telefono: string; email?: string }
  items: { producto_id: number; talle: string; cantidad: number; precio_unit: number }[]
  metodo_pago: MetodoPago
  notas: string
}

export interface PedidoCreado {
  ok: boolean
  pedido_id: number | string
  total: number
  /** Link de pago de Mercado Pago (Checkout Pro), si el pago es con Mercado Pago. */
  init_point?: string
}

export type EstadoPedido = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado'

export interface AdminStats {
  total_pedidos: number
  pedidos_pagados: number
  ingresos_total: number
  stock_bajo: {
    producto_id: number
    talle: string
    cantidad: number
    productos?: { nombre: string } | null
  }[]
}

/** La vista `vista_pedidos` puede tener columnas distintas: se lee de forma tolerante. */
export type PedidoRow = Record<string, unknown> & { id: number | string }
