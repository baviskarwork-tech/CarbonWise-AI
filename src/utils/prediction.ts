import { CarbonBreakdown, SimulationSliders } from '../types';
import { calculateSimulatedEmissions as engineSimulate, predictFutureEmissions as enginePredict } from '../engine/carbonEngine';

/**
 * Calculates simulated emissions based on reduction slider percentages.
 * Wrapper calling src/engine/carbonEngine.ts.
 */
export function calculateSimulatedEmissions(currentBreakdown: CarbonBreakdown, sliders: SimulationSliders) {
  return engineSimulate(currentBreakdown, sliders);
}

/**
 * Generates a 12-month forecast timeline comparing "Business as Usual" (BAU) with "Eco Plan" execution.
 * Wrapper calling src/engine/carbonEngine.ts.
 */
export function generate12MonthForecast(currentTotalYearly: number, targetReductionPercent: number) {
  return enginePredict(currentTotalYearly, targetReductionPercent);
}
