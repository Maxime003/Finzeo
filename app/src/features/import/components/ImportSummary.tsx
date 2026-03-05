import type { ParsedCSVResult } from '@/types/csv'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ImportSummaryProps {
  result: ParsedCSVResult
  onConfirm: () => void
  isImporting?: boolean
}

function formatDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'd MMMM yyyy', { locale: fr })
  } catch {
    return isoDate
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function ImportSummary({
  result,
  onConfirm,
  isImporting = false,
}: ImportSummaryProps) {
  const { metadata, transactions } = result

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Résumé avant import</h2>
        <p className="text-sm text-muted-foreground">
          Vérifiez les informations puis lancez l'import.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Compte</dt>
            <dd className="font-medium">{metadata.accountName}</dd>
          </div>
          {metadata.accountHolder && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Titulaire</dt>
              <dd>{metadata.accountHolder}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Période</dt>
            <dd>
              {formatDate(metadata.periodStart)} – {formatDate(metadata.periodEnd)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Solde au téléchargement</dt>
            <dd className="font-medium">{formatCurrency(metadata.balance)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Date du fichier</dt>
            <dd>{formatDate(metadata.downloadDate)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2">
            <dt className="text-muted-foreground">Nombre de transactions</dt>
            <dd className="font-semibold">{transactions.length}</dd>
          </div>
        </dl>
        <Button
          className="w-full"
          onClick={onConfirm}
          disabled={isImporting}
        >
          {isImporting ? 'Import en cours...' : 'Importer en base'}
        </Button>
      </CardContent>
    </Card>
  )
}
