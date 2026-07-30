import {
  badRequest,
  ensureSchema,
  getDatabase,
  getRequestUser,
  numberInRange,
  unauthorized,
} from "@/lib/server";

const levels = new Set(["Beginner", "Intermediate", "Advanced"]);
const accents = new Set(["cyan", "violet", "green", "amber"]);

// Assigned ownership area: Khang — user profile, personalization, settings, and preferences.
export async function PATCH(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const body = (await request.json()) as Record<string, unknown>;
  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim().slice(0, 60) : "";
  const goal = typeof body.goal === "string" ? body.goal.trim().slice(0, 160) : "";
  const equipment =
    typeof body.equipment === "string" ? body.equipment.trim().slice(0, 100) : "";
  const experienceLevel =
    typeof body.experienceLevel === "string" ? body.experienceLevel : "";
  const accent = typeof body.accent === "string" ? body.accent : "cyan";
  if (!displayName || !goal || !equipment) {
    return badRequest("Name, goal, and equipment are required.");
  }
  if (!levels.has(experienceLevel)) return badRequest("Select a valid experience level.");
  if (!accents.has(accent)) return badRequest("Select a valid accent color.");
  await ensureSchema();
  const result = await getDatabase()
    .prepare(
      `UPDATE profiles SET display_name = ?, goal = ?, experience_level = ?,
       equipment = ?, schedule_days = ?, session_minutes = ?, calorie_target = ?,
       protein_target = ?, accent = ?, updated_at = ? WHERE email = ?`,
    )
    .bind(
      displayName,
      goal,
      experienceLevel,
      equipment,
      Math.round(numberInRange(body.scheduleDays, 2, 7, 4)!),
      Math.round(numberInRange(body.sessionMinutes, 20, 180, 45)!),
      Math.round(numberInRange(body.calorieTarget, 1000, 6000, 2400)!),
      Math.round(numberInRange(body.proteinTarget, 40, 400, 150)!),
      accent,
      new Date().toISOString(),
      user.email,
    )
    .run();
  if (!result.meta.changes) return Response.json({ error: "Profile not found." }, { status: 404 });
  return Response.json({ message: "Profile updated." });
}
