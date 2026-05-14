import Link from 'next/link'

type Props = {
  children: React.ReactNode
  title?: string
  backHref?: string
}

export default function AppShell({ children, title, backHref }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="返回"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
          {title && (
            <h1 className="text-sm font-semibold text-gray-800 flex-1">
              {title}
            </h1>
          )}
          {!backHref && !title && (
            <span className="text-sm font-semibold text-gray-800">高考词汇语境训练</span>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {children}
      </main>

      <nav className="sticky bottom-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-around">
          <NavItem href="/" label="今日" icon="🏠" />
          <NavItem href="/learn" label="新词" icon="📖" />
          <NavItem href="/sentence" label="句义" icon="🔍" />
          <NavItem href="/review" label="复习" icon="🃏" />
          <NavItem href="/confusion" label="易混" icon="⚡" />
        </div>
      </nav>
    </div>
  )
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-indigo-600 transition-colors min-w-[48px]"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs">{label}</span>
    </Link>
  )
}
