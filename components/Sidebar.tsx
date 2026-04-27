'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Wallet,
  ChefHat,
  Zap,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Bot,
  Bell,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
} from 'lucide-react'
import NotificationBell from '@/components/ui/NotificationBell'

interface SidebarProps {
  username: string
  role: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/financie', label: 'Financie', icon: Wallet },
  { href: '/kucharka', label: 'Kuchárka', icon: ChefHat },
  { href: '/nakupny-zoznam', label: 'Nákupný zoznam', icon: ShoppingCart },
  { href: '/energia', label: 'Energie', icon: Zap },
  { href: '/fixne-naklady', label: 'Fixné náklady', icon: Receipt },
  { href: '/asistent', label: 'Asistent', icon: Bot },
]

export default function Sidebar({ username, role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/odhlasenie', { method: 'POST' })
    router.push('/prihlasenie')
    router.refresh()
  }

  const isActive = (href: string) => pathname.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-lg">
            🏠
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Rodinný</p>
            <p className="font-bold text-gray-900 text-sm leading-tight">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {role === 'admin' && (
          <>
            <div className="pt-2 pb-1 px-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
            </div>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/admin')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ShieldCheck size={18} />
              Správca
            </Link>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 uppercase">
            {username[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
            <p className="text-xs text-gray-500">{role === 'admin' ? 'Správca' : 'Používateľ'}</p>
          </div>
          <NotificationBell />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut size={18} />
          Odhlásiť sa
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 fixed top-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏠</span>
          <span className="font-bold text-gray-900">Rodinný Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar Panel */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-2">
          <SidebarContent />
        </div>
      </aside>
    </>
  )
}
