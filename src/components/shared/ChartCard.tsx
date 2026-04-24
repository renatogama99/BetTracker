"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  delay?: number
}

export function ChartCard({ title, subtitle, children, className, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-card",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  )
}
