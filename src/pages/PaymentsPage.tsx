import { Link } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { useCopy } from '@/hooks/useCopy'
import { formatARS, PROMO } from '@/lib/format'
import { waPlantilla } from '@/lib/whatsapp'

/** Cada medio con su color, cómo funciona y cuándo conviene. */
const MEDIOS: { icon: IconName; titulo: string; color: string; ideal: string; puntos: string[] }[] = [
  {
    icon: 'bolt',
    titulo: 'Mercado Pago',
    color: '#00a6e4',
    ideal: 'Para pagar en cuotas',
    puntos: ['Con dinero en cuenta, débito o crédito', 'Cuotas con tu tarjeta', 'Te mandamos el link de pago por WhatsApp'],
  },
  {
    icon: 'receipt',
    titulo: 'Transferencia',
    color: '#1f9d55',
    ideal: 'La más rápida para confirmar',
    puntos: ['Desde cualquier banco o billetera', 'Usá el alias o el CBU de abajo', 'Mandanos el comprobante por WhatsApp'],
  },
  {
    icon: 'store',
    titulo: 'Efectivo o QR',
    color: '#f2a516',
    ideal: 'Si retirás en el showroom',
    puntos: ['Pagás al retirar tu pedido', `En ${SITE.address}`, 'Coordinamos el horario por WhatsApp'],
  },
  {
    icon: 'card',
    titulo: 'Tarjeta en el showroom',
    color: '#8b5cf6',
    ideal: 'Para comprar en persona',
    puntos: ['Débito y crédito', 'También con QR desde tu celular', 'Probás el talle antes de pagar'],
  },
]

/** Ejemplo de la promo con dos pares de precio típico. */
const EJEMPLO = 63500

