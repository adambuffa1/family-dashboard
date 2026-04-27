'use client'

import { ChefHat } from 'lucide-react'
import type { Recipe } from '@/types'
import { KATEGORIE_RECEPTOV } from '@/types'

interface ReceptDetailProps {
  recipe: Recipe
}

function parseSteps(steps: string[] | string | unknown): string[] {
  if (Array.isArray(steps)) return steps.filter(Boolean)
  if (typeof steps === 'string') {
    try {
      const parsed = JSON.parse(steps)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {}
    return steps.split('\n').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

export default function ReceptDetail({ recipe }: ReceptDetailProps) {
  const categoryLabel = KATEGORIE_RECEPTOV.find((k) => k.value === recipe.category)?.label || recipe.category
  const ingredientList = recipe.ingredients.split('\n').filter(Boolean)
  const stepList = parseSteps(recipe.steps)

  return (
    <div className="space-y-5">
      {/* Image */}
      {recipe.image ? (
        <div className="rounded-xl overflow-hidden h-52">
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl flex items-center justify-center">
          <ChefHat size={48} className="text-amber-300" />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">
          {categoryLabel}
        </span>
        <span>{ingredientList.length} ingrediencií</span>
        <span>•</span>
        <span>{stepList.length} krokov</span>
        {recipe.user?.username && (
          <>
            <span>•</span>
            <span>od {recipe.user.username}</span>
          </>
        )}
      </div>

      {/* Ingredients */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Ingrediencie</h3>
        <ul className="space-y-1.5">
          {ingredientList.map((ing, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Postup prípravy</h3>
        <ol className="space-y-3">
          {stepList.map((step, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
