import { useCallback, useEffect, useState } from 'react'

interface EventoInstalar extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// El navegador avisa una sola vez que se puede instalar: se guarda acá para cualquier componente.
let guardado: EventoInstalar | null = null
const avisos = new Set<() => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    guardado = e as EventoInstalar
    avisos.forEach((f) => f())
  })
  window.addEventListener('appinstalled', () => {
    guardado = null
    avisos.forEach((f) => f())
  })
}

const yaInstalada = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)

const esIOS = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

/**
 * Para ofrecer "Instalar la app": en Android/Chrome abre el cartel del navegador;
 * en iPhone (que no tiene ese cartel) hay que explicar los pasos a mano.
 */
export function useInstalarApp() {
  const [, refrescar] = useState(0)
  useEffect(() => {
    const f = () => refrescar((n) => n + 1)
    avisos.add(f)
    return () => {
      avisos.delete(f)
    }
  }, [])

  const instalar = useCallback(async () => {
    if (!guardado) return false
    await guardado.prompt()
    const { outcome } = await guardado.userChoice
    guardado = null
    refrescar((n) => n + 1)
    return outcome === 'accepted'
  }, [])

  const instalada = yaInstalada()
  return {
    instalada,
    /** Android / Chrome: hay botón directo. */
    puede: !instalada && guardado !== null,
    /** iPhone: se muestran las instrucciones. */
    ios: !instalada && esIOS(),
    instalar,
  }
}
