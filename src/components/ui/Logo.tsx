import { cn } from '@/lib/format'

interface LogoProps {
  className?: string
  /** Diámetro del sello en px. */
  size?: number
  /** Muestra "BOOM ZAPAS" en grande al lado del sello. */
  wordmark?: boolean
  /** Clases del texto (tamaño y color) cuando hay wordmark. */
  wordmarkClassName?: string
}

/** Sello circular de Boom Zapas (public/logo.png), con el nombre opcional al lado. */
export function Logo({ className, size = 48, wordmark = false, wordmarkClassName }: LogoProps) {
  const seal = (
    <img
      src="/logo.png"
      alt={wordmark ? '' : 'Boom Zapas'}
      width={size}
      height={size}
      decoding="async"
      className={cn('shrink-0 rounded-full shadow-card ring-2 ring-accent/40', !wordmark && className)}
      style={{ width: size, height: size }}
    />
  )
  if (!wordmark) return seal
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      {seal}
      <span
        className={cn(
          'font-display font-extrabold uppercase leading-[0.9] tracking-tight',
          wordmarkClassName ?? 'text-[22px]',
        )}
      >
        Boom
        <span className="block text-accent">Zapas</span>
      </span>
    </span>
  )
}
