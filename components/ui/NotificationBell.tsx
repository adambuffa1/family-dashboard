'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: string
}

const TYPE_ICONS: Record<string, string> = {
  budget_exceeded: '🔴',
  budget_warning: '🟡',
  monthly_summary: '📊',
  energy_reminder: '⚡',
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifikacie')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // poll every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markAllRead() {
    await fetch('/api/notifikacie', { method: 'PATCH' })
    setNotifications((n) => n.map((item) => ({ ...item, read: true })))
    setUnreadCount(0)
  }

  async function markRead(id: number) {
    await fetch(`/api/notifikacie/${id}`, { method: 'PATCH' })
    setNotifications((n) => n.map((item) => item.id === id ? { ...item, read: true } : item))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  async function deleteNotification(id: number, wasRead: boolean) {
    await fetch(`/api/notifikacie/${id}`, { method: 'DELETE' })
    setNotifications((n) => n.filter((item) => item.id !== id))
    if (!wasRead) setUnreadCount((c) => Math.max(0, c - 1))
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'práve teraz'
    if (mins < 60) return `pred ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `pred ${hours} h`
    return `pred ${Math.floor(hours / 24)} d`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
        aria-label="Notifikácie"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifikácie</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  Označiť všetky
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Žiadne notifikácie</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                    !n.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-tight ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!n.read && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="text-gray-400 hover:text-blue-600 p-0.5"
                              title="Označiť ako prečítané"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id, n.read)}
                            className="text-gray-400 hover:text-red-600 p-0.5"
                            title="Vymazať"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <a href="/notifikacie" className="text-xs text-blue-600 hover:text-blue-700">
                Zobraziť všetky
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
