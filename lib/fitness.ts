import type {
  NutritionEntry,
  ProgressPoint,
  Quest,
  RecommendationPlan,
  Workout,
} from "./types";

export const QUEST_TEMPLATES: Omit<Quest, "done">[] = [
  {
    id: "strength",
    title: "Complete one training session",
    detail: "Log a strength, cardio, or mobility workout",
    type: "strength",
    xp: 350,
  },
  {
    id: "movement",
    title: "Daily movement patrol",
    detail: "Complete an active-recovery or cardio session",
    type: "cardio",
    xp: 180,
  },
  {
    id: "protein",
    title: "Hit the protein target",
    detail: "Log enough protein to reach your daily goal",
    type: "nutrition",
    xp: 120,
  },
  {
    id: "recovery",
    title: "Recovery protocol",
    detail: "Complete mobility, stretching, or mindful recovery",
    type: "recovery",
    xp: 90,
  },
];

export function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function getRank(totalXp: number) {
  if (totalXp >= 22000) return { rank: "S", title: "Monarch" };
  if (totalXp >= 15000) return { rank: "A", title: "Ascendant" };
  if (totalXp >= 10000) return { rank: "B", title: "Vanguard" };
  if (totalXp >= 6000) return { rank: "C", title: "Hunter" };
  if (totalXp >= 3000) return { rank: "D", title: "Striver" };
  return { rank: "E", title: "Awakened" };
}

export function getProgression(totalXp: number) {
  const safeXp = Math.max(0, totalXp);
  const level = Math.floor(safeXp / 1000) + 1;
  const currentLevelXp = safeXp % 1000;
  const rank = getRank(safeXp);
  return {
    total: safeXp,
    level,
    ...rank,
    currentLevelXp,
    nextLevelXp: 1000,
    progress: Math.round((currentLevelXp / 1000) * 100),
  };
}

