export type FeatureStatus = 'idea' | 'todo' | 'in_progress' | 'done' | 'blocked'
export type FeaturePriority = 'low' | 'medium' | 'high'
export type IdeaStatus = 'pending' | 'approved' | 'rejected' | 'merged'

export interface RoadmapFeature {
  id: string
  title: string
  description: string | null
  status: FeatureStatus
  category: string
  priority: FeaturePriority
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CommunityIdea {
  id: string
  title: string
  description: string | null
  status: IdeaStatus
  created_at: string
  vote_count?: number
  has_voted?: boolean
}

export interface RoadmapComment {
  id: string
  feature_id: string | null
  idea_id: string | null
  author_name: string
  content: string
  created_at: string
}
