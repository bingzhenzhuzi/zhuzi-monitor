import { COMM_TYPE_COLORS, COMM_TYPE_LABELS } from '../../lib/constants'
import { METRIC_MAP } from '../../lib/metrics'
import { fmtDateTimeMin, relativeTime, cx } from '../../lib/utils'
import type { Device } from '../../types'
import { StatusDot } from '../ui/StatusDot'

export type DeviceSortKey = 'name' | 'lastReportAt'

export interface DeviceSort {
  key: DeviceSortKey
  dir: 'asc' | 'desc'
}

const SORTABLE: Array<{ key: DeviceSortKey; label: string }> = [
  { key: 'name', label: '设备名称' },
  { key: 'lastReportAt', label: '最后上报时间' },
]

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
}) {
  return (
    <th className="th">
      <button
        className={cx(
          'inline-flex items-center gap-1 uppercase tracking-wider hover:text-slate-300',
          active ? 'text-cyan-300' : 'text-slate-500',
        )}
        onClick={onClick}
      >
        {label}
        <span className="text-[9px]">{active ? (dir === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  )
}

export function DeviceTable({
  devices,
  sort,
  onSort,
  onOpen,
}: {
  devices: Device[]
  sort: DeviceSort
  onSort: (key: DeviceSortKey) => void
  onOpen: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/5">
            {SORTABLE.map((s) => (
              <SortHeader
                key={s.key}
                label={s.label}
                active={sort.key === s.key}
                dir={sort.dir}
                onClick={() => onSort(s.key)}
              />
            ))}
            <th className="th">传感器指标</th>
            <th className="th">通信方式</th>
            <th className="th">状态</th>
            <th className="th">所在位置</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr
              key={d.id}
              className="cursor-pointer border-b border-white/5 transition hover:bg-white/5"
              onClick={() => onOpen(d.id)}
            >
              <td className="td">
                <div className="font-medium text-slate-200">{d.name}</div>
                <div className="font-mono text-xs text-slate-500">{d.code}</div>
              </td>
              <td className="td font-mono text-slate-400">{fmtDateTimeMin(d.lastReportAt)}</td>
              <td className="td">
                <div className="flex flex-wrap gap-1">
                  {d.metrics.map((m) => (
                    <span key={m} className="chip border border-white/5 bg-white/5 text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: METRIC_MAP[m].color }} />
                      {METRIC_MAP[m].label}
                    </span>
                  ))}
                </div>
              </td>
              <td className="td">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COMM_TYPE_COLORS[d.commType] }} />
                  {COMM_TYPE_LABELS[d.commType]}
                </span>
              </td>
              <td className="td">
                <StatusDot status={d.status} />
              </td>
              <td className="td text-slate-400">
                <div>{d.location ?? '—'}</div>
                <div className="text-xs text-slate-600">{relativeTime(d.lastReportAt)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
