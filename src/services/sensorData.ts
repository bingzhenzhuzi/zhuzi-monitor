import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { mockResponse } from '../lib/api'
import { mockSeries, mockOnlineRateTrend } from '../lib/mockData'
import type { SensorDataPoint } from '../types'

interface SensorRow {
  id: string
  device_id: string
  temperature: number | null
  humidity: number | null
  acceleration: number | null
  illuminance: number | null
  pressure: number | null
  liquid_level: number | null
  decibel: number | null
  distance: number | null
  signal_strength: number | null
  reported_at: string
}

function mapSensor(row: SensorRow): SensorDataPoint {
  return {
    id: row.id,
    deviceId: row.device_id,
    temperature: row.temperature,
    humidity: row.humidity,
    acceleration: row.acceleration,
    illuminance: row.illuminance,
    pressure: row.pressure,
    liquidLevel: row.liquid_level,
    decibel: row.decibel,
    distance: row.distance,
    signalStrength: row.signal_strength,
    reportedAt: row.reported_at,
  }
}

/** 单设备近 N 小时传感器序列（实时曲线） */
export async function getSensorSeries(deviceId: string, hours: number): Promise<SensorDataPoint[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockResponse(mockSeries(deviceId, hours))
  }

  const since = new Date(Date.now() - hours * 3600000).toISOString()
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('device_id', deviceId)
    .gte('reported_at', since)
    .order('reported_at', { ascending: true })

  if (error) throw error
  return ((data ?? []) as SensorRow[]).map(mapSensor)
}

export interface HistoryQuery {
  deviceIds: string[]
  from: string // ISO
  to: string // ISO
}

/** 历史数据查询（支持多设备对比） */
export async function getHistoryData(query: HistoryQuery): Promise<SensorDataPoint[]> {
  if (!isSupabaseConfigured || !supabase) {
    const series = query.deviceIds.flatMap((id) => {
      // 粗略按时间范围取点数
      const hours = Math.max(1, Math.round((new Date(query.to).getTime() - new Date(query.from).getTime()) / 3600000))
      return mockSeries(id, hours).filter((p) => {
        const t = new Date(p.reportedAt).getTime()
        return t >= new Date(query.from).getTime() && t <= new Date(query.to).getTime()
      })
    })
    return mockResponse(series)
  }

  let q = supabase
    .from('sensor_data')
    .select('*')
    .gte('reported_at', query.from)
    .lte('reported_at', query.to)
    .order('reported_at', { ascending: true })

  if (query.deviceIds.length > 0) {
    q = q.in('device_id', query.deviceIds)
  }

  const { data, error } = await q
  if (error) throw error
  return ((data ?? []) as SensorRow[]).map(mapSensor)
}

/** 近 24 小时在线率趋势 */
export async function getOnlineRateTrend(): Promise<Array<{ time: string; rate: number }>> {
  if (!isSupabaseConfigured || !supabase) {
    return mockResponse(mockOnlineRateTrend())
  }

  const { data, error } = await supabase.from('devices').select('status')
  if (error) throw error
  const total = (data ?? []).length
  // 无真实心跳历史时，返回基于当前状态的近似趋势，避免空图表
  const online = (data ?? []).filter((r) => (r as { status: string }).status === 'online').length
  const base = total ? (online / total) * 100 : 0
  const now = Date.now()
  return Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now - (23 - i) * 3600000)
    return { time: t.toISOString(), rate: Math.round(base * 10) / 10 }
  })
}
