import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { getMonthRange } from '@/lib/utils/date'
import type { Transaction, Category } from '@/types/transaction'

const PAGE_SIZE = 20

export interface TransactionFilters {
  month: Date
  categoryId?: string
  search?: string
}

interface TransactionWithCategory extends Transaction {
  category: Category | null
}

async function fetchTransactions(
  userId: string,
  filters: TransactionFilters,
  page: number
): Promise<{ data: TransactionWithCategory[]; count: number }> {
  const { start, end } = getMonthRange(filters.month)

  let query = supabase
    .from('transactions')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  if (filters.search) {
    const term = `%${filters.search}%`
    query = query.or(`original_label.ilike.${term},description.ilike.${term}`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as TransactionWithCategory[], count: count ?? 0 }
}

export function useTransactions(filters: TransactionFilters) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''
  const [page, setPage] = useState(0)

  const query = useQuery({
    queryKey: ['transactions', userId, filters.month.toISOString(), filters.categoryId, filters.search, page],
    queryFn: () => fetchTransactions(userId, filters, page),
    enabled: !!userId,
  })

  const transactions = query.data?.data ?? []
  const totalCount = query.data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const pageTotal = transactions.reduce((sum, t) => sum + t.amount, 0)

  return {
    transactions,
    totalCount,
    totalPages,
    pageTotal,
    page,
    setPage,
    isLoading: query.isLoading,
    error: query.error,
  }
}
