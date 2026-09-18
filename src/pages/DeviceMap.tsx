import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDevices } from '../hooks/useDevices'
import { Card } from '../components/ui/Card'
import { StatusDot } from '../components/ui/StatusDot'
import { Loading, ErrorState, EmptyState } from '../components/ui/feedback'
import { COMM_TYPE_COLORS, COMM_TYPE_LABELS, STATUS_COLORS } from '../lib/constants'
import { fmtDateTime, relativeTime } from '../lib/utils'
import type { CommType, Device, DeviceStatus } from '../types'

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY

// 中国大致经纬度范围，用于坐标投影
const LAT_MIN = 18
const LAT_MAX = 54
const LNG_MIN = 73
const LNG_MAX = 135

export function DeviceMap() {
  const navigate = useNavigate()
  const devices = useDevices()
  const [commType, setCommType] = useState<CommType | 'all'>('all')
  const [status, setStatus] = useState<DeviceStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      (devices.data ?? []).filter(
        (d) =>
          (commType === 'all' || d.commType === commType) &&
          (status === 'all' || d.status === status),
      ),
    [devices.data, commType, status],
  )

  const selected = filtered.find((d) => d.id === selectedId) ?? null

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <Card title="设备地理分布" bodyClassName="p-0">
        <div className="mb-3 flex flex-wrap gap-3 px-4 pt-4">
          <select className="select" value={commType} onChange={(e) => setCommType(e.target.value as CommType | 'all')}>
            <option value="all">全部通信方式</option>
            {Object.entries(COMM_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as DeviceStatus | 'all')}>
            <option value="all">全部状态</option>
            <option value="online">在线</option>
            <option value="offline">离线</option>
            <option value="alert">告警</option>
          </select>
        </div>

        {devices.isLoading ? (
          <Loading label="加载设备位置…" />
        ) : devices.isError ? (
          <ErrorState message="设备位置加载失败" onRetry={() => devices.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState title="没有符合条件的设备" />
        ) : AMAP_KEY ? (
          <AmapView devices={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        ) : (
          <FallbackMap devices={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        )}
      </Card>

      {/* 侧边摘要 */}
      <Card title="设备摘要">
        {selected ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200">{selected.name}</span>
              <StatusDot status={selected.status} />
            </div>
            <div className="font-mono text-xs text-slate-500">{selected.code}</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded bg-white/5 p-2">
                <div className="text-[10px] text-slate-500">温度</div>
                <div className="font-mono text-lg tabular-nums text-slate-200">{selected.currentTemp != null ? `${selected.currentTemp.toFixed(1)}℃` : '—'}</div>
              </div>
              <div className="rounded bg-white/5 p-2">
                <div className="text-[10px] text-slate-500">湿度</div>
                <div className="font-mono text-lg tabular-nums text-slate-200">{selected.currentHumidity != null ? `${selected.currentHumidity.toFixed(1)}%` : '—'}</div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div>通信方式：<span style={{ color: COMM_TYPE_COLORS[selected.commType] }}>{COMM_TYPE_LABELS[selected.commType]}</span></div>
              <div>位置：{selected.location ?? '—'}</div>
              <div>最后上报：{fmtDateTime(selected.lastReportAt)}</div>
            </div>
            <button className="btn-primary w-full" onClick={() => navigate(`/devices/${selected.id}`)}>
              查看详情
            </button>
          </div>
        ) : (
          <EmptyState title="未选择设备" description="点击地图上的标记查看摘要" />
        )}
      </Card>
    </div>
  )
}

/** 无高德 Key 时的坐标分布示意视图 */
function FallbackMap({
  devices,
  selectedId,
  onSelect,
}: {
  devices: Device[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const W = 800
  const H = 460
  const pad = 30
  const px = (lng: number) => pad + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (W - pad * 2)
  const py = (lat: number) => H - pad - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * (H - pad * 2)

  return (
    <div className="px-4 pb-4">
      <div className="relative overflow-hidden rounded-lg border border-white/5 bg-base-900">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <rect width={W} height={H} fill="url(#mapGrad)" />
          <defs>
            <radialGradient id="mapGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#0d1a2e" />
              <stop offset="100%" stopColor="#070b14" />
            </radialGradient>
          </defs>
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={(W / 8) * i} y1={0} x2={(W / 8) * i} y2={H} stroke="rgba(255,255,255,0.04)" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(H / 5) * i} x2={W} y2={(H / 5) * i} stroke="rgba(255,255,255,0.04)" />
          ))}
          {devices.map((d) => {
            if (d.latitude == null || d.longitude == null) return null
            const x = px(d.longitude)
            const y = py(d.latitude)
            const color = STATUS_COLORS[d.status]
            const isSel = d.id === selectedId
            return (
              <g key={d.id} onClick={() => onSelect(d.id)} className="cursor-pointer">
                {isSel && <circle cx={x} cy={y} r={10} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />}
                <circle cx={x} cy={y} r={5} fill={color} stroke="#05070d" strokeWidth={1.5} />
              </g>
            )
          })}
        </svg>
        <div className="absolute bottom-2 left-3 rounded bg-black/40 px-2 py-1 text-[11px] text-slate-400">
          未配置高德地图 Key（VITE_AMAP_KEY），当前为坐标分布示意视图
        </div>
      </div>
    </div>
  )
}

/** 高德地图视图（配置 VITE_AMAP_KEY 后启用） */
function AmapView({
  devices,
  selectedId,
  onSelect,
}: {
  devices: Device[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || !AMAP_KEY) return

    const win = window as any
    const init = () => {
      if (!containerRef.current || mapRef.current) return
      const center = devices.find((d) => d.latitude != null && d.longitude != null)
      mapRef.current = new win.AMap.Map(containerRef.current, {
        zoom: 5,
        center: center ? [center.longitude, center.latitude] : [105, 35],
      })
      devices.forEach((d) => {
        if (d.latitude == null || d.longitude == null) return
        const color = STATUS_COLORS[d.status]
        const marker = new win.AMap.Marker({
          position: [d.longitude, d.latitude],
          content: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #05070d;box-shadow:0 0 6px ${color};"></div>`,
          offset: new win.AMap.Pixel(-6, -6),
        })
        marker.setExtData({ id: d.id })
        marker.on('click', () => onSelect(d.id))
        mapRef.current.add(marker)
      })
    }

    if (win.AMap) {
      init()
    } else {
      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
      script.async = true
      script.onload = init
      document.head.appendChild(script)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices])

  // 高亮选中设备
  useEffect(() => {
    // 简化处理：选中态由侧边栏体现
    void selectedId
  }, [selectedId])

  return <div ref={containerRef} className="h-[460px] w-full" />
}
