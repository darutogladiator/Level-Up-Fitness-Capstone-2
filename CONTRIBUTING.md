# Contributing

## Branch workflow

Do not commit directly to `main`.

1. Pull the newest `main`.
2. Create a focused feature branch.
3. Commit only the files related to that feature.
4. Push the branch.
5. Open a pull request and request at least one teammate review.
6. Resolve checks and review comments before merging.

Suggested branches:

```text
feature/auth
feature/workout-log
feature/ai-recommendations
feature/dashboard-xp
feature/progress-stats
feature/profile-settings
fix/short-description
```

## Before opening a pull request

Run:

```bash
npm install
npm run lint
npx tsc --noEmit
npm test
npm audit --omit=dev
```

Never commit:

- `.env` or `.env.local`
- API keys, access tokens, or passwords
- `node_modules/`, `dist/`, `.next/`, or `.vinext/`
- unrelated generated files

## Pull-request description

Include:

- What changed
- Which requirement or responsibility area it addresses
- How it was tested
- Screenshots for interface changes
- Any database migration or environment-variable impact

Responsibility labels in source comments describe the team plan. Commit and
pull-request history records who actually implemented and reviewed a change.
