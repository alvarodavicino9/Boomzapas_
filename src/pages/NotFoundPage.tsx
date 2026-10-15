import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="page-x flex min-h-[80vh] flex-col items-start justify-center">
      <p className="label mb-5 text-index">Error 404</p>
      <h1 className="display-section">Esta página no existe</h1>
      <p className="body-text mt-5 max-w-md">Capaz el link cambió. Volvé a la tienda y seguí buscando tu próximo par.</p>
      <Button to="/" className="mt-9">
        Ir al inicio
      </Button>
    </section>
  )
}
