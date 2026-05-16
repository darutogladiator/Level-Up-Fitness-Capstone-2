# Level Up Fitness

Level Up Fitness is a full-stack web development project for an AI-powered, gamified fitness tracker. The project began during Capstone 1 as a web-based fitness experience inspired by futuristic RPG progression systems, where users complete daily quests, earn XP, level up, and track workout progress through a game-like interface.

The current version includes a deployable static website foundation with workout logging, nutrition logging, daily quest checkboxes, XP and rank progression, progress statistics, a calendar, leaderboard, personalization, settings, project documentation, posters, presentation materials, and final deliverable files. The next development phase will expand this into a live full-stack application with user accounts, backend storage, AI-generated workout recommendations, stronger progress analytics, and deployment for public use by the end of the summer semester.

## Repository Structure

```text
assets/
  Project branding assets, including the generated Level Up Fitness logo.

website/
  Main deployable website files.
  Open "Level Up Fitness Proj.html" to run the current frontend.

docs/
  Project documentation, installation guide, user manual, shortcomings/future improvements, and meeting minutes archive.

deliverable/
  Final deliverable package contents and final zip from the Capstone 1 submission structure.

posters/
  Poster files for team member/project presentation materials.

presentation-slides/
  Final presentation slide materials.

videos/
  Video index page for YouTube presentation/demo links.
```

## How To Run

Open the main HTML file directly:

```text
website/Level Up Fitness Proj.html
```

Or run a local static server:

```bash
cd website
python -m http.server 5507
```

Then open:

```text
http://localhost:5507/Level%20Up%20Fitness%20Proj.html
```

## Current Features

- Gamified dashboard with XP, level, rank, streak, workouts, and calories.
- Daily quest checklist inspired by RPG-style progression.
- Workout logging with XP rewards based on duration and intensity.
- Nutrition logging for meals, protein, and calories.
- Progress statistics, activity calendar, and leaderboard.
- Personalization settings for display name, goal, and accent color.
- Local browser storage using `localStorage`.
- Futuristic blue system-window UI theme.

## Planned Direction

- Convert the project into a full-stack live web application.
- Add persistent user authentication and account management.
- Store workouts, nutrition, XP, and progress in a backend database.
- Add AI-powered workout and fitness recommendations.
- Improve analytics, charts, and calendar history.
- Polish UI/UX and publish the application live by the end of the summer semester.

## Team

See `TEAM.md` for the new and original project team member lists.
