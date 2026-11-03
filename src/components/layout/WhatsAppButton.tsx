import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
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
  // celular (menos de 640 px): el panel sube desde abajo y ocupa el ancho de la pantalla
  const [esCel, setEsCel] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches)
  useEffect(() => {
    const m = window.matchMedia('(max-width: 639px)')
    const f = () => setEsCel(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  useLockBodyScroll(open && esCel)

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

  const cerrar = () => {
    setOpen(false)
    btnRef.current?.focus()
  }

  const cabecera = (
    <div className="relative flex items-center gap-3 bg-gradient-to-br from-[#b3121d] to-[#6a0a10] px-4 py-3.5">
      <span className="relative">
        <Logo size={42} className="ring-2 ring-white/30" />
        <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-[#8d0e17] bg-[#4ade80]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold leading-5">Boom Zapas</p>
        <p className="text-[12px] leading-4 text-white/80">En línea · respondemos el mismo día</p>
      </div>
      <button onClick={cerrar} aria-label="Cerrar" className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
        <Icon name="x" size={18} />
      </button>
    </div>
  )

  const cuerpo = (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-4">
      <p className="w-fit max-w-[90%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-[13.5px] leading-[19px]">
        ¡Hola! 👋 ¿En qué te ayudamos? Elegí una o más opciones y te respondemos por WhatsApp.
      </p>

      <ul className="mt-3 space-y-1.5" aria-label="Preguntas rápidas">
        {PREGUNTAS.map((q) => {
          const on = elegidas.includes(q)
          return (
            <li key={q}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(q)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] leading-[18px] transition-colors',
                  on ? 'border-[#e23a46] bg-[#d92c37]/20' : 'border-white/12 bg-white/[0.03] hover:border-white/35',
                )}
              >
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                    on ? 'border-[#e23a46] bg-[#e23a46] text-white' : 'border-white/30',
                  )}
                >
                  {on && <Icon name="check" size={12} />}
                </span>
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
        <div className="grid gap-3 pt-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Tu nombre (opcional)</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={40}
              autoComplete="given-name"
              className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-[15px] outline-none placeholder:text-white/40 focus:border-[#e23a46] sm:text-[13.5px]"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Tu mensaje (opcional)</span>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value.slice(0, 400))}
              rows={2}
              placeholder="Modelo, talle, ciudad…"
              className="mt-1.5 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-[15px] leading-5 outline-none placeholder:text-white/40 focus:border-[#e23a46] sm:text-[13.5px]"
            />
          </label>
        </div>
      )}
    </div>
  )

  const pie = (
    <div className="border-t border-white/10 bg-[#0f0909] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 sm:pb-3">
      <button
        onClick={enviar}
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(180deg,#ea3a45,#c41f2b)] px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_28px_-12px_rgb(217_44_55/0.9)] transition-transform active:scale-[0.98]"
      >
        <Icon name="whatsapp" size={20} />
        {elegidas.length ? `Enviar consulta (${elegidas.length})` : 'Abrir WhatsApp'}
      </button>
      <p className="mt-2 text-center text-[11px] leading-4 text-white/50">Se abre WhatsApp con tu mensaje listo para mandar.</p>
    </div>
  )

  return (
    <>
      {/* celular: panel que sube desde abajo, con el fondo oscurecido */}
      {esCel &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div className="fixed inset-0 z-[470]" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
                <motion.div
                  className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
                  onClick={() => setOpen(false)}
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.div
                  ref={panelRef}
                  id={id}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Escribinos por WhatsApp"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.7 }}
                  onDragEnd={(_, info) => (info.offset.y > 90 || info.velocity.y > 500) && setOpen(false)}
                  className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] bg-[#0f0909] text-white shadow-[0_-30px_60px_-20px_rgb(0_0_0/0.8)]"
                >
                  <span aria-hidden="true" className="absolute left-1/2 top-2.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/50" />
                  <div className="[&>div]:pt-6">{cabecera}</div>
                  {cuerpo}
                  {pie}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <div className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-3 z-[250] flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6 sm:gap-3">
        {/* compu: panel flotante arriba del botón */}
        <AnimatePresence>
          {open && !esCel && (
            <motion.div
              ref={panelRef}
              id={id}
              role="dialog"
              aria-label="Escribinos por WhatsApp"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex max-h-[min(600px,calc(100dvh-150px))] w-[370px] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-[#3a1a1e] bg-[#0f0909] text-white shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)]"
            >
              {cabecera}
              {cuerpo}
              {pie}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn('relative flex items-center gap-3 transition-opacity', open && esCel && 'pointer-events-none opacity-0')}>
          <AnimatePresence>
            {nudge && !open && (
              <motion.span
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="relative rounded-2xl rounded-br-md bg-white px-3.5 py-2 text-[12.5px] font-semibold leading-4 text-black shadow-[0_14px_30px_-12px_rgb(0_0_0/0.6)] sm:px-4 sm:py-2.5 sm:text-[13px]"
              >
                ¿Te ayudamos a elegir?
                <span className="block text-[11px] font-medium text-black/55">Respondemos hoy</span>
              </motion.span>
            )}
          </AnimatePresence>
          <button
            ref={btnRef}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={id}
            aria-label={open ? 'Cerrar chat de WhatsApp' : 'Escribinos por WhatsApp'}
            className="group relative grid size-[54px] place-items-center rounded-full bg-[linear-gradient(160deg,#f24853_0%,#d92c37_45%,#9e1620_100%)] text-white shadow-[0_16px_34px_-10px_rgb(217_44_55/0.9),inset_0_1px_0_rgb(255_255_255/0.35)] ring-1 ring-white/20 transition-transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 sm:size-[60px]"
          >
            <Icon name={open ? 'x' : 'whatsapp'} size={open ? 24 : 27} />
            {!open && (
              <span aria-hidden="true" className="absolute right-0.5 top-0.5 size-3.5 rounded-full border-2 border-[#d92c37] bg-[#4ade80]" />
            )}
          </button>
        </div>
      </div>
    </>
  )
}
