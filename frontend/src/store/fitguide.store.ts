import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FitnessGoal =
  | 'lose_weight'
  | 'gain_muscle'
  | 'get_stronger'
  | 'marathon'
  | 'flexibility'
  | 'endurance'
  | 'wellness'
  | 'recovery'

export type DietType =
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'non_vegetarian'
  | 'keto'
  | 'paleo'
  | 'intermittent_fasting'
  | 'none'

export type WorkoutType =
  | 'gym'
  | 'running'
  | 'yoga'
  | 'pilates'
  | 'swimming'
  | 'kickboxing'
  | 'sports'
  | 'walking'
  | 'home'
  | 'cycling'
  | 'calisthenics'
  | 'hiit'

export interface UserProfile {
  age: number
  weight: number
  height: number
  gender: 'male' | 'female' | 'nonbinary' | 'prefer_not'
  occupation: string
  goal: FitnessGoal
  medicalConditions: string
  workouts: WorkoutType[]
  preferredTime: string
  diet: DietType
  allergies: string
  daysPerWeek: number
  sessionDuration: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface GeneratedPlan {
  calories: number
  protein: number
  carbs: number
  fats: number
  bmi: number
  bmiCategory: string
  weeklyWorkouts: WorkoutDay[]
  mealPlan: MealDay
  coachNote: string
  generatedAt: string
}

export interface WorkoutDay {
  day: string
  name: string
  type: string
  exercises: Exercise[]
}

export interface Exercise {
  name: string
  sets?: number
  reps?: string
  duration?: string
  rest?: string
}

export interface MealDay {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snacks: Meal[]
}

export interface Meal {
  name: string
  description: string
  calories: number
}

interface FitGuideStore {
  // Onboarding
  currentStep: number
  profile: Partial<UserProfile>
  plan: GeneratedPlan | null
  isGenerating: boolean
  error: string | null

  // Actions
  setStep: (step: number) => void
  updateProfile: (data: Partial<UserProfile>) => void
  setPlan: (plan: GeneratedPlan) => void
  setGenerating: (val: boolean) => void
  setError: (err: string | null) => void
  reset: () => void
}

const initialProfile: Partial<UserProfile> = {}

export const useFitGuideStore = create<FitGuideStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      profile: initialProfile,
      plan: null,
      isGenerating: false,
      error: null,

      setStep: (step) => set({ currentStep: step }),

      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),

      setPlan: (plan) => set({ plan }),

      setGenerating: (val) => set({ isGenerating: val }),

      setError: (err) => set({ error: err }),

      reset: () =>
        set({
          currentStep: 1,
          profile: initialProfile,
          plan: null,
          error: null,
        }),
    }),
    {
      name: 'fitguide-store',
      partialize: (state) => ({ profile: state.profile, plan: state.plan }),
    }
  )
)
