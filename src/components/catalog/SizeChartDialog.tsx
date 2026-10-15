import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { waLink } from '@/lib/whatsapp'

interface SizeChartDialogProps {
  open: boolean
  onClose: () => void
}

export const TABLA_DE_TALLES_SRC = '/tabla-de-talles.jpg'
export const TABLA_DE_TALLES_ALT =
  'Tabla de talles: equivalencias entre Brasil, Argentina y medidas del pie en centímetros, de 23,5 cm (AR 35) a 29 cm (AR 44). Los talles pueden variar 0,5 cm según la marca.'

/**
 * Tabla de talles en una ventana encima de la ficha del producto.
 * Escucha Escape en la fase de captura para cerrar sólo esta ventana y no la ficha de abajo.
 */
export function SizeChartDialog({ open, onClose }: SizeChartDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Tabla de talles"
            className="relative flex max-h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-gallery shadow-lift"
            initial={{ scale: 0.97, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 8, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
              <h2 className="display-product !text-[1.1rem]">Tabla de talles</h2>
              <button
                autoFocus
                onClick={onClose}
                aria-label="Cerrar tabla de talles"
                className="label flex h-10 items-center gap-2 rounded-full px-4 text-ink hover:bg-stage"
              >
                Cerrar <Icon name="x" size={16} />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain bg-black">
              <img
                src={TABLA_DE_TALLES_SRC}
                alt={TABLA_DE_TALLES_ALT}
                width={1057}
                height={1331}
                className="block h-auto w-full"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
              <p className="text-[12.5px] leading-4 text-index">¿Dudas con tu talle? Te asesoramos.</p>
              <Button href={waLink('Hola Boom Zapas. Necesito ayuda para elegir mi talle.')} size="sm" variant="outline">
                WhatsApp
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
