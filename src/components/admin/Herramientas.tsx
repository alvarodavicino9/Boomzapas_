import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, Field, PageTitle } from './ui'
import { useUI } from '@/context/UIContext'
import { descargarBlob, descargarCSV, agruparClientes, metodoLabel, totalStock } from '@/lib/adminStats'
import { exportarRespaldo, importarRespaldo, restablecerDatosLocales, type PedidoAdmin } from '@/lib/adminStore'
import { MODO_DEMO } from '@/lib/api'
import { SITE } from '@/config/site'
import { formatARS, formatDate, transferPrice } from '@/lib/format'
import type { Producto } from '@/types'

const copiar = async (t: string) => {
  try {
    await navigator.clipboard.writeText(t)
    return true
  } catch {
    return false
  }
}

const hola = (n: string) => (n ? `Hola ${n}!` : 'Hola!')

const redondear = (n: number, paso = 500) => Math.round(n / paso) * paso

function Calculadora() {
  const [costo, setCosto] = useState('')
  const [margen, setMargen] = useState('40')
  const [comision, setComision] = useState('0')
  const c = Number(costo) || 0
  const m = Number(margen) || 0
  const k = Math.min(0.5, Math.max(0, Number(comision) || 0) / 100)
  const lista = c > 0 ? redondear((c * (1 + m / 100)) / (1 - k)) : 0
  const transf = lista > 0 ? transferPrice(lista) : 0
  const gananciaLista = lista * (1 - k) - c
  const gananciaTransf = transf - c
  const Fila = ({ l, v, fuerte }: { l: string; v: string; fuerte?: boolean }) => (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-[13px] text-index">{l}</span>
      <span className={fuerte ? 'font-display text-xl font-bold' : 'text-[14px] font-semibold'}>{v}</span>
    </div>
  )
  return (
    <Card title="Calculadora de precios" hint="Del costo al precio de lista y al precio por transferencia.">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Costo ($)">
          <input className="field-line" type="number" min={0} inputMode="numeric" value={costo} onChange={(e) => setCosto(e.target.value)} />
        </Field>
        <Field label="Margen %">
          <input className="field-line" type="number" min={0} inputMode="decimal" value={margen} onChange={(e) => setMargen(e.target.value)} />
        </Field>
        <Field label="Comisión %">
          <input className="field-line" type="number" min={0} inputMode="decimal" value={comision} onChange={(e) => setComision(e.target.value)} />
        </Field>
      </div>
      <div className="mt-4 divide-y divide-line rounded-xl border border-line px-4">
        <Fila l="Precio de lista sugerido" v={lista ? formatARS(lista) : '—'} fuerte />
        <Fila l={`Por transferencia (−${formatARS(SITE.transferDiscount)})`} v={lista ? formatARS(transf) : '—'} />
        <Fila l="Ganancia a precio de lista" v={lista ? formatARS(gananciaLista) : '—'} />
        <Fila l="Ganancia por transferencia" v={lista ? formatARS(gananciaTransf) : '—'} />
        <Fila l="Margen real por transferencia" v={lista && c ? `${((gananciaTransf / c) * 100).toFixed(0)}%` : '—'} />
      </div>
      <p className="mt-3 text-[12px] leading-4 text-index">La comisión es la que te cobra el medio de pago (Mercado Pago, por ejemplo). Poné 0 si no aplica.</p>
    </Card>
  )
}

const PLANTILLAS = [
  {
    id: 'datos',
    label: 'Datos para pagar',
    texto: (n: string) =>
      `${hola(n)} Para abonar tu pedido: alias ${SITE.bank.alias} · ${SITE.bank.holder} (${SITE.bank.bank}). CBU ${SITE.bank.cbu}. Cuando transfieras, mandanos el comprobante 🙏`,
  },
  {
    id: 'recibido',
    label: 'Pago recibido',
    texto: (n: string) => `${hola(n)} Recibimos tu pago ✅ Ya estamos preparando tu pedido. Te avisamos cuando salga.`,
  },
  {
    id: 'enviado',
    label: 'Pedido enviado',
    texto: (n: string) => `${hola(n)} Tu pedido ya fue despachado por Correo Argentino 📦. Código de seguimiento: `,
  },
  {
    id: 'retiro',
    label: 'Listo para retirar',
    texto: (n: string) => `${hola(n)} Tu pedido ya está listo para retirar en ${SITE.address}. Horarios: ${SITE.hours.map((h) => `${h.dias} ${h.horario}`).join(' · ')}.`,
  },
  {
    id: 'talle',
    label: 'Consultar talle',
    texto: (n: string) => `${hola(n)} Antes de enviarte el par, ¿me confirmás tu talle? Te paso la tabla en la web: los talles pueden variar 0,5 cm según la marca.`,
  },
  {
    id: 'resena',
    label: 'Pedir reseña',
    texto: (n: string) => `${hola(n)} ¿Cómo te fueron las zapatillas? Si te gustaron, nos ayuda muchísimo una reseña en la web 🙌 Gracias por elegirnos.`,
  },
]

