/**
 * Shared Type Definitions for CarbonWise AI
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  sustainabilityScore: number; // 0 to 100
  currentFootprintId?: string;
}

export interface CalculatorInputs {
  // Transportation
  carMileage: number; // miles per year
  carEfficiency: number; // mpg (miles per gallon)
  flightsShort: number; // number of flights (< 3 hours) per year
  flightsLong: number; // number of flights (> 3 hours) per year
  publicTransportHours: number; // hours per week

  // Energy
  electricityBill: number; // average $ per month
  gasBill: number; // average $ per month

  // Food
  meatDays: number; // meat-eating days per week
  dairyDays: number; // dairy consumption days per week

  // Waste
  recyclingRate: number; // percentage (0 to 100)
}

export interface CarbonBreakdown {
  transport: number; // kg CO2e / year
  energy: number;    // kg CO2e / year
  food: number;      // kg CO2e / year
  waste: number;     // kg CO2e / year
}

export interface CarbonFootprint {
  id: string;
  userId: string;
  calculatedAt: string;
  inputs: CalculatorInputs;
  breakdown: CarbonBreakdown;
  totalEmissions: number; // kg CO2e / year
}

export interface Goal {
  id: string;
  userId: string;
  targetReductionPercent: number; // e.g. 10, 25, 50
  timelineMonths: number; // e.g. 3, 6, 12
  createdAt: string;
  targetDate: string;
  startEmissions: number; // kg CO2e / year
  targetEmissions: number; // kg CO2e / year
  currentEmissions: number; // kg CO2e / year
  progressPercent: number; // 0 to 100
  isCompleted: boolean;
}

export interface TaskItem {
  id: string;
  action: string;
  expectedSavings: number; // kg CO2e / week
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
}

export interface WeeklyPlanWeek {
  weekNumber: number; // 1 to 4
  tasks: TaskItem[];
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  createdAt: string;
  weeks: WeeklyPlanWeek[];
}

export interface AIRecommendation {
  id: string;
  userId: string;
  category: 'transport' | 'energy' | 'food' | 'waste';
  title: string;
  description: string;
  potentialSavings: number; // kg CO2e / year
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timestamp: string;
}

export type BadgeId = 'eco_beginner' | 'carbon_reducer' | 'green_champion' | 'net_zero_hero';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  iconName: string;
  requirement: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeId: BadgeId;
  unlockedAt: string;
  progress: number; // 0 to 100
}

export interface SimulationSliders {
  carReduction: number;        // percentage e.g., 0 to 100
  flightReduction: number;     // percentage e.g., 0 to 100
  electricityReduction: number;// percentage e.g., 0 to 100
  meatReduction: number;       // percentage e.g., 0 to 100
  recyclingIncrease: number;   // percentage e.g., 0 to 100
}

export interface ForecastPoint {
  month: string;
  businessAsUsual: number; // kg CO2e
  predictedEmissions: number; // kg CO2e
}
