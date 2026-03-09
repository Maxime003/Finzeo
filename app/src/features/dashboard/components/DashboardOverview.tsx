import { TrendingUp, TrendingDown, Wallet, Building2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAmount } from '@/lib/utils/currency'
import { formatTransactionDate } from '@/lib/utils/date'

interface BalanceOverviewProps {
  bankBalance: number
  bankBalanceDate: string | null
  pendingTotal: number
  realBalance: number
  isLoading: boolean
}

interface MonthlyOverviewProps {
  income: number
  expenses: number
  net: number
  isLoading: boolean
}

export function BalanceOverview({
  bankBalance,
  bankBalanceDate,
  pendingTotal,
  realBalance,
  isLoading,
}: BalanceOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solde bancaire</CardTitle>
          <Building2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          {bankBalanceDate ? (
            <>
              <p className="text-2xl font-bold text-blue-600 tabular-nums">
                {formatAmount(bankBalance)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                au {formatTransactionDate(bankBalanceDate)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun relevé importé</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          {pendingTotal !== 0 ? (
            <p className="text-2xl font-bold text-orange-500 tabular-nums">
              {formatAmount(pendingTotal)}
            </p>
          ) : (
            <>
              <p className="text-2xl font-bold tabular-nums text-muted-foreground">0,00 €</p>
              <p className="text-xs text-muted-foreground mt-1">Rien en attente</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solde réel</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-extrabold tabular-nums ${
              realBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatAmount(realBalance)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardOverview({ income, expenses, net, isLoading }: MonthlyOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenus</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600 tabular-nums">
            {formatAmount(income)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600 tabular-nums">
            {formatAmount(Math.abs(expenses))}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solde du mois</CardTitle>
          <Wallet className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold tabular-nums ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {net >= 0 ? '+' : ''}{formatAmount(net)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
