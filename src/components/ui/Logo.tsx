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

/** Sello circular de Boom Zapas (public/logo-*.webp; el original en alta es public/logo.png), con el nombre opcional al lado. */
export function Logo({ className, size = 48, wordmark = false, wordmarkClassName }: LogoProps) {
  const seal = (
    <img
      src="/logo-160.webp"
      srcSet="/logo-160.webp 160w, /logo-320.webp 320w"
      sizes={`${size}px`}
      alt={wordmark ? '' : 'Boom Zapas'}
      width={size}
      height={size}
      decoding="async"
      className={cn('shrink-0 rounded-full shadow-[0_8px_24px_-8px_rgb(var(--bz-glow)/0.9)] ring-2 ring-accent/50', !wordmark && className)}
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
        <span className="wm-boom">Boom</span>{' '}
        <span className="wm-zapas block">Zapas</span>
      </span>
    </span>
  )
}
