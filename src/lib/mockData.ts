// ============================================================
// Mock 数据生成器
// 未配置 Supabase 环境变量时使用，保证项目可脱离后端独立运行与演示。
// 数据在模块加载后缓存，保证同一会话内仪表盘/列表/详情/历史数据一致。
// ============================================================

import type {
  Alert,
  AlertLevel,
  AlertType,
  CalendarNote,
  CommType,
  Device,
  DeviceSummary,
  Memo,
  SensorDataPoint,
  MetricKey,
} from '../types'
import { COMM_TYPES, ALERT_TYPES, ALERT_LEVELS } from './constants'
import { round1, clamp, toBeijingDateKey } from './utils'
import { getCurrent } from './metrics'

// 可复现伪随机数
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260918)

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

const SITES = [
  '上海·浦东机房',
  '北京·亦庄园区',
  '深圳·南山智造',
  '杭州·余杭工厂',
  '成都·高新仓',
  '南京·江北库',
  '武汉·光谷站',
  '苏州·工业园',
]
const FW = ['v2.4.1', 'v2.4.0', 'v2.3.8', 'v2.3.7']

// ------------------------- 传感器指标 mock -------------------------

const METRIC_RANGES: Record<MetricKey, [number, number]> = {
  temperature: [18, 32],
  humidity: [30, 80],
  acceleration: [0, 3],
  illuminance: [50, 1000],
  pressure: [95, 105],
  liquid_level: [20, 95],
  decibel: [30, 90],
  distance: [0.1, 10],
}

const METRIC_DEFAULT: Record<MetricKey, number> = {
  temperature: 24,
  humidity: 52,
  acceleration: 1.2,
  illuminance: 400,
  pressure: 101,
  liquid_level: 60,
  decibel: 55,
  distance: 2.5,
}

// 部分设备使用非默认的多指标组合，其余默认温湿度
const METRIC_PRESETS: MetricKey[][] = [
  ['temperature', 'humidity'],
  ['temperature', 'humidity'],
  ['temperature', 'humidity', 'pressure'],
  ['illuminance', 'decibel'],
  ['liquid_level'],
  ['acceleration', 'distance'],
  ['pressure', 'liquid_level'],
]

function setPoint(p: SensorDataPoint, key: MetricKey, value: number) {
  switch (key) {
    case 'temperature':
      p.temperature = value
      break
    case 'humidity':
      p.humidity = value
      break
    case 'acceleration':
      p.acceleration = value
      break
    case 'illuminance':
      p.illuminance = value
      break
    case 'pressure':
      p.pressure = value
      break
    case 'liquid_level':
      p.liquidLevel = value
      break
    case 'decibel':
      p.decibel = value
      break
    case 'distance':
      p.distance = value
      break
  }
}

// ------------------------- 设备 -------------------------

let cachedDevices: Device[] | null = null

export function mockDevices(): Device[] {
  if (cachedDevices) return cachedDevices

  const devices: Device[] = []
  const now = Date.now()

  for (let i = 0; i < 24; i++) {
    const commType = COMM_TYPES[i % COMM_TYPES.length]
    const isOffline = i % 9 === 0
    const isAlert = !isOffline && i % 7 === 0
    const status = isOffline ? 'offline' : isAlert ? 'alert' : 'online'
    const metrics = METRIC_PRESETS[i % METRIC_PRESETS.length]

    const lastReport = new Date(now - (isOffline ? randInt(3600, 7200) : randInt(0, 60)) * 1000)
    const site = pick(SITES)

    // 为启用的指标生成当前值（离线设备全部为 null）
    const vals = {} as Record<MetricKey, number | null>
    for (const m of Object.keys(METRIC_RANGES) as MetricKey[]) {
      const [min, max] = METRIC_RANGES[m]
      vals[m] = status === 'offline' || !metrics.includes(m) ? null : round1(min + rand() * (max - min))
    }

    devices.push({
      id: `dev-${String(i + 1).padStart(3, '0')}`,
      name: `${site.split('·')[1]}传感器-${String(i + 1).padStart(2, '0')}`,
      code: `ZHUZI-${String(1000 + i)}`,
      commType,
      status,
      firmwareVersion: pick(FW),
      location: site,
      latitude: round1(22.5 + rand() * 18),
      longitude: round1(104 + rand() * 18),
      onlineSince: new Date(now - randInt(10, 90) * 86400000).toISOString(),
      lastReportAt: lastReport.toISOString(),
      currentTemp: vals.temperature,
      currentHumidity: vals.humidity,
      signalStrength: status === 'offline' ? null : randInt(55, 99),
      metrics,
      currentAcceleration: vals.acceleration,
      currentIlluminance: vals.illuminance,
      currentPressure: vals.pressure,
      currentLiquidLevel: vals.liquid_level,
      currentDecibel: vals.decibel,
      currentDistance: vals.distance,
    })
  }

  cachedDevices = devices
  return devices
}

