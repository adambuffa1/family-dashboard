import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { calcNextDueDate } from '@/lib/fixedCostUtils'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const costs = await db.fixedCost.findMany({
    orderBy: { nextDueDate: 'asc' },
    include: {
      user: { select: { username: true } },
      payments: { orderBy: { paidAt: 'desc' }, take: 5 },
    },
  })

  const mapped = costs.map((c) => ({
    ...c,
    nextDueDate: c.nextDueDate.toISOString(),
    createdAt: c.createdAt.toISOString(),
    payments: c.payments.map((p) => ({
      ...p,
      paidAt: p.paidAt.toISOString(),
      dueDate: p.dueDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
    })),
  }))

  return NextResponse.json({ costs: mapped })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const body = await request.json()
  const { name, amount, category, nextDueDate, recurrence, customDays, notes, isActive, remindDaysBefore } = body

  if (!name || !amount || !category || !nextDueDate || !recurrence) {
    return NextResponse.json({ error: 'Vyplňte všetky povinné polia' }, { status: 400 })
  }

  const cost = await db.fixedCost.create({
    data: {
      userId: user.userId,
      name,
      amount: parseFloat(amount),
      category,
      nextDueDate: new Date(nextDueDate),
      recurrence,
      customDays: customDays ? parseInt(customDays) : null,
      notes: notes || null,
      isActive: isActive !== false,
      remindDaysBefore: remindDaysBefore ? parseInt(remindDaysBefore) : 3,
    },
    include: {
      user: { select: { username: true } },
      payments: true,
    },
  })

  return NextResponse.json({
    cost: { ...cost, nextDueDate: cost.nextDueDate.toISOString(), createdAt: cost.createdAt.toISOString(), payments: [] },
  }, { status: 201 })
}
