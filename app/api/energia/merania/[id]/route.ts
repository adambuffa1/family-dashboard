import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const reading = await db.energyReading.findUnique({ where: { id: parseInt(params.id) } })
  if (!reading) return NextResponse.json({ error: 'Meranie nenájdené' }, { status: 404 })

  if (reading.userId !== user.userId && user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  await db.energyReading.delete({ where: { id: reading.id } })
  return NextResponse.json({ ok: true })
}
