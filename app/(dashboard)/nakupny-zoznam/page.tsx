'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart, Plus, Trash2, Check, X, CheckCheck,
  Loader2, ChevronDown, ChevronUp, Tag,
} from 'lucide-react'

interface ShoppingItem {
  id: number
  name: string
  quantity: string | null
  unit: string | null
  checked: boolean
  category: string | null
  sortOrder: number
}

interface RecipeRef {
  id: number
  recipe: { id: number; name: string }
}

interface ShoppingList {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  items: ShoppingItem[]
  recipes: RecipeRef[]
}

const ITEM_CATEGORIES = [
  { value: 'ovocie-zelenina', label: '🥦 Ovocie & zelenina' },
  { value: 'mliecne', label: '🥛 Mliečne' },
  { value: 'maso-ryby', label: '🥩 Mäso & ryby' },
  { value: 'pecivo', label: '🍞 Pečivo' },
  { value: 'trvanlive', label: '🥫 Trvanlivé' },
  { value: 'napoje', label: '🧃 Nápoje' },
  { value: 'ostatne', label: '🛒 Ostatné' },
]

function groupByCategory(items: ShoppingItem[]) {
  const groups: Record<string, ShoppingItem[]> = {}
  items.forEach((item) => {
    const cat = item.category || 'ostatne'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  })
  return groups
}

