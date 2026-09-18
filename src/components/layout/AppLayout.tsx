import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const PAGE_TITLES: Record<string, string> = {
  '/': '设备总览仪表盘',
  '/devices': '设备管理',
  '/history': '历史数据',
  '/map': '设备地图',
  '/alerts': '告警中心',
  '/calendar': '日历笔记',
  '/memos': '记事本',
}

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const title =
    location.pathname.startsWith('/devices/')
      ? '设备详情'
      : PAGE_TITLES[location.pathname] ?? '竹子嵌入式'

  return (
    <div className="flex h-full">
      {/* 桌面端侧边栏 */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 移动端抽屉 */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onToggleSidebar={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
