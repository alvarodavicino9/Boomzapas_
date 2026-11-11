import type { Categoria } from '@/types'

/**
 * La tienda tiene dos categorías: deportivas y urbanas. Lo que venga de antes (running, lifestyle)
 * o escrito distinto desde la base o el panel se acomoda acá.
 */
export function normCategoria(c: string | undefined | null): Categoria {
  const v = (c ?? '').toLowerCase().trim()
  return /deport|running|correr|training|entren/.test(v) ? 'deportivas' : 'urbanas'
}
