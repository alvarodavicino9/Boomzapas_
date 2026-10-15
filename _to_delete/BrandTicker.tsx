import { BRANDS } from '@/config/site'

const WORDS = ['Boom Zapas', ...BRANDS, 'Envíos al país']

export function BrandTicker() {
  const row = [...WORDS, ...WORDS]
  return (
    <div
      id="marcas"
      className="relative overflow-hidden border-y border-electric/20 bg-electric py-3.5"
      aria-label="Marcas disponibles"
    >
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap hover:[animation-play-state:paused]">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl tracking-[0.18em] text-white">
            {w}
            <span className="text-white/50" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
