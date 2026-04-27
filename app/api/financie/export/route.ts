import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
  const year = parseInt(searchParams.get('year') || String(now.getFullYear()))

  const whereDate = month
    ? {
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59),
        },
      }
    : { date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } }

  const expenses = await db.expense.findMany({
    where: whereDate,
    include: { user: { select: { username: true } } },
    orderBy: { date: 'desc' },
  })

  const CATEGORY_LABELS: Record<string, string> = {
    jedlo: 'Jedlo',
    zabava: 'Zábava',
    domacnost: 'Domácnosť',
    pes: 'Pes',
    ostatne: 'Ostatné',
  }

  const headers = ['Dátum', 'Suma (EUR)', 'Kategória', 'Popis', 'Obchod', 'Položky', 'Zadal']
  const rows = expenses.map((e) => [
    new Date(e.date).toLocaleDateString('sk-SK'),
    e.amount.toFixed(2),
    CATEGORY_LABELS[e.category] || e.category,
    e.description || '',
    e.storeName || '',
    e.items || '',
    e.user?.username || '',
  ])

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((r) => r.map(escapeCSV).join(',')),
  ].join('\n')

  const filename = month
    ? `vydavky-${year}-${String(month).padStart(2, '0')}.csv`
    : `vydavky-${year}.csv`

  return new NextResponse('\uFEFF' + csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
