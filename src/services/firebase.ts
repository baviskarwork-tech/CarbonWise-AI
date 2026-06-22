// @ts-ignore
import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
// @ts-ignore
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { UserProfile, CarbonFootprint, Goal, WeeklyPlan, Achievement, BadgeId } from '../types';
import { calculateSustainabilityScore } from '../utils/score';

const isSimulation = process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Real Firebase initialization configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// @ts-ignore
import { Auth } from 'firebase/auth';
// @ts-ignore
import { Firestore } from 'firebase/firestore';

let auth: Auth;
let db: Firestore;

interface FirestoreDoc {
  id: string;
  data: () => Record<string, unknown>;
}

if (!isSimulation) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error: unknown) {
    console.warn("Failed to initialize Firebase, switching to Simulation Mode.", error);
  }
}

// In-Memory/Local Storage Fallback Mocks
const MOCK_STORAGE = {
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('carbonwise_mock_user');
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: UserProfile | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('carbonwise_mock_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('carbonwise_mock_user');
      localStorage.removeItem('carbonwise_mock_footprints');
      localStorage.removeItem('carbonwise_mock_goals');
      localStorage.removeItem('carbonwise_mock_plans');
      localStorage.removeItem('carbonwise_mock_achievements');
    }
  },
  getFootprints: (): CarbonFootprint[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('carbonwise_mock_footprints');
    return data ? JSON.parse(data) : [];
  },
  saveFootprint: (fp: CarbonFootprint) => {
    if (typeof window === 'undefined') return;
    const fps = MOCK_STORAGE.getFootprints();
    fps.push(fp);
    localStorage.setItem('carbonwise_mock_footprints', JSON.stringify(fps));
  },
  getGoals: (): Goal[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('carbonwise_mock_goals');
    return data ? JSON.parse(data) : [];
  },
  saveGoal: (g: Goal) => {
    if (typeof window === 'undefined') return;
    const gls = MOCK_STORAGE.getGoals();
    gls.push(g);
    localStorage.setItem('carbonwise_mock_goals', JSON.stringify(gls));
  },
  updateGoals: (goals: Goal[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('carbonwise_mock_goals', JSON.stringify(goals));
  },
  getPlans: (): WeeklyPlan[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('carbonwise_mock_plans');
    return data ? JSON.parse(data) : [];
  },
  savePlan: (p: WeeklyPlan) => {
    if (typeof window === 'undefined') return;
    const pls = MOCK_STORAGE.getPlans();
    // Overwrite existing plan for user
    const filtered = pls.filter(item => item.userId !== p.userId);
    filtered.push(p);
    localStorage.setItem('carbonwise_mock_plans', JSON.stringify(filtered));
  },
  getAchievements: (): Achievement[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('carbonwise_mock_achievements');
    return data ? JSON.parse(data) : [];
  },
  saveAchievement: (ach: Achievement) => {
    if (typeof window === 'undefined') return;
    const achs = MOCK_STORAGE.getAchievements();
    const index = achs.findIndex(a => a.badgeId === ach.badgeId);
    if (index >= 0) {
      achs[index] = ach;
    } else {
      achs.push(ach);
    }
    localStorage.setItem('carbonwise_mock_achievements', JSON.stringify(achs));
  }
};

