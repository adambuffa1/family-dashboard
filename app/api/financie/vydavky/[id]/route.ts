import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const expense = await db.expense.findUnique({ where: { id: parseInt(params.id) } })
  if (!expense) return NextResponse.json({ error: 'Výdavok nenájdený' }, { status: 404 })

  // Only owner or admin can delete
  if (expense.userId !== user.userId && user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  await db.expense.delete({ where: { id: expense.id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const expense = await db.expense.findUnique({ where: { id: parseInt(params.id) } })
  if (!expense) return NextResponse.json({ error: 'Výdavok nenájdený' }, { status: 404 })

  if (expense.userId !== user.userId && user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  const body = await request.json()
  const updated = await db.expense.update({
    where: { id: expense.id },
    data: {
      amount: body.amount ? parseFloat(body.amount) : undefined,
      category: body.category || undefined,
      description: body.description !== undefined ? body.description : undefined,
      date: body.date ? new Date(body.date) : undefined,
    },
    include: { user: { select: { username: true } } },
  })

  return NextResponse.json({ expense: updated })
}
