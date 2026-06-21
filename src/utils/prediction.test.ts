import { calculateSimulatedEmissions, generate12MonthForecast } from './prediction';
import { CarbonBreakdown, SimulationSliders } from '../types';

describe('Carbon Prediction & Simulator Engine', () => {
  const currentBreakdown: CarbonBreakdown = {
    transport: 6000,
    energy: 4000,
    food: 2000,
    waste: 1000,
  };

  const zeroSliders: SimulationSliders = {
    carReduction: 0,
    flightReduction: 0,
    electricityReduction: 0,
    meatReduction: 0,
    recyclingIncrease: 0,
  };

  test('calculates correct total and outputs when sliders are zero', () => {
    const res = calculateSimulatedEmissions(currentBreakdown, zeroSliders);
    expect(res.currentTotal).toBe(13000);
    expect(res.simulatedTotal).toBe(13000);
    expect(res.annualSavings).toBe(0);
    expect(res.percentReduction).toBe(0);
  });

  test('calculates correct simulated totals with partial sliders reduction', () => {
    const sliders: SimulationSliders = {
      ...zeroSliders,
      carReduction: 50,      // transport reduced by 50% * 0.7 = 35%
      electricityReduction: 20, // energy reduced by 20%
    };
    const res = calculateSimulatedEmissions(currentBreakdown, sliders);
    // transport: 6000 * 0.65 = 3900
    // energy: 4000 * 0.8 = 3200
    // food: 2000
    // waste: 1000
    // total = 3900 + 3200 + 2000 + 1000 = 10100
    expect(res.simulatedTotal).toBe(10100);
    expect(res.annualSavings).toBe(2900);
    expect(res.percentReduction).toBe(22); // 2900 / 13000 = 22.3% -> 22%
  });

  test('calculates correct trees-planted equivalent offsets', () => {
    const sliders = { ...zeroSliders, electricityReduction: 50 }; // energy reduced by 50%
    const res = calculateSimulatedEmissions(currentBreakdown, sliders);
    // energy reduced from 4000 to 2000. savings = 2000.
    // trees = 2000 / 22 = 90.9
    expect(res.environmentalImpact.treesPlanted).toBe(90.9);
  });

  test('calculates correct avoided coal burning equivalents', () => {
    const sliders = { ...zeroSliders, electricityReduction: 50 };
    const res = calculateSimulatedEmissions(currentBreakdown, sliders);
    // energy savings = 2000.
    // coal = 2000 * 0.43 = 860
    expect(res.environmentalImpact.coalBurnedAvoidedKg).toBe(860);
  });

  test('calculates correct avoided passenger car mileage equivalents', () => {
    const sliders = { ...zeroSliders, electricityReduction: 50 };
    const res = calculateSimulatedEmissions(currentBreakdown, sliders);
    // energy savings = 2000.
    // car miles = 2000 * 2.5 = 5000 miles
    expect(res.environmentalImpact.carMilesAvoided).toBe(5000);
  });

  test('caps simulated breakdown values at zero (cannot go negative)', () => {
    const sliders: SimulationSliders = {
      carReduction: 150,
      flightReduction: 150,
      electricityReduction: 150,
      meatReduction: 150,
      recyclingIncrease: 150,
    };
    const res = calculateSimulatedEmissions(currentBreakdown, sliders);
    expect(res.simulatedBreakdown.transport).toBe(0);
    expect(res.simulatedBreakdown.energy).toBe(0);
    expect(res.simulatedBreakdown.food).toBe(0);
    expect(res.simulatedBreakdown.waste).toBe(0);
  });

  test('generates exactly 12 monthly data points for trajectory charts', () => {
    const forecast = generate12MonthForecast(12000, 25);
    expect(forecast.length).toBe(12);
  });

  test('forecast contains month titles in order', () => {
    const forecast = generate12MonthForecast(12000, 25);
    expect(forecast[0].month).toBe('Jan');
    expect(forecast[11].month).toBe('Dec');
  });

  test('predicted emissions forecast gradually decreases compared to BAU baseline', () => {
    const forecast = generate12MonthForecast(12000, 50);
    // Monthly BAU is around 1000. Target monthly is 500.
    // Under linear decrease over 6 months, month 6 predicted emissions should be lower than month 1.
    expect(forecast[6].predictedEmissions).toBeLessThan(forecast[0].predictedEmissions);
  });

  test('predicted emissions match targeted reduction values by month 7', () => {
    const totalYearly = 12000;
    const targetReduction = 30; // 30% reduction path
    const forecast = generate12MonthForecast(totalYearly, targetReduction);
    
    // In Month 7 (index 6, July), the target should be fully optimized
    // BAU = 12000/12 = 1000 (modified by summer seasonal wave index 6: sin(6/11*2pi) is around -0.28)
    // We expect predicted to be approx 70% of BAU for index 6
    const pct = forecast[6].predictedEmissions / forecast[6].businessAsUsual;
    expect(pct).toBeCloseTo(0.7, 1);
  });
});
