import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CommentSection } from './CommentSection'
import { useToggleVote } from '../hooks/useIdeas'
import type { CommunityIdea } from '../types'

interface IdeaCardProps {
  idea: CommunityIdea
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'En attente de validation',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  approved: {
    label: 'Approuvée',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  merged: {
    label: 'Intégré',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const toggleVote = useToggleVote()
  const statusBadge = STATUS_BADGES[idea.status]

  const handleVote = () => {
    toggleVote.mutate({ ideaId: idea.id, hasVoted: idea.has_voted ?? false })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">{idea.title}</h3>
          {idea.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {idea.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <Button
            variant={idea.has_voted ? 'default' : 'outline'}
            size="sm"
            onClick={handleVote}
            disabled={toggleVote.isPending}
            className={cn(
              'h-9 w-9 p-0',
              idea.has_voted && 'bg-indigo-600 hover:bg-indigo-700'
            )}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium tabular-nums">{idea.vote_count ?? 0}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {statusBadge && (
          <Badge variant="outline" className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          {new Date(idea.created_at).toLocaleDateString('fr-FR')}
        </span>
      </div>

      <CommentSection ideaId={idea.id} collapsible />
    </div>
  )
}
