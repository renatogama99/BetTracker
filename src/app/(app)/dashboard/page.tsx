"use client"

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useBankrollStore } from '@/store/useBankrollStore'
import { useBetsStore } from '@/store/useBetsStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { TopBar } from '@/components/layout/TopBar'
import { StatCard } from '@/components/shared/StatCard'
import { ChartCard } from '@/components/shared/ChartCard'
import { BetCard } from '@/components/shared/BetCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCardSkeleton, LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import {
  formatCurrency,
  calculateROI,
  calculateWinrate,
  getBankrollEvolution,
  getMonthlyProfits,
} from '@/utils/calculations'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  ArrowDownLeft,
  BarChart3,
  ListOrdered,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0f0f1a]/95 backdrop-blur-sm px-3 py-2 text-xs shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="font-bold text-blue-400">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

function ProfitTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const value = payload[0].value
    return (
      <div className="rounded-xl border border-white/10 bg-[#0f0f1a]/95 backdrop-blur-sm px-3 py-2 text-xs shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className={`font-bold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {value >= 0 ? '+' : ''}{formatCurrency(value)}
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { bankroll, fetchBankroll, loading: bankrollLoading } = useBankrollStore()
  const { bets, fetchBets, loading: betsLoading } = useBetsStore()
  const { transactions, fetchTransactions } = useTransactionsStore()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchBankroll(user.id)
      fetchBets(user.id)
      fetchTransactions(user.id)
    }
  }, [user, fetchBankroll, fetchBets, fetchTransactions])

  const currentMonth = format(new Date(), 'yyyy-MM')
  const monthlyBets = useMemo(
    () => bets.filter((b) => b.date.startsWith(currentMonth)),
    [bets, currentMonth]
  )

  const monthlyProfit = useMemo(
    () => monthlyBets.reduce((sum, b) => sum + b.profit, 0),
    [monthlyBets]
  )

  const roi = useMemo(() => calculateROI(bets), [bets])
  const winrate = useMemo(() => calculateWinrate(bets), [bets])
  const recentBets = bets.slice(0, 5)

  const evolutionData = useMemo(
    () => getBankrollEvolution(bankroll?.initial_balance ?? 0, bets, transactions),
    [bankroll, bets, transactions]
  )

  const monthlyData = useMemo(() => getMonthlyProfits(bets), [bets])

  const isLoading = bankrollLoading || betsLoading

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TopBar title="Dashboard" subtitle={`Good ${getGreeting()}, ${user?.email?.split('@')[0]}`} />

      <div className="px-4 lg:px-6 py-5 space-y-5 max-w-4xl mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Balance"
                value={formatCurrency(bankroll?.current_balance ?? 0)}
                icon={Wallet}
                gradient="bg-blue-500/10"
                delay={0}
              />
              <StatCard
                title="Monthly P&L"
                value={(monthlyProfit >= 0 ? '+' : '') + formatCurrency(monthlyProfit)}
                icon={monthlyProfit >= 0 ? TrendingUp : TrendingDown}
                trend={monthlyProfit >= 0 ? 'up' : monthlyProfit < 0 ? 'down' : 'neutral'}
                delay={0.05}
              />
              <StatCard
                title="ROI"
                value={`${roi >= 0 ? '+' : ''}${roi}%`}
                icon={BarChart3}
                trend={roi >= 0 ? 'up' : 'down'}
                delay={0.1}
              />
              <StatCard
                title="Win Rate"
                value={`${winrate}%`}
                icon={Target}
                trend={winrate >= 50 ? 'up' : 'neutral'}
                delay={0.15}
              />
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => router.push('/add-bet')}>
            <Plus className="h-4 w-4" />
            Add Bet
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => router.push('/transactions')}>
            <ArrowDownLeft className="h-4 w-4" />
            Deposit
          </Button>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <ChartCard title="Bankroll Evolution" subtitle="All time" delay={0.2}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Profit" subtitle="Last 6 months" delay={0.25}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} />
                <Tooltip content={<ProfitTooltip />} />
                <Bar
                  dataKey="profit"
                  radius={[4, 4, 0, 0]}
                  fill="#22c55e"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent bets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Bets</h2>
            <button
              onClick={() => router.push('/bets')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View all →
            </button>
          </div>

          {betsLoading ? (
            <LoadingSkeleton count={3} />
          ) : recentBets.length === 0 ? (
            <EmptyState
              icon={ListOrdered}
              title="No bets yet"
              description="Add your first bet to start tracking your bankroll performance."
              action={
                <Button onClick={() => router.push('/add-bet')}>
                  <Plus className="h-4 w-4" />
                  Add First Bet
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {recentBets.map((bet, i) => (
                <BetCard key={bet.id} bet={bet} delay={i * 0.05} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}
