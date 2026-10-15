export type AdminTab = 'resumen' | 'pedidos' | 'productos' | 'clientes' | 'resenas' | 'herramientas'

/** Navega a una sección, con un filtro opcional o abriendo un pedido. */
export type AdminNav = (tab: AdminTab, filtro?: string, pedidoId?: number | string) => void
