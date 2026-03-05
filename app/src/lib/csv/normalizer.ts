import type { ParsedCSVRow } from '@/types/csv'

type ExistingTransaction = {
  transaction_date: string
  amount: number
  original_label: string
}

/**
 * Détecte les transactions en doublon.
 * Critères : même date + même montant (exact) + même libellé (40 premiers caractères normalisés).
 */
export function detectDuplicates(
  newTransactions: ParsedCSVRow[],
  existingTransactions: ExistingTransaction[]
): {
  unique: ParsedCSVRow[]
  duplicates: ParsedCSVRow[]
} {
  const unique: ParsedCSVRow[] = []
  const duplicates: ParsedCSVRow[] = []

  for (const newTx of newTransactions) {
    const amount = newTx.debit ? -newTx.debit : newTx.credit ?? 0
    const labelPrefix = newTx.label.slice(0, 40).toLowerCase()

    const isDuplicate = existingTransactions.some((existing) => {
      const sameDate = existing.transaction_date === newTx.date
      const sameAmount = Math.abs(existing.amount - amount) < 0.01
      const sameLabel =
        existing.original_label.slice(0, 40).toLowerCase() === labelPrefix

      return sameDate && sameAmount && sameLabel
    })

    if (isDuplicate) {
      duplicates.push(newTx)
    } else {
      unique.push(newTx)
    }
  }

  return { unique, duplicates }
}
