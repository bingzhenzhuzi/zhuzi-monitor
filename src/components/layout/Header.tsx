import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { formatBeijingTime } from '../../lib/utils'
import { Badge } from '../ui/Badge'

function useBeijingClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function Header({
  title,
  onToggleSidebar,
}: {
  title: string
  onToggleSidebar?: () => void
}) {
  const { user, signOut, demoMode } = useAuth()
  const now = useBeijingClock()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/5 bg-base-900/80 px-4 backdrop-blur">
      {onToggleSidebar && (
        <button
          className="btn-ghost !px-2 !py-1.5 md:hidden"
          onClick={onToggleSidebar}
          aria-label="切换菜单"
        >
          ☰
        </button>
      )}
      <h1 className="text-base font-semibold text-slate-100">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        {demoMode && <Badge tone="amber">演示模式</Badge>}

        <div className="hidden text-right sm:block">
          <div className="font-mono text-sm tabular-nums text-slate-300">
            {formatBeijingTime(now, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </div>
          <div className="text-[10px] text-slate-500">北京时间 (UTC+8)</div>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-cyan-300">
            {(user?.email?.[0] ?? 'A').toUpperCase()}
          </div>
          <span className="hidden max-w-[160px] truncate text-xs text-slate-400 sm:block">
            {user?.email ?? '未登录'}
          </span>
          <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => signOut()}>
            退出
          </button>
        </div>
      </div>
    </header>
  )
}
