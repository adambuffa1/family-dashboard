'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Printer, X } from 'lucide-react'
import type { Recipe } from '@/types'

interface ShoppingItem {
  item: string
  quantities: string[]
  display: string
  checked: boolean
}

interface NakupnyZoznamProps {
  recipes: Recipe[]
  onClose: () => void
}

export default function NakupnyZoznam({ recipes, onClose }: NakupnyZoznamProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(recipes.map((r) => r.id)))
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [recipeNames, setRecipeNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggleRecipe(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setGenerated(false)
  }

  async function generate() {
    if (selectedIds.size === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/kucharka/nakupny-zoznam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeIds: Array.from(selectedIds) }),
      })
      const data = await res.json()
      setShoppingList(data.shoppingList || [])
      setRecipeNames(data.recipes || [])
      setGenerated(true)
      setChecked(new Set())
    } finally {
      setLoading(false)
    }
  }

  function toggleItem(i: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function handlePrint() {
    const content = `
      <html><head><title>Nákupný zoznam</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        p { color: #666; font-size: 12px; margin-bottom: 16px; }
        ul { list-style: none; padding: 0; }
        li { padding: 6px 0; border-bottom: 1px solid #eee; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .box { width: 12px; height: 12px; border: 1px solid #999; display: inline-block; }
      </style></head>
      <body>
        <h1>🛒 Nákupný zoznam</h1>
        <p>Recepty: ${recipeNames.join(', ')}</p>
        <ul>
          ${shoppingList.map((item) => `<li><span class="box"></span> ${item.display}</li>`).join('')}
        </ul>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(content)
      win.document.close()
      win.print()
    }
  }

  return (
    <div className="space-y-4">
      {/* Recipe selector */}
      <div>
        <p className="text-sm text-gray-600 mb-3">Vyberte recepty pre nákupný zoznam:</p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {recipes.map((recipe) => (
            <label key={recipe.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.has(recipe.id)}
                onChange={() => toggleRecipe(recipe.id)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-sm text-gray-800">{recipe.name}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {recipe.ingredients.split('\n').filter(Boolean).length} ingrediencií
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading || selectedIds.size === 0}
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
      >
        <ShoppingCart size={15} />
        {loading ? 'Generujem...' : 'Generovať zoznam'}
      </button>

      {/* Generated list */}
      {generated && shoppingList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{shoppingList.length} položiek</p>
              <p className="text-xs text-gray-400">{recipeNames.join(', ')}</p>
            </div>
            <button onClick={handlePrint} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg">
              <Printer size={12} />
              Tlačiť
            </button>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{checked.size} / {shoppingList.length} zakúpené</span>
              <span>{Math.round((checked.size / shoppingList.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(checked.size / shoppingList.length) * 100}%` }}
              />
            </div>
          </div>

          <ul className="space-y-1.5 max-h-60 overflow-y-auto">
            {shoppingList.map((item, i) => (
              <li
                key={i}
                onClick={() => toggleItem(i)}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                  checked.has(i) ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  checked.has(i) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {checked.has(i) && <Check size={10} className="text-white" />}
                </div>
                <span className={`text-sm transition-all ${checked.has(i) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {item.display}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
