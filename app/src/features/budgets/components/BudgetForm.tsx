import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/features/categorization/hooks/useCategories'
import { useUpsertBudget } from '../hooks/useBudgets'

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editCategory?: string
  editAmount?: number
}

export function BudgetForm({
  open,
  onOpenChange,
  editCategory,
  editAmount,
}: BudgetFormProps) {
  const isEditing = !!editCategory
  const [category, setCategory] = useState(editCategory ?? '')
  const [amount, setAmount] = useState(editAmount?.toString() ?? '')
  const { categories } = useCategories('expense')
  const upsert = useUpsertBudget()

  function handleOpenChange(value: boolean) {
    if (!value) {
      setCategory(editCategory ?? '')
      setAmount(editAmount?.toString() ?? '')
    }
    onOpenChange(value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!category || !parsed || parsed < 1) return

    upsert.mutate(
      { category, amount: parsed },
      {
        onSuccess: () => handleOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le budget' : 'Ajouter un budget'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Catégorie</Label>
            {isEditing ? (
              <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      categories.find((c) => c.name === editCategory)?.color ??
                      '#6b7280',
                  }}
                  aria-hidden
                />
                {editCategory}
              </div>
            ) : (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisis une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: cat.color }}
                          aria-hidden
                        />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-amount">Montant mensuel (€)</Label>
            <Input
              id="budget-amount"
              type="number"
              min="1"
              step="1"
              placeholder="300"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!category || !amount || Number(amount) < 1 || upsert.isPending}
            >
              {upsert.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
