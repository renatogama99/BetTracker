"use client"

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useBetsStore } from '@/store/useBetsStore'
import { useBankrollStore } from '@/store/useBankrollStore'
import { TopBar } from '@/components/layout/TopBar'
import { BetCard } from '@/components/shared/BetCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bet } from '@/types'
import { exportBetsToCSV, calculateProfit } from '@/utils/calculations'
import { Plus, Search, Download, ListOrdered } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

type SortKey = 'date' | 'stake' | 'profit' | 'odd'
type Filter = 'all' | 'green' | 'red' | 'void'

export default function BetsPage() {
  const { user } = useAuthStore()
  const { bets, fetchBets, deleteBet, loading } = useBetsStore()
  const { bankroll, updateBalance } = useBankrollStore()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<SortKey>('date')

  useEffect(() => {
    if (user) fetchBets(user.id)
  }, [user, fetchBets])

  const filtered = useMemo(() => {
    let result = [...bets]

    if (filter !== 'all') result = result.filter((b) => b.result === filter)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.event.toLowerCase().includes(q) ||
          b.sport.toLowerCase().includes(q) ||
          b.bookmaker.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      if (sort === 'date') return b.date.localeCompare(a.date)
      if (sort === 'stake') return b.stake - a.stake
      if (sort === 'profit') return b.profit - a.profit
      if (sort === 'odd') return b.odd - a.odd
      return 0
    })

    return result
  }, [bets, filter, search, sort])

  const handleDelete = async (id: string) => {
    const bet = bets.find((b) => b.id === id)
    const { error } = await deleteBet(id)
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
    } else {
      // Reverse profit from bankroll
      if (bet && bankroll && user) {
        await updateBalance(user.id, bankroll.current_balance - bet.profit)
      }
      toast({ title: 'Bet deleted', variant: 'default' } as any)
    }
  }

  const handleEdit = (bet: Bet) => {
    router.push(`/bets/${bet.id}/edit`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TopBar title="Bets" subtitle={`${bets.length} total bets`} />

      <div className="px-4 lg:px-6 py-5 space-y-4 max-w-2xl mx-auto">
        {/* Actions bar */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => router.push('/add-bet')}>
            <Plus className="h-4 w-4" />
            Add Bet
          </Button>
          <Button variant="outline" size="icon" onClick={() => exportBetsToCSV(bets)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bets…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters + Sort */}
        <div className="flex gap-2">
          {/* Result filter tabs */}
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 flex-1">
            {(['all', 'green', 'red', 'void'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all duration-200 ${
                  filter === f
                    ? f === 'all' ? 'bg-blue-600 text-white'
                    : f === 'green' ? 'bg-green-600 text-white'
                    : f === 'red' ? 'bg-red-600 text-white'
                    : 'bg-gray-600 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="stake">Stake</SelectItem>
              <SelectItem value="profit">Profit</SelectItem>
              <SelectItem value="odd">Odd</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {loading ? (
          <LoadingSkeleton count={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListOrdered}
            title={search || filter !== 'all' ? 'No bets found' : 'No bets yet'}
            description={
              search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Add your first bet to start tracking.'
            }
            action={
              !search && filter === 'all' ? (
                <Button onClick={() => router.push('/add-bet')}>
                  <Plus className="h-4 w-4" />
                  Add Bet
                </Button>
              ) : undefined
            }
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {filtered.map((bet, i) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  delay={Math.min(i * 0.03, 0.15)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
