import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

async function checkBudgetAndNotify(userId: number, category: string, month: number, year: number) {
  const budget = await db.budget.findUnique({ where: { category_month_year: { category, month, year } } })
  if (!budget || budget.amount === 0) return

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const spent = await db.expense.aggregate({
    where: { category, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  })

  const total = spent._sum.amount || 0
  const percent = (total / budget.amount) * 100

  if (percent >= 100) {
    // Check if we already sent this notification this month
    const existing = await db.notification.findFirst({
      where: {
        userId,
        type: 'budget_exceeded',
        data: { contains: category },
        createdAt: { gte: startDate },
      },
    })
    if (!existing) {
      const LABELS: Record<string, string> = { jedlo: 'Jedlo', zabava: 'Zábava', domacnost: 'Domácnosť', pes: 'Pes', ostatne: 'Ostatné' }
      await db.notification.create({
        data: {
          userId,
          type: 'budget_exceeded',
          title: `Prekročený rozpočet: ${LABELS[category] || category}`,
          message: `Výdavky v kategórii ${LABELS[category] || category} dosiahli ${total.toFixed(2)} € (${Math.round(percent)}% z rozpočtu ${budget.amount} €).`,
          data: JSON.stringify({ category, percent: Math.round(percent), spent: total, budget: budget.amount }),
        },
      })
    }
  } else if (percent >= 80) {
    const existing = await db.notification.findFirst({
      where: {
        userId,
        type: 'budget_warning',
        data: { contains: category },
        createdAt: { gte: startDate },
      },
    })
    if (!existing) {
      const LABELS: Record<string, string> = { jedlo: 'Jedlo', zabava: 'Zábava', domacnost: 'Domácnosť', pes: 'Pes', ostatne: 'Ostatné' }
      await db.notification.create({
        data: {
          userId,
          type: 'budget_warning',
          title: `Blíži sa limit: ${LABELS[category] || category}`,
          message: `Výdavky v kategórii ${LABELS[category] || category} dosiahli ${Math.round(percent)}% mesačného rozpočtu (${total.toFixed(2)} € z ${budget.amount} €).`,
          data: JSON.stringify({ category, percent: Math.round(percent), spent: total, budget: budget.amount }),
        },
      })
    }
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : now.getMonth() + 1
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : now.getFullYear()

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const expenses = await db.expense.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: { user: { select: { username: true } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ expenses })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const body = await request.json()
  const { amount, category, description, storeName, date, receiptImage, items } = body

  if (!amount || !category) {
    return NextResponse.json({ error: 'Suma a kategória sú povinné' }, { status: 400 })
  }

  const expenseDate = date ? new Date(date) : new Date()

  const expense = await db.expense.create({
    data: {
      userId: user.userId,
      amount: parseFloat(amount),
      category,
      description: description || null,
      storeName: storeName || null,
      date: expenseDate,
      receiptImage: receiptImage || null,
      items: items || null,
    },
    include: { user: { select: { username: true } } },
  })

  // Check budget and notify (async, don't block response)
  const month = expenseDate.getMonth() + 1
  const year = expenseDate.getFullYear()
  checkBudgetAndNotify(user.userId, category, month, year).catch(console.error)

  return NextResponse.json({ expense }, { status: 201 })
}
