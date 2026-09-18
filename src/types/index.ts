// ============================================================
// 全局类型定义
// 所有时间字段统一存储为 UTC（ISO 8601），前端展示时转换为北京时间（UTC+8）
// ============================================================

/** 通信方式 */
export type CommType = 'wifi' | 'ethernet' | 'cellular' | 'bluetooth' | 'nbiot'

/** 设备状态 */
export type DeviceStatus = 'online' | 'offline' | 'alert'

/** 告警等级 */
export type AlertLevel = 'critical' | 'major' | 'minor'

/** 告警类型 */
export type AlertType =
  | 'temp_high'
  | 'temp_low'
  | 'humidity_high'
  | 'humidity_low'
  | 'offline'
  | 'signal_abnormal'

/** 告警处理状态 */
export type AlertStatus = 'pending' | 'processing' | 'resolved'

/** 设备 */
export interface Device {
  id: string
  name: string
  code: string
  commType: CommType
  status: DeviceStatus
  firmwareVersion: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  onlineSince: string | null
  lastReportAt: string | null
  currentTemp: number | null
  currentHumidity: number | null
  signalStrength: number | null
}

/** 传感器数据点 */
export interface SensorDataPoint {
  id: string
  deviceId: string
  temperature: number
  humidity: number
  signalStrength: number | null
  reportedAt: string
}

/** 告警记录 */
export interface Alert {
  id: string
  deviceId: string
  deviceName: string
  type: AlertType
  level: AlertLevel
  triggerValue: number | null
  threshold: number | null
  triggeredAt: string
  status: AlertStatus
  remark: string | null
  resolvedAt: string | null
}

/** 日历笔记 */
export interface CalendarNote {
  id: string
  date: string // YYYY-MM-DD（北京时间）
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

/** 记事本 */
export interface Memo {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  updatedAt: string
}

/** 设备汇总统计 */
export interface DeviceSummary {
  total: number
  online: number
  offline: number
  alert: number
  byCommType: Record<CommType, number>
  avgTemp: number | null
  avgHumidity: number | null
  abnormalTempCount: number
  abnormalHumidityCount: number
}

/** 告警统计 */
export interface AlertSummary {
  today: number
  pending: number
  byLevel: Record<AlertLevel, number>
}
