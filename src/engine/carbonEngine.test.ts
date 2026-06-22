import { 
  calculateCarbonFootprint, 
  computeSustainabilityScore, 
  calculateSimulatedEmissions, 
  predictFutureEmissions, 
  simulateGlobalImpact, 
  generateReductionPlan, 
  compareAgainstBenchmarks, 
  calculateNetZeroDate 
} from './carbonEngine';
import { CalculatorInputs, CarbonBreakdown, SimulationSliders } from '../types';

describe('Carbon Engine Core System', () => {
  const sampleInputs: CalculatorInputs = {
    carMileage: 12000,
    carEfficiency: 30,
    flightsShort: 4,
    flightsLong: 2,
    publicTransportHours: 8,
    electricityBill: 120,
    gasBill: 60,
    meatDays: 5,
    dairyDays: 6,
    recyclingRate: 70,
  };

  const sampleBreakdown: CarbonBreakdown = {
    transport: 4000,
    energy: 3000,
    food: 2000,
    waste: 600,
  };

  describe('1. calculateCarbonFootprint', () => {
    test('computes correct emissions breakdown for transport, energy, food, and waste', () => {
      const result = calculateCarbonFootprint(sampleInputs);
      expect(result.totalEmissions).toBeGreaterThan(0);
      expect(result.breakdown.transport).toBeGreaterThan(0);
      expect(result.breakdown.energy).toBeGreaterThan(0);
      expect(result.breakdown.food).toBeGreaterThan(0);
      expect(result.breakdown.waste).toBeGreaterThan(0);
    });

    test('handles zero values without crash', () => {
      const zeroInputs: CalculatorInputs = {
        carMileage: 0, carEfficiency: 0, flightsShort: 0, flightsLong: 0,
        publicTransportHours: 0, electricityBill: 0, gasBill: 0, meatDays: 0,
        dairyDays: 0, recyclingRate: 0
      };
      const result = calculateCarbonFootprint(zeroInputs);
      expect(result.breakdown.transport).toBe(0);
      expect(result.breakdown.energy).toBe(0);
      expect(result.breakdown.food).toBe(0);
      expect(result.breakdown.waste).toBe(900); // base waste emissions with 0% recycling
    });
  });

  describe('2. computeSustainabilityScore', () => {
    test('assigns score of 50 for national average baseline emissions', () => {
      const baseline: CarbonBreakdown = { transport: 5200, energy: 4500, food: 3500, waste: 2800 };
      const result = computeSustainabilityScore(baseline);
      expect(result.score).toBe(50);
      expect(result.grade).toBe('Average');
    });

    test('assigns score of 100 for net-zero emissions', () => {
      const zero: CarbonBreakdown = { transport: 0, energy: 0, food: 0, waste: 0 };
      const result = computeSustainabilityScore(zero);
      expect(result.score).toBe(100);
      expect(result.grade).toBe('Excellent');
    });

    test('assigns score of 0 for extremely high emissions', () => {
      const high: CarbonBreakdown = { transport: 20000, energy: 20000, food: 20000, waste: 20000 };
      const result = computeSustainabilityScore(high);
      expect(result.score).toBe(0);
      expect(result.grade).toBe('Poor');
    });
  });

  describe('3. calculateSimulatedEmissions', () => {
    const sliders: SimulationSliders = {
      carReduction: 20,
      flightReduction: 10,
      electricityReduction: 30,
      meatReduction: 40,
      recyclingIncrease: 50,
    };

    test('applies reduction percentages to categories correctly', () => {
      const result = calculateSimulatedEmissions(sampleBreakdown, sliders);
      expect(result.simulatedTotal).toBeLessThan(result.currentTotal);
      expect(result.annualSavings).toBeGreaterThan(0);
      expect(result.percentReduction).toBeGreaterThan(0);
    });

    test('computes equivalencies correctly', () => {
      const result = calculateSimulatedEmissions(sampleBreakdown, sliders);
      expect(result.environmentalImpact.treesPlanted).toBeCloseTo(result.annualSavings / 22, 1);
      expect(result.environmentalImpact.coalBurnedAvoidedKg).toBeCloseTo(result.annualSavings * 0.43, 1);
    });
  });

  describe('4. predictFutureEmissions', () => {
    test('generates a 12-month comparison point list', () => {
      const points = predictFutureEmissions(10000, 25);
      expect(points.length).toBe(12);
      expect(points[0].month).toBe('Jan');
      expect(points[11].month).toBe('Dec');
      expect(points[11].predictedEmissions).toBeLessThan(points[11].businessAsUsual);
    });
  });

  describe('5. simulateGlobalImpact', () => {
    test('multiplies user savings by scaling factor', () => {
      const savings = 1000; // 1 ton
      const result = simulateGlobalImpact(savings, 10000);
      expect(result.co2SavedTons).toBe(10000);
      expect(result.treesPlanted).toBeCloseTo((1000 * 10000) / 22, 1);
      expect(result.homesPoweredYearly).toBeCloseTo((1000 * 10000) / 7500, 1);
    });
  });

  describe('6. generateReductionPlan', () => {
    test('generates a 4-week task checklist tailored to emissions', () => {
      const plan = generateReductionPlan(sampleBreakdown);
      expect(plan.length).toBe(4);
      expect(plan[0].weekNumber).toBe(1);
      expect(plan[0].tasks.length).toBe(2);
      expect(plan[0].tasks[0].expectedSavings).toBeGreaterThan(0);
    });
  });

  describe('7. compareAgainstBenchmarks', () => {
    test('performs comparisons against US average', () => {
      const res = compareAgainstBenchmarks(16000, 'US');
      expect(res.regionalAverage).toBe(16000);
      expect(res.comparisonRatio).toBe(1.0);
      expect(res.percentileRank).toBe(50);
    });

    test('performs comparisons against Europe average', () => {
      const res = compareAgainstBenchmarks(3200, 'Europe');
      expect(res.regionalAverage).toBe(6400);
      expect(res.comparisonRatio).toBe(0.5);
      expect(res.percentileRank).toBeGreaterThan(50);
    });
  });

  describe('8. calculateNetZeroDate', () => {
    test('estimates target net zero years based on annual savings', () => {
      const res = calculateNetZeroDate(10000, 1000);
      expect(res.yearsToNetZero).toBe(10);
      expect(res.targetYear).toBe(new Date().getFullYear() + 10);
    });

    test('caps estimate if savings are negative or zero', () => {
      const res = calculateNetZeroDate(10000, 0);
      expect(res.yearsToNetZero).toBe(50);
    });
  });
});
