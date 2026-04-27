import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const CATEGORY_LABELS: Record<string, string> = {
  jedlo: 'Jedlo',
  zabava: 'Zábava',
  domacnost: 'Domácnosť',
  pes: 'Pes',
  ostatne: 'Ostatné',
}

async function analyzeQuery(query: string, userId: number): Promise<string> {
  const q = query.toLowerCase()
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const startCurr = new Date(year, month - 1, 1)
  const endCurr = new Date(year, month, 0, 23, 59, 59)

  // "how much did I spend on X this month"
  const categoryMatch = Object.entries(CATEGORY_LABELS).find(([key, label]) =>
    q.includes(key) || q.includes(label.toLowerCase())
  )

  if ((q.includes('koľko') || q.includes('suma') || q.includes('utratil')) && categoryMatch) {
    const [catKey, catLabel] = categoryMatch
    const agg = await db.expense.aggregate({
      where: { category: catKey, date: { gte: startCurr, lte: endCurr } },
      _sum: { amount: true },
      _count: true,
    })
    const total = agg._sum.amount || 0
    return `Tento mesiac ste minuli **${total.toFixed(2)} €** na kategóriu **${catLabel}** (${agg._count} transakcií).`
  }

  // "total spending this month"
  if (q.includes('celkom') || q.includes('spolu') || q.includes('celkovo') || (q.includes('koľko') && q.includes('mesiac'))) {
    const agg = await db.expense.aggregate({
      where: { date: { gte: startCurr, lte: endCurr } },
      _sum: { amount: true },
      _count: true,
    })
    const total = agg._sum.amount || 0
    const byCategory = await db.expense.groupBy({
      by: ['category'],
      where: { date: { gte: startCurr, lte: endCurr } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    })
    const topCat = byCategory[0]
    const topLabel = topCat ? CATEGORY_LABELS[topCat.category] || topCat.category : ''
    return `Tento mesiac ste celkovo minuli **${total.toFixed(2)} €** (${agg._count} transakcií). Najväčšia kategória: **${topLabel}** (${(topCat?._sum.amount || 0).toFixed(2)} €).`
  }

  // "where can I save money"
  if (q.includes('šetriť') || q.includes('ušetriť') || q.includes('save') || q.includes('znížiť')) {
    const budgets = await db.budget.findMany({ where: { month, year } })
    const expenses = await db.expense.findMany({ where: { date: { gte: startCurr, lte: endCurr } } })

    const suggestions: string[] = []
    for (const budget of budgets) {
      const spent = expenses.filter((e) => e.category === budget.category).reduce((s, e) => s + e.amount, 0)
      const percent = (spent / budget.amount) * 100
      if (percent > 85) {
        suggestions.push(`**${CATEGORY_LABELS[budget.category] || budget.category}**: ${spent.toFixed(2)} € z ${budget.amount} € (${Math.round(percent)}%)`)
      }
    }

    if (suggestions.length === 0) return 'Výborné! Všetky kategórie sú v rámci rozpočtu. Pokračujte v dobrom hospodárení!'

    return `Kategórie kde môžete šetriť:\n${suggestions.map((s) => `• ${s}`).join('\n')}\n\nSkúste obmedziť výdavky v týchto oblastiach.`
  }

  // "top stores"
  if (q.includes('obchod') || q.includes('store') || q.includes('kde') || q.includes('nakupuj')) {
    const expenses = await db.expense.findMany({ where: { date: { gte: startCurr, lte: endCurr } }, select: { storeName: true, amount: true } })
    const storeMap: Record<string, number> = {}
    expenses.forEach((e) => {
      const store = e.storeName || 'Neznámy'
      storeMap[store] = (storeMap[store] || 0) + e.amount
    })
    const sorted = Object.entries(storeMap).sort(([, a], [, b]) => b - a).slice(0, 5)
    if (sorted.length === 0) return 'Zatiaľ nemám dostatok dát o obchodoch.'
    return `Top obchody tento mesiac:\n${sorted.map(([name, total], i) => `${i + 1}. **${name}** – ${total.toFixed(2)} €`).join('\n')}`
  }

  // "budget status"
  if (q.includes('rozpočet') || q.includes('budget') || q.includes('limit')) {
    const budgets = await db.budget.findMany({ where: { month, year } })
    if (budgets.length === 0) return 'Nemáte nastavený žiadny mesačný rozpočet. Nastavte ho v module Financie.'
    const expenses = await db.expense.findMany({ where: { date: { gte: startCurr, lte: endCurr } } })

    const lines = budgets.map((b) => {
      const spent = expenses.filter((e) => e.category === b.category).reduce((s, e) => s + e.amount, 0)
      const pct = Math.round((spent / b.amount) * 100)
      const icon = pct >= 100 ? '🔴' : pct >= 80 ? '🟡' : '🟢'
      return `${icon} **${CATEGORY_LABELS[b.category] || b.category}**: ${spent.toFixed(2)} € / ${b.amount} € (${pct}%)`
    })
    return `Stav mesačného rozpočtu:\n${lines.join('\n')}`
  }

  // "energy consumption"
  if (q.includes('elektrina') || q.includes('plyn') || q.includes('voda') || q.includes('energia')) {
    const readings = await db.energyReading.findMany({
      orderBy: { date: 'desc' },
      take: 6,
    })
    if (readings.length < 2) return 'Nemám dostatok meraní na analýzu spotreby energie.'

    const types = ['elektrina', 'plyn', 'voda']
    const lines = types.map((type) => {
      const typeReadings = readings.filter((r) => r.type === type).slice(0, 2)
      if (typeReadings.length < 2) return null
      const diff = typeReadings[0].value - typeReadings[1].value
      const labels: Record<string, string> = { elektrina: 'Elektrina', plyn: 'Plyn', voda: 'Voda' }
      const units: Record<string, string> = { elektrina: 'kWh', plyn: 'm³', voda: 'm³' }
      return `**${labels[type]}**: spotreba ${diff.toFixed(1)} ${units[type]} od posledného merania`
    }).filter(Boolean)

    if (lines.length === 0) return 'Nemám dostatok meraní na analýzu.'
    return `Spotreba energie:\n${lines.join('\n')}`
  }

  // Default: general financial summary
  const agg = await db.expense.aggregate({
    where: { date: { gte: startCurr, lte: endCurr } },
    _sum: { amount: true },
    _count: true,
  })
  const total = agg._sum.amount || 0

  return `Tento mesiac ste minuli **${total.toFixed(2)} €** v ${agg._count} transakciách.\n\nMôžete sa ma pýtať napríklad:\n• "Koľko som minul na jedlo?"\n• "Kde môžem šetriť?"\n• "Aký je stav môjho rozpočtu?"\n• "Kde najčastejšie nakupujem?"\n• "Aká je moja spotreba energie?"`
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { query } = await request.json()

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return NextResponse.json({ error: 'Zadajte otázku' }, { status: 400 })
  }

  try {
    const answer = await analyzeQuery(query.trim(), user.userId)
    return NextResponse.json({ answer, query })
  } catch (error) {
    console.error('AI assistant error:', error)
    return NextResponse.json({ error: 'Chyba pri spracovaní otázky' }, { status: 500 })
  }
}
