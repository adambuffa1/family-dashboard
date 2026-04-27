import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST: add item / batch operations
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const listId = parseInt(params.id)
  const body = await request.json()
  const { action, itemId, name, quantity, unit, checked, clearCompleted } = body

  // Toggle checked
  if (action === 'toggle' && itemId) {
    const item = await db.shoppingListItem.update({
      where: { id: itemId },
      data: { checked: checked !== undefined ? checked : undefined },
    })
    await db.shoppingList.update({ where: { id: listId }, data: { updatedAt: new Date() } })
    return NextResponse.json({ item })
  }

  // Add new item
  if (action === 'add') {
    const count = await db.shoppingListItem.count({ where: { shoppingListId: listId } })
    const item = await db.shoppingListItem.create({
      data: {
        shoppingListId: listId,
        name: name?.trim() || 'Nová položka',
        quantity: quantity?.trim() || null,
        unit: unit?.trim() || null,
        sortOrder: count,
      },
    })
    await db.shoppingList.update({ where: { id: listId }, data: { updatedAt: new Date() } })
    return NextResponse.json({ item }, { status: 201 })
  }

  // Delete item
  if (action === 'delete' && itemId) {
    await db.shoppingListItem.delete({ where: { id: itemId } })
    await db.shoppingList.update({ where: { id: listId }, data: { updatedAt: new Date() } })
    return NextResponse.json({ ok: true })
  }

  // Clear completed
  if (action === 'clearCompleted') {
    const { count } = await db.shoppingListItem.deleteMany({
      where: { shoppingListId: listId, checked: true },
    })
    await db.shoppingList.update({ where: { id: listId }, data: { updatedAt: new Date() } })
    return NextResponse.json({ deleted: count })
  }

  return NextResponse.json({ error: 'Neznáma akcia' }, { status: 400 })
}
