import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Bankroll } from '@/types'

interface BankrollState {
  bankroll: Bankroll | null
  loading: boolean
  fetchBankroll: (userId: string) => Promise<void>
  updateBalance: (userId: string, newBalance: number) => Promise<void>
  setupInitialBankroll: (userId: string, initialBalance: number) => Promise<void>
}

export const useBankrollStore = create<BankrollState>((set, get) => ({
  bankroll: null,
  loading: false,

  fetchBankroll: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('bankroll')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!error && data) {
      set({ bankroll: data as Bankroll })
    }
    set({ loading: false })
  },

  updateBalance: async (userId, newBalance) => {
    const { bankroll } = get()
    if (!bankroll) return

    const { data } = await supabase
      .from('bankroll')
      .update({ current_balance: newBalance })
      .eq('user_id', userId)
      .select()
      .single()

    if (data) set({ bankroll: data as Bankroll })
  },

  setupInitialBankroll: async (userId, initialBalance) => {
    const { data } = await supabase
      .from('bankroll')
      .upsert({ user_id: userId, initial_balance: initialBalance, current_balance: initialBalance })
      .select()
      .single()

    if (data) set({ bankroll: data as Bankroll })
  },
}))
