'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wallet, ChefHat, Zap, TrendingUp, TrendingDown, ArrowRight, Receipt, AlertTriangle, Clock } from 'lucide-react'
import { KATEGORIE_VYDAVKOV, TYPY_ENERGIE } from '@/types'
import { daysUntil } from '@/lib/fixedCostUtils'

interface FinanceStats {
  totalSpent: number
  totalBudget: number
  transactionCount: number
  topCategory: string
}

interface CookbookStats {
  totalRecipes: number
  byCategory: Record<string, number>
}

interface EnergyStats {
  lastReadings: { type: string; value: number; date: string }[]
}

interface UpcomingCost {
  id: number
  name: string
  amount: number
  nextDueDate: string
  category: string
}

const CATEGORY_LABELS: Record<string, string> = {
  jedlo: 'Jedlo', zabava: 'Zábava', domacnost: 'Domácnosť', pes: 'Pes', ostatne: 'Ostatné',
}

export default function DashboardPage() {
  const [finance, setFinance] = useState<FinanceStats | null>(null)
  const [cookbook, setCookbook] = useState<CookbookStats | null>(null)
  const [energy, setEnergy] = useState<EnergyStats | null>(null)
  const [upcoming, setUpcoming] = useState<UpcomingCost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    Promise.all([
      fetch(`/api/financie/vydavky?month=${month}&year=${year}`).then(r => r.json()),
      fetch(`/api/financie/rozpocet?month=${month}&year=${year}`).then(r => r.json()),
      fetch('/api/kucharka/recepty').then(r => r.json()),
      fetch('/api/energia/merania?limit=10').then(r => r.json()),
      fetch('/api/fixne-naklady').then(r => r.json()),
    ]).then(([expData, budData, recData, enData, fixData]) => {
      const expenses = expData.expenses || []
      const budgets = budData.budgets || []
      const recipes = recData.recipes || []
      const readings = enData.readings || []
      const fixedCosts = fixData.costs || []

      // Finance stats
      const totalSpent = expenses.reduce((s: number, e: any) => s + e.amount, 0)
      const totalBudget = budgets.reduce((s: number, b: any) => s + b.amount, 0)
      const catMap: Record<string, number> = {}
      expenses.forEach((e: any) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount })
      const topCat = Object.entries(catMap).sort(([,a],[,b]) => b - a)[0]?.[0] || ''
      setFinance({ totalSpent, totalBudget, transactionCount: expenses.length, topCategory: topCat })

      // Cookbook stats
      const byCat: Record<string, number> = {}
      recipes.forEach((r: any) => { byCat[r.category] = (byCat[r.category] || 0) + 1 })
      setCookbook({ totalRecipes: recipes.length, byCategory: byCat })

      // Energy stats
      const lastByType: Record<string, { value: number; date: string }> = {}
      readings.forEach((r: any) => {
        if (!lastByType[r.type]) lastByType[r.type] = { value: r.value, date: r.date }
      })
      setEnergy({ lastReadings: Object.entries(lastByType).map(([type, data]) => ({ type, ...data })) })

      // Upcoming fixed costs (next 30 days, active only)
      const upcomingCosts = fixedCosts
        .filter((c: any) => c.isActive && daysUntil(c.nextDueDate) <= 30)
        .slice(0, 5)
      setUpcoming(upcomingCosts)

      setLoading(false)
    })
  }, [])

  const budgetPercent = finance && finance.totalBudget > 0
    ? Math.min((finance.totalSpent / finance.totalBudget) * 100, 100)
    : 0

  const MESAC = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  const now = new Date()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{MESAC[now.getMonth()]} {now.getFullYear()} — prehľad rodiny</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">

        {/* FINANCIE */}
        <Link href="/financie" className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wallet size={22} className="text-blue-600" />
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>

          <h2 className="font-bold text-gray-900 text-lg mb-1">Financie</h2>
          <p className="text-xs text-gray-400 mb-4">Mesačný rozpočet a výdavky</p>

          {loading ? (
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-2 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : finance ? (
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{finance.totalSpent.toFixed(2)} €</p>
                  {finance.totalBudget > 0 && (
                    <p className="text-xs text-gray-400">z {finance.totalBudget.toFixed(0)} € rozpočtu</p>
                  )}
                </div>
                {finance.totalBudget > 0 && (
                  <span className={`text-sm font-bold ${budgetPercent >= 100 ? 'text-red-500' : budgetPercent >= 80 ? 'text-amber-500' : 'text-green-600'}`}>
                    {Math.round(budgetPercent)}%
                  </span>
                )}
              </div>

              {finance.totalBudget > 0 && (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${budgetPercent >= 100 ? 'bg-red-500' : budgetPercent >= 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-50">
                <span>{finance.transactionCount} transakcií</span>
                {finance.topCategory && (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: KATEGORIE_VYDAVKOV.find(k => k.value === finance.topCategory)?.color }}
                    />
                    {CATEGORY_LABELS[finance.topCategory]}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </Link>

        {/* KUCHÁRKA */}
        <Link href="/kucharka" className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
              <ChefHat size={22} className="text-amber-600" />
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
          </div>

          <h2 className="font-bold text-gray-900 text-lg mb-1">Kuchárka</h2>
          <p className="text-xs text-gray-400 mb-4">Rodinné recepty</p>

          {loading ? (
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-2 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : cookbook ? (
            <div className="flex-1 space-y-3">
              <p className="text-2xl font-bold text-gray-900">
                {cookbook.totalRecipes}
                <span className="text-sm font-normal text-gray-400 ml-1">receptov</span>
              </p>

              <div className="space-y-1.5">
                {[
                  { value: 'polievky', label: 'Polievky' },
                  { value: 'hlavne', label: 'Hlavné jedlá' },
                  { value: 'rychle', label: 'Rýchle večere' },
                ].map(cat => (
                  <div key={cat.value} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{cat.label}</span>
                    <span className="font-medium text-gray-900">{cookbook.byCategory[cat.value] || 0}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 border-t border-gray-50">
                <p className="text-xs text-amber-600 font-medium">Zobraziť recepty →</p>
              </div>
            </div>
          ) : null}
        </Link>

        {/* ENERGIA */}
        <Link href="/energia" className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Zap size={22} className="text-yellow-600" />
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
          </div>

          <h2 className="font-bold text-gray-900 text-lg mb-1">Energia</h2>
          <p className="text-xs text-gray-400 mb-4">Posledné stavy meračov</p>

          {loading ? (
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-2 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : energy ? (
            <div className="flex-1 space-y-2">
              {TYPY_ENERGIE.map(t => {
                const reading = energy.lastReadings.find(r => r.type === t.value)
                return (
                  <div key={t.value} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="text-gray-600 text-xs">{t.label}</span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs">
                      {reading ? `${reading.value.toLocaleString('sk-SK')} ${t.unit}` : '—'}
                    </span>
                  </div>
                )
              })}

              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400">
                  {energy.lastReadings[0]
                    ? `Aktualizované ${new Date(energy.lastReadings[0].date).toLocaleDateString('sk-SK')}`
                    : 'Žiadne merania'}
                </p>
              </div>
            </div>
          ) : null}
        </Link>

      </div>

      {/* UPCOMING PAYMENTS */}
      <Link href="/fixne-naklady" className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
              <Receipt size={22} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Fixné náklady</h2>
              <p className="text-xs text-gray-400">Najbližšie splatnosti</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Clock size={16} />
            Žiadne platby v najbližších 30 dňoch
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((cost) => {
              const days = daysUntil(cost.nextDueDate)
              const isOverdue = days < 0
              const isSoon = days >= 0 && days <= 3
              return (
                <div key={cost.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    {isOverdue
                      ? <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                      : isSoon
                      ? <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                      : <Clock size={14} className="text-gray-300 flex-shrink-0" />
                    }
                    <span className={`text-sm font-medium ${isOverdue ? 'text-red-700' : 'text-gray-800'}`}>
                      {cost.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{cost.amount.toFixed(2)} €</p>
                    <p className={`text-xs ${isOverdue ? 'text-red-500' : isSoon ? 'text-amber-500' : 'text-gray-400'}`}>
                      {isOverdue
                        ? `Po splatnosti ${Math.abs(days)}d`
                        : days === 0
                        ? 'Dnes'
                        : `Za ${days}d`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Link>
    </div>
  )
}
