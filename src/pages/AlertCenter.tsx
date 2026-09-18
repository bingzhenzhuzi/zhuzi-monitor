import { useState } from 'react'
import { useAlerts, useAlertSummary, useResolveAlert } from '../hooks/useAlerts'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { Loading, ErrorState, EmptyState } from '../components/ui/feedback'
import {
  ALERT_TYPES,
  ALERT_TYPE_LABELS,
  ALERT_LEVELS,
  ALERT_LEVEL_LABELS,
  ALERT_LEVEL_COLORS,
  ALERT_STATUS_LABELS,
} from '../lib/constants'
import { fmtDateTime, cx } from '../lib/utils'
import type { Alert, AlertLevel, AlertStatus, AlertType } from '../types'

const LEVEL_TONE = { critical: 'red', major: 'amber', minor: 'blue' } as const
const STATUS_TONE = { pending: 'red', processing: 'amber', resolved: 'green' } as const

export function AlertCenter() {
  const summary = useAlertSummary()
  const resolveMutation = useResolveAlert()

  const [level, setLevel] = useState<AlertLevel | 'all'>('all')
  const [type, setType] = useState<AlertType | 'all'>('all')
  const [status, setStatus] = useState<AlertStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [remark, setRemark] = useState('')

  const alerts = useAlerts({ level, type, status })

  function handleResolve(id: string) {
    resolveMutation.mutate({ id, remark })
    setRemark('')
    setExpandedId(null)
  }

  return (
    <div className="space-y-5">
      {/* 统计 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="今日告警" value={summary.data?.today ?? '—'} accent="#ef4444" icon="📅" />
        <StatCard label="未处理告警" value={summary.data?.pending ?? '—'} accent="#f59e0b" icon="⚠️" />
        <StatCard label="紧急" value={summary.data?.byLevel.critical ?? '—'} accent="#ef4444" icon="🔴" />
        <StatCard label="重要" value={summary.data?.byLevel.major ?? '—'} accent="#f59e0b" icon="🟠" />
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-3">
        <select className="select" value={level} onChange={(e) => setLevel(e.target.value as AlertLevel | 'all')}>
          <option value="all">全部等级</option>
          {ALERT_LEVELS.map((l) => (
            <option key={l} value={l}>{ALERT_LEVEL_LABELS[l]}</option>
          ))}
        </select>
        <select className="select" value={type} onChange={(e) => setType(e.target.value as AlertType | 'all')}>
          <option value="all">全部类型</option>
          {ALERT_TYPES.map((t) => (
            <option key={t} value={t}>{ALERT_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value as AlertStatus | 'all')}>
          <option value="all">全部处理状态</option>
          {Object.entries(ALERT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* 列表 */}
      <Card title="告警列表" bodyClassName="p-0">
        {alerts.isLoading ? (
          <Loading label="加载告警…" />
        ) : alerts.isError ? (
          <ErrorState message="告警加载失败" onRetry={() => alerts.refetch()} />
        ) : (alerts.data?.length ?? 0) === 0 ? (
          <EmptyState title="暂无告警" description="当前没有符合条件的告警记录" />
        ) : (
          <ul className="divide-y divide-white/5">
            {alerts.data!.map((a: Alert) => (
              <li key={a.id}>
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                  onClick={() => {
                    setExpandedId(expandedId === a.id ? null : a.id)
                    setRemark('')
                  }}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ALERT_LEVEL_COLORS[a.level] }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-200">{a.deviceName}</span>
                      <Badge tone={LEVEL_TONE[a.level]}>{ALERT_LEVEL_LABELS[a.level]}</Badge>
                      <Badge tone={STATUS_TONE[a.status]}>{ALERT_STATUS_LABELS[a.status]}</Badge>
                    </div>
                    <div className="text-xs text-slate-500">{ALERT_TYPE_LABELS[a.type]}</div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-slate-500">{fmtDateTime(a.triggeredAt)}</span>
                  <span className={cx('shrink-0 text-xs text-slate-500 transition-transform', expandedId === a.id && 'rotate-180')}>▼</span>
                </button>

                {expandedId === a.id && (
                  <div className="space-y-3 border-t border-white/5 bg-base-900/50 px-4 py-3">
                    <div className="grid gap-2 text-sm sm:grid-cols-3">
                      <div>
                        <div className="text-xs text-slate-500">触发值</div>
                        <div className="font-mono text-slate-200">{a.triggerValue != null ? a.triggerValue : '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">阈值</div>
                        <div className="font-mono text-slate-200">{a.threshold != null ? a.threshold : '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">处理时间</div>
                        <div className="font-mono text-slate-200">{a.resolvedAt ? fmtDateTime(a.resolvedAt) : '—'}</div>
                      </div>
                    </div>
                    {a.remark && (
                      <div className="text-sm">
                        <span className="text-xs text-slate-500">处理备注：</span>
                        <span className="text-slate-300">{a.remark}</span>
                      </div>
                    )}
                    {a.status !== 'resolved' && (
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="label">处理备注</label>
                          <textarea className="input" rows={2} placeholder="填写处理说明…" value={remark} onChange={(e) => setRemark(e.target.value)} />
                        </div>
                        <button
                          className="btn-primary"
                          disabled={resolveMutation.isPending}
                          onClick={() => handleResolve(a.id)}
                        >
                          {resolveMutation.isPending ? '提交中…' : '标记已处理'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
