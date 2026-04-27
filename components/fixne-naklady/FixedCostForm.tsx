'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { RECURRENCE_LABELS } from '@/lib/fixedCostUtils'

const CATEGORIES = [
  { value: 'jedlo', label: 'Jedlo' },
  { value: 'zabava', label: 'Zábava' },
  { value: 'domacnost', label: 'Domácnosť' },
  { value: 'pes', label: 'Pes' },
  { value: 'ostatne', label: 'Ostatné' },
]

interface FixedCost {
  id?: number
  name: string
  amount: number | string
  category: string
  nextDueDate: string
  recurrence: string
  customDays?: number | null
  notes?: string | null
  isActive?: boolean
  remindDaysBefore?: number
}

interface Props {
  initial?: FixedCost
  onSave: (cost: FixedCost) => void
  onCancel: () => void
}

export default function FixedCostForm({ initial, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<FixedCost>({
    name: initial?.name || '',
    amount: initial?.amount || '',
    category: initial?.category || 'ostatne',
    nextDueDate: initial?.nextDueDate
      ? new Date(initial.nextDueDate).toISOString().split('T')[0]
      : today,
    recurrence: initial?.recurrence || 'monthly',
    customDays: initial?.customDays || 30,
    notes: initial?.notes || '',
    isActive: initial?.isActive !== false,
    remindDaysBefore: initial?.remindDaysBefore ?? 3,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof FixedCost, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.amount || !form.category || !form.nextDueDate || !form.recurrence) {
      setError('Vyplňte všetky povinné polia.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const method = initial?.id ? 'PATCH' : 'POST'
      const url = initial?.id ? `/api/fixne-naklady/${initial.id}` : '/api/fixne-naklady'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          customDays: form.recurrence === 'custom' ? form.customDays : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chyba')
      onSave(data.cost)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chyba pri ukladaní')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {initial?.id ? 'Upraviť fixný náklad' : 'Nový fixný náklad'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Názov <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="napr. Nájomné, Netflix, Poistenie..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suma (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategória <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opakovanie <span className="text-red-500">*</span>
            </label>
            <select
              value={form.recurrence}
              onChange={(e) => set('recurrence', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(RECURRENCE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Custom days */}
          {form.recurrence === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Počet dní</label>
              <input
                type="number"
                min="1"
                value={form.customDays || 30}
                onChange={(e) => set('customDays', parseInt(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Next due date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Najbližšia splatnosť <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.nextDueDate}
              onChange={(e) => set('nextDueDate', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Remind days before */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pripomenúť (dní pred splatnosťou)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={form.remindDaysBefore}
              onChange={(e) => set('remindDaysBefore', parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka</label>
            <textarea
              value={form.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              placeholder="Voliteľná poznámka..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Aktívny náklad
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {initial?.id ? 'Uložiť zmeny' : 'Pridať'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
