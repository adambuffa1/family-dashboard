'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  History,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import FixedCostForm from '@/components/fixne-naklady/FixedCostForm'
import { daysUntil, RECURRENCE_LABELS } from '@/lib/fixedCostUtils'

interface Payment {
  id: number
  paidAt: string
  amount: number
  dueDate: string
  notes: string | null
}

interface FixedCost {
  id: number
  name: string
  amount: number
  category: string
  nextDueDate: string
  recurrence: string
  customDays: number | null
  notes: string | null
  isActive: boolean
  remindDaysBefore: number
  createdAt: string
  payments: Payment[]
  user: { username: string }
}

const CATEGORY_LABELS: Record<string, string> = {
  jedlo: 'Jedlo',
  zabava: 'Zábava',
  domacnost: 'Domácnosť',
  pes: 'Pes',
  ostatne: 'Ostatné',
}

const CATEGORY_COLORS: Record<string, string> = {
  jedlo: '#f59e0b',
  zabava: '#8b5cf6',
  domacnost: '#3b82f6',
  pes: '#f97316',
  ostatne: '#6b7280',
}

function statusBadge(days: number, isActive: boolean) {
  if (!isActive) return { label: 'Neaktívny', cls: 'bg-gray-100 text-gray-500' }
  if (days < 0) return { label: `Po splatnosti ${Math.abs(days)}d`, cls: 'bg-red-100 text-red-700' }
  if (days === 0) return { label: 'Splatný dnes', cls: 'bg-orange-100 text-orange-700' }
  if (days <= 3) return { label: `Za ${days}d`, cls: 'bg-amber-100 text-amber-700' }
  return { label: `Za ${days}d`, cls: 'bg-green-100 text-green-700' }
}

