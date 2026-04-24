"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  gradient?: string
  delay?: number
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, gradient, delay = 0 }: StatCardProps) {
  const trendColor =
    trend === 'up' ? 'text-green-400' :
    trend === 'down' ? 'text-red-400' : 'text-muted-foreground'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className={cn("text-2xl font-bold tracking-tight", trendColor !== 'text-muted-foreground' ? trendColor : 'text-foreground')}>
            {value}
          </p>
          {subtitle && (
            <p className={cn("text-xs mt-1", trendColor)}>{subtitle}</p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl", gradient ?? 'bg-blue-500/10')}>
          <Icon className={cn("h-5 w-5", gradient ? 'text-white' : 'text-blue-400')} />
        </div>
      </div>
    </motion.div>
  )
}
