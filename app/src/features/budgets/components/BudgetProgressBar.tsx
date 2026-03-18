import { cn } from '@/lib/utils'

interface BudgetProgressBarProps {
  percentage: number
  className?: string
}

export function BudgetProgressBar({ percentage, className }: BudgetProgressBarProps) {
  const clamped = Math.min(percentage, 100)
  const color =
    percentage > 100
      ? 'bg-[#ef4444]'
      : percentage >= 80
        ? 'bg-[#f59e0b]'
        : 'bg-[#22c55e]'

  return (
    <div className={cn('h-2 w-full rounded-full bg-muted', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
