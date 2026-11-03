import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, Empty, Field, PageTitle, Pills } from './ui'
import { CompraMercaderia } from './CompraMercaderia'
import { useUI } from '@/context/UIContext'
import {
  CATEGORIAS_GASTO,
  CATEGORIAS_INGRESO,
  ESTADOS_VENTA,
  MEDIOS,
  NO_OPERATIVOS,
  agregarMovimiento,
  eliminarMovimiento,
  type Movimiento,
  type PedidoAdmin,
  type TipoMovimiento,
} from '@/lib/adminStore'
import { PERIODOS, calcularResumen, descargarCSV, enRango, metodoLabel, rangoPeriodo, type Periodo } from '@/lib/adminStats'
import { cn, formatARS, formatDate } from '@/lib/format'
import type { Producto } from '@/types'

interface Props {
  pedidos: PedidoAdmin[]
  productos: Producto[]
  caja: Movimiento[]
  costos: Record<number, number>
  setStock: (p: Producto, talle: string, cantidad: number) => Promise<void>
}

/** Una línea del libro de caja: venta de la web/local o movimiento cargado a mano. */
interface Linea {
  id: string
  fecha: string
  tipo: TipoMovimiento
  categoria: string
  concepto: string
  monto: number
  medio: string
  manual: boolean
}

const MEDIO_DE_PEDIDO: Record<string, string> = {
  transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
}

const hoyISO = () => new Date().toISOString().slice(0, 10)

