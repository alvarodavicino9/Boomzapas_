import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

const CURVA = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * Aparece con un fade suave la primera vez que entra en pantalla.
 * Usa IntersectionObserver + transición CSS (no depende de que carguen las animaciones de framer-motion):
 * si algo falla, el contenido se muestra igual.
 */
export function Reveal({ children, delay = 0, y = 12, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visto, setVisto] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisto(true)
      return
    }
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisto(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    // red de seguridad: pase lo que pase, a los 4 s se muestra
    const t = window.setTimeout(() => setVisto(true), 4000)
    return () => {
      io.disconnect()
      window.clearTimeout(t)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visto ? 1 : 0,
        transform: visto ? undefined : `translateY(${y}px)`,
        transition: `opacity 0.5s ${CURVA} ${delay}s, transform 0.5s ${CURVA} ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}
