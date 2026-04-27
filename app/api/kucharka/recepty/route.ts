import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const recipes = await db.recipe.findMany({
    where: category ? { category } : undefined,
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const mapped = recipes.map((r) => ({
    ...r,
    steps: JSON.parse(r.steps),
    createdAt: r.createdAt.toISOString(),
  }))

  return NextResponse.json({ recipes: mapped })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const body = await request.json()
  const { name, category, ingredients, steps, image } = body

  if (!name || !category || !ingredients || !steps?.length) {
    return NextResponse.json({ error: 'Vyplňte všetky povinné polia' }, { status: 400 })
  }

  const recipe = await db.recipe.create({
    data: {
      name,
      category,
      ingredients,
      steps: JSON.stringify(steps),
      image: image || null,
      userId: user.userId,
    },
    include: { user: { select: { username: true } } },
  })

  return NextResponse.json({ recipe: { ...recipe, steps: JSON.parse(recipe.steps), createdAt: recipe.createdAt.toISOString() } }, { status: 201 })
}