export const authService = {
  isSimulation,
  
  onAuthStateChange: (callback: (user: UserProfile | null) => void) => {
    if (isSimulation) {
      // Trigger callback with stored mock user initially
      const mockUser = MOCK_STORAGE.getUser();
      callback(mockUser);
      return () => {}; // return unsubscriber
    } else {
      return onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // Fetch additional profile data from Firestore
          const profileDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (profileDoc.exists()) {
            callback(profileDoc.data() as UserProfile);
          } else {
            // Document doesn't exist yet, create default
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Eco Guardian',
              createdAt: new Date().toISOString(),
              sustainabilityScore: 50, // default middle score
            };
            await setDoc(doc(db, 'users', fbUser.uid), newProfile);
            callback(newProfile);
          }
        } else {
          callback(null);
        }
      });
    }
  },

  signInWithGoogle: async (): Promise<UserProfile> => {
    if (isSimulation) {
      const mockUser: UserProfile = {
        uid: 'mock-google-user-id',
        email: 'green.hero@gmail.com',
        displayName: 'Google Eco Hero',
        createdAt: new Date().toISOString(),
        sustainabilityScore: 75,
      };
      MOCK_STORAGE.setUser(mockUser);
      // Unlock Eco Beginner badge on calculation or signup
      await databaseService.unlockAchievement(mockUser.uid, 'eco_beginner');
      return mockUser;
    } else {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);
      
      let profile: UserProfile;
      if (userSnap.exists()) {
        profile = userSnap.data() as UserProfile;
      } else {
        profile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Eco Guardian',
          createdAt: new Date().toISOString(),
          sustainabilityScore: 50,
        };
        await setDoc(userRef, profile);
      }
      return profile;
    }
  },

  signUpWithEmail: async (email: string, password: string, displayName: string): Promise<UserProfile> => {
    if (isSimulation) {
      const mockUser: UserProfile = {
        uid: `mock-email-user-${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        sustainabilityScore: 60,
      };
      MOCK_STORAGE.setUser(mockUser);
      return mockUser;
    } else {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      const profile: UserProfile = {
        uid: result.user.uid,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        sustainabilityScore: 50,
      };
      await setDoc(doc(db, 'users', result.user.uid), profile);
      return profile;
    }
  },

  signInWithEmail: async (email: string, password: string): Promise<UserProfile> => {
    if (isSimulation) {
      const currentMock = MOCK_STORAGE.getUser();
      if (currentMock && currentMock.email === email) {
        return currentMock;
      }
      const mockUser: UserProfile = {
        uid: 'mock-email-user-id',
        email,
        displayName: 'Eco Leader',
        createdAt: new Date().toISOString(),
        sustainabilityScore: 65,
      };
      MOCK_STORAGE.setUser(mockUser);
      return mockUser;
    } else {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const docSnap = await getDoc(doc(db, 'users', result.user.uid));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      throw new Error("User profile not found in database.");
    }
  },

  signOut: async (): Promise<void> => {
    if (isSimulation) {
      MOCK_STORAGE.setUser(null);
    } else {
      await firebaseSignOut(auth);
    }
  }
};

export const databaseService = {
  // 1. Footprints
  saveFootprint: async (userId: string, footprint: Omit<CarbonFootprint, 'id' | 'calculatedAt'>): Promise<CarbonFootprint> => {
    const scoreResult = calculateSustainabilityScore(footprint.breakdown);
    const newDoc: CarbonFootprint = {
      ...footprint,
      id: isSimulation ? `mock-fp-${Date.now()}` : '',
      calculatedAt: new Date().toISOString(),
    };

    if (isSimulation) {
      MOCK_STORAGE.saveFootprint(newDoc);
      // Update local storage user score
      const user = MOCK_STORAGE.getUser();
      if (user && user.uid === userId) {
        user.sustainabilityScore = scoreResult.score;
        user.currentFootprintId = newDoc.id;
        MOCK_STORAGE.setUser(user);
      }
      await databaseService.unlockAchievement(userId, 'eco_beginner');
      if (scoreResult.score >= 80) {
        await databaseService.unlockAchievement(userId, 'green_champion');
      }
      return newDoc;
    } else {
      const fpCol = collection(db, 'footprints');
      const docRef = await addDoc(fpCol, { ...newDoc, userId });
      newDoc.id = docRef.id;
      // Update User Score in DB
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { 
        sustainabilityScore: scoreResult.score,
        currentFootprintId: docRef.id
      }, { merge: true });

      await databaseService.unlockAchievement(userId, 'eco_beginner');
      if (scoreResult.score >= 80) {
        await databaseService.unlockAchievement(userId, 'green_champion');
      }
      return newDoc;
    }
  },

  getFootprints: async (userId: string): Promise<CarbonFootprint[]> => {
    if (isSimulation) {
      return MOCK_STORAGE.getFootprints().filter(fp => fp.userId === userId);
    } else {
      const q = query(
        collection(db, 'footprints'), 
        where('userId', '==', userId),
        orderBy('calculatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d: FirestoreDoc) => ({ ...d.data() as unknown as CarbonFootprint, id: d.id }));
    }
  },

  // 2. Goals
  saveGoal: async (userId: string, goal: Omit<Goal, 'id' | 'createdAt' | 'progressPercent' | 'isCompleted'>): Promise<Goal> => {
    const newGoal: Goal = {
      ...goal,
      id: isSimulation ? `mock-goal-${Date.now()}` : '',
      createdAt: new Date().toISOString(),
      progressPercent: 0,
      isCompleted: false,
    };

    if (isSimulation) {
      MOCK_STORAGE.saveGoal(newGoal);
      await databaseService.unlockAchievement(userId, 'carbon_reducer');
      return newGoal;
    } else {
      const docRef = await addDoc(collection(db, 'goals'), { ...newGoal, userId });
      newGoal.id = docRef.id;
      await databaseService.unlockAchievement(userId, 'carbon_reducer');
      return newGoal;
    }
  },

  getGoals: async (userId: string): Promise<Goal[]> => {
    if (isSimulation) {
      const goals = MOCK_STORAGE.getGoals().filter(g => g.userId === userId);
      // Recalculate goals progress dynamically based on latest footprints
      const footprints = MOCK_STORAGE.getFootprints().filter(fp => fp.userId === userId);
      if (footprints.length > 1 && goals.length > 0) {
        const latestFp = footprints[footprints.length - 1];
        const updatedGoals = goals.map(g => {
          const reducedEmissions = g.startEmissions - latestFp.totalEmissions;
          const targetReduction = g.startEmissions - g.targetEmissions;
          let progress = targetReduction > 0 ? (reducedEmissions / targetReduction) * 100 : 0;
          progress = Math.max(0, Math.min(100, Math.round(progress)));
          const isCompleted = progress >= 100;
          return { ...g, currentEmissions: latestFp.totalEmissions, progressPercent: progress, isCompleted };
        });
        MOCK_STORAGE.updateGoals(updatedGoals);
        return updatedGoals;
      }
      return goals;
    } else {
      const q = query(collection(db, 'goals'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const goals = snapshot.docs.map((d: FirestoreDoc) => ({ ...d.data() as unknown as Goal, id: d.id }));
      return goals;
    }
  },

  // 3. Weekly Plans
  savePlan: async (userId: string, plan: WeeklyPlan): Promise<WeeklyPlan> => {
    if (isSimulation) {
      MOCK_STORAGE.savePlan(plan);
      return plan;
    } else {
      // Overwrite/Set document with userId as doc ID to have one plan active at a time
      await setDoc(doc(db, 'plans', userId), plan);
      return plan;
    }
  },

  getPlan: async (userId: string): Promise<WeeklyPlan | null> => {
    if (isSimulation) {
      const list = MOCK_STORAGE.getPlans();
      const plan = list.find(p => p.userId === userId);
      return plan || null;
    } else {
      const snap = await getDoc(doc(db, 'plans', userId));
      return snap.exists() ? (snap.data() as WeeklyPlan) : null;
    }
  },

  // 4. Achievements / Badges
  getAchievements: async (userId: string): Promise<Achievement[]> => {
    if (isSimulation) {
      return MOCK_STORAGE.getAchievements().filter(a => a.userId === userId);
    } else {
      const q = query(collection(db, 'achievements'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d: FirestoreDoc) => d.data() as unknown as Achievement);
    }
  },

  unlockAchievement: async (userId: string, badgeId: BadgeId): Promise<Achievement | null> => {
    const existing = await databaseService.getAchievements(userId);
    const badgeFound = existing.find(a => a.badgeId === badgeId);
    if (badgeFound && badgeFound.progress >= 100) return badgeFound;

    const newAch: Achievement = {
      id: isSimulation ? `mock-ach-${badgeId}` : `${userId}_${badgeId}`,
      userId,
      badgeId,
      unlockedAt: new Date().toISOString(),
      progress: 100,
    };

    if (isSimulation) {
      MOCK_STORAGE.saveAchievement(newAch);
      return newAch;
    } else {
      await setDoc(doc(db, 'achievements', newAch.id), newAch);
      return newAch;
    }
  }
};
