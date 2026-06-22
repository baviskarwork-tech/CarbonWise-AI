import { CalculatorInputs, CarbonBreakdown } from '../types';
import { calculateCarbonFootprint as engineCalculate } from '../engine/carbonEngine';

/**
 * Calculates the annual carbon emissions (in kg CO2e) for transport, energy, food, and waste.
 * Wrapper calling src/engine/carbonEngine.ts.
 */
export function calculateCarbonFootprint(inputs: CalculatorInputs): {
  breakdown: CarbonBreakdown;
  totalEmissions: number;
} {
  return engineCalculate(inputs);
}