export default function PaymentsPage() {
  const { copied, copy } = useCopy()
  const sinPromo = EJEMPLO * 2
  const conPromo = sinPromo - PROMO.descuento * 2

  return (
    <>
      <PageHero
        eyebrow="Pagá como quieras"
        title={
          <>
            Medios de <span className="text-accent">pago</span>
          </>
        }
        subtitle="Online o en el showroom, elegí el que más te sirva. Y si llevás más de un par, te hacemos descuento en cada uno."
        lateral={
          <div className="marcas-banda relative overflow-hidden rounded-3xl p-7 shadow-[0_30px_70px_-30px_rgb(122_12_21/0.8)] sm:p-9">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset ring-white/25">
              <Icon name="tag" size={13} /> Promo
            </span>
            <p className="mt-4 font-display text-[clamp(2.4rem,5vw,3.4rem)] font-black leading-none">{formatARS(PROMO.descuento)} off</p>
            <p className="mt-2 text-[15px] font-semibold text-white/90">
              en cada par llevando {PROMO.minimo} o más · con cualquier medio de pago
            </p>
            <div className="mt-6 rounded-2xl bg-black/25 p-4 text-[13.5px] ring-1 ring-inset ring-white/10">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">Ejemplo con 2 pares de {formatARS(EJEMPLO)}</p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-white/75">Precio normal</span>
                <span className="text-white/60 line-through">{formatARS(sinPromo)}</span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="font-semibold">Pagás</span>
                <span className="font-display text-[1.5rem] font-bold">{formatARS(conPromo)}</span>
              </div>
              <p className="mt-2 text-right text-[12px] font-semibold text-[#ffd5d8]">Ahorrás {formatARS(sinPromo - conPromo)}</p>
            </div>
            <Button href={waPlantilla('promo')} className="mt-6 !border-white !bg-white !text-black hover:!bg-black hover:!text-white" full>
              Quiero la promo <Icon name="arrow" size={16} />
            </Button>
          </div>
        }
        actions={
          <>
            <Button to="/catalogo" size="lg">
              Elegir mis zapatillas
            </Button>
            <Button href={waPlantilla('pagos')} variant="outline" size="lg">
              <Icon name="whatsapp" size={18} />
              Consultar
            </Button>
          </>
        }
      />

      {/* medios de pago: cada uno con su color, cómo funciona y cuándo conviene */}
      <section className="page-x section-y" aria-labelledby="medios">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label mb-3 text-accent">Opciones</p>
            <h2 id="medios" className="display-section">
              Elegí cómo pagar
            </h2>
          </div>
          <p className="body-text max-w-sm">La promo de {PROMO.minimo} pares vale con todos. El envío es gratis en cualquier caso.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEDIOS.map((m, i) => (
            <li key={m.titulo}>
              <Reveal delay={i * 0.06} className="h-full">
                <div className="surface relative flex h-full flex-col overflow-hidden p-6">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: m.color }} />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-[0.14] blur-2xl"
                    style={{ background: m.color }}
                  />
                  <span className="grid size-12 place-items-center rounded-2xl text-white shadow-lg" style={{ background: m.color }}>
                    <Icon name={m.icon} size={22} />
                  </span>
                  <h3 className="mt-5 text-[1.15rem] font-bold leading-6">{m.titulo}</h3>
                  <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: m.color }}>
                    {m.ideal}
                  </p>
                  <ul className="mt-4 space-y-2.5 text-[13.5px] leading-5 text-index">
                    {m.puntos.map((pt) => (
                      <li key={pt} className="flex gap-2.5">
                        <Icon name="check" size={15} className="mt-0.5 shrink-0" style={{ color: m.color }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* datos para transferir + qué pasa después de pagar */}
      <section className="page-x pb-16" aria-label="Transferencia">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="on-bar relative h-full overflow-hidden rounded-3xl p-7 sm:p-9">
              <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#1f9d55]/25 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#1f9d55] text-white">
                  <Icon name="receipt" size={20} />
                </span>
                <div>
                  <p className="label text-[#4ade80]">Transferencia</p>
                  <h2 className="text-[1.35rem] font-bold leading-6 text-white">Datos para transferir</h2>
                </div>
              </div>
              <dl className="relative mt-7 space-y-3 text-[14px]">
                {(
                  [
                    ['Titular', SITE.bank.holder, null],
                    ['Banco / billetera', SITE.bank.bank, null],
                    ['Alias', SITE.bank.alias, 'alias'],
                    ['CBU / CVU', SITE.bank.cbu, 'cbu'],
                  ] as const
                ).map(([label, value, id]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.05] px-4 py-3 ring-1 ring-inset ring-white/10">
                    <dt className="shrink-0 text-white/60">{label}</dt>
                    <dd className="flex min-w-0 items-center gap-3">
                      <span className={`truncate text-white ${label.startsWith('CBU') ? 'font-mono text-[12.5px]' : 'font-semibold'}`}>{value}</span>
                      {id && (
                        <button
                          onClick={() => copy(value, id)}
                          aria-label={`Copiar ${label}`}
                          className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1f9d55]"
                        >
                          {copied === id ? 'Copiado' : 'Copiar'}
                        </button>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <Button href={waPlantilla('comprobante')} full className="relative mt-6 !border-[#1f9d55] !bg-[#1f9d55] !text-white hover:!bg-[#178246]">
                <Icon name="whatsapp" size={18} /> Enviar comprobante
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="surface h-full p-7 sm:p-9">
              <p className="label text-accent">Después de pagar</p>
              <h2 className="mt-2 text-[1.35rem] font-bold leading-6">Qué pasa con tu pedido</h2>
              <ol className="mt-7 space-y-5">
                {[
                  { t: 'Confirmamos el pago', d: 'Te avisamos por WhatsApp apenas se acredita y reservamos tu par.' },
                  { t: 'Lo preparamos', d: 'Lo embalamos con cuidado. Si querés, te mandamos fotos antes de despacharlo.' },
                  { t: 'Sale o te espera', d: 'Despachamos en 24 a 48 hs hábiles con código de seguimiento, o queda listo para retirar.' },
                ].map((p, i) => (
                  <li key={p.t} className="flex gap-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/12 text-[14px] font-bold text-[color:var(--bz-accent-text)] ring-1 ring-inset ring-accent/30">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold leading-5">{p.t}</p>
                      <p className="mt-1 text-[13.5px] leading-5 text-index">{p.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-7 border-t border-line pt-5 text-[13.5px] text-index">
                ¿Primera vez? Mirá{' '}
                <Link to="/como-comprar" className="link-u font-semibold text-ink">
                  cómo comprar
                </Link>{' '}
                paso a paso.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
