"use client"

import { motion } from 'framer-motion'
import { Bell, User } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { user } = useAuthStore()

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 bg-[#0a0a14]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-6 py-3 flex items-center justify-between"
    >
      <div>
        <h1 className="text-base font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          {user?.email && (
            <span className="text-xs text-muted-foreground hidden sm:block pr-1 max-w-[120px] truncate">
              {user.email}
            </span>
          )}
        </div>
      </div>
    </motion.header>
  )
}
