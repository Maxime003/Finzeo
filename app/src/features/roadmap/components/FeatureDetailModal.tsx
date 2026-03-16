import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CommentSection } from './CommentSection'
import { ROADMAP_STATUSES, CATEGORY_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../constants'
import type { RoadmapFeature } from '../types'

interface FeatureDetailModalProps {
  feature: RoadmapFeature | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeatureDetailModal({ feature, open, onOpenChange }: FeatureDetailModalProps) {
  if (!feature) return null

  const statusConfig = ROADMAP_STATUSES.find((s) => s.id === feature.status)
  const categoryColor = CATEGORY_COLORS[feature.category] ?? '#6b7280'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge
              style={{ backgroundColor: categoryColor, color: '#fff', borderColor: categoryColor }}
            >
              {feature.category}
            </Badge>
            {statusConfig && (
              <Badge
                style={{
                  backgroundColor: `${statusConfig.color}20`,
                  color: statusConfig.color,
                  borderColor: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </Badge>
            )}
            <Badge
              style={{
                backgroundColor: `${PRIORITY_COLORS[feature.priority]}20`,
                color: PRIORITY_COLORS[feature.priority],
                borderColor: PRIORITY_COLORS[feature.priority],
              }}
            >
              {PRIORITY_LABELS[feature.priority]}
            </Badge>
          </div>
          <DialogTitle>{feature.title}</DialogTitle>
          {feature.description && (
            <DialogDescription className="whitespace-pre-wrap">
              {feature.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="mt-4">
          <CommentSection featureId={feature.id} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
