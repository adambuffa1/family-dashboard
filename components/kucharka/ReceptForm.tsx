'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { KATEGORIE_RECEPTOV } from '@/types'
import type { Recipe } from '@/types'

interface ReceptFormProps {
  recipe?: Recipe
  onSuccess: () => void
  onCancel: () => void
}

export default function ReceptForm({ recipe, onSuccess, onCancel }: ReceptFormProps) {
  const [name, setName] = useState(recipe?.name || '')
  const [category, setCategory] = useState(recipe?.category || 'hlavne')
  const [ingredients, setIngredients] = useState(recipe?.ingredients || '')
  const [steps, setSteps] = useState<string[]>(() => {
    const raw = recipe?.steps
    if (!raw) return ['']
    if (Array.isArray(raw)) return raw.length > 0 ? raw : ['']
    // string → try JSON parse, then newline split
    try {
      const parsed = JSON.parse(raw as unknown as string)
      if (Array.isArray(parsed)) return parsed
    } catch {}
    const lines = (raw as unknown as string).split('\n').map((l: string) => l.trim()).filter(Boolean)
    return lines.length > 0 ? lines : ['']
  })
  const [image, setImage] = useState(recipe?.image || '')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addStep = () => setSteps((s) => [...s, ''])
  const removeStep = (i: number) => setSteps((s) => s.filter((_, idx) => idx !== i))
  const updateStep = (i: number, val: string) => setSteps((s) => s.map((step, idx) => (idx === i ? val : step)))

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'recepty')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      setImage(data.url)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const filteredSteps = steps.filter((s) => s.trim())
    if (!filteredSteps.length) {
      setError('Pridajte aspoň jeden krok')
      setLoading(false)
      return
    }

    try {
      const url = recipe?.id ? `/api/kucharka/recepty/${recipe.id}` : '/api/kucharka/recepty'
      const method = recipe?.id ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, ingredients, steps: filteredSteps, image }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Chyba pri ukladaní')
        return
      }

      onSuccess()
    } catch {
      setError('Chyba pripojenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload */}
      <div className="flex items-start gap-4">
        <div
          className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center"
          onClick={() => fileRef.current?.click()}
        >
          {image ? (
            <img src={image} alt="Foto receptu" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <Upload size={20} className="text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Foto</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
        />
        <div className="flex-1 space-y-3">
          <div>
            <label className="label">Názov receptu *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Napr. Hovädzí guláš"
              required
            />
          </div>
          <div>
            <label className="label">Kategória *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              {KATEGORIE_RECEPTOV.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {uploading && <p className="text-xs text-blue-600">Nahrávam fotku...</p>}

      {/* Ingredients */}
      <div>
        <label className="label">Ingrediencie * (každá na novom riadku)</label>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="input resize-none"
          rows={5}
          placeholder={'500g hovädzie mäso\n2 cibule\n2 papriky\nSoľ, korenie'}
          required
        />
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Postup prípravy *</label>
          <button type="button" onClick={addStep} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Plus size={13} /> Pridať krok
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2">
                {i + 1}
              </div>
              <input
                type="text"
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
                className="input flex-1"
                placeholder={`Krok ${i + 1}...`}
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="mt-2 p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Zrušiť</button>
        <button type="submit" disabled={loading || uploading} className="btn-primary flex-1">
          {loading ? 'Ukladám...' : recipe ? 'Uložiť zmeny' : 'Pridať recept'}
        </button>
      </div>
    </form>
  )
}
