'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ShieldCheck, User, Key, Users } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { User as UserType } from '@/types'

interface UserWithStats extends UserType {
  _count?: { expenses: number; recipes: number; energyReadings: number }
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [changePasswordUser, setChangePasswordUser] = useState<UserType | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const [newPass, setNewPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setCurrentUserId(d.user.userId)
    })
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/pouzivatelia')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddLoading(true)

    const res = await fetch('/api/admin/pouzivatelia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    })

    const data = await res.json()
    setAddLoading(false)

    if (!res.ok) {
      setAddError(data.error || 'Chyba pri vytváraní')
      return
    }

    setNewUsername(''); setNewPassword(''); setNewRole('user')
    setShowAddModal(false)
    fetchUsers()
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/admin/pouzivatelia/${deleteId}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteId(null)
    fetchUsers()
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!changePasswordUser) return
    setPassError('')
    setPassLoading(true)

    const res = await fetch(`/api/admin/pouzivatelia/${changePasswordUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPass }),
    })

    const data = await res.json()
    setPassLoading(false)

    if (!res.ok) { setPassError(data.error || 'Chyba'); return }
    setNewPass(''); setChangePasswordUser(null)
  }

  async function toggleRole(user: UserType) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await fetch(`/api/admin/pouzivatelia/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    fetchUsers()
  }

  const adminCount = users.filter(u => u.role === 'admin').length
  const userCount = users.filter(u => u.role === 'user').length

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správca</h1>
          <p className="text-sm text-gray-500">Správa používateľov a rodiny</p>
        </div>
        <button
          onClick={() => { setAddError(''); setShowAddModal(true) }}
          className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          Pridať používateľa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card py-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-gray-400" />
            <p className="text-xs text-gray-500">Celkovo</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="card py-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-purple-400" />
            <p className="text-xs text-gray-500">Správcovia</p>
          </div>
          <p className="text-2xl font-bold text-purple-700">{adminCount}</p>
        </div>
        <div className="card py-4">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-blue-400" />
            <p className="text-xs text-gray-500">Používatelia</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">{userCount}</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Členovia rodiny</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{users.length} členov</span>
          </div>
          <div className="divide-y divide-gray-50">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.username[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{u.username}</p>
                      {u.id === currentUserId && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Vy</span>
                      )}
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role === 'admin' ? <ShieldCheck size={9} /> : <User size={9} />}
                        {u.role === 'admin' ? 'Správca' : 'Používateľ'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Člen od {new Date(u.createdAt).toLocaleDateString('sk-SK')}
                    </p>
                  </div>
                </div>

                {u.id !== currentUserId && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setNewPass(''); setPassError(''); setChangePasswordUser(u) }}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Zmeniť heslo"
                    >
                      <Key size={14} />
                    </button>
                    <button
                      onClick={() => toggleRole(u)}
                      className={`p-2 rounded-lg transition-all ${
                        u.role === 'admin'
                          ? 'text-purple-400 hover:bg-gray-100 hover:text-gray-600'
                          : 'text-gray-400 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                      title={u.role === 'admin' ? 'Odobrať správcu' : 'Povýšiť na správcu'}
                    >
                      <ShieldCheck size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(u.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Vymazať"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nový člen rodiny" size="sm">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="label">Používateľské meno *</label>
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
              className="input" placeholder="min. 3 znaky" required minLength={3} />
          </div>
          <div>
            <label className="label">Heslo *</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="input" placeholder="min. 4 znaky" required minLength={4} />
          </div>
          <div>
            <label className="label">Rola</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')} className="input">
              <option value="user">Používateľ</option>
              <option value="admin">Správca</option>
            </select>
          </div>
          {addError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{addError}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Zrušiť</button>
            <button type="submit" disabled={addLoading} className="btn-primary flex-1">
              {addLoading ? 'Vytváram...' : 'Vytvoriť'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={changePasswordUser !== null} onClose={() => setChangePasswordUser(null)}
        title={`Zmena hesla – ${changePasswordUser?.username}`} size="sm">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Nové heslo *</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
              className="input" placeholder="min. 4 znaky" required minLength={4} />
          </div>
          {passError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{passError}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setChangePasswordUser(null)} className="btn-secondary flex-1">Zrušiť</button>
            <button type="submit" disabled={passLoading} className="btn-primary flex-1">
              {passLoading ? 'Mením...' : 'Zmeniť'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Vymazať člena rodiny"
        message="Naozaj chcete vymazať tohto používateľa? Všetky jeho záznamy (výdavky, recepty, merania) budú tiež vymazané."
        confirmLabel="Vymazať"
        loading={deleting}
      />
    </div>
  )
}
