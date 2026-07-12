import type { Application } from '@/types'

export const AUTO_APPROVAL_CONFIDENCE_THRESHOLD = 0.95

// Average confidence across an application's decision packages, on a 0-1 scale.
export function averageConfidence(a: Application): number | null {
  if (a.decisionPackages.length === 0) return null
  const sum = a.decisionPackages.reduce((total, pkg) => total + pkg.confidence, 0)
  return sum / a.decisionPackages.length
}

// AI-decisioned = autonomy-eligible, no human ever touched a decision package,
// and the AI's own confidence met the auto-approval bar.
export function isAiDecisioned(a: Application): boolean {
  const confidence = averageConfidence(a)
  return a.autonomyEligible && a.overrides.length === 0 && confidence !== null && confidence >= AUTO_APPROVAL_CONFIDENCE_THRESHOLD
}
