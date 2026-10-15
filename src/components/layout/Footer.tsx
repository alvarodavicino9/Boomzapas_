import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Icon } from '@/components/ui/Icon'
import { BRANDS, SITE } from '@/config/site'
import { waLinkGeneric } from '@/lib/whatsapp'
import { getTema, setTema, TEMAS, type TemaId } from '@/lib/theme'
import { cn } from '@/lib/format'

export function Footer() {
  const [tema, setTemaState] = useState<TemaId>(getTema)
  const elegir = (id: TemaId) => {
    setTema(id)
    setTemaState(id)
  }
  return (
    <footer className="page-x mt-20 pb-6">
      <div className="on-accent mx-auto max-w-[1180px] overflow-hidden rounded-3xl px-5 pb-6 pt-9 sm:px-10 sm:pt-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-[1.35fr_1fr_1fr_1fr] md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <Logo size={72} wordmark wordmarkClassName="text-[28px] text-on-accent [&>span]:text-on-accent" />
            <p className="body-text mt-4 max-w-[17rem]">Zapatillas desde Córdoba, con envíos a todo el país.</p>
            <ul className="mt-5 flex gap-2" aria-label="Redes y contacto">
              {[
                { icon: 'whatsapp' as const, label: 'WhatsApp', href: waLinkGeneric() },
                { icon: 'instagram' as const, label: 'Instagram', href: SITE.instagramUrl },
                { icon: 'mail' as const, label: 'Email', href: `mailto:${SITE.email}` },
              ].map((r) => (
                <li key={r.label}>
                  <a
                    href={r.href}
                    aria-label={r.label}
                    target={r.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
                  >
                    <Icon name={r.icon} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterCol title="Tienda">
            <Link to="/catalogo">Catálogo</Link>
            <Link to="/catalogo?cat=running">Running</Link>
            <Link to="/catalogo?cat=urbanas">Urbanas</Link>
            <Link to="/catalogo?cat=lifestyle">Lifestyle</Link>
          </FooterCol>

          <FooterCol title="Información">
            <Link to="/como-comprar">Cómo comprar</Link>
            <Link to="/guia-de-talles">Tabla de talles</Link>
            <Link to="/envios">Envíos y retiro</Link>
            <Link to="/pagos">Medios de pago</Link>
            <Link to="/nosotros">Quiénes somos</Link>
            <Link to="/contacto">Contacto</Link>
          </FooterCol>

          <FooterCol title="Local" className="col-span-2 md:col-span-1">
            <address className="not-italic leading-5">{SITE.address}</address>
            {SITE.hours.map((h) => (
              <p key={h.dias} className="normal-case leading-5 tracking-normal text-index">
                {h.dias}
                <span className="block text-ink">{h.horario}</span>
              </p>
            ))}
          </FooterCol>
        </div>

        <div className="mt-8 border-t border-line pt-5">
          <ul className="label flex flex-wrap gap-x-5 gap-y-2 text-index" aria-label="Marcas">
            {BRANDS.map((b) => (
              <li key={b}>
                <Link to={`/catalogo?marca=${encodeURIComponent(b)}`} className="hover:text-ink hover:underline hover:underline-offset-[5px]">
                  {b}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-5 text-index">
          <p className="label">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <div className="label flex flex-wrap items-center gap-x-4 gap-y-1" role="group" aria-label="Color de la tienda">
            <span>Color</span>
            {TEMAS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => elegir(t.id)}
                aria-pressed={tema === t.id}
                className={cn('hover:underline hover:underline-offset-[5px]', tema === t.id && 'text-ink underline underline-offset-[5px]')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h3 className="label mb-4 text-index">{title}</h3>
      <div className="label flex flex-col gap-2.5 [&_a:hover]:underline [&_a:hover]:underline-offset-[5px]">{children}</div>
    </div>
  )
}
