import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hashPassword } from '@/lib/auth'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  const targetId = parseInt(params.id)

  if (targetId === user.userId) {
    return NextResponse.json({ error: 'Nemôžete vymazať sami seba' }, { status: 400 })
  }

  const target = await db.user.findUnique({ where: { id: targetId } })
  if (!target) return NextResponse.json({ error: 'Používateľ nenájdený' }, { status: 404 })

  await db.user.delete({ where: { id: targetId } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  const body = await request.json()
  const { password, role } = body
  const updateData: Record<string, string> = {}

  if (password) {
    if (password.length < 4) {
      return NextResponse.json({ error: 'Heslo musí mať aspoň 4 znaky' }, { status: 400 })
    }
    updateData.password = await hashPassword(password)
  }

  if (role) {
    updateData.role = role === 'admin' ? 'admin' : 'user'
  }

  const updated = await db.user.update({
    where: { id: parseInt(params.id) },
    data: updateData,
    select: { id: true, username: true, role: true, createdAt: true },
  })

  return NextResponse.json({ user: { ...updated, createdAt: updated.createdAt.toISOString() } })
}
