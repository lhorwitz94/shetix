import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from './components/Header'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'wtix — Women\'s Sports Tickets',
  description: 'Find tickets to WNBA, NWSL, tennis, golf, and college women\'s sports events from multiple ticket markets in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[--font-geist,Arial,sans-serif] antialiased">
        <Header />
        {children}
      </body>
    </html>
  )
}
