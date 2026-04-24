"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/useAuthStore'
import { useBetsStore } from '@/store/useBetsStore'
import { useBankrollStore } from '@/store/useBankrollStore'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { calculateProfit, formatCurrency } from '@/utils/calculations'
import { BetResult } from '@/types'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, MinusCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const SPORTS = ['Football', 'Basketball', 'Tennis', 'Volleyball', 'Baseball', 'Hockey', 'MMA', 'Boxing', 'Other']
const BOOKMAKERS = ['Bet365', 'Betfair', 'Betano', 'SportingBet', 'Pinnacle', 'Betway', '1xBet', 'Other']

const schema = z.object({
  date: z.string().min(1, 'Required'),
  sport: z.string().min(1, 'Required'),
  event: z.string().min(2, 'Event name is too short'),
  bookmaker: z.string().min(1, 'Required'),
  odd: z.coerce.number().min(1.01, 'Odd must be > 1.01'),
  stake: z.coerce.number().min(0.01, 'Stake must be > 0'),
  result: z.enum(['green', 'red', 'void']),
})

type FormData = z.infer<typeof schema>

const RESULT_OPTIONS: { value: BetResult; label: string; icon: typeof CheckCircle2; color: string; bg: string }[] = [
  { value: 'green', label: 'Win', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/40' },
  { value: 'red', label: 'Loss', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/40' },
  { value: 'void', label: 'Void', icon: MinusCircle, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/40' },
]

export default function AddBetPage() {
  const { user } = useAuthStore()
  const { addBet } = useBetsStore()
  const { bankroll, fetchBankroll, updateBalance } = useBankrollStore()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [previewProfit, setPreviewProfit] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      result: 'green',
    },
  })

  const watchedOdd = watch('odd')
  const watchedStake = watch('stake')
  const watchedResult = watch('result')

  useEffect(() => {
    if (user) fetchBankroll(user.id)
  }, [user, fetchBankroll])

  useEffect(() => {
    if (watchedOdd && watchedStake && watchedResult) {
      const profit = calculateProfit(Number(watchedStake), Number(watchedOdd), watchedResult as BetResult)
      setPreviewProfit(profit)
    }
  }, [watchedOdd, watchedStake, watchedResult])

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setSubmitting(true)

    const { error } = await addBet(user.id, {
      date: data.date,
      sport: data.sport,
      event: data.event,
      bookmaker: data.bookmaker,
      odd: data.odd,
      stake: data.stake,
      result: data.result,
    })

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
      setSubmitting(false)
      return
    }

    // Update bankroll balance
    if (bankroll) {
      const profit = calculateProfit(data.stake, data.odd, data.result)
      await updateBalance(user.id, bankroll.current_balance + profit)
    }

    toast({ title: 'Bet added!', description: 'Your bet has been recorded.', variant: 'success' } as any)
    reset({ date: format(new Date(), 'yyyy-MM-dd'), result: 'green' })
    router.push('/bets')
    setSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <TopBar title="Add Bet" subtitle="Record a new wager" />

      <div className="px-4 lg:px-6 py-5 max-w-lg mx-auto">
        {/* Profit preview */}
        {previewProfit !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border p-4 mb-5 flex items-center justify-between",
              previewProfit > 0 ? 'border-green-500/20 bg-green-500/5' :
              previewProfit < 0 ? 'border-red-500/20 bg-red-500/5' :
              'border-white/10 bg-white/5'
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className={cn(
                "h-4 w-4",
                previewProfit > 0 ? 'text-green-400' :
                previewProfit < 0 ? 'text-red-400' : 'text-gray-400'
              )} />
              <span className="text-sm text-muted-foreground">Expected P&L</span>
            </div>
            <span className={cn(
              "text-xl font-bold",
              previewProfit > 0 ? 'text-green-400' :
              previewProfit < 0 ? 'text-red-400' : 'text-gray-400'
            )}>
              {previewProfit >= 0 ? '+' : ''}{formatCurrency(previewProfit)}
            </span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date & Sport */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-red-400">{errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Sport</Label>
              <Controller
                name="sport"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sport && <p className="text-xs text-red-400">{errors.sport.message}</p>}
            </div>
          </div>

          {/* Event */}
          <div className="space-y-1.5">
            <Label>Event / Market</Label>
            <Input placeholder="e.g. Manchester City vs Arsenal - Over 2.5" {...register('event')} />
            {errors.event && <p className="text-xs text-red-400">{errors.event.message}</p>}
          </div>

          {/* Bookmaker */}
          <div className="space-y-1.5">
            <Label>Bookmaker</Label>
            <Controller
              name="bookmaker"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bookmaker" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKMAKERS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bookmaker && <p className="text-xs text-red-400">{errors.bookmaker.message}</p>}
          </div>

          {/* Odd & Stake */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Odd</Label>
              <Input type="number" step="0.01" placeholder="2.10" {...register('odd')} />
              {errors.odd && <p className="text-xs text-red-400">{errors.odd.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>
                Stake
                {bankroll && (
                  <span className="text-muted-foreground ml-1">
                    (bal: {formatCurrency(bankroll.current_balance)})
                  </span>
                )}
              </Label>
              <Input type="number" step="0.01" placeholder="100.00" {...register('stake')} />
              {errors.stake && <p className="text-xs text-red-400">{errors.stake.message}</p>}
            </div>
          </div>

          {/* Result */}
          <div className="space-y-2">
            <Label>Result</Label>
            <Controller
              name="result"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {RESULT_OPTIONS.map(({ value, label, icon: Icon, color, bg }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200",
                        field.value === value ? bg : 'border-white/10 bg-white/5 hover:bg-white/10'
                      )}
                    >
                      <Icon className={cn("h-5 w-5", field.value === value ? color : 'text-muted-foreground')} />
                      <span className={cn("text-xs font-medium", field.value === value ? color : 'text-muted-foreground')}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Bet'}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
