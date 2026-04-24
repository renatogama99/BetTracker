import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Bet, BetResult } from '@/types'
import { calculateProfit } from '@/utils/calculations'

interface BetsState {
  bets: Bet[]
  loading: boolean
  fetchBets: (userId: string) => Promise<void>
  addBet: (userId: string, bet: Omit<Bet, 'id' | 'user_id' | 'profit' | 'created_at'>) => Promise<{ error: string | null }>
  updateBet: (id: string, updates: Partial<Bet>) => Promise<{ error: string | null }>
  deleteBet: (id: string) => Promise<{ error: string | null }>
}

export const useBetsStore = create<BetsState>((set, get) => ({
  bets: [],
  loading: false,

  fetchBets: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (!error && data) {
      set({ bets: data as Bet[] })
    }
    set({ loading: false })
  },

  addBet: async (userId, betData) => {
    const profit = calculateProfit(betData.stake, betData.odd, betData.result as BetResult)

    const { data, error } = await supabase
      .from('bets')
      .insert({ ...betData, user_id: userId, profit })
      .select()
      .single()

    if (error) return { error: error.message }

    set((state) => ({ bets: [data as Bet, ...state.bets] }))
    return { error: null }
  },

  updateBet: async (id, updates) => {
    const existing = get().bets.find((b) => b.id === id)
    if (!existing) return { error: 'Bet not found' }

    const merged = { ...existing, ...updates }
    const profit = calculateProfit(merged.stake, merged.odd, merged.result as BetResult)

    const { data, error } = await supabase
      .from('bets')
      .update({ ...updates, profit })
      .eq('id', id)
      .select()
      .single()

    if (error) return { error: error.message }

    set((state) => ({
      bets: state.bets.map((b) => (b.id === id ? (data as Bet) : b)),
    }))
    return { error: null }
  },

  deleteBet: async (id) => {
    const { error } = await supabase.from('bets').delete().eq('id', id)
    if (error) return { error: error.message }

    set((state) => ({ bets: state.bets.filter((b) => b.id !== id) }))
    return { error: null }
  },
}))
