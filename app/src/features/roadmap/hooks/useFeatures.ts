import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { RoadmapFeature, FeatureStatus, FeaturePriority } from '../types'

const QUERY_KEY = ['roadmap-features']

export function useFeatures() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<RoadmapFeature[]> => {
      const { data, error } = await supabase
        .from('roadmap_features')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },
  })
}

export function useAdminFeatures() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'admin'],
    queryFn: async (): Promise<RoadmapFeature[]> => {
      const { data, error } = await supabaseAdmin
        .from('roadmap_features')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },
  })
}

interface CreateFeatureInput {
  title: string
  description: string | null
  status: FeatureStatus
  category: string
  priority: FeaturePriority
  sort_order?: number
}

export function useCreateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateFeatureInput) => {
      const { data, error } = await supabaseAdmin
        .from('roadmap_features')
        .insert({
          ...input,
          sort_order: input.sort_order ?? 0,
        })
        .select()
        .single()

      if (error) throw error
      return data as RoadmapFeature
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

interface UpdateFeatureInput {
  id: string
  title?: string
  description?: string | null
  status?: FeatureStatus
  category?: string
  priority?: FeaturePriority
  sort_order?: number
}

export function useUpdateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateFeatureInput) => {
      const { data, error } = await supabaseAdmin
        .from('roadmap_features')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as RoadmapFeature
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin
        .from('roadmap_features')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
