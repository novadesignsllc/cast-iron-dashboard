import type { Metadata } from 'next'
import { Sidebar } from '@/components/sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cast Iron Nutrition — Analytics',
  description: 'Internal analytics dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex">
        <Sidebar />
        <main className="flex-1 ml-60 overflow-auto bg-[#F9F6F1]">
          {children}
        </main>
      </body>
    </html>
  )
}
