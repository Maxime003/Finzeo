import { formatAmount } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'

interface AmountDisplayProps {
  amount: number
  className?: string
}

export function AmountDisplay({ amount, className }: AmountDisplayProps) {
  return (
    <span
      className={cn(
        'tabular-nums font-medium',
        amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
        className
      )}
    >
      {amount >= 0 ? '+' : ''}
      {formatAmount(amount)}
    </span>
  )
}