export default function FixneNakladyPage() {
  const [costs, setCosts] = useState<FixedCost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCost, setEditCost] = useState<FixedCost | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [payNote, setPayNote] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [reminderLoading, setReminderLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/fixne-naklady')
    const data = await res.json()
    setCosts(data.costs || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    // Trigger reminder check on page load
    fetch('/api/fixne-naklady/pripominat', { method: 'POST' }).catch(() => {})
  }, [load])

  async function handleDelete(id: number) {
    if (!confirm('Naozaj vymazať tento fixný náklad?')) return
    setDeletingId(id)
    await fetch(`/api/fixne-naklady/${id}`, { method: 'DELETE' })
    setCosts((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
  }

  async function handlePay(cost: FixedCost) {
    setPayingId(cost.id)
    const res = await fetch(`/api/fixne-naklady/${cost.id}/zaplatit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: payAmount ? parseFloat(payAmount) : cost.amount,
        notes: payNote || null,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setCosts((prev) => prev.map((c) => (c.id === cost.id ? data.cost : c)))
      setExpandedId(null)
    }
    setPayingId(null)
    setPayNote('')
    setPayAmount('')
  }

  async function handleToggleActive(cost: FixedCost) {
    const res = await fetch(`/api/fixne-naklady/${cost.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !cost.isActive }),
    })
    const data = await res.json()
    if (res.ok) setCosts((prev) => prev.map((c) => (c.id === cost.id ? data.cost : c)))
  }

  async function runReminders() {
    setReminderLoading(true)
    const res = await fetch('/api/fixne-naklady/pripominat', { method: 'POST' })
    const data = await res.json()
    setReminderLoading(false)
    alert(`Vytvorených upozornení: ${data.created}`)
  }

  const filtered = costs.filter((c) => showInactive || c.isActive)
  const totalMonthly = costs
    .filter((c) => c.isActive)
    .reduce((sum, c) => {
      if (c.recurrence === 'monthly') return sum + c.amount
      if (c.recurrence === 'quarterly') return sum + c.amount / 3
      if (c.recurrence === 'yearly') return sum + c.amount / 12
      if (c.recurrence === 'custom' && c.customDays) return sum + (c.amount / c.customDays) * 30
      return sum
    }, 0)

  const overdue = costs.filter((c) => c.isActive && daysUntil(c.nextDueDate) < 0).length
  const upcoming = costs.filter((c) => c.isActive && daysUntil(c.nextDueDate) >= 0 && daysUntil(c.nextDueDate) <= 7).length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fixné náklady</h1>
          <p className="text-sm text-gray-500 mt-0.5">Opakujúce sa platby a pripomienky</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runReminders}
            disabled={reminderLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            {reminderLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Skontrolovať
          </button>
          <button
            onClick={() => { setEditCost(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Pridať
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Mesačný odhad</p>
          <p className="text-xl font-bold text-gray-900">{totalMonthly.toFixed(2)} €</p>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 ${overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
          <p className="text-xs text-gray-500 mb-1">Po splatnosti</p>
          <p className={`text-xl font-bold ${overdue > 0 ? 'text-red-600' : 'text-gray-900'}`}>{overdue}</p>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 ${upcoming > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <p className="text-xs text-gray-500 mb-1">Tento týždeň</p>
          <p className={`text-xl font-bold ${upcoming > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{upcoming}</p>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          {showInactive ? <ToggleRight size={18} className="text-blue-600" /> : <ToggleLeft size={18} />}
          {showInactive ? 'Skryť neaktívne' : 'Zobraziť neaktívne'}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Clock size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Žiadne fixné náklady</p>
          <p className="text-sm mt-1">Pridajte prvý opakujúci sa náklad</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cost) => {
            const days = daysUntil(cost.nextDueDate)
            const badge = statusBadge(days, cost.isActive)
            const isExpanded = expandedId === cost.id
            const isPaying = payingId === cost.id
            const isOverdue = cost.isActive && days < 0
            const isDuesSoon = cost.isActive && days >= 0 && days <= 3

            return (
              <div
                key={cost.id}
                className={`bg-white rounded-xl border shadow-sm transition-all ${
                  isOverdue
                    ? 'border-red-200 bg-red-50/30'
                    : isDuesSoon
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-gray-100'
                }`}
              >
                {/* Main row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Color dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[cost.category] || '#6b7280' }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm truncate ${!cost.isActive ? 'text-gray-400' : 'text-gray-900'}`}>
                        {cost.name}
                      </p>
                      {isOverdue && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{CATEGORY_LABELS[cost.category]}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{RECURRENCE_LABELS[cost.recurrence]}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{cost.amount.toFixed(2)} €</p>
                    <p className="text-xs text-gray-400">
                      {new Date(cost.nextDueDate).toLocaleDateString('sk-SK')}
                    </p>
                  </div>

                  {/* Badge */}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : cost.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                    {/* Pay section */}
                    {cost.isActive && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Označiť ako zaplatené</p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder={`Suma (${cost.amount.toFixed(2)} €)`}
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Poznámka (voliteľné)"
                            value={payNote}
                            onChange={(e) => setPayNote(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handlePay(cost)}
                            disabled={isPaying}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60"
                          >
                            {isPaying ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Zaplatiť
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Payment history */}
                    {cost.payments.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                          <History size={14} />
                          História platieb
                        </p>
                        <div className="space-y-1.5">
                          {cost.payments.map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-500">{new Date(p.paidAt).toLocaleDateString('sk-SK')}</span>
                              <span className="font-medium text-gray-900">{p.amount.toFixed(2)} €</span>
                              {p.notes && <span className="text-gray-400 truncate max-w-[150px]">{p.notes}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {cost.notes && (
                      <p className="text-xs text-gray-500 italic">{cost.notes}</p>
                    )}

                    {/* Bottom actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleToggleActive(cost)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        {cost.isActive ? <ToggleRight size={14} className="text-blue-600" /> : <ToggleLeft size={14} />}
                        {cost.isActive ? 'Deaktivovať' : 'Aktivovať'}
                      </button>
                      <button
                        onClick={() => { setEditCost(cost); setShowForm(true) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        <Pencil size={14} />
                        Upraviť
                      </button>
                      <button
                        onClick={() => handleDelete(cost.id)}
                        disabled={deletingId === cost.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-60 ml-auto"
                      >
                        {deletingId === cost.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Vymazať
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <FixedCostForm
          initial={editCost || undefined}
          onSave={(saved) => {
            setCosts((prev) =>
              editCost
                ? prev.map((c) => (c.id === saved.id ? (saved as FixedCost) : c))
                : [saved as FixedCost, ...prev]
            )
            setShowForm(false)
            setEditCost(null)
          }}
          onCancel={() => { setShowForm(false); setEditCost(null) }}
        />
      )}
    </div>
  )
}
