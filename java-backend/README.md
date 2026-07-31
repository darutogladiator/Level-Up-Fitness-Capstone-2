# Java workout-tracking contribution

This folder preserves Johnkerby Joseph's standalone Java workout-tracking
module and its original Git commit history.

The production Level Up Fitness website runs from the Next.js application at
the repository root. The Java files are a reference implementation and are not
compiled into, or required by, the deployed Sites application. Keeping the
module isolated here prevents it from changing the website's dependency,
database, authentication, or deployment configuration.

To compile and run the standalone example with a JDK installed:

```bash
cd java-backend
javac -encoding UTF-8 Main.java Workout.java WorkoutTracker.java
java Main
```
