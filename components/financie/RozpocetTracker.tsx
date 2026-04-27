'use client'

import { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'
import { KATEGORIE_VYDAVKOV } from '@/types'
import type { Budget, Expense } from '@/types'

interface RozpocetTrackerProps {
  budgets: Budget[]
  expenses: Expense[]
  month: number
  year: number
  onBudgetUpdate: () => void
}

export default function RozpocetTracker({ budgets, expenses, month, year, onBudgetUpdate }: RozpocetTrackerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const getCategorySpent = (category: string) =>
    expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0)

  const getCategoryBudget = (category: string) =>
    budgets.find((b) => b.category === category)?.amount || 0

  async function saveBudget(category: string) {
    setSaving(true)
    try {
      await fetch('/api/financie/rozpocet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount: parseFloat(editValue), month, year }),
      })
      onBudgetUpdate()
      setEditingCategory(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {KATEGORIE_VYDAVKOV.map((kat) => {
        const spent = getCategorySpent(kat.value)
        const budget = getCategoryBudget(kat.value)
        const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
        const overBudget = budget > 0 && spent > budget
        const isEditing = editingCategory === kat.value

        return (
          <div key={kat.value} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: kat.color }} />
                <span className="text-sm font-medium text-gray-700">{kat.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.00"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveBudget(kat.value)
                        if (e.key === 'Escape') setEditingCategory(null)
                      }}
                    />
                    <button
                      onClick={() => saveBudget(kat.value)}
                      disabled={saving}
                      className="text-green-600 hover:text-green-700 p-1"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-500">
                      <span className={`font-medium ${overBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        {spent.toFixed(2)} €
                      </span>
                      {budget > 0 && <span> / {budget.toFixed(2)} €</span>}
                    </span>
                    <button
                      onClick={() => {
                        setEditingCategory(kat.value)
                        setEditValue(budget > 0 ? String(budget) : '')
                      }}
                      className="text-gray-400 hover:text-blue-600 p-1"
                      title="Nastaviť rozpočet"
                    >
                      <Edit2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {budget > 0 && (
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${overBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${percent}%`, backgroundColor: overBudget ? undefined : kat.color }}
                />
              </div>
            )}

            {budget === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Kliknite na ceruzku a nastavte rozpočet pre túto kategóriu
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
