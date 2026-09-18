import { STATUS_LABELS, STATUS_COLORS } from '../../lib/constants'
import type { DeviceStatus } from '../../types'
import { cx } from '../../lib/utils'

/** 设备状态指示灯：绿=在线、灰=离线、红=告警 */
export function StatusDot({
  status,
  label = true,
  pulse = false,
}: {
  status: DeviceStatus
  label?: boolean
  pulse?: boolean
}) {
  const color = STATUS_COLORS[status]
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5">
        {pulse && status !== 'offline' && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      </span>
      {label && <span className={cx('text-xs', status === 'offline' ? 'text-slate-500' : 'text-slate-300')}>{STATUS_LABELS[status]}</span>}
    </span>
  )
}