function Mensajes() {
  const [id, setId] = useState(PLANTILLAS[0].id)
  const [nombre, setNombre] = useState('')
  const [texto, setTexto] = useState('')
  const { toast } = useUI()
  const plantilla = PLANTILLAS.find((p) => p.id === id)!
  const base = plantilla.texto(nombre.trim().split(' ')[0])
  const contenido = texto || base

  return (
    <Card title="Mensajes rápidos de WhatsApp" hint="Elegí uno, personalizalo y copialo o abrilo en WhatsApp.">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mensaje">
            <select
              className="field-line normal-case"
              value={id}
              onChange={(e) => {
                setId(e.target.value)
                setTexto('')
              }}
            >
              {PLANTILLAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre del cliente">
            <input
              className="field-line normal-case"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                setTexto('')
              }}
            />
          </Field>
        </div>
        <textarea className="field-line normal-case" rows={5} value={contenido} onChange={(e) => setTexto(e.target.value)} aria-label="Texto del mensaje" />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => toast((await copiar(contenido)) ? 'Mensaje copiado' : 'No se pudo copiar')}
          >
            <Icon name="copy" size={14} className="mr-2" /> Copiar
          </Button>
          <Button size="sm" href={`https://wa.me/?text=${encodeURIComponent(contenido)}`}>
            <Icon name="whatsapp" size={15} className="mr-2" /> Abrir en WhatsApp
          </Button>
        </div>
      </div>
    </Card>
  )
}

