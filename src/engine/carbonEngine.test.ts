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

  describe('9. Extended Benchmarking & Scaling Indicators', () => {
    test('supports India Average (1900 kg) comparisons correctly', () => {
      const res = compareAgainstBenchmarks(1900, 'India');
      expect(res.regionalAverage).toBe(1900);
      expect(res.indiaAverage).toBe(1900);
      expect(res.comparisonRatio).toBe(1.0);
    });

    test('calculates correct ratio when emissions exceed India average', () => {
      const res = compareAgainstBenchmarks(3800, 'India');
      expect(res.comparisonRatio).toBe(2.0);
    });

    test('calculates correct ratio when emissions are below India average', () => {
      const res = compareAgainstBenchmarks(950, 'India');
      expect(res.comparisonRatio).toBe(0.5);
    });

    test('caps percentile rankings correctly for extremely low footprints vs India average', () => {
      const res = compareAgainstBenchmarks(100, 'India');
      expect(res.percentileRank).toBe(97);
    });

    test('caps percentile rankings correctly for extremely high footprints vs India average', () => {
      const res = compareAgainstBenchmarks(10000, 'India');
      expect(res.percentileRank).toBe(5);
    });

    test('handles default regional average as US (16000 kg)', () => {
      const res = compareAgainstBenchmarks(8000);
      expect(res.regionalAverage).toBe(16000);
      expect(res.comparisonRatio).toBe(0.5);
    });

    test('global impact scaling outputs at exactly 1,000 users', () => {
      const res = simulateGlobalImpact(1, 1000);
      expect(res.co2SavedTons).toBe(1);
      expect(res.carsRemovedYearly).toBeCloseTo(1000 / 4600, 1);
    });

    test('global impact scaling outputs at exactly 10,000 users', () => {
      const res = simulateGlobalImpact(1, 10000);
      expect(res.co2SavedTons).toBe(10);
      expect(res.carsRemovedYearly).toBeCloseTo(10000 / 4600, 1);
    });

    test('global impact scaling outputs at exactly 100,000 users', () => {
      const res = simulateGlobalImpact(1, 100000);
      expect(res.co2SavedTons).toBe(100);
      expect(res.carsRemovedYearly).toBeCloseTo(100000 / 4600, 1);
    });

    test('global impact scaling outputs at exactly 1,000,000 users', () => {
      const res = simulateGlobalImpact(1, 1000000);
      expect(res.co2SavedTons).toBe(1000);
      expect(res.carsRemovedYearly).toBeCloseTo(1000000 / 4600, 1);
    });

    test('verifies carsRemovedYearly is directly proportional to savings', () => {
      const res1 = simulateGlobalImpact(1000, 10000);
      const res2 = simulateGlobalImpact(2000, 10000);
      expect(res2.carsRemovedYearly).toBe(res1.carsRemovedYearly * 2);
    });
  });

  describe('10. Net-Zero Date Forecast Details & Confidence Metrics', () => {
    test('projected net-zero target calculation for standard target reduction percentage (30%)', () => {
      const res = calculateNetZeroDate(10000, 3000, 30);
      expect(res.currentEmissions).toBe(10000);
      expect(res.targetReduction).toBe(3000);
      expect(res.projectedNetZeroYear).toBe(new Date().getFullYear() + 3);
    });

    test('projected net-zero target calculation for high target reduction percentage (50%)', () => {
      const res = calculateNetZeroDate(10000, 2000, 50);
      expect(res.targetReduction).toBe(5000);
      expect(res.projectedNetZeroYear).toBe(new Date().getFullYear() + 5);
    });

    test('confidence score is extremely low (15%) when annual savings is zero', () => {
      const res = calculateNetZeroDate(10000, 0, 30);
      expect(res.confidenceScore).toBe(15);
    });

    test('confidence score is low (45%) when savings are less than half the target reduction', () => {
      const res = calculateNetZeroDate(10000, 1000, 30);
      expect(res.confidenceScore).toBe(45);
    });

    test('confidence score is moderate (75%) when savings are close but less than target reduction', () => {
      const res = calculateNetZeroDate(10000, 2500, 30);
      expect(res.confidenceScore).toBe(75);
    });

    test('confidence score is high (90%+) when savings meet target reduction', () => {
      const res = calculateNetZeroDate(10000, 3000, 30); // target is 3000
      expect(res.confidenceScore).toBe(92);
    });

    test('confidence score increases further when savings double the target reduction', () => {
      const res = calculateNetZeroDate(10000, 6000, 30);
      expect(res.confidenceScore).toBe(94);
    });

    test('monthly reduction needed estimates standard 10-year Net Zero path', () => {
      const res = calculateNetZeroDate(12000, 1200, 30);
      expect(res.monthlyReductionNeeded).toBe(100);
    });

    test('confidence score is capped near 99% for massive savings rates', () => {
      const res = calculateNetZeroDate(10000, 25000, 30);
      expect(res.confidenceScore).toBe(99);
    });

    test('net-zero projected year caps at currentYear + 50 for negative or slow paths', () => {
      const res = calculateNetZeroDate(10000, -100, 30);
      expect(res.projectedNetZeroYear).toBe(new Date().getFullYear() + 50);
    });
  });
});
