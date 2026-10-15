import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/format'

export const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#f0a93b',
  pagado: '#3fbf7f',
  enviado: '#4aa3ff',
  entregado: '#9a8cff',
  cancelado: '#8a7d80',
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
            {title && <h2 className="text-[15px] font-semibold leading-5">{title}</h2>}
            {hint && <p className="mt-1 text-[12.5px] leading-4 text-index">{hint}</p>}
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
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[12.5px] font-medium transition-colors',
            value === o.id ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card hover:border-control',
          )}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={cn('text-[11px]', value === o.id ? 'opacity-80' : 'text-index')}>{o.count}</span>
          )}
        </button>
      ))}
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
        <motion.div
          className="fixed inset-0 z-[500] flex items-end justify-end sm:items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-scrim" onClick={onClose} aria-hidden="true" />
          <motion.aside
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
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
