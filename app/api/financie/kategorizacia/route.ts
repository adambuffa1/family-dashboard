import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Suggest category based on description/store keywords
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const text = (searchParams.get('text') || '').toLowerCase().trim()

  if (!text) return NextResponse.json({ category: null, confidence: 0 })

  // Extract keywords from text (words 3+ chars)
  const words = text.split(/\s+/).filter((w) => w.length >= 3)

  // Find all matching mappings, score by count
  const mappings = await db.categoryMapping.findMany()

  let bestMatch: { category: string; score: number } | null = null

  for (const mapping of mappings) {
    if (text.includes(mapping.keyword)) {
      const score = mapping.count
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { category: mapping.category, score }
      }
    }
    // Partial word match
    for (const word of words) {
      if (mapping.keyword.includes(word) || word.includes(mapping.keyword)) {
        const score = mapping.count * 0.5
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { category: mapping.category, score }
        }
      }
    }
  }

  if (bestMatch) {
    return NextResponse.json({
      category: bestMatch.category,
      confidence: Math.min(bestMatch.score / 10, 1),
    })
  }

  return NextResponse.json({ category: null, confidence: 0 })
}

// Learn: update category mapping when user confirms/changes category
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { keywords, category } = await request.json()

  if (!keywords || !category) {
    return NextResponse.json({ error: 'Chýbajú parametre' }, { status: 400 })
  }

  const words: string[] = Array.isArray(keywords)
    ? keywords
    : (keywords as string).toLowerCase().split(/\s+/).filter((w: string) => w.length >= 3)

  for (const keyword of words) {
    await db.categoryMapping.upsert({
      where: { keyword },
      update: { category, count: { increment: 1 } },
      create: { keyword, category, count: 1 },
    })
  }

  return NextResponse.json({ ok: true, learned: words.length })
}
