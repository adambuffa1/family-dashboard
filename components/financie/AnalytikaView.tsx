'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Store, Lightbulb } from 'lucide-react'
import { KATEGORIE_VYDAVKOV } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface AnalyticsData {
  categoryTrends: { category: string; current: number; previous: number; change: number }[]
  topStores: { name: string; total: number; count: number; avg: number }[]
  monthlyData: Record<string, number>[]
  insights: string[]
  summary: { totalCurrent: number; totalPrevious: number; transactionCount: number }
}

interface AnalytikaViewProps {
  month: number
  year: number
}

const CATEGORY_LABELS: Record<string, string> = {
  jedlo: 'Jedlo', zabava: 'Zábava', domacnost: 'Domácnosť', pes: 'Pes', ostatne: 'Ostatné',
}

export default function AnalytikaView({ month, year }: AnalytikaViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/financie/analyzy?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [month, year])

  if (loading) return <LoadingSpinner />
  if (!data) return <p className="text-gray-400 text-sm text-center py-8">Chyba pri načítaní analýz</p>

  const totalChange = data.summary.totalPrevious > 0
    ? ((data.summary.totalCurrent - data.summary.totalPrevious) / data.summary.totalPrevious) * 100
    : 0

  const pieData = data.categoryTrends
    .filter((c) => c.current > 0)
    .map((c) => ({
      name: CATEGORY_LABELS[c.category] || c.category,
      value: c.current,
      color: KATEGORIE_VYDAVKOV.find((k) => k.value === c.category)?.color || '#ccc',
    }))

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card py-4">
          <p className="text-xs text-gray-500 mb-1">Tento mesiac</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.totalCurrent.toFixed(2)} €</p>
          <div className="flex items-center gap-1 mt-1">
            {totalChange > 0 ? (
              <><TrendingUp size={12} className="text-red-500" /><span className="text-xs text-red-500">+{totalChange.toFixed(0)}%</span></>
            ) : totalChange < 0 ? (
              <><TrendingDown size={12} className="text-green-500" /><span className="text-xs text-green-500">{totalChange.toFixed(0)}%</span></>
            ) : (
              <><Minus size={12} className="text-gray-400" /><span className="text-xs text-gray-400">0%</span></>
            )}
            <span className="text-xs text-gray-400">vs minulý mesiac</span>
          </div>
        </div>
        <div className="card py-4">
          <p className="text-xs text-gray-500 mb-1">Minulý mesiac</p>
          <p className="text-2xl font-bold text-gray-700">{data.summary.totalPrevious.toFixed(2)} €</p>
        </div>
        <div className="card py-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Transakcií</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.transactionCount}</p>
        </div>
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Postrehy</h3>
          </div>
          <ul className="space-y-2">
            {data.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-amber-400 mt-0.5">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category trends */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Trendy kategórií (vs minulý mesiac)</h3>
        <div className="space-y-3">
          {data.categoryTrends.map((t) => (
            <div key={t.category} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: KATEGORIE_VYDAVKOV.find((k) => k.value === t.category)?.color || '#ccc' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{CATEGORY_LABELS[t.category] || t.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{t.current.toFixed(2)} €</span>
                    {t.previous > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        t.change > 10 ? 'bg-red-100 text-red-700' :
                        t.change < -10 ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {t.change > 0 ? '+' : ''}{t.change}%
                      </span>
                    )}
                  </div>
                </div>
                {t.previous > 0 && (
                  <div className="flex gap-1">
                    <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden flex-1">
                      <div
                        className="h-full rounded-full bg-gray-400"
                        style={{ width: `${Math.min((t.previous / Math.max(t.current, t.previous)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden flex-1"
                      style={{ backgroundColor: KATEGORIE_VYDAVKOV.find((k) => k.value === t.category)?.color + '30' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((t.current / Math.max(t.current, t.previous)) * 100, 100)}%`,
                          backgroundColor: KATEGORIE_VYDAVKOV.find((k) => k.value === t.category)?.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6-month trend chart */}
      {data.monthlyData.length >= 2 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Mesačný vývoj (6 mesiacov)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(2)} €`]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {KATEGORIE_VYDAVKOV.map((k) => (
                <Bar key={k.value} dataKey={k.value} name={CATEGORY_LABELS[k.value]} fill={k.color} stackId="a" radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Rozloženie výdavkov</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v.toFixed(2)} €`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top stores */}
      {data.topStores.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Store size={16} className="text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Top obchody tento mesiac</h3>
          </div>
          <div className="space-y-2">
            {data.topStores.map((store, i) => {
              const maxTotal = data.topStores[0].total
              return (
                <div key={store.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{store.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{store.total.toFixed(2)} €</span>
                        <span className="text-xs text-gray-400 ml-2">{store.count}×</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${(store.total / maxTotal) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Priemer: {store.avg.toFixed(2)} € / návšteva</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
