import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'

const PREGUNTAS = [
  'Quiero consultar por un modelo',
  '¿Qué talles tienen disponibles?',
  '¿Cómo es el envío y cuánto tarda?',
  '¿Qué medios de pago aceptan?',
  'Quiero retirar en Córdoba',
  'Tengo una duda con mi pedido',
] as const

/** Botón flotante rojo: abre un panel con preguntas rápidas y recién después manda el mensaje por WhatsApp. */
export function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [nudge, setNudge] = useState(false)
  const [elegidas, setElegidas] = useState<string[]>([])
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [extra, setExtra] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const id = useId()

  // invitación suave a los pocos segundos
  useEffect(() => {
    const t = window.setTimeout(() => setNudge(true), 6000)
    const h = window.setTimeout(() => setNudge(false), 13000)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(h)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setNudge(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open])

  const toggle = (q: string) => setElegidas((l) => (l.includes(q) ? l.filter((x) => x !== q) : [...l, q]))

  const enviar = () => {
    const partes = [
      `Hola Boom Zapas${nombre.trim() ? `, soy ${nombre.trim()}` : ''}.`,
      elegidas.length ? `Quería consultarles:\n${elegidas.map((q) => `• ${q}`).join('\n')}` : '',
      mensaje.trim(),
    ].filter(Boolean)
    window.open(waLink(partes.length > 1 ? partes.join('\n\n') : 'Hola Boom Zapas. Quiero hacer una consulta.'), '_blank', 'noopener,noreferrer')
    setOpen(false)
    setElegidas([])
    setMensaje('')
    setExtra(false)
  }

  return (
    <div className="fixed bottom-3 right-3 z-[250] flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6 sm:gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={id}
            role="dialog"
            aria-label="Escribinos por WhatsApp"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[min(560px,calc(100dvh-150px))] w-[min(350px,calc(100vw-24px))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-[#3a1a1e] bg-[#0f0909] text-white shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)]"
          >
            <div className="relative flex items-center gap-3 bg-gradient-to-br from-[#b3121d] to-[#6a0a10] px-4 py-3">
              <Logo size={38} className="ring-2 ring-white/30" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold leading-5">Boom Zapas</p>
                <p className="flex items-center gap-1.5 text-[11.5px] leading-4 text-white/80">
                  <span className="size-2 rounded-full bg-[#4ade80]" /> Respondemos el mismo día
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false)
                  btnRef.current?.focus()
                }}
                aria-label="Cerrar"
                className="grid size-8 place-items-center rounded-full hover:bg-white/15"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain px-4 pb-4 pt-4">
              <p className="rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-[13px] leading-[18px]">
                ¡Hola! ¿En qué te ayudamos? Elegí lo que quieras consultar.
              </p>

              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Preguntas rápidas">
                {PREGUNTAS.map((q) => {
                  const on = elegidas.includes(q)
                  return (
                    <li key={q}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(q)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-[12.5px] leading-4 transition-colors',
                          on ? 'border-[#e23a46] bg-[#d92c37] text-white' : 'border-white/20 hover:border-white/50',
                        )}
                      >
                        {on && <Icon name="check" size={14} />}
                        {q}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <button
                type="button"
                onClick={() => setExtra((v) => !v)}
                aria-expanded={extra}
                className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-white/70 hover:text-white"
              >
                <Icon name="plus" size={14} className={cn('transition-transform', extra && 'rotate-45')} />
                {extra ? 'Ocultar mensaje' : 'Escribir un mensaje o dejar mi nombre'}
              </button>
              {extra && (
                <div>
              <label className="mt-3 block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Tu nombre (opcional)</span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={40}
                  autoComplete="given-name"
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-[13.5px] outline-none placeholder:text-white/40 focus:border-[#e23a46]"
                />
              </label>
              <label className="mt-3 block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Tu mensaje (opcional)</span>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value.slice(0, 400))}
                  rows={2}
                  placeholder="Modelo, talle, ciudad…"
                  className="mt-1.5 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-[13.5px] leading-5 outline-none placeholder:text-white/40 focus:border-[#e23a46]"
                />
              </label>

                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-[#0f0909] px-4 pb-3 pt-3">
              <button
                onClick={enviar}
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#d92c37] px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef3a46]"
              >
                <Icon name="whatsapp" size={20} />
                Enviar por WhatsApp
              </button>
              <p className="mt-2 text-center text-[11px] leading-4 text-white/50">Se abre WhatsApp con tu mensaje listo.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-3">
        <AnimatePresence>
          {nudge && !open && (
            <motion.span
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="hidden rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-black shadow-lift sm:block"
            >
              ¿Te ayudamos a elegir?
            </motion.span>
          )}
        </AnimatePresence>
        <button
          ref={btnRef}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          aria-label={open ? 'Cerrar chat de WhatsApp' : 'Escribinos por WhatsApp'}
          className="group relative grid size-[52px] place-items-center sm:size-[60px] rounded-full bg-gradient-to-br from-[#ef3a46] to-[#b3121d] text-white shadow-[0_14px_34px_-8px_rgb(217_44_55/0.85)] ring-2 ring-white/15 transition-transform hover:scale-105 active:scale-95"
        >
          {!open && <span aria-hidden="true" className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#d92c37]/40 [animation-duration:2.6s] motion-reduce:hidden" />}
          <Icon name={open ? 'x' : 'whatsapp'} size={open ? 24 : 28} />
        </button>
      </div>
    </div>
  )
}
