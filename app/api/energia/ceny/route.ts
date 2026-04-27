import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const pricings = await db.energyPricing.findMany()
  return NextResponse.json({ pricings })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })

  const { type, pricePerUnit } = await request.json()

  if (!type || pricePerUnit === undefined) {
    return NextResponse.json({ error: 'Chýbajú parametre' }, { status: 400 })
  }

  const pricing = await db.energyPricing.upsert({
    where: { type },
    update: { pricePerUnit: parseFloat(pricePerUnit) },
    create: { type, pricePerUnit: parseFloat(pricePerUnit) },
  })

  return NextResponse.json({ pricing })
}
