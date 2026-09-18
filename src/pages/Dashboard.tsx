import { useNavigate } from 'react-router-dom'
import { useDeviceSummary } from '../hooks/useDevices'
import { useRecentAlerts } from '../hooks/useAlerts'
import { useOnlineRateTrend } from '../hooks/useSensorData'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StatusDot } from '../components/ui/StatusDot'
import { Loading, ErrorState, EmptyState } from '../components/ui/feedback'
import { CommDistributionChart, type CommSlice } from '../components/charts/CommDistributionChart'
import { OnlineRateTrendChart } from '../components/charts/OnlineRateTrendChart'
import {
  COMM_TYPES,
  COMM_TYPE_COLORS,
  COMM_TYPE_LABELS,
  ALERT_TYPE_LABELS,
  ALERT_LEVEL_COLORS,
  ALERT_LEVEL_LABELS,
  ALERT_STATUS_LABELS,
} from '../lib/constants'
import { fmtDateTimeMin } from '../lib/utils'

export function Dashboard() {
  const navigate = useNavigate()
  const summary = useDeviceSummary()
  const recentAlerts = useRecentAlerts(8)
  const trend = useOnlineRateTrend()

  if (summary.isLoading) return <Loading label="正在加载设备概览…" />
  if (summary.isError) return <ErrorState message="设备概览加载失败" onRetry={() => summary.refetch()} />

  const s = summary.data!

  const commSlices: CommSlice[] = COMM_TYPES.map((ct) => ({
    name: COMM_TYPE_LABELS[ct],
    value: s.byCommType[ct],
    color: COMM_TYPE_COLORS[ct],
  }))

  return (
    <div className="space-y-5">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="设备总数" value={s.total} accent="#22d3ee" icon="🖥️" onClick={() => navigate('/devices')} />
        <StatCard label="在线设备" value={s.online} accent="#10b981" icon="🟢" onClick={() => navigate('/devices?status=online')} />
        <StatCard label="离线设备" value={s.offline} accent="#64748b" icon="⚪" onClick={() => navigate('/devices?status=offline')} />
        <StatCard label="当前告警" value={s.alert} accent="#ef4444" icon="🔔" onClick={() => navigate('/alerts')} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 通信方式分布 */}
        <Card title="通信方式分布">
          <CommDistributionChart data={commSlices} />
        </Card>

        {/* 环境数据概览 */}
        <Card title="环境数据概览">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/5 p-4">
              <div className="text-xs text-slate-400">平均温度</div>
              <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-cyan-300">
                {s.avgTemp != null ? `${s.avgTemp.toFixed(1)}℃` : '—'}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span className="text-red-300">{s.abnormalTempCount}</span> 台温度异常
              </div>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <div className="text-xs text-slate-400">平均湿度</div>
              <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-cyan-300">
                {s.avgHumidity != null ? `${s.avgHumidity.toFixed(1)}%` : '—'}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span className="text-red-300">{s.abnormalHumidityCount}</span> 台湿度异常
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {COMM_TYPES.map((ct) => (
              <div key={ct} className="flex items-center gap-3 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COMM_TYPE_COLORS[ct] }} />
                <span className="w-16 text-slate-400">{COMM_TYPE_LABELS[ct]}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.total ? (s.byCommType[ct] / s.total) * 100 : 0}%`,
                      backgroundColor: COMM_TYPE_COLORS[ct],
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-slate-300">{s.byCommType[ct]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 最近告警 */}
        <Card title="最近告警" extra={<button className="text-xs text-cyan-300 hover:underline" onClick={() => navigate('/alerts')}>查看全部</button>}>
          {recentAlerts.isLoading ? (
            <Loading label="加载告警…" />
          ) : recentAlerts.isError ? (
            <ErrorState message="告警加载失败" onRetry={() => recentAlerts.refetch()} />
          ) : recentAlerts.data && recentAlerts.data.length > 0 ? (
            <ul className="divide-y divide-white/5">
              {recentAlerts.data.map((a) => (
                <li
                  key={a.id}
                  className="flex cursor-pointer items-center gap-3 py-2.5 transition hover:bg-white/5"
                  onClick={() => navigate('/alerts')}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ALERT_LEVEL_COLORS[a.level] }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-200">{a.deviceName}</div>
                    <div className="text-xs text-slate-500">{ALERT_TYPE_LABELS[a.type]}</div>
                  </div>
                  <Badge tone={a.level === 'critical' ? 'red' : a.level === 'major' ? 'amber' : 'blue'}>
                    {ALERT_LEVEL_LABELS[a.level]}
                  </Badge>
                  <span className="shrink-0 font-mono text-xs text-slate-500">{fmtDateTimeMin(a.triggeredAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="暂无告警" description="当前所有设备运行正常" />
          )}
        </Card>

        {/* 在线率趋势 */}
        <Card title="近 24 小时设备在线率">
          {trend.isLoading ? (
            <Loading label="加载趋势…" />
          ) : trend.isError ? (
            <ErrorState message="趋势加载失败" onRetry={() => trend.refetch()} />
          ) : trend.data && trend.data.length > 0 ? (
            <OnlineRateTrendChart data={trend.data} />
          ) : (
            <EmptyState title="暂无趋势数据" />
          )}
        </Card>
      </div>

      {/* 设备状态概览图例 */}
      <Card title="状态说明">
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
          <StatusDot status="online" />
          <StatusDot status="offline" />
          <StatusDot status="alert" />
          <span className="text-xs text-slate-500">
            告警处理状态：{Object.entries(ALERT_STATUS_LABELS).map(([k, v]) => `${v}(${k})`).join(' / ')}
          </span>
        </div>
      </Card>
    </div>
  )
}
