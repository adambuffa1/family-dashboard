import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { daysUntil } from '@/lib/fixedCostUtils'

// Called periodically (e.g. from cron or on page load) to create due-date reminders
export async function POST() {
  const costs = await db.fixedCost.findMany({
    where: { isActive: true },
    include: { user: { select: { id: true, username: true } } },
  })

  let created = 0

  for (const cost of costs) {
    const days = daysUntil(cost.nextDueDate)

    if (days <= cost.remindDaysBefore && days >= 0) {
      // Check if we already sent this reminder
      const existing = await db.notification.findFirst({
        where: {
          userId: cost.userId,
          type: 'fixed_cost_due',
          data: { contains: `"fixedCostId":${cost.id}` },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // within last 24h
        },
      })

      if (!existing) {
        await db.notification.create({
          data: {
            userId: cost.userId,
            type: 'fixed_cost_due',
            title: days === 0 ? `Splatnosť dnes: ${cost.name}` : `Blížiaca sa platba: ${cost.name}`,
            message:
              days === 0
                ? `Fixný náklad „${cost.name}" je splatný dnes (${cost.amount.toFixed(2)} €).`
                : `Fixný náklad „${cost.name}" je splatný o ${days} ${days === 1 ? 'deň' : days < 5 ? 'dni' : 'dní'} (${cost.amount.toFixed(2)} €).`,
            data: JSON.stringify({ fixedCostId: cost.id, dueDate: cost.nextDueDate.toISOString() }),
          },
        })
        created++
      }
    }

    // Overdue notification
    if (days < 0) {
      const existing = await db.notification.findFirst({
        where: {
          userId: cost.userId,
          type: 'fixed_cost_overdue',
          data: { contains: `"fixedCostId":${cost.id}` },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      })

      if (!existing) {
        await db.notification.create({
          data: {
            userId: cost.userId,
            type: 'fixed_cost_overdue',
            title: `Po splatnosti: ${cost.name}`,
            message: `Fixný náklad „${cost.name}" je po splatnosti o ${Math.abs(days)} dní (${cost.amount.toFixed(2)} €).`,
            data: JSON.stringify({ fixedCostId: cost.id, dueDate: cost.nextDueDate.toISOString() }),
          },
        })
        created++
      }
    }
  }

  return NextResponse.json({ created })
}
