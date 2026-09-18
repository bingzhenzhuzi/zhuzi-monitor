import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-accent',
        className,
      )}
    />
  )
}

/** 区块加载态 */
export function Loading({ label = '加载中…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <Spinner className="h-6 w-6" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

/** 错误提示 */
export function ErrorState({
  message = '加载失败，请稍后重试',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-2xl">⚠️</div>
      <p className="text-sm text-red-300">{message}</p>
      {onRetry && (
        <button className="btn-ghost" onClick={onRetry}>
          重试
        </button>
      )}
    </div>
  )
}

/** 空状态 */
export function EmptyState({
  title = '暂无数据',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="text-2xl opacity-50">📭</div>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      {action}
    </div>
  )
}
