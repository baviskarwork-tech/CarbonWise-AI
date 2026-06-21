import { create } from 'zustand';
import { 
  UserProfile, 
  CarbonFootprint, 
  Goal, 
  WeeklyPlan, 
  Achievement, 
  CalculatorInputs, 
  BadgeId, 
  WeeklyPlanWeek
} from '../types';
import { authService, databaseService } from '../services/firebase';
import { calculateCarbonFootprint } from '../utils/carbon';
import { calculateSustainabilityScore } from '../utils/score';

interface CarbonState {
  // Auth state
  currentUser: UserProfile | null;
  authLoading: boolean;
  authError: string | null;

  // Data states
  footprints: CarbonFootprint[];
  goals: Goal[];
  activePlan: WeeklyPlan | null;
  achievements: Achievement[];
  dataLoading: boolean;

  // Initializers
  initAuth: () => () => void; // Returns unsubscribe function
  
  // Auth Actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;

  // Data Actions
  fetchData: () => Promise<void>;
  saveFootprint: (inputs: CalculatorInputs) => Promise<CarbonFootprint>;
  createGoal: (targetReductionPercent: number, timelineMonths: number) => Promise<Goal>;
  saveGeneratedPlan: (weeks: WeeklyPlanWeek[]) => Promise<WeeklyPlan>;
  toggleTaskCompletion: (weekNumber: number, taskId: string, completed: boolean) => Promise<void>;
  unlockBadge: (badgeId: BadgeId) => Promise<void>;
}

export const useCarbonStore = create<CarbonState>((set, get) => ({
  currentUser: null,
  authLoading: true,
  authError: null,
  footprints: [],
  goals: [],
  activePlan: null,
  achievements: [],
  dataLoading: false,

  initAuth: () => {
    set({ authLoading: true });
    return authService.onAuthStateChange(async (user) => {
      set({ currentUser: user, authLoading: false });
      if (user) {
        // Automatically fetch data when user signs in
        await get().fetchData();
      } else {
        // Clear data state on logout
        set({ footprints: [], goals: [], activePlan: null, achievements: [] });
      }
    });
  },

  loginWithGoogle: async () => {
    set({ authLoading: true, authError: null });
    try {
      const user = await authService.signInWithGoogle();
      set({ currentUser: user, authLoading: false });
      await get().fetchData();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to sign in with Google';
      set({ authLoading: false, authError: errMsg });
      throw error;
    }
  },

  loginWithEmail: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const user = await authService.signInWithEmail(email, password);
      set({ currentUser: user, authLoading: false });
      await get().fetchData();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to log in';
      set({ authLoading: false, authError: errMsg });
      throw error;
    }
  },

  registerWithEmail: async (email, password, displayName) => {
    set({ authLoading: true, authError: null });
    try {
      const user = await authService.signUpWithEmail(email, password, displayName);
      set({ currentUser: user, authLoading: false });
      await get().fetchData();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to register';
      set({ authLoading: false, authError: errMsg });
      throw error;
    }
  },

  logout: async () => {
    set({ authLoading: true });
    try {
      await authService.signOut();
      set({ currentUser: null, authLoading: false });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to log out';
      set({ authLoading: false, authError: errMsg });
      throw error;
    }
  },

  fetchData: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    set({ dataLoading: true });
    try {
      const [fps, gls, plan, achs] = await Promise.all([
        databaseService.getFootprints(currentUser.uid),
        databaseService.getGoals(currentUser.uid),
        databaseService.getPlan(currentUser.uid),
        databaseService.getAchievements(currentUser.uid),
      ]);
      set({
        footprints: fps,
        goals: gls,
        activePlan: plan,
        achievements: achs,
        dataLoading: false,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ dataLoading: false });
    }
  },

  saveFootprint: async (inputs: CalculatorInputs) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error("Authentication required");

    const { breakdown, totalEmissions } = calculateCarbonFootprint(inputs);
    const scoreObj = calculateSustainabilityScore(breakdown);

    const footprintData: Omit<CarbonFootprint, 'id' | 'calculatedAt'> = {
      userId: currentUser.uid,
      inputs,
      breakdown,
      totalEmissions,
    };

    const savedFp = await databaseService.saveFootprint(currentUser.uid, footprintData);

    // Refresh state
    const fps = await databaseService.getFootprints(currentUser.uid);
    const achs = await databaseService.getAchievements(currentUser.uid);
    
    // Update active score inside the state's user object
    const updatedUser: UserProfile = {
      ...currentUser,
      sustainabilityScore: scoreObj.score,
      currentFootprintId: savedFp.id,
    };

    set({ 
      footprints: fps, 
      achievements: achs,
      currentUser: updatedUser,
    });

    return savedFp;
  },

  createGoal: async (targetReductionPercent: number, timelineMonths: number) => {
    const { currentUser, footprints } = get();
    if (!currentUser) throw new Error("Authentication required");
    if (footprints.length === 0) throw new Error("Please calculate your footprint first");

    const latestFp = footprints[footprints.length - 1];
    
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + timelineMonths);

    const targetEmissions = Math.round(latestFp.totalEmissions * (1 - targetReductionPercent / 100));

    const goalData: Omit<Goal, 'id' | 'createdAt' | 'progressPercent' | 'isCompleted'> = {
      userId: currentUser.uid,
      targetReductionPercent,
      timelineMonths,
      targetDate: targetDate.toISOString(),
      startEmissions: latestFp.totalEmissions,
      targetEmissions,
      currentEmissions: latestFp.totalEmissions,
    };

    const savedGoal = await databaseService.saveGoal(currentUser.uid, goalData);

    // Refresh goals and achievements
    const gls = await databaseService.getGoals(currentUser.uid);
    const achs = await databaseService.getAchievements(currentUser.uid);
    set({ goals: gls, achievements: achs });

    return savedGoal;
  },

  saveGeneratedPlan: async (weeks: WeeklyPlanWeek[]) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error("Authentication required");

    const plan: WeeklyPlan = {
      id: `plan-${currentUser.uid}`,
      userId: currentUser.uid,
      createdAt: new Date().toISOString(),
      weeks,
    };

    const savedPlan = await databaseService.savePlan(currentUser.uid, plan);
    set({ activePlan: savedPlan });
    return savedPlan;
  },

  toggleTaskCompletion: async (weekNumber: number, taskId: string, completed: boolean) => {
    const { currentUser, activePlan } = get();
    if (!currentUser || !activePlan) throw new Error("No active plan to modify");

    const updatedWeeks = activePlan.weeks.map((week) => {
      if (week.weekNumber === weekNumber) {
        const updatedTasks = week.tasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, completed };
          }
          return task;
        });
        return { ...week, tasks: updatedTasks };
      }
      return week;
    });

    const updatedPlan: WeeklyPlan = {
      ...activePlan,
      weeks: updatedWeeks,
    };

    await databaseService.savePlan(currentUser.uid, updatedPlan);
    set({ activePlan: updatedPlan });

    // Custom check: If all tasks in all weeks are completed, unlock Green Champion or Hero
    const allCompleted = updatedWeeks.every((w) => w.tasks.every((t) => t.completed));
    if (allCompleted) {
      await get().unlockBadge('net_zero_hero');
    }
  },

  unlockBadge: async (badgeId: BadgeId) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    await databaseService.unlockAchievement(currentUser.uid, badgeId);
    const achs = await databaseService.getAchievements(currentUser.uid);
    set({ achievements: achs });
  }
}));
