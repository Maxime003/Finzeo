import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ParsedCSVResult } from '@/types/csv'
import { CSVUpload } from '@/features/import/components/CSVUpload'
import { ImportSummary } from '@/features/import/components/ImportSummary'
import { useCSVImport } from '@/features/import/hooks/useCSVImport'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function ImportPage() {
  const [result, setResult] = useState<ParsedCSVResult | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { importToDb, isImporting } = useCSVImport()

  const handleParsed = useCallback((parsedResult: ParsedCSVResult, parsedFile: File) => {
    setResult(parsedResult)
    setFile(parsedFile)
  }, [])

  const handleConfirmImport = useCallback(async () => {
    if (!result || !file) return
    try {
      await importToDb(result, file)
      toast({ title: 'Import réussi', description: 'Les transactions ont été importées.' })
      navigate('/app/categorize', { replace: true })
    } catch {
      toast({
        title: 'Erreur d\'import',
        description: 'Impossible d\'enregistrer les transactions. Réessayez.',
        variant: 'destructive',
      })
    }
  }, [result, file, importToDb, toast, navigate])

  const handleReset = useCallback(() => {
    setResult(null)
    setFile(null)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Importer un CSV</h1>
        {result && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            Changer de fichier
          </Button>
        )}
      </div>
      <p className="text-muted-foreground">
        Importez un export de compte Crédit Agricole (format CSV).
      </p>
      {!result ? (
        <CSVUpload onParsed={handleParsed} />
      ) : (
        <ImportSummary
          result={result}
          onConfirm={handleConfirmImport}
          isImporting={isImporting}
        />
      )}
    </div>
  )
}
