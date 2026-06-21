import { Badge, AIRecommendation } from '../types';

// Emission factors based on EPA / DEFRA guidelines
export const EMISSION_FACTORS = {
  // Gasoline CO2: ~8.887 kg per gallon
  CO2_PER_GALLON: 8.887,
  
  // Flights (kg CO2e per flight)
  FLIGHT_SHORT_CO2: 225.0, // Short haul (< 3 hours)
  FLIGHT_LONG_CO2: 850.0,  // Long haul (> 3 hours)
  
  // Public transport (kg CO2e per hour)
  PUBLIC_TRANS_CO2_PER_HOUR: 0.14,
  
  // Energy (kg CO2e per dollar spent, assuming average tariffs)
  ELECTRICITY_CO2_PER_USD: 2.3, // ~0.38 kg per kWh, at $0.165/kWh
  GAS_CO2_PER_USD: 3.8,         // therm equivalents per dollar
  
  // Food (kg CO2e per day of diet type per week, annualized)
  // Meat diet has high emissions. A meat-day per week adds ~180 kg CO2e/year.
  MEAT_DIET_CO2_PER_DAY_WEEKLY: 182.0, 
  DAIRY_DIET_CO2_PER_DAY_WEEKLY: 62.0,
  
  // Waste (kg CO2e per year for trash baseline)
  BASE_WASTE_CO2_YEARLY: 900.0,
  // Offsets per percentage point of recycling rate (up to 500 kg offset at 100%)
  RECYCLING_OFFSET_PER_PERCENT: 5.0,
};

// National average footprint baseline for comparison (in kg CO2e / year)
export const NATIONAL_AVERAGES = {
  TOTAL: 16000,
  TRANSPORT: 5200,
  ENERGY: 4500,
  FOOD: 3500,
  WASTE: 2800,
};

export const BADGES: Badge[] = [
  {
    id: 'eco_beginner',
    name: 'Eco Beginner',
    description: 'Calculate your carbon footprint for the first time.',
    iconName: 'Leaf',
    requirement: 'Submit a footprint calculation.',
  },
  {
    id: 'carbon_reducer',
    name: 'Carbon Reducer',
    description: 'Set a goal to reduce your emissions and start tracking.',
    iconName: 'TrendingDown',
    requirement: 'Create any carbon reduction goal.',
  },
  {
    id: 'green_champion',
    name: 'Green Champion',
    description: 'Achieve a Sustainability Score of 80 or higher.',
    iconName: 'Award',
    requirement: 'Score 80+ in sustainability score.',
  },
  {
    id: 'net_zero_hero',
    name: 'Net Zero Hero',
    description: 'Complete a Weekly Action Plan and reduce your simulator emissions by 50%.',
    iconName: 'ShieldAlert',
    requirement: 'Demonstrate a 50% simulated carbon footprint reduction.',
  },
];

// Predefined AI recommendations when API key is missing or offline
export const FALLBACK_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec_trans_1',
    userId: 'default',
    category: 'transport',
    title: 'Switch to public transport or bike commuting',
    description: 'Commute by train, bus, or bicycle just 2 days a week instead of driving to significantly cut fuel consumption.',
    potentialSavings: 850,
    difficulty: 'Medium',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'rec_energy_1',
    userId: 'default',
    category: 'energy',
    title: 'Upgrade to LED bulbs & Smart Thermostats',
    description: 'LED bulbs use 75% less energy and last 25 times longer. Programmable thermostats optimize temperature settings for empty rooms.',
    potentialSavings: 380,
    difficulty: 'Easy',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'rec_food_1',
    userId: 'default',
    category: 'food',
    title: 'Adopt Meatless Mondays',
    description: 'Skipping meat just 1 day per week reduces emissions, land usage, and water footprint of your weekly meals.',
    potentialSavings: 182,
    difficulty: 'Easy',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'rec_waste_1',
    userId: 'default',
    category: 'waste',
    title: 'Compost organic material & reduce single-use plastic',
    description: 'Composting organic waste stops methane release in landfills. Buying in bulk reduces packaging waste.',
    potentialSavings: 120,
    difficulty: 'Medium',
    timestamp: new Date().toISOString(),
  },
];
