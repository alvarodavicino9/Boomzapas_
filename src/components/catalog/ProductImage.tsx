import { useEffect, useState } from 'react'
import { ShoeSilhouette } from '@/components/ui/ShoeSilhouette'
import { cn } from '@/lib/format'
import { SIZES, srcsetWebp } from '@/lib/imagenes'

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  /** Cargar ya (fotos que se ven apenas abre la página). */
  eager?: boolean
  /** Además de cargar ya, pedirla primero (la foto más importante de la pantalla). */
  priority?: boolean
  /** Ancho en pantalla, para que el navegador baje la versión justa. */
  sizes?: string
  /** Para fotos de campaña: blanco y negro. */
  mono?: boolean
}

/**
 * Foto sobre el escenario (color "stage" del tema), en la versión WebP más liviana que alcanza.
 * Si la versión liviana no está, usa la original; y si tampoco carga, muestra la silueta genérica.
 */
export function ProductImage({ src, alt, className, eager, priority, sizes = SIZES.tarjeta, mono }: ProductImageProps) {
  // 0: versión liviana · 1: foto original · 2: sin foto
  const [intento, setIntento] = useState(0)
  useEffect(() => setIntento(0), [src])

  const srcSet = intento === 0 ? srcsetWebp(src) : undefined

  if (!src || intento === 2) {
    return (
      <div role="img" aria-label={alt} className={cn('grid place-items-center overflow-hidden bg-stage', className)}>
        <ShoeSilhouette />
      </div>
    )
  }
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={1100}
      height={1467}
      loading={eager || priority ? 'eager' : 'lazy'}
      // React 18 no conoce fetchPriority: se pasa el atributo HTML tal cual
      {...(priority ? { fetchpriority: 'high' } : {})}
      decoding="async"
      onError={() => setIntento((i) => (srcSet ? 1 : Math.max(i, 1) + 1))}
      className={cn('bg-stage object-cover', mono && 'grayscale', className)}
    />
  )
}
