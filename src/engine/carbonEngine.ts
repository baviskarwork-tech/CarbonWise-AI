import { CalculatorInputs, CarbonBreakdown, ForecastPoint, WeeklyPlanWeek, SimulationSliders } from '../types';
import { EMISSION_FACTORS, NATIONAL_AVERAGES } from '../constants';

export type SustainabilityGrade = 'Poor' | 'Average' | 'Good' | 'Excellent';

export interface ScaledImpact {
  co2SavedTons: number;
  treesPlanted: number;
  coalBurnedAvoidedKg: number;
  homesPoweredYearly: number;
}

/**
 * Calculates the annual carbon emissions (in kg CO2e) for transport, energy, food, and waste.
 * 
 * @param inputs The user's calculator input details
 * @returns An object containing the breakdown by category and total annual emissions
 */
export function calculateCarbonFootprint(inputs: CalculatorInputs): {
  breakdown: CarbonBreakdown;
  totalEmissions: number;
} {
  // 1. Transportation
  const carFuelGallons = inputs.carEfficiency > 0 ? inputs.carMileage / inputs.carEfficiency : 0;
  const carCO2 = carFuelGallons * EMISSION_FACTORS.CO2_PER_GALLON;
  
  const flightsCO2 = (inputs.flightsShort * EMISSION_FACTORS.FLIGHT_SHORT_CO2) +
                      (inputs.flightsLong * EMISSION_FACTORS.FLIGHT_LONG_CO2);
                      
  const publicTransportCO2 = inputs.publicTransportHours * 52 * EMISSION_FACTORS.PUBLIC_TRANS_CO2_PER_HOUR;
  const transportTotal = carCO2 + flightsCO2 + publicTransportCO2;

  // 2. Energy
  const electricityCO2 = inputs.electricityBill * 12 * EMISSION_FACTORS.ELECTRICITY_CO2_PER_USD;
  const gasCO2 = inputs.gasBill * 12 * EMISSION_FACTORS.GAS_CO2_PER_USD;
  const energyTotal = electricityCO2 + gasCO2;

  // 3. Food
  const meatCO2 = inputs.meatDays * EMISSION_FACTORS.MEAT_DIET_CO2_PER_DAY_WEEKLY;
  const dairyCO2 = inputs.dairyDays * EMISSION_FACTORS.DAIRY_DIET_CO2_PER_DAY_WEEKLY;
  const foodTotal = meatCO2 + dairyCO2;

  // 4. Waste
  const wasteBase = EMISSION_FACTORS.BASE_WASTE_CO2_YEARLY;
  const wasteOffset = Math.min(100, Math.max(0, inputs.recyclingRate)) * EMISSION_FACTORS.RECYCLING_OFFSET_PER_PERCENT;
  const wasteTotal = Math.max(0, wasteBase - wasteOffset);

  const breakdown: CarbonBreakdown = {
    transport: Math.round(transportTotal),
    energy: Math.round(energyTotal),
    food: Math.round(foodTotal),
    waste: Math.round(wasteTotal),
  };

  const totalEmissions = breakdown.transport + breakdown.energy + breakdown.food + breakdown.waste;

  return {
    breakdown,
    totalEmissions,
  };
}

/**
 * Computes the sustainability index score (0-100) and grade badge relative to national baselines.
 * 
 * @param breakdown The user's category-wise carbon breakdown
 * @returns An object with the overall score, grade, and individual category scores
 */
