import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useUI } from '@/context/UIContext'
import { useInstalarApp } from '@/hooks/useInstalarApp'
import { cn } from '@/lib/format'

/** Tarjeta "Instalá la app": botón directo en Android/Chrome, pasos a mano en iPhone. No aparece si ya está instalada. */
export function InstalarApp({ className, compacto }: { className?: string; compacto?: boolean }) {
  const { puede, ios, instalar } = useInstalarApp()
  const [pasos, setPasos] = useState(false)
  const { toast } = useUI()
  if (!puede && !ios) return null

  const onClick = async () => {
    if (puede) {
      if (await instalar()) toast('¡Listo! Boom Zapas quedó en tu pantalla de inicio')
    } else setPasos((p) => !p)
  }

  if (compacto)
    return (
      <button type="button" onClick={onClick} className={cn('label inline-flex items-center gap-2 text-index hover:text-ink', className)}>
        <Icon name="download" size={14} /> Instalar la app
      </button>
    )

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(135deg,rgb(217_44_55/0.25),transparent_60%)] p-4', className)}>
      <div className="flex items-center gap-3">
        <img src="/icon-192.png" alt="" width={44} height={44} className="size-11 rounded-xl ring-1 ring-white/20" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold leading-5">Instalá la app</p>
          <p className="text-[12px] leading-4 text-index">Boom Zapas en tu pantalla de inicio, abre al toque.</p>
        </div>
        <button
          type="button"
          onClick={onClick}
          className="h-9 shrink-0 rounded-full bg-[linear-gradient(180deg,#ea3a45,#c41f2b)] px-4 text-[12px] font-bold uppercase tracking-[0.06em] text-white"
        >
          {puede ? 'Instalar' : pasos ? 'Listo' : 'Cómo'}
        </button>
      </div>
      {pasos && ios && (
        <ol className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-[12.5px] leading-5 text-index">
          <li className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-white/10 text-[11px] font-bold text-ink">1</span>
            Tocá <Icon name="share" size={15} className="text-ink" /> <strong className="text-ink">Compartir</strong> abajo en Safari.
          </li>
          <li className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-white/10 text-[11px] font-bold text-ink">2</span>
            Elegí <strong className="text-ink">Agregar a inicio</strong>.
          </li>
          <li className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-white/10 text-[11px] font-bold text-ink">3</span>
            Tocá <strong className="text-ink">Agregar</strong> y listo.
          </li>
        </ol>
      )}
    </div>
  )
}
