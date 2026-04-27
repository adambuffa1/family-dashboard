import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const listInclude = {
  items: { orderBy: [{ checked: 'asc' as const }, { sortOrder: 'asc' as const }, { createdAt: 'asc' as const }] },
  recipes: { include: { recipe: { select: { id: true, name: true } } } },
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const lists = await db.shoppingList.findMany({
    where: { userId: user.userId },
    include: listInclude,
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ lists })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const body = await request.json()
  const { name, recipeIds, items } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Zadajte názov zoznamu' }, { status: 400 })
  }

  const list = await db.shoppingList.create({
    data: {
      userId: user.userId,
      name: name.trim(),
      items: items?.length
        ? {
            create: items.map((item: { name: string; quantity?: string; unit?: string; category?: string }, idx: number) => ({
              name: item.name,
              quantity: item.quantity || null,
              unit: item.unit || null,
              category: item.category || null,
              sortOrder: idx,
            })),
          }
        : undefined,
      recipes: recipeIds?.length
        ? { create: recipeIds.map((id: number) => ({ recipeId: id })) }
        : undefined,
    },
    include: listInclude,
  })

  return NextResponse.json({ list }, { status: 201 })
}
