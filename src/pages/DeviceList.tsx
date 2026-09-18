import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDevices } from '../hooks/useDevices'
import { DeviceFilters, type DeviceFilterValues } from '../components/devices/DeviceFilters'
import { DeviceTable, type DeviceSort, type DeviceSortKey } from '../components/devices/DeviceTable'
import { DeviceCard } from '../components/devices/DeviceCard'
import { Loading, ErrorState, EmptyState } from '../components/ui/feedback'
import { cx } from '../lib/utils'
import type { CommType, Device, DeviceStatus } from '../types'

const PAGE_SIZE = 10

function sortDevices(devices: Device[], sort: DeviceSort): Device[] {
  const dir = sort.dir === 'asc' ? 1 : -1
  return [...devices].sort((a, b) => {
    if (sort.key === 'name') return a.name.localeCompare(b.name) * dir
    if (sort.key === 'lastReportAt') {
      return ((a.lastReportAt ? new Date(a.lastReportAt).getTime() : 0) -
        (b.lastReportAt ? new Date(b.lastReportAt).getTime() : 0)) * dir
    }
    if (sort.key === 'currentTemp') {
      return ((a.currentTemp ?? -999) - (b.currentTemp ?? -999)) * dir
    }
    return ((a.currentHumidity ?? -999) - (b.currentHumidity ?? -999)) * dir
  })
}

export function DeviceList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState<DeviceFilterValues>({
    commType: (searchParams.get('commType') as CommType | 'all') ?? 'all',
    status: (searchParams.get('status') as DeviceStatus | 'all') ?? 'all',
    keyword: '',
  })
  const [view, setView] = useState<'table' | 'card'>('table')
  const [sort, setSort] = useState<DeviceSort>({ key: 'name', dir: 'asc' })
  const [page, setPage] = useState(1)

  const query = useDevices(filters)

  const sorted = useMemo(() => (query.data ? sortDevices(query.data, sort) : []), [query.data, sort])
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSort(key: DeviceSortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DeviceFilters value={filters} onChange={(v) => { setFilters(v); setPage(1) }} />

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-white/5 p-0.5">
            <button
              className={cx('rounded-md px-3 py-1 text-sm', view === 'table' ? 'bg-accent/15 text-cyan-300' : 'text-slate-400')}
              onClick={() => setView('table')}
            >
              列表
            </button>
            <button
              className={cx('rounded-md px-3 py-1 text-sm', view === 'card' ? 'bg-accent/15 text-cyan-300' : 'text-slate-400')}
              onClick={() => setView('card')}
            >
              卡片
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {query.isLoading ? (
          <Loading label="正在加载设备…" />
        ) : query.isError ? (
          <ErrorState message="设备列表加载失败" onRetry={() => query.refetch()} />
        ) : pageItems.length === 0 ? (
          <EmptyState title="未找到设备" description="尝试调整筛选条件或关键词" />
        ) : view === 'table' ? (
          <DeviceTable devices={pageItems} sort={sort} onSort={handleSort} onOpen={(id) => navigate(`/devices/${id}`)} />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((d) => (
              <DeviceCard key={d.id} device={d} onOpen={(id) => navigate(`/devices/${id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {!query.isLoading && sorted.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            共 <span className="font-mono text-slate-200">{sorted.length}</span> 台设备
          </span>
          <div className="flex items-center gap-2">
            <button className="btn-ghost !px-3 !py-1" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
              上一页
            </button>
            <span className="font-mono">{currentPage} / {totalPages}</span>
            <button className="btn-ghost !px-3 !py-1" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
