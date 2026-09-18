import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useDevices } from '../../hooks/useDevices'
import { useDeviceThresholds, useSaveDeviceThresholds } from '../../hooks/useAlertThresholds'
import { METRIC_MAP } from '../../lib/metrics'
import type { MetricKey } from '../../types'
import type { ThresholdInput } from '../../services/alertThresholds'
import { Modal } from '../ui/Modal'

type Draft = Partial<Record<MetricKey, { min: string; max: string }>>

function numOrNull(s: string): number | null {
  if (s.trim() === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function ThresholdForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const devices = useDevices()
  const [deviceId, setDeviceId] = useState('')
  const thresholds = useDeviceThresholds(deviceId || undefined)
  const save = useSaveDeviceThresholds()
  const [draft, setDraft] = useState<Draft>({})

  const device = useMemo(
    () => (devices.data ?? []).find((d) => d.id === deviceId),
    [devices.data, deviceId],
  )
  const metrics = useMemo<MetricKey[]>(
    () => (device?.metrics?.length ? device.metrics : []),
    [device],
  )

  // 打开时默认选中第一台设备
  useEffect(() => {
    if (open && !deviceId && devices.data?.length) setDeviceId(devices.data[0].id)
  }, [open, deviceId, devices.data])

  // 设备或阈值变化时回填表单
  useEffect(() => {
    if (!deviceId) return
    const t = thresholds.data
    const next: Draft = {}
    for (const m of metrics) {
      const v = t?.[m]
      next[m] = {
        min: v?.min != null ? String(v.min) : '',
        max: v?.max != null ? String(v.max) : '',
      }
    }
    setDraft(next)
  }, [deviceId, thresholds.data, metrics])

  function setValue(m: MetricKey, field: 'min' | 'max', val: string) {
    setDraft((prev) => {
      const cur = prev[m] ?? { min: '', max: '' }
      return { ...prev, [m]: { ...cur, [field]: val } }
    })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!deviceId) return
    const entries: ThresholdInput[] = metrics.map((m) => ({
      metric: m,
      minValue: numOrNull(draft[m]?.min ?? ''),
      maxValue: numOrNull(draft[m]?.max ?? ''),
    }))
    try {
      await save.mutateAsync({ deviceId, entries })
      onClose()
    } catch {
      /* 错误由 save.error 展示 */
    }
  }

  return (
    <Modal title="告警阈值设置" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">选择设备</label>
          <select className="select w-full" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
            {(devices.data ?? []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {metrics.length === 0 ? (
          <p className="text-sm text-slate-500">该设备未启用任何传感器指标，请先在「添加设备」表单中勾选指标。</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 px-1 text-xs text-slate-500">
              <span>指标</span>
              <span>过低下限</span>
              <span>过高上限</span>
            </div>
            {metrics.map((m) => (
              <div key={m} className="grid grid-cols-[1fr_1fr_1fr] items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: METRIC_MAP[m].color }} />
                  {METRIC_MAP[m].label}
                  <span className="text-xs text-slate-500">{METRIC_MAP[m].unit}</span>
                </span>
                <input
                  className="input font-mono"
                  value={draft[m]?.min ?? ''}
                  onChange={(e) => setValue(m, 'min', e.target.value)}
                  placeholder="不限"
                />
                <input
                  className="input font-mono"
                  value={draft[m]?.max ?? ''}
                  onChange={(e) => setValue(m, 'max', e.target.value)}
                  placeholder="不限"
                />
              </div>
            ))}
          </div>
        )}

        {save.isError && <p className="text-sm text-red-300">保存失败，请重试</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>取消</button>
          <button type="submit" className="btn-primary" disabled={!deviceId || save.isPending}>
            {save.isPending ? '保存中…' : '保存阈值'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
