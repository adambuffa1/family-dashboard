'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TYPY_ENERGIE } from '@/types'
import type { EnergyReading } from '@/types'

interface EnergiaChartProps {
  readings: EnergyReading[]
}

export default function EnergiaChart({ readings }: EnergiaChartProps) {
  // Group by month
  const monthMap: Record<string, Record<string, number>> = {}

  readings.forEach((r) => {
    const d = new Date(r.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthMap[key]) monthMap[key] = {}
    if (!monthMap[key][r.type] || r.value > monthMap[key][r.type]) {
      monthMap[key][r.type] = r.value
    }
  })

  const chartData = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      month: month.replace('-', '/'),
      ...vals,
    }))

  if (chartData.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Pridajte aspoň 2 merania pre zobrazenie grafu
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {TYPY_ENERGIE.map((t) => (
          <Line
            key={t.value}
            type="monotone"
            dataKey={t.value}
            name={`${t.label} (${t.unit})`}
            stroke={t.color}
            strokeWidth={2}
            dot={{ fill: t.color, r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
