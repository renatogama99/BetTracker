"use client"

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useBankrollStore } from '@/store/useBankrollStore'
import { TopBar } from '@/components/layout/TopBar'
import { TransactionCard } from '@/components/shared/TransactionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { formatCurrency } from '@/utils/calculations'
import { format } from 'date-fns'
import { Plus, ArrowLeftRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type TxType = 'deposit' | 'withdrawal'

export default function TransactionsPage() {
  const { user } = useAuthStore()
  const { transactions, fetchTransactions, addTransaction, deleteTransaction, loading } = useTransactionsStore()
  const { bankroll, updateBalance } = useBankrollStore()

  const [open, setOpen] = useState(false)
  const [txType, setTxType] = useState<TxType>('deposit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTransactions(user.id)
    }
  }, [user, fetchTransactions])

  const totalDeposits = useMemo(
    () => transactions.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
    [transactions]
  )
  const totalWithdrawals = useMemo(
    () => transactions.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0),
    [transactions]
  )

  const handleAdd = async () => {
    if (!user || !amount || Number(amount) <= 0) return
    setSubmitting(true)

    const { error } = await addTransaction(user.id, {
      type: txType,
      amount: Number(amount),
      date,
      description: description || undefined,
    })

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
      setSubmitting(false)
      return
    }

    if (bankroll) {
      const delta = txType === 'deposit' ? Number(amount) : -Number(amount)
      await updateBalance(user.id, bankroll.current_balance + delta)
    }

    toast({ title: `${txType === 'deposit' ? 'Deposit' : 'Withdrawal'} recorded!`, variant: 'success' } as any)
    setAmount('')
    setDescription('')
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setOpen(false)
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    const tx = transactions.find((t) => t.id === id)
    const { error } = await deleteTransaction(id)
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
    } else {
      if (tx && bankroll && user) {
        const delta = tx.type === 'deposit' ? -tx.amount : tx.amount
        await updateBalance(user.id, bankroll.current_balance + delta)
      }
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <TopBar title="Transactions" subtitle="Deposits & withdrawals" />

      <div className="px-4 lg:px-6 py-5 space-y-4 max-w-2xl mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownLeft className="h-4 w-4 text-green-400" />
              <p className="text-xs text-muted-foreground">Total Deposited</p>
            </div>
            <p className="text-lg font-bold text-green-400">{formatCurrency(totalDeposits)}</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-red-400" />
              <p className="text-xs text-muted-foreground">Total Withdrawn</p>
            </div>
            <p className="text-lg font-bold text-red-400">{formatCurrency(totalWithdrawals)}</p>
          </div>
        </div>

        {/* Add transaction button */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Type toggle */}
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 gap-1">
                {(['deposit', 'withdrawal'] as TxType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTxType(t)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                      txType === t
                        ? t === 'deposit' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t === 'deposit' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="e.g. Monthly deposit"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleAdd}
                disabled={submitting || !amount || Number(amount) <= 0}
              >
                {submitting ? 'Saving…' : `Add ${txType}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* List */}
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions"
            description="Record deposits and withdrawals to track your bankroll accurately."
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
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
