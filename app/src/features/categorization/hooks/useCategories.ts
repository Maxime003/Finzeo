import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type { Category } from '@/types/transaction'

const CATEGORIES_QUERY_KEY = 'categories'

type CategoryType = Category['type']

async function fetchCategories(
  userId: string,
  typeFilter?: CategoryType
): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (typeFilter) {
    query = query.eq('type', typeFilter)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Category[]
}

export function useCategories(typeFilter?: CategoryType) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''

  const query = useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, userId, typeFilter],
    queryFn: () => fetchCategories(userId, typeFilter),
    enabled: !!userId,
  })

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
