import { useCallback, useState } from 'react'

/** Copia texto al portapapeles y marca cuál fue el último copiado (para mostrar "Copiado"). */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = useCallback(async (value: string, id = value) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const el = document.createElement('textarea')
      el.value = value
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      el.remove()
    }
    setCopied(id)
    window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800)
  }, [])

  return { copied, copy }
}
