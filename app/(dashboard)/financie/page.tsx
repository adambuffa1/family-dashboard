'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, Receipt, Download, BarChart3, List, PiggyBank } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import VydavkyForm from '@/components/financie/VydavkyForm'
import VydavkyChart from '@/components/financie/VydavkyChart'
import AnalytikaView from '@/components/financie/AnalytikaView'
import RozpocetTracker from '@/components/financie/RozpocetTracker'
import DokladUpload from '@/components/financie/DokladUpload'
import type { Expense, Budget } from '@/types'
import { KATEGORIE_VYDAVKOV } from '@/types'

const MESACE = [
  'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
  'Júl', 'August', 'September', 'Október', 'November', 'December',
]

type Tab = 'prehled' | 'zoznam' | 'rozpocet' | 'analyzy'

export default function FinanciePage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('prehled')
  const [exporting, setExporting] = useState(false)
  const [scanResult, setScanResult] = useState<{
    amount: string; date: string; items: string; receiptImage: string; storeName?: string
  } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [expRes, budRes] = await Promise.all([
      fetch(`/api/financie/vydavky?month=${month}&year=${year}`),
      fetch(`/api/financie/rozpocet?month=${month}&year=${year}`),
    ])
    const expData = await expRes.json()
    const budData = await budRes.json()
    setExpenses(expData.expenses || [])
    setBudgets(budData.budgets || [])
    setLoading(false)
  }, [month, year])

  useEffect(() => { fetchData() }, [fetchData])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/financie/vydavky/${deleteId}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteId(null)
    fetchData()
  }

  async function handleExport() {
    setExporting(true)
    const url = `/api/financie/export?month=${month}&year=${year}`
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `vydavky-${year}-${String(month).padStart(2, '0')}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    setExporting(false)
  }

  function getCategoryLabel(value: string) {
    return KATEGORIE_VYDAVKOV.find((k) => k.value === value)?.label || value
  }
  function getCategoryColor(value: string) {
    return KATEGORIE_VYDAVKOV.find((k) => k.value === value)?.color || '#ccc'
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const budgetPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'prehled', label: 'Prehľad', icon: <BarChart3 size={14} /> },
    { id: 'zoznam', label: `Výdavky (${expenses.length})`, icon: <List size={14} /> },
    { id: 'rozpocet', label: 'Rozpočet', icon: <PiggyBank size={14} /> },
    { id: 'analyzy', label: 'Analýzy', icon: <BarChart3 size={14} /> },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financie</h1>
          <p className="text-sm text-gray-500">Správa rodinného rozpočtu</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Download size={15} />
            {exporting ? 'Exportujem...' : 'CSV Export'}
          </button>
          <button
            onClick={() => { setScanResult(null); setShowScanModal(true) }}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Receipt size={15} />
            Skenovať doklad
          </button>
          <button
            onClick={() => { setScanResult(null); setShowAddModal(true) }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} />
            Pridať výdavok
          </button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{MESACE[month - 1]} {year}</p>
            <p className="text-sm text-gray-500">
              <span className={`font-semibold ${totalSpent > totalBudget && totalBudget > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {totalSpent.toFixed(2)} €
              </span>
              {totalBudget > 0 && <span className="text-gray-400"> / {totalBudget.toFixed(2)} €</span>}
            </p>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ChevronRight size={18} />
          </button>
        </div>
        {totalBudget > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Čerpanie rozpočtu</span>
              <span>{Math.round(budgetPercent)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercent >= 100 ? 'bg-red-500' : budgetPercent >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 flex-shrink-0 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {activeTab === 'prehled' && (
            <div className="card">
              <VydavkyChart expenses={expenses} budgets={budgets} />
            </div>
          )}

          {activeTab === 'zoznam' && (
            <div className="card">
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">Žiadne výdavky v tomto mesiaci</p>
                  <button onClick={() => setShowAddModal(true)} className="btn-primary mt-4 text-sm">
                    Pridať prvý výdavok
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getCategoryColor(expense.category) }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {(expense as any).storeName || expense.description || getCategoryLabel(expense.category)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ backgroundColor: getCategoryColor(expense.category) + '20', color: getCategoryColor(expense.category) }}
                            >
                              {getCategoryLabel(expense.category)}
                            </span>
                            <span>{new Date(expense.date).toLocaleDateString('sk-SK')}</span>
                            {expense.description && (expense as any).storeName && <span>• {expense.description}</span>}
                            {expense.user?.username && <span>• {expense.user.username}</span>}
                          </div>
                          {expense.items && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{expense.items}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900 text-sm">{expense.amount.toFixed(2)} €</span>
                        <button
                          onClick={() => setDeleteId(expense.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rozpocet' && (
            <div className="card">
              <div className="mb-4">
                <h2 className="font-semibold text-gray-900">Mesačný rozpočet</h2>
                <p className="text-sm text-gray-500 mt-0.5">Kliknite na ceruzku a nastavte limit pre kategóriu</p>
              </div>
              <RozpocetTracker
                budgets={budgets}
                expenses={expenses}
                month={month}
                year={year}
                onBudgetUpdate={fetchData}
              />
            </div>
          )}

          {activeTab === 'analyzy' && (
            <AnalytikaView month={month} year={year} />
          )}
        </>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nový výdavok" size="md">
        <VydavkyForm
          onSuccess={() => { setShowAddModal(false); fetchData() }}
          onCancel={() => setShowAddModal(false)}
          initialData={scanResult ? {
            amount: scanResult.amount,
            category: 'jedlo',
            description: '',
            date: scanResult.date,
            items: scanResult.items,
            receiptImage: scanResult.receiptImage,
            storeName: scanResult.storeName || '',
          } : undefined}
        />
      </Modal>

      {/* OCR Scan Modal */}
      <Modal isOpen={showScanModal} onClose={() => setShowScanModal(false)} title="Skenovanie dokladu" size="md">
        <div className="space-y-4">
          <DokladUpload
            onResult={(result) => {
              setScanResult({
                amount: result.amount,
                date: result.date,
                items: result.items,
                receiptImage: result.imageUrl,
              })
              setShowScanModal(false)
              setShowAddModal(true)
            }}
          />
          <p className="text-xs text-gray-400 text-center">
            Môžete použiť foto z galérie alebo priamo z kamery
          </p>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Vymazať výdavok"
        message="Naozaj chcete vymazať tento výdavok?"
        confirmLabel="Vymazať"
        loading={deleting}
      />
    </div>
  )
}
