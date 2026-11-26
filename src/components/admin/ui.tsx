import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/format'

export const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#f0a93b',
  pagado: '#3fbf7f',
  enviado: '#4aa3ff',
  entregado: '#9a8cff',
  cancelado: '#8a7d80',
}

/** Avatar con las iniciales y un color propio de cada persona (siempre el mismo para el mismo nombre). */
export function Avatar({ nombre, size = 44 }: { nombre: string; size?: number }) {
  const ini =
    nombre
      .trim()
      .split(/\s+/)
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '·'
  let h = 0
  for (const ch of nombre) h = (h * 31 + ch.charCodeAt(0)) % 360
  const tonos = [355, 18, 38, 200, 265, 320, 160]
  const tono = tonos[h % tonos.length]
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-2xl font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: `linear-gradient(145deg, hsl(${tono} 70% 52%), hsl(${tono} 65% 32%))`,
        boxShadow: `0 8px 20px -10px hsl(${tono} 70% 45%), inset 0 1px 0 rgb(255 255 255 / 0.25)`,
      }}
    >
      {ini}
    </span>
  )
}

/** Etiqueta chica de color (recurrente, nuevo, etc.). */
export function Etiqueta({ children, color = '#ff6b73' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
      style={{ color, background: `${color}1f`, boxShadow: `inset 0 0 0 1px ${color}40` }}
    >
      {children}
    </span>
  )
}

export const estadoLabel = (e: string) => e.charAt(0).toUpperCase() + e.slice(1)

export function EstadoBadge({ estado, className }: { estado: string; className?: string }) {
  const color = ESTADO_COLOR[estado] ?? '#8a7d80'
  return (
    <span
      className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11.5px] font-medium', className)}
      style={{ color, borderColor: `${color}55`, background: `${color}14` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {estadoLabel(estado)}
    </span>
  )
}

export function Card({
  title,
  hint,
  action,
  children,
  className,
  pad = true,
}: {
  title?: string
  hint?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return (
    <section className={cn('surface border border-line', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
          <div>
            {title && <h2 className="text-[15.5px] font-semibold leading-5">{title}</h2>}
            {hint && <p className="mt-1 text-[12.5px] leading-[18px] text-index">{hint}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn(pad && 'p-5 sm:p-6', title && pad && '!pt-4')}>{children}</div>
    </section>
  )
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[1.6rem] font-bold leading-none tracking-tight sm:text-[2rem]">{title}</h1>
        {subtitle && <p className="body-text mt-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-5 py-10 text-center text-[13.5px] text-index">{children}</p>
}

/** Píldoras para filtrar. */
export function Pills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string; count?: number }[]
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden" role="group">
      {options.map((o) => {
        const activo = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(o.id)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors',
              activo
                ? 'border-[rgb(217_44_55/0.6)] bg-[rgb(217_44_55/0.16)] font-semibold text-ink'
                : 'border-line bg-card text-index hover:border-control hover:text-ink',
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span
                className={cn(
                  'grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                  activo ? 'bg-accent text-white' : 'bg-stage text-index',
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block w-full sm:max-w-sm">
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-line normal-case !h-10 !rounded-full !px-4 !py-0"
      />
    </label>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block text-index">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-index">{hint}</span>}
    </label>
  )
}

/** Panel lateral (en celular sube desde abajo). */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[500] flex items-end justify-end sm:items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-scrim" onClick={onClose} aria-hidden="true" />
          <m.aside
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : 'Detalle'}
            className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-gallery shadow-lift sm:max-h-none sm:max-w-[460px] sm:rounded-none sm:rounded-l-3xl"
            initial={{ y: 40, x: 0, opacity: 0 }}
            animate={{ y: 0, x: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="font-display text-[1.25rem] font-bold leading-tight">{title}</h2>
                {subtitle && <div className="mt-1 text-[12.5px] text-index">{subtitle}</div>}
              </div>
              <button
                autoFocus
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-stage"
              >
                <Icon name="x" size={18} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
            {footer && <footer className="border-t border-line px-5 py-4 sm:px-6">{footer}</footer>}
          </m.aside>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
