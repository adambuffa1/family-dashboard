import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const listInclude = {
  items: { orderBy: [{ checked: 'asc' as const }, { sortOrder: 'asc' as const }, { createdAt: 'asc' as const }] },
  recipes: { include: { recipe: { select: { id: true, name: true } } } },
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const id = parseInt(params.id)
  const { name } = await request.json()

  const list = await db.shoppingList.update({
    where: { id },
    data: { name: name?.trim() },
    include: listInclude,
  })

  return NextResponse.json({ list })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  await db.shoppingList.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
