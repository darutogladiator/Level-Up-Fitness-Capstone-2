import { QUEST_TEMPLATES, isDateKey } from "@/lib/fitness";
import {
  badRequest,
  ensureSchema,
  getDatabase,
  getRequestUser,
  numberInRange,
  unauthorized,
} from "@/lib/server";

// Assigned ownership area: Johnkerby — nutrition logging, totals, and protein quest automation.
export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const body = (await request.json()) as Record<string, unknown>;
  const meal = typeof body.meal === "string" ? body.meal.trim() : "";
  if (meal.length < 2 || meal.length > 80) {
    return badRequest("Meal name must be between 2 and 80 characters.");
  }
  if (!isDateKey(body.entryDate)) return badRequest("Select a valid nutrition date.");
  const entry = {
    calories: Math.round(numberInRange(body.calories, 0, 10000, 0)!),
    protein: Math.round(numberInRange(body.protein, 0, 1000, 0)!),
    carbs: Math.round(numberInRange(body.carbs, 0, 2000, 0)!),
    fat: Math.round(numberInRange(body.fat, 0, 1000, 0)!),
    waterGlasses: Math.round(numberInRange(body.waterGlasses, 0, 30, 0)!),
  };
  await ensureSchema();
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        `INSERT INTO nutrition_entries
         (id, user_email, entry_date, meal, calories, protein, carbs, fat, water_glasses, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        user.email,
        body.entryDate,
        meal,
        entry.calories,
        entry.protein,
        entry.carbs,
        entry.fat,
        entry.waterGlasses,
        now,
      ),
    db
      .prepare(
        "INSERT OR IGNORE INTO xp_events (id, user_email, source_type, source_id, xp, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(crypto.randomUUID(), user.email, "nutrition", id, 40, now),
  ]);

  const [proteinRow, profileRow] = await Promise.all([
    db
      .prepare(
        "SELECT COALESCE(SUM(protein), 0) AS total FROM nutrition_entries WHERE user_email = ? AND entry_date = ?",
      )
      .bind(user.email, body.entryDate)
      .first<{ total: number }>(),
    db
      .prepare("SELECT protein_target FROM profiles WHERE email = ?")
      .bind(user.email)
      .first<{ protein_target: number }>(),
  ]);
  if ((proteinRow?.total ?? 0) >= (profileRow?.protein_target ?? 150)) {
    const quest = QUEST_TEMPLATES.find((item) => item.id === "protein")!;
    const sourceId = `${body.entryDate}:${quest.id}`;
    await db.batch([
      db
        .prepare(
          "INSERT OR IGNORE INTO quest_completions (id, user_email, quest_id, completion_date, xp, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(crypto.randomUUID(), user.email, quest.id, body.entryDate, quest.xp, now),
      db
        .prepare(
          "INSERT OR IGNORE INTO xp_events (id, user_email, source_type, source_id, xp, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(crypto.randomUUID(), user.email, "quest", sourceId, quest.xp, now),
    ]);
  }
  return Response.json({ id, message: "Nutrition entry saved." }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Nutrition entry id is required.");
  await ensureSchema();
  const db = getDatabase();
  const owned = await db
    .prepare("SELECT id FROM nutrition_entries WHERE id = ? AND user_email = ?")
    .bind(id, user.email)
    .first();
  if (!owned) return Response.json({ error: "Nutrition entry not found." }, { status: 404 });
  await db.batch([
    db
      .prepare("DELETE FROM nutrition_entries WHERE id = ? AND user_email = ?")
      .bind(id, user.email),
    db
      .prepare(
        "DELETE FROM xp_events WHERE user_email = ? AND source_type = 'nutrition' AND source_id = ?",
      )
      .bind(user.email, id),
  ]);
  return Response.json({ message: "Nutrition entry deleted." });
}
