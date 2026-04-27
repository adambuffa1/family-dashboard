import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const recipe = await db.recipe.findUnique({
    where: { id: parseInt(params.id) },
    include: { user: { select: { username: true } } },
  })

  if (!recipe) return NextResponse.json({ error: 'Recept nenájdený' }, { status: 404 })

  return NextResponse.json({
    recipe: { ...recipe, steps: JSON.parse(recipe.steps), createdAt: recipe.createdAt.toISOString() },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const recipe = await db.recipe.findUnique({ where: { id: parseInt(params.id) } })
  if (!recipe) return NextResponse.json({ error: 'Recept nenájdený' }, { status: 404 })

  if (recipe.userId !== user.userId && user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  const body = await request.json()
  const updated = await db.recipe.update({
    where: { id: recipe.id },
    data: {
      name: body.name || undefined,
      category: body.category || undefined,
      ingredients: body.ingredients || undefined,
      steps: body.steps ? JSON.stringify(body.steps) : undefined,
      image: body.image !== undefined ? body.image : undefined,
    },
    include: { user: { select: { username: true } } },
  })

  return NextResponse.json({ recipe: { ...updated, steps: JSON.parse(updated.steps), createdAt: updated.createdAt.toISOString() } })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const recipe = await db.recipe.findUnique({ where: { id: parseInt(params.id) } })
  if (!recipe) return NextResponse.json({ error: 'Recept nenájdený' }, { status: 404 })

  if (recipe.userId !== user.userId && user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  await db.recipe.delete({ where: { id: recipe.id } })
  return NextResponse.json({ ok: true })
}
