import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/config/site'
import { useProductos } from '@/context/ProductsContext'

export default function AboutPage() {
  const { productos, status } = useProductos()
  const stats = [
    { value: '500+', label: 'Clientes' },
    { value: status === 'ready' ? String(productos.length) : '40+', label: 'Modelos en stock' },
    { value: '24 h', label: 'Respuesta' },
    { value: '4,9', label: 'Calificación' },
  ]

  return (
    <>
      <PageHeader eyebrow="Nuestra historia" title="Quiénes somos" />
      <section className="page-x grid items-start gap-14 py-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <Reveal>
          <div className="space-y-6 text-[18px] leading-8">
            <p>
              Boom Zapas nació en {SITE.since} en Córdoba como un emprendimiento 100% digital, con la posibilidad de visitar
              el local cuando quieras.
            </p>
            <p className="text-index">
              Controlamos la calidad de cada par y te enviamos fotos antes del despacho, para que recibas exactamente lo que
              viste. Nada de sorpresas.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button to="/catalogo">Ver catálogo</Button>
              <Button href={SITE.instagramUrl} variant="outline">
                @{SITE.instagram}
              </Button>
            </div>
          </div>
        </Reveal>

        <ul className="grid grid-cols-2 border-l border-t border-line">
          {stats.map((s, i) => (
            <li key={s.label} className="border-b border-r border-line">
              <Reveal delay={i * 0.06}>
                <div className="p-6 sm:p-8">
                  <p className="font-display text-[3.25rem] leading-none">{s.value}</p>
                  <p className="label mt-3 text-index">{s.label}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
