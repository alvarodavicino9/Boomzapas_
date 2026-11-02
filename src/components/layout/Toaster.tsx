import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '@/context/UIContext'

export function Toaster() {
  const { toasts, dismissToast } = useUI()
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[600] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto rounded-full bg-bar px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-white shadow-lift"
          >
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
