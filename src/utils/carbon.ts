import { CalculatorInputs, CarbonBreakdown } from '../types';
import { EMISSION_FACTORS } from '../constants';

/**
 * Calculates the annual CO2 emissions (in kg CO2e) for each category.
 * 
 * @param inputs The inputs submitted by the user
 * @returns CarbonBreakdown of CO2e per category and total emissions
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
  // Waste baseline offset by recycling rate
  const wasteBase = EMISSION_FACTORS.BASE_WASTE_CO2_YEARLY;
  const wasteOffset = (Math.min(100, Math.max(0, inputs.recyclingRate)) * EMISSION_FACTORS.RECYCLING_OFFSET_PER_PERCENT);
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
