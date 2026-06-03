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
    explanation: string
    x: (string | number)[]
    y: number[]
    x_label: string
    y_label: string
  }
  height?: number
}

const COLORS = [
  '#f97316', '#60a5fa', '#34d399', '#fbbf24',
  '#818cf8', '#f472b6', '#06b6d4', '#a78bfa',
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border-2 border-orange-500 px-4 py-3 text-sm shadow-xl">
        <p className="font-black text-orange-400 uppercase tracking-widest text-xs mb-1">
          {label}
        </p>
        <p className="font-black text-white text-base">
          {typeof payload[0].value === 'number'
            ? payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : payload[0].value}
        </p>
      </div>
    )
  }
  return null
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }}
            interval={tickInterval}
            angle={transformedData.length > 8 ? -35 : 0}
            textAnchor={transformedData.length > 8 ? 'end' : 'middle'}
            height={transformedData.length > 8 ? 60 : 30}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.1)' }} />
          <Bar
            dataKey={data.y_label}
            fill="#f97316"
            radius={[6, 6, 0, 0]}
            animationDuration={800}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={transformedData} margin={{ top: 16, right: 24, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }}
            interval={tickInterval}
            angle={transformedData.length > 8 ? -35 : 0}
            textAnchor={transformedData.length > 8 ? 'end' : 'middle'}
            height={transformedData.length > 8 ? 60 : 30}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={data.y_label}
            stroke="#f97316"
            strokeWidth={3}
            dot={transformedData.length <= 30 ? { fill: '#f97316', r: 4, strokeWidth: 0 } : false}
            activeDot={{ r: 6, fill: '#fb923c' }}
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
            contentStyle={{
              background: '#111827',
              border: '2px solid #f97316',
              borderRadius: 0,
              color: '#fff',
              fontWeight: 700,
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 700 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return null
}