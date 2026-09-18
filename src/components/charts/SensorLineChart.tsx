import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export interface ChartLine {
  key: string
  name: string
  color: string
}

/** 通用时间序列折线图（数据需包含 xKey 对应的时间标签列） */
export function SensorLineChart({
  data,
  lines,
  xKey = 'time',
  unit = '',
  height = 280,
}: {
  data: Array<Record<string, number | string>>
  lines: ChartLine[]
  xKey?: string
  unit?: string
  height?: number
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#64748b', fontSize: 11 }}
            stroke="rgba(255,255,255,0.1)"
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            stroke="rgba(255,255,255,0.1)"
            unit={unit}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#0d1424',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#e2e8f0',
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
