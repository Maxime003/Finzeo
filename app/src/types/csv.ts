export interface ParsedCSVRow {
  date: string // YYYY-MM-DD
  label: string
  debit?: number
  credit?: number
}

export interface CSVMetadata {
  downloadDate: string // YYYY-MM-DD
  accountName: string
  accountNumber: string
  balance: number
  periodStart: string // YYYY-MM-DD
  periodEnd: string // YYYY-MM-DD
  accountHolder?: string
}

export interface ParsedCSVResult {
  metadata: CSVMetadata
  transactions: ParsedCSVRow[]
}
