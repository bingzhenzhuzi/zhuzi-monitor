import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { mockResponse } from '../lib/api'
import { getMockThresholds, saveMockThresholds } from '../lib/mockData'
import type { DeviceThresholds, MetricKey } from '../types'

interface AlertThresholdRow {
  id: string
  device_id: string
  metric: MetricKey
  min_value: number | null
  max_value: number | null
}

export interface ThresholdInput {
  metric: MetricKey
  minValue: number | null
  maxValue: number | null
}

/** 某设备的阈值表（metric -> { min, max }） */
export async function getDeviceThresholds(deviceId: string): Promise<DeviceThresholds> {
  if (!isSupabaseConfigured || !supabase) {
    return mockResponse(getMockThresholds(deviceId))
  }

  const { data, error } = await supabase
    .from('alert_thresholds')
    .select('*')
    .eq('device_id', deviceId)
  if (error) throw error

  const map = {} as DeviceThresholds
  for (const row of (data ?? []) as AlertThresholdRow[]) {
    map[row.metric] = { min: row.min_value, max: row.max_value }
  }
  return map
}

/** 覆盖式保存某设备的阈值（先删后插，正确处理「清空」的指标） */
export async function saveDeviceThresholds(deviceId: string, entries: ThresholdInput[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    saveMockThresholds(deviceId, entries)
    await mockResponse(null)
    return
  }

  const { error: delErr } = await supabase
    .from('alert_thresholds')
    .delete()
    .eq('device_id', deviceId)
  if (delErr) throw delErr

  const rows = entries
    .filter((e) => e.minValue != null || e.maxValue != null)
    .map((e) => ({
      device_id: deviceId,
      metric: e.metric,
      min_value: e.minValue,
      max_value: e.maxValue,
    }))
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('alert_thresholds').insert(rows)
    if (insErr) throw insErr
  }
}
