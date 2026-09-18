import type { AlertLevel, AlertStatus, AlertType, CommType, DeviceStatus } from '../types'

export const COMM_TYPES: CommType[] = ['wifi', 'ethernet', 'cellular', 'bluetooth', 'nbiot']

export const COMM_TYPE_LABELS: Record<CommType, string> = {
  wifi: 'WiFi',
  ethernet: '以太网',
  cellular: '蜂窝网络',
  bluetooth: '蓝牙',
  nbiot: 'NB-IoT',
}

export const COMM_TYPE_COLORS: Record<CommType, string> = {
  wifi: '#22d3ee',
  ethernet: '#a78bfa',
  cellular: '#f59e0b',
  bluetooth: '#34d399',
  nbiot: '#f472b6',
}

export const DEVICE_STATUSES: DeviceStatus[] = ['online', 'offline', 'alert']

export const STATUS_LABELS: Record<DeviceStatus, string> = {
  online: '在线',
  offline: '离线',
  alert: '告警',
}

export const STATUS_COLORS: Record<DeviceStatus, string> = {
  online: '#10b981',
  offline: '#64748b',
  alert: '#ef4444',
}

export const ALERT_LEVELS: AlertLevel[] = ['critical', 'major', 'minor']

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  critical: '紧急',
  major: '重要',
  minor: '一般',
}

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  critical: '#ef4444',
  major: '#f59e0b',
  minor: '#3b82f6',
}

export const ALERT_TYPES: AlertType[] = [
  'temp_high',
  'temp_low',
  'humidity_high',
  'humidity_low',
  'offline',
  'signal_abnormal',
]

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  temp_high: '温度超限',
  temp_low: '温度过低',
  humidity_high: '湿度超限',
  humidity_low: '湿度过低',
  offline: '设备离线',
  signal_abnormal: '信号异常',
}

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  pending: '未处理',
  processing: '处理中',
  resolved: '已处理',
}

export const MEMO_CATEGORIES = ['设备维护', '巡检记录', '待办事项', '其他'] as const
