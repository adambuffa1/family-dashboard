'use client'

import { useState } from 'react'
import { Link2, Loader2, X, ChefHat, Check, AlertCircle } from 'lucide-react'
import { KATEGORIE_RECEPTOV } from '@/types'

interface ImportedRecipe {
  name: string
  image: string
  ingredients: string[]
  steps: string[]
  sourceUrl: string
  domain: string
  source: string
}

interface Props {
  onImport: (recipe: {
    name: string
    category: string
    ingredients: string
    steps: string
    image: string
    sourceUrl: string
  }) => void
  onClose: () => void
}

export default function ImportUrlModal({ onImport, onClose }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imported, setImported] = useState<ImportedRecipe | null>(null)

  // Editable preview state
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('hlavne')
  const [editIngredients, setEditIngredients] = useState('')
  const [editSteps, setEditSteps] = useState('')

  async function handleFetch() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setImported(null)

    try {
      const res = await fetch('/api/kucharka/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chyba')

      setImported(data)
      setEditName(data.name || '')
      setEditIngredients(data.ingredients?.join('\n') || '')
      setEditSteps(
        data.steps?.length
          ? data.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
          : ''
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Chyba pri načítaní')
    } finally {
      setLoading(false)
    }
  }

  function handleSave() {
    if (!editName.trim() || !editIngredients.trim()) return
    onImport({
      name: editName.trim(),
      category: editCategory,
      ingredients: editIngredients.trim(),
      steps: editSteps.trim(),
      image: imported?.image || '',
      sourceUrl: imported?.sourceUrl || '',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Import receptu z URL</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* URL input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL adresa receptu</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                placeholder="https://www.recepty.sk/recept/..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleFetch}
                disabled={loading || !url.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                {loading ? 'Načítavam...' : 'Načítať'}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </div>

          {/* Editable preview */}
          {imported && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <Check size={13} />
                Recept načítaný z <strong>{imported.domain}</strong> ({imported.source === 'schema.org' ? 'štruktúrované dáta' : 'heuristika'})
              </div>

              {/* Image preview */}
              {imported.image && (
                <div className="h-40 rounded-xl overflow-hidden bg-gray-100">
                  <img src={imported.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Názov receptu *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategória</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {KATEGORIE_RECEPTOV.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingrediencie *
                  <span className="text-gray-400 font-normal ml-1">(každá na novom riadku)</span>
                </label>
                <textarea
                  value={editIngredients}
                  onChange={(e) => setEditIngredients(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                />
              </div>

              {/* Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postup
                  <span className="text-gray-400 font-normal ml-1">(každý krok na novom riadku)</span>
                </label>
                <textarea
                  value={editSteps}
                  onChange={(e) => setEditSteps(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Zrušiť
          </button>
          {imported && (
            <button
              onClick={handleSave}
              disabled={!editName.trim() || !editIngredients.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <ChefHat size={14} />
              Uložiť recept
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
