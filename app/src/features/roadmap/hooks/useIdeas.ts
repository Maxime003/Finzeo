import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getFingerprint } from '../lib/fingerprint'
import { toast } from '@/hooks/use-toast'
import type { CommunityIdea, IdeaStatus } from '../types'

const QUERY_KEY = ['community-ideas']

export function useIdeas() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<CommunityIdea[]> => {
      const fp = getFingerprint()

      const { data: ideas, error } = await supabase
        .from('community_ideas')
        .select('*')
        .neq('status', 'rejected')

      if (error) throw error

      const { data: votes, error: votesError } = await supabase
        .from('idea_votes')
        .select('idea_id')

      if (votesError) throw votesError

      const { data: myVotes, error: myVotesError } = await supabase
        .from('idea_votes')
        .select('idea_id')
        .eq('fingerprint', fp)

      if (myVotesError) throw myVotesError

      const voteCounts: Record<string, number> = {}
      for (const vote of votes) {
        voteCounts[vote.idea_id] = (voteCounts[vote.idea_id] ?? 0) + 1
      }

      const myVoteSet = new Set(myVotes.map((v) => v.idea_id))

      return ideas.map((idea) => ({
        ...idea,
        vote_count: voteCounts[idea.id] ?? 0,
        has_voted: myVoteSet.has(idea.id),
      }))
    },
  })
}

interface SubmitIdeaInput {
  title: string
  description: string | null
}

export function useSubmitIdea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SubmitIdeaInput) => {
      const { data, error } = await supabase
        .from('community_ideas')
        .insert({ ...input, status: 'pending' as const })
        .select()
        .single()

      if (error) throw error
      return data as CommunityIdea
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast({
        title: 'Idée soumise !',
        description: 'Elle sera visible après validation.',
      })
    },
  })
}

export function useToggleVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ideaId, hasVoted }: { ideaId: string; hasVoted: boolean }) => {
      const fp = getFingerprint()

      if (hasVoted) {
        const { error } = await supabase
          .from('idea_votes')
          .delete()
          .eq('idea_id', ideaId)
          .eq('fingerprint', fp)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('idea_votes')
          .insert({ idea_id: ideaId, fingerprint: fp })

        if (error) throw error
      }
    },
    onMutate: async ({ ideaId, hasVoted }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      const previous = queryClient.getQueryData<CommunityIdea[]>(QUERY_KEY)

      queryClient.setQueryData<CommunityIdea[]>(QUERY_KEY, (old) =>
        old?.map((idea) =>
          idea.id === ideaId
            ? {
                ...idea,
                vote_count: (idea.vote_count ?? 0) + (hasVoted ? -1 : 1),
                has_voted: !hasVoted,
              }
            : idea
        )
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useAdminIdeas() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'admin'],
    queryFn: async (): Promise<CommunityIdea[]> => {
      const { data: ideas, error } = await supabaseAdmin
        .from('community_ideas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const { data: votes, error: votesError } = await supabaseAdmin
        .from('idea_votes')
        .select('idea_id')

      if (votesError) throw votesError

      const voteCounts: Record<string, number> = {}
      for (const vote of votes) {
        voteCounts[vote.idea_id] = (voteCounts[vote.idea_id] ?? 0) + 1
      }

      return ideas.map((idea) => ({
        ...idea,
        vote_count: voteCounts[idea.id] ?? 0,
      }))
    },
  })
}

export function useUpdateIdeaStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: IdeaStatus }) => {
      const { data, error } = await supabaseAdmin
        .from('community_ideas')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as CommunityIdea
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
