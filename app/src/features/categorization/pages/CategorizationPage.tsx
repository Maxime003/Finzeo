import { CategorizationFlow } from '@/features/categorization/components/CategorizationFlow'

export function CategorizationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Catégorisation</h1>
      <CategorizationFlow />
    </div>
  )
}
