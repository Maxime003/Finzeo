import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { RoadmapComment } from '../types'

function getQueryKey(featureId?: string, ideaId?: string) {
  return ['roadmap-comments', { featureId, ideaId }]
}

export function useComments(featureId?: string, ideaId?: string) {
  return useQuery({
    queryKey: getQueryKey(featureId, ideaId),
    queryFn: async (): Promise<RoadmapComment[]> => {
      let query = supabase
        .from('roadmap_comments')
        .select('*')
        .order('created_at', { ascending: true })

      if (featureId) {
        query = query.eq('feature_id', featureId)
      }
      if (ideaId) {
        query = query.eq('idea_id', ideaId)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: !!featureId || !!ideaId,
  })
}

interface AddCommentInput {
  feature_id?: string | null
  idea_id?: string | null
  author_name: string
  content: string
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddCommentInput) => {
      const { data, error } = await supabase
        .from('roadmap_comments')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as RoadmapComment
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(
          variables.feature_id ?? undefined,
          variables.idea_id ?? undefined
        ),
      })
    },
  })
}
