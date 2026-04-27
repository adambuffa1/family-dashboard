import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { calcNextDueDate } from '@/lib/fixedCostUtils'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const id = parseInt(params.id)
  const body = await request.json()
  const { amount, notes, paidAt } = body

  const fixedCost = await db.fixedCost.findUnique({ where: { id } })
  if (!fixedCost) return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })

  const paidDate = paidAt ? new Date(paidAt) : new Date()
  const dueDate = fixedCost.nextDueDate
  const paidAmount = amount ? parseFloat(amount) : fixedCost.amount

  // Create expense record in Finance module
  const expense = await db.expense.create({
    data: {
      userId: user.userId,
      amount: paidAmount,
      category: fixedCost.category,
      description: fixedCost.name,
      date: paidDate,
    },
  })

  // Record payment
  const payment = await db.fixedCostPayment.create({
    data: {
      fixedCostId: id,
      paidAt: paidDate,
      amount: paidAmount,
      dueDate,
      expenseId: expense.id,
      notes: notes || null,
    },
  })

  // Advance nextDueDate (unless it's a one-time cost)
  let nextDueDate = dueDate
  if (fixedCost.recurrence !== 'once') {
    nextDueDate = calcNextDueDate(dueDate, fixedCost.recurrence, fixedCost.customDays)
  }

  const updated = await db.fixedCost.update({
    where: { id },
    data: { nextDueDate },
    include: {
      user: { select: { username: true } },
      payments: { orderBy: { paidAt: 'desc' }, take: 5 },
    },
  })

  return NextResponse.json({
    cost: {
      ...updated,
      nextDueDate: updated.nextDueDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      payments: updated.payments.map((p) => ({
        ...p,
        paidAt: p.paidAt.toISOString(),
        dueDate: p.dueDate.toISOString(),
        createdAt: p.createdAt.toISOString(),
      })),
    },
    payment: {
      ...payment,
      paidAt: payment.paidAt.toISOString(),
      dueDate: payment.dueDate.toISOString(),
      createdAt: payment.createdAt.toISOString(),
    },
  })
}
