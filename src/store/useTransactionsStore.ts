import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Transaction } from '@/types'

interface TransactionsState {
  transactions: Transaction[]
  loading: boolean
  fetchTransactions: (userId: string) => Promise<void>
  addTransaction: (
    userId: string,
    tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>
  ) => Promise<{ error: string | null }>
  deleteTransaction: (id: string) => Promise<{ error: string | null }>
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (!error && data) {
      set({ transactions: data as Transaction[] })
    }
    set({ loading: false })
  },

  addTransaction: async (userId, txData) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...txData, user_id: userId })
      .select()
      .single()

    if (error) return { error: error.message }

    set((state) => ({ transactions: [data as Transaction, ...state.transactions] }))
    return { error: null }
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) return { error: error.message }

    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
    return { error: null }
  },
}))
