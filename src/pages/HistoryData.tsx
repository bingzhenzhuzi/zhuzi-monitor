import { useEffect, useMemo, useRef, useState } from 'react'
import { useDevices } from '../hooks/useDevices'
import { useHistoryData } from '../hooks/useSensorData'
import { Card } from '../components/ui/Card'
import { Loading, ErrorState, EmptyState } from '../components/ui/feedback'
import { SensorLineChart, type ChartLine } from '../components/charts/SensorLineChart'
import { fmtDateTimeMin, fmtDateTime } from '../lib/utils'
import type { Device, SensorDataPoint } from '../types'

type DataType = 'temperature' | 'humidity' | 'all'

const PALETTE = ['#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#fb7185', '#4ade80']

function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function exportCsv(rows: SensorDataPoint[], nameById: Map<string, string>) {
  const header = ['时间(北京时间)', '设备', '温度(℃)', '湿度(%)', '信号强度(%)']
  const lines = rows.map((p) => [
    fmtDateTime(p.reportedAt),
    nameById.get(p.deviceId) ?? p.deviceId,
    p.temperature != null ? p.temperature.toFixed(1) : '',
    p.humidity != null ? p.humidity.toFixed(1) : '',
    p.signalStrength != null ? String(p.signalStrength) : '',
  ])
  const csv = '﻿' + [header, ...lines].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `历史数据_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function HistoryData() {
  const devices = useDevices()
  const [selected, setSelected] = useState<string[]>([])
  const initialized = useRef(false)

  const now = Date.now()
  const [from, setFrom] = useState(() => new Date(now - 24 * 3600000).toISOString())
  const [to, setTo] = useState(() => new Date(now).toISOString())
  const [dataType, setDataType] = useState<DataType>('temperature')

  useEffect(() => {
    if (!initialized.current && devices.data && devices.data.length > 0) {
      setSelected(devices.data.slice(0, 3).map((d) => d.id))
      initialized.current = true
    }
  }, [devices.data])

  const nameById = useMemo(
    () => new Map((devices.data ?? []).map((d: Device) => [d.id, d.name])),
    [devices.data],
  )

  const selectedDevices = useMemo(
    () => (devices.data ?? []).filter((d) => selected.includes(d.id)),
    [devices.data, selected],
  )

  const validRange = new Date(from).getTime() < new Date(to).getTime()
  const history = useHistoryData({ deviceIds: selected, from, to }, selected.length > 0 && validRange)

  function toggleDevice(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const chart = useMemo(() => {
    const flat = history.data ?? []
    const buckets = new Map<number, Record<string, number | string | null> & { __t: number }>()
    for (const p of flat) {
      const t = new Date(p.reportedAt).getTime()
      const bucket = Math.floor(t / 300000) * 300000
      if (!buckets.has(bucket)) {
        buckets.set(bucket, { __t: bucket, time: fmtDateTimeMin(p.reportedAt) })
      }
      const row = buckets.get(bucket)!
      const name = nameById.get(p.deviceId) ?? p.deviceId
      if (dataType === 'temperature' || dataType === 'all') row[`${name}·温度`] = p.temperature
      if (dataType === 'humidity' || dataType === 'all') row[`${name}·湿度`] = p.humidity
    }
    const data = [...buckets.values()].sort((a, b) => a.__t - b.__t)

    const lines: ChartLine[] = []
    for (const d of selectedDevices.slice(0, 5)) {
      if (dataType === 'temperature' || dataType === 'all') {
        lines.push({ key: `${d.name}·温度`, name: `${d.name}·温度`, color: PALETTE[lines.length % PALETTE.length] })
      }
      if (dataType === 'humidity' || dataType === 'all') {
        lines.push({ key: `${d.name}·湿度`, name: `${d.name}·湿度`, color: PALETTE[lines.length % PALETTE.length] })
      }
    }
    return { data, lines }
  }, [history.data, dataType, selectedDevices, nameById])

  const tableRows = useMemo(() => (history.data ?? []).slice().reverse().slice(0, 200), [history.data])

  return (
    <div className="space-y-5">
      {/* 查询条件 */}
      <Card title="查询条件">
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="label">时间范围（起）</label>
            <input type="datetime-local" className="input" value={toLocalInputValue(from)} onChange={(e) => setFrom(new Date(e.target.value).toISOString())} />
          </div>
          <div>
            <label className="label">时间范围（止）</label>
            <input type="datetime-local" className="input" value={toLocalInputValue(to)} onChange={(e) => setTo(new Date(e.target.value).toISOString())} />
          </div>
          <div>
            <label className="label">数据类型</label>
            <select className="select w-full" value={dataType} onChange={(e) => setDataType(e.target.value as DataType)}>
              <option value="temperature">温度</option>
              <option value="humidity">湿度</option>
              <option value="all">全部</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="btn-ghost w-full"
              onClick={() => exportCsv(history.data ?? [], nameById)}
              disabled={!history.data || history.data.length === 0}
            >
              导出 CSV
            </button>
          </div>
        </div>

        {!validRange && <p className="mt-2 text-sm text-red-300">起止时间无效：开始时间需早于结束时间</p>}

        <div className="mt-4">
          <label className="label">选择设备（可多选，最多 5 台参与图表对比）</label>
          {devices.isLoading ? (
            <Loading label="加载设备…" />
          ) : (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-white/5 bg-base-900 p-2">
              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {(devices.data ?? []).map((d: Device) => (
                  <label key={d.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-300 hover:bg-white/5">
                    <input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggleDevice(d.id)} className="accent-cyan-400" />
                    <span className="truncate">{d.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 图表 */}
      <Card title="历史数据趋势">
        {history.isLoading ? (
          <Loading label="加载历史数据…" />
        ) : history.isError ? (
          <ErrorState message="历史数据加载失败" onRetry={() => history.refetch()} />
        ) : selected.length === 0 ? (
          <EmptyState title="请先选择设备" description="在查询条件中勾选要查看的设备" />
        ) : chart.data.length === 0 ? (
          <EmptyState title="该时间范围内无数据" description="请调整时间范围或设备" />
        ) : (
          <>
            {selectedDevices.length > 5 && (
              <p className="mb-2 text-xs text-slate-500">已选择 {selectedDevices.length} 台设备，图表仅显示前 5 台，完整数据见下方表格。</p>
            )}
            <SensorLineChart data={chart.data} lines={chart.lines} />
          </>
        )}
      </Card>

      {/* 数据表格 */}
      <Card title="数据明细">
        {tableRows.length === 0 ? (
          <EmptyState title="暂无数据" />
        ) : (
          <div className="max-h-96 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-base-850">
                <tr className="border-b border-white/5">
                  <th className="th">时间</th>
                  <th className="th">设备</th>
                  <th className="th">温度</th>
                  <th className="th">湿度</th>
                  <th className="th">信号强度</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((p: SensorDataPoint) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="td font-mono text-slate-400">{fmtDateTime(p.reportedAt)}</td>
                    <td className="td text-slate-300">{nameById.get(p.deviceId) ?? p.deviceId}</td>
                    <td className="td font-mono tabular-nums">{p.temperature != null ? `${p.temperature.toFixed(1)}℃` : '—'}</td>
                    <td className="td font-mono tabular-nums">{p.humidity != null ? `${p.humidity.toFixed(1)}%` : '—'}</td>
                    <td className="td font-mono tabular-nums">{p.signalStrength != null ? `${p.signalStrength}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
