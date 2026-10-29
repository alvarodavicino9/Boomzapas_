import { Icon } from '@/components/ui/Icon'
import { useModo, type Modo } from '@/lib/theme'
import { cn } from '@/lib/format'

const OPCIONES: { id: Modo; label: string; icon: 'moon' | 'sun' }[] = [
  { id: 'oscuro', label: 'Oscuro', icon: 'moon' },
  { id: 'claro', label: 'Claro', icon: 'sun' },
]

/** Botón redondo para el encabezado: alterna entre claro y oscuro. */
export function ModeIconButton({ className }: { className?: string }) {
  const [modo, setModo] = useModo()
  const siguiente: Modo = modo === 'oscuro' ? 'claro' : 'oscuro'
  return (
    <button
      type="button"
      onClick={() => setModo(siguiente)}
      aria-label={`Cambiar a modo ${siguiente}`}
      title={`Modo ${siguiente}`}
      className={cn('grid size-10 place-items-center rounded-full text-ink transition-colors hover:text-accent', className)}
    >
      <Icon name={modo === 'oscuro' ? 'sun' : 'moon'} size={20} />
    </button>
  )
}

/** Selector con las dos opciones a la vista (pie de página y menú del celular). */
export function ModeSwitch({ className }: { className?: string }) {
  const [modo, setModo] = useModo()
  return (
    <div role="radiogroup" aria-label="Modo de la página" className={cn('inline-flex rounded-full border border-line p-1', className)}>
      {OPCIONES.map((o) => {
        const on = modo === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setModo(o.id)}
            className={cn(
              'label flex h-9 items-center gap-2 rounded-full px-4 transition-colors',
              on ? 'bg-accent text-on-accent' : 'text-index hover:text-ink',
            )}
          >
            <Icon name={o.icon} size={15} />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
