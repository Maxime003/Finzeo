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
        amount >= 0 ? 'text-green-600' : 'text-red-600',
        className
      )}
    >
      {amount >= 0 ? '+' : ''}
      {formatAmount(amount)}
    </span>
  )
}
