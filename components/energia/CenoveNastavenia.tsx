'use client'

import { useState, useEffect } from 'react'
import { Save, Edit2, X } from 'lucide-react'
import { TYPY_ENERGIE } from '@/types'

interface Pricing {
  id: number
  type: string
  pricePerUnit: number
  currency: string
}

interface CenoveNastaveniaProps {
  isAdmin: boolean
}

export default function CenoveNastavenia({ isAdmin }: CenoveNastaveniaProps) {
  const [pricings, setPricings] = useState<Pricing[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/energia/ceny')
      .then((r) => r.json())
      .then((d) => setPricings(d.pricings || []))
  }, [])

  function getPrice(type: string) {
    return pricings.find((p) => p.type === type)?.pricePerUnit || 0
  }

  async function savePrice(type: string) {
    if (!editValue) return
    setSaving(true)
    const res = await fetch('/api/energia/ceny', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, pricePerUnit: parseFloat(editValue) }),
    })
    const data = await res.json()
    setPricings((prev) => {
      const existing = prev.find((p) => p.type === type)
      if (existing) return prev.map((p) => p.type === type ? data.pricing : p)
      return [...prev, data.pricing]
    })
    setEditing(null)
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Nastavte cenu za jednotku pre výpočet nákladov na energie.
        {!isAdmin && <span className="text-amber-600"> (Len správca môže meniť ceny)</span>}
      </p>
      {TYPY_ENERGIE.map((t) => {
        const price = getPrice(t.value)
        const isEditing = editing === t.value

        return (
          <div key={t.value} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: t.color + '20', color: t.color }}>
                {t.value === 'elektrina' ? '⚡' : t.value === 'plyn' ? '🔥' : '💧'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400">per {t.unit}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') savePrice(t.value); if (e.key === 'Escape') setEditing(null) }}
                  />
                  <span className="text-xs text-gray-500">€</span>
                  <button onClick={() => savePrice(t.value)} disabled={saving} className="text-green-600 hover:text-green-700 p-1">
                    <Save size={14} />
                  </button>
                  <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-gray-900">{price > 0 ? `${price.toFixed(4)} €` : '—'}</span>
                  {isAdmin && (
                    <button
                      onClick={() => { setEditing(t.value); setEditValue(price > 0 ? String(price) : '') }}
                      className="text-gray-400 hover:text-blue-600 p-1"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
