import type { Category } from '@/types/transaction'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface CategorySelectorProps {
  categories: Category[]
  value?: string
  onChange: (categoryId: string) => void
  suggestedCategoryId?: string
  placeholder?: string
}

export function CategorySelector({
  categories,
  value,
  onChange,
  suggestedCategoryId,
  placeholder = 'Choisir une catégorie',
}: CategorySelectorProps) {
  const suggestedCategory = suggestedCategoryId
    ? categories.find((c) => c.id === suggestedCategoryId)
    : undefined

  return (
    <div className="space-y-2">
      {suggestedCategory && value !== suggestedCategoryId && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-dashed"
          onClick={() => onChange(suggestedCategoryId!)}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-muted-foreground">Suggestion :</span>
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: suggestedCategory.color }}
            aria-hidden
          />
          <span className="font-medium">{suggestedCategory.name}</span>
        </Button>
      )}
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                  aria-hidden
                />
                <span>{cat.name}</span>
                {suggestedCategoryId === cat.id && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Suggérée
                  </Badge>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
