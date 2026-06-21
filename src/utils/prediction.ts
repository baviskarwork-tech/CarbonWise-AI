import { CarbonBreakdown, SimulationSliders, ForecastPoint } from '../types';

/**
 * Calculates simulated emissions based on reduction slider percentages.
 */
export function calculateSimulatedEmissions(
  currentBreakdown: CarbonBreakdown,
  sliders: SimulationSliders
): {
  simulatedBreakdown: CarbonBreakdown;
  currentTotal: number;
  simulatedTotal: number;
  annualSavings: number;
  percentReduction: number;
  environmentalImpact: {
    treesPlanted: number;
    coalBurnedAvoidedKg: number;
    carMilesAvoided: number;
  };
} {
  const currentTotal = breakdownSum(currentBreakdown.transport) + breakdownSum(currentBreakdown.energy) + breakdownSum(currentBreakdown.food) + breakdownSum(currentBreakdown.waste);
  
  // Transport reduction splits: car reduction slider vs flight reduction slider
  const transportReduced = Math.max(0, currentBreakdown.transport * (1 - sliders.carReduction / 100 * 0.7 - sliders.flightReduction / 100 * 0.3));
  const energyReduced = Math.max(0, currentBreakdown.energy * (1 - sliders.electricityReduction / 100));
  const foodReduced = Math.max(0, currentBreakdown.food * (1 - sliders.meatReduction / 100 * 0.8));
  
  // Waste increase recycling slider: lowers waste emissions
  // As recycling rate increases, waste emissions decrease
  const wasteReduced = Math.max(0, currentBreakdown.waste * (1 - sliders.recyclingIncrease / 100));

  const simulatedBreakdown: CarbonBreakdown = {
    transport: Math.round(transportReduced),
    energy: Math.round(energyReduced),
    food: Math.round(foodReduced),
    waste: Math.round(wasteReduced),
  };

  const simulatedTotal = simulatedBreakdown.transport + simulatedBreakdown.energy + simulatedBreakdown.food + simulatedBreakdown.waste;
  const annualSavings = Math.max(0, currentTotal - simulatedTotal);
  const percentReduction = currentTotal > 0 ? Math.round((annualSavings / currentTotal) * 100) : 0;

  // Environmental Equivalency Math
  // 1 tree absorbs ~22 kg CO2 per year
  const treesPlanted = Math.round((annualSavings / 22) * 10) / 10;
  // 1 kg CO2e is approx. 0.43 kg of coal burned or similar
  const coalBurnedAvoidedKg = Math.round((annualSavings * 0.43) * 10) / 10;
  // 1 mile in average car is ~0.4 kg CO2. So 1 kg CO2 is ~2.5 miles.
  const carMilesAvoided = Math.round(annualSavings * 2.5);

  return {
    simulatedBreakdown,
    currentTotal,
    simulatedTotal,
    annualSavings,
    percentReduction,
    environmentalImpact: {
      treesPlanted,
      coalBurnedAvoidedKg,
      carMilesAvoided,
    },
  };
}

/**
 * Generates a 12-month forecast timeline comparing "Business as Usual" (BAU) with "Eco Plan" execution.
 */
export function generate12MonthForecast(
  currentTotalYearly: number,
  targetReductionPercent: number
): ForecastPoint[] {
  const monthlyBAU = currentTotalYearly / 12;
  const targetMonthlyEmissions = (currentTotalYearly * (1 - targetReductionPercent / 100)) / 12;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month, index) => {
    // BAU increases slightly by season (e.g. winter/summer heating/AC), we'll add a tiny wave for realism
    const seasonalFactor = 1 + Math.sin((index / 11) * Math.PI * 2) * 0.05;
    const bau = Math.round(monthlyBAU * seasonalFactor);
    
    // Predicted emissions decrease linearly from monthlyBAU to targetMonthlyEmissions over 6 months, then stabilize
    const progressFactor = Math.min(1, index / 6); // Fully optimized by month 7
    const predicted = Math.round(
      (monthlyBAU - (monthlyBAU - targetMonthlyEmissions) * progressFactor) * seasonalFactor
    );
    
    return {
      month,
      businessAsUsual: bau,
      predictedEmissions: predicted,
    };
  });
}

function breakdownSum(val: number | undefined): number {
  return val || 0;
}
