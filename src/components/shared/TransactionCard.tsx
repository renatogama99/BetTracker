"use client"

import { motion } from 'framer-motion'
import { Transaction } from '@/types'
import { formatCurrency } from '@/utils/calculations'
import { format } from 'date-fns'
import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionCardProps {
  transaction: Transaction
  onDelete?: (id: string) => void
  delay?: number
}

export function TransactionCard({ transaction, onDelete, delay = 0 }: TransactionCardProps) {
  const isDeposit = transaction.type === 'deposit'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "rounded-2xl border bg-white/5 backdrop-blur-sm p-4 shadow-card",
        isDeposit ? 'border-green-500/20' : 'border-red-500/20'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl",
            isDeposit ? 'bg-green-500/10' : 'bg-red-500/10'
          )}>
            {isDeposit
              ? <ArrowDownLeft className="h-5 w-5 text-green-400" />
              : <ArrowUpRight className="h-5 w-5 text-red-400" />
            }
          </div>
          <div>
            <p className="font-semibold text-sm capitalize">{transaction.type}</p>
            {transaction.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{transaction.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(transaction.date), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className={cn("text-base font-bold", isDeposit ? 'text-green-400' : 'text-red-400')}>
            {isDeposit ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
