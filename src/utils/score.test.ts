import { calculateSustainabilityScore, getGradeBadgeColor } from './score';
import { CarbonBreakdown } from '../types';

describe('Sustainability Scoring Engine', () => {
  const averageBreakdown: CarbonBreakdown = {
    transport: 5200,
    energy: 4500,
    food: 3500,
    waste: 2800,
  };

  test('gives score of 50 for national average baseline emissions', () => {
    const { score } = calculateSustainabilityScore(averageBreakdown);
    expect(score).toBe(50);
  });

  test('gives score of 100 for absolute net-zero emissions', () => {
    const zeroBreakdown: CarbonBreakdown = { transport: 0, energy: 0, food: 0, waste: 0 };
    const { score, grade } = calculateSustainabilityScore(zeroBreakdown);
    expect(score).toBe(100);
    expect(grade).toBe('Excellent');
  });

  test('gives score of 0 for emissions double the baseline average', () => {
    const doubleBreakdown: CarbonBreakdown = {
      transport: 10400,
      energy: 9000,
      food: 7000,
      waste: 5600,
    };
    const { score, grade } = calculateSustainabilityScore(doubleBreakdown);
    expect(score).toBe(0);
    expect(grade).toBe('Poor');
  });

  test('assigns Excellent grade for scores >= 80', () => {
    const breakdown: CarbonBreakdown = { transport: 1000, energy: 1000, food: 500, waste: 400 };
    const { grade } = calculateSustainabilityScore(breakdown);
    expect(grade).toBe('Excellent');
  });

  test('assigns Good grade for scores >= 60 and < 80', () => {
    const breakdown: CarbonBreakdown = { transport: 3000, energy: 2500, food: 1500, waste: 1000 };
    const { grade } = calculateSustainabilityScore(breakdown);
    expect(grade).toBe('Good');
  });

  test('assigns Average grade for scores >= 40 and < 60', () => {
    const { grade } = calculateSustainabilityScore(averageBreakdown);
    expect(grade).toBe('Average');
  });

  test('assigns Poor grade for scores < 40', () => {
    const highBreakdown: CarbonBreakdown = { transport: 8000, energy: 7000, food: 5000, waste: 4000 };
    const { grade } = calculateSustainabilityScore(highBreakdown);
    expect(grade).toBe('Poor');
  });

  test('calculates correct individual breakdown category scores', () => {
    const breakdown: CarbonBreakdown = { transport: 2600, energy: 4500, food: 0, waste: 2800 };
    const { breakdownScores } = calculateSustainabilityScore(breakdown);
    // transport = 100 - (2600/5200)*50 = 75
    // energy = 100 - (4500/4500)*50 = 50
    // food = 100 - (0/3500)*50 = 100
    // waste = 100 - (2800/2800)*50 = 50
    expect(breakdownScores.transport).toBe(75);
    expect(breakdownScores.energy).toBe(50);
    expect(breakdownScores.food).toBe(100);
    expect(breakdownScores.waste).toBe(50);
  });

  test('caps scores between 0 and 100 even with extreme emissions', () => {
    const massiveBreakdown: CarbonBreakdown = {
      transport: 500000,
      energy: 300000,
      food: 100000,
      waste: 80000,
    };
    const { score } = calculateSustainabilityScore(massiveBreakdown);
    expect(score).toBe(0);
  });

  test('returns correct Tailwind CSS class badges styles', () => {
    expect(getGradeBadgeColor('Excellent')).toContain('emerald');
    expect(getGradeBadgeColor('Good')).toContain('cyan');
    expect(getGradeBadgeColor('Average')).toContain('amber');
    expect(getGradeBadgeColor('Poor')).toContain('rose');
  });
});
