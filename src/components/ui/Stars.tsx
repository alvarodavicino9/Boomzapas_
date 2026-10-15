import { Icon } from './Icon'
import { cn } from '@/lib/format'

/** Puntaje de 1 a 5 con estrellas (accesible: el texto lo lee el lector de pantalla). */
export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  const full = Math.round(value)
  return (
    <span role="img" aria-label={`${value} de 5 estrellas`} className={cn('inline-flex gap-0.5 text-accent', className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} filled={n <= full} className={n <= full ? '' : 'text-control'} />
      ))}
    </span>
  )
}
