import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = '#22d3ee',
  onClick,
}: {
  label: string
  value: ReactNode
  sub?: string
  icon?: ReactNode
  accent?: string
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cx(
        'card card-pad flex flex-col gap-2 text-left transition',
        onClick && 'cursor-pointer hover:border-accent/30 hover:shadow-glow',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </Comp>
  )
}
