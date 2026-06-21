import { CarbonBreakdown } from '../types';
import { NATIONAL_AVERAGES } from '../constants';

export type SustainabilityGrade = 'Poor' | 'Average' | 'Good' | 'Excellent';

/**
 * Calculates a sustainability score from 0 to 100 based on carbon emissions.
 * Compares actual footprint to regional baselines.
 */
export function calculateSustainabilityScore(breakdown: CarbonBreakdown): {
  score: number;
  grade: SustainabilityGrade;
  breakdownScores: {
    transport: number;
    energy: number;
    food: number;
    waste: number;
  };
} {
  // Sector scores: 100 is net-zero, 50 is national average baseline.
  // Formula: score = Math.max(0, Math.min(100, 100 - (actual / average) * 50))
  // If actual is 0, score is 100. If actual equals average, score is 50. If actual is double average, score is 0.
  
  const transportScore = Math.round(
    Math.max(0, Math.min(100, 100 - (breakdown.transport / NATIONAL_AVERAGES.TRANSPORT) * 50))
  );
  
  const energyScore = Math.round(
    Math.max(0, Math.min(100, 100 - (breakdown.energy / NATIONAL_AVERAGES.ENERGY) * 50))
  );
  
  const foodScore = Math.round(
    Math.max(0, Math.min(100, 100 - (breakdown.food / NATIONAL_AVERAGES.FOOD) * 50))
  );
  
  const wasteScore = Math.round(
    Math.max(0, Math.min(100, 100 - (breakdown.waste / NATIONAL_AVERAGES.WASTE) * 50))
  );

  const averageScore = Math.round((transportScore + energyScore + foodScore + wasteScore) / 4);
  const score = Math.max(0, Math.min(100, averageScore));

  let grade: SustainabilityGrade = 'Average';
  if (score >= 80) {
    grade = 'Excellent';
  } else if (score >= 60) {
    grade = 'Good';
  } else if (score >= 40) {
    grade = 'Average';
  } else {
    grade = 'Poor';
  }

  return {
    score,
    grade,
    breakdownScores: {
      transport: transportScore,
      energy: energyScore,
      food: foodScore,
      waste: wasteScore,
    },
  };
}

/**
 * Get color scheme classes for a given score/grade (useful for tailwind badges)
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
