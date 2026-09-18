import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDevice } from '../hooks/useDevices'
import { useSensorSeries } from '../hooks/useSensorData'
import { useDeviceThresholds } from '../hooks/useAlertThresholds'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StatusDot } from '../components/ui/StatusDot'
import { Loading, ErrorState, EmptyState } from '../components/ui/feedback'
import { SensorLineChart, type ChartLine } from '../components/charts/SensorLineChart'
import { MiniTrendLine } from '../components/charts/MiniTrendLine'
import { COMM_TYPE_COLORS, COMM_TYPE_LABELS } from '../lib/constants'
import { METRIC_MAP, getCurrent, getPoint, fmtMetric } from '../lib/metrics'
import { fmtDateTime, fmtDateTimeMin, fmtTime, cx } from '../lib/utils'
import type { MetricKey, SensorDataPoint } from '../types'

const RANGES = [1, 6, 24] as const

const REFRESH_OPTIONS = [
  { label: '关闭自动刷新', value: 0 },
  { label: '每 5 秒', value: 5000 },
  { label: '每 10 秒', value: 10000 },
  { label: '每 30 秒', value: 30000 },
]

const DEFAULT_METRICS: MetricKey[] = ['temperature', 'humidity']

/** 指标异常判定：按配置阈值判断过高（>max）/ 过低（<min） */
function isAbnormal(v: number | null, t?: { min: number | null; max: number | null }): boolean {
  if (v == null || !t) return false
  if (t.max != null && v > t.max) return true
  if (t.min != null && v < t.min) return true
  return false
}

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const [range, setRange] = useState<number>(6)
  const [refresh, setRefresh] = useState<number>(10000)

  const device = useDevice(id)
  const series = useSensorSeries(id, range, refresh || undefined)
  const thresholds = useDeviceThresholds(device.data?.id)

  const metrics: MetricKey[] = device.data?.metrics?.length ? device.data.metrics : DEFAULT_METRICS

  const chartLines: ChartLine[] = useMemo(
    () =>
      metrics.map((m) => ({
        key: m,
        name: `${METRIC_MAP[m].label}(${METRIC_MAP[m].unit})`,
        color: METRIC_MAP[m].color,
      })),
    [metrics],
  )

  const chartData = useMemo(
    () =>
      (series.data ?? []).map((p) => {
        const row: Record<string, string | number | null> = {
          time: range >= 6 ? fmtDateTimeMin(p.reportedAt) : fmtTime(p.reportedAt),
        }
        for (const m of metrics) row[m] = getPoint(p, m)
        return row
      }),
    [series.data, range, metrics],
  )

  const trendByMetric = useMemo(() => {
    const map: Record<string, number[]> = {}
    for (const m of metrics) map[m] = (series.data ?? []).map((p) => getPoint(p, m) ?? 0)
    return map
  }, [series.data, metrics])

  const recentLogs = useMemo(() => {
    return [...(series.data ?? [])].reverse().slice(0, 12)
  }, [series.data])

  if (device.isLoading) return <Loading label="正在加载设备…" />
  if (device.isError) return <ErrorState message="设备详情加载失败" onRetry={() => device.refetch()} />
  if (!device.data) return <EmptyState title="设备不存在" description="该设备可能已被删除" />

  const d = device.data

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/devices" className="text-cyan-300 hover:underline">设备管理</Link>
        <span>/</span>
        <span className="text-slate-300">{d.name}</span>
      </div>

      {/* 基本信息 */}
      <Card title="设备基本信息">
        <div className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="设备名称" value={d.name} />
          <InfoRow label="设备编号" value={<span className="font-mono">{d.code}</span>} />
          <InfoRow
            label="通信方式"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COMM_TYPE_COLORS[d.commType] }} />
                {COMM_TYPE_LABELS[d.commType]}
              </span>
            }
          />
          <InfoRow label="状态" value={<StatusDot status={d.status} />} />
          <InfoRow label="固件版本" value={<span className="font-mono">{d.firmwareVersion ?? '—'}</span>} />
          <InfoRow label="安装位置" value={d.location ?? '—'} />
          <InfoRow label="上线时间" value={fmtDateTime(d.onlineSince)} />
          <InfoRow label="最后上报" value={fmtDateTime(d.lastReportAt)} />
          <InfoRow
            label="传感器指标"
            value={
              <span className="flex flex-wrap gap-1">
                {metrics.map((m) => (
                  <span key={m} className="chip border border-white/5 bg-white/5 text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: METRIC_MAP[m].color }} />
                    {METRIC_MAP[m].label}
                  </span>
                ))}
              </span>
            }
          />
        </div>
      </Card>

      {/* 实时数据面板 */}
      <Card title="实时数据">
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <RealtimeTile
              key={m}
              label={METRIC_MAP[m].label}
              value={fmtMetric(m, getCurrent(d, m))}
              color={METRIC_MAP[m].color}
              trend={trendByMetric[m] ?? []}
              abnormal={isAbnormal(getCurrent(d, m), thresholds.data?.[m])}
            />
          ))}
          <div className="card border border-white/5 bg-base-900 p-4">
            <div className="text-xs text-slate-400">信号强度</div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-slate-200">
              {d.signalStrength != null ? `${d.signalStrength}%` : '—'}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${d.signalStrength ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 实时曲线 */}
      <Card
        title="实时曲线"
        extra={
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-white/5 p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  className={cx('rounded-md px-2.5 py-1 text-xs', range === r ? 'bg-accent/15 text-cyan-300' : 'text-slate-400')}
                  onClick={() => setRange(r)}
                >
                  近 {r} 小时
                </button>
              ))}
            </div>
            <select className="select !py-1 text-xs" value={refresh} onChange={(e) => setRefresh(Number(e.target.value))}>
              {REFRESH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        }
      >
        {series.isLoading ? (
          <Loading label="加载曲线数据…" />
        ) : series.isError ? (
          <ErrorState message="曲线数据加载失败" onRetry={() => series.refetch()} />
        ) : chartData.length === 0 ? (
          <EmptyState title="暂无传感器数据" />
        ) : (
          <SensorLineChart data={chartData} lines={chartLines} unit="" />
        )}
      </Card>

      {/* 设备日志 */}
      <Card title="最近上报记录">
        {recentLogs.length === 0 ? (
          <EmptyState title="暂无上报记录" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="th">上报时间</th>
                  {metrics.map((m) => (
                    <th key={m} className="th">{METRIC_MAP[m].label}</th>
                  ))}
                  <th className="th">信号强度</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log: SensorDataPoint) => (
                  <tr key={log.id} className="border-b border-white/5">
                    <td className="td font-mono text-slate-400">{fmtDateTime(log.reportedAt)}</td>
                    {metrics.map((m) => (
                      <td key={m} className="td font-mono tabular-nums">{fmtMetric(m, getPoint(log, m))}</td>
                    ))}
                    <td className="td font-mono tabular-nums">{log.signalStrength != null ? `${log.signalStrength}%` : '—'}</td>
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

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  )
}

function RealtimeTile({
  label,
  value,
  color,
  trend,
  abnormal,
}: {
  label: string
  value: string
  color: string
  trend: number[]
  abnormal?: boolean
}) {
  return (
    <div className="card border border-white/5 bg-base-900 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        {abnormal && <Badge tone="red">异常</Badge>}
      </div>
      <div className="mt-1 font-mono text-3xl font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="mt-2 flex justify-center">
        <MiniTrendLine values={trend} color={color} width={140} height={36} />
      </div>
    </div>
  )
}
