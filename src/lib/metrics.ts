// ============================================================
// 传感器指标目录与取值助手
// 指标 key -> 名称 / 单位 / 颜色 / 小数位数，以及从 Device / SensorDataPoint
// 取值的统一入口。新增指标只需在此登记 + 扩表即可。
// ============================================================

import type { Device, MetricKey, SensorDataPoint } from '../types'

export interface MetricDef {
  key: MetricKey
  label: string
  unit: string
  color: string
  /** 显示小数位数，默认 1 */
  decimals?: number
}

/** 传感器指标目录（顺序即表单/列表/详情的展示顺序） */
export const METRICS: MetricDef[] = [
  { key: 'temperature', label: '温度', unit: '℃', color: '#f97316' },
  { key: 'humidity', label: '湿度', unit: '%', color: '#22d3ee' },
  { key: 'acceleration', label: '加速度', unit: 'm/s²', color: '#f43f5e' },
  { key: 'illuminance', label: '光照强度', unit: 'lux', color: '#facc15', decimals: 0 },
  { key: 'pressure', label: '压力', unit: 'kPa', color: '#a78bfa' },
  { key: 'liquid_level', label: '液位', unit: '%', color: '#34d399' },
  { key: 'decibel', label: '分贝', unit: 'dB', color: '#fb923c', decimals: 0 },
  { key: 'distance', label: '距离', unit: 'm', color: '#38bdf8', decimals: 2 },
]

export const METRIC_MAP: Record<MetricKey, MetricDef> = Object.fromEntries(
  METRICS.map((m) => [m.key, m]),
) as Record<MetricKey, MetricDef>

export const METRIC_KEYS: MetricKey[] = METRICS.map((m) => m.key)

/** 取设备某指标的当前值 */
export function getCurrent(d: Device, key: MetricKey): number | null {
  switch (key) {
    case 'temperature':
      return d.currentTemp
    case 'humidity':
      return d.currentHumidity
    case 'acceleration':
      return d.currentAcceleration
    case 'illuminance':
      return d.currentIlluminance
    case 'pressure':
      return d.currentPressure
    case 'liquid_level':
      return d.currentLiquidLevel
    case 'decibel':
      return d.currentDecibel
    case 'distance':
      return d.currentDistance
    default:
      return null
  }
}

/** 取某数据点的指标值 */
export function getPoint(p: SensorDataPoint, key: MetricKey): number | null {
  switch (key) {
    case 'temperature':
      return p.temperature
    case 'humidity':
      return p.humidity
    case 'acceleration':
      return p.acceleration
    case 'illuminance':
      return p.illuminance
    case 'pressure':
      return p.pressure
    case 'liquid_level':
      return p.liquidLevel
    case 'decibel':
      return p.decibel
    case 'distance':
      return p.distance
    default:
      return null
  }
}

/** 仅数值（不含单位） */
export function fmtMetricValue(key: MetricKey, value: number | null): string {
  if (value == null) return '—'
  const decimals = METRIC_MAP[key].decimals ?? 1
  return value.toFixed(decimals)
}

/** 数值 + 单位，如 24.5 ℃ / 320 lux */
export function fmtMetric(key: MetricKey, value: number | null): string {
  if (value == null) return '—'
  return `${fmtMetricValue(key, value)} ${METRIC_MAP[key].unit}`
}
