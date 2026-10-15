import { useState } from 'react'
import { ShoeSilhouette } from '@/components/ui/ShoeSilhouette'
import { cn } from '@/lib/format'

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  eager?: boolean
  /** Para fotos de campaña: blanco y negro. */
  mono?: boolean
}

/** Foto sobre el escenario (color "stage" del tema). Sin foto (o si falla la carga) muestra la silueta genérica. */
export function ProductImage({ src, alt, className, eager, mono }: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className={cn('grid place-items-center overflow-hidden bg-stage', className)}>
        <ShoeSilhouette />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('bg-stage object-cover', mono && 'grayscale', className)}
    />
  )
}
