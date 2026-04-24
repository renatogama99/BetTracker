"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, ListOrdered, ArrowLeftRight, Calculator, Settings, TrendingUp, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/bets', icon: ListOrdered, label: 'Bets' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/calculator', icon: Calculator, label: 'Calculator' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#0a0a14] border-r border-white/10 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight">BankrollPro</p>
          <p className="text-[10px] text-muted-foreground">Track · Analyze · Win</p>
        </div>
      </div>

      {/* Add bet CTA */}
      <div className="px-4 py-4">
        <Button
          className="w-full"
          onClick={() => router.push('/add-bet')}
        >
          <Plus className="h-4 w-4" />
          New Bet
        </Button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground text-center">BankrollPro v1.0</p>
      </div>
    </aside>
  )
}
