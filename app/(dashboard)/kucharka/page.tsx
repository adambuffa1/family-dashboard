'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, ShoppingCart, Link2, CheckSquare, Square, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ReceptForm from '@/components/kucharka/ReceptForm'
import ReceptKarta from '@/components/kucharka/ReceptKarta'
import ReceptDetail from '@/components/kucharka/ReceptDetail'
import ImportUrlModal from '@/components/kucharka/ImportUrlModal'
import type { Recipe } from '@/types'
import { KATEGORIE_RECEPTOV } from '@/types'

export default function KucharkaPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('vsetky')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null)
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ role: string; userId: number } | null>(null)

  // URL import
  const [showImportUrl, setShowImportUrl] = useState(false)
  const [importInitial, setImportInitial] = useState<Partial<Recipe> | null>(null)

  // Multi-select
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [addingToList, setAddingToList] = useState(false)
  const [addedMessage, setAddedMessage] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setCurrentUser({ role: d.user.role, userId: d.user.userId })
    })
  }, [])

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/kucharka/recepty')
    const data = await res.json()
    setRecipes(data.recipes || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/kucharka/recepty/${deleteId}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteId(null)
    fetchRecipes()
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  async function addToShoppingList() {
    if (selectedIds.size === 0) return
    setAddingToList(true)

    // Get selected recipes and merge ingredients
    const selected = recipes.filter((r) => selectedIds.has(r.id))
    const mergedItems = mergeIngredients(selected)

    const listName = `Nákup – ${selected.map((r) => r.name).join(', ')}`.slice(0, 80)

    const res = await fetch('/api/nakupny-zoznam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: listName,
        recipeIds: Array.from(selectedIds),
        items: mergedItems,
      }),
    })

    setAddingToList(false)

    if (res.ok) {
      setAddedMessage(`Zoznam vytvorený s ${mergedItems.length} položkami!`)
      setTimeout(() => setAddedMessage(''), 3000)
      exitSelectMode()
    }
  }

  // Import from URL → pre-fill ReceptForm
  async function handleImport(data: {
    name: string; category: string; ingredients: string; steps: string; image: string; sourceUrl: string
  }) {
    setShowImportUrl(false)
    setImportInitial({ name: data.name, category: data.category, ingredients: data.ingredients, steps: data.steps, image: data.image })
    setShowAddModal(true)
  }

  const canEdit = (recipe: Recipe) =>
    currentUser?.role === 'admin' || currentUser?.userId === recipe.userId

  const filtered = recipes.filter((r) => {
    const matchCat = activeCategory === 'vsetky' || r.category === activeCategory
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.ingredients.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kuchárka</h1>
          <p className="text-sm text-gray-500">Rodinné recepty na každý deň</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {addedMessage && (
            <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
              ✓ {addedMessage}
            </span>
          )}

          {selectMode ? (
            <>
              <button
                onClick={exitSelectMode}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <X size={14} /> Zrušiť
              </button>
              <button
                onClick={addToShoppingList}
                disabled={selectedIds.size === 0 || addingToList}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <ShoppingCart size={15} />
                {addingToList ? 'Pridávam...' : `Pridať do zoznamu (${selectedIds.size})`}
              </button>
            </>
          ) : (
            <>
              {recipes.length > 0 && (
                <button
                  onClick={() => setSelectMode(true)}
                  className="flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium"
                >
                  <CheckSquare size={15} />
                  Vybrať recepty
                </button>
              )}
              <button
                onClick={() => setShowImportUrl(true)}
                className="flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg hover:bg-purple-100 text-sm font-medium"
              >
                <Link2 size={15} />
                Import z URL
              </button>
              <button
                onClick={() => { setImportInitial(null); setShowAddModal(true) }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={15} />
                Pridať recept
              </button>
            </>
          )}
        </div>
      </div>

      {/* Select mode banner */}
      {selectMode && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-center gap-2">
          <CheckSquare size={16} />
          <span>Kliknite na recepty, ktoré chcete pridať do nákupného zoznamu.</span>
          <span className="ml-auto font-medium">{selectedIds.size} vybraných</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Hľadať recept alebo ingredienciu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('vsetky')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
              activeCategory === 'vsetky' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Všetky ({recipes.length})
          </button>
          {KATEGORIE_RECEPTOV.map((k) => (
            <button
              key={k.value}
              onClick={() => setActiveCategory(k.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                activeCategory === k.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {k.label} ({recipes.filter(r => r.category === k.value).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🍳</p>
          <p className="text-gray-500">
            {search ? 'Žiadne recepty nevyhovujú hľadaniu' : 'Žiadne recepty v tejto kategórii'}
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary mt-4 text-sm">
            Pridať prvý recept
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <ReceptKarta
              key={recipe.id}
              recipe={recipe}
              onClick={() => !selectMode && setViewRecipe(recipe)}
              onEdit={() => setEditRecipe(recipe)}
              onDelete={() => setDeleteId(recipe.id)}
              canEdit={canEdit(recipe)}
              selectable={selectMode}
              selected={selectedIds.has(recipe.id)}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {/* Import URL Modal */}
      {showImportUrl && (
        <ImportUrlModal
          onImport={handleImport}
          onClose={() => setShowImportUrl(false)}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setImportInitial(null) }} title="Nový recept" size="xl">
        <ReceptForm
          recipe={importInitial as Recipe | undefined}
          onSuccess={() => { setShowAddModal(false); setImportInitial(null); fetchRecipes() }}
          onCancel={() => { setShowAddModal(false); setImportInitial(null) }}
        />
      </Modal>

      <Modal isOpen={editRecipe !== null} onClose={() => setEditRecipe(null)} title="Upraviť recept" size="xl">
        {editRecipe && (
          <ReceptForm
            recipe={editRecipe}
            onSuccess={() => { setEditRecipe(null); fetchRecipes() }}
            onCancel={() => setEditRecipe(null)}
          />
        )}
      </Modal>

      <Modal isOpen={viewRecipe !== null} onClose={() => setViewRecipe(null)} title={viewRecipe?.name || ''} size="lg">
        {viewRecipe && <ReceptDetail recipe={viewRecipe} />}
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Vymazať recept"
        message="Naozaj chcete vymazať tento recept?"
        confirmLabel="Vymazať"
        loading={deleting}
      />
    </div>
  )
}

// --- Ingredient merging logic ---
function mergeIngredients(recipes: Recipe[]): { name: string; quantity: string; category: string }[] {
  // key = normalized name for dedup, value = { original display name, qty, unit, category }
  const map: Record<string, { displayName: string; qty: number; unit: string; category: string }> = {}

  for (const recipe of recipes) {
    const lines = recipe.ingredients.split('\n').map((l) => l.trim()).filter(Boolean)
    for (const line of lines) {
      const parsed = parseIngredientLine(line)
      const key = normalizeIngredientName(parsed.name)

      if (map[key]) {
        // Sčítaj keď sa zhodujú jednotky (aj obe prázdne) a má zmysluplnú hodnotu
        if (map[key].unit === parsed.unit && parsed.qty > 0) {
          map[key].qty += parsed.qty
        }
      } else {
        map[key] = {
          displayName: parsed.name,  // keep original for display
          qty: parsed.qty,
          unit: parsed.unit,
          category: guessCategory(parsed.name),
        }
      }
    }
  }

  return Object.values(map).map(({ displayName, qty, unit, category }) => ({
    name: displayName,
    quantity: qty > 0 ? `${qty}${unit ? ' ' + unit : ''}` : '',
    category,
  }))
}

function parseIngredientLine(line: string): { qty: number; unit: string; name: string } {
  const UNITS = ['g', 'kg', 'ml', 'dl', 'l', 'cup', 'cups', 'tbsp', 'tsp', 'ks', 'kus', 'oz', 'lb']

  // 1. Compact: "300g cestoviny", "200ml smotana"
  const compact = line.match(/^([\d.,]+)([a-zA-Z]+)\s+(.+)$/)
  if (compact) {
    const qty = parseFloat(compact[1].replace(',', '.')) || 0
    const unit = compact[2].toLowerCase()
    const name = compact[3].trim()
    if (UNITS.some((u) => unit === u || unit.startsWith(u))) {
      return { qty, unit: compact[2], name }
    }
  }

  // 2. Spaced unit: "300 g cestoviny", "2 cups flour"
  const spaced = line.match(/^([\d.,/½¼¾⅓⅔]+)\s+([a-zA-Z]+)\s+(.+)$/)
  if (spaced) {
    const qtyStr = spaced[1].replace(',', '.').replace('½','0.5').replace('¼','0.25').replace('¾','0.75')
    const qty = parseFloat(qtyStr) || 0
    const unit = spaced[2].toLowerCase()
    const name = spaced[3].trim()
    if (UNITS.some((u) => unit === u || unit.startsWith(u))) {
      return { qty, unit: spaced[2], name }
    }
    // Not a unit → extract qty, rest = full second word + remainder (e.g. "2 konzervy tuniaka")
    return { qty, unit: '', name: (spaced[2] + ' ' + name).trim() }
  }

  // 3. Leading number only: "1 cibuľa", "2 vajcia"
  const numOnly = line.match(/^([\d.,½¼¾⅓⅔]+)\s+(.+)$/)
  if (numOnly) {
    const qty = parseFloat(numOnly[1].replace(',', '.')) || 0
    return { qty, unit: '', name: numOnly[2].trim() }
  }

  // 4. No number: "Soľ", "Korenie"
  return { qty: 0, unit: '', name: line.trim() }
}

function normalizeIngredientName(name: string): string {
  // Only used as dedup key — lowercase + collapse whitespace + remove trailing punctuation
  return name.toLowerCase().replace(/\s+/g, ' ').trim().replace(/[.,;:]+$/, '')
}

function guessCategory(name: string): string {
  const n = name.toLowerCase()
  if (/mlieko|smotana|maslo|syr|jogurt|vajc/.test(n)) return 'mliecne'
  if (/kura|mäso|bravčov|hovädzí|ryba|losos|tuniak|šunka/.test(n)) return 'maso-ryby'
  if (/chlieb|rožok|pečivo|tortilla|bageta/.test(n)) return 'pecivo'
  if (/jablk|hruška|pomaranč|citrón|jahod|malín|banán|šalát|rajčin|cibul|cesnak|mrkv|brokolica|špenát|paprik/.test(n)) return 'ovocie-zelenina'
  if (/olej|ocot|cukor|soľ|múka|ryža|cestoviny|konzervova|strukov/.test(n)) return 'trvanlive'
  if (/voda|džús|mlieko|čaj|káva|pivo|víno/.test(n)) return 'napoje'
  return 'ostatne'
}
