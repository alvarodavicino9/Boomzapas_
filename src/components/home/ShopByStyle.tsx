import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { Reveal } from '@/components/ui/Reveal'
import { fotoDeModelo } from '@/data/fotosCatalogo'

const ESTILOS = [
  { cat: 'urbanas', label: 'Urbanas', foto: fotoDeModelo('Adidas Samba Clasica') },
  { cat: 'running', label: 'Running', foto: fotoDeModelo('Adidas Duramo Amarillo') },
  { cat: 'lifestyle', label: 'Lifestyle', foto: fotoDeModelo('Jordan 4 Grey Silver') },
]

/** Tres puertas de entrada al catálogo, por estilo. */
export function ShopByStyle() {
  return (
    <section className="page-x section-y" aria-labelledby="estilo">
      <div className="mb-10 flex items-center gap-5">
        <span className="h-px flex-1 bg-accent-soft/60" />
        <h2 id="estilo" className="label !text-[13px] !tracking-[0.3em]">
          Comprá por estilo
        </h2>
        <span className="h-px flex-1 bg-accent-soft/60" />
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {ESTILOS.map((e, i) => (
          <li key={e.cat}>
            <Reveal delay={i * 0.06}>
              <Link to={`/catalogo?cat=${e.cat}`} className="group relative block overflow-hidden rounded-2xl shadow-card">
                <ProductImage src={e.foto} alt="" className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.04] sm:aspect-[3/4]" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                  <span className="font-display text-[1.6rem] font-extrabold uppercase leading-none tracking-tight">{e.label}</span>
                  <span className="label border-b border-white/70 pb-0.5">Ver {e.label.toLowerCase()} →</span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
