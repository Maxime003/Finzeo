export interface Transaction {
  id: string
  user_id: string
  transaction_date: string // YYYY-MM-DD
  amount: number
  original_label: string
  operation_type?: string
  description?: string
  category_id?: string
  category?: Category
  account_name?: string
  is_recurring: boolean
  import_batch_id?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'expense' | 'income' | 'transfer'
  color: string
  icon: string
  parent_category_id?: string
  is_default: boolean
  created_at: string
}

export interface ImportBatch {
  id: string
  user_id: string
  filename: string
  file_size?: number
  download_date?: string
  account_name?: string
  account_balance?: number
  period_start?: string
  period_end?: string
  total_transactions: number
  imported_transactions: number
  duplicates_skipped: number
  created_at: string
}

export interface PendingExpense {
  id: string
  user_id: string
  amount: number
  description: string
  expense_date: string
  reconciled_with?: string
  reconciled_at?: string
  created_at: string
}

export interface CategorizationRule {
  id: string
  user_id: string
  pattern: string
  category_id: string
  confidence: number
  usage_count: number
  last_used_at: string
  created_at: string
}
