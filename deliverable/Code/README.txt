Level Up Fitness - Code Directory

This directory contains the deployable web site files, source files, and support documentation for the Level Up Fitness final deliverable.

Directory structure:

Code/
  README.txt
    This file. It explains how the Code directory is organized.

  WebSite/
    Contains the complete deployable Level Up Fitness web site.

    Level Up Fitness Proj.html
      Main entry page and dashboard.

    workouts.html
      Workout logging page.

    nutrition.html
      Nutrition logging page.

    progress.html
      Progress statistics, calendar, and leaderboard page.

    personalize.html
      User personalization page.

    settings.html
      Local progress reset/settings page.

    style.css
      Shared site styling, including the gamified system-window theme.

    script.js
      Shared client-side application logic, localStorage persistence, XP/level/rank calculations, quests, workouts, meals, stats, and calendar rendering.

    expScript.js
      Compatibility file. Experience behavior is handled by script.js so all pages share the same XP state.

  Installation Guide.docx
    Step-by-step installation guide for running the web site.

  User Manual.docx
    End-user manual for using the Level Up Fitness application.

  README.md
    Repository README from the project source repository.

Database:
  This version of Level Up Fitness is a static client-side web application. It does not require a server database. User progress is stored in the browser with localStorage, so no Database directory or SQL script is required for this version.

How to run:
  Open Code/WebSite/Level Up Fitness Proj.html in a browser, or serve the WebSite folder with a local static server.

  Example:
    cd Code/WebSite
    python -m http.server 5507

  Then open:
    http://localhost:5507/Level%20Up%20Fitness%20Proj.html
