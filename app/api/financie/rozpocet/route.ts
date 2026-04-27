import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1))
  const year = parseInt(searchParams.get('year') || String(now.getFullYear()))

  const budgets = await db.budget.findMany({
    where: { month, year },
  })

  return NextResponse.json({ budgets })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const body = await request.json()
  const { category, amount, month, year } = body

  if (!category || !amount || !month || !year) {
    return NextResponse.json({ error: 'Všetky polia sú povinné' }, { status: 400 })
  }

  const budget = await db.budget.upsert({
    where: { category_month_year: { category, month: parseInt(month), year: parseInt(year) } },
    update: { amount: parseFloat(amount) },
    create: {
      category,
      amount: parseFloat(amount),
      month: parseInt(month),
      year: parseInt(year),
    },
  })

  return NextResponse.json({ budget }, { status: 201 })
}
