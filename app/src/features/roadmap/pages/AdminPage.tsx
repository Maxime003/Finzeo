import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useAdminFeatures,
  useCreateFeature,
  useUpdateFeature,
  useDeleteFeature,
} from '../hooks/useFeatures'
import { useAdminIdeas, useUpdateIdeaStatus } from '../hooks/useIdeas'
import { ROADMAP_STATUSES, CATEGORY_COLORS, PRIORITY_LABELS } from '../constants'
import type { RoadmapFeature, FeatureStatus, FeaturePriority, CommunityIdea } from '../types'
import { Pencil, Trash2, Plus, Check, X, ArrowUpRight } from 'lucide-react'

const CATEGORIES = Object.keys(CATEGORY_COLORS)

export function AdminPage() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.is_admin !== true) {
        navigate('/')
      } else {
        setAuthorized(true)
      }
    })
  }, [navigate])

  if (!authorized) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Administration Roadmap</h1>

      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="ideas">Idées communautaires</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <FeaturesTab />
        </TabsContent>

        <TabsContent value="ideas">
          <IdeasTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Features Tab ────────────────────────────────────────

function FeaturesTab() {
  const { data: features = [], isLoading } = useAdminFeatures()
  const createFeature = useCreateFeature()
  const updateFeature = useUpdateFeature()
  const deleteFeature = useDeleteFeature()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<RoadmapFeature | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formStatus, setFormStatus] = useState<FeatureStatus>('todo')
  const [formCategory, setFormCategory] = useState(CATEGORIES[0])
  const [formPriority, setFormPriority] = useState<FeaturePriority>('medium')

  const openCreate = () => {
    setEditingFeature(null)
    setFormTitle('')
    setFormDescription('')
    setFormStatus('todo')
    setFormCategory(CATEGORIES[0])
    setFormPriority('medium')
    setDialogOpen(true)
  }

  const openEdit = (f: RoadmapFeature) => {
    setEditingFeature(f)
    setFormTitle(f.title)
    setFormDescription(f.description ?? '')
    setFormStatus(f.status)
    setFormCategory(f.category)
    setFormPriority(f.priority)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formTitle.trim()) return

    if (editingFeature) {
      updateFeature.mutate(
        {
          id: editingFeature.id,
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
          category: formCategory,
          priority: formPriority,
        },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createFeature.mutate(
        {
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
          category: formCategory,
          priority: formPriority,
        },
        { onSuccess: () => setDialogOpen(false) }
      )
    }
  }

  const handleStatusChange = (id: string, status: FeatureStatus) => {
    updateFeature.mutate({ id, status })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteFeature.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-8">Chargement...</p>
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle feature
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
              <TableHead className="hidden sm:table-cell">Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((f) => {
              const catColor = CATEGORY_COLORS[f.category] ?? '#6b7280'
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-medium text-sm">{f.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      className="text-[10px]"
                      style={{
                        backgroundColor: `${catColor}20`,
                        color: catColor,
                        borderColor: catColor,
                      }}
                    >
                      {f.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {PRIORITY_LABELS[f.priority]}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={f.status}
                      onValueChange={(v) => handleStatusChange(f.id, v as FeatureStatus)}
                    >
                      <SelectTrigger className="h-7 text-xs w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROADMAP_STATUSES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(f)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(f.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {features.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                  Aucune feature
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFeature ? 'Modifier la feature' : 'Nouvelle feature'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as FeatureStatus)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROADMAP_STATUSES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as FeaturePriority)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formTitle.trim() || createFeature.isPending || updateFeature.isPending}
            >
              {editingFeature ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette feature ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La feature sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Ideas Tab ────────────────────────────────────────

const IDEA_STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  approved: { label: 'Approuvée', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  rejected: { label: 'Rejetée', className: 'bg-red-100 text-red-800 border-red-300' },
  merged: { label: 'Intégré', className: 'bg-green-100 text-green-800 border-green-300' },
}

function IdeasTab() {
  const { data: ideas = [], isLoading } = useAdminIdeas()
  const updateStatus = useUpdateIdeaStatus()
  const createFeature = useCreateFeature()

  const [mergeIdea, setMergeIdea] = useState<CommunityIdea | null>(null)
  const [mergeTitle, setMergeTitle] = useState('')
  const [mergeDescription, setMergeDescription] = useState('')
  const [mergeCategory, setMergeCategory] = useState(CATEGORIES[0])
  const [mergePriority, setMergePriority] = useState<FeaturePriority>('medium')

  const openMerge = (idea: CommunityIdea) => {
    setMergeIdea(idea)
    setMergeTitle(idea.title)
    setMergeDescription(idea.description ?? '')
    setMergeCategory(CATEGORIES[0])
    setMergePriority('medium')
  }

  const handleMerge = () => {
    if (!mergeIdea || !mergeTitle.trim()) return

    createFeature.mutate(
      {
        title: mergeTitle.trim(),
        description: mergeDescription.trim() || null,
        status: 'todo',
        category: mergeCategory,
        priority: mergePriority,
      },
      {
        onSuccess: () => {
          updateStatus.mutate({ id: mergeIdea.id, status: 'merged' })
          setMergeIdea(null)
        },
      }
    )
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-8">Chargement...</p>
  }

  return (
    <div className="space-y-4 mt-4">
      {ideas.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune idée soumise</p>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => {
            const badge = IDEA_STATUS_BADGES[idea.status]
            return (
              <div key={idea.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{idea.title}</h3>
                      {badge && (
                        <Badge variant="outline" className={badge.className}>
                          {badge.label}
                        </Badge>
                      )}
                    </div>
                    {idea.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {idea.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{idea.vote_count ?? 0} votes</span>
                      <span>{new Date(idea.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {idea.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-green-600 hover:text-green-700"
                          onClick={() => updateStatus.mutate({ id: idea.id, status: 'approved' })}
                          disabled={updateStatus.isPending}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-700"
                          onClick={() => updateStatus.mutate({ id: idea.id, status: 'rejected' })}
                          disabled={updateStatus.isPending}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    {idea.status === 'approved' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-700"
                          onClick={() => updateStatus.mutate({ id: idea.id, status: 'rejected' })}
                          disabled={updateStatus.isPending}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Rejeter
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-indigo-600 hover:text-indigo-700"
                          onClick={() => openMerge(idea)}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                          Intégrer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Merge Dialog */}
      <Dialog open={!!mergeIdea} onOpenChange={(open) => !open && setMergeIdea(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Intégrer comme feature</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={mergeTitle} onChange={(e) => setMergeTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={mergeDescription}
                onChange={(e) => setMergeDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={mergeCategory} onValueChange={setMergeCategory}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={mergePriority} onValueChange={(v) => setMergePriority(v as FeaturePriority)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeIdea(null)}>
              Annuler
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!mergeTitle.trim() || createFeature.isPending}
            >
              Créer la feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
