export const ROADMAP_STATUSES = [
  { id: 'idea' as const, label: 'Idées', color: '#8b5cf6' },
  { id: 'todo' as const, label: 'À faire', color: '#f59e0b' },
  { id: 'in_progress' as const, label: 'En cours', color: '#3b82f6' },
  { id: 'done' as const, label: 'Terminé', color: '#22c55e' },
  { id: 'blocked' as const, label: 'Bloqué', color: '#ef4444' },
]

export const CATEGORY_COLORS: Record<string, string> = {
  'Logement': '#1e40af',
  'Charge mensuelle logement': '#2563eb',
  'Charge mensuelle': '#eab308',
  'Courses': '#16a34a',
  'Restauration': '#ea580c',
  'Transport': '#0ea5e9',
  'Loisirs': '#dc2626',
  'Santé': '#06b6d4',
  'Hygiène': '#d946ef',
  'Éducation': '#6366f1',
  'Cadeaux': '#f43f5e',
  'Divers': '#6b7280',
  'Vacances': '#0d9488',
  'Revenus': '#059669',
  'Transferts': '#9ca3af',
  'Non catégorisé': '#9ca3af',
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#ef4444',
}
