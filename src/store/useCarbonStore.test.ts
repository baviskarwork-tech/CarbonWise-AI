import { useCarbonStore } from './useCarbonStore';
import { authService, databaseService } from '../services/firebase';
import { CalculatorInputs, UserProfile } from '../types';

jest.mock('../services/firebase', () => ({
  authService: {
    signInWithGoogle: jest.fn(),
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn((cb: (user: UserProfile | null) => void) => {
      cb(null);
      return () => {};
    }),
  },
  databaseService: {
    getFootprints: jest.fn().mockResolvedValue([]),
    getGoals: jest.fn().mockResolvedValue([]),
    getPlan: jest.fn().mockResolvedValue(null),
    getAchievements: jest.fn().mockResolvedValue([]),
    saveFootprint: jest.fn(),
    saveGoal: jest.fn(),
    savePlan: jest.fn(),
    unlockAchievement: jest.fn(),
  },
}));

const mockUser: UserProfile = {
  uid: 'u1',
  email: 'test@gmail.com',
  displayName: 'Eco Hero',
  createdAt: new Date().toISOString(),
  sustainabilityScore: 50,
};

describe('Zustand Carbon State Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCarbonStore.setState({
      currentUser: null,
      authLoading: false,
      authError: null,
      footprints: [],
      goals: [],
      activePlan: null,
      achievements: [],
      dataLoading: false,
    });
  });

  test('1. sets loading state during auth initialization', () => {
    const unsub = useCarbonStore.getState().initAuth();
    expect(typeof unsub).toBe('function');
    expect(useCarbonStore.getState().authLoading).toBe(false);
  });

  test('2. successfully authenticates user with Google', async () => {
    (authService.signInWithGoogle as jest.Mock).mockResolvedValue(mockUser);
    await useCarbonStore.getState().loginWithGoogle();
    expect(useCarbonStore.getState().currentUser).toEqual(mockUser);
    expect(useCarbonStore.getState().authError).toBeNull();
  });

  test('3. sets authError when Google authentication fails', async () => {
    (authService.signInWithGoogle as jest.Mock).mockRejectedValue(new Error('Google failure'));
    await expect(useCarbonStore.getState().loginWithGoogle()).rejects.toThrow('Google failure');
    expect(useCarbonStore.getState().currentUser).toBeNull();
    expect(useCarbonStore.getState().authError).toBe('Google failure');
  });

  test('4. logs in user with email and password credentials', async () => {
    const emailUser: UserProfile = { ...mockUser, uid: 'u2', email: 'test@email.com', displayName: 'Leader' };
    (authService.signInWithEmail as jest.Mock).mockResolvedValue(emailUser);
    await useCarbonStore.getState().loginWithEmail('test@email.com', 'pwd123');
    expect(useCarbonStore.getState().currentUser).toEqual(emailUser);
  });

  test('5. sets authError when email login fails', async () => {
    (authService.signInWithEmail as jest.Mock).mockRejectedValue(new Error('Wrong password'));
    await expect(useCarbonStore.getState().loginWithEmail('test@email.com', 'wrong')).rejects.toThrow('Wrong password');
    expect(useCarbonStore.getState().authError).toBe('Wrong password');
  });

  test('6. registers a new user profile via email', async () => {
    const newUser: UserProfile = { ...mockUser, uid: 'u3', email: 'new@email.com', displayName: 'New User' };
    (authService.signUpWithEmail as jest.Mock).mockResolvedValue(newUser);
    await useCarbonStore.getState().registerWithEmail('new@email.com', 'pwd123', 'New User');
    expect(useCarbonStore.getState().currentUser).toEqual(newUser);
  });

  test('7. clears user session state upon logout', async () => {
    useCarbonStore.setState({ currentUser: mockUser });
    (authService.signOut as jest.Mock).mockResolvedValue(undefined);
    await useCarbonStore.getState().logout();
    expect(useCarbonStore.getState().currentUser).toBeNull();
  });

  test('8. fetches all user footprints and goals history', async () => {
    useCarbonStore.setState({ currentUser: mockUser });
    const mockFootprints = [{ id: 'fp-1', userId: 'u1', totalEmissions: 8000 }];
    const mockGoals = [{ id: 'g-1', userId: 'u1', targetReductionPercent: 10 }];
    (databaseService.getFootprints as jest.Mock).mockResolvedValue(mockFootprints);
    (databaseService.getGoals as jest.Mock).mockResolvedValue(mockGoals);
    await useCarbonStore.getState().fetchData();
    expect(useCarbonStore.getState().footprints).toEqual(mockFootprints);
    expect(useCarbonStore.getState().goals).toEqual(mockGoals);
  });

  test('9. saves calculated footprint inputs and updates user score', async () => {
    useCarbonStore.setState({ currentUser: mockUser });
    const inputs: CalculatorInputs = {
      carMileage: 5000, carEfficiency: 25, flightsShort: 0, flightsLong: 0,
      publicTransportHours: 0, electricityBill: 0, gasBill: 0, meatDays: 0, dairyDays: 0, recyclingRate: 100,
    };
    const savedFp = { id: 'fp-1', userId: 'u1', inputs, breakdown: { transport: 1777, energy: 0, food: 0, waste: 400 }, totalEmissions: 2177, calculatedAt: new Date().toISOString() };
    (databaseService.saveFootprint as jest.Mock).mockResolvedValue(savedFp);
    (databaseService.getFootprints as jest.Mock).mockResolvedValue([savedFp]);
    (databaseService.getAchievements as jest.Mock).mockResolvedValue([]);
    await useCarbonStore.getState().saveFootprint(inputs);
    expect(databaseService.saveFootprint).toHaveBeenCalledWith('u1', expect.objectContaining({ totalEmissions: 2177 }));
    expect(useCarbonStore.getState().currentUser?.sustainabilityScore).toBeGreaterThan(50);
  });

  test('10. throws an error when trying to save footprint without auth', async () => {
    const inputs: CalculatorInputs = {
      carMileage: 5000, carEfficiency: 25, flightsShort: 0, flightsLong: 0,
      publicTransportHours: 0, electricityBill: 0, gasBill: 0, meatDays: 0, dairyDays: 0, recyclingRate: 100,
    };
    await expect(useCarbonStore.getState().saveFootprint(inputs)).rejects.toThrow('Authentication required');
  });

  test('11. successfully creates carbon reduction goal target', async () => {
    const fp = { id: 'fp-1', userId: 'u1', totalEmissions: 10000, calculatedAt: new Date().toISOString(), inputs: {} as CalculatorInputs, breakdown: { transport: 5000, energy: 3000, food: 1500, waste: 500 } };
    useCarbonStore.setState({ currentUser: mockUser, footprints: [fp] });
    const expectedGoal = { userId: 'u1', targetReductionPercent: 25, timelineMonths: 6 };
    (databaseService.saveGoal as jest.Mock).mockResolvedValue({ id: 'g-1', ...expectedGoal });
    (databaseService.getGoals as jest.Mock).mockResolvedValue([{ id: 'g-1', ...expectedGoal }]);
    (databaseService.getAchievements as jest.Mock).mockResolvedValue([]);
    await useCarbonStore.getState().createGoal(25, 6);
    expect(databaseService.saveGoal).toHaveBeenCalled();
    expect(useCarbonStore.getState().goals.length).toBe(1);
  });

  test('12. throws error when creating goal with no calculations history', async () => {
    useCarbonStore.setState({ currentUser: mockUser });
    await expect(useCarbonStore.getState().createGoal(25, 6)).rejects.toThrow('Please calculate your footprint first');
  });

  test('13. saves weekly plan generated by Gemini', async () => {
    useCarbonStore.setState({ currentUser: mockUser });
    const mockWeeks = [{ weekNumber: 1, tasks: [{ id: 't1', action: 'Bike', expectedSavings: 10, difficulty: 'Easy' as const, completed: false }] }];
    (databaseService.savePlan as jest.Mock).mockResolvedValue({ id: 'p1', userId: 'u1', createdAt: '', weeks: mockWeeks });
    await useCarbonStore.getState().saveGeneratedPlan(mockWeeks);
    expect(useCarbonStore.getState().activePlan?.weeks).toEqual(mockWeeks);
  });

  test('14. toggles weekly action task completed status', async () => {
    useCarbonStore.setState({
      currentUser: mockUser,
      activePlan: { id: 'p1', userId: 'u1', createdAt: '', weeks: [{ weekNumber: 1, tasks: [{ id: 't1', action: 'Bike', expectedSavings: 10, difficulty: 'Easy', completed: false }] }] },
    });
    (databaseService.savePlan as jest.Mock).mockResolvedValue({});
    (databaseService.getAchievements as jest.Mock).mockResolvedValue([]);
    await useCarbonStore.getState().toggleTaskCompletion(1, 't1', true);
    expect(useCarbonStore.getState().activePlan?.weeks[0].tasks[0].completed).toBe(true);
    expect(databaseService.savePlan).toHaveBeenCalled();
  });

  test('15. unlocks badge and updates achievements state', async () => {
    useCarbonStore.setState({ currentUser: mockUser });
    (databaseService.unlockAchievement as jest.Mock).mockResolvedValue({ badgeId: 'eco_beginner', progress: 100 });
    (databaseService.getAchievements as jest.Mock).mockResolvedValue([{ badgeId: 'eco_beginner', progress: 100 }]);
    await useCarbonStore.getState().unlockBadge('eco_beginner');
    expect(databaseService.unlockAchievement).toHaveBeenCalledWith('u1', 'eco_beginner');
    expect(useCarbonStore.getState().achievements.length).toBe(1);
  });
});
