import { NavLink } from 'react-router-dom'
import { cx } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: '设备总览', icon: '📊', end: true },
  { to: '/devices', label: '设备管理', icon: '🖥️' },
  { to: '/history', label: '历史数据', icon: '📈' },
  { to: '/map', label: '设备地图', icon: '🗺️' },
  { to: '/alerts', label: '告警中心', icon: '🔔' },
  { to: '/calendar', label: '日历笔记', icon: '📅' },
  { to: '/memos', label: '记事本', icon: '📝' },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-white/5 bg-base-900/80">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-lg">
          🎋
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-100">竹子嵌入式</div>
          <div className="text-[11px] text-slate-500">设备监控平台</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-accent/10 font-medium text-cyan-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
              )
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 px-5 py-3 text-[11px] text-slate-600">
        时间统一 · 北京时间 UTC+8
      </div>
    </aside>
  )
}
