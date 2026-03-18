import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useCategories } from '@/features/categorization/hooks/useCategories'
import { formatAmount } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import { useDeleteBudget } from '../hooks/useBudgets'
import { BudgetProgressBar } from './BudgetProgressBar'
import { BudgetForm } from './BudgetForm'
import type { BudgetWithSpending } from '../types'

interface BudgetCardProps {
  budget: BudgetWithSpending
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const deleteBudget = useDeleteBudget()
  const { categories } = useCategories('expense')
  const catColor =
    categories.find((c) => c.name === budget.category)?.color ?? '#6b7280'

  const isOver = budget.remaining < 0

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-4 space-y-3">
          {/* Header: category badge + actions */}
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={{
                borderColor: catColor,
                backgroundColor: `${catColor}15`,
                color: catColor,
              }}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: catColor }}
                aria-hidden
              />
              {budget.category}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce budget ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Le budget « {budget.category} » sera définitivement
                      supprimé. Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteBudget.mutate(budget.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Amount line */}
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-semibold tabular-nums">
              {formatAmount(budget.spent)}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              / {formatAmount(budget.amount)}
            </span>
          </div>

          {/* Progress bar */}
          <BudgetProgressBar percentage={budget.percentage} />

          {/* Remaining + percentage */}
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                'font-medium',
                isOver ? 'text-[#ef4444]' : 'text-[#22c55e]'
              )}
            >
              {isOver
                ? `Dépassé de ${formatAmount(Math.abs(budget.remaining))}`
                : `${formatAmount(budget.remaining)} restant`}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {Math.round(budget.percentage)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <BudgetForm
        open={editOpen}
        onOpenChange={setEditOpen}
        editCategory={budget.category}
        editAmount={budget.amount}
      />
    </>
  )
}
