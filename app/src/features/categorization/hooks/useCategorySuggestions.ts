import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type { CategorizationRule } from '@/types/transaction'
import { getSuggestedCategoryId } from '@/features/categorization/services/categorizationEngine'
import { useCategories } from './useCategories'

const RULES_QUERY_KEY = 'categorization_rules'

async function fetchUserRules(userId: string): Promise<CategorizationRule[]> {
  const { data, error } = await supabase
    .from('categorization_rules')
    .select('*')
    .eq('user_id', userId)
    .order('usage_count', { ascending: false })
  if (error) throw error
  return (data ?? []) as CategorizationRule[]
}

export function useCategorySuggestions(label: string, amount: number) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''
  const { categories, isLoading: categoriesLoading } = useCategories()

  const rulesQuery = useQuery({
    queryKey: [RULES_QUERY_KEY, userId],
    queryFn: () => fetchUserRules(userId),
    enabled: !!userId,
  })

  const suggestion = useMemo(() => {
    if (!label.trim()) return { categoryId: undefined, confidence: 0, source: 'none' as const }
    return getSuggestedCategoryId(
      label,
      amount,
      categories,
      rulesQuery.data ?? []
    )
  }, [label, amount, categories, rulesQuery.data])

  const isLoading = categoriesLoading || rulesQuery.isLoading

  return {
    suggestedCategoryId: suggestion.categoryId,
    confidence: suggestion.confidence,
    source: suggestion.source,
    isLoading,
  }
}
