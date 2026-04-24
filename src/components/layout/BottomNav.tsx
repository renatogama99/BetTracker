"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, ListOrdered, ArrowLeftRight, Calculator, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FloatingActionButton } from '@/components/shared/FloatingActionButton'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/bets', icon: ListOrdered, label: 'Bets' },
  { href: '/add-bet', icon: null, label: 'Add' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transfers' },
  { href: '/calculator', icon: Calculator, label: 'Calc' },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a14]/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          if (item.href === '/add-bet') {
            return (
              <div key="add" className="-mt-6">
                <FloatingActionButton onClick={() => router.push('/add-bet')} />
              </div>
            )
          }

          const Icon = item.icon!
          const active = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 flex-1 py-2">
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-colors", active ? 'text-blue-400' : 'text-muted-foreground')} />
                {active && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-blue-400"
                  />
                )}
              </div>
              <span className={cn("text-[10px] font-medium transition-colors", active ? 'text-blue-400' : 'text-muted-foreground')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
