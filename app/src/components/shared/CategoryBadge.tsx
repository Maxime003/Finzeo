import type { Category } from '@/types/transaction'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: Category
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5', className)}
      style={{
        borderColor: category.color,
        backgroundColor: `${category.color}15`,
        color: category.color,
      }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
        aria-hidden
      />
      {category.name}
    </Badge>
  )
}