export function computeSustainabilityScore(breakdown: CarbonBreakdown): {
  score: number;
  grade: SustainabilityGrade;
  breakdownScores: {
    transport: number;
    energy: number;
    food: number;
    waste: number;
  };
} {
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
 * Runs simulation sliders calculations to forecast projected footprint totals.
 * 
 * @param currentBreakdown The current category emissions
 * @param sliders The reduction/increase percentages from sliders
 * @returns The simulated breakdown, simulated totals, and environmental equivalents
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
  const currentTotal = (currentBreakdown.transport || 0) + (currentBreakdown.energy || 0) + (currentBreakdown.food || 0) + (currentBreakdown.waste || 0);
  
  const transportReduced = Math.max(0, currentBreakdown.transport * (1 - (sliders.carReduction / 100) * 0.7 - (sliders.flightReduction / 100) * 0.3));
  const energyReduced = Math.max(0, currentBreakdown.energy * (1 - sliders.electricityReduction / 100));
  const foodReduced = Math.max(0, currentBreakdown.food * (1 - (sliders.meatReduction / 100) * 0.8));
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

  const treesPlanted = Math.round((annualSavings / 22) * 10) / 10;
  const coalBurnedAvoidedKg = Math.round((annualSavings * 0.43) * 10) / 10;
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
 * Extrapolates future emissions and generates a 12-month comparison forecast timeline.
 * 
 * @param currentTotalYearly The user's total annual footprint
 * @param targetReductionPercent The targeted reduction percentage (e.g. 10%, 25%, 50%)
 * @returns An array of ForecastPoints comparing BAU and Eco targets
 */
export function predictFutureEmissions(
  currentTotalYearly: number,
  targetReductionPercent: number
): ForecastPoint[] {
  const monthlyBAU = currentTotalYearly / 12;
  const targetMonthlyEmissions = (currentTotalYearly * (1 - targetReductionPercent / 100)) / 12;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month, index) => {
    const seasonalFactor = 1 + Math.sin((index / 11) * Math.PI * 2) * 0.05;
    const bau = Math.round(monthlyBAU * seasonalFactor);
    const progressFactor = Math.min(1, index / 6);
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

/**
 * Simulates real-world environmental and climate offset impact if scaled up to a community or city level.
 * 
 * @param annualSavings The carbon savings achieved by a single user (in kg CO2e)
 * @param scaleMultiplier The number of participants scaling the action (e.g. 10,000, 1,000,000)
 * @returns Scaled metrics showing total CO2 saved, trees grown, coal avoided, and homes powered
 */
export function simulateGlobalImpact(
  annualSavings: number,
  scaleMultiplier: number
): ScaledImpact {
  const totalSavedKg = annualSavings * scaleMultiplier;
  const co2SavedTons = Math.round((totalSavedKg / 1000) * 10) / 10;
  const treesPlanted = Math.round((totalSavedKg / 22) * 10) / 10;
  const coalBurnedAvoidedKg = Math.round((totalSavedKg * 0.43) * 10) / 10;
  const homesPoweredYearly = Math.round((totalSavedKg / 7500) * 10) / 10;

  return {
    co2SavedTons,
    treesPlanted,
    coalBurnedAvoidedKg,
    homesPoweredYearly,
  };
}

/**
 * Generates an actionable 4-week carbon reduction checklist tailored to user emissions breakdown.
 * 
 * @param footprintData The user's category-wise carbon breakdown
 * @returns A structured list of weekly plans and expected savings per action
 */
export function generateReductionPlan(
  footprintData: CarbonBreakdown
): WeeklyPlanWeek[] {
  const transportEmissions = footprintData.transport || 5200;
  const energyEmissions = footprintData.energy || 4500;
  const foodEmissions = footprintData.food || 3500;
  const wasteEmissions = footprintData.waste || 2800;

  return [
    {
      weekNumber: 1,
      tasks: [
        {
          id: 'task-w1-1',
          action: transportEmissions > 2000
            ? 'Transition to train or electric bus commuting for trips exceeding 5 miles'
            : 'Combine errand trips and optimize route schedules to save vehicle mileage',
          expectedSavings: Math.round((transportEmissions * 0.08) / 4),
          difficulty: 'Easy',
          completed: false,
        },
        {
          id: 'task-w1-2',
          action: 'Audit household appliances and unplug vampire loads during sleeping hours',
          expectedSavings: Math.round((energyEmissions * 0.03) / 4),
          difficulty: 'Easy',
          completed: false,
        }
      ]
    },
    {
      weekNumber: 2,
      tasks: [
        {
          id: 'task-w2-1',
          action: foodEmissions > 1500
            ? 'Adopt meat-free lunches on weekdays (incorporate lentils, beans, and grains)'
            : 'Reduce dairy milk consumption and select oat or almond replacements',
          expectedSavings: Math.round((foodEmissions * 0.12) / 4),
          difficulty: 'Easy',
          completed: false,
        },
        {
          id: 'task-w2-2',
          action: 'Adjust smart thermostat heating controls down by 2°F during winter peak months',
          expectedSavings: Math.round((energyEmissions * 0.07) / 4),
          difficulty: 'Medium',
          completed: false,
        }
      ]
    },
    {
      weekNumber: 3,
      tasks: [
        {
          id: 'task-w3-1',
          action: transportEmissions > 3000
            ? 'Replace a solo drive commute with public transit or walking twice per week'
            : 'Keep car tires inflated to optimal pressure to improve fuel mileage efficiency',
          expectedSavings: Math.round((transportEmissions * 0.12) / 4),
          difficulty: 'Medium',
          completed: false,
        },
        {
          id: 'task-w3-2',
          action: 'Swap five highly active incandescent lighting fixtures for energy saver LEDs',
          expectedSavings: Math.round((energyEmissions * 0.05) / 4),
          difficulty: 'Easy',
          completed: false,
        }
      ]
    },
    {
      weekNumber: 4,
      tasks: [
        {
          id: 'task-w4-1',
          action: wasteEmissions > 1000
            ? 'Introduce kitchen organic composting bins to divert waste organic scraps'
            : 'Purchase products in bulk packaging and refuse single-use coffee cups',
          expectedSavings: Math.round((wasteEmissions * 0.25) / 4),
          difficulty: 'Medium',
          completed: false,
        },
        {
          id: 'task-w4-2',
          action: 'Configure home water heater tank temperature settings strictly down to 120°F',
          expectedSavings: Math.round((energyEmissions * 0.05) / 4),
          difficulty: 'Easy',
          completed: false,
        }
      ]
    }
  ];
}

/**
 * Compares user footprint values against regional and global benchmark averages.
 * 
 * @param totalEmissions The user's total carbon footprint (in kg CO2e/year)
 * @param region The user's comparison region ('US', 'Europe', 'Global')
 * @returns Benchmark data, ratio comparisons, and calculated percentile rankings
 */
export function compareAgainstBenchmarks(
  totalEmissions: number,
  region: string = 'US'
): {
  regionalAverage: number;
  globalAverage: number;
  percentileRank: number;
  comparisonRatio: number;
} {
  const regionalAverage = region === 'Europe' ? 6400 : region === 'Global' ? 4000 : 16000;
  const globalAverage = 4000;
  const comparisonRatio = Math.round((totalEmissions / regionalAverage) * 100) / 100;
  
  // High emissions means low percentile. Net zero means 99th percentile.
  let percentileRank = 100 - (totalEmissions / (regionalAverage * 2)) * 100;
  percentileRank = Math.max(5, Math.min(99, Math.round(percentileRank)));
  
  return {
    regionalAverage,
    globalAverage,
    percentileRank,
    comparisonRatio,
  };
}

/**
 * Project target Net-Zero deadlines based on annual savings trajectories.
 * 
 * @param currentTotalYearly The user's starting total carbon emissions
 * @param annualSavings The simulated or real annual reduction savings
 * @returns Calculated target years, total years to net-zero, and monthly reductions needed
 */
export function calculateNetZeroDate(
  currentTotalYearly: number,
  annualSavings: number
): {
  targetYear: number;
  yearsToNetZero: number;
  monthlyReductionNeeded: number;
} {
  const currentYear = new Date().getFullYear();
  const yearsToNetZero = annualSavings > 0 ? Math.max(1, Math.min(50, Math.round(currentTotalYearly / annualSavings))) : 50;
  const targetYear = currentYear + yearsToNetZero;
  const targetYears = 10; // Standard climate horizon goal
  const monthlyReductionNeeded = Math.round((currentTotalYearly / targetYears) / 12);

  return {
    targetYear,
    yearsToNetZero,
    monthlyReductionNeeded,
  };
}
