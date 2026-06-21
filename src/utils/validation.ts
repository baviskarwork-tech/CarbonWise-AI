import { z } from 'zod';

export const CalculatorSchema = z.object({
  // Transportation
  carMileage: z.number()
    .min(0, 'Mileage cannot be negative')
    .max(200000, 'Mileage is set too high'),
  carEfficiency: z.number()
    .min(0, 'Efficiency cannot be negative')
    .max(150, 'Efficiency must be under 150 MPG'),
  flightsShort: z.number()
    .min(0, 'Flights cannot be negative')
    .max(200, 'Flights must be realistic'),
  flightsLong: z.number()
    .min(0, 'Flights cannot be negative')
    .max(200, 'Flights must be realistic'),
  publicTransportHours: z.number()
    .min(0, 'Hours cannot be negative')
    .max(168, 'Hours cannot exceed 168 per week'),

  // Energy
  electricityBill: z.number()
    .min(0, 'Bill cannot be negative')
    .max(10000, 'Bill is set too high'),
  gasBill: z.number()
    .min(0, 'Bill cannot be negative')
    .max(10000, 'Bill is set too high'),

  // Food
  meatDays: z.number()
    .min(0, 'Days cannot be negative')
    .max(7, 'Days cannot exceed 7 per week'),
  dairyDays: z.number()
    .min(0, 'Days cannot be negative')
    .max(7, 'Days cannot exceed 7 per week'),

  // Waste
  recyclingRate: z.number()
    .min(0, 'Rate cannot be less than 0%')
    .max(100, 'Rate cannot exceed 100%'),
});

export const GoalSchema = z.object({
  targetReductionPercent: z.union([z.literal(10), z.literal(25), z.literal(50)]),
  timelineMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]),
});

export const UserRegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
});

export const UserLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
