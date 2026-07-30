export type UserIdentity = {
  displayName: string;
  email: string;
};

export type Profile = {
  email: string;
  displayName: string;
  goal: string;
  experienceLevel: string;
  equipment: string;
  scheduleDays: number;
  sessionMinutes: number;
  calorieTarget: number;
  proteinTarget: number;
  accent: string;
};

export type Workout = {
  id: string;
  workoutDate: string;
  exercise: string;
  category: string;
  sets: number;
  reps: number;
  weight: number;
  durationMinutes: number;
  calories: number;
  notes: string;
  createdAt: string;
};

export type NutritionEntry = {
  id: string;
  entryDate: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterGlasses: number;
  createdAt: string;
};

export type Quest = {
  id: string;
  title: string;
  detail: string;
  type: "strength" | "cardio" | "nutrition" | "recovery";
  xp: number;
  done: boolean;
};

export type ProgressPoint = {
  label: string;
  volume: number;
  sessions: number;
};

export type RecommendationDay = {
  day: string;
  focus: string;
  durationMinutes: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    note: string;
  }>;
};

export type RecommendationPlan = {
  title: string;
  summary: string;
  safetyNote: string;
  rationale: string[];
  days: RecommendationDay[];
  engine: "openai" | "adaptive-fallback";
  createdAt: string;
};

export type DashboardData = {
  profile: Profile;
  quests: Quest[];
  workouts: Workout[];
  nutrition: NutritionEntry[];
  recommendation: RecommendationPlan | null;
  xp: {
    total: number;
    level: number;
    rank: string;
    title: string;
    currentLevelXp: number;
    nextLevelXp: number;
    progress: number;
  };
  stats: {
    streak: number;
    sessionsThisWeek: number;
    totalVolume: number;
    caloriesBurned: number;
    proteinToday: number;
    caloriesToday: number;
    waterToday: number;
    consistency: number;
    estimatedOneRepMax: number;
  };
  progress: ProgressPoint[];
};
