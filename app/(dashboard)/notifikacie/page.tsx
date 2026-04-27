'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Trash2, CheckCheck, Check } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

const TYPE_ICONS: Record<string, string> = {
  budget_exceeded: '🔴',
  budget_warning: '🟡',
  monthly_summary: '📊',
  energy_reminder: '⚡',
}

const TYPE_LABELS: Record<string, string> = {
  budget_exceeded: 'Prekročený rozpočet',
  budget_warning: 'Varovanie rozpočtu',
  monthly_summary: 'Mesačný prehľad',
  energy_reminder: 'Pripomienka energie',
}

export default function NotifikacePage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/notifikacie')
    const data = await res.json()
    setNotifications(data.notifications || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  async function markAllRead() {
    await fetch('/api/notifikacie', { method: 'PATCH' })
    setNotifications((n) => n.map((item) => ({ ...item, read: true })))
  }

  async function markRead(id: number) {
    await fetch(`/api/notifikacie/${id}`, { method: 'PATCH' })
    setNotifications((n) => n.map((item) => item.id === id ? { ...item, read: true } : item))
  }

  async function deleteNotification(id: number) {
    await fetch(`/api/notifikacie/${id}`, { method: 'DELETE' })
    setNotifications((n) => n.filter((item) => item.id !== id))
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'práve teraz'
    if (mins < 60) return `pred ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `pred ${hours} h`
    const days = Math.floor(hours / 24)
    if (days < 30) return `pred ${days} d`
    return new Date(dateStr).toLocaleDateString('sk-SK')
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikácie</h1>
          <p className="text-sm text-gray-500">
            {unread > 0 ? `${unread} neprečítaných` : 'Všetky prečítané'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <CheckCheck size={15} />
            Označiť všetky ako prečítané
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-400">Žiadne notifikácie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border p-4 transition-all ${
                !n.read ? 'border-blue-200 shadow-sm' : 'border-gray-100'
              }`}
            >
              <div className="flex gap-4">
                <div className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {TYPE_LABELS[n.type] || n.type} · {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Označiť ako prečítané"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Vymazať"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
