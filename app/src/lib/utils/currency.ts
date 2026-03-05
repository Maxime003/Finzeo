const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export function formatAmount(amount: number): string {
  return formatter.format(amount)
}

export function formatAmountSigned(amount: number): string {
  if (amount > 0) return `+${formatter.format(amount)}`
  return formatter.format(amount)
}
