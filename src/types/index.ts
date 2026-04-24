export type BetResult = 'green' | 'red' | 'void'

export interface Bet {
  id: string
  user_id: string
  date: string
  sport: string
  event: string
  bookmaker: string
  odd: number
  stake: number
  result: BetResult
  profit: number
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  date: string
  description?: string
  created_at: string
}

export interface Bankroll {
  id: string
  user_id: string
  initial_balance: number
  current_balance: number
}

export interface DashboardStats {
  currentBalance: number
  monthlyProfit: number
  roi: number
  winrate: number
}

export interface BankrollEvolutionPoint {
  date: string
  balance: number
}

export interface MonthlyProfitPoint {
  month: string
  profit: number
}

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5