export default function NakupnyZoznamPage() {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [activeListId, setActiveListId] = useState<number | null>(null)
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [creatingList, setCreatingList] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newItemQty, setNewItemQty] = useState('')
  const [newItemCat, setNewItemCat] = useState('ostatne')
  const [addingItem, setAddingItem] = useState(false)
  const [groupBycat, setGroupByCat] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/nakupny-zoznam')
    const data = await res.json()
    const fetchedLists: ShoppingList[] = data.lists || []
    setLists(fetchedLists)
    if (fetchedLists.length > 0 && !activeListId) {
      setActiveListId(fetchedLists[0].id)
    }
    setLoading(false)
  }, [activeListId])

  useEffect(() => { load() }, [load])

  const activeList = lists.find((l) => l.id === activeListId) || null

  async function createList() {
    if (!newListName.trim()) return
    setCreatingList(true)
    const res = await fetch('/api/nakupny-zoznam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newListName.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setLists((prev) => [data.list, ...prev])
      setActiveListId(data.list.id)
      setNewListName('')
      setShowNewListForm(false)
    }
    setCreatingList(false)
  }

  async function deleteList(id: number) {
    if (!confirm('Vymazať tento zoznam?')) return
    await fetch(`/api/nakupny-zoznam/${id}`, { method: 'DELETE' })
    setLists((prev) => prev.filter((l) => l.id !== id))
    if (activeListId === id) setActiveListId(lists.find((l) => l.id !== id)?.id || null)
  }

  async function itemAction(listId: number, action: string, extra: Record<string, unknown> = {}) {
    const res = await fetch(`/api/nakupny-zoznam/${listId}/polozky`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    const data = await res.json()

    if (action === 'toggle' && data.item) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, items: l.items.map((i) => (i.id === data.item.id ? { ...i, checked: data.item.checked } : i)) }
            : l
        )
      )
    } else if (action === 'add' && data.item) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, items: [...l.items, data.item] } : l
        )
      )
    } else if (action === 'delete' && data.ok) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== extra.itemId) } : l
        )
      )
    } else if (action === 'clearCompleted') {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, items: l.items.filter((i) => !i.checked) } : l
        )
      )
    }
  }

  async function addItem() {
    if (!newItem.trim() || !activeListId) return
    setAddingItem(true)
    await itemAction(activeListId, 'add', {
      name: newItem.trim(),
      quantity: newItemQty.trim() || null,
      category: newItemCat,
    })
    setNewItem('')
    setNewItemQty('')
    setAddingItem(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  const checkedCount = activeList?.items.filter((i) => i.checked).length || 0
  const totalCount = activeList?.items.length || 0
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nákupný zoznam</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vaše nákupné zoznamy</p>
        </div>
        <button
          onClick={() => setShowNewListForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Nový zoznam
        </button>
      </div>

      {/* New list form */}
      {showNewListForm && (
        <div className="flex gap-2 mb-4">
          <input
            autoFocus
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createList(); if (e.key === 'Escape') setShowNewListForm(false) }}
            placeholder="Názov zoznamu (napr. Týždenný nákup)..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={createList} disabled={creatingList || !newListName.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {creatingList ? <Loader2 size={14} className="animate-spin" /> : 'Vytvoriť'}
          </button>
          <button onClick={() => setShowNewListForm(false)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
            <X size={14} />
          </button>
        </div>
      )}

      {lists.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium text-lg">Žiadne nákupné zoznamy</p>
          <p className="text-sm mt-1">Vytvorte prvý zoznam alebo pridajte recepty z Kuchárky</p>
          <button onClick={() => setShowNewListForm(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Vytvoriť zoznam
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List tabs */}
          <div className="flex gap-2 flex-wrap">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeListId === list.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                <ShoppingCart size={13} />
                {list.name}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeListId === list.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {list.items.filter((i) => !i.checked).length}
                </span>
              </button>
            ))}
          </div>

          {/* Active list */}
          {activeList && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* List header */}
              <div className="px-5 py-4 border-b border-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-gray-900">{activeList.name}</h2>
                    {activeList.recipes.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Recepty: {activeList.recipes.map((r) => r.recipe.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGroupByCat(!groupBycat)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                        groupBycat ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Tag size={11} />
                      Kategórie
                    </button>
                    {checkedCount > 0 && (
                      <button
                        onClick={() => itemAction(activeList.id, 'clearCompleted')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                      >
                        <CheckCheck size={11} />
                        Vymazať zakúpené
                      </button>
                    )}
                    <button
                      onClick={() => deleteList(activeList.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {totalCount > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{checkedCount} / {totalCount} zakúpené</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {activeList.items.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    Zoznam je prázdny. Pridajte položky nižšie.
                  </div>
                ) : groupBycat ? (
                  // Grouped view
                  Object.entries(groupByCategory(activeList.items)).map(([cat, catItems]) => {
                    const catInfo = ITEM_CATEGORIES.find((c) => c.value === cat)
                    return (
                      <div key={cat}>
                        <div className="px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500">
                          {catInfo?.label || '🛒 Ostatné'}
                        </div>
                        {catItems.map((item) => (
                          <ItemRow key={item.id} item={item} listId={activeList.id} onAction={itemAction} />
                        ))}
                      </div>
                    )
                  })
                ) : (
                  activeList.items.map((item) => (
                    <ItemRow key={item.id} item={item} listId={activeList.id} onAction={itemAction} />
                  ))
                )}
              </div>

              {/* Add item form */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Pridať položku</p>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    placeholder="Množstvo"
                    className="w-24 border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Názov položky..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ITEM_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={addItem}
                    disabled={addingItem || !newItem.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addingItem ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Pridať
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Separate item row component for clean code
function ItemRow({
  item, listId, onAction,
}: {
  item: ShoppingItem
  listId: number
  onAction: (listId: number, action: string, extra?: Record<string, unknown>) => Promise<void>
}) {
  const [pending, setPending] = useState(false)

  async function toggle() {
    setPending(true)
    await onAction(listId, 'toggle', { itemId: item.id, checked: !item.checked })
    setPending(false)
  }

  async function remove() {
    await onAction(listId, 'delete', { itemId: item.id })
  }

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 transition-colors group ${
        item.checked ? 'bg-green-50/50' : 'hover:bg-gray-50/80'
      }`}
    >
      {/* Large checkbox for easy mobile tapping */}
      <button
        onClick={toggle}
        disabled={pending}
        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          item.checked
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {pending
          ? <Loader2 size={13} className="animate-spin text-gray-400" />
          : item.checked && <Check size={14} className="text-white" />
        }
      </button>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm transition-all ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {item.quantity && (
            <span className="font-medium text-gray-600 mr-1">{item.quantity}</span>
          )}
          {item.name}
        </span>
      </div>

      {/* Delete */}
      <button
        onClick={remove}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
      >
        <X size={14} />
      </button>
    </div>
  )
}
