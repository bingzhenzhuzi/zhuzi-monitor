import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { fmtTime } from '../../lib/utils'

export function OnlineRateTrendChart({ data }: { data: Array<{ time: string; rate: number }> }) {
  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="time"
            tickFormatter={(v: string) => fmtTime(v)}
            tick={{ fill: '#64748b', fontSize: 11 }}
            stroke="rgba(255,255,255,0.1)"
            minTickGap={28}
          />
          <YAxis
            domain={[90, 100]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            stroke="rgba(255,255,255,0.1)"
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: '#0d1424',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#e2e8f0',
            }}
            labelFormatter={(v: string) => fmtTime(v)}
            formatter={(value: number) => [`${value}%`, '在线率']}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#rateGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
