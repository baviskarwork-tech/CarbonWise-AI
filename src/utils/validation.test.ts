import { CalculatorSchema, GoalSchema, UserRegisterSchema, UserLoginSchema } from './validation';

describe('Validation Schemas', () => {
  describe('CalculatorSchema', () => {
    const validInputs = {
      carMileage: 12000,
      carEfficiency: 30,
      flightsShort: 3,
      flightsLong: 2,
      publicTransportHours: 10,
      electricityBill: 150,
      gasBill: 80,
      meatDays: 4,
      dairyDays: 5,
      recyclingRate: 60,
    };

    test('1. accepts valid calculator inputs', () => {
      const result = CalculatorSchema.safeParse(validInputs);
      expect(result.success).toBe(true);
    });

    test('2. rejects negative car mileage', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, carMileage: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Mileage cannot be negative');
      }
    });

    test('3. rejects excessively high car mileage', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, carMileage: 250000 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Mileage is set too high');
      }
    });

    test('4. rejects negative car efficiency', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, carEfficiency: -5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Efficiency cannot be negative');
      }
    });

    test('5. rejects too high car efficiency', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, carEfficiency: 160 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Efficiency must be under 150 MPG');
      }
    });

    test('6. rejects negative short flights', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, flightsShort: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Flights cannot be negative');
      }
    });

    test('7. rejects negative long flights', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, flightsLong: -2 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Flights cannot be negative');
      }
    });

    test('8. rejects too many short flights', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, flightsShort: 201 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Flights must be realistic');
      }
    });

    test('9. rejects negative public transport hours', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, publicTransportHours: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hours cannot be negative');
      }
    });

    test('10. rejects public transport hours exceeding 168', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, publicTransportHours: 169 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hours cannot exceed 168 per week');
      }
    });

    test('11. rejects negative electricity bill', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, electricityBill: -10 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bill cannot be negative');
      }
    });

    test('12. rejects too high electricity bill', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, electricityBill: 10001 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bill is set too high');
      }
    });

    test('13. rejects negative gas bill', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, gasBill: -20 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bill cannot be negative');
      }
    });

    test('14. rejects too high gas bill', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, gasBill: 10001 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bill is set too high');
      }
    });

    test('15. rejects negative meat days', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, meatDays: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Days cannot be negative');
      }
    });

    test('16. rejects meat days exceeding 7', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, meatDays: 8 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Days cannot exceed 7 per week');
      }
    });

    test('17. rejects negative dairy days', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, dairyDays: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Days cannot be negative');
      }
    });

    test('18. rejects dairy days exceeding 7', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, dairyDays: 9 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Days cannot exceed 7 per week');
      }
    });

    test('19. rejects recycling rate less than 0%', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, recyclingRate: -5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Rate cannot be less than 0%');
      }
    });

    test('20. rejects recycling rate exceeding 100%', () => {
      const result = CalculatorSchema.safeParse({ ...validInputs, recyclingRate: 101 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Rate cannot exceed 100%');
      }
    });
  });

  describe('GoalSchema', () => {
    test('21. accepts valid reduction target percent and timeline months combinations', () => {
      const result1 = GoalSchema.safeParse({ targetReductionPercent: 10, timelineMonths: 3 });
      const result2 = GoalSchema.safeParse({ targetReductionPercent: 25, timelineMonths: 6 });
      const result3 = GoalSchema.safeParse({ targetReductionPercent: 50, timelineMonths: 12 });
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    test('22. rejects invalid reduction target percent values', () => {
      const result = GoalSchema.safeParse({ targetReductionPercent: 15, timelineMonths: 3 });
      expect(result.success).toBe(false);
    });

    test('23. rejects invalid timeline months values', () => {
      const result = GoalSchema.safeParse({ targetReductionPercent: 10, timelineMonths: 5 });
      expect(result.success).toBe(false);
    });
  });

  describe('UserRegisterSchema', () => {
    test('24. accepts valid registration info', () => {
      const result = UserRegisterSchema.safeParse({
        email: 'green_hero@earth.org',
        password: 'securePassword123',
        displayName: 'Green Hero',
      });
      expect(result.success).toBe(true);
    });

    test('25. rejects invalid email formats', () => {
      const result = UserRegisterSchema.safeParse({
        email: 'invalid-email',
        password: 'securePassword123',
        displayName: 'Green Hero',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address');
      }
    });

    test('26. rejects too short passwords', () => {
      const result = UserRegisterSchema.safeParse({
        email: 'green_hero@earth.org',
        password: '12345',
        displayName: 'Green Hero',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters');
      }
    });

    test('27. rejects empty or too short names', () => {
      const result = UserRegisterSchema.safeParse({
        email: 'green_hero@earth.org',
        password: 'securePassword123',
        displayName: 'A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be at least 2 characters');
      }
    });
  });

  describe('UserLoginSchema', () => {
    test('28. accepts valid login format', () => {
      const result = UserLoginSchema.safeParse({
        email: 'test@carbonwise.com',
        password: 'somePassword',
      });
      expect(result.success).toBe(true);
    });

    test('29. rejects empty passwords', () => {
      const result = UserLoginSchema.safeParse({
        email: 'test@carbonwise.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });
  });
});
