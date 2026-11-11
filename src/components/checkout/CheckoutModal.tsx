import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CustomerStep, EMPTY_FORM, direccionCompleta, validateCustomer, type CustomerErrors, type CustomerForm } from './CustomerStep'
import { codigoPedido, type DatosCliente } from '@/lib/whatsapp'
import { PaymentStep } from './PaymentStep'
import { DoneStep, type OrderResult } from './DoneStep'
import { useCart } from '@/context/CartContext'
import { useUI } from '@/context/UIContext'
import { ApiError, MODO_DEMO, crearPedido } from '@/lib/api'
import { cn, descuentoPromo, precioUnitario } from '@/lib/format'
import { registrarPedidoDeTienda } from '@/lib/adminStore'
import type { MetodoPago, PedidoPayload } from '@/types'

type Step = 'datos' | 'pago' | 'listo'

const STEPS: { id: Step; label: string }[] = [
  { id: 'datos', label: 'Tus datos' },
  { id: 'pago', label: 'Pago' },
  { id: 'listo', label: 'Listo' },
]

const TITLES: Record<Step, string> = { datos: 'Confirmar pedido', pago: 'Medio de pago', listo: 'Pedido' }

export function CheckoutModal() {
  const { checkoutOpen, closeCheckout } = useUI()
  const { items, subtotal, count, clear } = useCart()

  const [step, setStep] = useState<Step>('datos')
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [metodo, setMetodo] = useState<MetodoPago>('mercadopago')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderResult | null>(null)

  // Al reabrir después de un pedido terminado, arranca de cero (conservando los datos del cliente).
  useEffect(() => {
    if (checkoutOpen && step === 'listo') {
      setStep('datos')
      setOrder(null)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutOpen])

  // Promo: llevando 2 pares o más, $5.000 off por cada par (con cualquier medio de pago).
  const total = subtotal - descuentoPromo(count)

  const patchForm = (patch: Partial<CustomerForm>) => {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((e) => {
      const next = { ...e }
      for (const k of Object.keys(patch) as (keyof CustomerForm)[]) delete next[k]
      return next
    })
  }

  const goPayment = () => {
    const e = validateCustomer(form)
    setErrors(e)
    if (Object.keys(e).length === 0) setStep('pago')
    // lleva al primer dato que falta
    else setTimeout(() => document.querySelector<HTMLElement>('[role="dialog"] [aria-invalid="true"]')?.focus(), 30)
  }

  const datosCliente = (): DatosCliente => ({
    nombre: form.nombre.trim(),
    telefono: form.telefono.trim(),
    dni: form.dni.replace(/\D/g, '') || undefined,
    email: form.email.trim() || undefined,
    direccion: form.entrega === 'envio' ? direccionCompleta(form) : undefined,
    referencias: form.entrega === 'envio' ? form.referencias.trim() || undefined : undefined,
    notas: form.notas.trim() || undefined,
    origen: form.origen || undefined,
  })

  const buildNotas = (codigo: string) => {
    const c = datosCliente()
    return [
      `Código ${codigo}`,
      form.entrega === 'envio' ? `Envío: ${c.direccion}` : 'Retiro en el showroom',
      c.referencias && `Referencias: ${c.referencias}`,
      c.dni && `DNI: ${c.dni}`,
      c.email && `Email: ${c.email}`,
      c.notas && `Notas: ${c.notas}`,
      c.origen && `Nos conoció por: ${c.origen}`,
    ]
      .filter(Boolean)
      .join(' | ')
  }

  const finish = (pedidoId: number | string | undefined, offline: boolean, codigo = codigoPedido()) => {
    setOrder({
      pedidoId,
      codigo,
      fecha: new Date(),
      items,
      total,
      metodo,
      entrega: form.entrega,
      cliente: datosCliente(),
      offline,
    })
    clear()
    setStep('listo')
  }

  const confirm = async () => {
    setSubmitting(true)
    setError(null)
    const codigo = codigoPedido()

    const payload: PedidoPayload = {
      cliente: {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
      },
      items: items.map((i) => ({
        producto_id: i.productoId,
        talle: i.talle,
        cantidad: i.cantidad,
        precio_unit: precioUnitario(i.precio, count),
      })),
      metodo_pago: metodo,
      notas: buildNotas(codigo),
    }

    if (MODO_DEMO) {
      // Sin servidor conectado: el pedido se confirma por WhatsApp (y queda anotado en el panel de este navegador).
      registrarPedidoDeTienda({
        items,
        total,
        metodo,
        entrega: form.entrega,
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim() || undefined,
        direccion: form.entrega === 'envio' ? direccionCompleta(form) : undefined,
      })
      finish(undefined, true, codigo)
      setSubmitting(false)
      return
    }

    try {
      const res = await crearPedido(payload)
      // Mercado Pago: el servidor devuelve el link de pago de Checkout Pro y llevamos al cliente ahí.
      // Al volver, la página /pago/… confirma el resultado (y el webhook marca el pedido como pagado).
      if (res.init_point) {
        window.location.assign(res.init_point)
        return
      }
      finish(res.pedido_id, false, codigo)
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 0
          ? e.message
          : 'No pudimos registrar el pedido en este momento. Probá de nuevo o enviá el pedido por WhatsApp.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const empty = items.length === 0 && step !== 'listo'

  return (
    <Modal open={checkoutOpen} onClose={closeCheckout} title={TITLES[step]} size="md">
      {empty ? (
        <div className="space-y-5 px-5 py-10 sm:px-8">
          <p className="display-product">Tu pedido está vacío</p>
          <Button to="/catalogo" onClick={closeCheckout} variant="outline">
            Ver catálogo
          </Button>
        </div>
      ) : (
        <>
          <ol className="label flex items-center gap-5 px-5 pt-6 sm:px-8" aria-label="Progreso">
            {STEPS.map((s, i) => (
              <li key={s.id} aria-current={i === stepIndex ? 'step' : undefined}>
                <span className={cn(i === stepIndex ? 'link-active' : i < stepIndex ? 'text-ink' : 'text-index')}>
                  {String(i + 1).padStart(2, '0')} {s.label}
                </span>
              </li>
            ))}
          </ol>

          {step === 'datos' && <CustomerStep form={form} errors={errors} onChange={patchForm} onNext={goPayment} />}
          {step === 'pago' && (
            <PaymentStep
              items={items}
              metodo={metodo}
              onMetodo={setMetodo}
              total={total}
              submitting={submitting}
              error={error}
              onBack={() => {
                setError(null)
                setStep('datos')
              }}
              onConfirm={confirm}
              onFallback={() => finish(undefined, true)}
            />
          )}
          {step === 'listo' && order && <DoneStep order={order} onClose={closeCheckout} />}
        </>
      )}
    </Modal>
  )
}
