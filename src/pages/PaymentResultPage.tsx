import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useCart } from '@/context/CartContext'
import { waLink } from '@/lib/whatsapp'

const TEXTOS = {
  exito: {
    eyebrow: 'Pago aprobado',
    titulo: '¡Gracias por tu compra!',
    texto: 'Recibimos tu pago. Estamos preparando tu pedido y te escribimos por WhatsApp para coordinar la entrega.',
  },
  pendiente: {
    eyebrow: 'Pago pendiente',
    titulo: 'Estamos esperando la acreditación',
    texto: 'Mercado Pago todavía no confirmó el pago. Apenas se acredite, tu pedido pasa a preparación. No hace falta que hagas nada más.',
  },
  error: {
    eyebrow: 'Pago no realizado',
    titulo: 'No se pudo completar el pago',
    texto: 'No se cobró nada. Podés volver a intentarlo desde el catálogo o escribirnos y te ayudamos a cerrar la compra.',
  },
} as const

/** A donde vuelve el cliente después de pagar en Mercado Pago (/pago/exito, /pago/pendiente, /pago/error). */
export default function PaymentResultPage() {
  const { resultado } = useParams()
  const [q] = useSearchParams()
  const clave = resultado === 'exito' || resultado === 'pendiente' ? resultado : 'error'
  const t = TEXTOS[clave]
  const pedido = q.get('external_reference')
  const { clear } = useCart()

  // El pedido ya está registrado: se vacía el carrito sólo si el pago se hizo o está en camino.
  useEffect(() => {
    if (clave !== 'error') clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  return (
    <section className="page-x flex min-h-[70vh] flex-col items-start justify-center py-20">
      <p className="label mb-5 text-accent">{t.eyebrow}</p>
      <h1 className="display-section">{t.titulo}</h1>
      <p className="body-text mt-5 max-w-lg">{t.texto}</p>
      {pedido && <p className="label mt-6 text-index">Pedido #{pedido}</p>}
      <div className="mt-9 flex flex-wrap gap-3">
        <Button to={clave === 'error' ? '/catalogo' : '/'} size="lg">
          {clave === 'error' ? 'Volver al catálogo' : 'Seguir comprando'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          href={waLink(`Hola Boom Zapas. Te escribo por mi pedido${pedido ? ` #${pedido}` : ''}.`)}
        >
          <Icon name="whatsapp" size={18} className="mr-2" /> Escribirnos
        </Button>
      </div>
    </section>
  )
}
