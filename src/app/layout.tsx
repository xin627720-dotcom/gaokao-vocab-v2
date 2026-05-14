import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '高考词汇语境训练 v2',
  description: '在高考风格句子中识别词义',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-gray-50 antialiased">{children}</body>
    </html>
  )
}
