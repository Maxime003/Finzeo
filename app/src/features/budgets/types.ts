export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  created_at: string
  updated_at: string
}

export interface BudgetWithSpending extends Budget {
  spent: number
  percentage: number
  remaining: number
}
