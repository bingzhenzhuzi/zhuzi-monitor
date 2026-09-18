import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="text-6xl">🧭</div>
      <h1 className="text-2xl font-semibold text-slate-200">页面不存在</h1>
      <p className="text-sm text-slate-500">你访问的页面可能已被移动或删除</p>
      <Link to="/" className="btn-primary">
        返回仪表盘
      </Link>
    </div>
  )
}
