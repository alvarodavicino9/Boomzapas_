import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { MODO_DEMO } from '@/lib/api'
import { OrderSummary } from './OrderSummary'
import { SITE } from '@/config/site'
import { useCopy } from '@/hooks/useCopy'
import { aplicaPromo, cn, formatARS, planCuotas, PROMO, precioUnitario } from '@/lib/format'
import { buildOrderMessage, waLink, type DatosCliente } from '@/lib/whatsapp'
import type { CartItem, MetodoPago, TipoEntrega } from '@/types'

export interface OrderResult {
  pedidoId?: number | string
  /** Número de pedido (BZ-261124-1733-K7: fecha, hora y 2 letras), para buscarlo y archivarlo. */
  codigo: string
  fecha: Date
  items: CartItem[]
  total: number
  metodo: MetodoPago
  /** Cuotas con Mercado Pago (1 = un pago). */
  cuotas: number
  entrega: TipoEntrega
  cliente: DatosCliente
  /** true si el pedido no pudo registrarse en el servidor y se coordina sólo por WhatsApp. */
  offline: boolean
}

export function DoneStep({ order, onClose }: { order: OrderResult; onClose: () => void }) {
  const { copied, copy } = useCopy()
  const { pedidoId, codigo, fecha, items, total, metodo, cuotas, entrega, cliente, offline } = order
  const plan = planCuotas(total, metodo === 'mercadopago' ? cuotas : 1)
  const pares = items.reduce((n, i) => n + i.cantidad, 0)

  // Sin servidor (modo local) igual se muestran los datos de pago: el pedido se confirma por WhatsApp.
  const showPay = !offline || MODO_DEMO

  const message = (comprobante = false) =>
    buildOrderMessage({ codigo, fecha, items, metodo, cuotas, entrega, cliente, pedidoId, comprobante })

  const conComprobante = metodo === 'transferencia' && showPay
  const pendiente = offline // el pedido todavía no llegó a la tienda: falta enviarlo por WhatsApp
  const textoBoton = conComprobante ? 'Enviar pedido y comprobante' : 'Enviar pedido por WhatsApp'

  const pasos = [
    { t: `Tocá “${textoBoton}”`, d: 'Se abre WhatsApp con tu pedido completo ya escrito.' },
    { t: 'Envialo sin cambiar nada', d: 'Así nos llega con todos tus datos y el número de pedido.' },
    {
      t:
        metodo === 'mercadopago'
          ? 'Te mandamos el link de pago'
          : metodo === 'transferencia'
            ? 'Confirmamos tu transferencia'
            : 'Coordinamos el pago',
      d: entrega === 'envio' ? 'Y despachamos tu pedido con número de seguimiento.' : 'Y te avisamos cuando esté listo para retirar.',
    },
  ]

  return (
    <div className="space-y-6 px-5 pb-8 pt-7 sm:px-8">
      {/* número de pedido + título */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[11px]">
            <Icon name="receipt" size={14} className="text-accent" />
            Pedido N° <span className="font-mono text-[12px] normal-case tracking-normal text-ink">{codigo}</span>
            {pedidoId ? <span className="text-index">· #{pedidoId}</span> : null}
          </span>
          <button onClick={() => copy(codigo, 'codigo')} className="label link-u text-[11px] text-index hover:text-ink">
            {copied === 'codigo' ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <h3 className="display-product mt-4">
          {pendiente ? (MODO_DEMO ? '¡Último paso! Enviá tu pedido' : 'Falta enviarlo por WhatsApp') : '¡Pedido recibido!'}
        </h3>
        <p className="body-text mt-2">
          {pendiente
            ? MODO_DEMO
              ? 'Tu pedido se confirma por WhatsApp. Revisá el resumen y envialo: te respondemos enseguida.'
              : 'No pudimos registrarlo en el sistema. Envianos el pedido por WhatsApp para confirmarlo.'
            : 'Nos contactamos con vos a la brevedad para confirmarlo.'}
        </p>
      </div>

      {/* pasos */}
      {pendiente && (
        <ol className="space-y-3">
          {pasos.map((p, n) => (
            <li key={n} className="flex gap-3.5">
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold',
                  n === 0 ? 'bg-accent text-white' : 'border border-line text-index',
                )}
              >
                {n + 1}
              </span>
              <span className="min-w-0 pt-0.5 text-[14px] leading-5">
                <span className="font-semibold">{p.t}</span>
                <span className="block text-[13px] text-index">{p.d}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* acción principal */}
      <div className="grid gap-2">
        <Button size="lg" variant="accent" full href={waLink(message(conComprobante))}>
          <Icon name="whatsapp" size={19} /> {textoBoton}
        </Button>
        <p className="text-center text-[12px] text-index">
          ¿No se abrió? Escribinos al {SITE.whatsappDisplay} con tu número de pedido.
        </p>
      </div>

      {/* pago y entrega */}
      <div className="grid gap-3">
        <Ficha icon="card" titulo="Pago">
          {metodo === 'mercadopago' ? (
            <>
              <span className="block font-semibold">Mercado Pago · {plan.cuotas > 1 ? `${plan.cuotas} cuotas de ${formatARS(plan.cuota)}` : '1 pago'}</span>
              <span className="block text-index">
                Link de pago por {formatARS(plan.total)}
                {plan.cuotas > 1 ? ' (con recargo)' : ''}
              </span>
            </>
          ) : metodo === 'transferencia' ? (
            <>
              <span className="block font-semibold">Transferencia · {formatARS(total)}</span>
              <span className="block text-index">Datos para transferir abajo</span>
            </>
          ) : (
            <>
              <span className="block font-semibold">A coordinar por WhatsApp</span>
              <span className="block text-index">Total {formatARS(total)}</span>
            </>
          )}
        </Ficha>
        <Ficha icon={entrega === 'envio' ? 'truck' : 'pin'} titulo={entrega === 'envio' ? 'Envío gratis' : 'Retiro sin costo'}>
          {entrega === 'envio' ? (
            <>
              <span className="block truncate font-semibold">
                {cliente.envio ? `${cliente.envio.calle} ${cliente.envio.numero}${cliente.envio.piso ? ` · Piso/depto ${cliente.envio.piso}` : ''}` : cliente.direccion}
              </span>
              <span className="block text-index">
                {cliente.envio ? `${cliente.envio.localidad} · CP ${cliente.envio.cp} · ` : ''}3 a 7 días hábiles
              </span>
            </>
          ) : (
            <>
              <span className="block font-semibold">{SITE.address}</span>
              <span className="block text-index">{SITE.hours.map((h) => `${h.dias} ${h.horario}`).join(' · ')}</span>
            </>
          )}
        </Ficha>
      </div>

      {metodo === 'transferencia' && showPay && (
        <div className="surface p-5">
          <p className="label mb-4 text-index">Datos para transferir</p>
          <dl className="space-y-3 text-[14px]">
            <Row label="Titular" value={SITE.bank.holder} />
            <Row label="Banco" value={SITE.bank.bank} />
            <Row label="Alias" value={SITE.bank.alias} onCopy={() => copy(SITE.bank.alias, 'alias')} copied={copied === 'alias'} />
            <Row label="CBU" value={SITE.bank.cbu} mono onCopy={() => copy(SITE.bank.cbu, 'cbu')} copied={copied === 'cbu'} />
            <Row label="Importe" value={formatARS(total)} strong />
          </dl>
          <p className="label mt-4 text-index">Transferí y enviá el comprobante con el botón de arriba.</p>
        </div>
      )}

      <OrderSummary
        items={items}
        total={total}
        unitPrice={aplicaPromo(pares) ? (i) => precioUnitario(i.precio, pares) : undefined}
        discountLabel={aplicaPromo(pares) ? `Promo ${PROMO.minimo} pares o más: ${formatARS(PROMO.descuento)} off en cada par.` : undefined}
        enCuotas={plan.cuotas > 1 ? plan : undefined}
      />

      <Button variant="outline" full onClick={onClose}>
        Seguir comprando
      </Button>
    </div>
  )
}

function Ficha({ icon, titulo, children }: { icon: IconName; titulo: string; children: ReactNode }) {
  return (
    <div className="surface flex gap-3 p-4 text-[13px] leading-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
        <Icon name={icon} size={17} />
      </span>
      <span className="min-w-0">
        <span className="label mb-1 block text-[10.5px] text-index">{titulo}</span>
        {children}
      </span>
    </div>
  )
}

interface RowProps {
  label: string
  value: string
  mono?: boolean
  strong?: boolean
  onCopy?: () => void
  copied?: boolean
}

function Row({ label, value, mono, strong, onCopy, copied }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-index">{label}</dt>
      <dd className="flex min-w-0 items-center gap-3">
        <span className={`truncate ${mono ? 'font-mono text-[12px]' : ''} ${strong ? 'font-display text-2xl' : ''}`}>{value}</span>
        {onCopy && (
          <button onClick={onCopy} aria-label={`Copiar ${label}`} className="label link-u shrink-0">
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        )}
      </dd>
    </div>
  )
}
