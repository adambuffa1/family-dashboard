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

  // Current month range
  const startCurr = new Date(year, month - 1, 1)
  const endCurr = new Date(year, month, 0, 23, 59, 59)

  // Previous month range
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const startPrev = new Date(prevYear, prevMonth - 1, 1)
  const endPrev = new Date(prevYear, prevMonth, 0, 23, 59, 59)

  // Last 6 months range
  const sixMonthsAgo = new Date(year, month - 7, 1)

  const [currExpenses, prevExpenses, last6Expenses] = await Promise.all([
    db.expense.findMany({ where: { date: { gte: startCurr, lte: endCurr } } }),
    db.expense.findMany({ where: { date: { gte: startPrev, lte: endPrev } } }),
    db.expense.findMany({ where: { date: { gte: sixMonthsAgo, lte: endCurr } }, orderBy: { date: 'asc' } }),
  ])

  // Category totals current vs previous
  const categories = ['jedlo', 'zabava', 'domacnost', 'pes', 'ostatne']
  const categoryTrends = categories.map((cat) => {
    const curr = currExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0)
    const prev = prevExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0)
    const change = prev > 0 ? ((curr - prev) / prev) * 100 : 0
    return { category: cat, current: curr, previous: prev, change: Math.round(change * 10) / 10 }
  })

  // Top stores by amount
  const storeMap: Record<string, { total: number; count: number }> = {}
  currExpenses.forEach((e) => {
    const store = e.storeName || e.description || 'Neznámy'
    if (!storeMap[store]) storeMap[store] = { total: 0, count: 0 }
    storeMap[store].total += e.amount
    storeMap[store].count += 1
  })
  const topStores = Object.entries(storeMap)
    .map(([name, data]) => ({ name, total: Math.round(data.total * 100) / 100, count: data.count, avg: Math.round((data.total / data.count) * 100) / 100 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  // Monthly trend (last 6 months) per category
  const monthlyTrend: Record<string, Record<string, number>> = {}
  last6Expenses.forEach((e) => {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyTrend[key]) monthlyTrend[key] = {}
    monthlyTrend[key][e.category] = (monthlyTrend[key][e.category] || 0) + e.amount
  })

  const monthlyData = Object.entries(monthlyTrend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cats]) => ({
      month,
      ...Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, Math.round(v * 100) / 100])),
      total: Math.round(Object.values(cats).reduce((s, v) => s + v, 0) * 100) / 100,
    }))

  // Insights
  const insights: string[] = []
  const totalCurr = currExpenses.reduce((s, e) => s + e.amount, 0)
  const totalPrev = prevExpenses.reduce((s, e) => s + e.amount, 0)

  if (totalPrev > 0) {
    const totalChange = ((totalCurr - totalPrev) / totalPrev) * 100
    if (totalChange > 15) insights.push(`Celkové výdavky vzrástli o ${totalChange.toFixed(0)}% oproti minulému mesiacu`)
    if (totalChange < -15) insights.push(`Výdavky klesli o ${Math.abs(totalChange).toFixed(0)}% – výborná práca!`)
  }

  categoryTrends.forEach((t) => {
    if (t.change > 30) {
      const labels: Record<string, string> = { jedlo: 'Jedlo', zabava: 'Zábava', domacnost: 'Domácnosť', pes: 'Pes', ostatne: 'Ostatné' }
      insights.push(`${labels[t.category] || t.category}: výdavky vzrástli o ${t.change}% oproti minulému mesiacu`)
    }
  })

  if (topStores.length > 0) {
    insights.push(`Najviac míňate v obchode ${topStores[0].name} (${topStores[0].total.toFixed(2)} € tento mesiac)`)
  }

  const avgDaily = totalCurr / new Date().getDate()
  insights.push(`Priemerná denná útrata: ${avgDaily.toFixed(2)} €`)

  return NextResponse.json({
    categoryTrends,
    topStores,
    monthlyData,
    insights,
    summary: {
      totalCurrent: Math.round(totalCurr * 100) / 100,
      totalPrevious: Math.round(totalPrev * 100) / 100,
      transactionCount: currExpenses.length,
    },
  })
}
