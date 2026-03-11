import { useState, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type { Transaction } from '@/types/transaction'
import { learnRule } from '@/features/categorization/services/categorizationEngine'

const UNCATEGORIZED_QUERY_KEY = 'uncategorized_transactions'
const UNCATEGORIZED_COUNT_KEY = 'uncategorized_count'
const LIMIT = 100

async function fetchUncategorized(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .is('category_id', null)
    .order('transaction_date', { ascending: false })
    .limit(LIMIT)
  if (error) throw error
  return (data ?? []) as Transaction[]
}

async function fetchUncategorizedCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('category_id', null)
  if (error) throw error
  return count ?? 0
}

export function useCategorization() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [UNCATEGORIZED_QUERY_KEY, userId],
    queryFn: () => fetchUncategorized(userId),
    enabled: !!userId,
  })

  const countQuery = useQuery({
    queryKey: [UNCATEGORIZED_COUNT_KEY, userId],
    queryFn: () => fetchUncategorizedCount(userId),
    enabled: !!userId,
  })

  const lastCategorizedQuery = useQuery({
    queryKey: ['last_categorized', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date')
        .eq('user_id', userId)
        .not('category_id', 'is', null)
        .order('transaction_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) return null
      return data?.transaction_date ?? null
    },
    enabled: !!userId,
  })

  const transactions = query.data ?? []
  const [rawIndex, setCurrentIndex] = useState(0)
  const [localEdits, setLocalEdits] = useState<Record<string, { description: string; categoryId: string }>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Clamp index when the list shrinks (e.g. after a save + refetch)
  const currentIndex = transactions.length === 0 ? 0 : Math.min(rawIndex, transactions.length - 1)
  const current = transactions[currentIndex] ?? null

  const { localDescription, localCategoryId } = useMemo(() => {
    if (!current) return { localDescription: '', localCategoryId: '' }
    const edits = localEdits[current.id]
    return {
      localDescription: edits?.description ?? current.description ?? '',
      localCategoryId: edits?.categoryId ?? '',
    }
  }, [current, localEdits])

  const setDescription = useCallback((description: string) => {
    setLocalEdits((prev) => {
      if (!current) return prev
      return {
        ...prev,
        [current.id]: {
          ...prev[current.id],
          description,
          categoryId: prev[current.id]?.categoryId ?? '',
        },
      }
    })
  }, [current])

  const setCategoryId = useCallback((categoryId: string) => {
    setLocalEdits((prev) => {
      if (!current) return prev
      return {
        ...prev,
        [current.id]: {
          description: prev[current.id]?.description ?? current.description ?? '',
          categoryId,
        },
      }
    })
  }, [current])

  const saveAndNext = useCallback(
    async (action: 'next' | 'skip' | 'previous', confidence: number = 1) => {
      if (action === 'previous') {
        setCurrentIndex((i) => Math.max(0, i - 1))
        return
      }
      if (action === 'skip') {
        setCurrentIndex((i) => Math.min(transactions.length - 1, i + 1))
        return
      }
      if (!current || !userId) return
      const categoryId = localEdits[current.id]?.categoryId
      if (!categoryId) return
      const description = localEdits[current.id]?.description ?? current.description ?? ''
      setIsSaving(true)
      try {
        await supabase
          .from('transactions')
          .update({
            description: description || null,
            category_id: categoryId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', current.id)
        await learnRule(userId, current.original_label, categoryId, confidence)
        await queryClient.refetchQueries({ queryKey: [UNCATEGORIZED_QUERY_KEY, userId] })
        await queryClient.refetchQueries({ queryKey: [UNCATEGORIZED_COUNT_KEY, userId] })
        await queryClient.refetchQueries({ queryKey: ['categorization_rules', userId] })
        await queryClient.refetchQueries({ queryKey: ['last_categorized', userId] })
        setLocalEdits((prev) => {
          const next = { ...prev }
          delete next[current.id]
          return next
        })
      } finally {
        setIsSaving(false)
      }
    },
    [current, userId, transactions.length, localEdits, queryClient]
  )

  return {
    transactions,
    totalUncategorized: countQuery.data ?? 0,
    lastCategorizedDate: lastCategorizedQuery.data ?? null,
    currentIndex,
    current,
    isLoading: query.isLoading || countQuery.isLoading,
    isSaving,
    error: query.error,
    localDescription,
    localCategoryId,
    setDescription,
    setCategoryId,
    saveAndNext,
  }
}
