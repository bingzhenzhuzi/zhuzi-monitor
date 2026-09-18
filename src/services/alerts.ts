import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { mockResponse } from '../lib/api'
import { mockAlerts } from '../lib/mockData'
import { ALERT_LEVELS } from '../lib/constants'
import type { Alert, AlertLevel, AlertStatus, AlertSummary, AlertType } from '../types'

interface AlertRow {
  id: string
  device_id: string
  device_name: string | null
  type: AlertType
  level: AlertLevel
  trigger_value: number | null
  threshold: number | null
  triggered_at: string
  status: AlertStatus
  remark: string | null
  resolved_at: string | null
}

function mapAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    deviceId: row.device_id,
    deviceName: row.device_name ?? '未知设备',
    type: row.type,
    level: row.level,
    triggerValue: row.trigger_value,
    threshold: row.threshold,
    triggeredAt: row.triggered_at,
    status: row.status,
    remark: row.remark,
    resolvedAt: row.resolved_at,
  }
}

export interface AlertFilters {
  level?: AlertLevel | 'all'
  type?: AlertType | 'all'
  status?: AlertStatus | 'all'
  keyword?: string
}

/** 告警列表（未处理置顶，其余按时间倒序） */
export async function listAlerts(filters: AlertFilters = {}): Promise<Alert[]> {
  const { level = 'all', type = 'all', status = 'all', keyword = '' } = filters

  if (!isSupabaseConfigured || !supabase) {
    let alerts = [...mockAlerts()]
    if (level !== 'all') alerts = alerts.filter((a) => a.level === level)
    if (type !== 'all') alerts = alerts.filter((a) => a.type === type)
    if (status !== 'all') alerts = alerts.filter((a) => a.status === status)
    if (keyword) {
      const k = keyword.toLowerCase()
      alerts = alerts.filter((a) => a.deviceName.toLowerCase().includes(k))
    }
    alerts.sort((a, b) => {
      const pa = a.status === 'pending' ? 0 : a.status === 'processing' ? 1 : 2
      const pb = b.status === 'pending' ? 0 : b.status === 'processing' ? 1 : 2
      if (pa !== pb) return pa - pb
      return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    })
    return mockResponse(alerts)
  }

  let query = supabase.from('alerts').select('*').order('triggered_at', { ascending: false })
  if (level !== 'all') query = query.eq('level', level)
  if (type !== 'all') query = query.eq('type', type)
  if (status !== 'all') query = query.eq('status', status)
  if (keyword) query = query.ilike('device_name', `%${keyword}%`)

  const { data, error } = await query
  if (error) throw error
  const mapped = ((data ?? []) as AlertRow[]).map(mapAlert)
  // 未处理告警置顶
  const rank = (s: AlertStatus) => (s === 'pending' ? 0 : s === 'processing' ? 1 : 2)
  mapped.sort((a, b) => rank(a.status) - rank(b.status))
  return mapped
}

/** 告警统计（今日 / 未处理 / 等级分布） */
export async function getAlertSummary(): Promise<AlertSummary> {
  if (!isSupabaseConfigured || !supabase) {
    const alerts = mockAlerts()
    const todayKey = new Date().toISOString().slice(0, 10)
    const byLevel = { critical: 0, major: 0, minor: 0 } as Record<AlertLevel, number>
    let today = 0
    let pending = 0
    for (const a of alerts) {
      byLevel[a.level] += 1
      if (a.status === 'pending') pending += 1
      if (a.triggeredAt.slice(0, 10) === todayKey) today += 1
    }
    return mockResponse({ today, pending, byLevel })
  }

  const { data, error } = await supabase.from('alerts').select('level, status, triggered_at')
  if (error) throw error
  const rows = (data ?? []) as Array<{ level: AlertLevel; status: AlertStatus; triggered_at: string }>
  const byLevel = { critical: 0, major: 0, minor: 0 } as Record<AlertLevel, number>
  let today = 0
  let pending = 0
  const todayKey = new Date().toISOString().slice(0, 10)
  for (const r of rows) {
    byLevel[r.level] += 1
    if (r.status === 'pending') pending += 1
    if (r.triggered_at.slice(0, 10) === todayKey) today += 1
  }
  return { today, pending, byLevel }
}

/** 最近告警（首页列表） */
export async function getRecentAlerts(limit = 8): Promise<Alert[]> {
  const alerts = await listAlerts()
  return alerts.slice(0, limit)
}

/** 标记告警为已处理（可填写备注） */
export async function resolveAlert(id: string, remark: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    // mock 模式直接更新缓存
    mockAlerts().forEach((a) => {
      if (a.id === id) {
        a.status = 'resolved'
        a.remark = remark || null
        a.resolvedAt = new Date().toISOString()
      }
    })
    await mockResponse(null)
    return
  }

  const { error } = await supabase
    .from('alerts')
    .update({ status: 'resolved', remark, resolved_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
