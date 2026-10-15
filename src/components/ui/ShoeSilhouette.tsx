import { cn } from '@/lib/format'

/** Silueta genérica de zapatilla (tono sobre tono, según el tema) para cuando no hay foto. */
export function ShoeSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      aria-hidden="true"
      className={cn('w-3/5 max-w-[360px]', className)}
    >
      {/* Suela */}
      <path d="M22 188h356v14c0 8-6 14-14 14H36c-8 0-14-6-14-14v-14z" style={{ fill: 'var(--bz-sil-sole)' }} />
      {/* Capellada */}
      <path
        d="M30 188c0-38 8-66 28-80l52-12c18-2 34 8 52 18 22 12 46 10 74 22 40 17 86 22 134 40 4 2 6 6 6 12H30z"
        style={{ fill: 'var(--bz-sil-body)', stroke: 'var(--bz-sil-line)' }}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Cordones */}
      <path d="M150 112l20 18M172 106l20 18M194 108l20 16" style={{ stroke: 'var(--bz-sil-lace)' }} strokeWidth="3" strokeLinecap="round" />
      {/* Lengüeta */}
      <path d="M110 96c-6 14-8 28-6 42" style={{ stroke: 'var(--bz-sil-line)' }} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
