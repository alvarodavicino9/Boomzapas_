import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHeading({ eyebrow, title, subtitle, action, as: Tag = 'h2', className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-10 flex flex-wrap items-end justify-between gap-6', className)}>
      <div>
        {eyebrow && <p className="label mb-4 text-index">{eyebrow}</p>}
        <Tag className="display-section">{title}</Tag>
        {subtitle && <p className="body-text mt-4 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
