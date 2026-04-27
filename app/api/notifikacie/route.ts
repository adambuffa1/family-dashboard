import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  // Auto-generate energy reminder if no reading in 25+ days
  const lastReading = await db.energyReading.findFirst({
    where: { userId: user.userId },
    orderBy: { date: 'desc' },
  })
  if (lastReading) {
    const daysSince = Math.floor((Date.now() - lastReading.date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince >= 25) {
      const existing = await db.notification.findFirst({
        where: { userId: user.userId, type: 'energy_reminder', read: false },
      })
      if (!existing) {
        await db.notification.create({
          data: {
            userId: user.userId,
            type: 'energy_reminder',
            title: 'Čas na odčítanie meračov',
            message: `Posledné meranie energie bolo pred ${daysSince} dňami. Zadajte nové stavy meračov.`,
            read: false,
          },
        })
      }
    }
  }

  const notifications = await db.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return NextResponse.json({
    notifications: notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
    unreadCount,
  })
}

export async function PATCH() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  // Mark all as read
  await db.notification.updateMany({
    where: { userId: user.userId, read: false },
    data: { read: true },
  })

  return NextResponse.json({ ok: true })
}
