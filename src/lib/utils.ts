// ============================================================
// 通用工具函数
// 时区约定：数据库统一存 UTC，展示时统一转换为北京时间（UTC+8）
// ============================================================

const BEIJING_TZ = 'Asia/Shanghai'

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 拼接 className */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function toDate(iso?: string | null): Date | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** 将 UTC 时间按北京时间格式化 */
export function formatBeijingTime(
  iso?: string | Date | null,
  opts?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof iso === 'string' ? toDate(iso) : iso
  if (!d) return '—'
  return new Intl.DateTimeFormat('zh-CN', { timeZone: BEIJING_TZ, ...opts }).format(d)
}

/** 2026/09/18 14:30:05 */
export const fmtDateTime = (iso?: string | null) =>
  formatBeijingTime(iso, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

/** 09/18 14:30 */
export const fmtDateTimeMin = (iso?: string | null) =>
  formatBeijingTime(iso, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

/** 2026/09/18 */
export const fmtDate = (iso?: string | null) =>
  formatBeijingTime(iso, { year: 'numeric', month: '2-digit', day: '2-digit' })

/** 14:30:05 */
export const fmtTime = (iso?: string | null) =>
  formatBeijingTime(iso, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

/** 相对时间：刚刚 / x 分钟前 / x 小时前 / x 天前 */
export function relativeTime(iso?: string | null): string {
  const d = toDate(iso)
  if (!d) return '—'
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return '刚刚'
  if (sec < 3600) return `${Math.floor(sec / 60)} 分钟前`
  if (sec < 86400) return `${Math.floor(sec / 3600)} 小时前`
  return `${Math.floor(sec / 86400)} 天前`
}

/** 获取某个 Date 对应的北京时间日期键（YYYY-MM-DD） */
export function toBeijingDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BEIJING_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** 当前北京时间日期键 */
export function todayBeijingKey(): string {
  return toBeijingDateKey(new Date())
}

/** 格式化百分比 */
export function fmtPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}
