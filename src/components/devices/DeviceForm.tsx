import { useState, type FormEvent } from 'react'
import { useCreateDevice } from '../../hooks/useDevices'
import { COMM_TYPES, COMM_TYPE_LABELS } from '../../lib/constants'
import { METRICS } from '../../lib/metrics'
import { cx } from '../../lib/utils'
import type { CommType, MetricKey } from '../../types'
import { Modal } from '../ui/Modal'

function numOrUndefined(s: string): number | undefined {
  const n = Number(s)
  return s.trim() !== '' && Number.isFinite(n) ? n : undefined
}

export function DeviceForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateDevice()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [commType, setCommType] = useState<CommType>('wifi')
  const [metrics, setMetrics] = useState<MetricKey[]>(['temperature', 'humidity'])
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [firmwareVersion, setFirmwareVersion] = useState('')

  function toggleMetric(key: MetricKey) {
    setMetrics((prev) => (prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]))
  }

  function reset() {
    setName('')
    setCode('')
    setCommType('wifi')
    setMetrics(['temperature', 'humidity'])
    setLocation('')
    setLatitude('')
    setLongitude('')
    setFirmwareVersion('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim() || !code.trim() || metrics.length === 0) return
    try {
      await create.mutateAsync({
        name: name.trim(),
        code: code.trim(),
        commType,
        metrics,
        location: location.trim() || undefined,
        latitude: numOrUndefined(latitude),
        longitude: numOrUndefined(longitude),
        firmwareVersion: firmwareVersion.trim() || undefined,
      })
      reset()
      onClose()
    } catch {
      /* 错误由 create.error 展示 */
    }
  }

  const disabled = !name.trim() || !code.trim() || metrics.length === 0

  return (
    <Modal title="添加设备" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">设备名称 *</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如 3 号液位传感器"
            />
          </div>
          <div>
            <label className="label">设备编号 *</label>
            <input
              className="input font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="如 ZHUZI-2001"
            />
          </div>
        </div>

        <div>
          <label className="label">通信方式</label>
          <select className="select w-full" value={commType} onChange={(e) => setCommType(e.target.value as CommType)}>
            {COMM_TYPES.map((ct) => (
              <option key={ct} value={ct}>
                {COMM_TYPE_LABELS[ct]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">传感器指标（可多选）*</label>
          <div className="flex flex-wrap gap-2">
            {METRICS.map((m) => {
              const active = metrics.includes(m.key)
              return (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => toggleMetric(m.key)}
                  className={cx(
                    'chip border transition',
                    active
                      ? 'border-accent/40 bg-accent/10 text-cyan-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200',
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="label">安装位置</label>
          <input
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="如 上海·浦东机房"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">纬度</label>
            <input
              className="input font-mono"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="31.23"
            />
          </div>
          <div>
            <label className="label">经度</label>
            <input
              className="input font-mono"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="121.47"
            />
          </div>
        </div>

        <div>
          <label className="label">固件版本</label>
          <input
            className="input font-mono"
            value={firmwareVersion}
            onChange={(e) => setFirmwareVersion(e.target.value)}
            placeholder="v2.4.1"
          />
        </div>

        {create.isError && <p className="text-sm text-red-300">添加失败，请检查设备编号是否重复后重试</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="btn-primary" disabled={disabled || create.isPending}>
            {create.isPending ? '保存中…' : '保存设备'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
