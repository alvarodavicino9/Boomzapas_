export const TEMAS = [
  { id: 'claro', label: 'Claro (azul)', color: '#fafaf9' },
  { id: 'verde', label: 'Claro (verde)', color: '#fafaf9' },
  { id: 'rojo', label: 'Negro y rojo', color: '#070506' },
  { id: 'oscuro', label: 'Negro y azul', color: '#060608' },
] as const

export type TemaId = (typeof TEMAS)[number]['id']

export const getTema = (): TemaId => {
  const t = document.documentElement.getAttribute('data-theme')
  return (TEMAS.find((x) => x.id === t)?.id ?? 'rojo') as TemaId
}

/** Aplica el tema y lo recuerda en este navegador. */
export const setTema = (id: TemaId) => {
  document.documentElement.setAttribute('data-theme', id)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', TEMAS.find((x) => x.id === id)!.color)
  try {
    localStorage.setItem('bz_tema', id)
  } catch {
    /* sin almacenamiento: el cambio vale sólo para esta visita */
  }
}
