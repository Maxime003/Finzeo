import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useIdeas } from '../hooks/useIdeas'
import { IdeaCard } from '../components/IdeaCard'
import { SubmitIdeaForm } from '../components/SubmitIdeaForm'
import { Lightbulb } from 'lucide-react'

export function IdeasPage() {
  const { data: ideas = [], isLoading } = useIdeas()
  const [formOpen, setFormOpen] = useState(false)

  const sortedIdeas = [...ideas].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Chargement des idées...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Idées de la communauté</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Proposez et votez pour les prochaines fonctionnalités
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Lightbulb className="h-4 w-4 mr-2" />
          Proposer une idée
        </Button>
      </div>

      {sortedIdeas.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <Lightbulb className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune idée pour le moment.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Soyez le premier à proposer une idée !
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sortedIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      <SubmitIdeaForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
