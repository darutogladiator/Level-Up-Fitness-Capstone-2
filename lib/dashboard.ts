import { QUEST_TEMPLATES, buildProgress, calculateStreak, getProgression } from "./fitness";
import { ensureSchema, getDatabase } from "./server";
import type {
  DashboardData,
  NutritionEntry,
  Profile,
  RecommendationPlan,
  UserIdentity,
  Workout,
} from "./types";

type ProfileRow = {
  email: string;
  display_name: string;
  goal: string;
  experience_level: string;
  equipment: string;
  schedule_days: number;
  session_minutes: number;
  calorie_target: number;
  protein_target: number;
  accent: string;
};

type WorkoutRow = {
  id: string;
  workout_date: string;
  exercise: string;
  category: string;
  sets: number;
  reps: number;
  weight: number;
  duration_minutes: number;
  calories: number;
  notes: string;
  created_at: string;
};

type NutritionRow = {
  id: string;
  entry_date: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water_glasses: number;
  created_at: string;
};

type RecommendationRow = {
  plan_json: string;
};

function mapWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    workoutDate: row.workout_date,
    exercise: row.exercise,
    category: row.category,
    sets: row.sets,
    reps: row.reps,
    weight: row.weight,
    durationMinutes: row.duration_minutes,
    calories: row.calories,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapNutrition(row: NutritionRow): NutritionEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    meal: row.meal,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    waterGlasses: row.water_glasses,
    createdAt: row.created_at,
  };
}

export async function getDashboardData(
  user: UserIdentity,
  dateKey: string,
): Promise<DashboardData> {
  await ensureSchema();
  const db = getDatabase();
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT OR IGNORE INTO profiles
       (email, display_name, goal, experience_level, equipment, schedule_days,
        session_minutes, calorie_target, protein_target, accent, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      user.email,
      user.displayName,
      "Build strength and stay consistent",
      "Intermediate",
      "Full gym",
      4,
      45,
      2400,
      150,
      "cyan",
      now,
      now,
    )
    .run();

  const cutoff = new Date(`${dateKey}T12:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 90);
  const cutoffKey = cutoff.toISOString().slice(0, 10);

  const [
    profileRow,
    workoutResult,
    nutritionResult,
    completionResult,
    xpRow,
    recommendationRow,
  ] = await Promise.all([
    db.prepare("SELECT * FROM profiles WHERE email = ?").bind(user.email).first<ProfileRow>(),
    db
      .prepare(
        `SELECT id, workout_date, exercise, category, sets, reps, weight,
                duration_minutes, calories, notes, created_at
         FROM workouts
         WHERE user_email = ? AND workout_date >= ?
         ORDER BY workout_date DESC, created_at DESC`,
      )
      .bind(user.email, cutoffKey)
      .all<WorkoutRow>(),
    db
      .prepare(
        `SELECT id, entry_date, meal, calories, protein, carbs, fat,
                water_glasses, created_at
         FROM nutrition_entries
         WHERE user_email = ? AND entry_date >= ?
         ORDER BY entry_date DESC, created_at DESC`,
      )
      .bind(user.email, cutoffKey)
      .all<NutritionRow>(),
    db
      .prepare(
        "SELECT quest_id FROM quest_completions WHERE user_email = ? AND completion_date = ?",
      )
      .bind(user.email, dateKey)
      .all<{ quest_id: string }>(),
    db
      .prepare("SELECT COALESCE(SUM(xp), 0) AS total FROM xp_events WHERE user_email = ?")
      .bind(user.email)
      .first<{ total: number }>(),
    db
      .prepare(
        "SELECT plan_json FROM recommendations WHERE user_email = ? ORDER BY created_at DESC LIMIT 1",
      )
      .bind(user.email)
      .first<RecommendationRow>(),
  ]);

  if (!profileRow) throw new Error("Unable to initialize the fitness profile.");

  const profile: Profile = {
    email: profileRow.email,
    displayName: profileRow.display_name,
    goal: profileRow.goal,
    experienceLevel: profileRow.experience_level,
    equipment: profileRow.equipment,
    scheduleDays: profileRow.schedule_days,
    sessionMinutes: profileRow.session_minutes,
    calorieTarget: profileRow.calorie_target,
    proteinTarget: profileRow.protein_target,
    accent: profileRow.accent,
  };
  const workouts: Workout[] = (workoutResult.results as WorkoutRow[]).map(mapWorkout);
  const nutrition: NutritionEntry[] = (
    nutritionResult.results as NutritionRow[]
  ).map(mapNutrition);
  const completedQuestIds = new Set(
    (completionResult.results as Array<{ quest_id: string }>).map(
      (row) => row.quest_id,
    ),
  );
  const todayNutrition = nutrition.filter((entry) => entry.entryDate === dateKey);
  const weekStart = new Date(`${dateKey}T12:00:00Z`);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  const weekStartKey = weekStart.toISOString().slice(0, 10);
  const weekWorkouts = workouts.filter((workout) => workout.workoutDate >= weekStartKey);
  const monthStart = new Date(`${dateKey}T12:00:00Z`);
  monthStart.setUTCDate(monthStart.getUTCDate() - 27);
  const monthStartKey = monthStart.toISOString().slice(0, 10);
  const monthWorkouts = workouts.filter((workout) => workout.workoutDate >= monthStartKey);
  const totalVolume = Math.round(
    weekWorkouts.reduce(
      (sum, workout) => sum + workout.sets * workout.reps * workout.weight,
      0,
    ),
  );
  const estimatedOneRepMax = Math.round(
    workouts.reduce(
      (best, workout) =>
        Math.max(best, workout.weight * (1 + Math.max(workout.reps, 1) / 30)),
      0,
    ),
  );
  const consistencyTarget = Math.max(profile.scheduleDays * 4, 1);
  const recommendation = recommendationRow
    ? (JSON.parse(recommendationRow.plan_json) as RecommendationPlan)
    : null;

  return {
    profile,
    quests: QUEST_TEMPLATES.map((quest) => ({
      ...quest,
      done: completedQuestIds.has(quest.id),
    })),
    workouts,
    nutrition,
    recommendation,
    xp: getProgression(xpRow?.total ?? 0),
    stats: {
      streak: calculateStreak(workouts, dateKey),
      sessionsThisWeek: weekWorkouts.length,
      totalVolume,
      caloriesBurned: weekWorkouts.reduce((sum, workout) => sum + workout.calories, 0),
      proteinToday: todayNutrition.reduce((sum, entry) => sum + entry.protein, 0),
      caloriesToday: todayNutrition.reduce((sum, entry) => sum + entry.calories, 0),
      waterToday: todayNutrition.reduce((sum, entry) => sum + entry.waterGlasses, 0),
      consistency: Math.min(
        100,
        Math.round((monthWorkouts.length / consistencyTarget) * 100),
      ),
      estimatedOneRepMax,
    },
    progress: buildProgress(workouts, dateKey),
  };
}
