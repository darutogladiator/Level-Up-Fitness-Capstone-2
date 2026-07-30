import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines the signed-out Level Up Fitness experience", async () => {
  const [page, client, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/FitnessApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Level Up Fitness/);
  assert.match(client, /Consistency becomes progression/i);
  assert.match(client, /Sign in with ChatGPT/i);
  assert.match(page, /getChatGPTUser/);
  assert.doesNotMatch(`${page}\n${client}\n${layout}`, /Your site is taking shape|codex-preview/i);
});

test("contains the complete product routes and team ownership labels", async () => {
  const [client, schema, hosting, recommendation, fitness, workout, profile] =
    await Promise.all([
      readFile(new URL("../app/FitnessApp.tsx", import.meta.url), "utf8"),
      readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
      readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
      readFile(
        new URL("../app/api/recommendations/route.ts", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../lib/fitness.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/api/workouts/route.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    ]);

  assert.match(hosting, /"d1":\s*"DB"/);
  assert.match(client, /Assigned ownership area: Dario/);
  assert.match(client, /Assigned ownership area: Johnkerby/);
  assert.match(client, /Assigned ownership area: Aryan/);
  assert.match(client, /Assigned ownership area: Khang/);
  assert.match(schema, /Assigned ownership area: Yandro/);
  assert.match(workout, /export async function POST/);
  assert.match(workout, /export async function PATCH/);
  assert.match(workout, /export async function DELETE/);
  assert.match(profile, /export async function PATCH/);
  assert.match(recommendation, /api\.openai\.com\/v1\/responses/);
  assert.match(fitness, /adaptive-fallback/);
});
