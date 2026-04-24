"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useBankrollStore } from '@/store/useBankrollStore'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { calculateStake, formatCurrency } from '@/utils/calculations'
import { ConfidenceLevel } from '@/types'
import { cn } from '@/lib/utils'
import { Calculator, Zap } from 'lucide-react'

const CONFIDENCE_OPTIONS: { level: ConfidenceLevel; label: string; pct: string; description: string; color: string }[] = [
  { level: 1, label: 'Low', pct: '3%', description: 'Very cautious', color: 'border-gray-500/40 bg-gray-500/10 text-gray-300' },
  { level: 2, label: 'Moderate', pct: '5%', description: 'Cautious', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
  { level: 3, label: 'Medium', pct: '10%', description: 'Normal', color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' },
  { level: 4, label: 'High', pct: '15%', description: 'Confident', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
  { level: 5, label: 'Very High', pct: '20%', description: 'Very confident', color: 'border-green-500/40 bg-green-500/10 text-green-300' },
]

export default function CalculatorPage() {
  const { user } = useAuthStore()
  const { bankroll, fetchBankroll } = useBankrollStore()
  const [confidence, setConfidence] = useState<ConfidenceLevel>(3)

  useEffect(() => {
    if (user) fetchBankroll(user.id)
  }, [user, fetchBankroll])

  const balance = bankroll?.current_balance ?? 0
  const recommended = calculateStake(balance, confidence)
  const selected = CONFIDENCE_OPTIONS.find((o) => o.level === confidence)!

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <TopBar title="Stake Calculator" subtitle="Kelly-inspired sizing" />

      <div className="px-4 lg:px-6 py-5 max-w-lg mx-auto space-y-6">
        {/* Balance display */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Bankroll</p>
          <p className="text-3xl font-bold text-gradient">{formatCurrency(balance)}</p>
        </motion.div>

        {/* Confidence selector */}
        <div>
          <p className="text-sm font-semibold mb-3">Confidence Level</p>
          <div className="grid grid-cols-5 gap-2">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <motion.button
                key={opt.level}
                whileTap={{ scale: 0.92 }}
                onClick={() => setConfidence(opt.level)}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 rounded-xl border transition-all duration-200",
                  confidence === opt.level ? opt.color : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
                )}
              >
                <span className="text-lg font-bold">{opt.level}</span>
                <span className="text-[10px] font-medium">{opt.pct}</span>
              </motion.button>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{selected.label}</span> — {selected.description} ({selected.pct} of bankroll)
            </p>
          </div>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          <motion.div
            key={confidence}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "rounded-2xl border p-6 text-center space-y-2",
              selected.color
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5" />
              <p className="text-sm font-medium">Recommended Stake</p>
            </div>
            <p className="text-5xl font-bold tracking-tight">{formatCurrency(recommended)}</p>
            <p className="text-sm opacity-75">{selected.pct} × {formatCurrency(balance)}</p>
          </motion.div>
        </AnimatePresence>

        {/* Guide */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence Guide</p>
          <div className="space-y-2">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <div key={opt.level} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", confidence === opt.level ? 'bg-blue-400' : 'bg-white/20')} />
                  <span className="text-muted-foreground">{opt.level} — {opt.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{opt.pct}</span>
                  <span className="text-foreground font-medium w-24 text-right">
                    {formatCurrency(calculateStake(balance, opt.level))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
