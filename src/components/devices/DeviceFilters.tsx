import { COMM_TYPES, COMM_TYPE_LABELS, DEVICE_STATUSES, STATUS_LABELS } from '../../lib/constants'
import type { CommType, DeviceStatus } from '../../types'

export interface DeviceFilterValues {
  commType: CommType | 'all'
  status: DeviceStatus | 'all'
  keyword: string
}

export function DeviceFilters({
  value,
  onChange,
}: {
  value: DeviceFilterValues
  onChange: (v: DeviceFilterValues) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="select"
        value={value.commType}
        onChange={(e) => onChange({ ...value, commType: e.target.value as CommType | 'all' })}
      >
        <option value="all">全部通信方式</option>
        {COMM_TYPES.map((ct) => (
          <option key={ct} value={ct}>
            {COMM_TYPE_LABELS[ct]}
          </option>
        ))}
      </select>

      <select
        className="select"
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as DeviceStatus | 'all' })}
      >
        <option value="all">全部状态</option>
        {DEVICE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <input
        className="input max-w-xs"
        placeholder="搜索名称 / 编号 / 位置"
        value={value.keyword}
        onChange={(e) => onChange({ ...value, keyword: e.target.value })}
      />
    </div>
  )
}
