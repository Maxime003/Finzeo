import { format, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatTransactionDate(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM yyyy', { locale: fr })
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: fr })
}

export function getMonthRange(date: Date): { start: string; end: string } {
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}
