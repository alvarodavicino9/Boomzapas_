import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { Icon } from './Icon'
import { cn } from '@/lib/format'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Ancho máximo del panel */
  size?: 'md' | 'lg' | 'xl'
  /** Oculta el título visualmente (sigue disponible para lectores de pantalla). */
  hideTitle?: boolean
}

const widths = { md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-5xl' }

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, size = 'md', hideTitle }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !panel) return
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-scrim" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-gallery shadow-lift sm:rounded-3xl',
              widths[size],
            )}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={cn(
                'flex items-center justify-between gap-4',
                hideTitle ? 'absolute right-0 top-0 z-10' : 'border-b border-line px-5 py-4 sm:px-8',
              )}
            >
              <h2 className={cn('display-product', hideTitle && 'sr-only')}>{title}</h2>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className={cn(
                  'label ml-auto flex h-10 items-center gap-2 rounded-full px-4 text-ink hover:bg-stage',
                  hideTitle && 'm-3 bg-card shadow-card',
                )}
              >
                Cerrar <Icon name="x" size={16} />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
