import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Touhou: Infinite Nightmare of Computer Science',
  description: 'Created by FixerHD',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
