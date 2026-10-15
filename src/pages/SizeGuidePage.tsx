import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { TABLA_DE_TALLES_ALT, TABLA_DE_TALLES_SRC } from '@/components/catalog/SizeChartDialog'
import { waLink } from '@/lib/whatsapp'

const PASOS = [
  'Apoyá el pie descalzo sobre una hoja, contra una pared.',
  'Marcá el punto más largo, del talón al dedo más largo.',
  'Medí con una regla y comparalo con la tabla.',
  'Si estás entre dos talles, elegí el más grande.',
]

export default function SizeGuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Ayuda"
        title="Tabla de talles"
        subtitle="Medí tu pie y elegí con tranquilidad. Si te queda la duda, te asesoramos por WhatsApp."
      />
      <section className="page-x grid gap-14 py-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <Reveal>
          <ol className="border-t border-line">
            {PASOS.map((p, i) => (
              <li key={p} className="grid grid-cols-[48px_1fr] gap-4 border-b border-line py-6">
                <span className="label text-index">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-[15px] leading-6">{p}</p>
              </li>
            ))}
          </ol>
          <p className="body-text mt-6">
            Los talles pueden variar 0,5 cm según la marca. Ante la duda, consultanos los centímetros del modelo que te
            gusta.
          </p>
          <Button href={waLink('Hola Boom Zapas. Necesito ayuda para elegir mi talle.')} className="mt-8">
            Consultar mi talle
          </Button>
        </Reveal>

        <Reveal delay={0.08}>
          <img
            src={TABLA_DE_TALLES_SRC}
            alt={TABLA_DE_TALLES_ALT}
            width={1057}
            height={1331}
            className="mx-auto block h-auto w-full max-w-md rounded-3xl border border-line"
          />
        </Reveal>
      </section>
    </>
  )
}
