import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rodinný Dashboard',
  description: 'Správa rodinných financií, kuchárka a energia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  )
}
