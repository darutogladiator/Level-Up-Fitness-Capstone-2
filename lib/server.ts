import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import type { UserIdentity } from "./types";

let schemaReady = false;

export function getDatabase() {
  if (!env.DB) throw new Error("The Level Up Fitness database is unavailable.");
  return env.DB;
}

// Assigned ownership area: Yandro — server-side identity and database initialization.
export async function getRequestUser(): Promise<UserIdentity | null> {
  const user = await getChatGPTUser();
  if (user) return { displayName: user.displayName, email: user.email };
  if (process.env.NODE_ENV === "development") {
    return { displayName: "Demo Hunter", email: "demo@levelup.local" };
  }
  return null;
}

export async function ensureSchema() {
  if (schemaReady) return;
  const db = getDatabase();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      goal TEXT NOT NULL DEFAULT 'Build strength and stay consistent',
      experience_level TEXT NOT NULL DEFAULT 'Intermediate',
      equipment TEXT NOT NULL DEFAULT 'Full gym',
      schedule_days INTEGER NOT NULL DEFAULT 4,
      session_minutes INTEGER NOT NULL DEFAULT 45,
      calorie_target INTEGER NOT NULL DEFAULT 2400,
      protein_target INTEGER NOT NULL DEFAULT 150,
      accent TEXT NOT NULL DEFAULT 'cyan',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      workout_date TEXT NOT NULL,
      exercise TEXT NOT NULL,
      category TEXT NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      calories INTEGER NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS nutrition_entries (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      meal TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein INTEGER NOT NULL,
      carbs INTEGER NOT NULL,
      fat INTEGER NOT NULL,
      water_glasses INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS quest_completions (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      quest_id TEXT NOT NULL,
      completion_date TEXT NOT NULL,
      xp INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      UNIQUE(user_email, quest_id, completion_date)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS xp_events (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      xp INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_email, source_type, source_id)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      goal TEXT NOT NULL,
      request_json TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      engine TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS workouts_user_date_idx ON workouts(user_email, workout_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS nutrition_user_date_idx ON nutrition_entries(user_email, entry_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS xp_user_idx ON xp_events(user_email)"),
    db.prepare("CREATE INDEX IF NOT EXISTS recommendations_user_idx ON recommendations(user_email, created_at)"),
  ]);
  schemaReady = true;
}

export function unauthorized() {
  return Response.json(
    { error: "Sign in with ChatGPT to access your fitness journey." },
    { status: 401 },
  );
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function numberInRange(
  value: unknown,
  min: number,
  max: number,
  fallback?: number,
) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}