export function getMockDevice(id: string): Device | undefined {
  return mockDevices().find((d) => d.id === id)
}

/** 前端「添加设备」在 mock 模式下追加到缓存 */
export function pushMockDevice(device: Device): void {
  mockDevices().unshift(device)
}

export function getMockDeviceSummary(): DeviceSummary {
  const devices = mockDevices()
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
    else if (d.status === 'alert') alert += 1

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
    avgTemp: tempCount ? round1(tempSum / tempCount) : null,
    avgHumidity: humCount ? round1(humSum / humCount) : null,
    abnormalTempCount: abnormalTemp,
    abnormalHumidityCount: abnormalHum,
  }
}

// ------------------------- 传感器数据 -------------------------

/** 生成某设备近 N 小时的时间序列（5 分钟一个点） */
export function mockSeries(deviceId: string, hours: number): SensorDataPoint[] {
  const device = getMockDevice(deviceId)
  const seed = deviceId
    .split('-')
    .reduce((a, c) => a + (Number(c) || 0), 0) || 1
  const r = mulberry32(seed * 7 + 13)

  const step = 5 * 60 * 1000
  const total = Math.floor((hours * 3600000) / step)
  const now = Date.now()
  const baseSignal = device?.signalStrength ?? 75
  const metrics: MetricKey[] = device?.metrics?.length ? device.metrics : ['temperature', 'humidity']

  const points: SensorDataPoint[] = []
  for (let i = total; i >= 0; i--) {
    const t = new Date(now - i * step)
    const p: SensorDataPoint = {
      id: `${deviceId}-${t.getTime()}`,
      deviceId,
      temperature: null,
      humidity: null,
      acceleration: null,
      illuminance: null,
      pressure: null,
      liquidLevel: null,
      decibel: null,
      distance: null,
      signalStrength: clamp(baseSignal + Math.floor((r() - 0.5) * 10), 0, 100),
      reportedAt: t.toISOString(),
    }
    metrics.forEach((m, idx) => {
      const current = device ? getCurrent(device, m) : null
      const base = current ?? METRIC_DEFAULT[m]
      const val = round1(base + Math.sin(i / 6 + idx) * base * 0.08 + (r() - 0.5) * base * 0.05)
      setPoint(p, m, val)
    })
    points.push(p)
  }
  return points
}

/** 生成近 24 小时在线率趋势（每小时一个点） */
export function mockOnlineRateTrend(): Array<{ time: string; rate: number }> {
  const now = Date.now()
  const points: Array<{ time: string; rate: number }> = []
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * 3600000)
    const hour = new Date(t).getHours()
    const dip = hour >= 2 && hour <= 5 ? 4 : 0
    points.push({
      time: t.toISOString(),
      rate: round1(96.5 - dip - (rand() - 0.5) * 3),
    })
  }
  return points
}

// ------------------------- 告警 -------------------------

let cachedAlerts: Alert[] | null = null

