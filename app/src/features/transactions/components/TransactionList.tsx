import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TransactionRow } from './TransactionRow'
import type { Transaction, Category } from '@/types/transaction'

type TransactionWithCategory = Transaction & { category: Category | null }

interface TransactionListProps {
  transactions: TransactionWithCategory[]
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (transaction: Transaction) => void
  isLoading: boolean
}

export function TransactionList({
  transactions,
  totalCount,
  page,
  totalPages,
  onPageChange,
  onEdit,
  isLoading,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Chargement des transactions…
      </div>
    )
  }

  if (totalCount === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-4">
          Aucune transaction pour cette période.
        </p>
        <Link
          to="/app/import"
          className="text-primary underline hover:no-underline"
        >
          Importer un relevé bancaire
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[160px]">Catégorie</TableHead>
            <TableHead className="w-[120px] text-right">Montant</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TransactionRow key={t.id} transaction={t} onEdit={onEdit} />
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
