import { useMemo, useState } from 'react'
import { cn } from '@/lib/format'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Stars } from '@/components/ui/Stars'
import { ReviewDialog } from './ReviewDialog'
import { TESTIMONIALS } from '@/data/testimonials'
import { quitarResena, useResenasLocales, type Resena } from '@/lib/resenas'

const PASO = 4

const iniciales = (user: string) => user.replace(/^@/, '').trim().slice(0, 2).toUpperCase() || '·'

/** Reseñas de clientes + botón para dejar una nueva. */
export function Testimonials() {
  const [open, setOpen] = useState(false)
  const [visibles, setVisibles] = useState(PASO)
  const locales = useResenasLocales()

  const todas: Resena[] = useMemo(
    () => [...locales, ...TESTIMONIALS.map((t, i) => ({ id: `t-${i}`, ...t }))],
    [locales],
  )

  return (
    <section className="page-x section-y" aria-labelledby="clientes">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4 text-accent">Reseñas</p>
          <h2 id="clientes" className="display-section">
            Lo que dicen nuestros clientes
          </h2>
        </div>
        <Button size="lg" onClick={() => setOpen(true)}>
          <Icon name="star" size={18} />
          Dejar una reseña
        </Button>
      </div>

      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {todas.map((t, i) => (
          <li key={t.id} className={cn('w-[84%] shrink-0 snap-center md:w-auto', i >= visibles && 'md:hidden')}>
            <Reveal delay={(i % PASO) * 0.06} className="h-full">
              <figure className="surface flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <span aria-hidden="true" className="font-display text-4xl font-extrabold leading-none text-accent-soft">
                    “
                  </span>
                  {t.rating ? <Stars value={t.rating} size={15} className="mt-1" /> : null}
                </div>
                <blockquote className="mt-2 text-[14px] leading-6">{t.text}</blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-6">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/20 text-[12px] font-bold text-accent-soft">
                    {iniciales(t.user)}
                  </span>
                  <span className="min-w-0 text-[13px] leading-4">
                    <span className="block truncate font-semibold">{t.user}</span>
                    {t.model && <span className="block truncate text-index">{t.model}</span>}
                  </span>
                </figcaption>
                {t.pendiente && (
                  <p className="label mt-4 flex items-center justify-between gap-2 border-t border-line pt-3 text-[10px] text-index">
                    <span>Tu reseña · en revisión</span>
                    <button onClick={() => quitarResena(t.id)} className="link-u hover:text-ink">
                      Quitar
                    </button>
                  </p>
                )}
              </figure>
            </Reveal>
          </li>
        ))}

      </ul>

      {visibles < todas.length && (
        <div className="mt-8 hidden text-center md:block">
          <Button variant="outline" onClick={() => setVisibles((v) => v + PASO)}>
            Ver más reseñas
          </Button>
        </div>
      )}

      <Reveal>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-control px-6 py-5">
          <p className="text-[15px]">
            <span className="font-semibold">¿Ya compraste?</span> <span className="text-index">Contanos cómo te fue.</span>
          </p>
          <button onClick={() => setOpen(true)} className="label link-u flex items-center gap-2 text-accent hover:text-ink">
            Dejar mi reseña <Icon name="arrow" size={16} />
          </button>
        </div>
      </Reveal>

      <ReviewDialog open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
