import { supabase } from '@/lib/supabase'
import type { Category, CategorizationRule } from '@/types/transaction'

// Les noms de catégories doivent correspondre exactement aux catégories par défaut
// créées par create_default_categories() dans le schéma SQL.
// Catégories disponibles : Logement, Charge mensuelle logement, Charge mensuelle,
// Courses, Restauration, Transport, Loisirs, Santé, Hygiène, Éducation, Cadeaux,
// Divers, Vacances, Revenus, Transferts, Non catégorisé
const DEFAULT_PATTERNS: Record<string, string> = {
  deliveroo: 'Restauration',
  'uber eats': 'Restauration',
  carrefour: 'Courses',
  intermarche: 'Courses',
  boulanger: 'Divers',
  'tcl 69': 'Transport',
  'spl ru lyon': 'Transport',
  aprr: 'Transport',
  area: 'Transport',
  coiffure: 'Hygiène',
  ekwateur: 'Charge mensuelle logement',
  edf: 'Charge mensuelle logement',
  engie: 'Charge mensuelle logement',
  totalenergies: 'Charge mensuelle logement',
  'total energies': 'Charge mensuelle logement',
  veolia: 'Charge mensuelle logement',
  suez: 'Charge mensuelle logement',
  'eau du grand lyon': 'Charge mensuelle logement',
  sfr: 'Charge mensuelle',
  orange: 'Charge mensuelle',
  free: 'Charge mensuelle',
  bouygues: 'Charge mensuelle',
  loyer: 'Logement',
  akairo: 'Revenus',
}

function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export type SuggestionSource = 'default' | 'rule' | 'none'

export interface SuggestionResult {
  categoryId?: string
  confidence: number
  source: SuggestionSource
}

export function getSuggestedCategoryId(
  label: string,
  _amount: number,
  categories: Category[],
  userRules: CategorizationRule[]
): SuggestionResult {
  const normalized = normalizeLabel(label)
  if (!normalized) return { confidence: 0, source: 'none' }

  const nameToId = (name: string): string | undefined =>
    categories.find((c) => c.name === name)?.id

  for (const rule of userRules) {
    const pattern = normalizeLabel(rule.pattern)
    if (pattern && normalized.includes(pattern)) {
      return {
        categoryId: rule.category_id,
        confidence: rule.confidence,
        source: 'rule',
      }
    }
  }

  for (const [pattern, categoryName] of Object.entries(DEFAULT_PATTERNS)) {
    if (normalized.includes(pattern)) {
      const id = nameToId(categoryName)
      if (id) return { categoryId: id, confidence: 0.8, source: 'default' }
    }
  }

  return { confidence: 0, source: 'none' }
}

function extractPattern(label: string): string {
  const normalized = normalizeLabel(label)
  if (!normalized) return ''

  let s = normalized
    .replace(/^paiement par carte\s+/, '')
    .replace(/^virement en votre faveur\s+/, '')
    .replace(/^virement emis\s+/, '')
    .replace(/^prelevement\s+/, '')
    .replace(/^cotisation\s+/, '')
    .replace(/^remise cheque\s+/, '')
    .replace(/\b\d{6,}\b/g, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!s) s = normalized

  const words = s.split(' ').filter(Boolean)
  return words.slice(0, 6).join(' ').slice(0, 80)
}

const MIN_PATTERN_LENGTH = 3

export async function learnRule(
  userId: string,
  label: string,
  categoryId: string,
  confidence: number = 1
): Promise<void> {
  const pattern = extractPattern(label)
  if (!pattern || pattern.length < MIN_PATTERN_LENGTH) return

  const { data: existing, error: selectError } = await supabase
    .from('categorization_rules')
    .select('id, usage_count, category_id')
    .eq('user_id', userId)
    .eq('pattern', pattern)
    .order('usage_count', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (selectError) throw selectError

  if (existing) {
    const { error: updateError } = await supabase
      .from('categorization_rules')
      .update({
        category_id: categoryId,
        confidence: Math.min(1, Math.max(confidence, existing.usage_count > 3 ? 0.9 : confidence)),
        usage_count: existing.usage_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    if (updateError) throw updateError
  } else {
    const { error: insertError } = await supabase
      .from('categorization_rules')
      .insert({
        user_id: userId,
        pattern,
        category_id: categoryId,
        confidence,
        usage_count: 1,
      })
    if (insertError) throw insertError
  }
}
