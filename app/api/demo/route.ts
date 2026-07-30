import { QUEST_TEMPLATES, isDateKey } from "@/lib/fitness";
import {
  badRequest,
  ensureSchema,
  getDatabase,
  getRequestUser,
  unauthorized,
} from "@/lib/server";

// Assigned ownership area: Khang — repeatable showcase setup and release verification.
export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const body = (await request.json()) as { date?: unknown };
  if (!isDateKey(body.date)) return badRequest("A valid showcase date is required.");
  await ensureSchema();
  const db = getDatabase();
  const now = new Date().toISOString();
  const base = new Date(`${body.date}T12:00:00Z`);
  const samples = [
    { offset: 0, exercise: "Barbell bench press", category: "Strength", sets: 4, reps: 8, weight: 145, duration: 48, calories: 310 },
    { offset: 2, exercise: "Zone 2 bike", category: "Cardio", sets: 1, reps: 1, weight: 0, duration: 35, calories: 280 },
    { offset: 4, exercise: "Back squat", category: "Strength", sets: 4, reps: 6, weight: 205, duration: 52, calories: 390 },
    { offset: 7, exercise: "Upper-body hypertrophy", category: "Strength", sets: 16, reps: 10, weight: 55, duration: 55, calories: 360 },
    { offset: 10, exercise: "Mobility flow", category: "Mobility", sets: 3, reps: 10, weight: 0, duration: 24, calories: 110 },
    { offset: 13, exercise: "Romanian deadlift", category: "Strength", sets: 4, reps: 8, weight: 165, duration: 46, calories: 330 },
    { offset: 17, exercise: "Incline walk", category: "Cardio", sets: 1, reps: 1, weight: 0, duration: 40, calories: 295 },
    { offset: 21, exercise: "Full-body foundation", category: "Strength", sets: 12, reps: 8, weight: 75, duration: 50, calories: 345 },
  ];

  const statements = samples.flatMap((sample, index) => {
    const date = new Date(base);
    date.setUTCDate(base.getUTCDate() - sample.offset);
    const dateKey = date.toISOString().slice(0, 10);
    const id = `showcase-workout-${index}-${user.email}`;
    return [
      db
        .prepare(
          `INSERT OR IGNORE INTO workouts
           (id, user_email, workout_date, exercise, category, sets, reps, weight,
            duration_minutes, calories, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          user.email,
          dateKey,
          sample.exercise,
          sample.category,
          sample.sets,
          sample.reps,
          sample.weight,
          sample.duration,
          sample.calories,
          "Showcase journey sample",
          now,
          now,
        ),
      db
        .prepare(
          "INSERT OR IGNORE INTO xp_events (id, user_email, source_type, source_id, xp, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(`showcase-xp-workout-${index}-${user.email}`, user.email, "workout", id, 120, now),
    ];
  });

  const nutrition = [
    ["Breakfast protocol", 540, 38, 58, 18, 2],
    ["Post-workout meal", 720, 55, 84, 21, 2],
    ["Recovery snack", 330, 29, 36, 9, 2],
  ] as const;
  nutrition.forEach((entry, index) => {
    const id = `showcase-nutrition-${index}-${user.email}`;
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO nutrition_entries
           (id, user_email, entry_date, meal, calories, protein, carbs, fat, water_glasses, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(id, user.email, body.date, ...entry, now),
      db
        .prepare(
          "INSERT OR IGNORE INTO xp_events (id, user_email, source_type, source_id, xp, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(`showcase-xp-nutrition-${index}-${user.email}`, user.email, "nutrition", id, 40, now),
    );
  });

  for (const questId of ["protein", "recovery"]) {
    const quest = QUEST_TEMPLATES.find((item) => item.id === questId)!;
    const sourceId = `${body.date}:${quest.id}`;
    statements.push(
      db
        .prepare(
          "INSERT OR IGNORE INTO quest_completions (id, user_email, quest_id, completion_date, xp, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(
          `showcase-quest-${quest.id}-${user.email}`,
          user.email,
          quest.id,
          body.date,
          quest.xp,
          now,
        ),
      db
        .prepare(
          "INSERT OR IGNORE INTO xp_events (id, user_email, source_type, source_id, xp, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(`showcase-xp-quest-${quest.id}-${user.email}`, user.email, "quest", sourceId, quest.xp, now),
    );
  }

  await db.batch(statements);
  return Response.json({ message: "Showcase journey loaded with persistent sample history." });
}
