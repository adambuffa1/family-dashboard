import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const notification = await db.notification.findUnique({ where: { id: parseInt(params.id) } })
  if (!notification || notification.userId !== user.userId) {
    return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })
  }

  const updated = await db.notification.update({
    where: { id: notification.id },
    data: { read: true },
  })

  return NextResponse.json({ notification: { ...updated, createdAt: updated.createdAt.toISOString() } })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const notification = await db.notification.findUnique({ where: { id: parseInt(params.id) } })
  if (!notification || notification.userId !== user.userId) {
    return NextResponse.json({ error: 'Nenájdené' }, { status: 404 })
  }

  await db.notification.delete({ where: { id: notification.id } })
  return NextResponse.json({ ok: true })
}