export function calculateStreak(workouts: Workout[], todayKey: string) {
  const dates = new Set(workouts.map((workout) => workout.workoutDate));
  const cursor = new Date(`${todayKey}T12:00:00Z`);
  let streak = 0;
  for (let day = 0; day < 366; day += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dates.has(key)) {
      if (day === 0) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
        continue;
      }
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function buildProgress(workouts: Workout[], todayKey: string): ProgressPoint[] {
  const end = new Date(`${todayKey}T12:00:00Z`);
  return Array.from({ length: 8 }, (_, index) => {
    const weekEnd = new Date(end);
    weekEnd.setUTCDate(end.getUTCDate() - (7 - index) * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setUTCDate(weekEnd.getUTCDate() - 6);
    const startKey = weekStart.toISOString().slice(0, 10);
    const endKey = weekEnd.toISOString().slice(0, 10);
    const weekWorkouts = workouts.filter(
      (workout) => workout.workoutDate >= startKey && workout.workoutDate <= endKey,
    );
    return {
      label: `W${index + 1}`,
      volume: Math.round(
        weekWorkouts.reduce(
          (sum, workout) => sum + workout.sets * workout.reps * workout.weight,
          0,
        ),
      ),
      sessions: weekWorkouts.length,
    };
  });
}

export function buildFallbackRecommendation(input: {
  goal: string;
  experienceLevel: string;
  equipment: string;
  scheduleDays: number;
  sessionMinutes: number;
  limitations: string;
}): RecommendationPlan {
  const days = Math.min(6, Math.max(2, input.scheduleDays));
  const split =
    days <= 3
      ? ["Full body strength", "Conditioning + core", "Full body progression"]
      : ["Upper strength", "Lower strength", "Recovery + core", "Full body power", "Zone 2 conditioning", "Mobility"];
  const exercisesByFocus: Record<string, RecommendationPlan["days"][number]["exercises"]> = {
    "Upper strength": [
      { name: "Bench press", sets: 4, reps: "6–8", note: "Stop with 2 reps in reserve" },
      { name: "Chest-supported row", sets: 4, reps: "8–10", note: "Control the lowering phase" },
      { name: "Overhead press", sets: 3, reps: "8", note: "Use a pain-free range" },
    ],
    "Lower strength": [
      { name: "Back squat", sets: 4, reps: "5–8", note: "Prioritize stable depth" },
      { name: "Romanian deadlift", sets: 3, reps: "8–10", note: "Keep the spine neutral" },
      { name: "Split squat", sets: 3, reps: "10 / side", note: "Move under control" },
    ],
    "Full body strength": [
      { name: "Goblet or back squat", sets: 4, reps: "8", note: "Choose the equipment available" },
      { name: "Press variation", sets: 3, reps: "8–10", note: "Leave 2 reps in reserve" },
      { name: "Row variation", sets: 3, reps: "10", note: "Pause at the top" },
    ],
    "Full body progression": [
      { name: "Deadlift variation", sets: 3, reps: "5–6", note: "Use repeatable technique" },
      { name: "Incline press", sets: 3, reps: "8–10", note: "Add load only with clean reps" },
      { name: "Lat pulldown", sets: 3, reps: "10–12", note: "Avoid momentum" },
    ],
    "Full body power": [
      { name: "Trap-bar deadlift", sets: 4, reps: "5", note: "Move with intent, not failure" },
      { name: "Dumbbell bench press", sets: 3, reps: "8", note: "Keep effort near RPE 8" },
      { name: "Walking lunge", sets: 3, reps: "10 / side", note: "Maintain balance" },
    ],
    "Conditioning + core": [
      { name: "Intervals", sets: 6, reps: "1 min", note: "Alternate hard and easy minutes" },
      { name: "Dead bug", sets: 3, reps: "10 / side", note: "Keep the lower back supported" },
      { name: "Side plank", sets: 3, reps: "30 sec / side", note: "Stop before form breaks" },
    ],
    "Zone 2 conditioning": [
      { name: "Bike, walk, or row", sets: 1, reps: "25–40 min", note: "Maintain conversational pace" },
      { name: "Cooldown walk", sets: 1, reps: "5 min", note: "Let breathing normalize" },
    ],
    "Recovery + core": [
      { name: "Easy walk", sets: 1, reps: "20 min", note: "Keep intensity comfortable" },
      { name: "Bird dog", sets: 3, reps: "8 / side", note: "Move slowly" },
      { name: "Hip mobility", sets: 2, reps: "60 sec / side", note: "No forced range" },
    ],
    Mobility: [
      { name: "Shoulder mobility", sets: 2, reps: "60 sec", note: "Stay in a pain-free range" },
      { name: "Hip flow", sets: 2, reps: "60 sec", note: "Breathe slowly" },
      { name: "Thoracic rotation", sets: 2, reps: "8 / side", note: "Rotate under control" },
    ],
  };

  return {
    title: `${days}-day ${input.goal || "fitness"} protocol`,
    summary: `A ${input.experienceLevel.toLowerCase()} plan built for ${input.equipment.toLowerCase()} and sessions of about ${input.sessionMinutes} minutes.`,
    safetyNote:
      "General fitness guidance only. Stop if you feel sharp, new, or persistent pain and consult a qualified health professional.",
    rationale: [
      `Training frequency matches the requested ${days} days per week.`,
      `Exercise choices are compatible with ${input.equipment.toLowerCase()}.`,
      input.limitations
        ? `The plan avoids assuming that the stated limitation is medically safe: ${input.limitations}.`
        : "Effort is capped below failure to support repeatable weekly progress.",
    ],
    days: split.slice(0, days).map((focus, index) => ({
      day: `Day ${index + 1}`,
      focus,
      durationMinutes: input.sessionMinutes,
      exercises: exercisesByFocus[focus] ?? exercisesByFocus["Full body strength"],
    })),
    engine: "adaptive-fallback",
    createdAt: new Date().toISOString(),
  };
}

export function sumNutrition(entries: NutritionEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat,
      water: totals.water + entry.waterGlasses,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 },
  );
}
