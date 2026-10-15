import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { PhotoStrip } from '@/components/sections/PhotoStrip'
import { ContactSection } from '@/components/sections/ContactSection'
import { FOTOS } from '@/config/fotos'
import { SITE } from '@/config/site'
import { useCopy } from '@/hooks/useCopy'
import { formatARS } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'

const METHODS: { icon: IconName; title: string; text: string; tag?: string }[] = [
  { icon: 'bolt', title: 'Mercado Pago', text: 'Pagá con tu cuenta, con tarjeta o en cuotas.' },
  { icon: 'card', title: 'Tarjetas', text: 'Débito y crédito. Coordinamos el pago por WhatsApp.' },
  { icon: 'store', title: 'QR', text: 'En el local, o te lo enviamos por WhatsApp.' },
  {
    icon: 'check',
    title: 'Transferencia o efectivo',
    text: `Te pasamos CBU y alias al confirmar. Pagando así tenés ${formatARS(SITE.transferDiscount)} de descuento por par.`,
    tag: `${formatARS(SITE.transferDiscount)} off`,
  },
]

const PASOS = [
  { title: 'Armá tu pedido', text: 'Elegí tus pares y talles, y completá tus datos.' },
  { title: 'Elegí cómo pagar', text: 'Mercado Pago, tarjeta, QR, transferencia o efectivo.' },
  { title: 'Confirmamos por WhatsApp', text: 'Te pasamos los datos y, si transferís, nos mandás el comprobante.' },
  { title: 'Preparamos tu pedido', text: 'Con el pago confirmado lo embalamos y lo despachamos o lo dejamos para retirar.' },
]

export default function PaymentsPage() {
  const { copied, copy } = useCopy()
  return (
    <>
      <PageHero
        eyebrow="Pagá como quieras"
        title={
          <>
            Medios de <span className="text-accent">pago</span>
          </>
        }
        subtitle="Elegí el que más te convenga. Siempre con atención personalizada y con descuento si pagás por transferencia o en efectivo."
        foto={FOTOS.nb530}
        position="50% 45%"
        actions={
          <>
            <Button to="/catalogo" size="lg">
              Elegir mis zapatillas
            </Button>
            <Button href={waLink('Hola Boom Zapas. Quiero consultar por los medios de pago.')} variant="outline" size="lg">
              <Icon name="whatsapp" size={18} />
              Consultar
            </Button>
          </>
        }
      />

      {/* descuento destacado */}
      <section className="page-x pt-10" aria-label="Descuento">
        <Reveal>
          <div className="on-accent flex flex-wrap items-center justify-between gap-5 rounded-2xl px-6 py-6 sm:px-10">
            <div className="flex items-center gap-5">
              <span className="display-hero !text-[clamp(2rem,4vw,3rem)]">{formatARS(SITE.transferDiscount)}</span>
              <p className="max-w-xs text-[15px] font-medium leading-snug">
                de descuento por cada par pagando por transferencia o en efectivo.
              </p>
            </div>
            <Button href={waLink('Hola Boom Zapas. Quiero pagar por transferencia.')} variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-black">
              Quiero mi descuento
              <Icon name="arrow" size={16} />
            </Button>
          </div>
        </Reveal>
      </section>

      <section className="page-x grid gap-12 py-14 lg:grid-cols-[1.25fr_1fr] lg:gap-16" aria-label="Medios de pago">
        <div>
          <p className="label mb-4 text-accent">Opciones</p>
          <h2 className="display-section mb-8">Formas de pago</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {METHODS.map((m, i) => (
              <li key={m.title}>
                <Reveal delay={i * 0.06} className="h-full">
                  <div className="surface relative h-full p-6">
                    {m.tag && (
                      <span className="label absolute right-5 top-5 rounded-full bg-accent px-3 py-1 text-[10px] font-bold text-on-accent">
                        {m.tag}
                      </span>
                    )}
                    <span className="grid size-12 place-items-center rounded-xl bg-accent/15 text-accent">
                      <Icon name={m.icon} size={24} />
                    </span>
                    <h3 className="display-product mt-5 !text-[1.25rem]">{m.title}</h3>
                    <p className="body-text mt-2">{m.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <aside className="surface p-7 sm:p-9">
            <p className="label text-accent">Transferencia</p>
            <h2 className="display-product mt-3">Datos para transferir</h2>
            <dl className="mt-8 space-y-4 text-[14px]">
              {(
                [
                  ['Titular', SITE.bank.holder, null],
                  ['Banco', SITE.bank.bank, null],
                  ['Alias', SITE.bank.alias, 'alias'],
                  ['CBU', SITE.bank.cbu, 'cbu'],
                ] as const
              ).map(([label, value, id]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                  <dt className="text-index">{label}</dt>
                  <dd className="flex min-w-0 items-center gap-3">
                    <span className={`truncate ${label === 'CBU' ? 'font-mono text-[12px]' : ''}`}>{value}</span>
                    {id && (
                      <button onClick={() => copy(value, id)} aria-label={`Copiar ${label}`} className="label link-u shrink-0 text-accent">
                        {copied === id ? 'Copiado' : 'Copiar'}
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="label mt-6 text-index">Enviá el comprobante por WhatsApp para confirmar tu pedido.</p>
            <Button href={waLink('Hola Boom Zapas. Te envío el comprobante de mi transferencia.')} full className="mt-6">
              Enviar comprobante
            </Button>
          </aside>
        </Reveal>
      </section>

      <section className="page-x section-y border-t border-line" aria-labelledby="como-pagar">
        <p className="label mb-4 text-accent">Paso a paso</p>
        <h2 id="como-pagar" className="display-section mb-12">
          Cómo pagar tu pedido
        </h2>
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 0.07} className="h-full">
                <div className="surface relative h-full p-6 pt-8">
                  <span className="absolute -top-5 left-6 grid size-10 place-items-center rounded-full bg-accent text-[15px] font-bold text-on-accent shadow-lg">
                    {i + 1}
                  </span>
                  <h3 className="display-product !text-[1.25rem]">{p.title}</h3>
                  <p className="body-text mt-3">{p.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <PhotoStrip
        eyebrow="Fotos reales"
        title="Tus próximos pares"
        text="Cada modelo, fotografiado en el local."
        fotos={[
          { foto: FOTOS.nb740Detalle, label: 'NB 740 · detalle' },
          { foto: FOTOS.sambaDetalle, label: 'Samba · detalle' },
          { foto: FOTOS.dunkDetalle, label: 'Dunk · detalle' },
          { foto: FOTOS.nb530Detalle, label: 'NB 530 · detalle' },
        ]}
      />

      <ContactSection title="¿Tenés alguna duda con el pago?" />
    </>
  )
}
