import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAmount } from '@/lib/utils/currency'

interface CategoryExpense {
  category_id: string
  name: string
  color: string
  icon: string
  total: number
}

interface TopCategoriesProps {
  categories: CategoryExpense[]
  isLoading: boolean
}

export function TopCategories({ categories, isLoading }: TopCategoriesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top dépenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const maxAbsolute = categories.length > 0 ? Math.abs(categories[0].total) : 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top dépenses</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune dépense catégorisée ce mois.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => {
              const pct = (Math.abs(cat.total) / maxAbsolute) * 100
              return (
                <div key={cat.category_id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                        aria-hidden
                      />
                      <span className="font-medium">{cat.name}</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatAmount(Math.abs(cat.total))}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
