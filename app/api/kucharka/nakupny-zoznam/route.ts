import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { recipeIds, servings } = await request.json()

  if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
    return NextResponse.json({ error: 'Vyberte aspoň jeden recept' }, { status: 400 })
  }

  const recipes = await db.recipe.findMany({
    where: { id: { in: recipeIds } },
  })

  // Collect all ingredients across all recipes
  const allIngredients: string[] = []
  recipes.forEach((recipe) => {
    const lines = recipe.ingredients.split('\n').filter((l) => l.trim())
    allIngredients.push(...lines)
  })

  // Parse ingredients: try to extract quantity + item
  const parsed = allIngredients.map((line) => {
    const trimmed = line.trim()
    // Match patterns like "500g mäso", "2 cibule", "200ml smotana"
    const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|dl|ks|lyžica|lyžičky?|šálka?)?\s+(.+)$/i)
    if (match) {
      return {
        quantity: match[1],
        unit: match[2] || '',
        item: match[3].toLowerCase(),
        raw: trimmed,
      }
    }
    return { quantity: '', unit: '', item: trimmed.toLowerCase(), raw: trimmed }
  })

  // Group duplicate items
  const grouped: Record<string, { quantities: string[]; raw: string[] }> = {}
  parsed.forEach((p) => {
    const key = p.item
    if (!grouped[key]) grouped[key] = { quantities: [], raw: [] }
    if (p.quantity) grouped[key].quantities.push(`${p.quantity}${p.unit}`)
    grouped[key].raw.push(p.raw)
  })

  const shoppingList = Object.entries(grouped).map(([item, data]) => ({
    item: item.charAt(0).toUpperCase() + item.slice(1),
    quantities: data.quantities,
    display: data.quantities.length > 0
      ? `${item.charAt(0).toUpperCase() + item.slice(1)} – ${data.quantities.join(' + ')}`
      : item.charAt(0).toUpperCase() + item.slice(1),
    checked: false,
  }))

  return NextResponse.json({
    shoppingList,
    recipes: recipes.map((r) => r.name),
    totalItems: shoppingList.length,
  })
}
