import { cn } from '@/lib/format'

/** Marcas con logo en public/marcas/<slug>.svg (las demás se escriben con letra). */
const CON_LOGO = new Set(['nike', 'adidas', 'new-balance', 'puma'])
/** Proporción ancho/alto de cada logo, para reservar el lugar justo. */
const PROPORCION: Record<string, number> = { nike: 2.86, adidas: 1.6, 'new-balance': 2.08, puma: 1.3 }
const slug = (b: string) => b.toLowerCase().replace(/\s+/g, '-')

interface Props {
  marca: string
  /** La altura se da con clases (h-4, h-8…). */
  className?: string
  /** Logo en blanco (para fondos de color). */
  blanco?: boolean
  /** Tamaño de letra para las marcas sin logo (ej. text-[18px]). */
  texto?: string
}

/** Logo de la marca a la altura pedida. */
export function LogoMarca({ marca, className, blanco, texto = 'text-[18px]' }: Props) {
  const s = slug(marca)
  if (!CON_LOGO.has(s)) {
    return (
      <span
        className={cn(
          'inline-flex items-center font-display font-black uppercase italic leading-none tracking-[-0.03em]',
          blanco ? 'text-white' : 'text-black',
          texto,
        )}
      >
        {marca}
      </span>
    )
  }
  return (
    <img
      src={`/marcas/${s}.svg`}
      alt={marca}
      loading="lazy"
      decoding="async"
      className={cn('block w-auto object-contain', blanco && '[filter:brightness(0)_invert(1)]', className)}
      style={{ aspectRatio: PROPORCION[s] ?? 2 }}
    />
  )
}
