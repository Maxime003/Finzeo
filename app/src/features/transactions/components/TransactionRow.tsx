import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableRow, TableCell } from '@/components/ui/table'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { formatTransactionDate } from '@/lib/utils/date'
import type { Transaction, Category } from '@/types/transaction'

interface TransactionRowProps {
  transaction: Transaction & { category: Category | null }
  onEdit: (transaction: Transaction) => void
}

export function TransactionRow({ transaction, onEdit }: TransactionRowProps) {
  const label = transaction.description || transaction.original_label
  const truncated = label.length > 50 ? `${label.slice(0, 50)}…` : label

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatTransactionDate(transaction.transaction_date)}
      </TableCell>
      <TableCell title={label}>{truncated}</TableCell>
      <TableCell>
        {transaction.category ? (
          <CategoryBadge category={transaction.category} />
        ) : (
          <span className="text-sm text-muted-foreground">Non catégorisé</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <AmountDisplay amount={transaction.amount} />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(transaction)}
          className="h-8 w-8"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Modifier</span>
        </Button>
      </TableCell>
    </TableRow>
  )
}
