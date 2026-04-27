'use client'

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { KATEGORIE_VYDAVKOV } from '@/types'
import type { Expense, Budget } from '@/types'

interface VydavkyChartProps {
  expenses: Expense[]
  budgets: Budget[]
}

export default function VydavkyChart({ expenses, budgets }: VydavkyChartProps) {
  // Aggregate spending by category
  const categoryTotals = KATEGORIE_VYDAVKOV.map((kat) => {
    const total = expenses
      .filter((e) => e.category === kat.value)
      .reduce((sum, e) => sum + e.amount, 0)
    const budget = budgets.find((b) => b.category === kat.value)
    return {
      name: kat.label,
      value: total,
      color: kat.color,
      budget: budget?.amount || 0,
      actual: total,
    }
  }).filter((c) => c.value > 0 || c.budget > 0)

  const pieData = categoryTotals.filter((c) => c.value > 0)

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Celkový rozpočet</p>
          <p className="text-2xl font-bold text-blue-700">{totalBudget.toFixed(2)} €</p>
        </div>
        <div className={`rounded-xl p-4 ${totalSpent > totalBudget ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className={`text-xs font-medium mb-1 ${totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
            Celkové výdavky
          </p>
          <p className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-700' : 'text-green-700'}`}>
            {totalSpent.toFixed(2)} €
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        {pieData.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Výdavky podľa kategórie</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val.toFixed(2)} €`, 'Suma']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Žiadne výdavky tento mesiac
          </div>
        )}

        {/* Bar Chart - Budget vs Actual */}
        {categoryTotals.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Rozpočet vs Skutočnosť</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryTotals} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => [`${val.toFixed(2)} €`]} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="budget" name="Rozpočet" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                <Bar dataKey="actual" name="Skutočné" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </div>
  )
}
