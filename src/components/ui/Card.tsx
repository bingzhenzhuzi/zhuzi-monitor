import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'

export function Card({
  title,
  extra,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode
  extra?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cx('card', className)}>
      {(title || extra) && (
        <header className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {extra}
        </header>
      )}
      <div className={cx('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}
