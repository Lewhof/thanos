'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard,
  GitFork,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diagrams', label: 'Diagrams', icon: GitFork },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-border bg-card shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <span className="text-lg font-bold tracking-tight">Thanos</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px]',
                pathname.startsWith(href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-5 py-4 border-t border-border">
          <UserButton showName />
        </div>
      </aside>

      {/* Mobile bottom nav — visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-border bg-card">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors min-h-[56px]',
              pathname.startsWith(href)
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
