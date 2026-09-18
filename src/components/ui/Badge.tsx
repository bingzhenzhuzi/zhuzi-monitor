import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'

type Tone = 'accent' | 'green' | 'gray' | 'red' | 'amber' | 'blue' | 'violet'

const TONES: Record<Tone, string> = {
  accent: 'bg-accent/10 text-cyan-300 border-accent/20',
  green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  gray: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  red: 'bg-red-500/10 text-red-300 border-red-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
}

export function Badge({
  tone = 'gray',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
