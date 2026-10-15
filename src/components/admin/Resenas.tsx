import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Stars } from '@/components/ui/Stars'
import { Card, Empty, Field, PageTitle } from './ui'
import { useUI } from '@/context/UIContext'
import { agregarResenaPublicada, aprobarResena, quitarResena, useResenasLocales } from '@/lib/resenas'
import { cn, formatDate } from '@/lib/format'

export function Resenas() {
  const resenas = useResenasLocales()
  const { toast } = useUI()
  const [nombre, setNombre] = useState('')
  const [modelo, setModelo] = useState('')
  const [texto, setTexto] = useState('')
  const [puntaje, setPuntaje] = useState(5)
  const [error, setError] = useState('')
  const pendientes = resenas.filter((r) => r.pendiente)
  const publicadas = resenas.filter((r) => !r.pendiente)

  const cargar = () => {
    if (!nombre.trim() || texto.trim().length < 8) return setError('Poné el nombre y un comentario de al menos 8 letras.')
    agregarResenaPublicada({ user: nombre, text: texto, model: modelo, rating: puntaje })
    setNombre('')
    setModelo('')
    setTexto('')
    setPuntaje(5)
    setError('')
    toast('Reseña publicada en la tienda')
  }

  const Item = ({ r }: { r: (typeof resenas)[number] }) => (
    <li className="rounded-xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{r.user}</p>
          <p className="truncate text-[12px] text-index">
            {r.model ? `${r.model} · ` : ''}
            {r.fecha ? formatDate(r.fecha) : ''}
          </p>
        </div>
        {r.rating ? <Stars value={r.rating} size={14} /> : null}
      </div>
      <p className="mt-3 text-[13.5px] leading-6">{r.text}</p>
      <div className="mt-3 flex gap-2">
        {r.pendiente && (
          <Button size="sm" onClick={() => (aprobarResena(r.id), toast('Reseña publicada'))}>
            <Icon name="check" size={14} className="mr-2" /> Publicar
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => (quitarResena(r.id), toast('Reseña eliminada'))}>
          <Icon name="trash" size={14} className="mr-2" /> Eliminar
        </Button>
      </div>
    </li>
  )

  return (
    <div>
      <PageTitle title="Reseñas" subtitle="Revisá lo que escriben los clientes y publicá las que quieras mostrar." />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card title={`Para revisar (${pendientes.length})`} hint="Las que dejan los clientes desde la tienda.">
            {pendientes.length === 0 ? <Empty>No hay reseñas esperando revisión.</Empty> : <ul className="space-y-3">{pendientes.map((r) => <Item key={r.id} r={r} />)}</ul>}
          </Card>
          <Card title={`Publicadas por vos (${publicadas.length})`} hint="Se muestran junto a las reseñas de la tienda.">
            {publicadas.length === 0 ? <Empty>Todavía no cargaste reseñas propias.</Empty> : <ul className="space-y-3">{publicadas.map((r) => <Item key={r.id} r={r} />)}</ul>}
          </Card>
        </div>

        <Card title="Cargar una reseña" hint="Para sumar comentarios reales que te llegaron por Instagram o WhatsApp.">
          <div className="space-y-4">
            <Field label="Cliente">
              <input className="field-line normal-case" placeholder="@usuario o nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Field>
            <Field label="Modelo (opcional)">
              <input className="field-line normal-case" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </Field>
            <Field label="Comentario">
              <textarea className="field-line normal-case" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} />
            </Field>
            <div>
              <span className="label mb-1.5 block text-index">Puntaje</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} estrellas`}
                    aria-pressed={puntaje === n}
                    onClick={() => setPuntaje(n)}
                    className={cn('grid h-10 w-10 place-items-center rounded-full', n <= puntaje ? 'text-accent' : 'text-control')}
                  >
                    <Icon name="star" size={22} filled={n <= puntaje} />
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <p role="alert" className="label text-danger">
                {error}
              </p>
            )}
            <Button full onClick={cargar}>
              Publicar reseña
            </Button>
          </div>
        </Card>
      </div>
      <p className="body-text mt-5">
        Las reseñas se guardan en este navegador hasta que el servidor tenga su tabla de reseñas.
      </p>
    </div>
  )
}