export function Caja({ pedidos, productos, caja, costos, setStock }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [ver, setVer] = useState<'todo' | 'ingreso' | 'gasto'>('todo')
  const [nuevo, setNuevo] = useState<TipoMovimiento | null>(null)
  const [compra, setCompra] = useState(false)
  const [borrar, setBorrar] = useState<string | null>(null)
  const { toast } = useUI()

  const rango = rangoPeriodo(periodo)
  const r = useMemo(() => calcularResumen(pedidos, periodo, costos, caja), [pedidos, periodo, costos, caja])

  const lineas = useMemo<Linea[]>(() => {
    const ventas: Linea[] = pedidos
      .filter((p) => ESTADOS_VENTA.includes(p.estado) && enRango(p.fecha, rango.desde, rango.hasta))
      .map((p) => ({
        id: `p${p.id}`,
        fecha: p.fecha,
        tipo: 'ingreso',
        categoria: 'Ventas',
        concepto: `Pedido #${p.id} · ${p.cliente.nombre}`,
        monto: p.total,
        medio: MEDIO_DE_PEDIDO[p.metodo_pago] ?? metodoLabel(p.metodo_pago),
        manual: false,
      }))
    const manuales: Linea[] = caja
      .filter((m) => enRango(m.fecha, rango.desde, rango.hasta))
      .map((m) => ({ ...m, manual: true }))
    return [...ventas, ...manuales].sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [pedidos, caja, rango.desde, rango.hasta])

  const entra = lineas.filter((l) => l.tipo === 'ingreso').reduce((a, l) => a + l.monto, 0)
  const sale = lineas.filter((l) => l.tipo === 'gasto').reduce((a, l) => a + l.monto, 0)
  const saldo = entra - sale

  const porCategoria = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of lineas) if (l.tipo === 'gasto') m.set(l.categoria, (m.get(l.categoria) ?? 0) + l.monto)
    return [...m.entries()].map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total)
  }, [lineas])

  const porMedio = useMemo(() => {
    const m = new Map<string, { entra: number; sale: number }>()
    for (const l of lineas) {
      const x = m.get(l.medio) ?? { entra: 0, sale: 0 }
      if (l.tipo === 'ingreso') x.entra += l.monto
      else x.sale += l.monto
      m.set(l.medio, x)
    }
    return [...m.entries()].map(([medio, v]) => ({ medio, ...v, saldo: v.entra - v.sale })).sort((a, b) => b.entra - a.entra)
  }, [lineas])

  const visibles = ver === 'todo' ? lineas : lineas.filter((l) => l.tipo === ver)

  const exportar = () => {
    descargarCSV(`caja-boomzapas-${hoyISO()}.csv`, [
      ['Fecha', 'Tipo', 'Categoría', 'Concepto', 'Medio', 'Monto'],
      ...lineas.map((l) => [formatDate(l.fecha), l.tipo === 'ingreso' ? 'Ingreso' : 'Gasto', l.categoria, l.concepto, l.medio, l.tipo === 'ingreso' ? l.monto : -l.monto]),
    ])
    toast('Caja exportada')
  }

  return (
    <div>
      <PageTitle
        title="Caja"
        subtitle={`Lo que entró y salió en ${rango.label}.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompra(true)}>
              <Icon name="box" size={15} className="mr-2" /> Cargar mercadería
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNuevo('ingreso')}>
              <Icon name="plus" size={15} className="mr-2" /> Ingreso
            </Button>
            <Button size="sm" onClick={() => setNuevo('gasto')}>
              <Icon name="minus" size={15} className="mr-2" /> Gasto
            </Button>
          </div>
        }
      />

      <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="w-max sm:w-auto">
          <Pills value={periodo} onChange={setPeriodo} options={PERIODOS} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Numero label="Entró" valor={formatARS(entra)} sub={`${r.ventas} ventas y otros ingresos`} tono="ok" icon="trend" />
        <Numero label="Salió" valor={formatARS(sale)} sub={`${lineas.filter((l) => l.tipo === 'gasto').length} gastos`} tono="mal" icon="receipt" />
        <Numero label="Saldo" valor={formatARS(saldo)} sub="Entró menos salió" tono={saldo >= 0 ? 'ok' : 'mal'} icon="card" fuerte />
        <Numero
          label="Ganancia"
          valor={r.gananciaNeta === null ? '—' : formatARS(r.gananciaNeta)}
          sub={
            r.gananciaNeta === null
              ? 'Cargá el costo de los modelos'
              : r.cobertura < 0.999
                ? `Con costo en ${Math.round(r.cobertura * 100)}% de los pares`
                : 'Ventas − costo − gastos'
          }
          icon="star"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.15fr] [&>*]:min-w-0">
        <Card title="Cómo se calcula la ganancia" hint="Para saber cuánto deja el negocio, no sólo cuánto se movió.">
          <dl className="divide-y divide-line rounded-xl border border-line px-4 text-[13.5px]">
            <Renglon l="Ventas" v={formatARS(r.ingresos)} />
            <Renglon l="Costo de los pares vendidos" v={`− ${formatARS(r.costoVendido)}`} />
            <Renglon l="Ganancia bruta" v={r.gananciaBruta === null ? '—' : formatARS(r.gananciaBruta)} fuerte />
            <Renglon l="Gastos del negocio" v={`− ${formatARS(r.gastos)}`} />
            <Renglon l="Ganancia neta" v={r.gananciaNeta === null ? '—' : formatARS(r.gananciaNeta)} fuerte />
          </dl>
          <p className="mt-3 text-[12px] leading-4 text-index">
            Las compras de mercadería y los retiros del dueño no restan acá: la mercadería ya cuenta como costo cuando se vende.
            {r.cobertura < 0.999 && r.pares > 0 && ' Cargá el costo de cada modelo en Productos para que el número sea exacto.'}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Card title="Gastos por tipo">
            {porCategoria.length === 0 ? (
              <Empty>Sin gastos en este período.</Empty>
            ) : (
              <ul className="space-y-3">
                {porCategoria.map((c) => (
                  <li key={c.categoria}>
                    <div className="mb-1 flex justify-between gap-2 text-[12.5px]">
                      <span className="truncate">
                        {c.categoria}
                        {NO_OPERATIVOS.includes(c.categoria) && <span className="text-index"> · no resta</span>}
                      </span>
                      <span className="shrink-0 text-index">{formatARS(c.total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-stage">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(c.total / porCategoria[0].total) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Por medio de pago">
            {porMedio.length === 0 ? (
              <Empty>Sin movimientos.</Empty>
            ) : (
              <ul className="space-y-2.5">
                {porMedio.map((m) => (
                  <li key={m.medio} className="flex items-center justify-between gap-3 text-[13px]">
                    <span>
                      {m.medio}
                      <span className="block text-[11.5px] text-index">
                        +{formatARS(m.entra)} · −{formatARS(m.sale)}
                      </span>
                    </span>
                    <span className={cn('font-semibold', m.saldo < 0 && 'text-danger')}>{formatARS(m.saldo)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card
        className="mt-4"
        title="Movimientos"
        hint="Las ventas pagadas se suman solas. Los gastos y otros ingresos se cargan a mano."
        pad={false}
        action={
          <Button variant="outline" size="sm" onClick={exportar} disabled={lineas.length === 0}>
            <Icon name="download" size={15} className="mr-2" /> CSV
          </Button>
        }
      >
        <div className="px-5 pt-4 sm:px-6">
          <Pills
            value={ver}
            onChange={setVer}
            options={[
              { id: 'todo', label: 'Todo', count: lineas.length },
              { id: 'ingreso', label: 'Ingresos', count: lineas.filter((l) => l.tipo === 'ingreso').length },
              { id: 'gasto', label: 'Gastos', count: lineas.filter((l) => l.tipo === 'gasto').length },
            ]}
          />
        </div>
        {visibles.length === 0 ? (
          <div className="p-5 sm:p-6">
            <Empty>No hay movimientos en este período.</Empty>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line border-t border-line">
            {visibles.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full',
                    l.tipo === 'ingreso' ? 'bg-[#3fbf7f]/15 text-[#3fbf7f]' : 'bg-danger/15 text-danger',
                  )}
                >
                  <Icon name={l.tipo === 'ingreso' ? 'plus' : 'minus'} size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{l.concepto || l.categoria}</span>
                  <span className="block truncate text-[12px] text-index">
                    {formatDate(l.fecha)} · {l.categoria} · {l.medio}
                  </span>
                </span>
                <span className={cn('shrink-0 text-[14px] font-semibold', l.tipo === 'ingreso' ? 'text-[#3fbf7f]' : 'text-ink')}>
                  {l.tipo === 'ingreso' ? '+' : '−'}
                  {formatARS(l.monto)}
                </span>
                {l.manual &&
                  (borrar === l.id ? (
                    <span className="flex shrink-0 gap-1">
                      <button
                        onClick={() => {
                          eliminarMovimiento(l.id)
                          setBorrar(null)
                          toast('Movimiento borrado')
                        }}
                        className="label rounded-full border border-danger px-3 py-1.5 text-danger"
                      >
                        Borrar
                      </button>
                      <button onClick={() => setBorrar(null)} className="label rounded-full border border-line px-3 py-1.5">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setBorrar(l.id)}
                      aria-label="Borrar movimiento"
                      className="grid size-8 shrink-0 place-items-center rounded-full text-index hover:bg-stage hover:text-danger"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  ))}
                {!l.manual && <span className="size-8 shrink-0" aria-hidden="true" />}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <MovimientoNuevo tipo={nuevo} onClose={() => setNuevo(null)} />
      <CompraMercaderia open={compra} onClose={() => setCompra(false)} productos={productos} setStock={setStock} />
    </div>
  )
}

function Numero({
  label,
  valor,
  sub,
  tono,
  icon,
  fuerte,
}: {
  label: string
  valor: string
  sub: string
  tono?: 'ok' | 'mal'
  icon: 'trend' | 'receipt' | 'card' | 'star'
  fuerte?: boolean
}) {
  return (
    <div className={cn('surface border p-4 sm:p-5', fuerte ? 'border-accent/50' : 'border-line')}>
      <div className="flex items-center justify-between">
        <p className="label text-index">{label}</p>
        <span className={cn('grid size-8 place-items-center rounded-full', fuerte ? 'bg-accent text-on-accent' : 'bg-stage')}>
          <Icon name={icon} size={15} />
        </span>
      </div>
      <p
        className={cn(
          'mt-3 whitespace-nowrap font-display text-[1.05rem] font-bold leading-none tracking-tight min-[420px]:text-[1.3rem] sm:text-[1.6rem] lg:text-[1.45rem] xl:text-[1.8rem]',
          tono === 'mal' && valor !== '$ 0' && 'text-danger',
        )}
      >
        {valor}
      </p>
      <p className="mt-2 text-[12px] leading-4 text-index">{sub}</p>
    </div>
  )
}

function Renglon({ l, v, fuerte }: { l: string; v: string; fuerte?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <dt className={fuerte ? 'font-semibold' : 'text-index'}>{l}</dt>
      <dd className={fuerte ? 'font-display text-lg font-bold' : 'font-medium'}>{v}</dd>
    </div>
  )
}

function MovimientoNuevo({ tipo, onClose }: { tipo: TipoMovimiento | null; onClose: () => void }) {
  const cats = tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO
  const [categoria, setCategoria] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [medio, setMedio] = useState(MEDIOS[0])
  const [fecha, setFecha] = useState(hoyISO())
  const [error, setError] = useState('')
  const { toast } = useUI()

  const cerrar = () => {
    setCategoria('')
    setConcepto('')
    setMonto('')
    setError('')
    setFecha(hoyISO())
    onClose()
  }

  const guardar = () => {
    const n = Number(monto)
    if (!(n > 0)) return setError('Poné un monto válido.')
    agregarMovimiento({
      fecha: new Date(`${fecha}T12:00:00`).toISOString(),
      tipo: tipo!,
      categoria: categoria || cats[cats.length - 1],
      concepto: concepto.trim(),
      monto: Math.round(n),
      medio,
    })
    toast(tipo === 'ingreso' ? 'Ingreso anotado' : 'Gasto anotado')
    cerrar()
  }

  return (
    <Modal open={!!tipo} onClose={cerrar} title={tipo === 'ingreso' ? 'Nuevo ingreso' : 'Nuevo gasto'} size="md">
      <div className="space-y-4 px-5 py-5 sm:px-8">
        <Field label="Tipo">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                aria-pressed={categoria === c}
                className={cn(
                  'h-9 rounded-full border px-3.5 text-[12.5px] font-medium',
                  categoria === c ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card hover:border-control',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Detalle">
          <input
            className="field-line normal-case"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder={tipo === 'ingreso' ? 'Ej: venta en feria' : 'Ej: publicidad de la semana'}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monto ($)">
            <input className="field-line" type="number" min={0} inputMode="numeric" value={monto} onChange={(e) => setMonto(e.target.value)} autoFocus />
          </Field>
          <Field label="Fecha">
            <input className="field-line" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>
        </div>
        <Field label="Medio">
          <select className="field-line normal-case" value={medio} onChange={(e) => setMedio(e.target.value)}>
            {MEDIOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        {tipo === 'gasto' && categoria === 'Mercadería' && (
          <p className="rounded-xl border border-line bg-stage px-4 py-3 text-[12.5px] leading-5 text-index">
            Si entraron pares, usá <strong className="text-ink">Cargar mercadería</strong>: además del gasto, los suma al stock.
          </p>
        )}
        {error && (
          <p role="alert" className="label text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" onClick={cerrar}>
            Cancelar
          </Button>
          <Button onClick={guardar}>Guardar</Button>
        </div>
      </div>
    </Modal>
  )
}
