import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hashPassword } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  const users = await db.user.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ users: users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })) })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  }

  const { username, password, role } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Meno a heslo sú povinné' }, { status: 400 })
  }

  if (username.length < 3) {
    return NextResponse.json({ error: 'Meno musí mať aspoň 3 znaky' }, { status: 400 })
  }

  if (password.length < 4) {
    return NextResponse.json({ error: 'Heslo musí mať aspoň 4 znaky' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: 'Používateľ s týmto menom už existuje' }, { status: 409 })
  }

  const hashed = await hashPassword(password)
  const newUser = await db.user.create({
    data: {
      username,
      password: hashed,
      role: role === 'admin' ? 'admin' : 'user',
    },
    select: { id: true, username: true, role: true, createdAt: true },
  })

  return NextResponse.json({ user: { ...newUser, createdAt: newUser.createdAt.toISOString() } }, { status: 201 })
}
