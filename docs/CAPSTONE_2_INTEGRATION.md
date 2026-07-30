# Capstone 2 Integration Record

## Purpose

This integration preserves the Capstone 1 static prototype and its Git history
while making the full-stack Capstone 2 application the primary runnable project.
The old prototype is retained for traceability, comparison, and showcase
questions about project evolution.

## Architecture transition

| Capstone 1 prototype | Capstone 2 application |
| --- | --- |
| Multiple static HTML pages | Responsive React views inside one Next.js application |
| Global browser scripts | Typed components, shared modules, and server API routes |
| `localStorage` user data | Per-user Cloudflare D1 records |
| Local quest/XP mutations | Server-validated quests and immutable XP ledger |
| Static progress display | Calculated workout, nutrition, streak, and calendar insights |
| Personalization scripts | Persistent profile and settings API |
| Planned AI feature | Structured OpenAI-compatible recommendations with fallback |
| Directly opened HTML file | Built, tested, and deployed production application |

## Preserved legacy work

- `website/` contains the repository's main static prototype.
- `deliverable/Code/levelupfitness-main/` preserves the detailed Capstone 1
  implementation, including Khang Tran's committed profile, personalization,
  settings, navigation, and styling work.
- `deliverable/` and the original `docs/` files remain intact.

## Full-stack integration

The new root project adds:

- `app/` for views and HTTP API routes
- `db/` and `drizzle/` for the database specification and migrations
- `lib/` for reusable domain calculations and server helpers
- `tests/` for automated build/output verification
- `worker/`, `vite.config.ts`, and `.openai/hosting.json` for Sites deployment

## Responsibility labels

Source comments beginning with `Assigned ownership area` map modules to the
team's Capstone 2 work plan:

- Dario: dashboard, gamification, XP, ranks, and final integration
- Yandro: identity, database, APIs, and persistence
- Johnkerby: workouts, nutrition, and progress
- Aryan: AI recommendation workflow
- Khang: profiles, personalization, responsive UX, and QA

These labels support project organization and presentation. They do not replace
Git authorship. Individual commits and pull requests must be used to demonstrate
who implemented, reviewed, and tested future changes.

## Release validation

The integrated application should not be merged into `main` until all of the
following pass:

```bash
npm run lint
npx tsc --noEmit
npm test
npm audit --omit=dev
```

The production demo should additionally verify that a signed-in user can load
showcase data, add a workout, observe XP/stat changes, refresh, and see the saved
data again.
