import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '100')

  const readings = await db.energyReading.findMany({
    where: type ? { type } : undefined,
    include: { user: { select: { username: true } } },
    orderBy: { date: 'desc' },
    take: limit,
  })

  const mapped = readings.map((r) => ({
    ...r,
    date: r.date.toISOString(),
  }))

  return NextResponse.json({ readings: mapped })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const body = await request.json()
  const { type, value, date, image } = body

  if (!type || value === undefined) {
    return NextResponse.json({ error: 'Typ a hodnota sú povinné' }, { status: 400 })
  }

  const reading = await db.energyReading.create({
    data: {
      userId: user.userId,
      type,
      value: parseFloat(value),
      date: date ? new Date(date) : new Date(),
      image: image || null,
    },
    include: { user: { select: { username: true } } },
  })

  return NextResponse.json({ reading: { ...reading, date: reading.date.toISOString() } }, { status: 201 })
}
