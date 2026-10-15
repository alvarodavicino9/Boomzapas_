import { ESTADOS, ESTADOS_VENTA, type PedidoAdmin } from './adminStore'
import type { Producto } from '@/types'

const DIA = 86400000
const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

export interface Dia {
  inicio: number
  label: string
  total: number
  pedidos: number
}

export interface Cliente {
  clave: string
  nombre: string
  telefono: string
  email?: string
  pedidos: number
  gastado: number
  pares: number
  ultimo: string
}

export interface AdminResumen {
  ingresos: number
  ventas: number
  ticket: number
  porCobrar: number
  pendientes: number
  porEnviar: number
  ingresos7: number
  ingresosPrev7: number
  delta: number | null
  serie: Dia[]
  porEstado: { estado: string; cantidad: number }[]
  topProductos: { nombre: string; marca: string; unidades: number; ingresos: number }[]
  topMarcas: { marca: string; unidades: number; ingresos: number }[]
  porMetodo: { metodo: string; cantidad: number; total: number }[]
}

const esVenta = (p: PedidoAdmin) => ESTADOS_VENTA.includes(p.estado)
const ts = (p: PedidoAdmin) => new Date(p.fecha).getTime() || 0

export function calcularResumen(pedidos: PedidoAdmin[], dias = 14): AdminResumen {
  const ventas = pedidos.filter(esVenta)
  const ingresos = ventas.reduce((a, p) => a + p.total, 0)
  const hoy = inicioDelDia(new Date())

  const serie: Dia[] = []
  for (let i = dias - 1; i >= 0; i--) {
    const inicio = hoy - i * DIA
    const d = new Date(inicio)
    serie.push({
      inicio,
      label: d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).replace('.', ''),
      total: 0,
      pedidos: 0,
    })
  }
  for (const p of ventas) {
    const idx = serie.findIndex((d) => ts(p) >= d.inicio && ts(p) < d.inicio + DIA)
    if (idx >= 0) {
      serie[idx].total += p.total
      serie[idx].pedidos += 1
    }
  }

  const suma = (desde: number, hasta: number) =>
    ventas.filter((p) => ts(p) >= desde && ts(p) < hasta).reduce((a, p) => a + p.total, 0)
  const ingresos7 = suma(hoy - 6 * DIA, hoy + DIA)
  const ingresosPrev7 = suma(hoy - 13 * DIA, hoy - 6 * DIA)

  const prod = new Map<string, { nombre: string; marca: string; unidades: number; ingresos: number }>()
  const marcas = new Map<string, { marca: string; unidades: number; ingresos: number }>()
  for (const p of ventas) {
    for (const it of p.items) {
      const a = prod.get(it.nombre) ?? { nombre: it.nombre, marca: it.marca, unidades: 0, ingresos: 0 }
      a.unidades += it.cantidad
      a.ingresos += it.cantidad * it.precio_unit
      prod.set(it.nombre, a)
      if (it.marca) {
        const m = marcas.get(it.marca) ?? { marca: it.marca, unidades: 0, ingresos: 0 }
        m.unidades += it.cantidad
        m.ingresos += it.cantidad * it.precio_unit
        marcas.set(it.marca, m)
      }
    }
  }

  const met = new Map<string, { metodo: string; cantidad: number; total: number }>()
  for (const p of ventas) {
    const m = met.get(p.metodo_pago) ?? { metodo: p.metodo_pago, cantidad: 0, total: 0 }
    m.cantidad += 1
    m.total += p.total
    met.set(p.metodo_pago, m)
  }

  return {
    ingresos,
    ventas: ventas.length,
    ticket: ventas.length ? ingresos / ventas.length : 0,
    porCobrar: pedidos.filter((p) => p.estado === 'pendiente').reduce((a, p) => a + p.total, 0),
    pendientes: pedidos.filter((p) => p.estado === 'pendiente').length,
    porEnviar: pedidos.filter((p) => p.estado === 'pagado').length,
    ingresos7,
    ingresosPrev7,
    delta: ingresosPrev7 > 0 ? ((ingresos7 - ingresosPrev7) / ingresosPrev7) * 100 : null,
    serie,
    porEstado: [...ESTADOS, ...new Set(pedidos.map((p) => p.estado).filter((e) => !ESTADOS.includes(e as never)))].map((estado) => ({
      estado,
      cantidad: pedidos.filter((p) => p.estado === estado).length,
    })),
    topProductos: [...prod.values()].sort((a, b) => b.unidades - a.unidades || b.ingresos - a.ingresos).slice(0, 5),
    topMarcas: [...marcas.values()].sort((a, b) => b.ingresos - a.ingresos).slice(0, 5),
    porMetodo: [...met.values()].sort((a, b) => b.total - a.total),
  }
}

export function agruparClientes(pedidos: PedidoAdmin[]): Cliente[] {
  const mapa = new Map<string, Cliente>()
  for (const p of pedidos) {
    if (p.estado === 'cancelado') continue
    const clave = (p.cliente.telefono || p.cliente.nombre).replace(/\D/g, '') || p.cliente.nombre.toLowerCase()
    const c = mapa.get(clave) ?? {
      clave,
      nombre: p.cliente.nombre,
      telefono: p.cliente.telefono,
      email: p.cliente.email,
      pedidos: 0,
      gastado: 0,
      pares: 0,
      ultimo: p.fecha,
    }
    c.pedidos += 1
    c.gastado += p.total
    c.pares += p.items.reduce((a, i) => a + i.cantidad, 0)
    if (p.fecha > c.ultimo) c.ultimo = p.fecha
    mapa.set(clave, c)
  }
  return [...mapa.values()].sort((a, b) => b.gastado - a.gastado)
}

export const totalStock = (p: Producto) => p.stock.reduce((a, s) => a + s.cantidad, 0)

/** Pocos pares por modelo: a partir de acá conviene reponer. */
export const LIMITE_STOCK_BAJO = 5

export type EstadoStock = { id: 'sin' | 'agotado' | 'bajo' | 'ok'; label: string; color: string }

export function estadoStock(p: Producto): EstadoStock {
  const total = totalStock(p)
  if (p.stock.length === 0) return { id: 'sin', label: 'Sin talles', color: '#8a7d80' }
  if (total <= 0) return { id: 'agotado', label: 'Agotado', color: '#ff6b73' }
  if (total <= LIMITE_STOCK_BAJO) return { id: 'bajo', label: 'Stock bajo', color: '#f0a93b' }
  return { id: 'ok', label: 'En stock', color: '#3fbf7f' }
}

export interface AlertaStock {
  producto: Producto
  total: number
  agotados: string[]
}

/** Modelos visibles agotados o con pocos pares, los más urgentes primero. */
export function alertasDeStock(productos: Producto[]): AlertaStock[] {
  return productos
    .filter((p) => !p.oculto && ['agotado', 'bajo'].includes(estadoStock(p).id))
    .map((producto) => ({
      producto,
      total: totalStock(producto),
      agotados: producto.stock.filter((s) => s.cantidad <= 0).map((s) => s.talle),
    }))
    .sort((a, b) => a.total - b.total || a.producto.nombre.localeCompare(b.producto.nombre))
}

export const metodoLabel = (m: string) =>
  ({ mercadopago: 'Mercado Pago', transferencia: 'Transferencia', whatsapp: 'WhatsApp' })[m] ?? m

/** Descarga un CSV (con BOM para que Excel lo abra bien con tildes). */
export function descargarCSV(nombre: string, filas: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const blob = new Blob(['﻿' + filas.map((f) => f.map(esc).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
  descargarBlob(nombre, blob)
}

export function descargarBlob(nombre: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
