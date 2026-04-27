import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/prihlasenie')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar username={user.username} role={user.role} />

      {/* Main content */}
      <div className="lg:ml-60">
        {/* Top padding for mobile header */}
        <div className="lg:hidden h-14" />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
