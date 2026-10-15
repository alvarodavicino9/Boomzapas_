import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/format'

/** primary: relleno blanco que se invierte al pasar el mouse. outline: borde gris que se rellena. */
type Variant = 'primary' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'btn btn-primary',
  outline: 'btn btn-outline',
}

const sizes: Record<Size, string> = {
  sm: '!min-h-10 !px-5',
  md: '',
  lg: '!min-h-14 !px-8',
}

interface Shared {
  variant?: Variant
  size?: Size
  full?: boolean
  className?: string
  children: ReactNode
}

type ButtonProps = Shared & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined }
type RouterProps = Shared & Omit<LinkProps, 'className' | 'children'> & { href?: undefined }
type AnchorProps = Shared & AnchorHTMLAttributes<HTMLAnchorElement> & { to?: undefined; href: string }

export function Button(props: ButtonProps | RouterProps | AnchorProps) {
  const { variant = 'primary', size = 'md', full, className, children, ...rest } = props
  const cls = cn(variants[variant], sizes[size], full && 'w-full', className)

  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link className={cls} {...(rest as Omit<LinkProps, 'className'>)}>
        {children}
      </Link>
    )
  }
  if ('href' in rest && rest.href !== undefined) {
    const external = /^https?:/.test(rest.href)
    return (
      <a
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
