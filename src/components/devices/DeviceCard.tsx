import { COMM_TYPE_COLORS, COMM_TYPE_LABELS } from '../../lib/constants'
import { relativeTime } from '../../lib/utils'
import type { Device } from '../../types'
import { StatusDot } from '../ui/StatusDot'

export function DeviceCard({ device, onOpen }: { device: Device; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(device.id)}
      className="card card-pad flex flex-col gap-3 text-left transition hover:border-accent/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium text-slate-200">{device.name}</div>
          <div className="font-mono text-xs text-slate-500">{device.code}</div>
        </div>
        <StatusDot status={device.status} />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COMM_TYPE_COLORS[device.commType] }} />
        <span className="text-xs text-slate-400">{COMM_TYPE_LABELS[device.commType]}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/5 p-2.5 text-center">
        <div>
          <div className="font-mono text-lg font-semibold tabular-nums text-slate-200">
            {device.currentTemp != null ? `${device.currentTemp.toFixed(1)}℃` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">温度</div>
        </div>
        <div>
          <div className="font-mono text-lg font-semibold tabular-nums text-slate-200">
            {device.currentHumidity != null ? `${device.currentHumidity.toFixed(1)}%` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">湿度</div>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        {device.location ?? '—'} · {relativeTime(device.lastReportAt)}
      </div>
    </button>
  )
}
