import { CarbonBreakdown } from '../types';
import { computeSustainabilityScore as engineCompute, SustainabilityGrade } from '../engine/carbonEngine';

/**
 * Calculates a sustainability score from 0 to 100 based on carbon emissions.
 * Wrapper calling src/engine/carbonEngine.ts.
 */
export function calculateSustainabilityScore(breakdown: CarbonBreakdown) {
  return engineCompute(breakdown);
}

/**
 * Get color scheme classes for a given score/grade (UI styling helper).
 */
export function getGradeBadgeColor(grade: SustainabilityGrade): string {
  switch (grade) {
    case 'Excellent':
      return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30';
    case 'Good':
      return 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30';
    case 'Average':
      return 'bg-amber-950/40 text-amber-400 border border-amber-500/30';
    case 'Poor':
      return 'bg-rose-950/40 text-rose-400 border border-rose-500/30';
  }
}
