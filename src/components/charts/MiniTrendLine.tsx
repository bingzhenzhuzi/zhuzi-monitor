// 迷你趋势线（纯 SVG，轻量）
export function MiniTrendLine({
  values,
  color = '#22d3ee',
  width = 120,
  height = 36,
}: {
  values: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (values.length < 2) return <div style={{ width, height }} />

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 4
  const step = width / (values.length - 1)
  const y = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2)

  const points = values.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const lastX = (values.length - 1) * step
  const lastY = y(values[values.length - 1])

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
    </svg>
  )
}