function DatosCobro() {
  const { toast } = useUI()
  const filas = [
    { l: 'Titular', v: SITE.bank.holder },
    { l: 'Alias', v: SITE.bank.alias },
    { l: 'CBU', v: SITE.bank.cbu },
    { l: 'Banco', v: SITE.bank.bank },
  ]
  return (
    <Card title="Datos para cobrar" hint="Tocá para copiar y pegarlos en el chat.">
      <ul className="space-y-2">
        {filas.map((f) => (
          <li key={f.l}>
            <button
              onClick={async () => toast((await copiar(f.v)) ? `${f.l} copiado` : 'No se pudo copiar')}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-left hover:border-control"
            >
              <span>
                <span className="label block text-index">{f.l}</span>
                <span className="block break-all text-[14px] font-medium">{f.v}</span>
              </span>
              <Icon name="copy" size={16} className="shrink-0 text-index" />
            </button>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={async () =>
          toast(
            (await copiar(`Alias: ${SITE.bank.alias}\nTitular: ${SITE.bank.holder}\nCBU: ${SITE.bank.cbu}\nBanco: ${SITE.bank.bank}`))
              ? 'Datos completos copiados'
              : 'No se pudo copiar',
          )
        }
      >
        Copiar todo junto
      </Button>
    </Card>
  )
}

function Exportar({ pedidos, productos }: { pedidos: PedidoAdmin[]; productos: Producto[] }) {
  const { toast } = useUI()
  const hoy = new Date().toISOString().slice(0, 10)
  const acciones = [
    {
      t: 'Pedidos',
      d: `${pedidos.length} pedidos con cliente, productos, pago y estado`,
      go: () =>
        descargarCSV(`pedidos-${hoy}.csv`, [
          ['Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Productos', 'Pago', 'Total', 'Estado'],
          ...pedidos.map((p) => [
            p.id,
            formatDate(p.fecha),
            p.cliente.nombre,
            p.cliente.telefono,
            p.items.map((i) => `${i.nombre} T${i.talle} x${i.cantidad}`).join(' + '),
            metodoLabel(p.metodo_pago),
            p.total,
            p.estado,
          ]),
        ]),
    },
    {
      t: 'Stock por talle',
      d: `${productos.reduce((a, p) => a + totalStock(p), 0)} pares en ${productos.length} modelos`,
      go: () =>
        descargarCSV(`stock-${hoy}.csv`, [
          ['Modelo', 'Marca', 'Categoría', 'Precio', 'Talle', 'Cantidad'],
          ...productos.flatMap((p) => p.stock.map((s) => [p.nombre, p.marca, p.categoria, p.precio, s.talle, s.cantidad])),
        ]),
    },
    {
      t: 'Clientes',
      d: 'Con pedidos, pares y total gastado',
      go: () =>
        descargarCSV(`clientes-${hoy}.csv`, [
          ['Cliente', 'Teléfono', 'Pedidos', 'Pares', 'Gastado'],
          ...agruparClientes(pedidos).map((c) => [c.nombre, c.telefono, c.pedidos, c.pares, c.gastado]),
        ]),
    },
  ]
  return (
    <Card title="Exportar a Excel" hint="Archivos CSV que abre Excel o Google Sheets.">
      <ul className="space-y-2">
        {acciones.map((a) => (
          <li key={a.t}>
            <button
              onClick={() => (a.go(), toast(`${a.t}: archivo descargado`))}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-left hover:border-control"
            >
              <span>
                <span className="block text-[14px] font-medium">{a.t}</span>
                <span className="block text-[12px] text-index">{a.d}</span>
              </span>
              <Icon name="download" size={17} className="shrink-0 text-index" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Datos() {
  const { toast } = useUI()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmar, setConfirmar] = useState(false)

  const restaurar = async (f?: File) => {
    if (!f) return
    toast(importarRespaldo(await f.text()) ? 'Respaldo restaurado' : 'Ese archivo no es un respaldo válido')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Card title="Respaldo de datos" hint="En modo local, pedidos, stock y productos se guardan sólo en este navegador.">
      <div className="space-y-3">
        <Button
          variant="outline"
          full
          onClick={() => {
            descargarBlob(`respaldo-boomzapas-${new Date().toISOString().slice(0, 10)}.json`, new Blob([exportarRespaldo()], { type: 'application/json' }))
            toast('Respaldo descargado')
          }}
        >
          <Icon name="download" size={15} className="mr-2" /> Descargar respaldo
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => restaurar(e.target.files?.[0])} />
        <Button variant="outline" full onClick={() => fileRef.current?.click()}>
          Restaurar desde un respaldo
        </Button>
        {confirmar ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="!border-danger !text-danger"
              onClick={() => {
                restablecerDatosLocales()
                setConfirmar(false)
                toast('Datos de ejemplo restablecidos')
              }}
            >
              Sí, restablecer todo
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmar(false)}>
              No
            </Button>
          </div>
        ) : (
          <button onClick={() => setConfirmar(true)} className="label inline-flex items-center gap-2 text-index hover:text-danger">
            <Icon name="refresh" size={15} /> Volver a los datos de ejemplo
          </button>
        )}
      </div>
    </Card>
  )
}

export function Herramientas({ pedidos, productos }: { pedidos: PedidoAdmin[]; productos: Producto[] }) {
  const enlaces = useMemo(
    () => [
      { t: 'Ver la tienda', h: '/', i: 'store' as const, interno: true },
      { t: 'Instagram', h: SITE.instagramUrl, i: 'instagram' as const },
      { t: 'WhatsApp del local', h: `https://wa.me/${SITE.whatsapp}`, i: 'whatsapp' as const },
    ],
    [],
  )
  return (
    <div>
      <PageTitle title="Herramientas" subtitle="Atajos para el día a día del local." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Calculadora />
        <Mensajes />
        <DatosCobro />
        <Exportar pedidos={pedidos} productos={productos} />
        {MODO_DEMO && <Datos />}
        <Card title="Accesos rápidos">
          <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {enlaces.map((e) => (
              <li key={e.t}>
                <a
                  href={e.h}
                  {...(e.interno ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-[13.5px] font-medium hover:border-control"
                >
                  <Icon name={e.i} size={17} className="text-accent-soft" /> {e.t}
                  <Icon name="external" size={13} className="ml-auto text-index" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
