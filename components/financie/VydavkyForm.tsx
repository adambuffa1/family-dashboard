'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Wand2, Check } from 'lucide-react'
import { KATEGORIE_VYDAVKOV } from '@/types'

interface VydavkyFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: {
    amount: string
    category: string
    description: string
    date: string
    items: string
    receiptImage: string
    storeName?: string
  }
}

interface DuplicateWarning {
  isDuplicate: boolean
  duplicates: { id: number; amount: number; description: string | null; date: string; category: string }[]
}

export default function VydavkyForm({ onSuccess, onCancel, initialData }: VydavkyFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    amount: initialData?.amount || '',
    category: initialData?.category || 'jedlo',
    description: initialData?.description || '',
    storeName: initialData?.storeName || '',
    date: initialData?.date || today,
    items: initialData?.items || '',
    receiptImage: initialData?.receiptImage || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [duplicate, setDuplicate] = useState<DuplicateWarning | null>(null)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
  const [categoryConfidence, setCategoryConfidence] = useState(0)
  const [forceSave, setForceSave] = useState(false)
  const categoryHint = initialData?.category ? true : false
  const debounceRef = useRef<NodeJS.Timeout>()

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    // Reset duplicate warning when key fields change
    if (['amount', 'date', 'description'].includes(field)) {
      setDuplicate(null)
      setForceSave(false)
    }
  }

  // Smart categorization: suggest category when description/storeName changes
  useEffect(() => {
    if (categoryHint) return // already pre-filled from OCR
    const text = [form.description, form.storeName].filter(Boolean).join(' ')
    if (!text || text.length < 3) return

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/financie/kategorizacia?text=${encodeURIComponent(text)}`)
        const data = await res.json()
        if (data.category && data.confidence > 0.2) {
          setSuggestedCategory(data.category)
          setCategoryConfidence(data.confidence)
        } else {
          setSuggestedCategory(null)
        }
      } catch {}
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [form.description, form.storeName, categoryHint])

  function applySuggestion() {
    if (suggestedCategory) {
      set('category', suggestedCategory)
      setSuggestedCategory(null)
    }
  }

  async function checkDuplicates(): Promise<boolean> {
    if (!form.amount) return false
    setCheckingDuplicate(true)
    try {
      const res = await fetch('/api/financie/duplikaty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: form.amount, date: form.date, description: form.description }),
      })
      const data: DuplicateWarning = await res.json()
      setCheckingDuplicate(false)
      if (data.isDuplicate) {
        setDuplicate(data)
        return true
      }
    } catch {
      setCheckingDuplicate(false)
    }
    return false
  }

  async function learnCategory() {
    const text = [form.description, form.storeName].filter(Boolean).join(' ')
    if (!text) return
    await fetch('/api/financie/kategorizacia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: text, category: form.category }),
    }).catch(() => {})
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Check duplicates first (unless user already confirmed)
    if (!forceSave) {
      const hasDuplicate = await checkDuplicates()
      if (hasDuplicate) return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/financie/vydavky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Chyba pri ukladaní')
        return
      }

      // Learn category mapping
      learnCategory()
      onSuccess()
    } catch {
      setError('Chyba pripojenia')
    } finally {
      setLoading(false)
    }
  }

  const CATEGORY_LABELS: Record<string, string> = {
    jedlo: 'Jedlo', zabava: 'Zábava', domacnost: 'Domácnosť', pes: 'Pes', ostatne: 'Ostatné',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Suma (€) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            className="input"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="label">Dátum *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0">Kategória *</label>
          {suggestedCategory && suggestedCategory !== form.category && (
            <button
              type="button"
              onClick={applySuggestion}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg"
            >
              <Wand2 size={11} />
              Navrhujem: {CATEGORY_LABELS[suggestedCategory]}
              {categoryConfidence > 0.7 && <Check size={10} />}
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {KATEGORIE_VYDAVKOV.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => set('category', k.value)}
              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all border-2 ${
                form.category === k.value
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={form.category === k.value ? { backgroundColor: k.color, borderColor: k.color } : {}}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Obchod / Miesto</label>
          <input
            type="text"
            value={form.storeName}
            onChange={(e) => set('storeName', e.target.value)}
            className="input"
            placeholder="Lidl, Tesco..."
          />
        </div>
        <div>
          <label className="label">Popis</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="input"
            placeholder="Napr. Týždenný nákup"
          />
        </div>
      </div>

      <div>
        <label className="label">Položky (voliteľné)</label>
        <textarea
          value={form.items}
          onChange={(e) => set('items', e.target.value)}
          className="input resize-none"
          rows={2}
          placeholder="Mlieko, Chlieb, Maslo..."
        />
      </div>

      {/* Duplicate warning */}
      {duplicate?.isDuplicate && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-800">Možný duplikát</p>
          </div>
          <p className="text-xs text-amber-700 mb-3">
            Našli sme podobné výdavky z rovnakého dňa:
          </p>
          {duplicate.duplicates.map((d) => (
            <div key={d.id} className="bg-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800 mb-2">
              <span className="font-bold">{d.amount.toFixed(2)} €</span>
              {d.description && <span> — {d.description}</span>}
              <span className="text-amber-600 ml-2">{new Date(d.date).toLocaleDateString('sk-SK')}</span>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={onCancel} className="btn-secondary text-xs flex-1 py-1.5">
              Zrušiť
            </button>
            <button
              type="button"
              onClick={() => { setForceSave(true); setDuplicate(null) }}
              className="bg-amber-600 text-white text-xs flex-1 py-1.5 rounded-lg hover:bg-amber-700 font-medium"
            >
              Uložiť aj tak
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!duplicate?.isDuplicate && (
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Zrušiť</button>
          <button type="submit" disabled={loading || checkingDuplicate} className="btn-primary flex-1">
            {checkingDuplicate ? 'Kontrolujem...' : loading ? 'Ukladám...' : 'Uložiť výdavok'}
          </button>
        </div>
      )}
    </form>
  )
}
