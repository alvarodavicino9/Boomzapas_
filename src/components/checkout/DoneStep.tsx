import { Button } from '@/components/ui/Button'
import { MODO_DEMO } from '@/lib/api'
import { OrderSummary } from './OrderSummary'
import { SITE } from '@/config/site'
import { useCopy } from '@/hooks/useCopy'
import { formatARS, transferPrice } from '@/lib/format'
import { buildOrderMessage, waLink } from '@/lib/whatsapp'
import type { CartItem, MetodoPago, TipoEntrega } from '@/types'

export interface OrderResult {
  pedidoId?: number | string
  items: CartItem[]
  total: number
  metodo: MetodoPago
  entrega: TipoEntrega
  nombre: string
  /** true si el pedido no pudo registrarse en el servidor y se coordina sólo por WhatsApp. */
  offline: boolean
}

export function DoneStep({ order, onClose }: { order: OrderResult; onClose: () => void }) {
  const { copied, copy } = useCopy()
  const { pedidoId, items, total, metodo, entrega, nombre, offline } = order

  // Sin servidor (modo local) igual se muestran los datos de pago: el pedido se confirma por WhatsApp.
  const showPay = !offline || MODO_DEMO

  const message = (comprobante = false) =>
    buildOrderMessage({ items, total, metodo, entrega, nombre, pedidoId, comprobante })

  return (
    <div className="space-y-7 px-5 pb-8 pt-8 sm:px-8">
      <div>
        <p className="label text-index">{offline ? 'Un paso más' : pedidoId ? `Pedido #${pedidoId}` : 'Pedido'}</p>
        <h3 className="display-product mt-3">{offline ? (MODO_DEMO ? 'Enviá tu pedido por WhatsApp' : 'Falta enviarlo por WhatsApp') : 'Pedido recibido'}</h3>
        <p className="body-text mt-3">
          {offline
            ? MODO_DEMO
              ? 'Los pedidos se confirman por WhatsApp. Enviános el detalle y coordinamos el pago y la entrega.'
              : 'No pudimos registrarlo en el sistema. Enviános el pedido por WhatsApp para confirmarlo.'
            : 'Nos contactamos con vos a la brevedad para confirmarlo.'}
        </p>
      </div>

      {metodo === 'transferencia' && showPay && (
        <div className="surface p-5">
          <p className="label mb-4 text-index">Datos para transferir</p>
          <dl className="space-y-3 text-[14px]">
            <Row label="Titular" value={SITE.bank.holder} />
            <Row label="Banco" value={SITE.bank.bank} />
            <Row label="Alias" value={SITE.bank.alias} onCopy={() => copy(SITE.bank.alias, 'alias')} copied={copied === 'alias'} />
            <Row label="CBU" value={SITE.bank.cbu} mono onCopy={() => copy(SITE.bank.cbu, 'cbu')} copied={copied === 'cbu'} />
            <Row label="Importe" value={formatARS(items.reduce((s, i) => s + transferPrice(i.precio) * i.cantidad, 0))} strong />
          </dl>
          <p className="label mt-4 text-index">Enviá el comprobante por WhatsApp para confirmar tu pedido.</p>
        </div>
      )}

      {metodo === 'mercadopago' && showPay && (
        <p className="body-text surface p-5">
          Te enviamos el <span className="text-ink">link de pago de Mercado Pago</span> por WhatsApp. Apenas se acredite,
          preparamos tu pedido.
        </p>
      )}

      <OrderSummary items={items} total={total} />

      <div className="grid gap-3">
        <Button size="lg" full href={waLink(message(metodo === 'transferencia' && showPay))}>
          {metodo === 'transferencia' && showPay
            ? 'Enviar comprobante'
            : metodo === 'mercadopago' && showPay
              ? 'Pedir link de pago'
              : 'Enviar pedido por WhatsApp'}
        </Button>
        <Button variant="outline" full onClick={onClose}>
          Volver a la tienda
        </Button>
      </div>
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
