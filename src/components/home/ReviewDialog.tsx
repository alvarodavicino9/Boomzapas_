import { useEffect, useId, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Stars } from '@/components/ui/Stars'
import { useProductos } from '@/context/ProductsContext'
import { enviarResena } from '@/lib/resenas'
import { cn } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'

const MIN = 15
const MAX = 400

interface ReviewDialogProps {
  open: boolean
  onClose: () => void
}

const LABELS = ['', 'Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente']

/** Formulario para dejar una reseña: nombre, modelo (opcional), puntaje de 1 a 5 y comentario. */
export function ReviewDialog({ open, onClose }: ReviewDialogProps) {
  const { productos } = useProductos()
  const uid = useId()
  const [user, setUser] = useState('')
  const [model, setModel] = useState('')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<{ user: string; text: string; model?: string; rating: number } | null>(null)

  useEffect(() => {
    if (open) {
      setDone(null)
      setTouched(false)
    }
  }, [open])

  const errors = {
    user: user.trim().length < 2,
    rating: rating === 0,
    text: text.trim().length < MIN,
  }
  const valid = !errors.user && !errors.rating && !errors.text

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid || sending) return
    setSending(true)
    const r = await enviarResena({ user, text, model, rating })
    setSending(false)
    setDone({ user: r.user, text: r.text, model: r.model, rating: r.rating ?? rating })
    setUser('')
    setModel('')
    setRating(0)
    setText('')
  }

  const shown = hover || rating

  return (
    <Modal open={open} onClose={onClose} title="Dejá tu reseña" size="md">
      {done ? (
        <div className="px-5 pb-8 pt-8 text-center sm:px-8">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-on-accent">
            <Icon name="check" size={28} />
          </span>
          <h3 className="display-section mt-5 !text-[1.5rem]">¡Gracias, {done.user}!</h3>
          <p className="body-text mx-auto mt-3 max-w-sm">
            Tu reseña quedó guardada. Para que la publiquemos en la página, mandanosla por WhatsApp y la revisamos.
          </p>
          <div className="mt-6 flex justify-center">
            <Stars value={done.rating} size={22} />
          </div>
          <div className="mt-8 grid gap-3">
            <Button
              size="lg"
              full
              href={waLink(
                [
                  'Hola Boom Zapas. Quiero dejar mi reseña:',
                  '',
                  `⭐ ${done.rating}/5${done.model ? ` · ${done.model}` : ''}`,
                  `“${done.text}”`,
                  `— ${done.user}`,
                ].join('\n'),
              )}
            >
              <Icon name="whatsapp" size={18} />
              Enviar por WhatsApp
            </Button>
            <Button variant="outline" full onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-6 px-5 pb-8 pt-6 sm:px-8">
          <p className="body-text">Contanos cómo te fue con tu compra. Tu opinión ayuda a otros a elegir.</p>

          <label className="block">
            <span className="label block text-index">Tu nombre o usuario de Instagram</span>
            <input
              className="field-line mt-2 normal-case"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              maxLength={40}
              autoComplete="nickname"
              placeholder="@tuusuario"
              aria-invalid={touched && errors.user}
            />
            {touched && errors.user && <span role="alert" className="label mt-2 block text-danger">Ingresá tu nombre.</span>}
          </label>

          <label className="block">
            <span className="label block text-index">Modelo que compraste (opcional)</span>
            <input
              className="field-line mt-2 normal-case"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              maxLength={60}
              list={`${uid}-modelos`}
              placeholder="Ej: Adidas Samba"
            />
            <datalist id={`${uid}-modelos`}>
              {productos.map((p) => (
                <option key={p.id} value={p.nombre} />
              ))}
            </datalist>
          </label>

          <fieldset>
            <legend className="label mb-2 flex w-full items-center justify-between text-index">
              <span>Tu puntaje</span>
              <span className={cn('text-ink', !shown && 'invisible')}>{LABELS[shown] || '—'}</span>
            </legend>
            <div role="radiogroup" aria-label="Puntaje de 1 a 5 estrellas" className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                  onMouseEnter={() => setHover(n)}
                  onFocus={() => setHover(n)}
                  onBlur={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className={cn(
                    'grid size-11 place-items-center rounded-xl transition-transform hover:scale-110',
                    n <= shown ? 'text-accent' : 'text-control',
                  )}
                >
                  <Icon name="star" size={30} filled={n <= shown} />
                </button>
              ))}
            </div>
            {touched && errors.rating && <span role="alert" className="label mt-2 block text-danger">Elegí un puntaje.</span>}
          </fieldset>

          <label className="block">
            <span className="label flex items-center justify-between text-index">
              <span>Tu reseña</span>
              <span>
                {text.length}/{MAX}
              </span>
            </span>
            <textarea
              className="field-line mt-2 min-h-28"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              placeholder="¿Cómo llegaron las zapatillas? ¿Qué tal la atención y el envío?"
              aria-invalid={touched && errors.text}
            />
            {touched && errors.text && (
              <span role="alert" className="label mt-2 block text-danger">
                Escribí al menos {MIN} caracteres.
              </span>
            )}
          </label>

          <Button type="submit" size="lg" full disabled={sending}>
            {sending ? 'Enviando…' : 'Publicar reseña'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
