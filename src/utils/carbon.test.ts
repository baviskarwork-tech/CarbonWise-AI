import { calculateCarbonFootprint } from './carbon';
import { CalculatorInputs } from '../types';

describe('Carbon Calculator Engine', () => {
  const baseInputs: CalculatorInputs = {
    carMileage: 10000,
    carEfficiency: 25,
    flightsShort: 2,
    flightsLong: 1,
    publicTransportHours: 5,
    electricityBill: 100,
    gasBill: 50,
    meatDays: 3,
    dairyDays: 4,
    recyclingRate: 50,
  };

  test('calculates correct transport emissions with standard values', () => {
    const { breakdown } = calculateCarbonFootprint(baseInputs);
    // (10000 / 25) * 8.887 = 3554.8
    // flights: 2 * 225 + 1 * 850 = 1300
    // public transport: 5 * 52 * 0.14 = 36.4
    // total = 3555 + 1300 + 36 = 4891 kg
    expect(breakdown.transport).toBe(4891);
  });

  test('handles zero mileage for cars', () => {
    const inputs = { ...baseInputs, carMileage: 0 };
    const { breakdown } = calculateCarbonFootprint(inputs);
    expect(breakdown.transport).toBe(1336); // only flights + public transport
  });

  test('handles zero car efficiency without crashing', () => {
    const inputs = { ...baseInputs, carEfficiency: 0 };
    const { breakdown } = calculateCarbonFootprint(inputs);
    expect(breakdown.transport).toBe(1336);
  });

  test('calculates correct household utility energy emissions', () => {
    const { breakdown } = calculateCarbonFootprint(baseInputs);
    // electricity: 100 * 12 * 2.3 = 2760
    // gas: 50 * 12 * 3.8 = 2280
    // total = 2760 + 2280 = 5040
    expect(breakdown.energy).toBe(5040);
  });

  test('calculates zero energy emissions when bills are zero', () => {
    const inputs = { ...baseInputs, electricityBill: 0, gasBill: 0 };
    const { breakdown } = calculateCarbonFootprint(inputs);
    expect(breakdown.energy).toBe(0);
  });

  test('calculates food dietary emissions based on days eating meat/dairy', () => {
    const { breakdown } = calculateCarbonFootprint(baseInputs);
    // meat: 3 * 182 = 546
    // dairy: 4 * 62 = 248
    // total = 794
    expect(breakdown.food).toBe(794);
  });

  test('calculates zero food emissions for vegan profile (0 days meat/dairy)', () => {
    const inputs = { ...baseInputs, meatDays: 0, dairyDays: 0 };
    const { breakdown } = calculateCarbonFootprint(inputs);
    expect(breakdown.food).toBe(0);
  });

  test('applies full waste offsets at 100% recycling rate', () => {
    const inputs = { ...baseInputs, recyclingRate: 100 };
    const { breakdown } = calculateCarbonFootprint(inputs);
    // baseline 900 - 100 * 5 = 400
    expect(breakdown.waste).toBe(400);
  });

  test('applies zero offsets at 0% recycling rate', () => {
    const inputs = { ...baseInputs, recyclingRate: 0 };
    const { breakdown } = calculateCarbonFootprint(inputs);
    // baseline 900
    expect(breakdown.waste).toBe(900);
  });

  test('restricts recycling offset values within [0, 100] range', () => {
    const inputsOver = { ...baseInputs, recyclingRate: 120 };
    const inputsUnder = { ...baseInputs, recyclingRate: -20 };
    const resOver = calculateCarbonFootprint(inputsOver);
    const resUnder = calculateCarbonFootprint(inputsUnder);
    expect(resOver.breakdown.waste).toBe(400); // capped at 100%
    expect(resUnder.breakdown.waste).toBe(900); // floored at 0%
  });
});
