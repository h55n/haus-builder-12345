import type { DesignSpec, UserProfile } from '@/types'
import { buildPlannedDesign } from '@/lib/layoutPlanner'

export function buildFallbackDesign(profile: UserProfile): DesignSpec {
  return buildPlannedDesign(profile)
}