export function mockAlerts(): Alert[] {
  if (cachedAlerts) return cachedAlerts

  const devices = mockDevices()
  const now = Date.now()
  const alerts: Alert[] = []

  for (let i = 0; i < 18; i++) {
    const d = devices[i % devices.length]
    const type = pick(ALERT_TYPES) as AlertType
    const level = pick(ALERT_LEVELS) as AlertLevel
    const status = i < 5 ? 'pending' : i < 10 ? 'processing' : 'resolved'
    const triggered = new Date(now - randInt(0, 48) * 3600000)

    const isTemp = type.startsWith('temp')
    const isHum = type.startsWith('humidity')
    const threshold = isTemp
      ? type.endsWith('high')
        ? 35
        : 5
      : isHum
        ? type.endsWith('high')
          ? 80
          : 20
        : 0
    const triggerValue =
      type === 'offline'
        ? 0
        : isTemp
          ? round1(type.endsWith('high') ? 35 + rand() * 8 : 5 - rand() * 3)
          : isHum
            ? round1(type.endsWith('high') ? 80 + rand() * 10 : 20 - rand() * 5)
            : round1(rand() * 100)

    alerts.push({
      id: `alert-${i + 1}`,
      deviceId: d.id,
      deviceName: d.name,
      type,
      level,
      triggerValue,
      threshold,
      triggeredAt: triggered.toISOString(),
      status,
      remark: status === 'resolved' ? '已恢复正常，设备运行平稳' : null,
      resolvedAt:
        status === 'resolved'
          ? new Date(triggered.getTime() + randInt(1, 8) * 3600000).toISOString()
          : null,
    })
  }

  cachedAlerts = alerts
  return alerts
}

// ------------------------- 日历笔记 -------------------------

export function mockCalendarNotes(): CalendarNote[] {
  const now = new Date()
  const day = (offset: number) => {
    const t = new Date(now)
    t.setDate(t.getDate() - offset)
    return toBeijingDateKey(t)
  }
  const iso = (offset: number, h: number) => {
    const t = new Date(now)
    t.setDate(t.getDate() - offset)
    t.setHours(h, 0, 0, 0)
    return t.toISOString()
  }

  return [
    {
      id: 'cn-1',
      date: day(0),
      title: '今日巡检',
      content: '完成浦东机房温湿度传感器巡检，全部正常。',
      createdAt: iso(0, 9),
      updatedAt: iso(0, 9),
    },
    {
      id: 'cn-2',
      date: day(1),
      title: '传感器更换',
      content: '更换北京亦庄园区 03 号传感器电池，信号恢复正常。',
      createdAt: iso(1, 14),
      updatedAt: iso(1, 14),
    },
    {
      id: 'cn-3',
      date: day(3),
      title: '固件盘点',
      content: '统计各设备固件版本，计划下周升级到 v2.4.1。',
      createdAt: iso(3, 16),
      updatedAt: iso(3, 16),
    },
  ]
}

// ------------------------- 记事本 -------------------------

export function mockMemos(): Memo[] {
  const now = Date.now()
  const iso = (h: number) => new Date(now - h * 3600000).toISOString()

  return [
    {
      id: 'memo-1',
      title: '巡检路线优化',
      content: '将 A 区与 B 区巡检合并到同一条路线，减少来回通勤时间。',
      category: '巡检记录',
      createdAt: iso(2),
      updatedAt: iso(2),
    },
    {
      id: 'memo-2',
      title: '更换 NB-IoT 模组',
      content: '部分老型号模组信号不稳定，需联系供应商更换。',
      category: '设备维护',
      createdAt: iso(5),
      updatedAt: iso(5),
    },
    {
      id: 'memo-3',
      title: '待办：核对告警阈值',
      content: '确认湿度阈值是否需要按季节调整，本周内完成。',
      category: '待办事项',
      createdAt: iso(8),
      updatedAt: iso(8),
    },
  ]
}
