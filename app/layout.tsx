import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Niko Nábytok | Nábytok na mieru zo Slovenska',
  description:
    'Výroba nábytku na mieru. Kuchyne, obývacie izby, spálne, kúpeľne a kancelárie priamo od slovenského výrobcu. Osobná konzultácia zdarma.',
  keywords:
    'nábytok na mieru, výroba nábytku, kuchyne na mieru, spálne, obývačky, slovenský výrobca, nábytok Slovensko',
  openGraph: {
    title: 'Niko Nábytok | Nábytok na mieru zo Slovenska',
    description: 'Výroba nábytku na mieru priamo od slovenského výrobcu.',
    url: 'https://www.nikonabytok.sk',
    siteName: 'Niko Nábytok',
    locale: 'sk_SK',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
