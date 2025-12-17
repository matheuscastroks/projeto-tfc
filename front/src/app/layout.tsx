import './globals.css'
import type { ReactNode } from 'react'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { GeistSans } from 'geist/font/sans'

export const metadata = {
  title: 'Insight House',
  description: 'Analytics for real estate websites',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning className={GeistSans.className}>
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-auto">
          <QueryProvider>{children}</QueryProvider>
        </div>
      </body>
    </html>
  )
}
