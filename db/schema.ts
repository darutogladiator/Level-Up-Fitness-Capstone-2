import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// Assigned ownership area: Yandro — backend schema, authentication data, and persistence.
// These comments document the team's planned module ownership; they are not authorship claims.
export const profiles = sqliteTable("profiles", {
  email: text("email").primaryKey(),
  displayName: text("display_name").notNull(),
  goal: text("goal").notNull().default("Build strength and stay consistent"),
  experienceLevel: text("experience_level").notNull().default("Intermediate"),
  equipment: text("equipment").notNull().default("Full gym"),
  scheduleDays: integer("schedule_days").notNull().default(4),
  sessionMinutes: integer("session_minutes").notNull().default(45),
  calorieTarget: integer("calorie_target").notNull().default(2400),
  proteinTarget: integer("protein_target").notNull().default(150),
  accent: text("accent").notNull().default("cyan"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Assigned ownership area: Johnkerby — workout logging and progress history.
export const workouts = sqliteTable(
  "workouts",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    workoutDate: text("workout_date").notNull(),
    exercise: text("exercise").notNull(),
    category: text("category").notNull(),
    sets: integer("sets").notNull(),
    reps: integer("reps").notNull(),
    weight: real("weight").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    calories: integer("calories").notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("workouts_user_date_idx").on(table.userEmail, table.workoutDate),
  ],
);

// Assigned ownership area: Johnkerby — nutrition entries and calorie/macronutrient totals.
export const nutritionEntries = sqliteTable(
  "nutrition_entries",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    entryDate: text("entry_date").notNull(),
    meal: text("meal").notNull(),
    calories: integer("calories").notNull(),
    protein: integer("protein").notNull(),
    carbs: integer("carbs").notNull(),
    fat: integer("fat").notNull(),
    waterGlasses: integer("water_glasses").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("nutrition_user_date_idx").on(table.userEmail, table.entryDate),
  ],
);

// Assigned ownership area: Dario — quest completion and gamification state.
export const questCompletions = sqliteTable(
  "quest_completions",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    questId: text("quest_id").notNull(),
    completionDate: text("completion_date").notNull(),
    xp: integer("xp").notNull(),
    completedAt: text("completed_at").notNull(),
  },
  (table) => [
    uniqueIndex("quest_user_day_unique").on(
      table.userEmail,
      table.questId,
      table.completionDate,
    ),
  ],
);

// Assigned ownership area: Dario — immutable XP ledger for levels and ranks.
export const xpEvents = sqliteTable(
  "xp_events",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    xp: integer("xp").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("xp_source_unique").on(
      table.userEmail,
      table.sourceType,
      table.sourceId,
    ),
    index("xp_user_idx").on(table.userEmail),
  ],
);

// Assigned ownership area: Aryan — saved structured AI/recommendation results.
export const recommendations = sqliteTable(
  "recommendations",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    goal: text("goal").notNull(),
    requestJson: text("request_json").notNull(),
    planJson: text("plan_json").notNull(),
    engine: text("engine").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("recommendations_user_idx").on(table.userEmail, table.createdAt),
  ],
);
