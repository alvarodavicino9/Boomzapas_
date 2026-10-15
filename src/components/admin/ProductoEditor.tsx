import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Drawer, Field } from './ui'
import { useUI } from '@/context/UIContext'
import { crearProducto, editarProducto, eliminarProductoPropio, esProductoPropio } from '@/lib/adminStore'
import { MODO_DEMO } from '@/lib/api'
import { BRANDS, CATEGORIAS, DEFAULT_TALLES, SITE } from '@/config/site'
import { cn, formatARS, transferPrice } from '@/lib/format'
import type { Producto } from '@/types'

interface Props {
  producto: Producto | null
  open: boolean
  crear?: boolean
  onClose: () => void
  setStock: (p: Producto, talle: string, cantidad: number) => Promise<void>
  onCreado?: (id: number) => void
}

/** Reduce la foto a ~800 px para que entre en el almacenamiento del navegador. */
function comprimir(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, 800 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => reject(new Error('imagen'))
    img.src = url
  })
}

const VACIO = { nombre: '', marca: 'Nike', categoria: 'urbanas', precio: '', descripcion: '', nuevo: true }

export function ProductoEditor({ producto, open, crear, onClose, setStock, onCreado }: Props) {
  const [f, setF] = useState(VACIO)
  const [foto, setFoto] = useState<string>('')
  const [talles, setTalles] = useState<Record<string, number>>({})
  const [nuevoTalle, setNuevoTalle] = useState('')
  const [error, setError] = useState('')
  const [borrar, setBorrar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useUI()
  const editable = MODO_DEMO

  useEffect(() => {
    if (!open) return
    setError('')
    setBorrar(false)
    if (crear) {
      setF(VACIO)
      setFoto('')
      setTalles(Object.fromEntries(['39', '40', '41', '42', '43'].map((t) => [t, 2])))
    } else if (producto) {
      setF({
        nombre: producto.nombre,
        marca: producto.marca,
        categoria: producto.categoria,
        precio: String(producto.precio),
        descripcion: producto.descripcion,
        nuevo: !!producto.nuevo,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, crear, producto?.id])

  const precio = Number(f.precio) || 0
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))

  const guardar = () => {
    if (!f.nombre.trim()) return setError('Poné el nombre del modelo.')
    if (precio <= 0) return setError('Poné un precio válido.')
    if (crear) {
      if (!foto) return setError('Subí una foto del modelo.')
      const stock = Object.entries(talles)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([talle, cantidad]) => ({ producto_id: 0, talle, cantidad }))
      if (stock.length === 0) return setError('Cargá al menos un talle.')
      const id = crearProducto({
        nombre: f.nombre.trim(),
        marca: f.marca.trim() || 'Otra',
        categoria: f.categoria,
        precio,
        descripcion: f.descripcion.trim(),
        imagenes: [foto],
        stock,
        nuevo: f.nuevo,
      })
      toast('Modelo agregado a la tienda')
      onClose()
      onCreado?.(id)
    } else if (producto) {
      editarProducto(producto.id, {
        nombre: f.nombre.trim(),
        marca: f.marca.trim(),
        categoria: f.categoria,
        precio,
        descripcion: f.descripcion.trim(),
        nuevo: f.nuevo,
      })
      toast('Cambios guardados')
    }
  }

  const cambiarStock = async (talle: string, cantidad: number) => {
    const c = Math.max(0, Math.round(cantidad) || 0)
    if (crear) return setTalles((t) => ({ ...t, [talle]: c }))
    if (!producto) return
    try {
      await setStock(producto, talle, c)
    } catch {
      toast('No se pudo guardar el stock')
    }
  }

  const agregarTalle = () => {
    const t = nuevoTalle.trim()
    if (!/^\d{2}(\.5)?$/.test(t)) return setError('Escribí un talle válido, por ejemplo 41 o 41.5.')
    setError('')
    setNuevoTalle('')
    cambiarStock(t, 1)
  }

  const filas: { talle: string; cantidad: number }[] = crear
    ? Object.entries(talles)
        .map(([talle, cantidad]) => ({ talle, cantidad }))
        .sort((a, b) => Number(a.talle) - Number(b.talle))
    : (producto?.stock ?? [])

  const onFoto = async (file?: File) => {
    if (!file) return
    try {
      setFoto(await comprimir(file))
      setError('')
    } catch {
      setError('No pudimos leer esa imagen.')
    }
  }

  const propio = !!producto && esProductoPropio(producto.id)
  const fotoActual = crear ? foto : producto?.imagenes[0]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={crear ? 'Nuevo modelo' : (producto?.nombre ?? '')}
      subtitle={crear ? 'Se agrega a la tienda en este navegador' : producto && `${producto.marca} · ID ${producto.id}`}
      footer={
        editable ? (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={guardar}>
              {crear ? 'Agregar a la tienda' : 'Guardar cambios'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {!editable && (
          <p className="rounded-xl border border-line bg-stage px-4 py-3 text-[12.5px] leading-5 text-index">
            Con el servidor conectado se puede editar el stock por talle. Precios, fotos y alta de modelos se cargan desde Supabase.
          </p>
        )}

        <div className="flex items-center gap-4">
          {fotoActual ? (
            <img src={fotoActual} alt="" className="h-24 w-24 rounded-2xl bg-stage object-cover" />
          ) : (
            <span className="grid h-24 w-24 place-items-center rounded-2xl border border-dashed border-control text-index">
              <Icon name="image" size={26} />
            </span>
          )}
          <div className="min-w-0 text-[13px]">
            {crear ? (
              <>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onFoto(e.target.files?.[0])} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  {foto ? 'Cambiar foto' : 'Subir foto'}
                </Button>
                <p className="mt-2 text-index">Se achica sola para no ocupar espacio.</p>
              </>
            ) : (
              <>
                <p className="font-display text-xl font-bold">{formatARS(precio || producto?.precio || 0)}</p>
                <p className="text-index">Transferencia: {formatARS(transferPrice(precio || producto?.precio || 0))}</p>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nombre">
              <input className="field-line normal-case" value={f.nombre} onChange={(e) => set('nombre', e.target.value)} disabled={!editable} />
            </Field>
          </div>
          <Field label="Marca">
            <input className="field-line normal-case" list="marcas-admin" value={f.marca} onChange={(e) => set('marca', e.target.value)} disabled={!editable} />
            <datalist id="marcas-admin">
              {BRANDS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Field>
          <Field label="Categoría">
            <select className="field-line normal-case" value={f.categoria} onChange={(e) => set('categoria', e.target.value)} disabled={!editable}>
              {CATEGORIAS.filter((c) => c.id !== 'todos').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Precio de lista"
            hint={precio > 0 ? `Por transferencia: ${formatARS(transferPrice(precio))} (−${formatARS(SITE.transferDiscount)})` : undefined}
          >
            <input
              className="field-line"
              type="number"
              min={0}
              step={500}
              inputMode="numeric"
              value={f.precio}
              onChange={(e) => set('precio', e.target.value)}
              disabled={!editable}
            />
          </Field>
          <div className="flex items-end">
            <label className={cn('flex h-[46px] w-full cursor-pointer items-center gap-3 rounded-xl border border-line px-4 text-[13px]', !editable && 'opacity-60')}>
              <input type="checkbox" className="check" checked={f.nuevo} onChange={(e) => set('nuevo', e.target.checked)} disabled={!editable} />
              Marcar como nuevo
            </label>
          </div>
          <div className="sm:col-span-2">
            <Field label="Descripción (opcional)">
              <textarea
                className="field-line normal-case"
                rows={3}
                value={f.descripcion}
                onChange={(e) => set('descripcion', e.target.value)}
                disabled={!editable}
              />
            </Field>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="label text-index">Stock por talle</h3>
            {filas.length > 0 && (
              <span className="text-[12px] text-index">{filas.reduce((a, s) => a + s.cantidad, 0)} pares</span>
            )}
          </div>
          {filas.length === 0 ? (
            <p className="text-[13px] text-index">Sin talles cargados.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {filas.map((s) => (
                <li key={s.talle} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card px-3 py-2">
                  <span className="label w-10 text-index">T{s.talle}</span>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label={`Restar talle ${s.talle}`}
                      onClick={() => cambiarStock(s.talle, s.cantidad - 1)}
                      disabled={s.cantidad <= 0}
                      className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-control disabled:opacity-40"
                    >
                      <Icon name="minus" size={14} />
                    </button>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={s.cantidad}
                      aria-label={`Stock talle ${s.talle}`}
                      onChange={(e) => cambiarStock(s.talle, Number(e.target.value))}
                      className={cn(
                        'h-8 w-12 rounded-lg border border-transparent bg-transparent text-center text-[14px] font-semibold focus:border-control focus:outline-none',
                        s.cantidad <= 0 ? 'text-danger' : s.cantidad < 3 ? 'text-[#f0a93b]' : '',
                      )}
                    />
                    <button
                      aria-label={`Sumar talle ${s.talle}`}
                      onClick={() => cambiarStock(s.talle, s.cantidad + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-control"
                    >
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {editable && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                className="field-line !h-9 !w-24 !py-0"
                placeholder="Talle"
                inputMode="decimal"
                value={nuevoTalle}
                onChange={(e) => setNuevoTalle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarTalle()}
                list="talles-admin"
              />
              <datalist id="talles-admin">
                {DEFAULT_TALLES.filter((t) => !filas.some((s) => s.talle === t)).map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <Button variant="outline" size="sm" onClick={agregarTalle}>
                Agregar talle
              </Button>
              {!crear && filas.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => filas.forEach((s) => cambiarStock(s.talle, s.cantidad + 1))}>
                    +1 a todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => filas.forEach((s) => cambiarStock(s.talle, 0))}>
                    Agotar
                  </Button>
                </>
              )}
            </div>
          )}
          {error && (
            <p role="alert" className="label mt-3 text-danger">
              {error}
            </p>
          )}
        </section>

        {editable && !crear && producto && (
          <section className="space-y-3 border-t border-line pt-5">
            <button
              onClick={() => {
                editarProducto(producto.id, { oculto: !producto.oculto })
                toast(producto.oculto ? 'Visible en la tienda' : 'Oculto de la tienda')
              }}
              className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left text-[13.5px] hover:border-control"
            >
              <span>
                {producto.oculto ? 'Mostrar en la tienda' : 'Ocultar de la tienda'}
                <span className="block text-[12px] text-index">
                  {producto.oculto ? 'Ahora los clientes no lo ven.' : 'Lo sacás del catálogo sin borrarlo.'}
                </span>
              </span>
              <Icon name={producto.oculto ? 'eye' : 'eyeoff'} size={18} />
            </button>
            {propio &&
              (borrar ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="!border-danger !text-danger"
                    onClick={() => {
                      eliminarProductoPropio(producto.id)
                      onClose()
                      toast('Modelo eliminado')
                    }}
                  >
                    Sí, eliminar modelo
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setBorrar(false)}>
                    No
                  </Button>
                </div>
              ) : (
                <button onClick={() => setBorrar(true)} className="label inline-flex items-center gap-2 text-index hover:text-danger">
                  <Icon name="trash" size={15} /> Eliminar modelo
                </button>
              ))}
          </section>
        )}
      </div>
    </Drawer>
  )
}
