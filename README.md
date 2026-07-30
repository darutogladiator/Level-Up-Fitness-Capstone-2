# Level Up Fitness — Capstone 2

Level Up Fitness is a full-stack, AI-ready fitness tracker that turns consistency
into RPG-style progression. Users can sign in, log workouts and nutrition,
complete daily quests, earn XP, level up, track progress, and generate structured
workout plans from a responsive futuristic dashboard.

The repository preserves the original Capstone 1 static prototype and its Git
history while introducing the Capstone 2 application at the repository root.

## Live application

Production site:

<https://level-up-fitness-capstone.daruto.chatgpt.site>

## Capstone 2 features

- User-specific accounts through Sign in with ChatGPT on Sites
- Persistent Cloudflare D1 data storage
- Workout create, edit, delete, history, calories, volume, and streak tracking
- Nutrition logging with calorie, protein, carbohydrate, and fat totals
- Daily quests connected to an immutable XP ledger
- Levels, ranks, progress bars, and achievement-oriented feedback
- Calendar activity and calculated progress insights
- Goal-, equipment-, schedule-, and experience-aware workout recommendations
- OpenAI Responses API support with a deterministic fallback when no API key is set
- Profile, personalization, goals, units, theme, and responsive navigation
- Repeatable showcase-data loader for demonstrations

## Repository structure

```text
app/                    Next.js pages, interface, and API routes
db/                     Drizzle/D1 database schema
drizzle/                Versioned database migrations
lib/                    Shared server, dashboard, fitness, and type logic
public/                 Icons, manifest, service worker, and social preview
tests/                  Build and rendered-output verification
worker/                 Sites/Cloudflare runtime entrypoint
website/                Preserved Capstone 1 static prototype
deliverable/            Preserved Capstone 1 submission package
docs/                   Project records and integration documentation
.openai/hosting.json     Sites project and D1 binding configuration
```

The files under `website/` and `deliverable/Code/levelupfitness-main/` remain
available as historical reference. The production application is the Next.js
project at the repository root.

## Local development

Requirements:

- Node.js 22.13 or newer
- npm

```bash
npm install
npm run dev
```

Then open the local address shown in the terminal.

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm test
npm audit --omit=dev
```

Generate a migration after changing `db/schema.ts`:

```bash
npm run db:generate
```

## Environment variables

Copy `.env.example` to `.env.local` for local development.

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
```

`OPENAI_API_KEY` is optional. Without it, the AI Coach uses the built-in
adaptive fallback so the feature remains demonstrable. Never commit real API
keys or paste them into issues, pull requests, or chat messages.

Production variables belong in the Sites environment-variable settings.

## Demonstration path

1. Sign in.
2. Select **Load showcase journey** once.
3. Open **Workouts** and save a new workout.
4. Return to **Command** to show updated XP, level, quests, and statistics.
5. Refresh the browser to demonstrate persistent data.
6. Generate a workout in **AI Coach**.
7. Show **Nutrition**, **Insights**, and **Profile**.

## Team workflow

Create work from the latest `main` branch and never commit directly to `main`.

```bash
git switch main
git pull
git switch -c feature/short-description
```

Push the branch and open a pull request. See `CONTRIBUTING.md` and `TEAM.md` for
the integration workflow and assigned Capstone 2 responsibility areas.

## Migration record

`docs/CAPSTONE_2_INTEGRATION.md` explains how the static prototype maps to the
full-stack system. Code comments marked **Assigned ownership area** document the
team plan; Git commits and pull requests remain the source of truth for actual
authorship.
