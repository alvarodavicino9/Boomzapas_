import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Icon } from '@/components/ui/Icon'
import { ModeSwitch } from '@/components/ui/ModeToggle'
import { BRANDS, SITE } from '@/config/site'
import { waLink, waLinkGeneric } from '@/lib/whatsapp'
import { formatARS } from '@/lib/format'

const MAPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`

const REDES = [
  { icon: 'whatsapp' as const, label: 'WhatsApp', href: waLinkGeneric() },
  { icon: 'instagram' as const, label: 'Instagram', href: SITE.instagramUrl },
  { icon: 'mail' as const, label: 'Email', href: `mailto:${SITE.email}` },
]

export function Footer() {
  const arriba = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="page-x mt-20 pb-24 sm:pb-6">
      <div className="on-accent mx-auto max-w-[1180px] overflow-hidden rounded-3xl">
        {/* ── Llamado a la acción ─────────────────────────────── */}
        <div className="flex flex-col gap-6 border-b border-line px-5 py-8 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label text-accent-soft">¿Dudas con tu talle o tu pedido?</p>
            <p className="display-section mt-2 !text-[clamp(1.25rem,2.6vw,1.75rem)]">Te asesoramos por WhatsApp</p>
            <p className="body-text mt-1.5">Respondemos todos los días, con fotos reales del par que te gusta.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={waLink('Hola Boom Zapas. Quiero hacer una consulta.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent max-sm:!px-5"
            >
              <Icon name="whatsapp" size={18} /> Escribinos
            </a>
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline max-sm:!px-5">
              <Icon name="instagram" size={18} />
              <span className="max-sm:hidden">@{SITE.instagram}</span>
              <span className="sm:hidden">Instagram</span>
            </a>
          </div>
        </div>

        {/* ── Columnas ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 px-5 py-9 sm:px-10 md:grid-cols-[1.35fr_1fr_1fr_1.15fr] md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" aria-label="Boom Zapas, inicio" className="inline-block">
              <Logo size={64} wordmark wordmarkClassName="text-[26px]" />
            </Link>
            <p className="body-text mt-4 max-w-[17rem]">
              Zapatillas desde {SITE.city.split(',')[0]}, con envíos a todo el país. Desde {SITE.since}.
            </p>
            <ul className="mt-5 flex gap-2" aria-label="Redes y contacto">
              {REDES.map((r) => (
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
            <Link to="/catalogo">Todo el catálogo</Link>
            <Link to="/catalogo?cat=urbanas">Urbanas</Link>
            <Link to="/catalogo?cat=running">Running</Link>
            <Link to="/catalogo?cat=lifestyle">Lifestyle</Link>
            <Link to="/catalogo?nuevos=1">Nuevos ingresos</Link>
          </FooterCol>

          <FooterCol title="Ayuda">
            <Link to="/como-comprar">Cómo comprar</Link>
            <Link to="/guia-de-talles">Tabla de talles</Link>
            <Link to="/envios">Envíos y retiro</Link>
            <Link to="/pagos">Medios de pago</Link>
            <Link to="/nosotros">Quiénes somos</Link>
            <Link to="/contacto">Contacto</Link>
          </FooterCol>

          <div className="col-span-2 md:col-span-1">
            <h3 className="label mb-4 text-index">Visitanos</h3>
            <a href={MAPA} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2.5">
              <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-accent-soft" />
              <span>
                <span className="block font-medium group-hover:underline group-hover:underline-offset-[5px]">{SITE.address}</span>
                <span className="label mt-1 inline-flex items-center gap-1 text-index group-hover:text-ink">
                  Cómo llegar <Icon name="external" size={12} />
                </span>
              </span>
            </a>
            <div className="mt-5 flex items-start gap-2.5">
              <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-accent-soft" />
              <dl className="grid gap-2">
                {SITE.hours.map((h) => (
                  <div key={h.dias}>
                    <dt className="text-[13px] text-index">{h.dias}</dt>
                    <dd className="font-medium">{h.horario}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ── Pagos y envíos ──────────────────────────────────── */}
        <div className="grid gap-4 border-t border-line px-5 py-6 sm:px-10 md:grid-cols-2">
          <Sello titulo="Pagás con" items={['Mercado Pago', `Transferencia (−${formatARS(SITE.transferDiscount).replace(' ', '\u00a0')})`, 'Efectivo']} icon="card" to="/pagos" />
          <Sello titulo="Recibís con" items={['Correo Argentino a todo el país', 'Retiro sin costo en el local']} icon="truck" to="/envios" />
        </div>

        {/* ── Marcas ──────────────────────────────────────────── */}
        <div className="border-t border-line px-5 py-5 sm:px-10">
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

        {/* ── Cierre: copyright, modo y volver arriba ─────────── */}
        <div className="flex flex-col-reverse gap-4 border-t border-line px-5 py-5 text-index sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p className="label">
            © {new Date().getFullYear()} {SITE.name} · {SITE.city}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <ModeSwitch />
            <button
              type="button"
              onClick={arriba}
              aria-label="Volver arriba"
              className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
            >
              <Icon name="arrow" size={16} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h3 className="label mb-4 text-index">{title}</h3>
      <div className="flex flex-col gap-2.5 text-[14px] [&_a:hover]:text-accent-soft">{children}</div>
    </nav>
  )
}

function Sello({ titulo, items, icon, to }: { titulo: string; items: string[]; icon: 'card' | 'truck'; to: string }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-2xl border border-line p-4 transition-colors hover:border-accent">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-stage text-accent-soft">
        <Icon name={icon} size={20} />
      </span>
      <span className="min-w-0">
        <span className="label block text-index">{titulo}</span>
        <span className="mt-1 block text-[13.5px] leading-5">{items.join(' · ')}</span>
      </span>
    </Link>
  )
}
