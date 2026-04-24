"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Bet } from '@/types'
import { formatCurrency } from '@/utils/calculations'
import { format } from 'date-fns'
import { Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BetCardProps {
  bet: Bet
  onEdit?: (bet: Bet) => void
  onDelete?: (id: string) => void
  delay?: number
}

const RESULT_CONFIG = {
  green: { label: 'Win', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-400' },
  red: { label: 'Loss', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  void: { label: 'Void', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' },
}

export function BetCard({ bet, onEdit, onDelete, delay = 0 }: BetCardProps) {
  const config = RESULT_CONFIG[bet.result]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.005, transition: { duration: 0.15 } }}
      className={cn(
        "rounded-2xl border bg-white/5 backdrop-blur-sm p-4 shadow-card",
        config.border
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0", config.dot)} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{bet.event}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">{bet.sport}</span>
              <span className="text-muted-foreground/40 text-xs">•</span>
              <span className="text-xs text-muted-foreground">{bet.bookmaker}</span>
              <span className="text-muted-foreground/40 text-xs">•</span>
              <span className="text-xs text-muted-foreground">{format(new Date(bet.date), 'dd MMM')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">@{bet.odd}</p>
            <p className={cn("text-sm font-bold", config.text)}>
              {bet.profit >= 0 ? '+' : ''}{formatCurrency(bet.profit)}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(bet)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(bet.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Stake: <span className="text-foreground font-medium">{formatCurrency(bet.stake)}</span>
        </span>
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", config.bg, config.text)}>
          {config.label}
        </span>
      </div>
    </motion.div>
  )
}
