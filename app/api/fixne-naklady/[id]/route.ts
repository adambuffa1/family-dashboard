import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { calcNextDueDate } from '@/lib/fixedCostUtils'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const id = parseInt(params.id)
  const body = await request.json()
  const { name, amount, category, nextDueDate, recurrence, customDays, notes, isActive, remindDaysBefore } = body

  const cost = await db.fixedCost.update({
    where: { id },
    data: {
      name,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      category,
      nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
      recurrence,
      customDays: customDays !== undefined ? (customDays ? parseInt(customDays) : null) : undefined,
      notes: notes !== undefined ? (notes || null) : undefined,
      isActive,
      remindDaysBefore: remindDaysBefore !== undefined ? parseInt(remindDaysBefore) : undefined,
    },
    include: {
      user: { select: { username: true } },
      payments: { orderBy: { paidAt: 'desc' }, take: 5 },
    },
  })

  return NextResponse.json({
    cost: {
      ...cost,
      nextDueDate: cost.nextDueDate.toISOString(),
      createdAt: cost.createdAt.toISOString(),
      payments: cost.payments.map((p) => ({
        ...p,
        paidAt: p.paidAt.toISOString(),
        dueDate: p.dueDate.toISOString(),
        createdAt: p.createdAt.toISOString(),
      })),
    },
  })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const id = parseInt(params.id)
  await db.fixedCost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
