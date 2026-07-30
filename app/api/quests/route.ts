import { QUEST_TEMPLATES, isDateKey } from "@/lib/fitness";
import {
  badRequest,
  ensureSchema,
  getDatabase,
  getRequestUser,
  unauthorized,
} from "@/lib/server";

// Assigned ownership area: Dario — quest completion rules and XP ledger integration.
export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const body = (await request.json()) as Record<string, unknown>;
  const quest = QUEST_TEMPLATES.find((item) => item.id === body.questId);
  if (!quest) return badRequest("Unknown quest.");
  if (!isDateKey(body.date)) return badRequest("A valid quest date is required.");
  const complete = body.complete === true;
  await ensureSchema();
  const db = getDatabase();
  const sourceId = `${body.date}:${quest.id}`;
  const now = new Date().toISOString();
  if (complete) {
    await db.batch([
      db
        .prepare(
          "INSERT OR IGNORE INTO quest_completions (id, user_email, quest_id, completion_date, xp, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(crypto.randomUUID(), user.email, quest.id, body.date, quest.xp, now),
      db
        .prepare(
          "INSERT OR IGNORE INTO xp_events (id, user_email, source_type, source_id, xp, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(crypto.randomUUID(), user.email, "quest", sourceId, quest.xp, now),
    ]);
  } else {
    await db.batch([
      db
        .prepare(
          "DELETE FROM quest_completions WHERE user_email = ? AND quest_id = ? AND completion_date = ?",
        )
        .bind(user.email, quest.id, body.date),
      db
        .prepare(
          "DELETE FROM xp_events WHERE user_email = ? AND source_type = 'quest' AND source_id = ?",
        )
        .bind(user.email, sourceId),
    ]);
  }
  return Response.json({ message: complete ? "Quest completed." : "Quest reopened." });
}
