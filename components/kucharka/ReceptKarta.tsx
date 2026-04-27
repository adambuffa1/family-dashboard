'use client'

import { ChefHat, Edit2, Trash2, Check } from 'lucide-react'
import type { Recipe } from '@/types'

interface ReceptKartaProps {
  recipe: Recipe
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
  selectable?: boolean
  selected?: boolean
  onSelect?: (id: number) => void
}

export default function ReceptKarta({
  recipe, onClick, onEdit, onDelete, canEdit,
  selectable = false, selected = false, onSelect,
}: ReceptKartaProps) {
  function handleCardClick() {
    if (selectable && onSelect) {
      onSelect(recipe.id)
    } else {
      onClick()
    }
  }

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all group cursor-pointer ${
        selectable
          ? selected
            ? 'border-blue-400 shadow-blue-100 ring-2 ring-blue-300'
            : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
          : 'border-gray-100 hover:shadow-md'
      }`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center overflow-hidden relative">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <ChefHat size={40} className="text-amber-300" />
        )}
        {/* Select checkbox overlay */}
        {selectable && (
          <div className={`absolute top-2 left-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-blue-600 border-blue-600' : 'bg-white/80 border-gray-300'
          }`}>
            {selected && <Check size={14} className="text-white" />}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className={`font-semibold text-gray-900 transition-colors ${!selectable && 'group-hover:text-blue-600'}`}>
            {recipe.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {recipe.ingredients.split('\n').filter(Boolean).length} ingrediencií • {recipe.steps?.length || 0} krokov
          </p>
        </div>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {recipe.ingredients.split('\n').filter(Boolean).slice(0, 3).join(', ')}
          {recipe.ingredients.split('\n').filter(Boolean).length > 3 && '...'}
        </p>

        {!selectable && canEdit && (
          <div className="flex gap-2 pt-3 border-t border-gray-50">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
            >
              <Edit2 size={12} /> Upraviť
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
            >
              <Trash2 size={12} /> Vymazať
            </button>
          </div>
        )}

        {selectable && (
          <div className={`text-xs font-medium text-center py-1 rounded-lg transition-all ${
            selected ? 'text-blue-700 bg-blue-50' : 'text-gray-400'
          }`}>
            {selected ? '✓ Vybraný' : 'Kliknúť pre výber'}
          </div>
        )}
      </div>
    </div>
  )
}
