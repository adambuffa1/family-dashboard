import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { amount, date, description } = await request.json()

  const checkDate = date ? new Date(date) : new Date()
  const dayBefore = new Date(checkDate)
  const dayAfter = new Date(checkDate)
  dayBefore.setDate(dayBefore.getDate() - 1)
  dayAfter.setDate(dayAfter.getDate() + 1)

  const candidates = await db.expense.findMany({
    where: {
      date: { gte: dayBefore, lte: dayAfter },
    },
  })

  const duplicates = candidates.filter((e) => {
    const amountMatch = Math.abs(e.amount - parseFloat(amount)) < 0.02
    if (!amountMatch) return false
    if (description && e.description) {
      const a = description.toLowerCase()
      const b = e.description.toLowerCase()
      return a === b || a.includes(b) || b.includes(a)
    }
    return amountMatch
  })

  return NextResponse.json({
    isDuplicate: duplicates.length > 0,
    duplicates: duplicates.map((e) => ({
      id: e.id,
      amount: e.amount,
      description: e.description,
      date: e.date.toISOString(),
      category: e.category,
    })),
  })
}
