import { QUEST_TEMPLATES, isDateKey } from "@/lib/fitness";
import {
  badRequest,
  ensureSchema,
  getDatabase,
  getRequestUser,
  numberInRange,
  unauthorized,
} from "@/lib/server";

const categories = new Set(["Strength", "Cardio", "Mobility", "Sports", "Recovery"]);

type ParsedWorkout =
  | {
      value: {
        exercise: string;
        category: string;
        workoutDate: string;
        sets: number;
        reps: number;
        weight: number;
        durationMinutes: number;
        calories: number;
        notes: string;
      };
    }
  | { error: string };

function parseWorkout(body: Record<string, unknown>): ParsedWorkout {
  const exercise = typeof body.exercise === "string" ? body.exercise.trim() : "";
  const category = typeof body.category === "string" ? body.category : "";
  const workoutDate = body.workoutDate;
  if (exercise.length < 2 || exercise.length > 80) {
    return { error: "Exercise name must be between 2 and 80 characters." };
  }
  if (!categories.has(category)) {
    return { error: "Select a valid workout category." };
  }
  if (!isDateKey(workoutDate)) {
    return { error: "Select a valid workout date." };
  }
  return {
    value: {
      exercise,
      category,
      workoutDate,
      sets: Math.round(numberInRange(body.sets, 1, 50, 1)!),
      reps: Math.round(numberInRange(body.reps, 1, 200, 1)!),
      weight: numberInRange(body.weight, 0, 2000, 0)!,
      durationMinutes: Math.round(numberInRange(body.durationMinutes, 1, 600, 30)!),
      calories: Math.round(numberInRange(body.calories, 0, 10000, 0)!),
      notes:
        typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "",
    },
  };
}

// Assigned ownership area: Johnkerby — workout create, edit, delete, and progress events.
export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const parsed = parseWorkout((await request.json()) as Record<string, unknown>);
  if ("error" in parsed) return badRequest(parsed.error);
  await ensureSchema();
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const quest = QUEST_TEMPLATES.find((item) => item.id === "strength")!;
  const questSourceId = `${parsed.value.workoutDate}:${quest.id}`;
  await db.batch([
    db
      .prepare(
        `INSERT INTO workouts
         (id, user_email, workout_date, exercise, category, sets, reps, weight,
          duration_minutes, calories, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        user.email,
        parsed.value.workoutDate,
        parsed.value.exercise,
        parsed.value.category,
        parsed.value.sets,
        parsed.value.reps,
        parsed.value.weight,
        parsed.value.durationMinutes,
        parsed.value.calories,
        parsed.value.notes,
        now,
        now,
      ),
    db
      .prepare(
        "INSERT OR IGNORE INTO xp_events (id, user_email, source_type, source_id, xp, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(crypto.randomUUID(), user.email, "workout", id, 120, now),
    db
      .prepare(
        "INSERT OR IGNORE INTO quest_completions (id, user_email, quest_id, completion_date, xp, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.email,
        quest.id,
        parsed.value.workoutDate,
        quest.xp,
        now,
      ),
    db
      .prepare(
        "INSERT OR IGNORE INTO xp_events (id, user_email, source_type, source_id, xp, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.email,
        "quest",
        questSourceId,
        quest.xp,
        now,
      ),
  ]);
  return Response.json({ id, message: "Workout logged and XP awarded." }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const body = (await request.json()) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return badRequest("Workout id is required.");
  const parsed = parseWorkout(body);
  if ("error" in parsed) return badRequest(parsed.error);
  await ensureSchema();
  const result = await getDatabase()
    .prepare(
      `UPDATE workouts SET workout_date = ?, exercise = ?, category = ?, sets = ?,
       reps = ?, weight = ?, duration_minutes = ?, calories = ?, notes = ?, updated_at = ?
       WHERE id = ? AND user_email = ?`,
    )
    .bind(
      parsed.value.workoutDate,
      parsed.value.exercise,
      parsed.value.category,
      parsed.value.sets,
      parsed.value.reps,
      parsed.value.weight,
      parsed.value.durationMinutes,
      parsed.value.calories,
      parsed.value.notes,
      new Date().toISOString(),
      id,
      user.email,
    )
    .run();
  if (!result.meta.changes) {
    return Response.json({ error: "Workout not found." }, { status: 404 });
  }
  return Response.json({ message: "Workout updated." });
}

export async function DELETE(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Workout id is required.");
  await ensureSchema();
  const db = getDatabase();
  const owned = await db
    .prepare("SELECT id FROM workouts WHERE id = ? AND user_email = ?")
    .bind(id, user.email)
    .first();
  if (!owned) return Response.json({ error: "Workout not found." }, { status: 404 });
  await db.batch([
    db.prepare("DELETE FROM workouts WHERE id = ? AND user_email = ?").bind(id, user.email),
    db
      .prepare(
        "DELETE FROM xp_events WHERE user_email = ? AND source_type = 'workout' AND source_id = ?",
      )
      .bind(user.email, id),
  ]);
  return Response.json({ message: "Workout deleted and its workout XP removed." });
}
