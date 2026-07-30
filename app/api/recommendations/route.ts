import { env } from "cloudflare:workers";
import { buildFallbackRecommendation } from "@/lib/fitness";
import {
  badRequest,
  ensureSchema,
  getDatabase,
  getRequestUser,
  numberInRange,
  unauthorized,
} from "@/lib/server";
import type { RecommendationPlan } from "@/lib/types";

type RecommendationInput = {
  goal: string;
  experienceLevel: string;
  equipment: string;
  scheduleDays: number;
  sessionMinutes: number;
  limitations: string;
};

const planSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "safetyNote", "rationale", "days"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    safetyNote: { type: "string" },
    rationale: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
    days: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "focus", "durationMinutes", "exercises"],
        properties: {
          day: { type: "string" },
          focus: { type: "string" },
          durationMinutes: { type: "integer" },
          exercises: {
            type: "array",
            minItems: 2,
            maxItems: 6,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["name", "sets", "reps", "note"],
              properties: {
                name: { type: "string" },
                sets: { type: "integer" },
                reps: { type: "string" },
                note: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

function extractResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";
  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];
      return content
        .filter(
          (part): part is { type: "output_text"; text: string } =>
            !!part &&
            typeof part === "object" &&
            (part as { type?: unknown }).type === "output_text" &&
            typeof (part as { text?: unknown }).text === "string",
        )
        .map((part) => part.text);
    })
    .join("");
}

async function generateWithOpenAI(
  input: RecommendationInput,
): Promise<RecommendationPlan | null> {
  const runtime = env as unknown as {
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
  };
  if (!runtime.OPENAI_API_KEY) return null;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtime.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: runtime.OPENAI_MODEL || "gpt-5.6-luna",
      reasoning: { effort: "low" },
      store: false,
      instructions:
        "You are a cautious fitness planning assistant. Produce general educational fitness guidance, not medical advice. Respect stated equipment, time, experience, and limitations. Never diagnose injuries. If limitations mention pain, recommend a conservative alternative and qualified professional guidance. Return only the requested structured plan.",
      input: JSON.stringify(input),
      text: {
        format: {
          type: "json_schema",
          name: "level_up_fitness_plan",
          strict: true,
          schema: planSchema,
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI request failed with ${response.status}`);
  const text = extractResponseText(await response.json());
  if (!text) throw new Error("OpenAI returned no structured text.");
  const parsed = JSON.parse(text) as Omit<RecommendationPlan, "engine" | "createdAt">;
  return {
    ...parsed,
    engine: "openai",
    createdAt: new Date().toISOString(),
  };
}

// Assigned ownership area: Aryan — AI request validation, structured output, and fallback.
export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const body = (await request.json()) as Record<string, unknown>;
  const input: RecommendationInput = {
    goal: typeof body.goal === "string" ? body.goal.trim().slice(0, 180) : "",
    experienceLevel:
      typeof body.experienceLevel === "string"
        ? body.experienceLevel.trim().slice(0, 40)
        : "",
    equipment:
      typeof body.equipment === "string" ? body.equipment.trim().slice(0, 120) : "",
    scheduleDays: Math.round(numberInRange(body.scheduleDays, 2, 6, 4)!),
    sessionMinutes: Math.round(numberInRange(body.sessionMinutes, 20, 180, 45)!),
    limitations:
      typeof body.limitations === "string" ? body.limitations.trim().slice(0, 240) : "",
  };
  if (!input.goal || !input.experienceLevel || !input.equipment) {
    return badRequest("Goal, experience level, and equipment are required.");
  }

  let plan: RecommendationPlan;
  try {
    plan =
      (await generateWithOpenAI(input)) ?? buildFallbackRecommendation(input);
  } catch (error) {
    console.error("openai_recommendation_fallback", error);
    plan = buildFallbackRecommendation(input);
  }

  await ensureSchema();
  const id = crypto.randomUUID();
  await getDatabase()
    .prepare(
      `INSERT INTO recommendations
       (id, user_email, goal, request_json, plan_json, engine, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      user.email,
      input.goal,
      JSON.stringify(input),
      JSON.stringify(plan),
      plan.engine,
      plan.createdAt,
    )
    .run();
  return Response.json(plan, { status: 201 });
}
