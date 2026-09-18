import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { mockResponse } from '../lib/api'
import { mockDevices, getMockDevice, getMockDeviceSummary } from '../lib/mockData'
import { COMM_TYPES } from '../lib/constants'
import type { CommType, Device, DeviceStatus, DeviceSummary } from '../types'

// Supabase 行结构（snake_case）
interface DeviceRow {
  id: string
  name: string
  code: string
  comm_type: CommType
  status: DeviceStatus
  firmware_version: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  online_since: string | null
  last_report_at: string | null
  current_temp: number | null
  current_humidity: number | null
  signal_strength: number | null
}

function mapDevice(row: DeviceRow): Device {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    commType: row.comm_type,
    status: row.status,
    firmwareVersion: row.firmware_version,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    onlineSince: row.online_since,
    lastReportAt: row.last_report_at,
    currentTemp: row.current_temp,
    currentHumidity: row.current_humidity,
    signalStrength: row.signal_strength,
  }
}

export interface DeviceFilters {
  commType?: CommType | 'all'
  status?: DeviceStatus | 'all'
  keyword?: string
}

/** 设备列表（支持筛选） */
export async function listDevices(filters: DeviceFilters = {}): Promise<Device[]> {
  const { commType = 'all', status = 'all', keyword = '' } = filters

  if (!isSupabaseConfigured || !supabase) {
    let devices = [...mockDevices()]
    if (commType !== 'all') devices = devices.filter((d) => d.commType === commType)
    if (status !== 'all') devices = devices.filter((d) => d.status === status)
    if (keyword) {
      const k = keyword.toLowerCase()
      devices = devices.filter(
        (d) =>
          d.name.toLowerCase().includes(k) ||
          d.code.toLowerCase().includes(k) ||
          (d.location ?? '').toLowerCase().includes(k),
      )
    }
    return mockResponse(devices)
  }

  let query = supabase.from('devices').select('*').order('name')
  if (commType !== 'all') query = query.eq('comm_type', commType)
  if (status !== 'all') query = query.eq('status', status)
  if (keyword) query = query.ilike('name', `%${keyword}%`)

  const { data, error } = await query
  if (error) throw error
  return ((data ?? []) as DeviceRow[]).map(mapDevice)
}

/** 单台设备详情 */
export async function getDevice(id: string): Promise<Device | null> {
  if (!isSupabaseConfigured || !supabase) {
    return mockResponse(getMockDevice(id) ?? null)
  }

  const { data, error } = await supabase.from('devices').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapDevice(data as DeviceRow) : null
}

/** 设备汇总统计（首页） */
export async function getDeviceSummary(): Promise<DeviceSummary> {
  if (!isSupabaseConfigured || !supabase) {
    return mockResponse(getMockDeviceSummary())
  }

  const { data, error } = await supabase.from('devices').select('*')
  if (error) throw error
  const devices = ((data ?? []) as DeviceRow[]).map(mapDevice)

  const byCommType = {} as Record<CommType, number>
  for (const ct of COMM_TYPES) byCommType[ct] = 0

  let online = 0
  let offline = 0
  let alert = 0
  let tempSum = 0
  let tempCount = 0
  let humSum = 0
  let humCount = 0
  let abnormalTemp = 0
  let abnormalHum = 0

  for (const d of devices) {
    byCommType[d.commType] += 1
    if (d.status === 'online') online += 1
    else if (d.status === 'offline') offline += 1
    else alert += 1

    if (d.currentTemp != null) {
      tempSum += d.currentTemp
      tempCount += 1
      if (d.currentTemp > 35 || d.currentTemp < 5) abnormalTemp += 1
    }
    if (d.currentHumidity != null) {
      humSum += d.currentHumidity
      humCount += 1
      if (d.currentHumidity > 80 || d.currentHumidity < 20) abnormalHum += 1
    }
  }

  return {
    total: devices.length,
    online,
    offline,
    alert,
    byCommType,
    avgTemp: tempCount ? Math.round((tempSum / tempCount) * 10) / 10 : null,
    avgHumidity: humCount ? Math.round((humSum / humCount) * 10) / 10 : null,
    abnormalTempCount: abnormalTemp,
    abnormalHumidityCount: abnormalHum,
  }
}
