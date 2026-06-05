'use client'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface ChartComponentProps {
  type: 'bar' | 'line' | 'pie'
  data: {
    title: string
    explanation?: string
    x: (string | number)[]
    y: number[]
    x_label: string
    y_label: string
  }
  height?: number
}

const COLORS = [
  '#f97316',
  '#fb923c',
  '#ea580c',
  '#fdba74',
  '#fed7aa',
  '#c2410c',
  '#9a3412',
  '#7c2d12',
]

const axisTick = { fontSize: 11, fill: '#9ca3af', fontWeight: 700 as const }
const gridStroke = 'rgba(255,255,255,0.06)'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="border border-orange-500/50 bg-black px-4 py-3 shadow-[0_0_24px_-4px_rgba(249,115,22,0.4)]">
        <p className="mb-1 text-[10px] font-black tracking-widest text-orange-500 uppercase">
          {label}
        </p>
        <p className="text-base font-black text-white">
          {typeof payload[0].value === 'number'
            ? payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

const tooltipContentStyle = {
  background: '#000000',
  border: '1px solid rgba(249, 115, 22, 0.5)',
  borderRadius: 0,
  color: '#fff',
  fontWeight: 700,
  fontSize: 12,
}

export function ChartComponent({ type, data, height = 320 }: ChartComponentProps) {
  const transformedData = data.x.map((xVal, i) => ({
    name: String(xVal).length > 15 ? String(xVal).slice(0, 15) + '…' : String(xVal),
    fullName: String(xVal),
    [data.y_label]: data.y[i],
  }))

  const tickInterval = transformedData.length > 20
    ? Math.floor(transformedData.length / 10)
    : transformedData.length > 10
      ? 1
      : 0

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={transformedData} margin={{ top: 16, right: 24, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.15)"
            tick={axisTick}
            interval={tickInterval}
            angle={transformedData.length > 8 ? -35 : 0}
            textAnchor={transformedData.length > 8 ? 'end' : 'middle'}
            height={transformedData.length > 8 ? 60 : 30}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.15)"
            tick={axisTick}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            width={56}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.12)' }} />
          <Bar
            dataKey={data.y_label}
            fill="#f97316"
            radius={[0, 0, 0, 0]}
            animationDuration={800}
            maxBarSize={52}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={transformedData} margin={{ top: 16, right: 24, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.15)"
            tick={axisTick}
            interval={tickInterval}
            angle={transformedData.length > 8 ? -35 : 0}
            textAnchor={transformedData.length > 8 ? 'end' : 'middle'}
            height={transformedData.length > 8 ? 60 : 30}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.15)"
            tick={axisTick}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            width={56}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={data.y_label}
            stroke="#f97316"
            strokeWidth={2.5}
            dot={
              transformedData.length <= 30
                ? { fill: '#f97316', r: 3, strokeWidth: 0 }
                : false
            }
            activeDot={{ r: 5, fill: '#fb923c', stroke: '#000', strokeWidth: 2 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'pie') {
    const pieData = data.y
      .slice(0, 12)
      .map((val, i) => ({
        name: String(data.x[i] ?? `Item ${i + 1}`).slice(0, 20),
        value: Math.abs(val),
      }))
      .filter((d) => d.value > 0)

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="48%"
            outerRadius={height * 0.3}
            dataKey="value"
            animationDuration={800}
            stroke="#000000"
            strokeWidth={2}
            label={({ percent }) => {
              const safePercent = typeof percent === 'number' ? percent : 0
              return safePercent > 0.05 ? `${(safePercent * 100).toFixed(0)}%` : ''
            }}
            labelLine={false}
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              if (typeof value === 'number') {
                return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              }
              return String(value ?? '')
            }}
            contentStyle={tooltipContentStyle}
            labelStyle={{ color: '#f97316', fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return null
}
